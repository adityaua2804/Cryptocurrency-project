// Contract configuration - Update this after deploying your contract
const CONTRACT_ADDRESS = "0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab"; // Deployed contract
const EXPECTED_CHAIN_ID = 1337; // Ganache default chain ID (use 5777 for older Ganache)

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
        "inputs": [
            {"internalType": "address", "name": "_spender", "type": "address"},
            {"internalType": "uint256", "name": "_subtractedValue", "type": "uint256"}
        ],
        "name": "decreaseAllowance",
        "outputs": [{"internalType": "bool", "name": "success", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "_spender", "type": "address"},
            {"internalType": "uint256", "name": "_addedValue", "type": "uint256"}
        ],
        "name": "increaseAllowance",
        "outputs": [{"internalType": "bool", "name": "success", "type": "bool"}],
        "stateMutability": "nonpayable",
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
let tokenSymbol = "MLC";
let userBalanceWei = BigInt(0);

// DOM Elements
const connectBtn = document.getElementById('connectBtn');
const connectionStatus = document.getElementById('connectionStatus');
const walletAddress = document.getElementById('walletAddress');
const networkWarning = document.getElementById('networkWarning');
const tokenNameEl = document.getElementById('tokenName');
const tokenSymbolEl = document.getElementById('tokenSymbol');
const tokenDecimalsEl = document.getElementById('tokenDecimals');
const totalSupplyEl = document.getElementById('totalSupply');
const userBalanceEl = document.getElementById('userBalance');
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

    // Add max button functionality
    const maxBtn = document.getElementById('maxBtn');
    if (maxBtn) {
        maxBtn.addEventListener('click', fillMaxBalance);
    }

    // Add input validation listeners
    setupInputValidation();
});

// Setup real-time input validation
function setupInputValidation() {
    const transferAmount = document.getElementById('transferAmount');
    const transferTo = document.getElementById('transferTo');

    if (transferAmount) {
        transferAmount.addEventListener('input', validateTransferAmount);
    }
    if (transferTo) {
        transferTo.addEventListener('input', validateAddress);
    }
}

// Validate transfer amount in real-time
function validateTransferAmount(e) {
    const input = e.target;
    const value = input.value.trim();
    const errorEl = input.parentElement.querySelector('.input-error');

    if (!value) {
        clearInputError(input, errorEl);
        return;
    }

    if (!isValidAmount(value)) {
        showInputError(input, errorEl, 'Please enter a valid positive number');
        return;
    }

    try {
        const amountWei = toWei(value);
        if (userBalanceWei > 0 && BigInt(amountWei) > userBalanceWei) {
            showInputError(input, errorEl, 'Amount exceeds your balance');
            return;
        }
    } catch {
        showInputError(input, errorEl, 'Invalid amount format');
        return;
    }

    clearInputError(input, errorEl);
}

// Validate address in real-time
function validateAddress(e) {
    const input = e.target;
    const value = input.value.trim();
    const errorEl = input.parentElement.querySelector('.input-error');

    if (!value) {
        clearInputError(input, errorEl);
        return;
    }

    if (!web3 || !web3.utils.isAddress(value)) {
        showInputError(input, errorEl, 'Invalid Ethereum address');
        return;
    }

    clearInputError(input, errorEl);
}

function showInputError(input, errorEl, message) {
    input.classList.add('input-invalid');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }
}

function clearInputError(input, errorEl) {
    input.classList.remove('input-invalid');
    if (errorEl) {
        errorEl.classList.add('hidden');
    }
}

// Fill max balance
function fillMaxBalance() {
    const transferAmount = document.getElementById('transferAmount');
    if (transferAmount && userBalanceWei > 0) {
        transferAmount.value = formatTokenAmount(userBalanceWei.toString());
        transferAmount.dispatchEvent(new Event('input'));
    }
}

// Check if valid amount string
function isValidAmount(value) {
    if (!value || value.trim() === '') return false;
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && isFinite(num);
}

