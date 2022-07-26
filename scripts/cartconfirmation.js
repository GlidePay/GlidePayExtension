class LogError {
  constructor(customMsg, error, states, uiMsg, errorID, handle) {
    this.customMsg = customMsg;
    this.error = error;
    this.states = states;
    this.uiMsg = uiMsg;
    this.errorID = errorID;
    this.errorOrigin = "Extension";
    this.timestamp = this.getDate();
    this.handle = handle();
    this.logError();
  }

  getDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const hh = String(today.getHours()).padStart(2, "0");
    const nn = String(today.getMinutes()).padStart(2, "0");
    const ss = String(today.getSeconds()).padStart(2, "0");

    return `${yyyy}/${mm}/${dd}T${hh}:${nn}:${ss}`;
  }

  logError() {
    // TODO: Logs error to database
  }
}

//TODO: Load in all saved addresses and display them as selectable options
//TODO: Think about how we should handle it if someone tries to order to an address the product doesnt ship to
async function getAddresses() {
  const result = await chrome.storage.local.get("glidePayJWT");
  const jwt = result.glidePayJWT;
  let getAddressesResponse = await chrome.runtime.sendMessage({
    from: "cart",
    subject: "getAddresses",
    body: {
      token: jwt,
    },
  });
  if (getAddressesResponse.hasOwnProperty("error")) {
    const getAddressesResponse = signatureResponse.error;
    console.log("Throwing signature error");
    throw new LogError(
      getAddressesResponse.customMsg,
      getAddressesResponse.error,
      {
        walletID: walletID,
        token: token,
        nonce: nonce,
        message: message,
        signature: signature,
      },
      getAddressesResponse.uiMsg,
      getAddressesResponse.errorID,
      () => {
        alert("Server Error");
      }
    );
  }
  const addresses = getAddressesResponse.data;
  console.log("addreses" + addresses);

  const tempAddress = sessionStorage.getItem("tempAddress");
  if (tempAddress == null) {
    console.log("no temp address");
  } else {
    addresses.push(JSON.parse(tempAddress));
  }

  const addressSelect = document.getElementById("addressSelect");
  let address;
  for (let i = 0; i < addresses.length; i++) {
    const option = document.createElement("option");
    address = [
      addresses[i].Address_Line_1,
      addresses[i].Address_Line_2,
      addresses[i].City,
      addresses[i].Province_State,
      addresses[i].Zip_Postal_Code,
      addresses[i].Country,
      addresses[i].Phone_Number,
    ];
    option.setAttribute("address", address);
    const addressString =
      addresses[i].Address_Line_1 +
      " " +
      addresses[i].Address_Line_2 +
      " " +
      addresses[i].City +
      " " +
      addresses[i].Province_State +
      " " +
      addresses[i].Zip_Postal_Code +
      " " +
      addresses[i].Country +
      " " +
      addresses[i].Phone_Number;
    option.textContent = addressString.substring(0, 20) + "...";
    option.value = addresses[i].Address_ID;
    addressSelect.appendChild(option);
  }
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
    itemPriceEntry.textContent = "$" + productDict["unitPrice"];
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

async function main() {
  console.log("nooo");
  let senderTabID;
  chrome.runtime.sendMessage(
    {
      from: "confirmation",
      subject: "getTabID",
    },
    (response) => {
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
    }
  );
}

window.addEventListener("load", () => {
  try {
    main();
  } catch (err) {
    console.log("Error Confirmation Cart Flow");
    console.log(err);
    if (err instanceof LogError) {
      err.logError();
    }
  }
});
