from asyncpg.pool import PoolAcquireContext
from exchange import Orderbook
from exchange import Trade
from sortedcontainers import SortedDict
from copy import deepcopy

class Postgres():

    INSERT_INTO_ORDERBOOK_TABLE = """
        INSERT INTO {0}_orderbook (time, symbol, 
        b1_price,b2_price,b3_price,b4_price,b5_price,
        b1_size,b2_size ,b3_size,b4_size,b5_size,
        a1_price,a2_price,a3_price,a4_price,a5_price,
        a1_size,a2_size,a3_size,a4_size,a5_size)
        VALUES ($1, $2, 
        $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22);
        """

    INSERT_INTO_TRADES_TABLE = """
        INSERT INTO {0}_trades (time, symbol, 
        price, size, side)
        VALUES ($1, $2, 
        $3, $4, $5);
        """

    def __init__(self, conn: PoolAcquireContext):
        self.conn = conn
        self.orderbook = None

    def checkIfOrderbookChanges(self, new_orderbook):
        if self.orderbook==None: 
            self.orderbook = deepcopy(new_orderbook)
            return True
        for i in range(5):
            bid, ask = self.orderbook.bids[i], self.orderbook.asks[i]
            new_bid, new_ask = new_orderbook.bids[i], new_orderbook.asks[i]
            if bid!=new_bid or self.orderbook.bid_to_qty[bid]!=new_orderbook.bid_to_qty[bid]:
                self.orderbook = deepcopy(new_orderbook)
                return True
            if ask!=new_ask or self.orderbook.ask_to_qty[ask]!=new_orderbook.ask_to_qty[ask]:
                self.orderbook = deepcopy(new_orderbook)
                return True
            
        return False

    def format_orderbook_data(self, orderbook: Orderbook)-> tuple:
        ask_prices, ask_sizes, bid_prices, bid_sizes = [None]*5, [None]*5, [None]*5, [None]*5
        for i in range(min(5, len(orderbook.bids))):
            bid_prices[i] = orderbook.bids[i]
            bid_sizes[i] = orderbook.bid_to_qty[bid_prices[i]]
        
        for i in range(min(5, len(orderbook.asks))):
            ask_prices[i] = orderbook.asks[i]
            ask_sizes[i] = orderbook.ask_to_qty[ask_prices[i]]

        return (orderbook.timestamp, orderbook.ccy_pair, *bid_prices, *bid_sizes, *ask_prices, *ask_sizes)

    async def add_orderbook_to_table(self, exchange: str, orderbook: Orderbook):
        if not self.checkIfOrderbookChanges(orderbook):
            return "orderbook of first 5 bids and first 5 asks are not changed, no insert into the database table"
        database_data = self.format_orderbook_data(orderbook)
        # print(database_data)
        status = await self.conn.execute(self.INSERT_INTO_ORDERBOOK_TABLE.format(exchange), *database_data)
        return status  
    
    async def add_trade_to_table(self, exchange: str, trade: Trade):
        database_data = self.format_trade_data(trade)
        status = await self.conn.execute(self.INSERT_INTO_TRADES_TABLE.format(exchange), *database_data)
        return status  

    def format_trade_data(self, trade: Trade)-> tuple:
        return (trade.timestamp, trade.ccy_pair, trade.price, trade.size, trade.side)
    
    def test2(self):
        pass

    # def store_orderbook_data(msg_response):
    #     decode_orderbook_msg