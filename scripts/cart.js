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
        var price = null;
        var xhr = new XMLHttpRequest();
        var url = 'https://www.amazon.com/dp/' + productId;
        xhr.open("GET", url);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 /* DONE */) {
                html = xhr.response
                if (html.includes("snsAccordionRowMiddle")){
                    price = html.split('a-offscreen">$')[3].split("</")[0];
                    return price;
                }
                else {
                    price = html.split('a-offscreen">')[1].split("</")[0];
                    return price;
                }
            }
          }
          xhr.send();
    }
    function getProducts() {
        //Following line may not work in firefox
        var productList = [];
        for (const a of document.querySelectorAll(".a-row.sc-list-item.sc-list-item-border.sc-java-remote-feature")) {
            //there is definitely a better way to do this
            productId = a.outerHTML.split('data-asin="')[1].split('" data-encoded-offering')[0];
            quantity = a.outerHTML.split('data-item-count="')[1].split('" data-item-index')[0];
            productList.push([productId, quantity]);
            alert(productList.toString());
        }
    }
    function defineEvent() {
        document.getElementById("crypto-button").addEventListener("click", function (event) {
            getProducts();
            
        });
    }
    alert(getPrice('B072BCNRTY'));
    addButton();
    defineEvent();
})();
