from quart import g, Quart, websocket, request, jsonify
from quart_cors import cors
import asyncpg
import websockets
from websockets import ConnectionClosed
from exchange_factory import ExchangeFactory
from exchange import Exchange
import asyncio
import json

# sudo /home/ubuntu/OrderbookData/OrderbookData/bin/python orderbook_snapshot.py

app = Quart(__name__)
# target is to put sth like app = cors(app, allow_origin="https://example.com")
# https://pgjones.dev/blog/spa-cors-2019/
app = cors(app, allow_origin="*")
# app = cors(app, allow_origin="http://visualcrypto.ddns.net")

params = {
        "host": "127.0.0.1",
        "port": 5432,
        "user": "postgres",
        "password": "P@ssw0rd",
        "database": "postgres",
        "min_size": 5,
        "max_size": 5,
    }

@app.before_serving
async def create_db_pool():
    app.db = await asyncpg.create_pool(**params)

@app.after_serving
async def close_db_pool():
    await app.db.close()

@app.route("/", methods=["GET"])
async def test():
    return "testing"

@app.route("/first_and_last_timestamp", methods=["POST"])
async def first_and_last_timestamp():
    data = await request.form
    data = dict(data)
    print(data)
    exchange = data["exchange"]
    ccy_pair = data["ccy_pair"]
    
    ORDERBOOK_FIRST_TIMESTAMP = f"SELECT time FROM {exchange}_orderbook WHERE symbol='{ccy_pair}' LIMIT 1;"
    ORDERBOOK_LAST_TIMESTAMP = f"SELECT time FROM {exchange}_orderbook WHERE symbol='{ccy_pair}' ORDER BY time DESC LIMIT 1;"

    TRADES_FIRST_TIMESTAMP = f"SELECT time FROM {exchange}_trades WHERE symbol='{ccy_pair}' LIMIT 1;"
    TRADES_LAST_TIMESTAMP = f"SELECT time FROM {exchange}_trades WHERE symbol='{ccy_pair}' ORDER BY time DESC LIMIT 1;"

    response = {}
    async with app.db.acquire() as connection:
        orderbook_first = await connection.fetchval(ORDERBOOK_FIRST_TIMESTAMP)
        orderbook_first = None if orderbook_first == None else orderbook_first.strftime('%Y-%m-%d %H:%M:%S.%f')

        orderbook_last = await connection.fetchval(ORDERBOOK_LAST_TIMESTAMP)
        orderbook_last = None if orderbook_last == None else orderbook_last.strftime('%Y-%m-%d %H:%M:%S.%f')

        trades_first = await connection.fetchval(TRADES_FIRST_TIMESTAMP)
        trades_first = None if trades_first == None else trades_first.strftime('%Y-%m-%d %H:%M:%S.%f')

        trades_last = await connection.fetchval(TRADES_LAST_TIMESTAMP)
        trades_last = None if trades_last == None else trades_last.strftime('%Y-%m-%d %H:%M:%S.%f')

        if orderbook_first==None:
            response["first"] = trades_first
        elif trades_first==None:
            response["first"] = orderbook_first
        else:
            response["first"] = orderbook_first if orderbook_first < trades_first else trades_first

        if orderbook_last==None:
            response["last"] = trades_last
        elif trades_last==None:
            response["last"] = orderbook_last
        else:
            response["last"] = orderbook_last if orderbook_last < trades_last else trades_last
    return jsonify(response)


@app.route("/timestamp_range", methods=["POST"])
async def timestamp_range():
    data = await request.form
    data = dict(data)
    exchange = data["exchange"]
    ccy_pair = data["ccy_pair"]
    start = data["start"]
    end = data["end"]
    ORDERBOOK_WITHIN_TIMESTAMP_RANGE = f"""SELECT time FROM {exchange}_orderbook WHERE symbol='{ccy_pair}' and 
                    time >= timestamp '{start}' and time <= timestamp '{end}';"""
    
    TRADES_WITHIN_TIMESTAMP_RANGE = f"""SELECT time FROM {exchange}_trades WHERE symbol='{ccy_pair}' and 
                    time >= timestamp '{start}' and time <= timestamp '{end}';"""

    data = []
    async with app.db.acquire() as connection:
        orderbook_rows = await connection.fetch(ORDERBOOK_WITHIN_TIMESTAMP_RANGE)
        orderbook_rows = [(order[0], "ob") for order in orderbook_rows]

        trades_rows = await connection.fetch(TRADES_WITHIN_TIMESTAMP_RANGE)
        trades_rows = [(trade[0], "t") for trade in trades_rows]
        rows = sorted(orderbook_rows+trades_rows)

        data = [(x.strftime('%Y-%m-%d %H:%M:%S.%f'), y) for x, y in rows]
    return data

