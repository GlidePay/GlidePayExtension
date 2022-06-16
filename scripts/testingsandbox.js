const loginButton = document.getElementById('loginButton')
const userWallet = document.getElementById('userWallet')
const createProvider = require('metamask-extension-provider')
const Eth = require('ethjs')
const provider = createProvider()
const transactButton = document.getElementById('transactButton')

//TODO: Move metamask sign in functions to the appropriate locations.

chrome.runtime.sendMessage({from: 'registration', subject: 'needAccount'}, function(result) {
    if (result.userWalletAddress !== null) {
        userWallet.innerText = result.userWalletAddress
        loginButton.innerText = 'Sign out of MetaMask'
        setTimeout(() => {
            loginButton.addEventListener('click', signOutOfMetaMask)
        }, 200)
    } else {
        userWallet.innerText = ''
        loginButton.innerText = 'Sign in with MetaMask'
        setTimeout(() => {
            loginButton.addEventListener('click', loginWithMetaMask)
        }, 200);
    }
});

function toggleButton() {
    if (!provider) {
        loginButton.innerText = 'MetaMask is not installed'
        loginButton.classList.remove('bg-purple-500', 'text-white')
        loginButton.classList.add('bg-gray-500', 'text-gray-100', 'cursor-not-allowed')
        return false
    }
}

function addTransactButtonWallet() {
    chrome.runtime.sendMessage({from: 'registration', subject: 'needAccount'}, function(result) {
        addTransactButton(result.userWalletAddress);
    });
}


// TODO: Move these functions to the cartconfirmation file and make them async.
function addTransactButton(userWalletAddress) {
    let transactionHash;
    transactButton.addEventListener('click', async () => {
        const eth = new Eth(provider);
        eth.sendTransaction({
            from: userWalletAddress[0],
            // replace with our address
            to: '0x6e0E0e02377Bc1d90E8a7c21f12BA385C2C35f78',
            value: '45000000',
            gas: '3000000',
            data: '0x',
        }).then((result) => {
            transactionHash = result;
            transactionStatus(transactionHash);
            alert(result)
        }).catch((error) => {
            console.error(error)
        })
    });
}

// ETHERSCAN API functions
function transactionStatus(transactionHash) {
    var api = require('etherscan-api').init(process.env.ETHERSCAN_API_KEY);
    var promiseObject = api.proxy.eth_getTransactionByHash(transactionHash);
    promiseObject.then(value => {
        successfulTransaction(value);
    }).catch(error => {
        failedTransaction(error);
    });
}

function successfulTransaction(message) {
    console.log("Successful Transaction");
    console.log(message.toString());
    // Convert crypto to cash
    // Send order info to Zinc API
    // tell Zinc API to buy
}

function failedTransaction(message) {
    console.error("Failed transaction");
    // Show user that transaction failed
}

async function loginWithMetaMask() {
    const accounts = await Promise.all([
        provider.request({
            method: 'eth_requestAccounts',
        }),
    ])
    if (!accounts) { return }
    chrome.runtime.sendMessage({from: 'registration', subject: 'signedIn', account: accounts[0]});
    userWallet.innerText = accounts[0];
    loginButton.innerText = 'Sign out of MetaMask'

    loginButton.removeEventListener('click', loginWithMetaMask)
    setTimeout(() => {
        loginButton.addEventListener('click', signOutOfMetaMask)
    }, 200)
}

function signOutOfMetaMask() {
    chrome.runtime.sendMessage({from: 'registration', subject: 'signedOut'});
    userWallet.innerText = ''
    loginButton.innerText = 'Sign in with MetaMask'

    loginButton.removeEventListener('click', signOutOfMetaMask)
    setTimeout(() => {
        loginButton.addEventListener('click', loginWithMetaMask)
    }, 200)
}

window.addEventListener('DOMContentLoaded', () => {
    toggleButton()
    addTransactButtonWallet()
});

