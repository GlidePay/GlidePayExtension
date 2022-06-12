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

function triggerTransaction() {
    if (!window.userWalletAddress) {
        alert('Please sign in with MetaMask')
        return
    }
    if (!provider) {
        alert('Please install MetaMask')
        return
    }
    transactButton.addEventListener('click', () => {
        provider.request({
            method: 'eth_sendTransaction',
            params: [
                {
                    from: window.userWalletAddress,
                    to: '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
                    value: '0x29a2241af62c0000',
                    gasPrice: '0x09184e72a000',
                    gas: '0x2710',
                },
            ],
        }).then((txHash) => console.log(txHash)).catch((error) => console.error)
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
