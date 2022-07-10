(function () {
    let confirmButton = document.getElementById("submit-button");
    let backbutton = document.getElementById("back-button");

    backbutton.addEventListener("click", function (event) {
       window.location.href = "confirmation.html";
    });

    confirmButton.addEventListener("click", () => {
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

        chrome.storage.session.get("userid", function (result) {
            console.log("USERID" + result["userid"]);
            if (saveAddressButton.checked) {
                createAddress(result["userid"], address).then(() => {
                    window.location.href = "/views/confirmation.html";
                });
            } else {
                sessionStorage.setItem("tempAddress", JSON.stringify(address));
                window.location.href = "/views/confirmation.html";
            }
        });
    });

    async function createAddress(userid, address) {
        console.log("user" + userid);
        const data = {
            userid: userid,
            address: address,
        };

        return fetch(
            "https://6zfr42udog.execute-api.us-east-1.amazonaws.com/default/createAddressRDS",
            {
                method: "post",
                body: JSON.stringify(data),
            }
        )
            .then((response) => response.text())
            .then((responseData) => {
                console.log(JSON.parse(responseData));
            });
    }
})();
