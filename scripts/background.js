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
              sendResponse(result);
            } else {
              sendResponse(result);
            }
          });
        }
        break;
      case "generateNonce": {
        generateNonce(message.body).then((result) => {
          if (result.hasOwnProperty("error")) {
            sendResponse(result);
          } else {
            sendResponse(result);
          }
        });
        return true;
      }
      case "verifyToken": {
        verifyToken(message.body).then((result) => {
          if (result.hasOwnProperty("error")) {
            sendResponse(result);
          } else {
            sendResponse(result);
          }
        });
        return true;
      }
      case "verifySignature": {
        verifySignature(message.body).then((result) => {
          if (result.hasOwnProperty("error")) {
            sendResponse(result);
          } else {
            sendResponse(result);
          }
        });
        return true;
      }
      case "getAddresses": {
        getAddresses(message.body).then((result) => {
          if (result.hasOwnProperty("error")) {
            sendResponse(result);
          } else {
            sendResponse(result);
          }
        });
        return true;
      }
      case "createAddress": {
        createAddress(message.body).then((result) => {
          if (result instanceof Error) {
            sendResponse(result);
          } else {
            sendResponse(result);
          }
        });
        return true;
      }
    }
  } else if (message.from === "site") {
    switch (message.subject) {
      case "getToken": {
        chrome.storage.local.get("glidePayJWT", (result) => {
          sendResponse(result.glidePayJWT);
        });
        return true;
      }
    }
  }
});

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === "cartView") {
    port.onDisconnect.addListener(function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        console.log(tabs);
        console.log(senderID);
        chrome.tabs.sendMessage(senderID, {
          from: "background",
          subject: "popupClosed",
        });

        console.log("popup has been closed");
      });
    });
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
  console.log(body)
  try {
    let result = await chrome.storage.local.get("glidePayJWT");
    let jwt = result.glidePayJWT;
    let txhash = body.txHash;
    let retailer = body.retailer;
    let status = body.orderStatus;
    let productidsarr = body.productidsarr;
    let addressid = body.addressid;
    let amount = body.amount;
    let ticker = body.ticker;
    console.log(retailer)
    await fetch(
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
    if (response.status === 200) {
      return { data: true };
    }
    if (response.status !== 200) {
      return JSON.parse(jsonData);
    }
  } catch (err) {
    return {
      customMsg: "Get transaction Failed",
      error: err.stack,
      errorID: Date.now(),
    };
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
      return JSON.parse(jsonData);
    }
    if (response.status !== 200) {
      return JSON.parse(jsonData);
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
      return JSON.parse(jsonData);
    }
    if (response.status === 400) {
      return false;
    }

    if (response.status !== 200) {
      return JSON.parse(jsonData);
    }
  } catch (err) {
    return {
      customMsg: "Verify Token Failed",
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
      return JSON.parse(jsonData);
    }

    if (response.status !== 200) {
      return JSON.parse(jsonData);
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
    const jsonData = await response.text();

    if (response.status === 200) {
      return JSON.parse(jsonData);
    }

    if (response.status !== 200) {
      return JSON.parse(jsonData);
    }
  } catch (err) {
    return {
      customMsg: "Create Address Failed",
      error: err.stack,
      uiMsg: "Creating this Address Failed.",
      errorID: Date.now(),
    };
  }
}

async function getAddresses(payload) {
  try {
    let response = await fetch(
      "https://vshqd3sv2c.execute-api.us-east-1.amazonaws.com/default/getAddressesRDS",
      {
        method: "POST",
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
    return {
      customMsg: "Verify Signature Failed",
      error: err.stack,
      uiMsg: "Get Addresses Failed",
      errorID: Date.now(),
    };
  }
}
