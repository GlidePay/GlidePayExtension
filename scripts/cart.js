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
        var a = document.querySelectorAll(".a-row.sc-list-item.sc-list-item-border.sc-java-remote-feature");
        alert(a[1].outerHTML);
    }
    function defineEvent() {
        document.getElementById("crypto-button").addEventListener("click", function (event) {
            alert("Pay with crypto.");
        });
    }
    getProducts();
    addButton();
    defineEvent();
})();

