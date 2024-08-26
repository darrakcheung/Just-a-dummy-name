from .exchange import Exchange
import websockets
import json
from sortedcontainers import SortedDict
from datetime import datetime
from .orderbook import Orderbook
from .trade import Trade
import pytz
from copy import deepcopy
from dataobject import DecodedMsg
from typing import override

class Bybit(Exchange):
    name = "Bybit"
    ws_url = "wss://stream.bybit.com/v5/public/spot"

    to_exchange_ccy_pairs = {
        "BTCUSD": "BTCUSDT",
        "ETHUSD": "ETHUSDT",
        "LTCUSD": "LTCUSDT",
        "SOLUSD": "SOLUSDT",
        "BCHUSD": "BCHUSDT",
    }
    from_exchange_ccy_pairs = {
        "BTCUSDT": "BTCUSD",
        "ETHUSDT": "ETHUSD",
        "LTCUSDT": "LTCUSD",
        "SOLUSDT": "SOLUSD",
        "BCHUSDT": "BCHUSD",
    }

    def __init__(self):
        self.orderbook = Orderbook()
        self.subscription_request = {
            "orderbook": {
                "req_id": "test", 
                "op": "subscribe",
                "args": [
                    # "orderbook.50.BTCUSD"
                ]
            },
            "trades": {
                "req_id": "test", 
                "op": "subscribe",
                "args": [
                    # "publicTrade.BTCUSD"
                ]
            },
        }

    @override
    async def subscribe_request(self, websocket: websockets, channel, ccy_pair):

        if channel not in self.subscription_request:
            raise Exception(f"Channel {channel} is not implemented in {self.name} exchange")

        if ccy_pair not in Bybit.to_exchange_ccy_pairs: 
            raise Exception(f"Ccy_pair {ccy_pair} is not implemented in {self.name} exchange")
        
        request = self.subscription_request[channel]
        if channel=="orderbook":
            request["args"].append(f"orderbook.50.{Bybit.to_exchange_ccy_pairs[ccy_pair]}")
        elif channel=="trades":
            request["args"].append(f"publicTrade.{Bybit.to_exchange_ccy_pairs[ccy_pair]}")
        await websocket.send(json.dumps(request))

    def decode(self, msg: str, ccy_pair: str)-> dict:
        msg_obj = json.loads(msg)
        if "ret_msg" in msg_obj:
            return {
                    "msg_type": "subscribe",
                    "msg": msg_obj["ret_msg"]
                }
        elif "topic" in msg_obj:
            channel = msg_obj["topic"].split(".")[0]
            if channel=="orderbook":
                return self.decode_orderbook_message(msg_obj, ccy_pair)
            elif channel=="publicTrade":
                return self.decode_trades_message(msg_obj, ccy_pair)
            else:
                decoded_msg = DecodedMsg("error", {"err_msg": "no suitable method to decode the msg"})
                return decoded_msg.to_dict()  

        decoded_msg = DecodedMsg("error", {"err_msg": "no suitable method to decode the msg"})
        return decoded_msg.to_dict()      
    
    def get_first_orderbook_snapshot(self, msg_obj:dict, ccy_pair: str)-> dict:
        self.orderbook.ccy_pair = ccy_pair
        self.orderbook.timestamp = datetime.fromtimestamp(msg_obj["ts"]/1000, tz=pytz.utc)
        data = msg_obj["data"]
        for level in data["b"]:
            bid, bid_size = float(level[0]), float(level[1])
            self.orderbook.bids.add(bid)
            self.orderbook.bid_to_qty[bid] = bid_size
        for level in data["a"]:
            ask, ask_size = float(level[0]), float(level[1])
            self.orderbook.asks.add(ask)
            self.orderbook.ask_to_qty[ask] = ask_size
        orderbook = deepcopy(self.orderbook)

        decoded_msg = DecodedMsg("book", {"data": orderbook})
        return decoded_msg.to_dict()  
    
    def update_orderbook(self, msg_obj: dict, ccy_pair: str)-> dict:
        self.orderbook.ccy_pair = ccy_pair
        self.orderbook.timestamp = datetime.fromtimestamp(msg_obj["ts"]/1000, tz=pytz.utc)
        data = msg_obj["data"]

        for level in data["b"]:
            bid, bid_size = float(level[0]), float(level[1])
            if bid_size==0:
                self.orderbook.bids.discard(bid)
                self.orderbook.bid_to_qty.pop(bid)
            else:
                if bid not in self.orderbook.bids:
                    self.orderbook.bids.add(bid)
                self.orderbook.bid_to_qty[bid] = bid_size
        for level in data["a"]:
            ask, ask_size = float(level[0]), float(level[1])
            if ask_size==0:
                self.orderbook.asks.discard(ask)
                self.orderbook.ask_to_qty.pop(ask)
            else:
                if ask not in self.orderbook.asks:
                    self.orderbook.asks.add(ask)
                self.orderbook.ask_to_qty[ask] = ask_size

        orderbook = deepcopy(self.orderbook)

        decoded_msg = DecodedMsg("book", {"data": orderbook})
        return decoded_msg.to_dict()  
    
    @override
    def decode_orderbook_message(self, msg_obj: dict, ccy_pair: str):
        if msg_obj["type"]=="snapshot":
            return self.get_first_orderbook_snapshot(msg_obj, ccy_pair)
        elif msg_obj["type"]=="delta":
            return self.update_orderbook(msg_obj, ccy_pair)

    @override
    def decode_trades_message(self, snapshot: dict, ccy_pair: str):
        self.orderbook.ccy_pair = ccy_pair
        # timestamp = datetime.fromtimestamp(snapshot["ts"] / 1000.0, tz=pytz.utc)
        events = snapshot["data"]
        trades = []
        for event in events:
            trades.append(Trade(datetime.fromtimestamp(event["T"] / 1000.0, tz=pytz.utc), \
                        ccy_pair, \
                        float(event["p"]), \
                        float(event["v"]), \
                        event["S"].lower(), \
                        "market"))

        decoded_msg = DecodedMsg("trade", {"data": trades})
        return decoded_msg.to_dict()  
        
    def get_checksum(self, orderbook):
        pass