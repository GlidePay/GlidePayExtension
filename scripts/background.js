let senderID;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.from === "cart") {
    switch (message.subject) {
      case "productData":
        {
          chrome.pageAction.show(sender.tab.id);
        }
        break;
      case "createOrderPopup":
        {
          let top = 0;
          let left = message.screenSize - 360;
          try {
            const lastFocused = chrome.getLastFocused();
            top = lastFocused.top;
          } catch (e) {}
          chrome.windows.create(
            {
              url: "views/confirmation.html",
              type: "popup",
              top: top,
              left: left,
              width: 360,
              height: 620,
            },
            () => {
              senderID = sender.tab.id;
              console.log("senderID being sent" + senderID);
            }
          );
        }
        break;
      case "createRegistrationPopup":
        {
          // TODO: Create registration popup (Need DB integration first.)
          let top = 0;
          let left = 100;
          try {
            const lastFocused = chrome.getLastFocused();
            top = lastFocused.top;
          } catch (e) {}
          chrome.windows.create(
            {
              url: "views/registration.html",
              type: "popup",
              top: top,
              left: left,
              width: 360,
              height: 620,
            },
            (window) => {}
          );
        }
        break;
      case "storeUser":
        {
          storeSession("userid", message.userid);
        }
        break;
      case "getUser": {
        chrome.storage.session.get("userid", function (result) {
          sendResponse(result["userid"]);
        });
        return true;
      }
      case "getCoinPrice": {
        getCoinPrice(message.coin).then((price) => {
          sendResponse(price);
        });
        return true;
      }
      case "getTransaction":
        {
          getTransaction(message.body);
        }
        break;
      case "findUserByWallet": {
        findUserByWallet(message.wallet).then((uid) => {
          sendResponse(uid);
        });
        return true;
      }
      case "createUserByWallet": {
        createUser(message.wallet).then((uid) => {
          sendResponse(uid);
        });
        return true;
      }
    }
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.from === "confirmation" && msg.subject === "getTabID") {
    console.log("Msg received");
    console.log("senderID " + senderID);
    sendResponse(senderID);
  }
});

// Store a variable in chrome session storage.
function storeSession(key, value) {
  chrome.storage.session.set({
    [key]: value,
  });
}

async function getCoinPrice(coin) {
  //coin must be in the form of "xxxusd" IE "ethusd"
  const price = await fetch(
    "https://okmf73layh.execute-api.us-east-1.amazonaws.com/default/getCoinPriceGemini",
    {
      method: "post",
      body: JSON.stringify({
        ticker: coin,
      }),
    }
  );
  return JSON.parse(await price.text());
}

function getTransaction(body) {
  let user = body.user;
  let txhash = body.txHash;
  let wallet = body.wallet;
  let retailer = body.retailer;
  let status = body.status;
  let productidsarr = body.productidsarr;
  let addressid = body.addressid;
  let amount = body.amount;
  let ticker = body.ticker;
  fetch("https://xrl1xszvde.execute-api.us-east-1.amazonaws.com/prod/", {
    method: "post",
    body: JSON.stringify({
      stateMachineArn:
        "arn:aws:states:us-east-1:447056388296:stateMachine:GlidePayState",
      input: JSON.stringify({
        txhash: txhash,
        wallet: wallet,
        userid: user,
        retailer: retailer,
        status: status,
        productidsarr: productidsarr,
        addressid: addressid,
        amount: amount,
        ticker: ticker,
      }),
    }),
  }).catch((error) => {
    throw error.stack;
  });
}

async function findUserByWallet(wallet) {
  const user = await fetch(
    "https://de1tn2srhk.execute-api.us-east-1.amazonaws.com/default/findUserByWalletRDS",
    {
      method: "post",
      body: JSON.stringify({
        wallet: wallet,
      }),
    }
  );
  return JSON.parse(await user.text());
}

async function createUser(wallet) {
  const user = await fetch(
    "https://kyr8ehszh2.execute-api.us-east-1.amazonaws.com/default/createUserRDS",
    {
      method: "POST",
      body: JSON.stringify({
        wallet: wallet,
      }),
    }
  );
  let userID = JSON.parse(await user.text());
  return userID;
}
