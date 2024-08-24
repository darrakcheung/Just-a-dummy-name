import psycopg2

#useful script to delete all the data from all tables

exchange_list = [
    "Okx",
    "Bybit",
    "Gemini",
    "Coinbase"
]

DELETE_ALL_ROWS_FROM_ORDERBOOK_TABLE = \
"""
DELETE from {0}_orderbook;
"""

DELETE_ALL_ROWS_FROM_TRADES_TABLE = \
"""
DELETE from {0}_trades;
"""


def main():
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
            
            cursor.execute(DELETE_ALL_ROWS_FROM_ORDERBOOK_TABLE .format(exchange))
            cursor.execute(DELETE_ALL_ROWS_FROM_TRADES_TABLE .format(exchange))


   
if __name__ == "__main__":
    main()