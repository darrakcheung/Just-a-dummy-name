from abc import ABC, abstractmethod
import websockets

class Exchange(ABC):
    name: str = NotImplemented
    ws_url: str = NotImplemented

    to_exchange_ccy_pairs: dict = NotImplemented
    from_exchange_ccy_pairs: dict  = NotImplemented

    subscription_request: dict = NotImplemented

    @abstractmethod
    def subscribe_request(self, websocket: websockets, channel, ccy_pairs: list):
        pass

    @abstractmethod
    def decode(self, msg, ccy_pair):
        pass

    @abstractmethod
    def decode_orderbook_message(self, msg):
        pass

    @abstractmethod
    def decode_trades_message(self, msg):
        pass

    @abstractmethod
    def get_checksum(self, orderbook):
        pass

