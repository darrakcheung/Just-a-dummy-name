from .exchange import Exchange
import websockets
import json
from sortedcontainers import SortedDict
from datetime import datetime, timezone
# from orderbook_data.exchange.orderbook import Orderbook
# from orderbook_data.exchange.trade import Trade
from .orderbook import Orderbook
from .trade import Trade
from copy import deepcopy
import pytz
from zlib import crc32

class Kraken(Exchange):
    name = "Kraken"
    ws_url = "wss://ws.kraken.com/v2"

    to_exchange_ccy_pairs = {
        "BTCUSDT":"BTC/USDT",
        "BTCUSD": "BTC/USD"
    }
    from_exchange_ccy_pairs = {
        "BTC/USDT": "BTCUSDT",
        "BTC/USD": "BTCUSD"
    }
    
    subscription_request = {
        "ticker": {
            "method": "subscribe",
            "params": {
                "channel": "ticker",
                "symbol": [],
                "snapshot": False 
            }
        },
        "orderbook": {
            "method": "subscribe",
            "params": {
                "channel": "book",
                "symbol": []
            }
        },
        "trades": {
            "method": "subscribe",
            "params": {
                "channel": "trade",
                "symbol": [],
                "snapshot": False #return a snapshot of most recent 50 trades if true
            }
        }
    }

    def __init__(self):
        self.orderbook = Orderbook()
        self.subscribe_request = deepcopy(Kraken.subscribe_request)


    async def subscribe_request(self, websocket: websockets, channel, ccy_pair):
        if channel not in self.subscription_request:
            raise Exception(f"Channel {channel} is not implemented in {self.name} exchange")

        if ccy_pair not in Kraken.to_exchange_ccy_pairs: 
            raise Exception(f"Ccy_pair {ccy_pair} is not implemented in {self.name} exchange")
        
        request = self.subscription_request[channel]
        request["params"]["symbol"] = [Kraken.to_exchange_ccy_pairs[ccy_pair]]
        await websocket.send(json.dumps(request))


    def decode(self, msg: str, ccy_pair: str)-> dict:
        msg_obj = json.loads(msg)
        
        if "data" not in msg_obj:
            return self.decode_subscription_message(msg_obj)
        else:
            if msg_obj["channel"]=="ticker":
                return self.decode_ticker_message(msg_obj["data"][0], ccy_pair)
            elif msg_obj["channel"]=="book":
                return self.decode_orderbook_message(msg_obj["data"][0], ccy_pair)
            elif msg_obj["channel"]=="trade":
                return self.decode_trades_message(msg_obj["data"], ccy_pair)
            else:
                return {
                    "msg_type": "error",
                    "msg": "no suitable method to decode the msg"
                }
    def decode_ticker_message(self, snapshot: dict, ccy_pair: str)-> dict:
        pass

    def decode_orderbook_message(self, snapshot: dict, ccy_pair: str)-> dict:
        if "timestamp" not in snapshot:
            return self.get_first_orderbook_snapshot(snapshot, ccy_pair)
        else:
            return self.update_orderbook(snapshot, ccy_pair)

    def get_first_orderbook_snapshot(self, snapshot: dict, ccy_pair: str):
        ask_orders = snapshot["asks"]
        bid_orders = snapshot["bids"]
        self.orderbook.ccy_pair = ccy_pair
        self.orderbook.checksum = snapshot["checksum"]
        self.orderbook.timestamp = datetime.now(timezone.utc)
        for ask_order in ask_orders:
            self.orderbook.asks.add(float(ask_order["price"]))
            self.orderbook.ask_to_qty[float(ask_order["price"])] = float(ask_order["qty"])
        for bid_order in bid_orders:
            self.orderbook.bids.add(float(bid_order["price"]))
            self.orderbook.bid_to_qty[float(bid_order["price"])] = float(bid_order["qty"])
        
        return {
            "msg_type": "book",
            "msg": {
                "data": self.orderbook
            }
        }
        

    def update_orderbook(self, snapshot: dict, ccy_pair):
        self.orderbook.ccy_pair = ccy_pair
        timestamp = datetime.fromisoformat(snapshot["timestamp"][:-1])
        self.orderbook.timestamp = timestamp.replace(tzinfo=pytz.UTC)
        self.orderbook.checksum = snapshot["checksum"] 
        ask_orders = snapshot["asks"]
        for ask_order in ask_orders:
            price, quantity = float(ask_order["price"]), float(ask_order["qty"]) 
            if float(ask_order["qty"])==0:
                self.orderbook.asks.discard(price)
                self.orderbook.ask_to_qty.pop(quantity, 0)
            else:
                if price not in self.orderbook.asks:
                    self.orderbook.asks.add(price)
                self.orderbook.ask_to_qty[price] = quantity

        bid_orders = snapshot["bids"]
        for bid_order in bid_orders:
            price, quantity = float(bid_order["price"]), float(bid_order["qty"]) 
            if float(bid_order["qty"])==0:
                self.orderbook.bids.discard(price)
                self.orderbook.bid_to_qty.pop(quantity, 0)
            else:
                if price not in self.orderbook.bids:
                    self.orderbook.bids.add(price)
                self.orderbook.bid_to_qty[price] = quantity

        return {
            "msg_type": "book",
            "msg": {
                "data": self.orderbook
            }
        }
    
    def get_checksum(self, snapshot:dict)-> int:
        bids = snapshot["bids"]
        asks = snapshot["asks"]

        ask_checksum = ""
        for ask in asks:
            price, quantity = ask["price"], ask["qty"]
            ask_qty = str(int("".join(str(quantity).split("."))))
            ask = "".join(str(price).split("."))
            
            ask_checksum += ask+ask_qty
        print(f"ask_checksum: {ask_checksum}")

        bid_checksum = ""
        for bid in bids:
            price, quantity = bid["price"], bid["qty"]
            bid_qty = str(int("".join(str(quantity).split("."))))
            bid = "".join(str(price).split("."))
            
            bid_checksum += bid+bid_qty

        print(f"bid_checksum: {bid_checksum}")

        checksum = str.encode(ask_checksum+bid_checksum)
        return crc32(checksum)


    def decode_trades_message(self, trades: list, ccy_pair: str)-> dict:
        temp = []
        for trade in trades:
            temp.append(Trade(datetime.fromisoformat(trade["timestamp"][:-1]).replace(tzinfo=pytz.UTC), \
                              ccy_pair, \
                              float(trade["price"]), \
                              float(trade["qty"]), \
                              trade["side"].lower(), \
                              trade["ord_type"]))
                
        return {
            "msg_type": "trade",
            "msg": {
                "data": temp
            }
        }

    def decode_subscription_message(self, msg: dict):
        return  {
                "msg_type": "subscription",
                "msg": msg
            }

        # try:
        #     return {
        #         "msg_type": msg["event"]
        #     } 
        # except Exception as e:
        #     return {
        #         "msg_type": "error",
        #         "msg": e
        #     }