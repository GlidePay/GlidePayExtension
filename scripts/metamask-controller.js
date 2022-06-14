//TODO: Integrate this with the rest of the extension (Maybe call it from background.js? or have it be a content script? idk)
const createProvider = require('metamask-extension-provider')
const Eth = require('ethjs')
const provider = createProvider();
(function () {
    const eth = new Eth(provider);
    chrome.runtime.onMessage.addListener((message, sender, response) => {

        // Handling interaction with the windowed popup (Example: Confirmation cart)
        if (message.from === 'windowpopup') {
            switch (message.subject) {
                case 'promptTransaction': {
                    chrome.runtime.sendMessage({from: 'metamask-controller', subject: 'costInfo', account: message.account}, function (result) {
                        //TODO: Take costinfo --> convert to wei --> create transaction --> prompt user to confirm transaction
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