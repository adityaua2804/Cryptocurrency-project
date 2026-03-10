// Contract configuration - Update this after deploying your contract
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE"; // Replace after deployment
const CONTRACT_ABI = [
    {
        "inputs": [{"internalType": "uint256", "name": "_initialSupply", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
            {"indexed": true, "internalType": "address", "name": "spender", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "from", "type": "address"},
            {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "", "type": "address"},
            {"internalType": "address", "name": "", "type": "address"}
        ],
        "name": "allowance",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "_spender", "type": "address"},
            {"internalType": "uint256", "name": "_value", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"internalType": "bool", "name": "success", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "_to", "type": "address"},
            {"internalType": "uint256", "name": "_value", "type": "uint256"}
        ],
        "name": "transfer",
        "outputs": [{"internalType": "bool", "name": "success", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "_from", "type": "address"},
            {"internalType": "address", "name": "_to", "type": "address"},
            {"internalType": "uint256", "name": "_value", "type": "uint256"}
        ],
        "name": "transferFrom",
        "outputs": [{"internalType": "bool", "name": "success", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Global variables
let web3;
let contract;
let userAccount;
let decimals = 18;

// DOM Elements
const connectBtn = document.getElementById('connectBtn');
const connectionStatus = document.getElementById('connectionStatus');
const walletAddress = document.getElementById('walletAddress');
const tokenName = document.getElementById('tokenName');
const tokenSymbol = document.getElementById('tokenSymbol');
const tokenDecimals = document.getElementById('tokenDecimals');
const totalSupply = document.getElementById('totalSupply');
const userBalance = document.getElementById('userBalance');
const transferForm = document.getElementById('transferForm');
const approveForm = document.getElementById('approveForm');
const allowanceForm = document.getElementById('allowanceForm');
const txStatus = document.getElementById('txStatus');
const txMessage = document.getElementById('txMessage');
const closeTx = document.getElementById('closeTx');
const allowanceResult = document.getElementById('allowanceResult');
const allowanceValue = document.getElementById('allowanceValue');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    connectBtn.addEventListener('click', connectWallet);
    transferForm.addEventListener('submit', handleTransfer);
    approveForm.addEventListener('submit', handleApprove);
    allowanceForm.addEventListener('submit', handleCheckAllowance);
    closeTx.addEventListener('click', hideTxStatus);

    // Check if already connected
    if (window.ethereum && window.ethereum.selectedAddress) {
        connectWallet();
    }
});

// Connect Wallet
async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        showTxStatus('Please install MetaMask to use this dApp', 'error');
        return;
    }

    try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        userAccount = accounts[0];

        // Initialize Web3
        web3 = new Web3(window.ethereum);

        // Initialize contract
        contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

        // Update UI
        connectBtn.textContent = 'Connected';
        connectBtn.disabled = true;
        connectionStatus.classList.remove('hidden');
        walletAddress.textContent = formatAddress(userAccount);

        // Load token data
        await loadTokenData();
        await updateBalance();

        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountChange);
        window.ethereum.on('chainChanged', () => window.location.reload());

        showTxStatus('Wallet connected successfully!', 'success');
    } catch (error) {
        console.error('Connection error:', error);
        showTxStatus('Failed to connect wallet: ' + error.message, 'error');
    }
}

// Handle account change
async function handleAccountChange(accounts) {
    if (accounts.length === 0) {
        // Disconnected
        userAccount = null;
        connectBtn.textContent = 'Connect Wallet';
        connectBtn.disabled = false;
        connectionStatus.classList.add('hidden');
        userBalance.textContent = '0.00';
    } else {
        userAccount = accounts[0];
        walletAddress.textContent = formatAddress(userAccount);
        await updateBalance();
    }
}

// Load token data
async function loadTokenData() {
    try {
        const [name, symbol, dec, supply] = await Promise.all([
            contract.methods.name().call(),
            contract.methods.symbol().call(),
            contract.methods.decimals().call(),
            contract.methods.totalSupply().call()
        ]);

        decimals = parseInt(dec);
        tokenName.textContent = name;
        tokenSymbol.textContent = symbol;
        tokenDecimals.textContent = decimals;
        totalSupply.textContent = formatTokenAmount(supply) + ' ' + symbol;
    } catch (error) {
        console.error('Error loading token data:', error);
        showTxStatus('Error loading token data. Check contract address.', 'error');
    }
}

