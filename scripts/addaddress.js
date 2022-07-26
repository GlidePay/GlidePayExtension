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

function setUpAddAddressButton() {
  console.log("qqq");
  let confirmButton = document.getElementById("submit-button");
  let backbutton = document.getElementById("back-button");

  backbutton.addEventListener("click", function (event) {
    window.location.href = "confirmation.html";
  });

  confirmButton.addEventListener("click", async () => {
    await addAddressButtonClicked();
  });
}

async function addAddressButtonClicked() {
  //TODO: Checks if fully filled out and address is valid
  //TODO: Check if address already exists
  const firstname = document.getElementById("firstname").value;
  const lastname = document.getElementById("lastname").value;
  const address1 = document.getElementById("address1").value;
  const address2 = document.getElementById("address2").value;
  const city = document.getElementById("city").value;
  const zip = document.getElementById("zip").value;
  const state = document.getElementById("stateprovince").value;
  const country = document.getElementById("country").value;
  const phone = document.getElementById("phone").value;

  const address = {
    First_Name: firstname,
    Last_Name: lastname,
    Address_Line_1: address1,
    Address_Line_2: address2,
    Zip_Postal_Code: zip,
    City: city,
    Province_State: state,
    Country: country,
    Phone_Number: phone,
  };

  for (let key in address) {
    if (address[key] === "" && key !== "Address_Line_2") {
      alert("Please fill out all fields");
      return;
    }
  }

  console.log(address);
  const saveAddressButton = document.getElementsByClassName(
    "form-check-input me-2"
  )[0];
  let token = await chrome.storage.local.get("glidePayJWT");
  token = token.glidePayJWT;

  if (saveAddressButton.checked) {
    const createAddressResponse = await chrome.runtime.sendMessage({
      from: "cart",
      subject: "createAddress",
      body: {
        token: token,
        address: address,
      },
    });
    if (createAddressResponse.hasOwnProperty("error")) {
      throw new LogError(
        createAddressResponse.customMsg,
        createAddressResponse.error,
        { address: address, token: token },
        createAddressResponse.uiMsg,
        createAddressResponse.errorID,
        () => {
          alert("Server Error");
        }
      );
    }
    window.location.href = "/views/confirmation.html";
  } else {
    sessionStorage.setItem("tempAddress", JSON.stringify(address));
    window.location.href = "/views/confirmation.html";
  }
}

setUpAddAddressButton();
