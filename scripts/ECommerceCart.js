const createProvider = require("metamask-extension-provider");
const { ethers } = require("ethers");
const maskInpageProvider = createProvider();
const provider = new ethers.providers.Web3Provider(maskInpageProvider, "any");
const signer = provider.getSigner();
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
        const usdCost = msg.price;
        chrome.runtime
          .sendMessage({
            from: "cart",
            subject: "getCoinPrice",
            coin: "ethusd",
          })
          .then((price) => {
              console.log(price);
              const ethCost = usdCost / price;
              console.log(ethCost);
              let gasPrice;
              let gas_limit = "0x100000"
              provider.getGasPrice().then((gas) => {
                gasPrice = ethers.utils.hexlify(gas);
              })
              const transaction = {
                  from: maskInpageProvider.selectedAddress,
                  to: "0xB5EC5c29Ed50067ba97c4009e14f5Bff607a324c",
                  value: ethers.utils.parseEther(ethCost.toString()),
                  gasLimit: ethers.utils.hexlify(gas_limit),
                  gasPrice: gasPrice,
                  //TODO: Maybe we use the nonce or data field of this to encode information about the transaction?
                  //We could verify that on the backend to ensure that the transaction is valid. Something like that.
              }
              signer.sendTransaction(transaction).then((tx) => {
                  console.log(tx.hash);
                  chrome.runtime.sendMessage({
                      from: "cart",
                      subject: "getUser",
                  })
                      .then((user) => {
                          console.log("ETHUSER" + user);
                          const body = {
                              user: user,
                              txHash: tx.hash,
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
                      })
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
        .send("eth_requestAccounts", [])
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
          return this.verifyWallet(walletID);
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
      provider.send("eth_requestAccounts", []).catch((err) => {
        console.log("rejecting");
        this.cryptoButton.disabled = false;
        reject(
            new LogError(
                err,
                "Web3 get accounts failed to fetch accounts",
                () => {
                  alert("A problem occured with Metamask.");
                  this.cryptoButton.disabled = false;
                }
            )
        );
      }).then((accounts) => {
        if (accounts.length === 0) {
          reject(
              new UserError("User has no wallets.", () => {
                alert("Please create a wallet in Metamask.");
                this.cryptoButton.disabled = false;
              })
          );
        } else {
            resolve(accounts[0]);
        }
      })
    });
  }

  async getExistingToken() {
      return new Promise((resolve, reject) => {
          chrome.storage.local.get("glidePayJWT", (result) => {
              if (result.glidePayJWT) {
                  console.log("JWT found");
                  resolve(result.glidePayJWT);
              } else {
                  reject();
              }
          });
      });
  }

  async verifyWallet(walletID) {
    const nonce = await fetch("https://7hx7n933o2.execute-api.us-east-1.amazonaws.com/default/generateNonce", {
      method: "POST",
      body: JSON.stringify({
        wallet: walletID,
      })
    });
    const nonceText = await nonce.text();
    let message = "Please sign this message to login!.\n Nonce: " + nonceText;
    console.log("NONCE" + nonceText);
    const signature = await signer.signMessage(message);
    const existingToken = await this.getExistingToken();
    const res = await fetch("https://t1gn9let1f.execute-api.us-east-1.amazonaws.com/default/verifySignature", {
        method: "POST",
        body: JSON.stringify({
            wallet: walletID,
            walletSignature: signature,
            existingToken: existingToken,
        }),
    });
    const resText = await res.text();
    const JWT = JSON.parse(resText).token;
    await chrome.storage.local.set({
        glidePayJWT: JWT,
    });
    if (res.status === 200) {
        return new Promise((resolve) => {
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
    } else {
        console.log("Wallet Verification Failed.");
    }
  }
}

module.exports = {
  EcommerceCart,
};
