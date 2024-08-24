from .exchange import Exchange
import websockets
import json
from sortedcontainers import SortedDict
from datetime import datetime
# from orderbook_data.exchange.orderbook import Orderbook
# from orderbook_data.exchange.trade import Trade
from .orderbook import Orderbook
from .trade import Trade
from copy import deepcopy
import pytz

class Okx(Exchange):
    name = "Okx"
    ws_url = "wss://ws.okx.com:8443/ws/v5/public"

    to_exchange_ccy_pairs = {
        "BTCUSD": "BTC-USDT",
        "LTCUSD": "LTC-USDT",
        "BCHUSD": "BCH-USDT",
        "SOLUSD": "SOL-USDT",
        "ETHUSD": "ETH-USDT",
        "BTCUSDC": "BTC-USDC"
    }
    from_exchange_ccy_pairs = {
        "BTC-USDT": "BTCUSD",
        "LTC-USDT": "LTCUSD",
        "SOL-USDT": "SOLUSD",
        "BCH-USDT": "BCHUSD",
        "ETH-USDT": "ETHUSD",
        "BTC-USDC": "BTCUSDC"

    }
    
    subscription_request = {
        "orderbook": {
            "op": "subscribe",
            "args": [
                {
                "channel": "books5",
                "instId": None
                }
            ]
        },
        "trades": {
            "op": "subscribe",
            "args": [
                {
                "channel": "trades",
                "instId": None
                }
            ]
        }
    }

    def __init__(self):
        self.orderbook = Orderbook()
        self.subscribe_request = deepcopy(Okx.subscribe_request)

    async def subscribe_request(self, websocket: websockets, channel, ccy_pair):

        if channel not in self.subscription_request:
            raise Exception(f"Channel {channel} is not implemented in {self.name} exchange")

        if ccy_pair not in Okx.to_exchange_ccy_pairs: 
            raise Exception(f"Ccy_pair {ccy_pair} is not implemented in {self.name} exchange")
        
        request = self.subscription_request[channel]
        request["args"][0]["instId"] = Okx.to_exchange_ccy_pairs[ccy_pair]
        await websocket.send(json.dumps(request))

    def decode(self, msg: str, ccy_pair: str)-> dict:
        msg_obj = json.loads(msg)
        
        if "event" in msg_obj:
            return self.decode_subscription_message(msg_obj)
        else:
            if msg_obj["arg"]["channel"]=="books5":
                return self.decode_orderbook_message(msg_obj["data"][0], ccy_pair)
            elif msg_obj["arg"]["channel"]=="trades":
                return self.decode_trades_message(msg_obj["data"], ccy_pair)
            else:
                return {
                    "msg_type": "error",
                    "msg": "no suitable method to decode the msg"
                }

    def decode_orderbook_message(self, snapshot: dict, ccy_pair: str)-> dict:
        bids = snapshot["bids"]
        asks = snapshot["asks"]
        orderbook = Orderbook()

        orderbook.timestamp = datetime.fromtimestamp(float(snapshot["ts"])/1000, tz=pytz.utc)
        orderbook.ccy_pair = ccy_pair
        for i in range(len(bids)):
            price, quantity = float(bids[i][0]), float(bids[i][1])
            orderbook.bids.add(price)
            orderbook.bid_to_qty[price] = quantity
        for i in range(len(asks)):
            price, quantity = float(asks[i][0]), float(asks[i][1])
            orderbook.asks.add(price)
            orderbook.ask_to_qty[price] = quantity
        
        return {
            "msg_type": "book",
            "msg": {
                "data": orderbook
            }
        }


    def decode_trades_message(self, trades: list, ccy_pair: str)-> dict:
        temp = []
        for trade in trades:
            temp.append(Trade(datetime.fromtimestamp(float(trade["ts"])/1000, tz=pytz.utc), \
                              ccy_pair, \
                              round(float(trade["px"]), 2), \
                              round(float(trade["sz"]),7), \
                              trade["side"].lower(), \
                              None))
                
        return {
            "msg_type": "trade",
            "msg": {
                "data": temp
            }
        }

    def decode_subscription_message(self, msg_obj: dict):
        try:
            if msg_obj["event"]=="error":
                return {
                    "msg_type": "error",
                    "msg": msg_obj["msg"]
                } 
            else:
                return {
                    "msg_type": msg_obj["event"],
                    "msg": msg_obj["arg"]
                }
        except Exception as e:
            return {
                "msg_type": "error",
                "msg": e
            }
        
    def get_checksum(self, orderbook):
        pass