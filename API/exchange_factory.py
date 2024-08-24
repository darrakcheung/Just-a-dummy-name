from inspect import getmembers, isclass, isabstract
import exchange

class ExchangeFactory():
    exchanges_dict = {}

    def __init__(self):
        self.load_exchanges()

    def load_exchanges(self):
        members = getmembers(exchange, lambda m: isclass(m) and not isabstract(m))
        for name, class_type in members:
            if isclass(class_type) and issubclass(class_type, exchange.Exchange):
                self.exchanges_dict[name] = class_type

    #create new instances of the exchange class
    def create(self, exchange_name: str):
        if exchange_name in self.exchanges_dict:
            return self.exchanges_dict[exchange_name]()
        else:
            raise ValueError(f"The exchange '{exchange_name}' is not supported")

        
