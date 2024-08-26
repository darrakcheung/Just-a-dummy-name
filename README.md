# VisualCrypto
Useful UI features to test and research high frequency trading strategies for crypto

## Installation
### 1. create the virtual environment and install the python packages
```
python -m venv venv
pip install -r API/requirement.txt
pip install -r Webapp/requirement.txt
```

### 2. run the backend API server
```
python API/orderbook_snapshot.py  //it is still in debug mode
```
```console
 * Serving Quart app 'orderbook_snapshot'
 * Debug mode: True
 * Please use an ASGI server (e.g. Hypercorn) directly in production
 * Running on http://0.0.0.0:3000 (CTRL + C to quit)
[2024-08-25 23:17:16 -0400] [88556] [INFO] Running on http://0.0.0.0:3000 (CTRL + C to quit)
```

### 3. run the web server
```
python Webapp/app.py  //it is still in debug mode
```


