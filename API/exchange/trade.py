from datetime import datetime


class Trade():
    def __init__(self, timestamp, ccy_pair, price, size, side, type):
        self.timestamp = timestamp
        self.ccy_pair = ccy_pair
        self.price = price
        self.size = size
        self.side = side
        self.type = type

    def toDictString(self):
        return f'{{' \
            f'"timestamp": "{self.timestamp.strftime("%Y-%m-%d %H:%M:%S.%f")}",' \
            f'"ccy_pair": "{self.ccy_pair}",' \
            f'"price": "{self.price}",' \
            f'"size": "{self.size}",' \
            f'"side": "{self.side}",' \
            f'"type": "{self.type}"' \
            f'}}'

    def __repr__(self):
        return f"Trade: {self.timestamp}, " \
               f"{self.ccy_pair}; " \
               f"{self.price}; " \
               f"{self.size}; " \
               f"{self.side}; " \
               f"{self.type}"

    def __str__(self):
        return f"Trade: {self.timestamp}; " \
               f"{self.ccy_pair}; " \
               f"{self.price}; " \
               f"{self.size}; " \
               f"{self.side}; " \
               f"{self.type}"
    
