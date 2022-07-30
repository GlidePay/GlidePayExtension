const { LogError } = require("./LogError");
const ECommerceCart = require("./ECommerceCart");
// ALL CHANGES TO THIS FILE MUST BE COMPILED WITH "npm run buildCostco"

class Costco extends ECommerceCart.EcommerceCart {
    /**
     * Defines methods and handles the flow specific to Costco's website.
     * See the following link (Costco handles Costco Flow).
     * https://lucid.app/lucidchart/86202d2d-3c46-49a6-89d9-a9164dd5f1ad/edit?invitationId=inv_d5751113-87f0-4abf-a8c3-6a076808331f&page=0_0#?referringapp=slack&login=slack
     */
    constructor() {
        super();
    }

    injectButton() {
        /**
         * Injects the pay with crypto button into Costco's checkout page.
         * @function injectButton

         */
        console.log("injecting button");
        const buttonBox = document.querySelector('#checkout-button-wrapper');
        const add_to_cart = document.querySelector('#shopCartCheckoutSubmitButton');
        buttonBox.style.display = "flex";
        buttonBox.style.justifyContent = "center";
        buttonBox.style.flexDirection = "column";
        buttonBox.style.alignItems = "center";
        this.cryptoButton.style.marginTop = "10px";
        this.cryptoButton.style.marginBottom = "5px";
        add_to_cart.after(this.cryptoButton);
    }
    getProducts() {
        /**
         * Parses Costco's checkout page for the user's selected products.
         * @function getProducts
         * @return  {Object} Contains the products selected by the user.
         */
        let productDict = {};
        let productElements = document.querySelector(
            "#order-items-regular"
        );
        let groceryElements = document.querySelector(
            "#order-items-grocery"
        );

        let productElementsList = undefined;
        let groceryElementsList = undefined;
        try {
        productElementsList = Array.from(productElements.children);}
        catch{}
        try {
        groceryElementsList = Array.from(groceryElements.children);}
        catch{}
        let index = 0;
        if (productElementsList !== undefined) {
        productElementsList.forEach(function (part) {
            if (part.tagName === "DIV") {
                console.log(part)
                const product = part.querySelector('div > div:nth-child(1)');
                console.log(product);
                const productID = product.getAttribute("data-orderitemnumber");
                const productName = product.querySelector('div:nth-child(1) > div:nth-child(2) > h3 > a').innerText;
                console.log(product.getElementsByClassName('free-gift'))
                let unitPrice;
                try{
                unitPrice = product.querySelector('div:nth-child(1) > div:nth-child(2) > div:nth-child(7) > div > div > div:nth-child(1) > span > span').innerText;}
                catch {try {
                    unitPrice = product.querySelector('div:nth-child(1) > div:nth-child(2) > div:nth-child(6) > div > div > div:nth-child(1) > span > span').innerText;
                } catch{}}

                console.log(unitPrice)
                let quantity;
                try {
                quantity = product.querySelector('div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > input').value;
            console.log(quantity)}
                catch{try {
                    quantity = product.querySelector('div:nth-child(2) > div:nth-child(1) > div:nth-child(2)').innerHTML;
                    console.log(quantity)
                }catch{}}

                const productImage = product.querySelector('div:nth-child(1) > div:nth-child(1) > a > img').getAttribute("src");
                productDict[index] = {
                    currency: 'USD',
                    productID: productID,
                    productName: productName,
                    unitPrice: unitPrice,
                    quantity: quantity,
                    productImage: productImage,
                };
                index++;
            }
                });}
        if (groceryElementsList !== undefined) {
        groceryElementsList.forEach(function (part) {
            if (part.tagName === "DIV") {
                const product = part.querySelector('div > div:nth-child(1)');
                console.log(product);
                const productID = product.getAttribute("data-orderitemnumber");
                const productName = product.querySelector('div:nth-child(1) > div:nth-child(2) > h3 > a').innerText;
                const unitPrice = product.querySelector('div:nth-child(1) > div:nth-child(2) > div:nth-child(6) > div > div > div:nth-child(1) > span > span').innerText;
                const quantity = product.querySelector('div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > input').value;
                const productImage = product.querySelector('div:nth-child(1) > div:nth-child(1) > a > img').getAttribute("src");
                productDict[index] = {
                    currency: 'USD',
                    productID: productID,
                    productName: productName,
                    unitPrice: unitPrice,
                    quantity: quantity,
                    productImage: productImage,
                };
                index++;
            }
        });}
        console.log(productDict)
        return productDict;
    }

    getRetailer() {
            return 'costco'
    }
    getShipping(productDict) {
        let total = 0;
        for (let index in productDict) {
            total += parseFloat(productDict[index]["unitPrice"]) * parseFloat(productDict[index]["quantity"]);
        }
        if (total < 75.00) {
            return 3.00
        } else {
            return 0
        }
      }
}

function main() {
    /**
     * Main runner function.
     * @function main
     */
    let costco = new Costco();
    costco.createListeners();
    costco.injectButton();
    chrome.runtime.sendMessage({
        from: "cart",
        subject: "productData",
    });
    var observer = new MutationObserver(function(mutations) {
        console.log("Mutation detected");
        console.log(mutations);
        costco.injectButton();
    });
    var container = document.querySelector('#cart');
    console.log(container);
    let config = { attributes: true, subtree: true, characterData: true };
    observer.observe(container, config);
}

main();