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
  console.log(JSON.stringify(products));
  let i = 0;
  const productSection = document.getElementById("productInfo");
  let totalprice = 0;
  console.log(typeof products);
  console.log(products);
  console.log(Object.keys(products));
  if (Object.keys(products).length > 0) {
    const horizontal_divider = document.createElement("hr");
    productSection.appendChild(horizontal_divider);
  }
  for (let value in products) {
    const cartItem = document.createElement("div");
    totalprice += parseFloat(products[value][1]) * parseInt(products[value][0]);

    const itemImageColumn = document.createElement("col-md-4");
    const itemImage = document.createElement("img");
    itemImage.src = products[value][2];
    itemImage.setAttribute("height", "100px");
    itemImage.setAttribute("width", "100px");
    itemImageColumn.appendChild(itemImage);

    const itemNameColumn = document.createElement("col-md-4");
    itemNameColumn.textContent = products[value][3];

    const itemPriceColumn = document.createElement("col-md-4");
    itemPriceColumn.textContent = `$${products[value][1]}`;

    const itemQuantity = document.createElement("h2");
    itemQuantity.textContent = `Qty: ${products[value][0]}`;

    const horizontal_divider = document.createElement("hr");
    const cellRow1 = document.createElement("div");
    cellRow1.setAttribute("class", "bg-light d-flex justify-content-between");
    cellRow1.appendChild(itemImageColumn);
    cellRow1.appendChild(itemNameColumn);
    cellRow1.appendChild(itemPriceColumn);
    cartItem.appendChild(cellRow1);
    cartItem.appendChild(itemQuantity);
    cartItem.appendChild(horizontal_divider);
    productSection.appendChild(cartItem);
    i++;
  }

  const confirmButton = document.createElement("button");
  confirmButton.setId;
  confirmButton.setAttribute("class", "btn btn-primary");
  confirmButton.textContent = "Confirm Order";
  confirmButton.addEventListener("click", () => {
    const addressSelect = document.getElementById("addressSelect");
    if (addressSelect.selectedIndex === -1) {
      console.log("Please select an address");
      return;
    }
    let value = addressSelect.options[addressSelect.selectedIndex].text;
    console.log(value);
    lambdaTest();
    chrome.windows.getAll({ populate: true }, (windows) => {
      for (let a in windows) {
        for (let b in windows[a].tabs) {
          if (windows[a].tabs[b].url.includes("amazon.com/gp/cart")) {
            chrome.tabs.sendMessage(windows[a].tabs[b].id, {
              from: "popup",
              subject: "promptTransaction",
              price: totalprice,
              addressid: addressSelect.options[addressSelect.selectedIndex].value,
              products: products,
            });
            break;
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
  productSection.appendChild(confirmButton);

  const addressButtonRow = document.createElement("div");
  addressButtonRow.setAttribute(
    "class",
    "bg-light d-flex justify-content-between"
  );
  const addAddressButton = document.createElement("button");
  addAddressButton.textContent = "Add Address";
  addAddressButton.setAttribute("class", "btn btn-primary");
  addAddressButton.addEventListener("click", () => {
    chrome.runtime
      .sendMessage({
        from: "cart",
        subject: "createRegistrationPopup",
      })
      .then(() => {
        window.close();
      });
  });
  addressButtonRow.appendChild(addAddressButton);
  productSection.appendChild(addressButtonRow);
};

function lambdaTest() {
  fetch(
    "https://a5w54in31c.execute-api.us-east-1.amazonaws.com/default/omarpython",
    {
      method: "post",
    }
  )
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
      //use keys
    });
}

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

////

// window.addEventListener("load", () => {
//   chrome.windows.getAll({ populate: true }, (windows) => {
//     for (let a in windows) {
//       for (let b in windows[a].tabs) {
//         if (windows[a].tabs[b].url.includes("amazon.com/gp/cart")) {
//           console.log("hi");
//           chrome.tabs.sendMessage(
//             windows[a].tabs[b].id,
//             { from: "popup", subject: "needInfo" },
//             setProductInfo
//           );
//           break;
//         }
//       }
//     }
//   });
// });
