from .exchange import Exchange
import websockets
import json
from sortedcontainers import SortedDict
from datetime import datetime, timezone
from .orderbook import Orderbook
from .trade import Trade
import pytz
from copy import deepcopy
from dataobject import DecodedMsg
from typing import override

class Gemini(Exchange):
    name = "Gemini"
    ws_url = "wss://api.gemini.com/v2/marketdata"

    to_exchange_ccy_pairs = {
        "BTCUSD":"BTCUSD",
        "BTCUSDT":"BTCUSDT",
        "ETHUSD":"ETHUSD",
        "ETHUSDT":"ETHUSDT",
        "LTCUSD":"LTCUSD"
    }
    from_exchange_ccy_pairs = {
        "BTCUSD":"BTCUSD",
        "BTCUSDT":"BTCUSDT",
        "ETHUSD":"ETHUSD",
        "ETHUSDT":"ETHUSDT",
        "LTCUSD":"LTCUSD"
    }
    
    subscription_request = {
        "full": {
            'type': 'subscribe',
            'subscriptions': [
                {
                    'name': 'l2',
                    'symbols': [],
                },
            ],
        }
    } 

    def __init__(self):
        self.orderbook = Orderbook()
        self.subscription_request = deepcopy(Gemini.subscription_request)

    @override
    def connect_ws(channel, ccy_pair):
        return websockets.connect(Gemini.ws_url, ping_interval=None, max_size=300000000) 

    @override
    # the subscribe is in the ws url connection, no need to send any request
    async def subscribe_request(self, websocket: websockets, channel, ccy_pair):
        if channel not in self.subscription_request:
            raise Exception(f"Channel {channel} is not implemented in {self.name} exchange")

        if ccy_pair not in Gemini.to_exchange_ccy_pairs: 
            raise Exception(f"Ccy_pair {ccy_pair} is not implemented in {self.name} exchange")
        
        request = self.subscription_request[channel]
        if channel=="full":
            request["subscriptions"][0]["symbols"].append(Gemini.to_exchange_ccy_pairs[ccy_pair])
        print(request)
        await websocket.send(json.dumps(request))

    @override
    def decode(self, msg: str, ccy_pair: str)-> dict:
        msg_obj = json.loads(msg)
        if "changes" in msg_obj:
            return self.decode_orderbook_message(msg_obj, ccy_pair)
        elif "type" in msg_obj and msg_obj["type"]=="trade":
            return self.decode_trades_message(msg_obj, ccy_pair)
        else:
            decoded_msg = DecodedMsg("error", {"err_msg": "no suitable method to decode the msg"})
            return decoded_msg.to_dict()

    def get_first_orderbook_snapshot(self, events:list, ccy_pair: str)-> dict:
        self.orderbook.ccy_pair = ccy_pair
        self.orderbook.timestamp = datetime.now(timezone.utc)
        for event in events:
            if event[0]=="sell":
                self.orderbook.asks.add(float(event[1]))
                self.orderbook.ask_to_qty[float(event[1])] = float(event[2])
            elif event[0]=="buy":
                self.orderbook.bids.add(float(event[1]))
                self.orderbook.bid_to_qty[float(event[1])] = float(event[2])

        orderbook = deepcopy(self.orderbook)

        decoded_msg = DecodedMsg("book", {"data": orderbook})
        return decoded_msg.to_dict()  
        

    def update_orderbook(self, events: list, ccy_pair: str)-> dict:
        self.orderbook.ccy_pair = ccy_pair
        self.orderbook.timestamp = datetime.now(timezone.utc)
        event = events[0] 
        
        side, price, quantity = event[0], float(event[1]), float(event[2])
        if side=="buy":
            if quantity==0:
                self.orderbook.bids.discard(price)
                self.orderbook.bid_to_qty.pop(price)
            else:
                if price not in self.orderbook.bids:
                    self.orderbook.bids.add(price)
                self.orderbook.bid_to_qty[price] = quantity

        elif side=="ask":
            if quantity==0:
                self.orderbook.asks.discard(price)
                self.orderbook.ask_to_qty.pop(price)
            else:
                if price not in self.orderbook.asks:
                    self.orderbook.asks.add(price)
                self.orderbook.ask_to_qty[price] = quantity

        orderbook = deepcopy(self.orderbook)

        decoded_msg = DecodedMsg("book", {"data": orderbook})
        return decoded_msg.to_dict()
    
    @override
    def decode_trades_message(self, snapshot: dict, ccy_pair: str)-> dict:
        self.orderbook.ccy_pair = ccy_pair
        print(snapshot["timestamp"])
        timestamp = datetime.fromtimestamp(snapshot["timestamp"]/1000, tz=pytz.utc)
        trade = Trade(timestamp, \
                        ccy_pair, \
                        float(snapshot["price"]), \
                        float(snapshot["quantity"]), \
                        snapshot["side"], \
                        "market")
        
        decoded_msg = DecodedMsg("trade", {"data": [trade]})
        return decoded_msg.to_dict()

    @override
    def decode_orderbook_message(self, msg_obj, ccy_pair):
        if "changes" and "trades" in msg_obj:
            return self.get_first_orderbook_snapshot(msg_obj["changes"], ccy_pair)
        elif "changes" in msg_obj:
            return self.update_orderbook(msg_obj["changes"], ccy_pair)
        
    @override
    def get_checksum(self, orderbook):
        return super().get_checksum(orderbook)
  