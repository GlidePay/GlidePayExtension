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
  console.log(getAddressesResponse);
  if (getAddressesResponse.hasOwnProperty("error")) {
    new LogError(
      getAddressesResponse.error.customMsg,
      getAddressesResponse.error.error,
      {
        jwt: jwt,
      },
      getAddressesResponse.error.uiMsg,
      getAddressesResponse.error.errorID,
      () => {
        const addressSelectDropdown = document.getElementById("addressSelect");
        const errorText = document.createElement("p");
        errorText.classList = "error-text text-center";
        errorText.innerText =
          getAddressesResponse.uiMsg ?? "Retrieving Addresses Failed";
        addressSelectDropdown.after(errorText);
      }
    );
    return;
  }
  const addresses = getAddressesResponse.data;

  const tempAddress = sessionStorage.getItem("tempAddress");
  if (tempAddress == null) {
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

  const productSection = document.getElementById("cartTable");

  const addressLabel = document.createElement("h2");
  addressLabel.textContent = "Address";

  const addressButtonRow = document.createElement("div");
  addressButtonRow.setAttribute("class", "d-flex justify-content-between");

  productSection.appendChild(addressButtonRow);
}

async function setProductInfo(products, shipping, sender) {
  let currency;
  const cartView = document.getElementById("cart-view");
  const loadingView = document.getElementById("loading-view");
  cartView.style.display = "block";
  loadingView.style.display = "none";
  let i = 0;
  const productSection = document.getElementById("cartTable");
  productSection.innerHTML = "";
  let subtotal = 0;
  for (const [key, productDict] of Object.entries(products)) {
    const cartItem = document.createElement("tbody");
    const itemRow = document.createElement("tr");
    const itemImgEntry = document.createElement("td");
    itemImgEntry.setAttribute("class", "ps-4");
    subtotal +=
      parseFloat(productDict["unitPrice"]) * parseInt(productDict["quantity"]);
    currency = productDict["currency"];
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
  confirmButton.addEventListener("click", async () => {
    const addressSelect = document.getElementById("addressSelect");
    if (addressSelect.selectedIndex === -1) {
      //TODO: Add text or popup or something that says this
      return;
    }
  let tax = (subtotal + shipping) * 0.095;
  console.log(shipping)
  let totalPrice = tax + subtotal + shipping;
    let value = addressSelect.options[addressSelect.selectedIndex].text;
    const windows = await chrome.windows.getAll({ populate: true });
    for (let a in windows) {
      for (let b in windows[a].tabs) {
        if (windows[a].tabs[b].id === sender) {
          chrome.tabs.sendMessage(windows[a].tabs[b].id, {
            from: "popup",
            subject: "promptTransaction",
            price: totalPrice,
            currency: currency,
            addressid: addressSelect.options[addressSelect.selectedIndex].value,
            products: products,
          });
          window.close();
        }
      }
    }
  });
}

function GetURLParameter(sParam) {
  let sPageURL = window.location.search.substring(1);
  let sURLVariables = sPageURL.split("&");
  for (var i = 0; i < sURLVariables.length; i++) {
    let sParameterName = sURLVariables[i].split("=");
    if (sParameterName[0] == sParam) {
      return sParameterName[1];
    }
  }
}

async function setUpCart(products, shipping, senderTabID) {
  try {
    await setProductInfo(products, shipping, senderTabID);
  } catch (err) {
    new LogError(
      "Setting Product Info Failed (Uncaught)",
      err,
      {},
      "Getting Products Failed",
      Date.now(),
      () => {
        const columnLabelRow = document.getElementById("column-label-row");
        const errorText = document.createElement("p");
        errorText.classList = "error-text text-center";
        errorText.innerText = "Getting Products Failed";
        columnLabelRow.after(errorText);
      }
    );
  }
  try {
    await getAddresses();
  } catch (err) {
    console.log(err);
    console.log(err.stack);
    new LogError(
      "Retrieving Addresses Failed (Uncaught)",
      err.stack,
      {},
      "Retrieving Addresses Failed",
      Date.now(),
      () => {
        const addressSelectDropdown = document.getElementById("addressSelect");
        const errorText = document.createElement("p");
        errorText.classList = "error-text text-center";
        errorText.innerText = "Retrieving Addresses Failed";
        addressSelectDropdown.after(errorText);
      }
    );
  }
}

async function cartMain() {
  chrome.runtime.connect({ name: "cartView" });
  const senderTabID = await chrome.runtime.sendMessage({
    from: "confirmation",
    subject: "getTabID",
  });

  if (GetURLParameter("from") === "addaddress") {
    console.log("From address");
    const windows = await chrome.windows.getAll({ populate: true });
    for (let a in windows) {
      for (let b in windows[a].tabs) {
        if (windows[a].tabs[b].id === senderTabID) {
          console.log("Requesting popup info");
          const products = await chrome.tabs.sendMessage(
            windows[a].tabs[b].id,
            {
              from: "popup",
              subject: "needInfo",
            }
          );
          console.log(products)
          await setUpCart(products[0], products[1], senderTabID);
        }
      }
    }
    return;
  }

  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      if (message.from === "cart" && message.subject === "sendCartInfo") {
        chrome.runtime.onMessage.removeListener(arguments.callee);
        sendResponse(true);
        const products = message.data;
        const shipping = message.shipping;
        await setUpCart(products, shipping, senderTabID);
      }
      return true;
    }
  );
}
window.addEventListener("load", async () => {
  try {
    await cartMain();
  } catch (err) {
    new LogError(
      "Building Cart Popup Failed (Uncaught)",
      err,
      {},
      "Building Cart Popup Failed",
      Date.now(),
      () => {}
    );
  }
});
