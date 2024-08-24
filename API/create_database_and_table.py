import psycopg2

# Create tables based on the exchange list

exchange_list = [
    # "Bequant",
    # "Kraken",
    # "Okx",
    # "Gemini",
    # "Bybit",
    "Coinbase"
]


CREATE_ORDERBOOK_TABLE = \
"""
CREATE TABLE IF NOT EXISTS {0}_orderbook (
time TIMESTAMP WITH TIME ZONE NOT NULL,
symbol text NOT NULL,
b1_price double PRECISION NOT NULL,
b2_price double PRECISION NOT NULL,
b3_price double PRECISION NOT NULL,
b4_price double PRECISION NOT NULL,
b5_price double PRECISION NOT NULL,
b1_size double PRECISION NOT NULL,
b2_size double PRECISION NOT NULL,
b3_size double PRECISION NOT NULL,
b4_size double PRECISION NOT NULL,
b5_size double PRECISION NOT NULL,
a1_price double PRECISION NOT NULL,
a2_price double PRECISION NOT NULL,
a3_price double PRECISION NOT NULL,
a4_price double PRECISION NOT NULL,
a5_price double PRECISION NOT NULL,
a1_size double PRECISION NOT NULL,
a2_size double PRECISION NOT NULL,
a3_size double PRECISION NOT NULL,
a4_size double PRECISION NOT NULL,
a5_size double PRECISION NOT NULL
);
"""

CREATE_TRADES_TABLE = \
"""
CREATE TABLE IF NOT EXISTS {0}_trades (
time TIMESTAMP WITH TIME ZONE NOT NULL,
symbol text NOT NULL,
price double PRECISION NOT NULL,
size double PRECISION NOT NULL,
side text NOT NULL);
"""

def main(exchange_list):
    params = {
        "host": "127.0.0.1",
        "port": 5432,
        "user": "postgres",
        "password": "P@ssw0rd",
        "database": "postgres",
    }

    conn = psycopg2.connect(**params)
    conn.autocommit = True
    with conn.cursor() as cursor:
        for exchange in exchange_list:
            create_orderbook_table_sql = CREATE_ORDERBOOK_TABLE.format(exchange)
            cursor.execute(create_orderbook_table_sql)

            create_trades_table_sql = CREATE_TRADES_TABLE.format(exchange)
            cursor.execute(create_trades_table_sql)

    conn.close()

   
if __name__ == "__main__":
    main(exchange_list)