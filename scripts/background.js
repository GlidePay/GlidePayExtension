chrome.runtime.onMessage.addListener((message, sender, response) => {
    // Is this deprecated? @Raiyan
    if ((message.from === 'cart') && (message.subject === 'productData')) {
        chrome.pageAction.show(sender.tab.id);
    }
});
