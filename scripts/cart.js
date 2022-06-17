(function () {
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
                    console.log("PRODUCT DICK" + JSON.stringify(productDict));
                }
                console.log("Product Dict: " + JSON.stringify(productDict));
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

    function checkSignedIn() {
        chrome.runtime.sendMessage({from: 'cart', subject: 'checkSignedIn'});
    }

    function checkAccount() {
        alert('We would query DB for account here');
        return true;
    }

    function defineEvent() {
        document.getElementById("crypto-button").addEventListener("click", function (event) {
            // Should check if signed in
            getProducts();
            checkSignedIn();
            if (checkAccount()) {
                //TODO: Refactor this so that it passes cart info to the windowpopup
                chrome.runtime.sendMessage(
                    {
                        from: 'cart',
                        subject: 'createOrderPopup',
                        //cart: getProducts() <-- Something like this? Although I think we can only pass strings as a
                        // message so we'll need to convert the array to a string or JSON or something.
                        screenSize: screen.width
                    }
                )
            }
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
