(function () {
    console.log("GlidePayExtension connected");
    let div = document.createElement("div");
    chrome.runtime.sendMessage({
        from: "site",
        subject: "getToken",
    }, (response) => {
        div.innerHTML = `<div id="glidePayToken" data-token="${response}"></div>`;
        div.hidden = true;
        document.body.appendChild(div);
    });
})();