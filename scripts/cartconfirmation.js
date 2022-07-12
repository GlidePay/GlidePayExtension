//TODO: Load in all saved addresses and display them as selectable options
//TODO: Think about how we should handle it if someone tries to order to an address the product doesnt ship to
function getAddresses(userid) {
  fetch(
    "https://vshqd3sv2c.execute-api.us-east-1.amazonaws.com/default/getAddressesRDS",
    {
      method: "post",
      body: JSON.stringify({ userid: userid }),
    }
  )
    .then((response) => response.json())
    .then((responseData) => {
      console.log(responseData);

      const tempAddress = sessionStorage.getItem("tempAddress");
      if (tempAddress == null) {
        console.log("no temp address");
      } else {
        responseData.push(JSON.parse(tempAddress));
      }

      const addressSelect = document.getElementById("addressSelect");
      let address;
      for (let i = 0; i < responseData.length; i++) {
        const option = document.createElement("option");
        address = [
          responseData[i].Address_Line_1,
          responseData[i].Address_Line_2,
          responseData[i].City,
          responseData[i].Province_State,
          responseData[i].Zip_Postal_Code,
          responseData[i].Country,
          responseData[i].Phone_Number,
        ];
        option.setAttribute("address", address);
        const addressString =
          responseData[i].Address_Line_1 +
          " " +
          responseData[i].Address_Line_2 +
          " " +
          responseData[i].City +
          " " +
          responseData[i].Province_State +
          " " +
          responseData[i].Zip_Postal_Code +
          " " +
          responseData[i].Country +
          " " +
          responseData[i].Phone_Number;
        option.textContent = addressString.substring(0, 20) + "...";
        option.value = responseData[i].Address_ID;
        addressSelect.appendChild(option);
      }
    });
}

const setProductInfo = (products) => {
  console.log("products");
  console.log(products);
  let i = 0;
  const productSection = document.getElementById("productInfo");
  let totalprice = 0;
  if (Object.keys(products).length > 0) {
    const horizontal_divider = document.createElement("hr");
    horizontal_divider.setAttribute("class", "hr");
    productSection.appendChild(horizontal_divider);
  }
  for (const [key, productDict] of Object.entries(products)) {
    const cartItem = document.createElement("div");
    cartItem.setAttribute("class", "div");
    totalprice +=
      parseFloat(productDict["unitPrice"]) * parseInt(productDict["quantity"]);

    const itemImageColumn = document.createElement("col-md-4");
    itemImageColumn.setAttribute("class", "col-md-4 px-4 py-2");
    const itemImage = document.createElement("img");
    itemImage.src = productDict["productImage"];
    itemImage.setAttribute("height", "100px");
    itemImage.setAttribute("width", "100px");
    itemImageColumn.appendChild(itemImage);

    const itemPrice = document.createElement("h2");
    itemPrice.setAttribute("class", "p pr-2");
    itemPrice.textContent =
      productDict["quantity"] +
      " " +
      "x" +
      " " +
      "$" +
      productDict["unitPrice"];

    const itemPriceColumn = document.createElement("col-md-4");
    itemPriceColumn.setAttribute(
      "class",
      "col-md-4 my-auto mr-4 px-4 text-center"
    );
    itemPriceColumn.appendChild(itemPrice);

    const itemQuantity = document.createElement("p");
    itemQuantity.setAttribute("class", "text-center");
    itemQuantity.textContent = `${productDict["quantity"]}`;

    const cellRow1 = document.createElement("div");
    cellRow1.setAttribute("class", "d-flex justify-content-between");
    cellRow1.appendChild(itemImageColumn);
    cellRow1.appendChild(itemPriceColumn);
    cartItem.appendChild(cellRow1);
    productSection.appendChild(cartItem);
    i++;
  }

  const confirmButton = document.createElement("button");
  confirmButton.setId;
  confirmButton.setAttribute("class", "btn btn-primary mx-4");
  confirmButton.textContent = "Confirm Order";
  confirmButton.addEventListener("click", () => {
    const addressSelect = document.getElementById("addressSelect");
    if (addressSelect.selectedIndex === -1) {
      console.log("Please select an address");
      return;
    }
    let value = addressSelect.options[addressSelect.selectedIndex].text;
    console.log(value);
    chrome.windows.getAll({ populate: true }, (windows) => {
      for (let a in windows) {
        for (let b in windows[a].tabs) {
          if (windows[a].tabs[b].url.includes("amazon.com/gp/cart")) {
            chrome.tabs.sendMessage(windows[a].tabs[b].id, {
              from: "popup",
              subject: "promptTransaction",
              price: totalprice,
              addressid:
                addressSelect.options[addressSelect.selectedIndex].value,
              products: products,
            });
            window.close();
          }
        }
      }
    });
  });
  chrome.storage.session.get("userid", function (result) {
    console.log(result["userid"]);
    console.log("GOTUSERID");
    getAddresses(result["userid"]);
  });

  const addressLabel = document.createElement("h2");
  addressLabel.textContent = "Address";

  const addressButtonRow = document.createElement("div");
  addressButtonRow.setAttribute("class", "d-flex justify-content-between");
  const buttonRowHR = document.createElement("hr");
  const addAddressButton = document.createElement("button");
  addAddressButton.textContent = "Add Address";
  addAddressButton.setAttribute("class", "btn btn-primary mx-4");
  addAddressButton.addEventListener("click", () => {
    window.location.href = "addaddress.html";
  });
  addressButtonRow.appendChild(confirmButton);
  addressButtonRow.appendChild(addAddressButton);
  productSection.appendChild(buttonRowHR);
  productSection.appendChild(addressButtonRow);
};

window.addEventListener("load", () => {
  chrome.windows.getAll({ populate: true }, (windows) => {
    for (let a in windows) {
      for (let b in windows[a].tabs) {
        if (windows[a].tabs[b].url.includes("amazon.com/gp/cart")) {
          chrome.tabs.sendMessage(
            windows[a].tabs[b].id,
            { from: "popup", subject: "needInfo" },
            setProductInfo
          );
          break;
        }
      }
    }
  });
});
