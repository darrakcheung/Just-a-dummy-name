from quart import g, Quart, websocket, request, jsonify, render_template
from quart_cors import cors
import os
from dotenv import load_dotenv, find_dotenv

app = Quart(__name__)

#force update the js file when reload
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

app = cors(app, allow_origin="*")   

load_dotenv(find_dotenv(), override=True)

api_url = os.environ.get("API_URL")
ws_url = os.environ.get("WS_URL")


@app.websocket('/test')
async def test():
    while True:
        data = await websocket.receive()
        print(f"Received message: {data}")
        await websocket.send(f"Server received: {data}")
                

@app.route('/')
async def index():
    return await render_template("homepage.html")

@app.route('/realtime')
async def realtime():
    return await render_template("homepage.html")

@app.route('/realtime_dashboard')
async def realtime_dashboard():
    return await render_template("realtime_dashboard.html", ws_url = ws_url)

@app.route('/historical')
async def historical():
    return await render_template("historical.html", api_url = api_url)

@app.route('/historical_dashboard')
async def historical_dashboard():
    return await render_template("historical_dashboard.html", api_url = api_url)

if __name__=="__main__":
    app.run(debug=True, port=int("3001"))