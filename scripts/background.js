chrome.runtime.onMessage.addListener((message, sender) => {
    if ((message.from === 'cart') && (message.subject === 'productData')) {
        chrome.pageAction.show(sender.tab.id);
    }
});
