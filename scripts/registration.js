// ANY EDITS TO THIS MUST BE COMPILED WITH "npm run buildMask"
window.userWalletAddress = null
const loginButton = document.getElementById('loginButton')
const userWallet = document.getElementById('userWallet')
const createProvider = require('metamask-extension-provider')
const Eth = require('ethjs')
const provider = createProvider()
const transactButton = document.getElementById('transactButton')

function toggleButton() {
    if (!provider) {
        loginButton.innerText = 'MetaMask is not installed'
        loginButton.classList.remove('bg-purple-500', 'text-white')
        loginButton.classList.add('bg-gray-500', 'text-gray-100', 'cursor-not-allowed')
        return false
    }
    loginButton.addEventListener('click', loginWithMetaMask)
}

function addTransactButton() {
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
    window.userWalletAddress = accounts[0]
    userWallet.innerText = window.userWalletAddress
    loginButton.innerText = 'Sign out of MetaMask'

    loginButton.removeEventListener('click', loginWithMetaMask)
    setTimeout(() => {
        loginButton.addEventListener('click', signOutOfMetaMask)
    }, 200)
}

function signOutOfMetaMask() {
    window.userWalletAddress = null
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
