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

  async getProducts() {
    /**
     * Parses Amazon's checkout page for the user's selected products.
     * @function getProducts
     * @return  {Object} Contains the products selected by the user.
     */
    console.log("getProducts");
    console.log(document.querySelector("#activeCartViewForm > div.a-section.a-spacing-mini.sc-list-body.sc-java-remote-feature").children);
    let productDict = {};
    let productElements = document.querySelectorAll(
        "#activeCartViewForm > div.a-section.a-spacing-mini.sc-list-body.sc-java-remote-feature"
    )[0].children;
    let productElementsList = Array.from(productElements);

    productElementsList.forEach(function (part, index, theArray) {
      if (part.className.includes("sc-list-item")) {
        const currency = JSON.parse(part.getAttribute("data-subtotal")).subtotal.code;
        const ASIN = part.getAttribute("data-asin");
        const t = part.querySelectorAll(".a-truncate-full");
        const productName = t[t.length - 1].innerHTML.trim();
        const unitPrice = part.getAttribute("data-price");
        const quantity = part.getAttribute("data-quantity");
        const productImage = part.querySelector(".sc-product-image").getAttribute("src");
        productDict[index] = {
          productID: ASIN,
          productName: productName,
          unitPrice: unitPrice,
          quantity: quantity,
          productImage: productImage,
          currency: currency,
        };
      }
    });
    return productDict;
  }

  getRetailer() {
    let url = window.location.href;
    if (url.includes("amazon.com.mx")) {
      return "amazon_mx";
    } else if (url.includes("www.amazon.ca")) {
      return "amazon_ca";
    } else if (url.includes("www.amazon.de")) {
      return "amazon_de";
    } else if (url.includes("www.amazon.co.uk")) {
      return "amazon_uk";
    } else {
      return "amazon";
    }
  }

  getShipping() {
    return 0;
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
