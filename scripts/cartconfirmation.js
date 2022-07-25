//TODO: Load in all saved addresses and display them as selectable options
//TODO: Think about how we should handle it if someone tries to order to an address the product doesnt ship to
function getAddresses() {
  chrome.storage.local.get("glidePayJWT", (result) => {
    const jwt = result.glidePayJWT;
    fetch(
        "https://vshqd3sv2c.execute-api.us-east-1.amazonaws.com/default/getAddressesRDS",
        {
          method: "post",
          body: JSON.stringify({ token: jwt }),
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
  });
}

const setProductInfo = (products) => {
  console.log("products");
  console.log(products);
  let i = 0;
  const productSection = document.getElementById("cartTable");
  let totalPrice = 0;
  for (const [key, productDict] of Object.entries(products)) {
    const cartItem = document.createElement("tbody");
    const itemRow = document.createElement("tr");
    const itemImgEntry = document.createElement("td");
    itemImgEntry.setAttribute("class", "ps-4");
    totalPrice +=
      parseFloat(productDict["unitPrice"]) * parseInt(productDict["quantity"]);

    const itemImage = document.createElement("img");
    itemImage.src = productDict["productImage"];
    itemImage.setAttribute("height", "100px");
    itemImage.setAttribute("width", "100px");
    itemImgEntry.appendChild(itemImage);
    itemRow.appendChild(itemImgEntry);
    cartItem.appendChild(itemRow);

    const itemQuantityEntry = document.createElement("td");
    itemQuantityEntry.textContent = productDict["quantity"];
    itemQuantityEntry.setAttribute("class", "align-middle text-center");
    itemRow.appendChild(itemQuantityEntry);

    const itemPriceEntry = document.createElement("td");
    itemPriceEntry.setAttribute("class", "align-middle text-center");
    itemPriceEntry.textContent =
      "$" +
      productDict["unitPrice"];
    itemRow.appendChild(itemPriceEntry);

    productSection.appendChild(cartItem);
    i++;
  }

  const confirmButton = document.getElementById("submit-button");
  confirmButton.addEventListener("click", () => {
    const addressSelect = document.getElementById("addressSelect");
    if (addressSelect.selectedIndex === -1) {
      //TODO: Add text or popup or something that says this
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
              price: totalPrice,
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

  getAddresses();

  const addressLabel = document.createElement("h2");
  addressLabel.textContent = "Address";

  const addressButtonRow = document.createElement("div");
  addressButtonRow.setAttribute("class", "d-flex justify-content-between");
  productSection.appendChild(addressButtonRow);
};

window.addEventListener("load", () => {
  let senderTabID;
  chrome.runtime.sendMessage({
    from: "confirmation",
    subject: "getTabID",
    }, (response) => {
    console.log("RESPONSE" + response);
    senderTabID = response;
    chrome.windows.getAll({ populate: true }, (windows) => {
      for (let a in windows) {
        for (let b in windows[a].tabs) {
          if (windows[a].tabs[b].id === senderTabID) {
            console.log(senderTabID + "TABID");
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
});
