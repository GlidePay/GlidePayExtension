# READ THIS
# First, we make a request to get the balance of crypto in our account
# Second, since gemini doesn't support market orders directly, we make a second
# request for the price of crypto (in this case I'm sticking to bitcoin)
# and use this as our price to sell.
# Third, we execute the actual sell order, we're selling all of our crypto
# (we know this amount from the balance request) and we're selling it for
# the current market price (we know this from the price request)
# Note that the price of crypto will shift between the price check and
# order, this is the best solution I've found thus far.
# Fourth, we run a while loop that makes a request to check on the order's status,
# once the order's is_live response is set to False, the order has either went through
# or cancelled for some reason

# TODO, currently no request errors are handled properly, currently responses are just printed
# Use Gemini's "immediate-or-cancel" option and update the price of
# the sell until we an order goes through (this will be the biggest money saver)
# Right now I left this code in a script form without any functions so following
# the flow would be easier

import requests
import urllib3
import json
import base64
import hmac
import hashlib
import datetime, time

# Make sure to create a sandbox account (Different from main gemini account)

# Setting up endpoints we'll access later
base_url = "https://api.sandbox.gemini.com"
order_endpoint = "/v1/order/new"
balance_endpoint = "/v1/balances"
order_status_endpoint = "/v1/order/status"
order_url = base_url + order_endpoint
balance_url = base_url + balance_endpoint
order_status_url = base_url + order_status_endpoint
price_check_url = "https://api.gemini.com/v1/pubticker/BTCUSD"

# Add your own api keys here

# Should start with "master-xxxxxxxxxxxxx" or "account-xxxxxxxxxxxx", I used an account API key
gemini_api_key = "public key goes here"
# Private key
gemini_api_secret = "private key goes here".encode()

# Creating a number used once, gemini recommends it but doesn't require, I just
# used their preffered method of creating a nonce
t = datetime.datetime.now()
nonce = time.time()

# Payload to request our crypto balance
balance_payload = {
    "nonce": nonce,
    "request": "/v1/balances",
}

# Encrypting our payload (this is from the gemini docs)
encoded_payload = json.dumps(balance_payload).encode()
b64 = base64.b64encode(encoded_payload)
signature = hmac.new(gemini_api_secret, b64, hashlib.sha384).hexdigest()

# Request headers for our balance request
balance_request_headers = { 'Content-Type': "text/plain",
                    'Content-Length': "0",
                    'X-GEMINI-APIKEY': gemini_api_key,
                    'X-GEMINI-PAYLOAD': b64,
                    'X-GEMINI-SIGNATURE': signature,
                    'Cache-Control': "no-cache" }

# Creating the actual request
# I know we don't want to use the requests library, this is a quick
# TODO I can solve ASAP
balance_response = requests.post(balance_url,
                        data=None,
                        headers=balance_request_headers)

# A list of dictionaries is returned, each dictionary represents balance info for a
# particular crypto currency, index 2 is bitcoin
balance_json = balance_response.json()

# Accessing amount of bitcoin
bitcoin_balance = balance_json[3]['amount']

# Since we don't need our api keys for the price check request, getting the current
# price of bitcoin is trivial
response = requests.get(price_check_url).json()
# Access the asking price for bitcoin, there is also a bid price <- someone who
# knows more about trading should look at this
btc_price = float(response['ask'])

# Creating a new nonce for the order request
t = datetime.datetime.now()
nonce = time.time()

# Creating an order id so we can track the orders status later on
t = datetime.datetime.now()
order_id = str(round(time.time()))

# Creating the payload for an order request
order_payload = {
    "request": "/v1/order/new",
    "nonce": nonce,
    "client_order_id": order_id,
    "symbol": "btcusd",
    # REPLACE AMOUNT WITH bitcoin_balance TO SELL ALL OF BITCOIN IN ACCOUNT
    "amount": 0.1,
    # Here I'm using decreasing the sell price by an amount (20 in thie case) so we can increase the likelihood that our
    # transacation will go through
    # TODO please have someone who really knows trading look at the way I'm doing this
    "price": btc_price - 100,
    "side": "sell",
    "type": "exchange limit",
}

# Same encoding process as with the check balance request
encoded_payload = json.dumps(order_payload).encode()
b64 = base64.b64encode(encoded_payload)
signature = hmac.new(gemini_api_secret, b64, hashlib.sha384).hexdigest()

order_request_headers = { 'Content-Type': "text/plain",
                    'Content-Length': "0",
                    'X-GEMINI-APIKEY': gemini_api_key,
                    'X-GEMINI-PAYLOAD': b64,
                    'X-GEMINI-SIGNATURE': signature,
                    'Cache-Control': "no-cache" }

# Executing the order
order_response = requests.post(order_url,
                        data=None,
                        headers=order_request_headers)

new_order = order_response.json()
print(new_order)

# Waiting until the order goes through
while True:
    # Creating a new nonce for the order request
    t = datetime.datetime.now()
    nonce = time.time()

    # Creating order status payload using order_id from when we executed our order
    order_status_payload = {
        "request": "/v1/order/status",
        "nonce": nonce,
        "client_order_id": order_id,
        "include_trades": True
    }

    # Same encoding process as with the check balance request
    encoded_payload = json.dumps(order_status_payload).encode()
    b64 = base64.b64encode(encoded_payload)
    signature = hmac.new(gemini_api_secret, b64, hashlib.sha384).hexdigest()

    order_status_request_headers = { 'Content-Type': "text/plain",
                        'Content-Length': "0",
                        'X-GEMINI-APIKEY': gemini_api_key,
                        'X-GEMINI-PAYLOAD': b64,
                        'X-GEMINI-SIGNATURE': signature,
                        'Cache-Control': "no-cache" }

    # Executing the order
    order_status_response = requests.post(order_status_url,
                            data=None,
                            headers=order_status_request_headers)
    order_status = order_status_response.json()
    print(order_status)

    if order_status[0]['is_live'] == False:
        print(f"Order to sell {bitcoin_balance} bitcoin for ${btc_price} went through!")
        break
    time.sleep(1)

