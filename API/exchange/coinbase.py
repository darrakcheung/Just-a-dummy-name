from .exchange import Exchange
import websockets
import json
from sortedcontainers import SortedSet
from datetime import datetime
# from orderbook_data.exchange.orderbook import Orderbook
# from orderbook_data.exchange.trade import Trade
from .orderbook import Orderbook
from .trade import Trade
import pytz
from copy import deepcopy
from dateutil import parser

class Coinbase(Exchange):
    name = "Coinbase"
    ws_url = "wss://advanced-trade-ws.coinbase.com"

    to_exchange_ccy_pairs = {
        "BTCUSD": "BTC-USD",
        "ETHUSD": "ETH-USD",
        "SOLUSD": "SOL-USD",
        "BCHUSD": "BCH-USD",
        "LTCUSD": "LTC-USD"
    }
    from_exchange_ccy_pairs = {
        "BTC-USD": "BTCUSD",
        "ETH-USD": "ETHUSD",
        "SOL-USD": "SOLUSD",
        "BCH-USD": "BCHUSD",
        "LTC-USD": "LTCUSD"
    }
    
    subscription_request = {
        "orderbook": {
            "type": "subscribe",
            "product_ids": [],
            "channel": "level2"
        },
        "trades": {
            "type": "subscribe",
            "product_ids": [],
            "channel": "market_trades"
        },
    }

    def __init__(self):
        self.orderbook = Orderbook()
        self.orderbook_initiated = False
        self.ignore_first_trade_snapshot = True
        self.subscription_request = deepcopy(Coinbase.subscription_request)

    async def subscribe_request(self, websocket: websockets, channel, ccy_pair):

        if channel not in self.subscription_request:
            raise Exception(f"Channel {channel} is not implemented in {self.name} exchange")

        if ccy_pair not in Coinbase.to_exchange_ccy_pairs: 
            raise Exception(f"Ccy_pair {ccy_pair} is not implemented in {self.name} exchange")
        
        request = self.subscription_request[channel]
        if channel=="orderbook":
            request["product_ids"].append(Coinbase.to_exchange_ccy_pairs[ccy_pair])
        elif channel=="trades":
            request["product_ids"].append(Coinbase.to_exchange_ccy_pairs[ccy_pair])
        print(request)
        await websocket.send(json.dumps(request))

    def decode(self, msg: str, ccy_pair: str)-> dict:
        msg_obj = json.loads(msg)
        if "events" in msg_obj:
            channel = msg_obj["channel"]
            if channel=="l2_data":
                if not self.orderbook_initiated:
                    return self.get_first_orderbook_snapshot(msg_obj, ccy_pair)
                else:
                    return self.update_orderbook(msg_obj, ccy_pair) 
            elif channel=="market_trades":
                return self.decode_trades_message(msg_obj, ccy_pair)
            else:
                return {
                    "msg_type": "error",
                    "msg": "no suitable method to decode the msg"
                }
            
        return {
            "msg_type": "error",
            "msg": "no suitable method to decode the msg"
        }
    
    def get_first_orderbook_snapshot(self, msg_obj:dict, ccy_pair: str)-> dict:
        self.orderbook.ccy_pair = ccy_pair
        self.orderbook.timestamp = parser.parse(msg_obj["timestamp"]).replace(tzinfo=pytz.UTC)
        events = msg_obj["events"][0]["updates"]
        for event in events:
            price, quantity = float(event["price_level"]), float(event["new_quantity"])
            if event["side"]=="bid":
                self.orderbook.bids.add(price)
                self.orderbook.bid_to_qty[price] = quantity
            elif event["side"]=="offer":
                self.orderbook.asks.add(price)
                self.orderbook.ask_to_qty[price] = quantity

        orderbook = deepcopy(self.orderbook)

        self.orderbook_initiated = True

        return {
            "msg_type": "book",
            "msg": {
                "data": orderbook
            }
        }

    # {'channel': 'l2_data', 'client_id': '', 'timestamp': '2024-07-04T14:12:38.117325497Z', 'sequence_num': 15, 
    #  'events': [{'type': 'update', 'product_id': 'BTC-USD', 'updates': [
    # {'side': 'bid', 'event_time': '2024-07-04T14:12:38.08942Z', 'price_level': '57154.91', 'new_quantity': '0'}
    # , {'side': 'offer', 'event_time': '2024-07-04T14:12:38.08942Z', 'price_level': '57175.11', 'new_quantity': '0.24320995'}, 
    # {'side': 'offer', 'event_time': '2024-07-04T14:12:38.08942Z', 'price_level': '57197.4', 'new_quantity': '0'}]}]}

    def update_orderbook(self, msg_obj: dict, ccy_pair: str)-> dict:
        self.orderbook.ccy_pair = ccy_pair
        timestamp = msg_obj["events"][0]["updates"][0]["event_time"]
        self.orderbook.timestamp = parser.parse(timestamp).replace(tzinfo=pytz.UTC)
        events = msg_obj["events"][0]["updates"]

        for event in events:
            price, quantity = float(event["price_level"]), float(event["new_quantity"])
            if event["side"]=="bid":
                if quantity==0:
                    self.orderbook.bids.discard(price)
                    if price in self.orderbook.bid_to_qty:
                        self.orderbook.bid_to_qty.pop(price)
                else:
                    if price not in self.orderbook.bids:
                        self.orderbook.bids.add(price)
                    self.orderbook.bid_to_qty[price] = quantity
            elif event["side"]=="offer":
                if quantity==0:
                    self.orderbook.asks.discard(price)
                    if price in self.orderbook.ask_to_qty:
                        self.orderbook.ask_to_qty.pop(price)
                else:
                    if price not in self.orderbook.asks:
                        self.orderbook.asks.add(price)
                    self.orderbook.ask_to_qty[price] = quantity

        orderbook = deepcopy(self.orderbook)

        return {
            "msg_type": "book",
            "msg": {
                "data": orderbook
            }
        }
    
    def decode_orderbook_message(self, msg):
        pass

    def decode_trades_message(self, msg_obj: dict, ccy_pair: str):
        if self.ignore_first_trade_snapshot:
            self.ignore_first_trade_snapshot = False
            return {
                        "msg_type": "trade",
                        "msg": {
                            "data": []
                        }
                    }
        self.orderbook.ccy_pair = ccy_pair
        # timestamp = datetime.fromtimestamp(snapshot["ts"] / 1000.0, tz=pytz.utc)
        events = msg_obj["events"][0]["trades"]
        trades = SortedSet(key = lambda x: x.timestamp)
        for event in events:
            trades.add(Trade(parser.parse(event["time"]).replace(tzinfo=pytz.UTC), \
                        ccy_pair, \
                        float(event["price"]), \
                        float(event["size"]), \
                        event["side"].lower(), \
                        "market"))

        return {
            "msg_type": "trade",
            "msg": {
                "data": list(trades)
            }
        }
        
    def get_checksum(self, orderbook):
        pass