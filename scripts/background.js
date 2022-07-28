// We have this defined as a global variable here so that we can track the tabID of the tab making requests to the
// extension.
let senderID;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // This handles requests from cart.
  if (message.from === "cart") {

    // Switch statement on the subject to improve performance.
    switch (message.subject) {

      // NO CLUE WHAT THIS DOES, DO NOT DELETE PLEASE.
      case "productData":
        {
          chrome.pageAction.show(sender.tab.id);
        }
        break;

      // This creates the order popup.
      case "createOrderPopup":
        {
          // Positions the popup at the top of the page.
          let top = 0;
          let left = message.screenSize - 360;
          try {
            const lastFocused = chrome.getLastFocused();
            top = lastFocused.top;
          } catch (e) {}

          // Creates the popup.
          chrome.windows.create(
            {

              // HTML File for the popup.
              url: "views/confirmation.html",
              type: "popup",
              top: top,
              left: left,
              width: 360,
              height: 620,
            },

              // This callback function is run once the popup is created. It sets the senderID variable to the
              // tab id of the tab that created the popup.
            () => {
              senderID = sender.tab.id;
              console.log("senderID being sent" + senderID);
            }
          );
        }
        break;

      // This gets the price of the coin being asked for by querying the gemini API.
      case "getCoinPrice": {

        // We call the helper function.
        getCoinPrice(message.body).then((result) => {
          sendResponse(result);
        });

        // We need to return true because the function is asynchronous. This keeps the messaging port open long enough
        // to get the response and send it.
        return true;
      }

      // This essentially passes the transaction to the GlidePay API.
      case "getTransaction":
        {

          // We call the helper function.
          getTransaction(message.body).then((result) => {

            // Checking for error.
            if (result instanceof Error) {
              sendResponse(result);
            } else {
              sendResponse(result);
            }
          });
        }
        break;

      // This generates a nonce for wallet verification purposes.
      case "generateNonce": {

        // We call the helper function.
        generateNonce(message.body).then((result) => {
          if (result.hasOwnProperty("error")) {
            sendResponse(result);
          } else {
            sendResponse(result);
          }
        });

        // We need to return true because the function is asynchronous. This keeps the messaging port open long enough
        // to get the response and send it.
        return true;
      }

      // This verifies the JWT.
      case "verifyToken": {

        // We call the helper function.
        verifyToken(message.body).then((result) => {
          if (result.hasOwnProperty("error")) {
            sendResponse(result);
          } else {
            sendResponse(result);
          }
        });

        // We need to return true because the function is asynchronous. This keeps the messaging port open long enough
        // to get the response and send it.
        return true;
      }

      // This verifies the signature created by the user's wallet.
      case "verifySignature": {

        // We call the helper function.
        verifySignature(message.body).then((result) => {
          if (result.hasOwnProperty("error")) {
            sendResponse(result);
          } else {
            sendResponse(result);
          }
        });

        // We need to return true because the function is asynchronous. This keeps the messaging port open long enough
        // to get the response and send it.
        return true;
      }

      // This queries the GlidePay API for all the saved addresses associated with a user.
      case "getAddresses": {

        // We call the helper function.
        getAddresses(message.body).then((result) => {
          if (result.hasOwnProperty("error")) {
            sendResponse(result);
          } else {
            sendResponse(result);
          }
        });

        // We need to return true because the function is asynchronous. This keeps the messaging port open long enough
        // to get the response and send it.
        return true;
      }

      // This queries the GlidePay API and saves a new address for a user.
      case "createAddress": {

        // We call the helper function.
        createAddress(message.body).then((result) => {
          if (result instanceof Error) {
            sendResponse(result);
          } else {
            sendResponse(result);
          }
        });

        // We need to return true because the function is asynchronous. This keeps the messaging port open long enough
        // to get the response and send it.
        return true;
      }
    }

    // Messages from the GlidePay website.
  } else if (message.from === "site") {
    switch (message.subject) {

      // This gets the JWT and sends it back to the GlidePay website.
      case "getToken": {
        chrome.storage.local.get("glidePayJWT", (result) => {
          sendResponse(result.glidePayJWT);
        });

        // We need to return true because the function is asynchronous. This keeps the messaging port open long enough
        // to get the response and send it.
        return true;
      }
    }
  }
});

// This listens for when the popup is closed.
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

// This sends the senderTabID to the popup so that it can communicate with the cart.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.from === "confirmation" && msg.subject === "getTabID") {
    console.log("Msg received");
    console.log("senderID " + senderID);
    sendResponse(senderID);
  }
});

// This function gets the price of the coin being asked for by querying the Gemini API.
async function getCoinPrice(payload) {
  // Coin must be in the form of "xxxyyy" IE "ethusd"
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

// This function passes the transaction to the GlidePay API.
async function getTransaction(body) {
  console.log(body)
  try {
    // We get the JWT from the local storage.
    let result = await chrome.storage.local.get("glidePayJWT");
    let jwt = result.glidePayJWT;

    // We initialize our parameters.
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
      return JSON.parse(await response.text());
    }
  } catch (err) {
    return {
      customMsg: "Get transaction Failed",
      error: err.stack,
      errorID: Date.now(),
    };
  }
}

// This function generates a nonce to be used for wallet verification.
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

// This function verifies a given JWT.
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

    // If the response status is 200, we return the JSON data.
    if (response.status === 200) {
      return JSON.parse(jsonData);
    }

    // If the response status is 400, we return false.
    if (response.status === 400) {
      return false;
    }

    // This means an error was thrown.
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

// This function verifies a given signature to validate that a call is coming from a wallet.
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

    // If the response status is 200, we return the JSON data.
    if (response.status === 200) {
      return JSON.parse(jsonData);
    }

    // If the response status is not 200, we return the data (it will contain error info).
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

// This function creates a new for the user.
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

// This function gets the saved addresses of the user.
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
