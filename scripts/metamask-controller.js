//TODO: Integrate this with the rest of the extension (Maybe call it from background.js? or have it be a content script? idk)
const createProvider = require('metamask-extension-provider')
const Eth = require('ethjs')
const axios = require("axios");
const provider = createProvider();
(function () {
    const eth = new Eth(provider);
    chrome.runtime.onMessage.addListener((message, sender, response) => {
        // Handling interaction with the windowed popup (Example: Confirmation cart)
        if (message.from === 'windowpopup') {
            switch (message.subject) {
                case 'promptTransaction': {
                    chrome.runtime.sendMessage({from: 'metamask-controller', subject: 'costInfo'}, function (result) {
                        //TODO: Take costinfo --> convert to wei --> create transaction --> prompt user to confirm transaction
                        var usdCost = result;
                        //TODO: Replace this with a more secure way of calling the API.
                        const key = '2c103fd3455f8aa304a0c71c05bb7b44f12471bae3edaf0f943afbf086719dcb';
                        //This returns the price of ETH in USD.
                        //TODO: Get the actual coin the user wants to pay with and then substitute that into this link.
                        axios.get(`https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD` + '&api_key={' + key + '}').then(
                            r => {
                                var ethCost = r.data.USD;
                                var ethFinal = ethCost / usdCost;
                                var ethCostWei = eth.utils.toWei(ethFinal, 'ether');
                                eth.sendTransaction({
                                    //TODO: Replace this with the address of the user's wallet.
                                    from: '0x6e0E0e02377Bc1d90E8a7c21f12BA385C2C35f78',
                                    // replace with our address
                                    to: '0x6e0E0e02377Bc1d90E8a7c21f12BA385C2C35f78',
                                    value: ethCostWei.toString(),
                                    gas: '3000000',
                                    data: '0x',
                                }).then((result) => {
                                    alert(result)
                                }).catch((error) => {
                                    console.error(error)
                                });
                            }
                        );
                    });
                }
            }
        }

        // Handling interaction from the Amazon cart page
        else if (message.from === 'cart') {
            switch (message.subject) {
                case 'checkSignedIn': {
                    //TODO: Check if user is signed in (Same code as in cart.js i think)
                } break;
                case 'notSignedIn': {
                    //TODO: Prompt user to sign in with metamask -- store wallet locally and send message that prompts us to check DB for wallet
                }
            }
        }
    });
})();