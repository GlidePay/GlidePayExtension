class LogError {
  constructor(customMsg, error, states, uiMsg, errorID, handle) {
    this.customMsg = customMsg || null;
    this.error = error || null;
    this.states = states;
    this.uiMsg = uiMsg || null;
    this.errorID = errorID;
    this.errorOrigin = "Extension";
    this.timestamp = this.getDate();
    handle();
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
    chrome.runtime.sendMessage({
      from: "cart",
      subject: "logError",
      body: { logError: this },
    });
    // TODO: Logs error to database
  }
}
//TODO: Load in all saved addresses and display them as selectable options
//TODO: Think about how we should handle it if someone tries to order to an address the product doesnt ship to
var addresses_data = [];
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
    address = {
      Address_Line_1: addresses[i].Address_Line_1,
      Address_Line_2: addresses[i].Address_Line_2,
      City: addresses[i].City,
      Province_State: addresses[i].Province_State,
      Zip_Postal_Code: addresses[i].Zip_Postal_Code,
      Country: addresses[i].Country,
      Phone_Number: addresses[i].Phone_Number,
    };
    addresses_data.push(address);
    let addressString;
    switch (address.Country) {
      case "United States of America":
        addressString =
          address.Address_Line_1 +
          " " +
          address.Address_Line_2 +
          " " +
          address.City +
          " " +
          address.Province_State +
          " " +
          address.Zip_Postal_Code +
          " " +
          address.Country +
          " " +
          address.Phone_Number;
      case "Canada":
        addressString =
          address.Address_Line_1 +
          " " +
          address.Address_Line_2 +
          " " +
          address.City +
          " " +
          address.Province_State +
          " " +
          address.Zip_Postal_Code +
          " " +
          address.Country +
          " " +
          address.Phone_Number;
      case "United Kingdom":
        addressString =
          address.Address_Line_1 +
          " " +
          address.Address_Line_2 +
          " " +
          address.City +
          " " +
          address.Zip_Postal_Code +
          " " +
          address.Country +
          " " +
          address.Phone_Number;
      default:
        addressString =
          address.Address_Line_1 +
          " " +
          address.Address_Line_2 +
          " " +
          address.City +
          " " +
          address.Province_State +
          " " +
          address.Zip_Postal_Code +
          " " +
          address.Country +
          " " +
          address.Phone_Number;
    }

    option.textContent =
      addressString.length > 20
        ? addressString.substring(0, 20) + "..."
        : addressString;

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
  console.log(addresses_data + "ddd");
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
    let priceString = productDict["unitPrice"].toString();
    if (priceString.includes(",")) {
      priceString = priceString.replace(/,/g, "");
    }
    subtotal += parseFloat(priceString) * productDict["quantity"];
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

  const us_tax_info = {
    AL: 11.5,
    AL: 7.5,
    AZ: 11.2,
    AR: 12.625,
    CA: 9.75,
    CO: 11.2,
    CT: 6.35,
    DE: 0.0,
    FL: 8.0,
    GA: 8.9,
    HI: 4.5,
    ID: 9.0,
    IL: 11.0,
    IN: 7.0,
    IA: 7.0,
    KS: 10.5,
    KY: 6.0,
    LA: 11.45,
    ME: 5.5,
    MD: 6.0,
    MA: 6.25,
    MI: 6.0,
    MN: 8.875,
    MS: 8.0,
    MO: 9.988,
    MT: 0.0,
    NE: 8.0,
    NV: 8.38,
    NH: 0.0,
    NJ: 9.94,
    NM: 9.44,
    NY: 8.88,
    NC: 7.5,
    ND: 8.5,
    OH: 8.0,
    OK: 11.5,
    OR: 0.0,
    PA: 8.0,
    RI: 7.0,
    SC: 9.0,
    SD: 9.0,
    TN: 9.75,
    TX: 8.25,
    UT: 9.05,
    VT: 7.0,
    VA: 6.0,
    WA: 10.5,
    WV: 7.0,
    WI: 6.75,
    WY: 6.0,
  };

  const canada_tax_info = {
    AB: 5.0,
    BC: 12.0,
    MB: 12.0,
    NB: 15.0,
    NL: 15.0,
    NS: 15.0,
    NT: 5.0,
    NU: 5.0,
    ON: 13.0,
    PE: 15.0,
    QC: 15.0,
    SK: 11.0,
    YT: 5.0,
  };

  let selectedCountry =
    addresses_data[document.getElementById("addressSelect").selectedIndex]
      .Country;
  let selectedState =
    addresses_data[document.getElementById("addressSelect").selectedIndex]
      .Province_State;
  console.log("------");
  console.log(selectedCountry);
  switch (selectedCountry) {
    case "United States of America":
      console.log("This is us");
      updateTaxInfo(subtotal, shipping, us_tax_info[selectedState]);
      break;
    case "United Kingdom":
      updateTaxInfo(subtotal, shipping, 2.0);
      break;
    case "Canada":
      updateTaxInfo(subtotal, shipping, canada_tax_info[selectedState]);
      break;
  }

  document
    .getElementById("addressSelect")
    .addEventListener("change", function () {
      console.log("HIIIII");
      let selectedCountry =
        addresses_data[document.getElementById("addressSelect").selectedIndex]
          .Country;
      let selectedState =
        addresses_data[document.getElementById("addressSelect").selectedIndex]
          .Province_State;
      switch (selectedCountry) {
        case "United States of America":
          console.log("This is us");
          updateTaxInfo(subtotal, shipping, us_tax_info[selectedState]);
          break;
        case "United Kingdom":
          updateTaxInfo(subtotal, shipping, 2.0);
          break;
        case "Canada":
          updateTaxInfo(subtotal, shipping, canada_tax_info[selectedState]);
          break;
      }
    });

  const confirmButton = document.getElementById("submit-button");
  confirmButton.addEventListener("click", async () => {
    const chain = document.getElementById("currencySelect").value;
    if (addressSelect.selectedIndex === -1) {
      //TODO: Add text or popup or something that says this
      return;
    }
    const windows = await chrome.windows.getAll({ populate: true });
    for (let a in windows) {
      for (let b in windows[a].tabs) {
        if (windows[a].tabs[b].id === sender) {
          chrome.tabs.sendMessage(
            windows[a].tabs[b].id,
            {
              from: "popup",
              subject: "promptTransaction",
              price: totalPrice,
              currency: currency,
              addressid:
                addressSelect.options[addressSelect.selectedIndex].value,
              products: products,
              ticker: chain,
            },
            (response) => {
              if (response) {
                window.location.href = "/views/ordersentpopup.html";
              } else {
                alert(
                  "Transaction failed. Please make sure you have enough USDC in your wallet to complete the transaction."
                );
              }
            }
          );
        }
      }
    }
  });
}

