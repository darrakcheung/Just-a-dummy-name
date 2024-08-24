from dataclasses import dataclass
from datetime import datetime
from sortedcontainers import SortedSet
from collections import defaultdict

@dataclass
class Orderbook():
    def __init__(self):
        self.timestamp = datetime.fromtimestamp(0)
        self.bids = SortedSet(key=lambda x: -x)
        self.asks = SortedSet()
        self.bid_to_qty = defaultdict()
        self.ask_to_qty = defaultdict()
        self.ccy_pair = None
        self.checksum = None

    def toDictString(self):
        bid_prices, bid_sizes, ask_prices, ask_sizes = [], [], [], []
        for i in range(5):
            bid_prices.append(self.bids[i])
            bid_sizes.append(self.bid_to_qty[self.bids[i]])
            ask_prices.append(self.asks[i])
            ask_sizes.append(self.ask_to_qty[self.asks[i]])
        return f'{{' \
            f'"timestamp": "{self.timestamp.strftime("%Y-%m-%d %H:%M:%S.%f")}",' \
            f'"ccy_pair": "{self.ccy_pair}",' \
            f'"bid_prices": {bid_prices},' \
            f'"bid_sizes": {bid_sizes},' \
            f'"ask_prices": {ask_prices},' \
            f'"ask_sizes": {ask_sizes}' \
            f'}}'

    def __repr__(self):
        return f"Orderbook: {self.timestamp}; " \
               f"{self.ccy_pair}; " \
               f"{self.bids[:5]}; " \
               f"{self.asks[:5]} "

    def __str__(self):
        return f"Orderbook: {self.timestamp}; " \
               f"{self.ccy_pair}; " \
               f"{self.bids[:5]}; " \
               f"{self.asks[:5]} "