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

  async getProducts() {
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
                    console.log("PRODUCT ITEM")
                    console.log(productItem);
                    let productInfo = productItem.querySelector('div:nth-child(1) > div > div:nth-child(2)');
                    console.log("PRODUCT INFO1")
                    console.log(productInfo);
                    console.log("QUERY TEST");
                    console.log(productInfo.querySelector('div'));
                    let productID = productInfo.querySelector('div > div > div:nth-child(2) > a').getAttribute('href').split('/ip/seort/')[1];
                    console.log("PRODUCT ID1");
                    console.log(productID);
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
                    console.log("PRODUCT ITEM");
                    console.log(productItem)
                    let productInfo = productItem.querySelector('div:nth-child(1) > div > div:nth-child(2)');
                    console.log("PRODUCT INFO2")
                    console.log(productInfo);
                    console.log("QUERY TEST");
                    console.log(productInfo.querySelector('div > div'));
                    let productID = productInfo.querySelector('div > div > div:nth-child(2) > a').getAttribute('href').split('/ip/seort/')[1];
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
                        let productItem = part.querySelector('div:nth-child(3)');
                        console.log("PRODUCT ITEM")
                        console.log(productItem);
                        let productInfo = productItem.querySelector('div:nth-child(1) > div > div.flex.flex-row.relative');
                        console.log("PRODUCT INFO2.5")
                        console.log(productInfo);
                        console.log("QUERY TEST");
                        console.log(productInfo.querySelector('div'));
                        let productID = productInfo.querySelector('div > div > div:nth-child(2) > a').getAttribute('href').split('/ip/seort/')[1];
                        console.log("PRODUCT ID1");
                        console.log(productID);
                        let productName = productInfo.querySelector('a > h4 > div > span').innerText;
                        let unitPrice = productInfo.querySelector('div:nth-child(3) > div > div:nth-child(1) > span').innerText.split('$')[1];
                        let productQuantityString = productItem.querySelector('a').getAttribute('aria-label').split(' in cart')[0];
                        let productQuantity = productQuantityString.slice(productQuantityString.length - 1);
                        let productImage = productInfo.querySelector('a > img').getAttribute('srcset').split(' 1x')[0];
                        productDict[productIndex] = {
                            currency: 'USD',
                            productID: productID,
                            productName: productName,
                            unitPrice: parseFloat(unitPrice) / parseFloat(productQuantity),
                            quantity: productQuantity,
                            productImage: productImage,

                        };
                        productIndex++;
                    } catch (err) {
                            try {
                                let productItem = part.querySelector('div:nth-child(2)');
                                console.log("PRODUCT ITEM")
                                console.log(productItem);
                                let productInfo = productItem.querySelector('div:nth-child(1) > div > div.flex.flex-row.relative');
                                console.log("PRODUCT INFO2.91")
                                console.log(productInfo);
                                let productID = productInfo.querySelector('a').getAttribute('href').split('/ip/seort/')[1];
                                console.log("PRODUCT ID1");
                                console.log(productID);
                                let productName = productInfo.querySelector('a > h4 > div > span').innerText;
                                let unitPrice = productInfo.querySelector('div:nth-child(3) > div > div:nth-child(1) > span').innerText.split('$')[1];
                                let productQuantityString = productItem.querySelector('a').getAttribute('aria-label').split(' in cart')[0];
                                let productQuantity = productQuantityString.slice(productQuantityString.length - 1);
                                let productImage = productInfo.querySelector('a > img').getAttribute('srcset').split(' 1x')[0];
                                productDict[productIndex] = {
                                    currency: 'USD',
                                    productID: productID,
                                    productName: productName,
                                    unitPrice: parseFloat(unitPrice) / parseFloat(productQuantity),
                                    quantity: productQuantity,
                                    productImage: productImage,

                                };
                                productIndex++;
                            } catch (err) {
                                let productItem = part.querySelector('div:nth-child(3)');
                                console.log("PRODUCT ITEM")
                                console.log(productItem);
                                let productInfo = productItem.querySelector('div:nth-child(1) > div > div.flex.flex-row.relative');
                                console.log("PRODUCT INFO2.92")
                                console.log(productInfo);
                                let productID = productInfo.querySelector('a').getAttribute('href').split('/ip/seort/')[1];
                                console.log("PRODUCT ID1");
                                console.log(productID);
                                let productName = productInfo.querySelector('a > h4 > div > span').innerText;
                                let unitPrice = productInfo.querySelector('div:nth-child(3) > div > div:nth-child(1) > span').innerText.split('$')[1];
                                let productQuantityString = productItem.querySelector('a').getAttribute('aria-label').split(' in cart')[0];
                                let productQuantity = productQuantityString.slice(productQuantityString.length - 1);
                                let productImage = productInfo.querySelector('a > img').getAttribute('srcset').split(' 1x')[0];
                                productDict[productIndex] = {
                                    currency: 'USD',
                                    productID: productID,
                                    productName: productName,
                                    unitPrice: parseFloat(unitPrice) / parseFloat(productQuantity),
                                    quantity: productQuantity,
                                    productImage: productImage,

                                };
                                productIndex++;
                            }
                    }
                    }
                }
                });
            } else {
                try {
                    let productCartSection2 = part.querySelector('div > div > ul');
                    let productCartSection2List = Array.from(productCartSection2.children);
                    productCartSection2List.forEach(function (part) {
                        let productItem = part.querySelector('div:nth-child(2)');
                        console.log("PRODUCT ITEM3");
                        console.log(productItem);
                        let productInfo = productItem.querySelector('div:nth-child(1) > div > div:nth-child(2)');
                        console.log("PRODUCT INFO3");
                        console.log(productInfo);
                        console.log("QUERY TEST");
                        console.log(productInfo.querySelector('div > div'));
                        let productID = productInfo.querySelector('div > div > div:nth-child(2) > a').getAttribute('href').split('/ip/seort/')[1];
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
                } catch(err) {
                    try {
                        let productCartSection2 = part.querySelector('div > div > ul');
                        let productCartSection2List = Array.from(productCartSection2.children);
                        productCartSection2List.forEach(function (part) {
                            let productItem = part.querySelector('div:nth-child(3)');
                            console.log("PRODUCT ITEM3.5");
                            console.log(productItem);
                            let productInfo = productItem.querySelector('div:nth-child(1) > div > div:nth-child(2)');
                            console.log("PRODUCT INFO3.5");
                            console.log(productInfo);
                            console.log("QUERY TEST");
                            console.log(productInfo.querySelector('div > div'));
                            let productID = productInfo.querySelector('div > div > div:nth-child(2) > a').getAttribute('href').split('/ip/seort/')[1];
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
                    } catch(err) {
                        try {
                            let productCartSection2 = part.querySelector('div:nth-child(2) > div > ul');
                            let productCartSection2List = Array.from(productCartSection2.children);
                            productCartSection2List.forEach(function (part) {
                                let productItem = part.querySelector('div:nth-child(3)');
                                console.log("PRODUCT ITEM3.9");
                                console.log(productItem);
                                let productInfo = productItem.querySelector('div:nth-child(1) > div > div:nth-child(2)');
                                console.log("PRODUCT INFO3.9");
                                console.log(productInfo);
                                console.log("QUERY TEST");
                                console.log("TEST AAAAAA");
                                let productID = productInfo.querySelector('div.flex.flex-column.sans-serif.pt1.relative > div.flex.mt1.w-100 > div > div > div.flex.w-60 > div > div > a').getAttribute('href').split('/ip/seort/')[1]
                                console.log(productID);
                                let productName = productInfo.querySelector('a > h4 > div > span').innerText;
                                console.log("productName3.9 " + productName);
                                let unitPrice = productItem.querySelector('div:nth-child(1) > div > div:nth-child(3) > div > div > span').innerText.split('$')[1];
                                console.log("unitPrice3.9 " + unitPrice);
                                let productQuantityString = productItem.querySelector('a').getAttribute('aria-label').split(' in cart')[0];
                                console.log("productQuantityString3.9 " + productQuantityString);
                                let productQuantity = productQuantityString.slice(productQuantityString.length - 1);
                                console.log("productQuantity3.9 " + productQuantity);
                                let productImage = productItem.querySelector('div.flex.flex-column.sans-serif.pt1.relative > div.flex.mt1.w-100 > div > div > a > img').getAttribute('srcset').split(' 1x')[0];
                                console.log("productImage3.9 " + productImage);
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
                        } catch(err) {
                            try {
                                let productCartSection2 = part.querySelector('div > div > ul');
                                let productCartSection2List = Array.from(productCartSection2.children);
                                productCartSection2List.forEach(function (part) {
                                    let productItem = part.querySelector('div.flex.flex-column.sans-serif.pt1.relative');
                                    console.log("PRODUCT ITEM4.0");
                                    console.log(productItem);
                                    let productInfo = productItem.querySelector('div.flex.mt1.w-100 > div > div.flex.flex-row.relative');
                                    console.log("PRODUCT INFO4.0");
                                    console.log(productInfo);
                                    console.log("QUERY TEST");
                                    console.log(productInfo.querySelector('div > div'));
                                    let productID = productInfo.querySelector('div > div > div:nth-child(2) > a').getAttribute('href').split('/ip/seort/')[1];
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
                            } catch(err) {
                                console.log("ERROR4.0");
                                console.log(err);
                            }
                        }
                    }
                }
            }
        });
    console.log(productElements);
    return productDict;
  }

  getRetailer() {
    return "walmart";
  }

  getShipping(productDict) {
    let total = 0;
    for (let index in productDict) {
        total += parseFloat(productDict[index]["unitPrice"]) * parseFloat(productDict[index]["quantity"]);
    }
    if (total < 35.00) {
        return 6.99
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
