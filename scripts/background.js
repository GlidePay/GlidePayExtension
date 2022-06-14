let userWallet;
chrome.runtime.onMessage.addListener((message, sender, response) => {
    if ((message.from === 'cart') && (message.subject === 'openPopup')) {
        let top = 0;
        let left = 0;
        try {
            const lastFocused = chrome.getLastFocused()
            top = lastFocused.top;
            left = lastFocused.left + (lastFocused.width - 250);
        } catch (e) {
        }
        chrome.windows.create({url:"views/popup.html", type: "popup", top: top, left: left,
            width: 300, height: 300});
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
