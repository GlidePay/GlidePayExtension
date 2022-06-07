(function () {
    function addButton() {
        var button = document.createElement("BUTTON");
        button.innerText = "Pay with crypto"
        button.value = "Pay with crypto.";
        button.id = "crypto-button";
        button.type = "button";
        
        var add_to_cart = document.getElementById("addToCart_feature_div");
        add_to_cart.appendChild(button);

    }
    function getProducts() {
        //Following line may not work in firefox
        var url = document.URL;
        alert(url.split('/')[5]);
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

