function main() {
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
        createAddressResponse.error,
        "Create address failed",
        {
          token: token,
          address: address,
        },
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

main();
