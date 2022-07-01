const setProductInfo = products => {
    console.log("Receceived product info");
    console.log(JSON.stringify(products));
    let i = 0;
    const productSection = document.getElementById('productInfo');
    let totalprice = 0;
    for (let value in products) {
        totalprice += parseFloat(products[value][1]) * parseInt(products[value][0]);
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
    confirmButton.addEventListener('click', () => {
        lambdaTest();
        chrome.windows.getAll({populate:true}, (windows) => {
            for (let a in windows) {
                for (let b in windows[a].tabs) {
                    if (windows[a].tabs[b].url.includes('amazon.com/gp/cart')) {
                        chrome.tabs.sendMessage(windows[a].tabs[b].id, {
                            from: 'popup',
                            subject: 'promptTransaction',
                            price: totalprice});
                        break;
                    }
                }
            }
        });
    });
    productSection.appendChild(confirmButton);
}

function lambdaTest() {
    fetch('https://a5w54in31c.execute-api.us-east-1.amazonaws.com/default/omarpython', {
        method: 'post',
    })
        .then(response => response.text())
        .then(data => {
            console.log(data);
            //use keys
        });
}

window.addEventListener('load', () => {
    chrome.windows.getAll({populate:true}, (windows) => {
        for (let a in windows) {
            for (let b in windows[a].tabs) {
                if (windows[a].tabs[b].url.includes('amazon.com/gp/cart')) {
                    chrome.tabs.sendMessage(windows[a].tabs[b].id, {from: 'popup', subject: 'needInfo'},
                        setProductInfo);
                    break;
                }
            }
        }
    });
});