// Switch Account — show custom in-page account picker
async function switchAccount() {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (!accounts.length) return;

    const modal = document.getElementById('accountModal');
    const list  = document.getElementById('accountList');

    list.innerHTML = '';

    for (const addr of accounts) {
        let bal = '...';
        try {
            const raw = await web3.eth.getBalance(addr);
            bal = parseFloat(web3.utils.fromWei(raw, 'ether')).toFixed(3) + ' ETH';
        } catch {}

        const li = document.createElement('li');
        li.className = 'account-item' + (addr.toLowerCase() === userAccount.toLowerCase() ? ' active' : '');

        li.innerHTML = `
            <div class="account-avatar">${addr.slice(2,4).toUpperCase()}</div>
            <div class="account-info">
                <span class="account-addr">${formatAddress(addr)}</span>
                <span class="account-bal">${bal}</span>
            </div>`;

        li.addEventListener('click', async () => {
            userAccount = addr;
            walletAddress.textContent = formatAddress(addr);
            await updateBalance();
            showTxStatus('Switched to ' + formatAddress(addr), 'success');
            modal.classList.add('hidden');
        });

        list.appendChild(li);
    }

    modal.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('accountModal').classList.add('hidden');
    });
});

// Connect Wallet
async function connectWallet() {
    if (userAccount) {
        await switchAccount();
        return;
    }

    if (typeof window.ethereum === 'undefined') {
        showTxStatus('Please install MetaMask to use this dApp', 'error');
        return;
    }

    // Validate contract address
    if (CONTRACT_ADDRESS === "YOUR_CONTRACT_ADDRESS_HERE") {
        showTxStatus('Contract address not configured. Please update CONTRACT_ADDRESS in app.js', 'error');
        return;
    }

    setButtonLoading(connectBtn, true, 'Connecting...');

    try {
        // Request account access — requestPermissions lets user pick multiple accounts
        await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
        });
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        userAccount = accounts[0];

        // Initialize Web3
        web3 = new Web3(window.ethereum);

        // Check network
        const isCorrectNetwork = await checkNetwork();
        if (!isCorrectNetwork) {
            setButtonLoading(connectBtn, false, 'Connect Wallet');
            return;
        }

        // Initialize contract
        contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

        // Update UI
        connectBtn.textContent = 'Switch Account';
        connectBtn.disabled = false;
        connectBtn.classList.remove('btn-primary');
        connectBtn.classList.add('btn-secondary');
        connectionStatus.classList.remove('hidden');
        walletAddress.textContent = formatAddress(userAccount);

        // Load token data
        await loadTokenData();
        await updateBalance();

        // Setup event listeners
        setupEventListeners();

        showTxStatus('Wallet connected successfully!', 'success');
    } catch (error) {
        console.error('Connection error:', error);
        showTxStatus(parseError(error), 'error');
        setButtonLoading(connectBtn, false, 'Connect Wallet');
    }
}

// Check if on correct network
async function checkNetwork() {
    try {
        const chainId = await web3.eth.getChainId();
        const chainIdNum = Number(chainId);

        if (chainIdNum !== EXPECTED_CHAIN_ID) {
            if (networkWarning) {
                networkWarning.classList.remove('hidden');
            }
            showTxStatus(`Wrong network. Please switch to Ganache (Chain ID: ${EXPECTED_CHAIN_ID})`, 'error');

            // Try to switch network
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x' + EXPECTED_CHAIN_ID.toString(16) }],
                });
                if (networkWarning) {
                    networkWarning.classList.add('hidden');
                }
                return true;
            } catch (switchError) {
                // Network not added to MetaMask
                console.error('Could not switch network:', switchError);
                return false;
            }
        }

        if (networkWarning) {
            networkWarning.classList.add('hidden');
        }
        return true;
    } catch (error) {
        console.error('Network check error:', error);
        return true; // Allow connection anyway
    }
}

// Setup blockchain event listeners
function setupEventListeners() {
    // Listen for account changes
    window.ethereum.on('accountsChanged', handleAccountChange);
    window.ethereum.on('chainChanged', handleChainChange);

    // Listen for Transfer events to update balance in real-time
    if (contract && userAccount) {
        contract.events.Transfer({
            filter: { from: userAccount }
        }).on('data', () => {
            updateBalance();
        });

        contract.events.Transfer({
            filter: { to: userAccount }
        }).on('data', () => {
            updateBalance();
        });
    }
}

// Handle chain change
function handleChainChange() {
    showTxStatus('Network changed. Reloading...', 'pending');
    setTimeout(() => window.location.reload(), 1000);
}

