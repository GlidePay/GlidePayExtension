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
        //Following line may not work in firefox
        let productList = [];
        let div_list = document.querySelectorAll("div.a-section.a-spacing-mini.sc-list-body.sc-java-remote-feature > .a-row.sc-list-item.sc-list-item-border.sc-java-remote-feature");
        let div_array = [...div_list];
        console.log("colog1" + productList.toString());
        for (let i = 0; i < div_array.length; i++) {
            console.log("colog" + div_array[i].outerHTML);
            let product_id = div_array[i].outerHTML.split('data-asin="')[1].split('" data-encoded-offering')[0];
            let quantity = div_array[i].outerHTML.toString().split('data-item-count="')[1].split('" data-item-index')[0];
            productList.push([product_id, quantity]);
            alert(productList.toString());
        }
        alert(productList.toString())
        doSomethingWithProducts(productList);
    }

    function doSomethingWithProducts(productList){
        alert(productList.toString());
    }

    function defineEvent() {
        document.getElementById("crypto-button").addEventListener("click", function (event) {
            alert("clicked");
            getProducts();
            testOrder();
        });
    }
    getPrice('B072BCNRTY');
    addButton();
    defineEvent();
})();
