let userWallet;
chrome.runtime.onMessage.addListener((message, sender, response) => {
    if ((message.from === 'cart') && (message.subject === 'productData')) {
        chrome.pageAction.show(sender.tab.id);
    } else if ((message.from === 'cart') && (message.subject === 'checkSignedIn')) {
        if (userWallet === null) {
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