// Handle account change
async function handleAccountChange(accounts) {
    if (accounts.length === 0) {
        // Disconnected
        userAccount = null;
        userBalanceWei = BigInt(0);
        connectBtn.textContent = 'Connect Wallet';
        connectBtn.disabled = false;
        connectBtn.classList.remove('btn-secondary');
        connectBtn.classList.add('btn-primary');
        connectionStatus.classList.add('hidden');
        userBalanceEl.textContent = '0.00';
        showTxStatus('Wallet disconnected', 'error');
    } else {
        userAccount = accounts[0];
        walletAddress.textContent = formatAddress(userAccount);
        await updateBalance();
        showTxStatus('Account changed', 'success');
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
        tokenSymbol = symbol;
        tokenNameEl.textContent = name;
        tokenSymbolEl.textContent = symbol;
        tokenDecimalsEl.textContent = decimals;
        totalSupplyEl.textContent = formatTokenAmount(supply) + ' ' + symbol;
    } catch (error) {
        console.error('Error loading token data:', error);
        showTxStatus('Error loading token data. Check contract address and network.', 'error');
    }
}

// Update user balance
async function updateBalance() {
    if (!userAccount || !contract) return;

    try {
        const balance = await contract.methods.balanceOf(userAccount).call();
        userBalanceWei = BigInt(balance);
        userBalanceEl.textContent = formatTokenAmount(balance);
    } catch (error) {
        console.error('Error fetching balance:', error);
    }
}

// Handle transfer
async function handleTransfer(e) {
    e.preventDefault();

    if (!ensureConnected()) return;

    const toInput = document.getElementById('transferTo');
    const amountInput = document.getElementById('transferAmount');
    const submitBtn = transferForm.querySelector('button[type="submit"]');

    const to = toInput.value.trim();
    const amount = amountInput.value.trim();

    // Validation
    if (!web3.utils.isAddress(to)) {
        showTxStatus('Invalid recipient address', 'error');
        return;
    }

    if (to.toLowerCase() === userAccount.toLowerCase()) {
        showTxStatus('Cannot transfer to yourself', 'error');
        return;
    }

    if (!isValidAmount(amount)) {
        showTxStatus('Please enter a valid amount', 'error');
        return;
    }

    let amountWei;
    try {
        amountWei = toWei(amount);
    } catch (error) {
        showTxStatus('Invalid amount format', 'error');
        return;
    }

    // Check balance
    if (BigInt(amountWei) > userBalanceWei) {
        showTxStatus('Insufficient balance', 'error');
        return;
    }

    if (BigInt(amountWei) === BigInt(0)) {
        showTxStatus('Amount must be greater than zero', 'error');
        return;
    }

    setButtonLoading(submitBtn, true, 'Sending...');

    try {
        // Estimate gas first
        showTxStatus('Estimating gas...', 'pending');
        const gasEstimate = await contract.methods.transfer(to, amountWei).estimateGas({ from: userAccount });

        showTxStatus('Please confirm in MetaMask...', 'pending');
        const tx = await contract.methods.transfer(to, amountWei).send({
            from: userAccount,
            gas: Math.floor(Number(gasEstimate) * 1.2) // Add 20% buffer
        });

        showTxStatus(`Transfer successful! TX: ${formatAddress(tx.transactionHash)}`, 'success');
        await updateBalance();
        transferForm.reset();
    } catch (error) {
        console.error('Transfer error:', error);
        showTxStatus(parseError(error), 'error');
    } finally {
        setButtonLoading(submitBtn, false, 'Send Tokens');
    }
}

// Handle approve
async function handleApprove(e) {
    e.preventDefault();

    if (!ensureConnected()) return;

    const spenderInput = document.getElementById('spenderAddress');
    const amountInput = document.getElementById('approveAmount');
    const submitBtn = approveForm.querySelector('button[type="submit"]');

    const spender = spenderInput.value.trim();
    const amount = amountInput.value.trim();

    if (!web3.utils.isAddress(spender)) {
        showTxStatus('Invalid spender address', 'error');
        return;
    }

    if (!isValidAmount(amount)) {
        showTxStatus('Please enter a valid amount', 'error');
        return;
    }

    let amountWei;
    try {
        amountWei = toWei(amount);
    } catch (error) {
        showTxStatus('Invalid amount format', 'error');
        return;
    }

    setButtonLoading(submitBtn, true, 'Approving...');

    try {
        showTxStatus('Please confirm in MetaMask...', 'pending');

        const gasEstimate = await contract.methods.approve(spender, amountWei).estimateGas({ from: userAccount });

        const tx = await contract.methods.approve(spender, amountWei).send({
            from: userAccount,
            gas: Math.floor(Number(gasEstimate) * 1.2)
        });

        showTxStatus(`Approval successful! TX: ${formatAddress(tx.transactionHash)}`, 'success');
        approveForm.reset();
    } catch (error) {
        console.error('Approve error:', error);
        showTxStatus(parseError(error), 'error');
    } finally {
        setButtonLoading(submitBtn, false, 'Approve');
    }
}

