
async function main() {
  console.log("running");
  const metamask = document.getElementById("metamask");
  const walletConnect = document.getElementById("walletConnect");
  const pera = document.getElementById("pera");
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
          await chrome.tabs.sendMessage(windows[a].tabs[b].id, {
            from: "popup",
            subject: "walletChoice",
            wallet: "metamask",
          });
        }
      }
    }
    window.close();
  });


  walletConnect.addEventListener("click", async() => {
    console.log('walletConnect')
    const windows = await chrome.windows.getAll({ populate: true });
    for (let a in windows) {
      for (let b in windows[a].tabs) {
        if (windows[a].tabs[b].id === senderTabID) {
          console.log("Requesting popup info");
          await chrome.tabs.sendMessage(windows[a].tabs[b].id, {
            from: "popup",
            subject: "walletChoice",
            wallet: "walletConnect",
          });
        }
      }
    }
    window.close();
  })

  // If the user clicks pera wallet option
  pera.addEventListener("click", async () => {
    console.log("click");
    const windows = await chrome.windows.getAll({ populate: true });
    for (let a in windows) {
      for (let b in windows[a].tabs) {
        if (windows[a].tabs[b].id === senderTabID) {
          // We send a message back to the content script to let it know that the user has chosen pera
          await chrome.tabs.sendMessage(windows[a].tabs[b].id, {
            from: "popup",
            subject: "walletChoice",
            wallet: "pera",
          });
        }
      }
    }
    window.close();
  });
}

main();
