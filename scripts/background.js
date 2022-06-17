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
                //TODO: Integrate getting cart info (Raiyan's code would go here I assume)
                // TODO: Make sure order popup has a confirm button that sends out a message from windowedpopup
                //  with message promptTransaction
                let top = 0;
                let left = message.screenSize - 360; //300 is width of extension
                try {
                    const lastFocused = chrome.getLastFocused()
                    top = lastFocused.top;
                } catch (e) {
                }
                chrome.windows.create({url:"views/popup.html", type: "popup", top: top, left: left,
                    width: 360, height: 620}, (window) => {
                });
            } break;
            case 'createRegistrationPopup': {
                // TODO: Create registration popup (Need DB integration first.)
            } break;
        }
    } else if (message.from === 'popup') {
        switch (message.subject) {
            case 'promptTransaction': {
                //TODO: Integrate passing cart price to the metamask controller page
                chrome.runtime.sendMessage({from: 'background', subject: 'promptTransaction'});
            } break;
            case 'needInfo': {

            }
        }
    } else if (message.from === 'metamask-controller') {
        switch (message.subject) {
            case 'costInfo': {

            }
        }
    }
});
