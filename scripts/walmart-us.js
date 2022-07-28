const ECommerceCart = require("./ECommerceCart");
// ALL CHANGES TO THIS FILE MUST BE COMPILED WITH "npm run buildWalmart"

class Walmart extends ECommerceCart.EcommerceCart {
  /**
   * Defines methods and handles the flow specific to Walmart's website.
   */
  constructor() {
    super();
  }

  injectButton(buttonLocation) {
    /**
         * Injects the pay with crypto button into Walmart's cart page.
         * @function injectButton

         */
    // Loads in button and aligns it.
    const buttonBox = document.querySelector(
      "#maincontent > div > div > div > div:nth-child(2) > div.flex.w-third.flex-column.ml3 > div > div > div:nth-child(1)"
    );
    buttonBox.style.alignItems = "center";
    buttonLocation.after(this.cryptoButton);
    buttonLocation.style.marginBottom = "10px";
    buttonLocation.style.paddingBottom = "5px";
  }

  getProducts() {
    /**
     * Parses Walmart's checkout page for the user's selected products.
     * @function getProducts
     * @return  {Object} Contains the products selected by the user.
     */

        // Fucking disgusting ass code lol
        let productDict = {};
        let productIndex = 0;
        let productElements = document.querySelector(
            "#maincontent > div > div > div > div:nth-child(2) > div.flex.w-two-thirds.flex-column.mr3 > div:nth-child(2) > div > div > div.flex.flex-column > section > div"
        );
        let productElementsList = Array.from(productElements.children);
        productElementsList.forEach(function (part, index) {
            let productCartSection = part.querySelector('div:nth-child(1) > div > ul');
            if (productCartSection != null) {
                let productCartSectionList = Array.from(productCartSection.children);
                productCartSectionList.forEach(function (part) {
                    try {
                    let productItem = part.querySelector('div:nth-child(3)');
                    console.log(productItem) 
                    let productInfo = productItem.querySelector('div:nth-child(1) > div > div');
                    let productID = productInfo.querySelector('a').getAttribute('href').split('/ip/seort/')[1];
                    let productName = productInfo.querySelector('a > h4 > div > span').innerText;
                    let unitPrice = productInfo.querySelector('div:nth-child(3) > div > div:nth-child(1) > span').innerText.split('$')[1];
                    let productQuantityString = productItem.querySelector('a').getAttribute('aria-label').split(' in cart')[0];
                    let productQuantity = productQuantityString.slice(productQuantityString.length - 1);
                    let productImage = productInfo.querySelector('a > img').getAttribute('srcset').split(' 1x')[0];
                    productDict[productIndex] = {
                        currency: 'USD',
                        productID: productID,
                        productName: productName,
                        unitPrice: parseFloat(unitPrice)/parseFloat(productQuantity),
                        quantity: productQuantity,
                        productImage: productImage,

                    };
                    productIndex++;
                } catch(err) {
                    try {
                    let productItem = part.querySelector('div:nth-child(2)');
                    console.log(productItem) 
                    let productInfo = productItem.querySelector('div:nth-child(1) > div > div');
                    let productID = productInfo.querySelector('a').getAttribute('href').split('/ip/seort/')[1];
                    let productName = productInfo.querySelector('a > h4 > div > span').innerText;
                    let unitPrice = productInfo.querySelector('div:nth-child(3) > div > div:nth-child(1) > span').innerText.split('$')[1];
                    let productQuantityString = productItem.querySelector('a').getAttribute('aria-label').split(' in cart')[0];
                    let productQuantity = productQuantityString.slice(productQuantityString.length - 1);
                    let productImage = productInfo.querySelector('a > img').getAttribute('srcset').split(' 1x')[0];
                    productDict[productIndex] = {
                        currency: 'USD',
                        productID: productID,
                        productName: productName,
                        unitPrice: parseFloat(unitPrice)/parseFloat(productQuantity),
                        quantity: productQuantity,
                        productImage: productImage,

                    };
                    productIndex++; }catch(err){
                        console.log(err)
                    }
                }
                });
            } else {
                let productCartSection2 = part.querySelector('div > div > ul');
                let productCartSection2List = Array.from(productCartSection2.children);
                productCartSection2List.forEach(function (part) {
                    let productItem = part.querySelector('div:nth-child(2)');
                    let productInfo = productItem.querySelector('div:nth-child(1) > div > div');
                    let productID = productInfo.querySelector('a').getAttribute('href').split('/ip/seort/')[1];
                    let productName = productInfo.querySelector('a > h4 > div > span').innerText;
                    let unitPrice = productInfo.querySelector('div:nth-child(3) > div > div:nth-child(1) > span').innerText.split('$')[1];
                    let productQuantityString = productItem.querySelector('a').getAttribute('aria-label').split(' in cart')[0];
                    let productQuantity = productQuantityString.slice(productQuantityString.length - 1);
                    let productImage = productInfo.querySelector('a > img').getAttribute('srcset').split(' 1x')[0];
                    productDict[productIndex] = {
                        currency: 'USD',
                        productID: productID,
                        productName: productName,
                        unitPrice: parseFloat(unitPrice)/parseFloat(productQuantity),
                        quantity: productQuantity,
                        productImage: productImage,
                    };
                    productIndex++;
                });
            }
        });
    console.log(productElements);
    return productDict;
  }

  getRetailer() {
    return "walmart";
  }
}

function main() {
    /**
     * Main runner function.
     * @function main
     */
    let walmart = new Walmart();
    walmart.createListeners();
    chrome.runtime.sendMessage({
        from: "cart",
        subject: "productData",
    });
    // Waits for page to fully load before injecting the button.
    const loadObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                if (mutation.addedNodes[0]) {
                    if (mutation.addedNodes[0].childNodes) {
                        if (mutation.addedNodes[0].childNodes[0].childNodes[0].id === "Continue to checkout button") {
                            console.log("injecting button");
                            walmart.injectButton(mutation.addedNodes[0].childNodes[0].childNodes[0]);
                        }
                    }
                }
            }
        });
    });
    const container = document.querySelector("#__next")
    let config = { attributes: true, childList: true, subtree: true, characterData: true };
    loadObserver.observe(container, config);
}

main();
