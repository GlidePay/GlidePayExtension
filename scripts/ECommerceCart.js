// This is a metamask library that allows us to connect to the metamask extension from our extension.
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
    this.shipping;
    this.popupOpen = false;
  }

  createListeners() {
    /**
     * Initializes message listeners.
     * @function createListeners
     */

    // Sends productDict when requested by cartConfirmation popup
    chrome.runtime.onMessage.addListener((msg, sender, response) => {
      if (msg.from === "popup" && msg.subject === "needInfo") {
        console.log(this.productDict, this.shipping)
        response([this.productDict, this.shipping]);
      }
    });
    // Listens for when the popup is closed, keeps track of popup state.
    chrome.runtime.onMessage.addListener((msg, sender, response) => {
      if (msg.from === "background" && msg.subject === "popupClosed") {
        this.popupOpen = false;
      }
    });

    // Sends message prompting Metamask transaction.
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg.from === "popup" && msg.subject === "promptTransaction") {
        this.handleTransaction(msg)
          .then((response) => {
            sendResponse(true);
          })
          .catch((err) => {
            console.log(err);
            sendResponse(false);
          });

        return true;
      }
    });
  }

  convertCurrency(price, currency) {
    return fetch(
      "https://api.exchangerate.host/convert?from=" +
        currency +
        "&to=USD&amount=" +
        String(price)
    )
      .then((response) => response.text())
      .then((data) => {
        return data;
      });
  }

  async handleTransaction(msg) {


    const DECIMALS = 6;
    const usdceth_abi = ["function transfer(address to, uint amount)"];
    const usdcpoly_abi = ["function transfer(address recipient, uint amount)"]; //
    const USDCETH = new ethers.Contract("0x68ec573C119826db2eaEA1Efbfc2970cDaC869c4", usdceth_abi, signer);//"0x68ec573C119826db2eaEA1Efbfc2970cDaC869c4"  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
    const USDCPOLY = new ethers.Contract("0x234201E48499b104321CB482BeB5A7ae5F3d9627", usdcpoly_abi, signer);//0xd5b31FB565d608692d6422beB31Bf0875dad4fC3   0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174


    const cost = msg.price;
    const currency = msg.currency;
    let ticker;
    if (msg.ticker == "eth") {
        ticker = 'ethusd';
    }
    else if (msg.ticker == "matic") {
        ticker = 'maticusd';}
      else if (msg.ticker == 'usdc-polygon'){
        ticker = 'usdcusd';
      }
      else if (msg.ticker == 'usdc-eth'){
        ticker = 'usdcusd'
    }
    const chain = msg.ticker
    console.log(ticker)
    const currentChain = await provider.send('eth_chainId');
    console.log(currentChain)
    //Switch Chains
    console.log(chain)
        if (chain === 'eth' || chain === 'usdc-eth' && currentChain !== '0x3') {
          await provider.send('wallet_switchEthereumChain', [{chainId: '0x3'}]);}
        else if (chain === 'matic' || chain == 'usdc-polygon' && currentChain !== '0x89') {
          await provider.send('wallet_switchEthereumChain', [{chainId: '0x13881'}]); 
        }
        else if (chain === 'ftm' && currentChain !== '0xFA') {
          try {
          await provider.send('wallet_switchEthereumChain', [{chainId: '0xFA'}]); }
          catch{
            try{
              const params = [{
                chainId: '0xFA',
                chainName: 'Fantom Opera',
                nativeCurrency: {
                  name: 'Fantom',
                  symbol: 'FTM',
                  decimals: 18
                },
                rpcUrls: ['https://rpc.ankr.com/fantom/'],
                blockExplorerUrls: ['https://ftmscan.com/']
              }]
            
              provider.send('wallet_addEthereumChain', params )
            }
            catch(err){
              console.log(err.stack)
            }
          }
        }
    let costUSD;
    if (currency === "USD") {
      costUSD = cost;
    } else {
      let currencyResponse = await this.convertCurrency(cost, currency);
      console.log(currencyResponse);
      costUSD = JSON.parse(currencyResponse).result;
    }
    console.log(ticker)
    console.log(currency);
    console.log(costUSD);
    const getCoinPriceResponse = await chrome.runtime.sendMessage({
      from: "cart",
      subject: "getCoinPrice",
      body: { ticker: ticker },
    });

    // Checking that the price of the Crypto in USD is received, and an error was not thrown.
    if (getCoinPriceResponse.hasOwnProperty("error")) {
      throw new LogError(
        getCoinPriceResponse.customMsg,
        "getCoinPriceResponse.error",
        { price: costUSD },
        getCoinPriceResponse.uiMsg,
        getCoinPriceResponse.errorID,
        () => {
          this.cryptoButton.disabled = false;
          alert("Server Error");
        }
      );
    }


    // Getting the price of the Crypto in USD.
    const coinPriceUSD = getCoinPriceResponse.data;

    // Calculating the cost of the cart in ETH.
    // TODO: Update this to use the selected token.
    console.log(coinPriceUSD)
    const ethCost = costUSD / coinPriceUSD;
    console.log(`Price in Eth: ${ethCost}`);
    // Declaring variables for the transaction.
    const gas_limit = "0x100000";
    const gas = await provider.getGasPrice();
    const gasPrice = ethers.utils.hexlify(gas);
    console.log(gasPrice)
    // Creating the transaction object.
    const transaction = {
      // The address of the user's wallet.
      from: maskInpageProvider.selectedAddress,
      // The destination address.
      // TODO: Update this to be the actual Gemini address.
      to: "0x9E4b8417554166293191f5ecb6a5E0E929e58fef",
      // The amount of Crypto to send.
      value: ethers.utils.parseEther(ethCost.toFixed(18)),
      gasLimit: ethers.utils.hexlify(gas_limit),
      gasPrice: gasPrice,
    };
    console.log("waiting o sign");
    // This prompts the user to approve the transaction on Metamask.
    let tx;
    const address = '0x9E4b8417554166293191f5ecb6a5E0E929e58fef';
   const amount = ethers.utils.parseUnits(ethCost.toFixed(6).toString(), DECIMALS);
    console.log(amount)
    console.log(gasPrice/1)
    console.log(chain)
    if (chain === 'usdc-eth') {
      tx = await USDCETH.transfer(address, amount, { gasLimit: 55000 }); //TODO: change this to an actual gas price conversion
    } else if (chain === 'usdc-polygon') {
      tx = await USDCPOLY.transfer(address, amount, { gasLimit: 55000 })
    }else {
    tx = await signer.sendTransaction(transaction);
    }

    console.log(`txHASH: ${tx.hash}`);

 

    const body = {
      txHash: tx.hash,
      retailer: this.retailer,
      shipping: this.shipping,
      productidsarr: msg.products,
      addressid: msg.addressid,
      orderStatus: "Transaction Pending Confirmation.",
      ticker: chain, //TODO: In future this needs to be changed to the ticker of the coin being used.
      amount: ethCost,
    };
    console.log("BODY" + JSON.stringify(body));

    // Sending the body to the backend to track the order.
    chrome.runtime.sendMessage({
      from: "cart",
      subject: "getTransaction",
      body: body,
    });
    console.log("returning");
    return true;
  }

  // This defines the Pay with Crypto button and its functionality.
  createButton() {
    // Creating the button.
    let cryptoButton = document.createElement("INPUT");
    cryptoButton.id = "crypto-button";
    cryptoButton.type = "image";
    cryptoButton.src =
      "https://bafkreiflbuggpczchtd2elv5qqhyks27ujz6hihi4xxzrp5kxu3psd4qce.ipfs.nftstorage.link/";
    cryptoButton.style.cssText = "height: 79px; width: 260px";

    // Defining functionality.
    cryptoButton.addEventListener("click", () => {
      // We disable the button to prevent multiple clicks.
      this.cryptoButton.disabled = true;
      if (!this.popupOpen) {
        this.cryptoButtonPressed();
        return;
      }
      this.cryptoButton.disabled = false;
    });
    return cryptoButton;
  }

  // This function is called when the Pay with Crypto button is pressed.
  async cryptoButtonPressed() {
    try {
      // We check to make sure that the user is connected with Metamask and has a wallet connected.
      let walletID = await this.checkMetamaskSignIn();

      // We check to make sure that the request is actually coming from a user with a wallet, and not being spoofed.
      // We do this by calling verifyWallet.
      await this.verifyWallet(walletID);

      // We get the products selected by the user.
      this.productDict = await this.getProducts();

      // We get the retailer of the products.
      this.retailer = this.getRetailer();

      this.shipping = this.getShipping(this.productDict);
      // This is a timer we will use for loading animation.
      const timer = (ms) => new Promise((res) => setTimeout(res, ms));

      // This loop waits for the popup's DOM to load in.
      while (this.popupOpen) {
        // While the popup is open

        // We send a message to the popup with the cartInfo.
        const cartInfoReceived = await chrome.runtime
          .sendMessage({
            from: "cart",
            subject: "sendCartInfo",
            data: this.productDict,
            shipping: this.shipping,
          })
          .then((response) => {
            return response;
          });

        // Once we know the cart has received the products, we can break and stop with the loading animation.
        if (cartInfoReceived) {
          break;
        }

        // We wait for 1 second before checking again.
        await timer(1000);
      }

      // Re-enable the button.
      this.cryptoButton.disabled = false;
    } catch (err) {
      console.log("Error Crypto Button Flow");
      console.log(err);
      if (err instanceof LogError) {
        this.cryptoButton.disabled = false;
      }
    }
  }

  // This function checks to make sure that the user is connected with Metamask and has a wallet connected.
  async checkMetamaskSignIn() {
    // We check to make sure that the user is connected with Metamask and has a wallet connected.
    let accounts = await provider
      .send("eth_requestAccounts", [])
      .catch((err) => {
        throw new LogError(
          "Metamask already open",
          err.stack,
          {},
          "Metamask already open",
          Date.now(),
          () => {
            alert("Metamask already open");
          }
        );
      });

    // If there are no accounts, we throw an error.
    if (accounts.length === 0) {
      throw new LogError(
        "No Metamask accounts available",
        err,
        "No Metamask accounts available",
        { accounts: accounts },
        Date.now(),
        () => {
          alert("No Metamask accounts available");
        }
      );
    } else {
      // If there are accounts, we return the first one.
      return accounts[0];
    }
  }

  // This function checks to make sure that the request is actually coming from a user with a wallet,
  // and not being spoofed.
  async verifyWallet(walletID) {
    // We check for an existing JWT in local storage.
    let existingToken = await chrome.storage.local.get("glidePayJWT");
    if (
      // We check to see if the JWT is empty.
      JSON.stringify(existingToken) === "{}" ||
      existingToken.hasOwnProperty("message")
    ) {
      // If it is, we set it to an empty JSON object, and then we create a new JWT for the user.
      existingToken = {};
      await this.createJWTToken(walletID, existingToken.glidePayJWT);
      return;
    }
    // If the JWT is not empty, we check to make sure that the JWT is valid.
    if (!(await this.verifyToken(walletID, existingToken.glidePayJWT))) {
      // this.verifyToken returns false if the token is invalid.

      // If it is invalid, we create a new JWT for the user.
      await this.createJWTToken(
        walletID.toLowerCase(),
        existingToken.glidePayJWT
      );
      return;
    } else {
      // Otherwise, it's valid.
    }

    // Check to see if the popup is not open.
    if (!this.popupOpen) {
      // If the popup is not open, we send a message asking for it to be created.
      await chrome.runtime.sendMessage({
        from: "cart",
        subject: "createOrderPopup",
        screenSize: screen.width,
      });
    }
    this.popupOpen = true;
  }

  // This function creates a JWT for the user.
  async createJWTToken(walletID, token) {
    // First, we generate a unique nonce for the JWT -- one time use. This is used to prevent replay attacks.
    // This sends a message asking for a nonce to be created.
    let nonceResponse = await chrome.runtime.sendMessage({
      from: "cart",
      subject: "generateNonce",
      body: {
        // We pass the walletID to the backend to get the nonce. We make sure that we set it to lowercase
        // because Metamask often sends us the walletID in lowercase, and so we must be consistent as to how we store
        // the wallet.
        wallet: walletID.toLowerCase(),
      },
    });

    // Checks to make sure there's no error.
    if (nonceResponse.hasOwnProperty("error")) {
      throw new LogError(
        nonceResponse.customMsg,
        nonceResponse.error,
        { walletID: walletID, token: token },
        nonceResponse.uiMsg,
        nonceResponse.errorID,
        () => {
          this.cryptoButton.disabled = false;
          alert("Server Error");
        }
      );
    }

    // Declaring the nonce.
    const nonce = nonceResponse.data;

    // We generate this message to be displayed to the user in the Metamask popup. THIS MUST BE EXACTLY THE SAME HERE
    // AS IT IS ON THE BACKEND. IF YOU CHANGE THIS, MAKE SURE TO ALSO CHANGE THE BACKEND.
    let message = "Please sign this message to login!.\n Nonce: " + nonce;

    // This prompts the user to sign the message, and awaits the signature that is generated.
    const signature = await signer.signMessage(message);

    // This then creates the popup. We do this in advance of calling the backend so that we can have a loading animation
    // while awaiting the backend response.
    if (!this.popupOpen) {
      await chrome.runtime.sendMessage({
        from: "cart",
        subject: "createOrderPopup",
        screenSize: screen.width,
      });
    }
    this.popupOpen = true;

    // We send the signature to the backend.
    let signatureResponse = await chrome.runtime.sendMessage({
      from: "cart",
      subject: "verifySignature",
      body: {
        wallet: walletID,
        walletSignature: signature,
        existingToken: token,
      },
    });

    // Checks to make sure there's no error.
    if (signatureResponse.hasOwnProperty("error")) {
      const signatureResponseError = signatureResponse.error;
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
        signatureResponseError.uiMsg,
        signatureResponseError.errorID,
        () => {
          this.cryptoButton.disabled = false;
          alert("Server Error");
        }
      );
    }
    console.log(signatureResponse);
    // If there's no error, we set the JWT to the response.
    const newToken = signatureResponse.data;

    // Then we store it in localStorage.
    await chrome.storage.local.set({
      glidePayJWT: newToken,
    });
    console.log("Wallet Verified and Set");
  }

  // This function verifies the JWT.
  async verifyToken(walletID, token) {
    let verifyTokenResponse = await chrome.runtime.sendMessage({
      from: "cart",
      subject: "verifyToken",
      body: {
        token: token,
        wallet: walletID,
      },
    });

    // Checks to make sure there's no error.
    if (verifyTokenResponse.hasOwnProperty("error")) {
      const verifyTokenResponseError = verifyTokenResponse.error;
      throw new LogError(
        verifyTokenResponseError.customMsg,
        verifyTokenResponseError.error,
        {
          walletID: walletID,
          token: token,
        },
        verifyTokenResponseError.uiMsg,
        verifyTokenResponseError.errorID,
        () => {
          this.cryptoButton.disabled = false;
          alert("CRITICAL ERROR: VERIFY TOKEN FAILED"); //? Why would we do this?
        }
      );
    }

    // If there's no error, we set the JWT to the response.
    return verifyTokenResponse.data;
  }
}

// Export the class so that it can be used in other files.
module.exports = {
  EcommerceCart,
};
