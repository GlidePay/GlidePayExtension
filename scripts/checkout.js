(function () {
    function addButton() {
        var button = document.createElement("BUTTON");
        button.innerText = "Pay with crypto"
        button.value = "Pay with crypto.";
        button.id = "crypto-button";
        button.type = "button";


        for (const a of document.querySelectorAll("span")) {
            if (a.textContent.includes("Credit or debit cards")) {
                a.appendChild(button)
            }
        }

        var a = document.querySelector(".a-row.place-order-button")
        a.after(button)
    }
    function getProducts() {
        document.querySelectorAll("[name=dupOrderCheckArgs]");
        var productList = [];
        for (const a of document.querySelectorAll("[name=dupOrderCheckArgs]")) {
            productInfo = a.value.split('|');
            productList.push([productInfo[0], productInfo[1]]);
            alert(productList.toString());
        }
        return productList;
    }
    function getPrice(productId, quantity) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://www.amazon.com/dp/B000GIQSVG");
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 /* DONE */) {
               alert(xhr.responseText.length);
            }
          }
          xhr.send();

    }
    function defineEvent() {
        document.getElementById("crypto-button").addEventListener("click", function (event) {
            var productList = getProducts();
        });
    }
    getPrice();
    addButton();
    defineEvent();
})();
