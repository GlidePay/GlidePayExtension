//TODO: This controller should create the correct window popup based on the need and context (Example: Confirmation cart vs
// Transaction failed page vs Account page vs Registration page)
(function () {
    chrome.runtime.onMessage.addListener((message, sender, response) => {
        if (message.from === 'cart') {
            switch (message.subject) {
                case 'createOrderPopup': {
                    //TODO: Integrate getting cart info (Raiyan's code would go here I assume)
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
                    // TODO: Make sure order popup has a confirm button that sends out a message from windowedpopup
                    //  with message promptTransaction
                } break;
                case 'createRegistrationPopup': {
                    // TODO: Create registration popup (Need DB integration first.)
                } break;
            }
        }
    });
})();