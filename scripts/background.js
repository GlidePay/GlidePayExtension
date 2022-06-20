chrome.runtime.onMessage.addListener((message, sender, response) => {
    if ((message.from === 'cart')) {
        switch (message.subject) {
            case 'productData': {
                chrome.pageAction.show(sender.tab.id);
            } break;
            case 'checkSignedIn': {
                chrome.runtime.sendMessage({from: 'background', subject: 'metaSignIn'});
            } break;
            case 'createOrderPopup': {
                let top = 0;
                let left = message.screenSize - 720;
                try {
                    const lastFocused = chrome.getLastFocused()
                    top = lastFocused.top;
                } catch (e) {
                }
                chrome.windows.create({url:"views/confirmation.html", type: "popup", top: top, left: left,
                    width: 360, height: 620}, (window) => {
                });
            } break;
            case 'createRegistrationPopup': {
                // TODO: Create registration popup (Need DB integration first.)
            } break;
        }
    } else if (message.from === 'metamask-controller') {
        switch (message.subject) {
            case 'costInfo': {
            }
        }
    }
});

chrome.runtime.onMessage.addListener((message, sender, response) => {
    if ((message.from === 'cart') && (message.subject === 'promptTransaction')) {
        chrome.runtime.sendMessage({from: 'background', subject: 'promptTransaction', price: message.price});
    }
});