// Update user balance
async function updateBalance() {
    if (!userAccount || !contract) return;

    try {
        const balance = await contract.methods.balanceOf(userAccount).call();
        userBalance.textContent = formatTokenAmount(balance);
    } catch (error) {
        console.error('Error fetching balance:', error);
    }
}

// Handle transfer
async function handleTransfer(e) {
    e.preventDefault();

    const to = document.getElementById('transferTo').value.trim();
    const amount = document.getElementById('transferAmount').value;

    if (!web3.utils.isAddress(to)) {
        showTxStatus('Invalid recipient address', 'error');
        return;
    }

    const amountWei = toWei(amount);

    try {
        showTxStatus('Confirming transaction in MetaMask...', 'pending');

        await contract.methods.transfer(to, amountWei).send({ from: userAccount });

        showTxStatus('Transfer successful!', 'success');
        await updateBalance();
        transferForm.reset();
    } catch (error) {
        console.error('Transfer error:', error);
        showTxStatus('Transfer failed: ' + (error.message || 'Unknown error'), 'error');
    }
}

// Handle approve
async function handleApprove(e) {
    e.preventDefault();

    const spender = document.getElementById('spenderAddress').value.trim();
    const amount = document.getElementById('approveAmount').value;

    if (!web3.utils.isAddress(spender)) {
        showTxStatus('Invalid spender address', 'error');
        return;
    }

    const amountWei = toWei(amount);

    try {
        showTxStatus('Confirming approval in MetaMask...', 'pending');

        await contract.methods.approve(spender, amountWei).send({ from: userAccount });

        showTxStatus('Approval successful!', 'success');
        approveForm.reset();
    } catch (error) {
        console.error('Approve error:', error);
        showTxStatus('Approval failed: ' + (error.message || 'Unknown error'), 'error');
    }
}

// Handle check allowance
async function handleCheckAllowance(e) {
    e.preventDefault();

    const owner = document.getElementById('ownerAddress').value.trim();
    const spender = document.getElementById('spenderCheck').value.trim();

    if (!web3.utils.isAddress(owner) || !web3.utils.isAddress(spender)) {
        showTxStatus('Invalid address(es)', 'error');
        return;
    }

    try {
        const allowance = await contract.methods.allowance(owner, spender).call();
        allowanceValue.textContent = formatTokenAmount(allowance) + ' MLC';
        allowanceResult.classList.remove('hidden');
    } catch (error) {
        console.error('Allowance check error:', error);
        showTxStatus('Error checking allowance', 'error');
    }
}

// Utility functions
function formatAddress(address) {
    return address.slice(0, 6) + '...' + address.slice(-4);
}

function formatTokenAmount(amount) {
    const value = BigInt(amount);
    const divisor = BigInt(10 ** decimals);
    const intPart = value / divisor;
    const fracPart = value % divisor;

    // Format fractional part with proper padding
    let fracStr = fracPart.toString().padStart(decimals, '0');
    // Show only 4 decimal places
    fracStr = fracStr.slice(0, 4);

    // Remove trailing zeros
    fracStr = fracStr.replace(/0+$/, '');

    if (fracStr) {
        return intPart.toString() + '.' + fracStr;
    }
    return intPart.toString();
}

function toWei(amount) {
    const [intPart, fracPart = ''] = amount.split('.');
    const paddedFrac = fracPart.padEnd(decimals, '0').slice(0, decimals);
    return BigInt(intPart + paddedFrac).toString();
}

function showTxStatus(message, type) {
    txMessage.textContent = message;
    txStatus.className = 'tx-status ' + type;
    txStatus.classList.remove('hidden');

    if (type === 'success') {
        setTimeout(hideTxStatus, 5000);
    }
}

function hideTxStatus() {
    txStatus.classList.add('hidden');
}
