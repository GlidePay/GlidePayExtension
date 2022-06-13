(function () {
    function addButton() {
        var button = document.createElement("INPUT");
        button.id = "crypto-button";
        button.type = "image";
        button.src = "https://bafkreiefcusjpozsmnfhtnsfgms33xlbyiwzjf3g7ugdosisfqwukxg5xy.ipfs.nftstorage.link/";
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
        alert(price);
    }

    function testOrder() {

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
        alert("dosomething" + productList.toString());
    }

    function checkSignedIn() {
        if (window.userWalletAddress !== undefined) {
            alert(window.userWalletAddress);
            alert("You are signed in!");
        } else {
            alert(window.userWalletAddress);
            alert("You are not signed in!");
        }
    }

    function defineEvent() {
        document.getElementById("crypto-button").addEventListener("click", function (event) {
            checkSignedIn();
            getPrice('B089ST5SB6');
            getProducts();
            testOrder();
        });
    }
    addButton();
    defineEvent();
})();
