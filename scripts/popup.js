const setProductInfo = products => {
    console.log(JSON.stringify(products));
    for (let value in products) {
        const productSection = document.getElementById('productInfo')
        const image = document.createElement('img');
        image.src = products[value][2]
        const title = document.createElement('p');
        title.textContent = products[value][3]
        productSection.appendChild(image);
        productSection.appendChild(title);

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
