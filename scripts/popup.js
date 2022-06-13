const setProductInfo = product => {
    document.getElementById("productInfo").textContent = product;
}
window.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {from: 'popup', subject: 'needInfo'},

            setProductInfo);
    })
});