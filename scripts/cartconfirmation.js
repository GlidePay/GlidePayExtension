//TODO: Load in all saved addresses and display them as selectable options
//TODO: Think about how we should handle it if someone tries to order to an address the product doesnt ship to
function getAddresses(userid) {
    fetch('https://vshqd3sv2c.execute-api.us-east-1.amazonaws.com/default/getAddressesRDS', {
        method: 'post',
        body: JSON.stringify({userid: userid})
    }).then(response => response.json())
        .then(responseData => {
            console.log(responseData);
            const addressSelect = document.getElementById('addressSelect');
            for (let i = 0; i < responseData.length; i++) {
                const option = document.createElement('option');
                const addressString = responseData[i].Address_Line_1 + " " + responseData[i].Address_Line_2 + " " + responseData[i].City + " " + responseData[i].Province_State + " " + responseData[i].Zip_Postal_Code + " " + responseData[i].Country + " " + responseData[i].Phone_Number;
                option.textContent = addressString.substring(0, 20) + "...";
                option.value = responseData[i].Address_ID;
                addressSelect.appendChild(option);
            }
        });
}

const setProductInfo = products => {
    console.log("Receceived product info");
    console.log(JSON.stringify(products));
    let i = 0;
    const productSection = document.getElementById('productInfo');
    let totalPrice = 0;
    for (let value in products) {
        totalPrice += parseFloat(products[value][1]) * parseInt(products[value][0]);
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
        chrome.windows.getAll({populate:true}, (windows) => {
            for (let a in windows) {
                for (let b in windows[a].tabs) {
                    if (windows[a].tabs[b].url.includes('amazon.com/gp/cart')) {
                        chrome.tabs.sendMessage(windows[a].tabs[b].id, {
                            from: 'popup',
                            subject: 'promptTransaction',
                            price: totalPrice});
                        break;
                    }
                }
            }
        });
        //TODO: This needs to pass order info to the promptTransaction function
    });
    chrome.storage.session.get('userid', function(result) {
        console.log(JSON.parse(result['userid']));
        console.log("GOTUSERID");
        getAddresses(result.userid);
    });
    productSection.appendChild(confirmButton);
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