function updateTaxInfo(subtotal, shipping, tax_rate) {
  document.getElementById("shipping-total").innerHTML =
    "Shipping: $" + shipping.toFixed(2).toString();
  tax = (subtotal * (tax_rate / 100)).toFixed(2);

  document.getElementById("tax-total").innerHTML = "Tax: $" + tax;
  document.getElementById("sub-total").innerHTML =
    "Subtotal: $" + subtotal.toFixed(2).toString();
  let totalPrice = tax + subtotal + shipping;
  document.getElementById("final-total").innerHTML =
    "Total: $" + totalPrice.toFixed(2).toString();
}

function GetURLParameter(sParam) {
  let sPageURL = window.location.search.substring(1);
  let sURLVariables = sPageURL.split("&");
  for (var i = 0; i < sURLVariables.length; i++) {
    let sParameterName = sURLVariables[i].split("=");
    if (sParameterName[0] === sParam) {
      return sParameterName[1];
    }
  }
}

async function setUpCart(products, shipping, senderTabID) {
  try {
    await getAddresses();
  } catch (err) {
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
  try {
    await setProductInfo(products, shipping, senderTabID);
  } catch (err) {
    console.log(err);
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
}

async function cartMain() {
  const popupTabID = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  });
  await chrome.runtime.sendMessage({
    from: "popup",
    subject: "setPopupTabID",
    body: { popupID: popupTabID[0].id },
  });

  chrome.runtime.connect({ name: "cartView" });
  const senderTabID = await chrome.runtime.sendMessage({
    from: "confirmation",
    subject: "getTabID",
  });

  if (GetURLParameter("from") === "addaddress") {
    const windows = await chrome.windows.getAll({ populate: true });
    for (let a in windows) {
      for (let b in windows[a].tabs) {
        if (windows[a].tabs[b].id === senderTabID) {
          const products = await chrome.tabs.sendMessage(
            windows[a].tabs[b].id,
            {
              from: "popup",
              subject: "needInfo",
            }
          );
          await setUpCart(products[0], products[1], senderTabID);
        }
      }
    }
    return;
  }

  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      if (message.from === "cart" && message.subject === "sendCartInfo") {
        // chrome.runtime.onMessage.removeListener(arguments.callee);
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
