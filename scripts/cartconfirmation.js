const setProductInfo = products => {
    console.log("Receceived product info");
    console.log(JSON.stringify(products));
    let i = 0;
    for (let value in products) {
        const productSection = document.getElementById('productInfo')
        const image = document.createElement('img');
        image.src = products[value][2]
        const title = document.createElement('p');
        title.textContent = products[value][0]
        image.setAttribute('height', '100px');
        image.setAttribute('width', '100px');
        productSection.appendChild(image);
        productSection.appendChild(title);
        i++;
    }
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