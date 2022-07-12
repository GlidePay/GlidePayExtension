const createProvider = require("metamask-extension-provider");
const Web3 = require("web3");
const provider = createProvider();

class EcommerceCart {
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
          .then((price) => {
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
      this.cryptoButton.disabled = true;
      provider
        .request({ method: "eth_requestAccounts" })
        .catch(() => {
          this.cryptoButton.disabled = false;
          throw Error("Metamask login already opened.");
        })
        .then(() => {
          return this.checkMetamaskSignIn();
        })
        .then((walletID) => {
          return this.checkAccount(walletID);
        })
        .then(() => {
          console.log("Passing user`");
          this.productDict = this.getProducts();
          console.log(this.productDict);
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
          console.log(`UserID: ${userID}`);
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
          console.log("Returing userID here");
          return userID;
        })
        .then((userID) => {
          console.log(`Uzers: ${userID}`);
          console.log(`Storing user: ${userID}`);
          chrome.runtime
            .sendMessage({
              from: "cart",
              subject: "storeUser",
              userid: userID,
            })
            .then(() => {
              console.log("User is set");
              resolve();
            });
        });
    });
  }
}

module.exports = {
  EcommerceCart,
};
