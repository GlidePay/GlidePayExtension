// ALL CHANGES TO THIS FILE MUST BE COMPILED WITH "npm run buildCart"
(function () {
    const createProvider = require('metamask-extension-provider')
    const Eth = require('ethjs')
    const axios = require("axios");
    const provider = createProvider();

    function addButton() {
        let button = document.createElement("INPUT");
        button.id = "crypto-button";
        button.type = "image";
        button.src = "https://bafkreiflbuggpczchtd2elv5qqhyks27ujz6hihi4xxzrp5kxu3psd4qce.ipfs.nftstorage.link/";
        button.style.cssText = "height: 79px; width: 260px"
        let add_to_cart = document.getElementById("gutterCartViewForm");
        add_to_cart.after(button);
        document.getElementById("gutterCartViewForm").style.marginBottom = '10px';
        document.getElementById("sc-buy-box").style.paddingBottom = '5px';
    }

    function getProducts() {
        console.log('yo');
        let productDict = {};
        let xhr = new XMLHttpRequest();
        xhr.responseType = "document";
        let url = 'https://www.amazon.com/gp/cart/view.html';
        xhr.onreadystatechange = async function() {
            if (xhr.readyState === 4 && xhr.status === 200/* DONE */) {
                let html = xhr.response
                let div_list = html.querySelectorAll("div.a-section.a-spacing-mini.sc-list-body.sc-java-remote-feature > .a-row.sc-list-item.sc-list-item-border.sc-java-remote-feature");
                let img_list = html.querySelectorAll("div.a-section.a-spacing-mini.sc-list-body.sc-java-remote-feature > .a-row.sc-list-item.sc-list-item-border.sc-java-remote-feature > .sc-list-item-content > .a-row.a-spacing-base.a-spacing-top-base > .a-column.a-span10 > .a-fixed-left-grid > .a-fixed-left-grid-inner > .a-fixed-left-grid-col.a-float-left.sc-product-image-desktop.a-col-left > .a-link-normal.sc-product-link");
                let div_array = [...div_list];
                let img_array = [...img_list];
                for (let i = 0; i < div_array.length; i++) {
                    let product_id = div_array[i].outerHTML.split('data-asin="')[1].split('" data-encoded-offering')[0];
                    let quantity = div_array[i].outerHTML.toString().split('data-quantity="')[1].split('" data-subtotal')[0];
                    let price = div_array[i].outerHTML.toString().split('data-price="')[1].split('" data-quantity')[0];
                    let img = img_array[i].outerHTML.toString().split('src="')[1].split('"')[0];
                    productDict[product_id] = [quantity, price, img, ''];
                }
                sendMessage(productDict)
            }
        }
        xhr.open("GET", url, true);
        xhr.send("");
    }

    function sendMessage(productDict){
        chrome.runtime.onMessage.addListener((msg, sender, response) => {
            if (msg.from === 'popup' && msg.subject === 'needInfo') {
                console.log('test2');
                response(productDict);
            }
        });
    }

    chrome.runtime.onMessage.addListener((msg, sender, response) => {
        if (msg.from === 'popup' && msg.subject === 'promptTransaction') {
            const eth = new Eth(provider);
            const usdCost = msg.price;
            //TODO: Replace this with a more secure way of calling the API.
            const key = '2c103fd3455f8aa304a0c71c05bb7b44f12471bae3edaf0f943afbf086719dcb';
            axios.get(`https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD` + '&api_key={' + key + '}').then(
                function (response) {
                    const ethCost = response.data.USD;
                    const ethFinal = usdCost / ethCost;
                    eth.sendTransaction({
                        from: provider.selectedAddress,
                        to: '0xB5EC5c29Ed50067ba97c4009e14f5Bff607a324c',
                        value: ethFinal * 1000000000000000000,
                        data: provider.selectedAddress,
                    }).then((result) => {
                        alert('Transaction sent!');
                        console.log(result);
                        //TODO: Send transaction hash to lambda server. We also need to, at this point,
                        // send the cart info to the lambda server so that it can be ordered with ZincAPI if the
                        // transaction is successful.
                    });
                });
        }
    });

    async function checkSignedIn() {
        try {
            const accounts = await Promise.all([
                provider.request({
                    method: 'eth_requestAccounts',
                }),
            ])
            if (!accounts) {
                alert('Please sign in to MetaMask.');
            } else {
                return checkAccount(accounts[0]);
            }
        } catch (err) {
            console.log(err);
        }
    }

    function checkAccount(wallet) {
        console.log("WALLET: " + wallet);
        fetch ("https://de1tn2srhk.execute-api.us-east-1.amazonaws.com/default/findUserByWalletRDS", {
                method: 'POST',
                body: JSON.stringify({
                    wallet,
                })
            }).then(response => response.text()).then(data => {
                console.log("DATA" + data);
        });
    }

    function defineEvent() {
        document.getElementById("crypto-button").addEventListener("click", function (event) {
            // Should check if signed in
            checkSignedIn().then((res) => {
                if (res) {
                    //TODO: Refactor this so that it passes cart info to the windowpopup
                    chrome.runtime.sendMessage(
                        {
                            from: 'cart',
                            subject: 'createOrderPopup',
                            // cart: getProducts() <-- Something like this? Although I think we can only pass strings as a
                            // message so we'll need to convert the array to a string or JSON or something.
                            screenSize: screen.width
                        }
                    )
                } else {
                    alert('Would prompt to register here.');
                }
                getProducts();
            }, () => {
                alert('You must be signed in to use this feature.');
            });
        });
    }
    addButton();
    defineEvent();
    chrome.runtime.sendMessage(
        {
            from: 'cart',
            subject: 'productData',
        });
})();
