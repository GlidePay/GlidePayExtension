const createProvider = require("metamask-extension-provider");
const Web3 = require("web3");
const provider = createProvider();
// ALL CHANGES TO THIS FILE MUST BE COMPILED WITH "npm run buildCart"
class EcommerceContentScript {
  constructor() {
    this.cryptoButton = this.createButton();
    this.walletID;
    this.productDict;
  }

  createListeners() {
    chrome.runtime.onMessage.addListener((msg, sender, response) => {
      if (msg.from === "popup" && msg.subject === "needInfo") {
        response(this.productDict);
      }
    });

    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.from === "popup" && msg.subject === "promptTransaction") {
        const web3 = new Web3(provider);
        const usdCost = msg.price;

        chrome.runtime
          .sendMessage({
            from: "cart",
            subject: "getCoinPrice",
            coin: "ethusd",
          })
          .then(() => {});
        const ethCost = usdCost / price;
        web3.eth
          .sendTransaction({
            from: provider.selectedAddress,
            to: "0xB5EC5c29Ed50067ba97c4009e14f5Bff607a324c",
            value: Math.ceil(ethCost * 1000000000000000000),
          })
          .on("error", (err) => {
            console.log(err);
          })
          .on("transactionHash", (txHash) => {
            chrome.runtime
              .sendMessage({
                from: "cart",
                subject: "getUser",
              })
              .then((user) => {
                console.log("ETHUSER" + user);
                const body = {
                  user: user,
                  txHash: txHash,
                  wallet: provider.selectedAddress,
                  retailer: "Amazon",
                  productidsarr: msg.products,
                  addressid: msg.addressid,
                  status: "Transaction Pending Confirmation.",
                  ticker: "ETH", //TODO: In future this needs to be changed to the ticker of the coin being used.
                  amount: ethCost,
                };
                console.log("BODY" + JSON.stringify(body));
                chrome.runtime
                  .sendMessage({
                    from: "cart",
                    subject: "getTransaction",
                    body: body,
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              });
          });
      }
    });
  }

  createButton() {
    let cryptoButton = document.createElement("INPUT");
    cryptoButton.id = "crypto-button";
    cryptoButton.type = "image";
    cryptoButton.src =
      "https://bafkreiflbuggpczchtd2elv5qqhyks27ujz6hihi4xxzrp5kxu3psd4qce.ipfs.nftstorage.link/";
    cryptoButton.style.cssText = "height: 79px; width: 260px";

    cryptoButton.addEventListener("click", () => {
      this.checkMetamaskSignIn()
        .catch(async () => {
          console.log("wating for login");
          try {
            await provider
              .request({ method: "eth_requestAccounts" })
              .then(() => {
                return this.checkMetamaskSignIn();
              });
          } catch {
            this.cryptoButton.disabled = false;
            throw Error("Metamask login already opened.");
          }
        })
        .then((walletID) => {
          this.checkAccount(walletID);
        })
        .then(() => this.getProducts())
        .then((productDict) => {
          this.productDict = productDict;
          chrome.runtime.sendMessage({
            from: "cart",
            subject: "createOrderPopup",
            screenSize: screen.width,
          });
          this.cryptoButton.disabled = false;
        });
    });
    console.log(cryptoButton);
    return cryptoButton;
  }

  async checkMetamaskSignIn() {
    this.cryptoButton.disabled = true;
    return new Promise((resolve, reject) => {
      const web3 = new Web3(provider);
      web3.eth.getAccounts((error, accounts) => {
        if (error != null) {
          this.cryptoButton.disabled = false;
          reject(error);
        } else if (accounts.length == 0) {
          reject("No Accounts Found");
        } else {
          resolve(accounts[0]);
        }
      });
    });
  }

  async checkAccount(walletID) {
    return new Promise((resolve, reject) => {
      chrome.runtime
        .sendMessage({
          from: "cart",
          subject: "findUserByWallet",
          wallet: walletID,
        })
        .then((userID) => {
          if (userID == null) {
            // TODO: Return new Userid if userID null
            return chrome.runtime
              .sendMessage({
                from: "cart",
                subject: "createUserByWallet",
                wallet: walletID,
              })
              .then((newUserID) => {
                return newUserID;
              });
          }
          return userID;
        })
        .then((userID) => {
          console.log(`Storing user: ${userID}`);
          chrome.runtime.sendMessage({
            from: "cart",
            subject: "storeUser",
            userid: userID,
          });
        });
    });
  }
}

class Amazon extends EcommerceContentScript {
  constructor() {
    super();
  }

  injectButton() {
    const add_to_cart = document.getElementById("gutterCartViewForm");
    add_to_cart.after(this.cryptoButton);
    document.getElementById("gutterCartViewForm").style.marginBottom = "10px";
    document.getElementById("sc-buy-box").style.paddingBottom = "5px";
  }

  async getProducts() {
    let productDict = {};
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.responseType = "document";
      let url = "https://www.amazon.com/gp/cart/view.html";
      xhr.onreadystatechange = async function () {
        if (xhr.readyState === 4 && xhr.status === 200 /* DONE */) {
          let html = xhr.response;
          let div_list = html.querySelectorAll(
            "div.a-section.a-spacing-mini.sc-list-body.sc-java-remote-feature > .a-row.sc-list-item.sc-list-item-border.sc-java-remote-feature"
          );
          let img_list = html.querySelectorAll(
            "div.a-section.a-spacing-mini.sc-list-body.sc-java-remote-feature > .a-row.sc-list-item.sc-list-item-border.sc-java-remote-feature > .sc-list-item-content > .a-row.a-spacing-base.a-spacing-top-base > .a-column.a-span10 > .a-fixed-left-grid > .a-fixed-left-grid-inner > .a-fixed-left-grid-col.a-float-left.sc-product-image-desktop.a-col-left > .a-link-normal.sc-product-link"
          );
          let div_array = [...div_list];
          let img_array = [...img_list];
          for (let i = 0; i < div_array.length; i++) {
            let divHTML = new DOMParser().parseFromString(
              div_array[i].outerHTML,
              "text/xml"
            );
            let productDiv = divHTML.getElementsByClassName(
              "a-row sc-list-item sc-list-item-border sc-java-remote-feature"
            )[0];
            let product_id = productDiv.getAttribute("data-asin");
            let quantity = productDiv.getAttribute("data-quantity");
            let price = productDiv.getAttribute("data-price");
            let imgInnterHTML = new DOMParser().parseFromString(
              img_array[i].innerHTML,
              "text/xml"
            );
            let productImg = imgInnterHTML.getElementsByTagName("img")[0];
            let img = productImg.getAttribute("src");
            productDict[product_id] = [quantity, price, img, ""];
          }
          resolve(productDict);
        }
      };
      xhr.open("GET", url, true);
      xhr.send("");
    });
  }
}

(() => {
  let amazon = new Amazon();
  amazon.createListeners();
  amazon.injectButton();
  chrome.runtime.sendMessage({
    from: "cart",
    subject: "productData",
  });
})();
