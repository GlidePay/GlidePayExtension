chrome.runtime.onMessage.addListener((message, sender) => {
    if ((message.from === 'cart')) {
        switch (message.subject) {
            case 'productData': {
                chrome.pageAction.show(sender.tab.id);
            } break;
            case 'createOrderPopup': {
                let top = 0;
                let left = message.screenSize - 360;
                try {
                    const lastFocused = chrome.getLastFocused()
                    top = lastFocused.top;
                } catch (e) {
                }
                chrome.windows.create({url:"views/confirmation.html", type: "popup", top: top, left: left,
                    width: 360, height: 620}, (window) => {
                });
            } break;
            case 'createRegistrationPopup': {
                // TODO: Create registration popup (Need DB integration first.)
                let top = 0;
                let left = 100;
                try {
                    const lastFocused = chrome.getLastFocused()
                    top = lastFocused.top;
                } catch (e) {
                }
                chrome.windows.create({url:"views/registration.html", type: "popup", top: top, left: left,
                    width: 360, height: 620}, (window) => {
                });
            } break;
            case 'storeUser': {
                storeSession('userid', message.userid);
            } break;
            case 'getUser': {
                getSession('userid');
            } break;
            case 'getCoinPrice': {
                return getCoinPrice(message.coin);
            }
            case 'getTransaction': {
                getTransaction(message.body);
            } break;
            case 'findUserByWallet': {
                return findUserByWallet(message.wallet);
            }
            case 'createUserByWallet': {
                createUser(message.wallet);
            }
        }
    }
});

// Store a variable in chrome session storage.
function storeSession(key, value) {
    chrome.storage.session.set({
        [key]: value,
    }, function () {
        console.log('Value is set to ' + value);
    });
}

// Access a variable in chrome session storage.
function getSession(key) {
    chrome.storage.session.get(key, function(result) {
        return result[key];
    });
}

async function getCoinPrice(coin) {
    //coin must be in the form of "xxxusd" IE "ethusd"
    const price = await fetch('https://okmf73layh.execute-api.us-east-1.amazonaws.com/default/getCoinPriceGemini', {
        method: 'post',
        body: JSON.stringify({
            ticker: coin
        })
    })
    return price.json().ask;
}

function getTransaction(body) {
    let user = body.user;
    let txhash = body.txhash;
    let wallet = body.wallet;
    let retailer = body.retailer;
    let status = body.status;
    let productidsarr = body.productidsarr;
    let addressid = body.addressid;
    fetch ('https://u1krl1v735.execute-api.us-east-1.amazonaws.com/default/getTransaction', {
        method: 'post',
        body: JSON.stringify({
            txhash: txhash,
            wallet: wallet,
            userid: user,
            retailer: retailer,
            status: status,
            productidsarr: productidsarr,
            addressid: addressid
        })
    }).catch(error => {
        console.log(error.stack);
    });
}

async function findUserByWallet(wallet) {
    const user = await fetch('https://u1krl1v735.execute-api.us-east-1.amazonaws.com/default/findUserByWalletRDS', {
        method: 'post',
        body: JSON.stringify({
            wallet: wallet
        })
    })
    return JSON.parse(user.text()).User_ID;
}

function createUser(wallet) {
    fetch ('https://kyr8ehszh2.execute-api.us-east-1.amazonaws.com/default/createUserRDS', {
        method: 'POST',
        body: JSON.stringify({
            wallet: wallet
        })
    }).catch(error => {
        console.log(error.stack);
    });
}

