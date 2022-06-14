require('dotenv').config();

let XMLHttpRequest = require('xhr2');
const axios = require('axios').default;
const key = "2BCEDB1E4313FC88D2196076";

function test(){
    axios.post('https://api.zinc.io/v1/orders', {
        retailer: "amazon",
        products: {
            product_id: "B0016NHH56",
            quantity: 1
        },
        max_price: 2300,
        shipping_address: {
            first_name: "Omar",
            last_name: "Ameen",
            address_line1: "998 Balsam Court",
            address_line2: "",
            zip_code: "L9E1R5",
            city: "Milton",
            state: "ON",
            country: "CA",
            phone_number: "2155544036"
        },
        is_gift: true,
        gift_message: "Here is your package, Tim! Enjoy!",
        shipping: {
            order_by: "price",
            max_days: 5,
            max_price: 0
        },
        payment_method: {
            name_on_card: "Omar Ameen",
            number: "4482330105195879",
            security_code: "282",
            expiration_month: 8,
            expiration_year: 2025,
            use_gift: false
        },
        billing_address: {
            first_name: "Omar",
            last_name: "Ameen",
            address_line1: "998 Balsam Court",
            address_line2: "",
            zip_code: "L9E1R5",
            city: "Milton",
            state: "ON",
            country: "CA",
            phone_number: "2155544036"
        },
        retailer_credentials: {
            "email": "omario@sas.upenn.edu",
            "password": "WOrld123$",
        }
    }, {
        headers: {
            'Authorization': 'Basic ' + btoa(key + ":")
        }
    }).then(function (response) {
        console.log(response);
    }).catch(function (error) {
        console.log("XDXDXD");
        console.log(error);
        console.log(error.response.data);
    });
}

function send_order() {
    var url = "https://api.zinc.io/v1/orders";

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Basic " + btoa(key));

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log(xhr.status);
            console.log(xhr.responseText);
        }};
    const data = JSON.stringify({
        "retailer": "amazon",
        "products": [
            {
                "product_id": "B0016NHH56",
                "quantity": 1
            }
        ],
        "max_price": 0,
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
            "email": "omario@sas.upenn.edu",
            "password": "World123$",
            "totp_2fa_key": "3DE4 3ERE 23WE WIKJ GRSQ VOBG CO3D METM 2NO2 OGUX Z7U4 DP2H UYMA"
        }
    });
    console.log(data);
    console.log(xhr);
    xhr.send(data);
}
test();
