const setProductInfo = product => {
        console.log(product);
}
window.addEventListener('DOMContentLoaded', () => {
        chrome.windows.getAll({populate:true}, (windows) => {
            windows.forEach((window) => {
              window.tabs.forEach((tab) => {
                console.log(tab.id);
                chrome.tabs.sendMessage(
                    tab.id,
                    {from: 'popup', subject: 'needInfo'},
                    setProductInfo);
            });
            });
          });
          

});