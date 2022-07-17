const createProvider = require("metamask-extension-provider");
const Web3 = require("web3");
const provider = createProvider();
const { LogError, UserError } = require("./CustomError");

class EcommerceCart {
  /*
  Defines methods and handles the flow generic to Ecommerce websites.
  See the following link (EcommerceCart handles Generic Login Flow)
  https://lucid.app/lucidchart/86202d2d-3c46-49a6-89d9-a9164dd5f1ad/edit?invitationId=inv_d5751113-87f0-4abf-a8c3-6a076808331f&page=0_0#?referringapp=slack&login=slack
  */
  constructor() {
    /**
     * Initializes instance attributes of EcommerceCart.
     * @param  {HTMLElement} cryptoButton Pay with cryto button.
     * @param  {String} walletID Wallet ID of users crypto wallet.
     * @param  {Object} productDict Contains the products selected by the user.
     */
    this.cryptoButton = this.createButton();
    this.walletID;
    this.productDict;
  }

  createListeners() {
    /**
     * Initializes message listeners.
     * @function createListeners
     */

    // Sends productDict when requested by cartConfirmation popup
    chrome.runtime.onMessage.addListener((msg, sender, response) => {
      if (msg.from === "popup" && msg.subject === "needInfo") {
        response(this.productDict);
      }
    });

    // Prompts metamask transaction.
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
        .catch((err) => {
          if (err instanceof LogError) {
            throw err;
          }
          this.cryptoButton.disabled = false;
          throw new UserError("Metamask login already opened.", () => {
            alert("Metamask login already open.");
          });
        })
        .then(() => {
          return this.checkMetamaskSignIn();
        })
        .catch((err) => {
          throw err;
        })
        .then((walletID) => {
          return this.checkAccount(walletID);
        })
        .catch((err) => {
          throw err;
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
        })
        .catch((err) => {
          console.log(err);
          if (err instanceof UserError) {
            err.handle();
          } else if (err instanceof LogError) {
            console.log(err);
            err.handle();
          }
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
          console.log("rejecting");
          this.cryptoButton.disabled = false;
          reject(
            new LogError(
              error,
              "Web3 get accounts failed to fetch accounts",
              () => {
                alert("A problem occured with Metamask.");
                this.cryptoButton.disabled = false;
              }
            )
          );
        } else if (accounts.length === 0) {
          reject(
            new UserError("User has no wallets.", () => {
              alert("Please create a wallet in Metamask.");
              this.cryptoButton.disabled = false;
            })
          );
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
          if (userID === -1) {
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