@app.route("/snapshot", methods=["POST"])
async def snapshot():
    data = await request.form
    data = dict(data)
    exchange = data["exchange"]
    ccy_pair = data["ccy_pair"]
    timestamp = data["timestamp"]
    snapshot_type = data["snapshot_type"]

    data = []
    async with app.db.acquire() as connection:
        if snapshot_type=="ob":
            ORDERBOOK_SNAPSHOT = f"""SELECT * FROM {exchange}_orderbook WHERE symbol='{ccy_pair}' and 
                    time = timestamp '{timestamp}';"""
            TRADES_SNAPSHOT = f"""SELECT * FROM {exchange}_trades WHERE symbol='{ccy_pair}' and 
                    time = timestamp '{timestamp}';"""
            
            print(ORDERBOOK_SNAPSHOT)
            print(TRADES_SNAPSHOT)

            orderbook_row = await connection.fetchrow(ORDERBOOK_SNAPSHOT)
            trades_row = await connection.fetchrow(TRADES_SNAPSHOT)
            data.append(dict(orderbook_row))
            data.append(None if trades_row==None else dict(trades_row))
        elif snapshot_type=="t":
            #find the nearest possible order before timestamp
            ORDERBOOK_SNAPSHOT = f"""SELECT * FROM {exchange}_orderbook WHERE symbol='{ccy_pair}' and 
                    time <= timestamp '{timestamp}' ORDER BY time DESC LIMIT 1;"""
            TRADES_SNAPSHOT = f"""SELECT * FROM {exchange}_trades WHERE symbol='{ccy_pair}' and 
                    time = timestamp '{timestamp}';"""
            
            orderbook_row = await connection.fetchrow(ORDERBOOK_SNAPSHOT)
            trades_row = await connection.fetchrow(TRADES_SNAPSHOT)
            data.append(None if orderbook_row==None else dict(orderbook_row))
            data.append(dict(trades_row))
            print(dict(trades_row))
    return data

# @app.route("/snapshot_range", methods=["POST"])
async def snapshot(exchange, ccy_pair, start, end, type):
    SELECT_WITHIN_TIME_RANGE = f"""SELECT * FROM {exchange}_{type} WHERE symbol='{ccy_pair}' and 
                    time >= timestamp '{start}' and time <= timestamp '{end}' ORDER BY time;"""

    print(SELECT_WITHIN_TIME_RANGE)

    data = []
    async with app.db.acquire() as connection:
        rows = await connection.fetch(SELECT_WITHIN_TIME_RANGE)
        for row in rows:
            d = dict(row)
            d["time"] = d["time"].strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
            # print(d["time"])
            data.append(d)
    return data


@app.route("/snapshot_range", methods=["POST"])
async def snapshot_range():
    data = await request.form
    data = dict(data)
    exchange = data["exchange"]
    ccy_pair = data["ccy_pair"]
    start = data["start"]
    end = data["end"]

    orderbook_data, trade_data = await asyncio.gather(snapshot(exchange, ccy_pair, start, end, "orderbook"), \
                                                      snapshot(exchange, ccy_pair, start, end, "trades"))

    return {
        "orderbook": orderbook_data,
        "trade": trade_data
    }


async def ws_request(exchange: Exchange, channel, ccy_pair):
    print(exchange.name, channel, ccy_pair)

    if exchange.name=="Gemini":
        ws_url = exchange.ws_url+exchange.to_exchange_ccy_pairs[ccy_pair]
    else:
        ws_url = exchange.ws_url

    async for ws in websockets.connect(ws_url, ping_interval=None, max_size=300000000):
            await exchange.subscribe_request(ws, channel, ccy_pair)
            while True:
                try:
                    response_msg = await ws.recv()
                    msg_obj = exchange.decode(response_msg, ccy_pair)

                    if msg_obj["msg_type"] == "book":
                        # orderbook = msg_obj["msg"]["data"]
                        # print(orderbook)
                        msg_obj["exchange"] = exchange.name
                        msg_obj["ccy_pair"] = ccy_pair
                        data = msg_obj['msg']['data'].toDictString()
                        # print(data)
                        return_str = f'{{' \
                            f'"msg_type": "book",' \
                            f'"exchange": "{exchange.name}",' \
                            f'"ccy_pair": "{ccy_pair}",' \
                            f'"data": {data}' \
                            f'}}'
                        await websocket.send(return_str)

                    elif msg_obj["msg_type"] == "trade":
                        trades = '['
                        for trade in msg_obj["msg"]["data"]:
                            trades += trade.toDictString()+ ","
                        trades = (trades[:-1]+ ']' if trades[-1]=="," else "[]")
                        msg_obj["exchange"] = exchange.name
                        msg_obj["ccy_pair"] = ccy_pair

                        return_str = f'{{' \
                            f'"msg_type": "trade",' \
                            f'"exchange": "{exchange.name}",' \
                            f'"ccy_pair": "{ccy_pair}",' \
                            f'"data": {trades}' \
                            f'}}'
                        await websocket.send(return_str)
                    # await websocket.send("test")

                except (ConnectionClosed, ConnectionAbortedError, ConnectionResetError) as e:
                    print(f"Websocket connection is closed with error: {str(e)}")
@app.websocket('/ws')
async def ws():
    while True:
        data = await websocket.receive()
        requests = json.loads(data)
        tasks = []
        factory = ExchangeFactory()
        for request in requests:
            ccy_pair = request["ccy_pair"]
            exchange_cls = factory.create(request["exchange"])
            for channel in ["orderbook", "trades"]:
                tasks.append(ws_request(exchange_cls, channel, ccy_pair))
        # await websocket.send(f"Server received:")
        await asyncio.gather(*tasks)

    
app.run(host="0.0.0.0", port=int("3000"), debug=True)