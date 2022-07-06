chrome.runtime.onMessage.addListener((message, sender) => {
    if ((message.from === 'cart')) {
        switch (message.subject) {
            case 'productData': {
                chrome.pageAction.show(sender.tab.id);
            } break;
            case 'createOrderPopup': {
                let top = 0;
                let left = message.screenSize - 360;
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
                let top = 0;
                let left = 100;
                try {
                    const lastFocused = chrome.getLastFocused()
                    top = lastFocused.top;
                } catch (e) {
                }
                chrome.windows.create({url:"views/registration.html", type: "popup", top: top, left: left,
                    width: 360, height: 620}, (window) => {
                });
            } break;
            case 'storeUser': {
                storeSession('userid', message.userid);
            } break;
            case 'getUser': {
                getSession('userid');
            } break;
        }
    }
});

// Store a variable in chrome session storage.
function storeSession(key, value) {
    chrome.storage.session.set({
        [key]: value,
    }, function () {
        console.log('Value is set to ' + value);
    });
}

// Access a variable in chrome session storage.
function getSession(key) {
    chrome.storage.session.get(key, function(result) {
        return result[key];
    });
}