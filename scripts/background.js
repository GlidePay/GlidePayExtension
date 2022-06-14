let userWallet;
let _popupId;
chrome.runtime.onMessage.addListener((message, sender, response) => {
    //TODO: Replace this with a switch statement
    if ((message.from === 'cart') && (message.subject === 'openPopup')) {
        let top = 0;
        let left = message.screenSize - 360; //300 is width of extension
        try {
            const lastFocused = chrome.getLastFocused()
            top = lastFocused.top;
        } catch (e) {
        }
        chrome.windows.create({url:"views/popup.html", type: "popup", top: top, left: left,
            width: 360, height: 620}, (window) => {
            _popupId = window.id;
        });
    }
    if ((message.from === 'cart') && (message.subject === 'productData')) {
        chrome.pageAction.show(sender.tab.id);
    } else if ((message.from === 'cart') && (message.subject === 'checkSignedIn')) {
        if (userWallet === null || userWallet === undefined) {
            response('notSignedIn');
        } else {
            response('alreadySignedIn');
        }
    } else if ((message.from === 'cart' || message.from === 'registration') && (message.subject === 'signedIn')) {
        userWallet = message.account;
    } else if ((message.from === 'cart' || message.from === 'registration') && (message.subject === 'signedOut')) {
        userWallet = null;
    } else if ((message.from === 'registration') && (message.subject === 'needAccount')) {
        response({userWalletAddress: userWallet});
    }
});
