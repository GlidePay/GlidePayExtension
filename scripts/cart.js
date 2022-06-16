(function () {
    function addButton() {
        var button = document.createElement("INPUT");
        button.id = "crypto-button";
        button.type = "image";
        button.src = "https://bafkreiflbuggpczchtd2elv5qqhyks27ujz6hihi4xxzrp5kxu3psd4qce.ipfs.nftstorage.link/";
        button.style.cssText = "height: 79px; width: 260px"
        var add_to_cart = document.getElementById("gutterCartViewForm");
        //var add_to_cart = document.getElementById("sc-buy-box-ptc-button");
        //add_to_cart.appendChild(button);
        add_to_cart.after(button);
        document.getElementById("gutterCartViewForm").style.marginBottom = '10px';
        document.getElementById("sc-buy-box").style.paddingBottom = '5px';
    }

    function getPrice(productId) {
        var price = 0;
        var xhr = new XMLHttpRequest();
        var url = 'https://www.amazon.com/dp/' + productId;
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200/* DONE */) {
                html = xhr.response
                if (html.includes("snsAccordionRowMiddle")){
                    price = html.split('a-offscreen">$')[3].split("</")[0];
                    doSomethingWithPrice(price);
                }
                else {
                    price = html.split('a-offscreen">')[1].split("</")[0];
                    doSomethingWithPrice(price);
                }
            }
        }
        xhr.open("GET", url, true);
        xhr.send("");
    }

    function doSomethingWithPrice(price){
    }

    function getProducts() {
        var productList = [];
        var xhr = new XMLHttpRequest();
        xhr.responseType = "document";
        var url = 'https://www.amazon.com/gp/cart/view.html';
        xhr.onreadystatechange = async function() {
            if (xhr.readyState === 4 && xhr.status === 200/* DONE */) {
                html = xhr.response
                let div_list = html.querySelectorAll("div.a-section.a-spacing-mini.sc-list-body.sc-java-remote-feature > .a-row.sc-list-item.sc-list-item-border.sc-java-remote-feature");
                let div_array = [...div_list];
                for (let i = 0; i < div_array.length; i++) {
                        console.log("colog" + div_array[i].outerHTML);
                        let product_id = div_array[i].outerHTML.split('data-asin="')[1].split('" data-encoded-offering')[0];
                        let quantity = div_array[i].outerHTML.toString().split('data-quantity="')[1].split('" data-subtotal')[0];
                        productList.push([product_id, quantity]);
                        console.log("Colog2" + productList);
                }
                doSomethingWithProducts(productList);
            }
        }
        xhr.open("GET", url, true);
        xhr.send("");
    }

    function doSomethingWithProducts(productList){
        chrome.runtime.onMessage.addListener((msg, sender, response) => {
            if ((msg.from === 'popup') && (msg.subject === 'needInfo')) {
                console.log('received');
                response(productList.toString());
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
    getProducts();
})();
