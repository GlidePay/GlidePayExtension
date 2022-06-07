(function () {
    function addButton() {
        var button = document.createElement("BUTTON");
        button.innerText = "Pay with crypto"
        button.value = "Pay with crypto.";
        button.id = "crypto-button";
        button.type = "button";

        var add_to_cart = document.getElementById("sc-buy-box-ptc-button");
        //add_to_cart.appendChild(button);
        add_to_cart.after(button);

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
    addButton();
    defineEvent();
})();
