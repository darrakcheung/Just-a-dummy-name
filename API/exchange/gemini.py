from .exchange import Exchange
import websockets
import json
from datetime import datetime, timezone
from .orderbook import Orderbook
from .trade import Trade
import pytz
from copy import deepcopy
from dataobject import DecodedMsg
from typing import override

class Gemini(Exchange):
    name = "Gemini"
    ws_url = "wss://api.gemini.com/v1/marketdata/"

    to_exchange_ccy_pairs = {
        "BTCUSD":"BTCUSD",
        "BTCUSDT":"BTCUSDT",
        "LTCUSD":"LTCUSD"
    }
    from_exchange_ccy_pairs = {
        "BTCUSD":"BTCUSD",
        "BTCUSDT":"BTCUSDT",
        "LTCUSD":"LTCUSD"
    }

    def __init__(self):
        self.orderbook = Orderbook()
        self.subscription_request = None

    @override
    # the subscribe is in the ws url connection, no need to send any request
    async def subscribe_request(self, websocket: websockets, channel, ccy_pair):
        return

    @override
    def decode(self, msg: str, ccy_pair: str)-> dict:
        msg_obj = json.loads(msg)
        if "events" not in msg_obj:
            decoded_msg = DecodedMsg("error", {"err_msg": "no suitable method to decode the msg"})
            return decoded_msg.to_dict()  
        # check the type of the first_event to determine what function to call
        first_event = msg_obj["events"][0]
        if "type" in first_event and first_event["type"]=="change":
            return self.decode_orderbook_message(msg_obj, ccy_pair)
        elif "type" in first_event and first_event["type"]=="trade":
            return self.decode_trades_message(msg_obj, ccy_pair)
        else:
            decoded_msg = DecodedMsg("error", {"err_msg": "no suitable method to decode the msg"})
            return decoded_msg.to_dict()   

    def get_first_orderbook_snapshot(self, events:list, ccy_pair: str)-> dict:
        self.orderbook.ccy_pair = ccy_pair
        self.orderbook.timestamp = datetime.now(timezone.utc)
        for event in events:
            if event["side"]=="ask":
                self.orderbook.asks.add(float(event["price"]))
                self.orderbook.ask_to_qty[float(event["price"])] = float(event["remaining"])
            elif event["side"]=="bid":
                self.orderbook.bids.add(float(event["price"]))
                self.orderbook.bid_to_qty[float(event["price"])] = float(event["remaining"])

        orderbook = deepcopy(self.orderbook)
        print(orderbook.bids[:20])
        print(orderbook.asks[:20])

        decoded_msg = DecodedMsg("book", {"data": orderbook})
        return decoded_msg.to_dict()  

    def update_orderbook(self, snapshot: dict, ccy_pair: str)-> dict:
        self.orderbook.ccy_pair = ccy_pair
        self.orderbook.timestamp = datetime.fromtimestamp(snapshot["timestampms"] / 1000.0, tz=pytz.utc)
        event = snapshot["events"][0] 
        
        price, quantity = float(event["price"]), float(event["remaining"])
        if event["side"]=="bid":
            if quantity==0:
                self.orderbook.bids.discard(price)
                self.orderbook.bid_to_qty.pop(price)
            else:
                if price not in self.orderbook.bids:
                    self.orderbook.bids.add(price)
                self.orderbook.bid_to_qty[price] = quantity

        elif event["side"]=="ask":
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
    def decode_orderbook_message(self, msg_obj, ccy_pair):
        first_event = msg_obj["events"][0]
        if "reason" in first_event and first_event["reason"]=="initial":
            return self.get_first_orderbook_snapshot(msg_obj["events"], ccy_pair)
        elif first_event["type"]=="change":
            return self.update_orderbook(msg_obj, ccy_pair)

    @override
    def decode_trades_message(self, snapshot: dict, ccy_pair: str)-> dict:
        self.orderbook.ccy_pair = ccy_pair
        timestamp = datetime.fromtimestamp(snapshot["timestampms"] / 1000.0, tz=pytz.utc)
        event = snapshot["events"][0] 
        trade = Trade(timestamp, \
                        ccy_pair, \
                        float(event["price"]), \
                        float(event["amount"]), \
                        event["makerSide"].lower(), \
                        "market")
        decoded_msg = DecodedMsg("trade", {"data": [trade]})
        return decoded_msg.to_dict()  
        

    @override  
    def get_checksum(self, orderbook):
        return super().get_checksum(orderbook)
  