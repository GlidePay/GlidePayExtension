// Error logging class.
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
    // TODO: Logs error to database
  }
}

// Sets up the add address button.
async function setUpAddAddressButton() {
  let addAddressButton = document.getElementById("add-address-button");
  let backbutton = document.getElementById("back-button");

  // Adds event listener for the back button.
  backbutton.addEventListener("click", () => {
    window.location.href = "/views/confirmation.html?from=addaddress";
  });

  // Adds event listener for the add address button.
  addAddressButton.addEventListener("click", async () => {
    await addAddressButtonClicked();
  });
}

// What happens when add address button is clicked.
async function addAddressButtonClicked() {
  // This grabs all the inputs.
  const firstname = document.getElementById("firstname").value;
  const lastname = document.getElementById("lastname").value;
  const address1 = document.getElementById("address1").value;
  const address2 = document.getElementById("address2").value;
  const city = document.getElementById("city").value;
  const zip = document.getElementById("zip").value;
  const state = document.getElementById("stateprovince").value;
  const country = document.getElementById("country").value;
  const phone = document.getElementById("phone").value;

  // Creates the address object.
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

  // This makes sure all fields are filled out and if not, shows error text.
  for (let key in address) {
    if (address[key] === "" && key !== "Address_Line_2") {
      const addAddressButton = document.getElementById("add-address-button");
      const errorTextQuery = document.getElementsByClassName(
        "error-text text-center"
      );
      if (errorTextQuery.length === 0) {
        const errorText = document.createElement("p");
        errorText.classList = "error-text text-center";
        errorText.innerText = "Please fill out required fields";
        addAddressButton.after(errorText);
        return;
      }

      errorTextQuery[0].innerText = "Please fill out required fields";
      return;
    }
  }

  // Gets the "Save Address" checkmark.
  const saveAddressButton = document.getElementsByClassName(
    "form-check-input me-2"
  )[0];

  // Gets the JWT from localStorage.
  let token = await chrome.storage.local.get("glidePayJWT");
  token = token.glidePayJWT;

  // Checks to see if save address checkmark is checked.
  // If it is, it will save the address to the database.
  if (saveAddressButton.checked) {
    const createAddressResponse = await chrome.runtime.sendMessage({
      from: "cart",
      subject: "createAddress",
      body: {
        token: token,
        address: address,
      },
    });

    // Checks for error.
    if (createAddressResponse.hasOwnProperty("error")) {
      new LogError(
        createAddressResponse.error.customMsg,
        createAddressResponse.error.error,
        { address: address, token: token },
        createAddressResponse.error.uiMsg,
        createAddressResponse.error.errorID,
        () => {
          const addAddressButton =
            document.getElementById("add-address-button");
          const errorTextQuery = document.getElementsByClassName(
            "error-text text-center"
          );
          if (errorTextQuery.length === 0) {
            const errorText = document.createElement("p");
            errorText.classList = "error-text text-center";
            errorText.innerText =
              createAddressResponse.error.uiMsg ??
              "Creating this Address Failed";
            addAddressButton.after(errorText);
            return;
          }

          errorTextQuery[0].innerText =
            createAddressResponse.error.uiMsg ?? "Creating this Address Failed";
        }
      );
      return;
    }

    // If no error, redirects to main confirmation page.
  } else {
    // If save address checkmark is not checked, it will store the address in sessionStorage.
    sessionStorage.setItem("tempAddress", JSON.stringify(address));
  }
  window.location.href = "/views/confirmation.html?from=addaddress";
}

// Main function that runs.
async function addressMain() {
  try {
    await setUpAddAddressButton();
  } catch (err) {
    new LogError(
      "Building Address Popup Failed (Uncaught)",
      err,
      {},
      "Building Address Popup Failed",
      Date.now(),
      () => {}
    );
  }
}

addressMain();
