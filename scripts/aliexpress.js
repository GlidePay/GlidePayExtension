const ECommerceCart = require("./ECommerceCart");
// ALL CHANGES TO THIS FILE MUST BE COMPILED WITH "npm run buildAliExpress"

class aliExpress extends ECommerceCart.EcommerceCart {
    /**
     * Defines methods and handles the flow specific to Amazon's website.
     * See the following link (Amazon handles Amazon Flow).
     * https://lucid.app/lucidchart/86202d2d-3c46-49a6-89d9-a9164dd5f1ad/edit?invitationId=inv_d5751113-87f0-4abf-a8c3-6a076808331f&page=0_0#?referringapp=slack&login=slack
     */
    constructor() {
        super();
    }

    injectButton() {
        /**
         * Injects the pay with crypto button into AliExpress' checkout page.
         * @function injectButton

         */
        const add_to_cart = document.getElementsByClassName("comet-btn comet-btn-primary comet-btn-large comet-btn-block cart-summary-button");
        add_to_cart[0].style.marginBottom = "10px";
        add_to_cart[0].after(this.cryptoButton);
        const injected_button = document.getElementById("crypto-button")
        console.log('11'+ injected_button)
        injected_button.style.height = '100px'
        injected_button.style.width = '332px'
    }

    getProducts() {
        /**
         * Parses AliExpress' checkout page for the user's selected products.
         * @function getProducts
         * @return  {Object} Contains the products selected by the user.
         */
        let productDict = {};
        let productElements = document.getElementsByClassName("cart-product")
        /*
        let productElements = document.querySelectorAll(
            "#activeCartViewForm > div.a-section.a-spacing-mini.sc-list-body.sc-java-remote-feature > div.a-row.sc-list-item.sc-list-item-border.sc-java-remote-feature"
        );*/
        let productElementsList = Array.from(productElements);

        productElementsList.forEach(function (part, index, theArray) {

            const ASIN = part.getElementsByClassName("cart-product-name")[0].firstChild.outerHTML.split("https://www.aliexpress.com/item/")[1].split(".html")[0];
            const productName = part.getElementsByClassName("cart-product-name")[0].firstChild.innerHTML;
            const unitPrice = part.getElementsByClassName("cart-product-price")[0].firstChild.innerHTML.replace(/[^\d.-]/g, "");
            const quantity = part.getElementsByClassName("comet-input-number-input")[0].value;
            const productImage = part.getElementsByClassName("cart-product-img")[0].outerHTML.split('&quot;')[1];
            productDict[index] = {
                productID: ASIN,
                productName: productName,
                unitPrice: unitPrice,
                quantity: quantity,
                productImage: productImage,
            };
        });
        return productDict;
    }
}

function main() {
    /**
     * Main runner function.
     * @function main
     */
    let ali = new aliExpress();
    ali.createListeners();
    ali.injectButton();
    chrome.runtime.sendMessage({
        from: "cart",
        subject: "productData",
    });
    /*
    var observer = new MutationObserver(function(mutations) {
        ali.injectButton();
    })
    var container = document.getElementsByClassName("cart-body")[0];
    let config = { attributes: true, childList: true, subtree: true, characterData: true };
    observer.observe(container, config); */
}

main();