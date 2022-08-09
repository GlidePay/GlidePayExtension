
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
async function main(){
  console.log('running')
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
window.close()
}
)

walletConnect.addEventListener("click", async() => {
    // Create a connector
    const connector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org", // Required
      qrcodeModal: QRCodeModal,
    });
    console.log(connector)
    // Check if connection is already established
    if (!connector.connected) {
      // create new session
      connector.createSession();
    } else {
      const windows = await chrome.windows.getAll({ populate: true });
      for (let a in windows) {
        for (let b in windows[a].tabs) {
          if (windows[a].tabs[b].id === senderTabID) {
            const response = await chrome.tabs.sendMessage(
              windows[a].tabs[b].id,
              {
                from: "popup",
                subject: "walletChoice",
                wallet: 'walletConnect'
              }
              
    )
    console.log(response);}}
    }
    window.close();
    }
    console.log('connected')
    // Subscribe to connection events
    connector.on("connect", async (error, payload) => {
      if (error) {
        throw error;
      }

      // Get provided accounts and chainId
      const { accounts, chainId } = payload.params[0];

      const windows = await chrome.windows.getAll({ populate: true });
      for (let a in windows) {
        for (let b in windows[a].tabs) {
          if (windows[a].tabs[b].id === senderTabID) {
            const response = await chrome.tabs.sendMessage(
              windows[a].tabs[b].id,
              {
                from: "popup",
                subject: "walletChoice",
                wallet: 'walletConnect'
              }
              
    )
    console.log(response);}}
    }});})}


main()