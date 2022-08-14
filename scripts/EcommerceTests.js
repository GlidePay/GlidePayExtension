const { EcommerceCart } = require('./ECommerceCart');
const { getAddresses } = require('./cartconfirmation');
const { LogError } = require("./LogError");
const assert = require('assert');

async function runTests() {
  let testCaseList = document.getElementById("test-cases-list");
  console.log("dddd" + testCaseList)
  let resultList = [];

  await (async () => {
    let message = "Initialize EcommerceCart object.";
    try {
      const ecommerceCart = new EcommerceCart();
      resultList.push("(PASSED) " + message);
    } catch (err) {
      resultList.push("(FAILED) " + message);
    }
  })();
  
  await (async () => {
    let message = "Check if valid wallet with valid token is verified.";
    try {
      const ecommerceCart = new EcommerceCart();
      await ecommerceCart.verifyWallet("0x34FD7D3ff2F2f77e29cE7B87d2dA26a0d9636986", {}, false);
      resultList.push("(PASSED) " + message);
    } catch (err) {
      resultList.push("(FAILED) " + message);
      resultList.push("Error: "+ JSON.stringify(err));
    }
  })();

  await (async () => {
    let message = "Check if valid token can be retrieved from localstorage.";
    try {
      const ecommerceCart = new EcommerceCart();
      let existingToken = await chrome.storage.local.get("glidePayJWT");
      await ecommerceCart.verifyWallet("0x34FD7D3ff2F2f77e29cE7B87d2dA26a0d9636986", existingToken, false);
      resultList.push("(PASSED) " + message);
    } catch (err) {
      resultList.push("(FAILED) " + message);
      resultList.push("Error: "+ JSON.stringify(err));
    }
  })();

  await (async () => {
    let message = "Check if addresses are successfully retrieved.";
    try {
      let addresses = await getAddresses();
      resultList.push("(PASSED) " + message);
    } catch (err) {
      resultList.push("(FAILED) " + message);
      resultList.push("Error: "+ JSON.stringify(err));
    }
  })();

  await (async () => {
    let message = "Check if invalid wallet with valid token is rejected.";

    try {
      const ecommerceCart = new EcommerceCart();
      let existingToken = await chrome.storage.local.get("glidePayJWT");
      await ecommerceCart.verifyWallet("Im an invalid wallet", existingToken, false);
      resultList.push("(FAILED) " + message);
      resultList.push("Error: Did not throw an error");
    } catch (err) {
      if (err.uiMsg == "Invalid Wallet") {
        resultList.push("(PASSED) " + message);
        return;
      }
      resultList.push("(FAILED) " + message);
      resultList.push("Error: "+ JSON.stringify(err));
    }
  })();

  await (async () => {
    let message = "Check if valid wallet with invalid token is rejected.";
    try {
      const ecommerceCart = new EcommerceCart();
      await ecommerceCart.verifyToken("0x34FD7D3ff2F2f77e29cE7B87d2dA26a0d9636986", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
      resultList.push("(FAILED) " + message);
      resultList.push("Error: Did not throw an error");
    } catch (err) {
      resultList.push("(PASSED) " + message);
    }
  })();
  
  resultList.forEach(element => {
    let li = document.createElement("li");
    li.appendChild(document.createTextNode(element));
    testCaseList.appendChild(li);
  })

}

runTests();