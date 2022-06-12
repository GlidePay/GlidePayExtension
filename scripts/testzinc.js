var url = "https://api.zinc.io/v1/orders";
let XMLHttpRequest = require('xhr2');

var xhr = new XMLHttpRequest();
xhr.open("POST", url);

xhr.setRequestHeader("Content-Type", "application/json");
xhr.setRequestHeader("Authorization", "Basic: " + btoa("2BCEDB1E4313FC88D2196076"));

xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
        console.log(xhr.status);
        console.log(xhr.responseText);
    }};

var data = `{
  "retailer": "amazon",
  "products": [
    {
      "product_id": "B0016NHH56",
      "quantity": 1
    }
  ],
  "max_price": 2300,
  "shipping_address": {
    "first_name": "Tim",
    "last_name": "Beaver",
    "address_line1": "77 Massachusetts Avenue",
    "address_line2": "",
    "zip_code": "02139",
    "city": "Cambridge",
    "state": "MA",
    "country": "US",
    "phone_number": "5551230101"
  },
  "is_gift": true,
  "gift_message": "Here is your package, Tim! Enjoy!",
  "shipping": {
    "order_by": "price",
    "max_days": 5,
    "max_price": 1000
  },
  "payment_method": {
    "name_on_card": "Ben Bitdiddle",
    "number": "5555555555554444",
    "security_code": "123",
    "expiration_month": 1,
    "expiration_year": 2020,
    "use_gift": false
  },
  "billing_address": {
    "first_name": "William",
    "last_name": "Rogers",
    "address_line1": "84 Massachusetts Ave",
    "address_line2": "",
    "zip_code": "02139",
    "city": "Cambridge",
    "state": "MA",
    "country": "US",
    "phone_number": "5551234567"
  },
  "retailer_credentials": {
    "email": "timbeaver@gmail.com",
    "password": "myRetailerPassword",
    "totp_2fa_key": "3DE4 3ERE 23WE WIKJ GRSQ VOBG CO3D METM 2NO2 OGUX Z7U4 DP2H UYMA"
  },
  "webhooks": {
    "request_succeeded": "http://mywebsite.com/zinc/request_succeeded",
    "request_failed": "http://mywebsite.com/zinc/requrest_failed",
    "tracking_obtained": "http://mywebsite.com/zinc/tracking_obtained"
  },
  "client_notes": {
    "our_internal_order_id": "abc123",
    "any_other_field": ["any value"]
  }
}`;

xhr.send(data);
