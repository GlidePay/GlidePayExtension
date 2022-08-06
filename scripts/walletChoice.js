const metamask = document.getElementById("metamask");
const walletConnect = document.getElementById("walletConnect");


const senderTabID = await chrome.runtime.sendMessage({
    from: "confirmation",
    subject: "getTabID",
  });

metamask.addEventListener("click", async () => {
    const windows = await chrome.windows.getAll({ populate: true });
    for (let a in windows) {
      for (let b in windows[a].tabs) {
        if (windows[a].tabs[b].id === senderTabID) {
          console.log("Requesting popup info");
          const response = await chrome.tabs.sendMessage(
            windows[a].tabs[b].id,
            {
              from: "popup",
              subject: "walletChoice",
              wallet: 'metamask'
            }
          );
          console.log(response)
        }
    }
}
})

walletConnect.addEventListener("click", async() => {
    const windows = await chrome.windows.getAll({ populate: true });
    for (let a in windows) {
      for (let b in windows[a].tabs) {
        if (windows[a].tabs[b].id === senderTabID) {
          console.log("Requesting popup info");
          const response = await chrome.tabs.sendMessage(
            windows[a].tabs[b].id,
            {
              from: "popup",
              subject: "walletChoice",
              wallet: 'walletConnect'
            }
          );
          console.log(response)
        }
    }
}
})