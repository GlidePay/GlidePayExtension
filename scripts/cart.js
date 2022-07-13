const ECommerceCart = require("./ECommerceCart");
// ALL CHANGES TO THIS FILE MUST BE COMPILED WITH "npm run buildCart"

class Amazon extends ECommerceCart.EcommerceCart {
  constructor() {
    super();
  }

  injectButton() {
    const add_to_cart = document.getElementById("gutterCartViewForm");
    add_to_cart.after(this.cryptoButton);
    document.getElementById("gutterCartViewForm").style.marginBottom = "10px";
    document.getElementById("sc-buy-box").style.paddingBottom = "5px";
  }

  getProducts() {
    let productDict = {};
    let productElements = document.querySelectorAll(
      "#activeCartViewForm > div.a-section.a-spacing-mini.sc-list-body.sc-java-remote-feature > div.a-row.sc-list-item.sc-list-item-border.sc-java-remote-feature"
    );
    let productElementsList = Array.from(productElements);

    productElementsList.forEach(function (part, index, theArray) {
      const imageElement = theArray[index].querySelectorAll(
        "div.sc-list-item-content > div > div.a-column.a-span10 > div > div > div.a-fixed-left-grid-col.a-float-left.sc-product-image-desktop.a-col-left > a > img"
      )[0];

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
}

(() => {
  let amazon = new Amazon();
  amazon.createListeners();
  amazon.injectButton();
  chrome.runtime.sendMessage({
    from: "cart",
    subject: "productData",
  });
})();
