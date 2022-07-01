import json
import urllib3


def track_tx(txHash):
    etherscan_api_token = '4VAC14M32HHU669RJDDCITKQJDZ186PKKB'
    http = urllib3.PoolManager()
    response = http.request('GET', 'https://api.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=' + txHash + '&apikey=' + etherscan_api_token)
    return response.data

def lambda_handler(event, context):
    try:
      operation = event['requestContext']['http']['method']
      origin = event['headers']['origin']
    except:
        operation = False
        origin = False

    txHash = event['txHash']
    txStatus = track_tx(txHash)
    if (txStatus['result']['status'] != "1"):
        txStatus = "0"
    return txStatus


