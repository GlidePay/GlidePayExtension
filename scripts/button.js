(function () {
    function addButton() {
        var button = document.createElement("input");
        button.value = "Pay with crypto.";
        button.id = "crypto-button";
        button.type = "button";
        // Having trouble getting the line of code below to work. We will need to find an
        // element on the page that we can reliably query for.
        document.getElementsByClassName(".a-container").appendChild(button);
    }

    function defineEvent() {
        document.getElementById("crypto-button").addEventListener("click", function (event) {
            alert("Pay with crypto.");
        });
    }

    addButton();
    defineEvent();
})();