// Handle check allowance
async function handleCheckAllowance(e) {
    e.preventDefault();

    if (!ensureConnected()) return;

    const ownerInput = document.getElementById('ownerAddress');
    const spenderInput = document.getElementById('spenderCheck');
    const submitBtn = allowanceForm.querySelector('button[type="submit"]');

    const owner = ownerInput.value.trim();
    const spender = spenderInput.value.trim();

    if (!web3.utils.isAddress(owner) || !web3.utils.isAddress(spender)) {
        showTxStatus('Invalid address(es)', 'error');
        allowanceResult.classList.add('hidden');
        return;
    }

    setButtonLoading(submitBtn, true, 'Checking...');

    try {
        const allowance = await contract.methods.allowance(owner, spender).call();
        allowanceValue.textContent = formatTokenAmount(allowance) + ' ' + tokenSymbol;
        allowanceResult.classList.remove('hidden');
    } catch (error) {
        console.error('Allowance check error:', error);
        showTxStatus('Error checking allowance', 'error');
        allowanceResult.classList.add('hidden');
    } finally {
        setButtonLoading(submitBtn, false, 'Check Allowance');
    }
}

// Ensure wallet is connected
function ensureConnected() {
    if (!userAccount || !contract) {
        showTxStatus('Please connect your wallet first', 'error');
        return false;
    }
    return true;
}

// Set button loading state
function setButtonLoading(button, isLoading, text) {
    if (!button) return;

    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.innerHTML = `<span class="spinner"></span> ${text}`;
    } else {
        button.disabled = false;
        button.textContent = text || button.dataset.originalText || 'Submit';
    }
}

// Utility functions
function formatAddress(address) {
    if (!address) return '';
    return address.slice(0, 6) + '...' + address.slice(-4);
}

function formatTokenAmount(amount) {
    try {
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
    } catch {
        return '0';
    }
}

function toWei(amount) {
    if (!amount || typeof amount !== 'string') {
        amount = String(amount || '0');
    }

    amount = amount.trim();

    // Validate the amount
    if (!/^[0-9]*\.?[0-9]*$/.test(amount) || amount === '' || amount === '.') {
        throw new Error('Invalid amount');
    }

    // Handle scientific notation
    if (amount.toLowerCase().includes('e')) {
        throw new Error('Scientific notation not supported');
    }

    const [intPart = '0', fracPart = ''] = amount.split('.');

    // Pad or truncate fractional part to match decimals
    const paddedFrac = fracPart.padEnd(decimals, '0').slice(0, decimals);

    // Remove leading zeros from int part (except if it's just "0")
    const cleanInt = intPart.replace(/^0+/, '') || '0';

    const result = cleanInt + paddedFrac;

    // Remove leading zeros from final result
    return result.replace(/^0+/, '') || '0';
}

// Parse error messages for user-friendly display
function parseError(error) {
    if (!error) return 'Unknown error occurred';

    // User rejected transaction
    if (error.code === 4001 || error.message?.includes('User denied')) {
        return 'Transaction rejected by user';
    }

    // Insufficient funds for gas
    if (error.code === -32603 || error.message?.includes('insufficient funds')) {
        return 'Insufficient funds for gas';
    }

    // Contract revert
    if (error.message?.includes('revert')) {
        const match = error.message.match(/revert\s+(.+?)(?:"|$)/i);
        if (match) {
            return match[1];
        }
        return 'Transaction reverted by contract';
    }

    // Gas estimation failed
    if (error.message?.includes('gas')) {
        return 'Transaction would fail - check your inputs';
    }

    // Network error
    if (error.message?.includes('network') || error.message?.includes('connect')) {
        return 'Network error - please check your connection';
    }

    return error.message || 'Transaction failed';
}

function showTxStatus(message, type) {
    txMessage.textContent = message;
    txStatus.className = 'tx-status ' + type;
    txStatus.classList.remove('hidden');
    txStatus.setAttribute('role', 'alert');
    txStatus.setAttribute('aria-live', 'polite');

    if (type === 'success') {
        setTimeout(hideTxStatus, 5000);
    }
}

function hideTxStatus() {
    txStatus.classList.add('hidden');
}
