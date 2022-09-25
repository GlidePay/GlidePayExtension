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
    chrome.runtime.sendMessage({
      from: "cart",
      subject: "logError",
      body: { logError: this },
    });
    // TODO: Logs error to database
  }
}

// Sets up the add address button.
function setUpAddAddressButton() {
  let countrySelectDropdown = document.getElementById("country-select");
  let stateSelectDropdown = document.getElementById("state-select");

  countrySelectDropdown.selectedIndex = -1;
  stateSelectDropdown.selectedIndex = -1;
  countrySelectDropdown.addEventListener("change", () => {
    switch (countrySelectDropdown.value) {
      case "United States of America":
        document.getElementById("state-select").disabled = false;
        stateSelectDropdown.innerHTML = `<option value="AL">Alabama</option>
        <option value="AK">Alaska</option>
        <option value="AZ">Arizona</option>
        <option value="AR">Arkansas</option>
        <option value="CA">California</option>
        <option value="CO">Colorado</option>
        <option value="CT">Connecticut</option>
        <option value="DE">Delaware</option>
        <option value="DC">District Of Columbia</option>
        <option value="FL">Florida</option>
        <option value="GA">Georgia</option>
        <option value="HI">Hawaii</option>
        <option value="ID">Idaho</option>
        <option value="IL">Illinois</option>
        <option value="IN">Indiana</option>
        <option value="IA">Iowa</option>
        <option value="KS">Kansas</option>
        <option value="KY">Kentucky</option>
        <option value="LA">Louisiana</option>
        <option value="ME">Maine</option>
        <option value="MD">Maryland</option>
        <option value="MA">Massachusetts</option>
        <option value="MI">Michigan</option>
        <option value="MN">Minnesota</option>
        <option value="MS">Mississippi</option>
        <option value="MO">Missouri</option>
        <option value="MT">Montana</option>
        <option value="NE">Nebraska</option>
        <option value="NV">Nevada</option>
        <option value="NH">New Hampshire</option>
        <option value="NJ">New Jersey</option>
        <option value="NM">New Mexico</option>
        <option value="NY">New York</option>
        <option value="NC">North Carolina</option>
        <option value="ND">North Dakota</option>
        <option value="OH">Ohio</option>
        <option value="OK">Oklahoma</option>
        <option value="OR">Oregon</option>
        <option value="PA">Pennsylvania</option>
        <option value="RI">Rhode Island</option>
        <option value="SC">South Carolina</option>
        <option value="SD">South Dakota</option>
        <option value="TN">Tennessee</option>
        <option value="TX">Texas</option>
        <option value="UT">Utah</option>
        <option value="VT">Vermont</option>
        <option value="VA">Virginia</option>
        <option value="WA">Washington</option>
        <option value="WV">West Virginia</option>
        <option value="WI">Wisconsin</option>
        <option value="WY">Wyoming</option>`;
        break;
      case "Canada":
        document.getElementById("state-select").disabled = false;
        stateSelectDropdown.innerHTML = `<option value="AB">Alberta</option>
        <option value="BC">British Columbia</option>
        <option value="MB">Manitoba</option>
        <option value="NB">New Brunswick</option>
        <option value="NL">Newfoundland and Labrador</option>
        <option value="NS">Nova Scotia</option>
        <option value="NT">Northwest Territories</option>
        <option value="NU">Nunavut</option>
        <option value="ON">Ontario</option>
        <option value="PE">Prince Edward Island</option>
        <option value="QC">Quebec</option>
        <option value="SK">Saskatchewan</option>
        <option value="YT">Yukon</option>`;
        break;
      case "United Kingdom":
        document.getElementById("state-select").disabled = true;
        document.getElementById("state-select").innerHTML = "";
        break;
    }
  });

  let addAddressButton = document.getElementById("add-address-button");
  try {
    let backbutton = document.getElementById("back-button");

    // Adds event listener for the back button.
    backbutton.addEventListener("click", () => {
      window.location.href = "/views/confirmation.html?from=addaddress";
    });

    // Adds event listener for the add address button.
    addAddressButton.addEventListener("click", async () => {
      await addAddressButtonClicked();
    });
  } catch {}
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
  const state =
    document.getElementById("state-select").disabled == false
      ? document.getElementById("state-select").value
      : null;
  const country = document.getElementById("country-select").value;
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

  if (
    !new RegExp(
      "^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$"
    ).test(phone)
  ) {
    const addAddressButton = document.getElementById("add-address-button");
    const errorTextQuery = document.getElementsByClassName(
      "error-text text-center"
    );
    if (errorTextQuery.length === 0) {
      const errorText = document.createElement("p");
      errorText.classList = "error-text text-center";
      errorText.innerText = "Invalid Phone Number Format";
      addAddressButton.after(errorText);
      return;
    }

    errorTextQuery[0].innerText = "Invalid Phone Number Format";
    return;
  }

  switch (country) {
    case "United States of America":
      if (!new RegExp("^\\d{5}(?:[-\\s]\\d{4})?$").test(zip)) {
        const addAddressButton = document.getElementById("add-address-button");
        const errorTextQuery = document.getElementsByClassName(
          "error-text text-center"
        );
        if (errorTextQuery.length === 0) {
          const errorText = document.createElement("p");
          errorText.classList = "error-text text-center";
          errorText.innerText = "Invalid Zipcode Format";
          addAddressButton.after(errorText);
          return;
        }

        errorTextQuery[0].innerText = "Invalid Zipcode Format";
        return;
      }
      break;
    case "United Kingdom":
      if (
        !new RegExp(
          "([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\\s?[0-9][A-Za-z]{2})"
        ).test(zip)
      ) {
        const addAddressButton = document.getElementById("add-address-button");
        const errorTextQuery = document.getElementsByClassName(
          "error-text text-center"
        );
        if (errorTextQuery.length === 0) {
          const errorText = document.createElement("p");
          errorText.classList = "error-text text-center";
          errorText.innerText = "Invalid Postal Code";
          addAddressButton.after(errorText);
          return;
        }

        errorTextQuery[0].innerText = "Invalid Postal Code";
        return;
      }
      break;
    case "Canada":
      if (
        !new RegExp(
          "[ABCEGHJKLMNPRSTVXY][0-9][ABCEGHJKLMNPRSTVWXYZ] ?[0-9][ABCEGHJKLMNPRSTVWXYZ][0-9]"
        ).test(zip)
      ) {
        const addAddressButton = document.getElementById("add-address-button");
        const errorTextQuery = document.getElementsByClassName(
          "error-text text-center"
        );
        if (errorTextQuery.length === 0) {
          const errorText = document.createElement("p");
          errorText.classList = "error-text text-center";
          errorText.innerText = "Invalid Postal Code";
          addAddressButton.after(errorText);
          return;
        }

        errorTextQuery[0].innerText = "Invalid Postal Code";
        return;
      }
      break;
  }
  console.log("address is " + JSON.stringify(address));
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
    setUpAddAddressButton();
  } catch (err) {
    new LogError(
      "Building Address Popup Failed (Uncaught)",
      err.stack,
      {},
      "Building Address Popup Failed",
      Date.now(),
      () => {}
    );
  }
}

addressMain();
