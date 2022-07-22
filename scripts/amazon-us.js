const { LogError } = require("./LogError");
const ECommerceCart = require("./ECommerceCart");
// ALL CHANGES TO THIS FILE MUST BE COMPILED WITH "npm run buildAmazon"

class Amazon extends ECommerceCart.EcommerceCart {
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
         * Injects the pay with crypto button into Amazon's checkout page.
         * @function injectButton

         */
    const add_to_cart = document.getElementById("gutterCartViewForm");
    add_to_cart.after(this.cryptoButton);
    document.getElementById("gutterCartViewForm").style.marginBottom = "10px";
    document.getElementById("sc-buy-box").style.paddingBottom = "5px";
  }

  getProducts() {
    /**
     * Parses Amazon's checkout page for the user's selected products.
     * @function getProducts
     * @return  {Object} Contains the products selected by the user.
     */
    let productDict = {};
    let productElements = document.querySelectorAll(
      "#activeCartViewForm > div.a-section.a-spacing-mini.sc-list-body.sc-java-remote-feature > div.a-row.sc-list-item.sc-list-item-border.sc-java-remote-feature"
    );
    let productElementsList = Array.from(productElements);

    productElementsList.forEach(function (part, index, theArray) {
      const imageElement = theArray[index].querySelectorAll(
        "div.sc-list-item-content > div > div.a-column.a-span10 > div > div > div.a-fixed-left-grid-col.a-float-left.sc-product-image-desktop.a-col-left > a > img"
      )[0];
      const currency = JSON.parse(part.getAttribute("data-subtotal")).subtotal
        .code;
      console.log(currency);
      const ASIN = theArray[index].getAttribute("data-asin");
      const productName = imageElement.getAttribute("alt");
      const unitPrice = theArray[index].getAttribute("data-price");
      const quantity = theArray[index].getAttribute("data-quantity");
      const productImage = imageElement.getAttribute("src");
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

  getRetailer() {
    let url = window.location.href
    if (url.includes('amazon.com.mx')) {
      return 'amazon_mx'
    }else if (url.includes('www.amazon.ca')){
      return 'amazon_ca'
    }else if (url.includes('www.amazon.de')){
      return 'amazon_de'
    } else if (url.includes('www.amazon.co.uk')){
      return 'amazon_uk'
    } else {
    return 'amazon'
    }
  }
}


function main() {
  /**
   * Main runner function.
   * @function main
   */

  let amazon = new Amazon();
  amazon.createListeners();
  amazon.injectButton();
  chrome.runtime.sendMessage({
    from: "cart",
    subject: "productData",
  });
  var observer = new MutationObserver(function (mutations) {
    amazon.injectButton();
  });
  var container = document.getElementById("sc-active-cart");
  let config = {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
  };
  observer.observe(container, config);
}

main();
