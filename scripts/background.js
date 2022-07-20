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
  chrome.storage.local.get("glidePayJWT", (result) => {
    let jwt = result.glidePayJWT;
    let txhash = body.txHash;
    let retailer = body.retailer;
    let status = body.orderStatus;
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
          token: jwt,
          retailer: retailer,
          orderStatus: status,
          productidsarr: productidsarr,
          addressid: addressid,
          amount: amount,
          ticker: ticker,
        }),
      }),
    }).catch((error) => {
      throw error.stack;
    });
  });
}
