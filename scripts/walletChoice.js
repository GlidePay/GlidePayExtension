const walletConnect = require("@walletconnect/client")
const WalletConnectQRCodeModal = require("@walletconnect/qrcode-modal")
const walletnode = require('@walletconnect/node');

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
          const walletConnector = new walletnode.NodeWalletConnect(
            {
              bridge: "https://bridge.walletconnect.org", // Required
            },
            {
              clientMeta: {
                description: "WalletConnect NodeJS Client",
                url: "https://nodejs.org/en/",
                icons: ["https://nodejs.org/static/images/logo.svg"],
                name: "WalletConnect",
              },
            }
          );
          
          // Check if connection is already established
          if (!walletConnector.connected) {
            // create new session
            walletConnector.createSession().then(() => {
              // get uri for QR Code modal
              const uri = walletConnector.uri;
              // display QR Code modal
              WalletConnectQRCodeModal.open(
                uri,
                () => {
                  console.log("QR Code Modal closed");
                },
                true // isNode = true
              );
            });
          }
          
          // Subscribe to connection events
          walletConnector.on("connect", (error, payload) => {
            if (error) {
              throw error;
            }
          
            // Close QR Code Modal
            WalletConnectQRCodeModal.close(
              true // isNode = true
            );
          
            // Get provided accounts and chainId
            const { accounts, chainId } = payload.params[0];
          });
          
          walletConnector.on("session_update", (error, payload) => {
            if (error) {
              throw error;
            }
          
            // Get updated accounts and chainId
            const { accounts, chainId } = payload.params[0];
          });
          
          walletConnector.on("disconnect", (error, payload) => {
            if (error) {
              throw error;
            }
          
            // Delete walletConnector
          });
        }}}})}


main()