const setProductInfo = products => {
    console.log("Receceived product info");
    console.log(JSON.stringify(products));
    let i = 0;
    const productSection = document.getElementById('productInfo')
    for (let value in products) {
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
    const confirmButton = document.createElement('button');
    confirmButton.setAttribute('class', 'btn btn-primary');
    confirmButton.textContent = 'Confirm Order';
    productSection.appendChild(confirmButton);
}

window.addEventListener('load', () => {
    chrome.windows.getAll({populate:true}, (windows) => {
        for (let a in windows) {
            for (let b in windows[a].tabs) {
                if (windows[a].tabs[b].url.includes('amazon.com')) {
                    chrome.tabs.sendMessage(windows[a].tabs[b].id, {from: 'popup', subject: 'needInfo'},
                        setProductInfo);
                    break;
                }
            }
        }
    });
});