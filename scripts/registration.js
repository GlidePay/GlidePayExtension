// ANY EDITS TO THIS MUST BE COMPILED WITH "npm run buildMask"
const loginButton = document.getElementById('loginButton')
const userWallet = document.getElementById('userWallet')
const createProvider = require('metamask-extension-provider')
const Eth = require('ethjs')
const provider = createProvider()
const transactButton = document.getElementById('transactButton')

chrome.storage.local.get('userWalletAddress', function(result) {
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

function addTransactButton() {
    transactButton.addEventListener('click', async () => {
        const eth = new Eth(provider);
        eth.sendTransaction({
            from: localStorage.getItem('userWalletAddress'),
            // replace with our address
            to: '0x6e0E0e02377Bc1d90E8a7c21f12BA385C2C35f78',
            value: '45000000',
            gas: '3000000',
            data: '0x',
        }).then((result) => {
            alert(result)
        }).catch((error) => {
            console.log(error)
        })
    });
}

async function loginWithMetaMask() {
    const accounts = await Promise.all([
        provider.request({
            method: 'eth_requestAccounts',
        }),
    ])
    if (!accounts) { return }
    chrome.storage.local.set({'userWalletAddress': accounts[0]}, function() {
        console.log('Value is set to ' + accounts[0]);
    });
    chrome.storage.local.get('userWalletAddress', function(result) {
        userWallet.innerText = result.userWalletAddress
    });
    loginButton.innerText = 'Sign out of MetaMask'

    loginButton.removeEventListener('click', loginWithMetaMask)
    setTimeout(() => {
        loginButton.addEventListener('click', signOutOfMetaMask)
    }, 200)
}

function signOutOfMetaMask() {
    chrome.storage.local.set({'userWalletAddress': null}, function() {
        console.log('Value is set to ' + null);
    });
    userWallet.innerText = ''
    loginButton.innerText = 'Sign in with MetaMask'

    loginButton.removeEventListener('click', signOutOfMetaMask)
    setTimeout(() => {
        loginButton.addEventListener('click', loginWithMetaMask)
    }, 200)
}

window.addEventListener('DOMContentLoaded', () => {
    toggleButton()
    addTransactButton()
});
