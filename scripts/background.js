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
        getCoinPrice(message.body).then((result) => {
          sendResponse(result);
        });
        return true;
      }
      case "getTransaction":
        {
          getTransaction(message.body).then((result) => {
            if (result instanceof Error) {
              sendResponse({ error: result.stack });
            } else {
              sendResponse({ data: result });
            }
          });
        }
        break;
      case "generateNonce": {
        generateNonce(message.body).then((result) => {
          if (result.hasOwnProperty("error")) {
            sendResponse({ error: result });
          } else {
            sendResponse({ data: result });
          }
        });
        return true;
      }
      case "verifyToken": {
        verifyToken(message.body).then((result) => {
          if (result.hasOwnProperty("error")) {
            sendResponse({ error: result });
          } else {
            sendResponse({ data: result });
          }
        });
        return true;
      }
      case "verifySignature": {
        verifySignature(message.body).then((result) => {
          if (result.hasOwnProperty("error")) {
            sendResponse({ error: result });
          } else {
            sendResponse({ data: result });
          }
        });
        return true;
      }
      case "createAddress": {
        createAddress(message.body).then((result) => {
          if (result instanceof Error) {
            sendResponse({ error: result.stack });
          } else {
            sendResponse({ data: result });
          }
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

async function getCoinPrice(payload) {
  //coin must be in the form of "xxxusd" IE "ethusd"
  try {
    const response = await fetch(
      "https://okmf73layh.execute-api.us-east-1.amazonaws.com/default/getCoinPriceGemini",
      {
        method: "post",
        body: JSON.stringify(payload),
      }
    );
    const jsonData = await response.text();

    if (response.status === 200) {
      return JSON.parse(jsonData);
    }
    if (response.status !== 200) {
      return JSON.parse(jsonData);
    }
  } catch (err) {
    return { error: err.stack, errorOrigin: "Extension", errorID: Date.now() };
  }
}

async function getTransaction(body) {
  try {
    result = await chrome.storage.local.get("glidePayJWT");
    let jwt = result.glidePayJWT;
    let txhash = body.txHash;
    let retailer = body.retailer;
    let status = body.orderStatus;
    let productidsarr = body.productidsarr;
    let addressid = body.addressid;
    let amount = body.amount;
    let ticker = body.ticker;
    response = await fetch(
      "https://xrl1xszvde.execute-api.us-east-1.amazonaws.com/prod/",
      {
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
      }
    );
    return true;
  } catch (err) {
    return err;
  }
}

async function generateNonce(payload) {
  try {
    let response = await fetch(
      "https://7hx7n933o2.execute-api.us-east-1.amazonaws.com/default/generateNonce",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    const jsonData = await response.text();

    if (response.status === 200) {
      return JSON.parse(jsonData).data;
    }
    if (response.status !== 200) {
      return JSON.parse(jsonData).error;
    }
  } catch (err) {
    return {
      customMsg: "Generate Nonce Failed",
      error: err.stack,
      errorID: Date.now(),
    };
  }
}

async function verifyToken(payload) {
  try {
    const response = await fetch(
      "https://wv4gqvqqi1.execute-api.us-east-1.amazonaws.com/default/verifyToken",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    const jsonData = await response.text();

    if (response.status === 200) {
      return JSON.parse(jsonData).data;
    }
    if (response.status === 400) {
      return false;
    }

    if (response.status !== 200) {
      return JSON.parse(jsonData).error;
    }
  } catch (err) {
    return {
      customMsg: "Verify Signature Failed",
      error: err.stack,
      errorID: Date.now(),
    };
  }
}

async function verifySignature(payload) {
  try {
    let response = await fetch(
      "https://t1gn9let1f.execute-api.us-east-1.amazonaws.com/default/verifySignature",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    const jsonData = await response.text();

    if (response.status === 200) {
      return JSON.parse(jsonData).data;
    }

    if (response.status !== 200) {
      return JSON.parse(jsonData).error;
    }
  } catch (err) {
    return {
      customMsg: "Verify Signature Failed",
      error: err.stack,
      errorID: Date.now(),
    };
  }
}

async function createAddress(payload) {
  try {
    let response = await fetch(
      "https://6zfr42udog.execute-api.us-east-1.amazonaws.com/default/createAddressRDS",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    return true;
  } catch (err) {
    return err;
  }
}
