// ALL CHANGES TO THIS FILE MUST BE COMPILED WITH "npm run buildCart"
(function () {
    const createProvider = require('metamask-extension-provider');
    const Web3 = require('web3');
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

    async function getProducts() {
        return new Promise((resolve, reject) => {
            let productDict = {};
            let xhr = new XMLHttpRequest();
            xhr.responseType = "document";
            let url = 'https://www.amazon.com/gp/cart/view.html';
            xhr.onreadystatechange = async function() {
                if (xhr.readyState === 4 && xhr.status === 200/* DONE */) {
                    let html = xhr.response
                    let div_list = html.querySelectorAll(
                        "div.a-section.a-spacing-mini.sc-list-body.sc-java-remote-feature > .a-row.sc-list-item.sc-list-item-border.sc-java-remote-feature"
                    );
                    let img_list = html.querySelectorAll(
                        "div.a-section.a-spacing-mini.sc-list-body.sc-java-remote-feature > .a-row.sc-list-item.sc-list-item-border.sc-java-remote-feature > .sc-list-item-content > .a-row.a-spacing-base.a-spacing-top-base > .a-column.a-span10 > .a-fixed-left-grid > .a-fixed-left-grid-inner > .a-fixed-left-grid-col.a-float-left.sc-product-image-desktop.a-col-left > .a-link-normal.sc-product-link"
                    );
                    let div_array = [...div_list];
                    let img_array = [...img_list];
                    for (let i = 0; i < div_array.length; i++) {
                        let divHTML = new DOMParser().parseFromString(
                            div_array[i].outerHTML,
                            "text/xml"
                        );
                        let productDiv = divHTML.getElementsByClassName(
                            "a-row sc-list-item sc-list-item-border sc-java-remote-feature"
                        )[0];
                        let product_id = productDiv.getAttribute("data-asin");
                        let quantity = productDiv.getAttribute("data-quantity");
                        let price = productDiv.getAttribute("data-price");
                        let imgInnterHTML = new DOMParser().parseFromString(
                            img_array[i].innerHTML,
                            "text/xml"
                        );
                        let productImg = imgInnterHTML.getElementsByTagName("img")[0];
                        let img = productImg.getAttribute("src");
                        productDict[product_id] = [quantity, price, img, ''];
                    }
                    sendProducts(productDict)
                    resolve("true");
                }
            }
            xhr.open("GET", url, true);
            xhr.send("");
        });
    }

    function sendProducts(productDict){
        chrome.runtime.onMessage.addListener((msg, sender, response) => {
            if (msg.from === 'popup' && msg.subject === 'needInfo') {
                console.log('test2');
                response(productDict);
            }
        });
    }

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.from === 'popup' && msg.subject === 'promptTransaction') {
            const web3 = new Web3(provider);
            const usdCost = msg.price;
            //TODO: Replace this with a more secure way of calling the API.
            chrome.runtime.sendMessage({
                from: 'cart',
                subject: 'getCoinPrice',
                coin: 'ethusd'
            }, (price) => {
                console.log("PRICE" + JSON.stringify(price));
                const ethCost = usdCost / price;
                console.log("ETHCOST" + ethCost);
                web3.eth.sendTransaction({
                    from: provider.selectedAddress,
                    to: '0xB5EC5c29Ed50067ba97c4009e14f5Bff607a324c',
                    value: ethCost * 1000000000000000000,
                }).on(('error'), (err) => {
                    console.log(err);
                }).on(('transactionHash'), (txHash) => {
                    chrome.runtime.sendMessage({
                        from: 'cart',
                        subject: 'getUser',
                    }).then((user) => {
                        console.log("ETHUSER" + user);
                        const body = {
                            user: user,
                            txHash: txHash,
                            wallet: provider.selectedAddress,
                            retailer: 'Amazon',
                            productidsarr: msg.products,
                            addressid: msg.addressid,
                            status: 'Transaction Pending Confirmation.',
                            ticker: 'ETH', //TODO: In future this needs to be changed to the ticker of the coin being used.
                            amount: ethCost,
                        }
                        chrome.runtime.sendMessage({
                            from: 'cart',
                            subject: 'getTransaction',
                            body: body,
                        }).catch((err) => {
                            console.log(err);
                        });
                    });
                })
            });
        }
    });

    async function checkSignedIn() {
        const payWithCryptoButton = document.getElementById("crypto-button");
        payWithCryptoButton.disabled = true;
        return new Promise((resolve, reject) => {
            const web3 = new Web3(provider);
            web3.eth.getAccounts(function (err, accounts) {
                if (err) {
                    payWithCryptoButton.disabled = false;
                    console.log(err);
                    reject(err);
                } else if (accounts.length === 0) {
                    payWithCryptoButton.disabled = false;
                    console.log('No accounts found');
                    reject('No accounts found');
                } else {
                    payWithCryptoButton.disabled = false;
                    checkAccount(accounts[0]);
                    resolve();
                }
            });
        });
    }

    function checkAccount(wallet) {
        // Checks if account exists, if not creates one.
        console.log("WALLET: " + wallet);
        chrome.runtime.sendMessage({
            from: 'cart',
            subject: 'findUserByWallet',
            wallet: wallet,
        }, (user) => {
            console.log("USER: " + JSON.stringify(user) + " WALLET: " + wallet);
            if (user === null) {
                chrome.runtime.sendMessage({
                    from: 'cart',
                    subject: 'createUserByWallet',
                    wallet: wallet,
                }).catch((err) => {
                    console.log(err);
                });
                chrome.runtime.sendMessage({
                    from: 'cart',
                    subject: 'createRegistrationPopup',
                    wallet: wallet,
                }).catch((err) => {
                    console.log(err);
                });
            } else {
                chrome.runtime.sendMessage({
                    from: 'cart',
                    subject: 'storeUser',
                    userid: user,
                });
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
        const payWithCryptoButton = document.getElementById("crypto-button");
        document
            .getElementById("crypto-button")
            .addEventListener("click", function (event) {
                // Should check if signed in
                checkSignedIn()
                    .then(() => {
                        console.log("Getting products");
                        getProducts.then(() => {
                            console.log("Creating popup");
                            chrome.runtime.sendMessage({
                                from: "cart",
                                subject: "createOrderPopup",
                                screenSize: screen.width,
                            });
                        });
                    })
                    .catch(() => {
                        provider
                            .request({method: "eth_accounts"})
                            .then(() => {
                                console.log("Logged in");
                                getProducts().then((message) => {
                                    chrome.runtime.sendMessage({
                                        from: "cart",
                                        subject: "createOrderPopup",
                                        screenSize: screen.width,
                                    });
                                });
                            })
                            .catch(() => {
                                console.log("NOt logged in");
                                payWithCryptoButton.disabled = false;
                            });
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
