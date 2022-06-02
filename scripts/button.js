(function () {
    function addButton() {
        var button = document.createElement("BUTTON");
        button.innerText = "Pay with crypto"
        button.value = "Pay with crypto.";
        button.id = "crypto-button";
        button.type = "button";
        
        //This is for the product page
        //var add_to_cart = document.getElementById("addToCart_feature_div");
        //add_to_cart.appendChild(button);

        for (const a of document.querySelectorAll("span")) {
            if (a.textContent.includes("Credit or debit cards")) {
              a.appendChild(button)
            }
          }
    }

    function defineEvent() {
        document.getElementById("crypto-button").addEventListener("click", function (event) {
            alert("Pay with crypto.");
        });
    }
    addButton();
    defineEvent();
})();

