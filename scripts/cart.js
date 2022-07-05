// ALL CHANGES TO THIS FILE MUST BE COMPILED WITH "npm run buildCart"
(function () {
    const createProvider = require('metamask-extension-provider');
    const Web3 = require('web3');
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

    chrome.runtime.onMessage.addListener((msg) => {
        //TODO: Have this function call the createOrderRDS Lambda function
        if (msg.from === 'popup' && msg.subject === 'promptTransaction') {
            const web3 = new Web3(provider);
            const usdCost = msg.price;
            //TODO: Replace this with a more secure way of calling the API.
            const key = '2c103fd3455f8aa304a0c71c05bb7b44f12471bae3edaf0f943afbf086719dcb';
            axios.get(`https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD` + '&api_key={' + key + '}').then(
                function (response) {
                    const ethCost = response.data.USD;
                    const ethFinal = usdCost / ethCost;
                    web3.eth.sendTransaction({
                        from: provider.selectedAddress,
                        to: '0xB5EC5c29Ed50067ba97c4009e14f5Bff607a324c',
                        value: ethFinal * 1000000000000000000,
                    }).on(('error'), function (error) {
                        console.log(error.stack);
                    }).on(('transactionHash'), function (txHash) {
                        console.log(txHash);
                        fetch ('https://u1krl1v735.execute-api.us-east-1.amazonaws.com/default/getTransaction', {
                            method: 'post',
                            body: txHash
                        }).then(response => response.text()).then(data => {
                            console.log("Transaction hash: " + txHash + "Result: " + data);
                        }).catch(error => {
                            console.log(error.stack);
                        });
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
        // Checks if account exists, if not creates one.
        console.log("WALLET: " + wallet);
        fetch ("https://de1tn2srhk.execute-api.us-east-1.amazonaws.com/default/findUserByWalletRDS", {
                method: 'POST',
                body: JSON.stringify({
                    wallet,
                })
            }).then(response => response.text()).then(data => {
                console.log("DATA" + data);
                if (data === "") {
                    //TODO: My metamask wallet is already in DB, figure out how to test this.
                    //TODO: Registration prompt.
                    chrome.runtime.sendMessage({
                        from: 'popup',
                        subject: 'promptRegistration',
                    });
                    fetch ("https://kyr8ehszh2.execute-api.us-east-1.amazonaws.com/default/createUserRDS", {
                            method: 'POST',
                            body: JSON.stringify({
                                wallet,
                            })
                    }).then(response => response.text()).then(data => {
                        //TODO: Test the parsing of this data to make sure it works.
                        chrome.runtime.sendMessage({
                            from: 'cart',
                            subject: 'storeUser',
                            userid: JSON.parse(data).User_ID,
                        });
                        return data;
                    });
                } else {
                    // This works perfectly.
                    chrome.runtime.sendMessage({
                        from: 'cart',
                        subject: 'storeUser',
                        userid: JSON.parse(data).User_ID,
                    });
                    return data;
                }
        });
    }

    function addRegistrationButton() {
        let button = document.createElement("INPUT");
        button.id = "register-button";
        button.type = "image";
        button.src = "https://www.metamask.io/images/metamask-logo-icon.png";
        button.style.cssText = "height: 79px; width: 260px"
        let add_to_cart = document.getElementById("crypto-button");
        add_to_cart.after(button);
        document.getElementById("gutterCartViewForm").style.marginBottom = '10px';
        document.getElementById("sc-buy-box").style.paddingBottom = '5px';
    }

    function defineEvent() {
        document.getElementById("crypto-button").addEventListener("click", function (event) {
            // Should check if signed in
            checkSignedIn().then(() => {
                chrome.runtime.sendMessage(
                    {
                        from: 'cart',
                        subject: 'createOrderPopup',
                        screenSize: screen.width
                    }
                )
                getProducts();
            }, () => {
            });
        });
    }

    function defineRegistrationEvent() {
        document.getElementById("register-button").addEventListener("click", function (event) {
            alert('Registration button');
            chrome.runtime.sendMessage(
                {
                    from: 'cart',
                    subject: 'createRegistrationPopup',
                }
            )
        });
    }

    addButton();
    addRegistrationButton();
    defineEvent();
    defineRegistrationEvent();
    chrome.runtime.sendMessage(
        {
            from: 'cart',
            subject: 'productData',
        });
})();
