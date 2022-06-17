const setProductInfo = products => {
    alert("CALLED!");// This pops up like a 10000 times? I dont know why.
    console.log(JSON.stringify(products));
    let i = 0;
    for (let value in products) {
        alert(i);
        const productSection = document.getElementById('productInfo')
        const image = document.createElement('img');
        alert(products[value]);
        image.src = products[value][2]
        const title = document.createElement('p');
        title.textContent = products[value][3]
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
