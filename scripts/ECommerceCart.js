const createProvider = require("metamask-extension-provider");
const { ethers } = require("ethers");
const maskInpageProvider = createProvider();
const provider = new ethers.providers.Web3Provider(maskInpageProvider, "any");
const signer = provider.getSigner();
const { LogError } = require("./LogError");

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
    this.retailer;
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
        try {
          this.handleTransaction(msg);
        } catch (err) {
          console.log("Transaction Error");
          console.log(err);
          if (err instanceof LogError) {
            err.logError();
          }
        }
      }
    });
  }

  async handleTransaction(msg) {
    const costUSD = msg.price;

    const getCoinPriceResponse = await chrome.runtime.sendMessage({
      from: "cart",
      subject: "getCoinPrice",
      body: { ticker: "ethusd" },
    });

    if (getCoinPriceResponse.hasOwnProperty("error")) {
      throw new LogError(
        getCoinPriceResponse.error,
        "Failed to fetch",
        {},
        getCoinPriceResponse.errorOrigin,
        getCoinPriceResponse.errorID,
        () => {
          this.cryptoButton.disabled = false;
          alert("Server Error");
        }
      );
    }

    const coinPriceUSD = getCoinPriceResponse.data;

    const ethCost = costUSD / coinPriceUSD;
    console.log(`Price in Eth: ${ethCost}`);

    const gas_limit = "0x100000";
    const gas = await provider.getGasPrice();
    const gasPrice = ethers.utils.hexlify(gas);

    const transaction = {
      from: maskInpageProvider.selectedAddress,
      to: "0xB5EC5c29Ed50067ba97c4009e14f5Bff607a324c",
      value: ethers.utils.parseEther(ethCost.toString()),
      gasLimit: ethers.utils.hexlify(gas_limit),
      gasPrice: gasPrice,
      //TODO: Maybe we use the nonce or data field of this to encode information about the transaction?
      //We could verify that on the backend to ensure that the transaction is valid. Something like that.
    };

    const tx = await signer.sendTransaction(transaction);
    console.log(`txHASH: ${tx.hash}`);
    console.log(this.retailer);
    const body = {
      txHash: tx.hash,
      retailer: this.retailer,
      productidsarr: msg.products,
      addressid: msg.addressid,
      orderStatus: "Transaction Pending Confirmation.",
      ticker: "ETH", //TODO: In future this needs to be changed to the ticker of the coin being used.
      amount: ethCost,
    };
    console.log("BODY" + JSON.stringify(body));

    chrome.runtime.sendMessage({
      from: "cart",
      subject: "getTransaction",
      body: body,
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
      this.cryptoButtonPressed();
    });
    return cryptoButton;
  }

  async cryptoButtonPressed() {
    try {
      let walletID = await this.checkMetamaskSignIn();
      await this.verifyWallet(walletID);
      this.productDict = this.getProducts();
      this.retailer = this.getRetailer();
      console.log(this.retailer);
      await chrome.runtime.sendMessage({
        from: "cart",
        subject: "createOrderPopup",
        screenSize: screen.width,
      });
      this.cryptoButton.disabled = false;
    } catch (err) {
      console.log("Error Crypto Button Flow");
      console.log(err);
      if (err instanceof LogError) {
        err.logError();
      }
    }
  }

  async checkMetamaskSignIn() {
    let accounts = await provider
      .send("eth_requestAccounts", [])
      .catch((err) => {
        throw new LogError(err, "Metamask already open", {}, () => {
          alert("Extension Error");
        });
      });

    if (accounts.length === 0) {
      throw new LogError(
        err,
        "No Metamask accounts available",
        { accounts: accounts },
        () => {
          this.cryptoButton.disabled = false;
          alert("Extension Error");
        }
      );
    } else {
      return accounts[0];
    }
  }

  async verifyWallet(walletID) {
    let existingToken = await chrome.storage.local.get("glidePayJWT");
    existingToken = existingToken.glidePayJWT;
    console.log(existingToken);
    console.log("erm");
    if (existingToken == {} || existingToken.hasOwnProperty("message")) {
      existingToken = {};
      console.log("1");
      await this.createJWTToken(walletID, existingToken);
      return;
    }
    console.log("2");

    if (!(await this.verifyToken(walletID, existingToken))) {
      console.log("3");

      await this.createJWTToken(walletID, existingToken);
      return;
    }
    return;
  }

  async createJWTToken(walletID, token) {
    let nonceResponse = await chrome.runtime.sendMessage({
      from: "cart",
      subject: "generateNonce",
      body: {
        wallet: walletID,
      },
    });
    console.log(nonceResponse);
    if (nonceResponse.hasOwnProperty("error")) {
      console.log("help");
      throw new LogError(
        nonceResponse.customMsg,
        nonceResponse.error,
        { walletID: walletID, token: token },
        nonceResponse.errorID,
        () => {
          this.cryptoButton.disabled = false;
          alert("Server Error");
        }
      );
    }
    const nonce = nonceResponse.data;
    let message = "Please sign this message to login!.\n Nonce: " + nonce;
    console.log("NONCE: " + nonce);
    const signature = await signer.signMessage(message);
    let signatureResponse = await chrome.runtime.sendMessage({
      from: "cart",
      subject: "verifySignature",
      body: {
        wallet: walletID,
        walletSignature: signature,
        existingToken: token,
      },
    });

    if (signatureResponse.hasOwnProperty("error")) {
      const signatureResponseError = signatureResponse.error;
      console.log("Throwing signature error");
      throw new LogError(
        signatureResponseError.customMsg,
        signatureResponseError.error,
        {
          walletID: walletID,
          token: token,
          nonce: nonce,
          message: message,
          signature: signature,
        },
        signatureResponseError.errorID,
        () => {
          this.cryptoButton.disabled = false;
          alert("Server Error");
        }
      );
    }
    const newToken = signatureResponse.data;
    await chrome.storage.local.set({
      glidePayJWT: newToken,
    });
    console.log("Wallet Verified and Set");
  }

  async verifyToken(walletID, token) {
    let verifyTokenResponse = await chrome.runtime.sendMessage({
      from: "cart",
      subject: "verifyToken",
      body: {
        token: token,
        wallet: walletID,
      },
    });
    if (verifyTokenResponse.hasOwnProperty("error")) {
      throw new LogError(
        verifyTokenResponse.error,
        "Invalid Token",
        {
          walletID: walletID,
          token: token,
        },
        () => {
          this.cryptoButton.disabled = false;
          alert("Invalid Token");
        }
      );
    }
    return verifyTokenResponse.data;
  }
}

module.exports = {
  EcommerceCart,
};
