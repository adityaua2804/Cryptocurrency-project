# MyLabCoin (MLC)

An ERC-20 compliant token implementation built with Solidity and Truffle, featuring a web-based dashboard for token management.

## Features

- **ERC-20 Standard Compliance**: Implements all standard ERC-20 functions
- **Security Enhancements**: Zero-address validation, safe math operations
- **Extended Functions**: `increaseAllowance` and `decreaseAllowance` to prevent approval race conditions
- **Gas Optimized**: Uses `constant` declarations and `unchecked` blocks where safe
- **Web Dashboard**: Clean, accessible UI for interacting with the token via MetaMask

## Project Structure

```
mylabcoin/
├── contracts/           # Solidity smart contracts
│   └── MyCrypto.sol    # Main ERC-20 token contract
├── migrations/          # Truffle deployment scripts
├── test/               # Contract test files
├── client/             # Frontend web application
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Stylesheet
│   └── app.js          # Web3 integration
├── build/              # Compiled contract artifacts (auto-generated)
├── truffle-config.js   # Truffle configuration
├── package.json        # NPM dependencies and scripts
└── README.md           # This file
```

## Prerequisites

- [Node.js](https://nodejs.org/) >= 16.0.0
- [Truffle](https://trufflesuite.com/) >= 5.0.0
- [Ganache](https://trufflesuite.com/ganache/) (for local development)
- [MetaMask](https://metamask.io/) browser extension

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mylabcoin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Ganache**
   - Open Ganache and create a new workspace
   - Ensure it's running on `127.0.0.1:7545`

4. **Compile contracts**
   ```bash
   npm run compile
   ```

5. **Deploy to local network**
   ```bash
   npm run migrate
   ```

## Usage

### Running Tests

```bash
npm test
```

### Deploying Contracts

**Local Development (Ganache):**
```bash
npm run migrate
```

**Reset and Redeploy:**
```bash
npm run migrate:reset
```

### Using the Web Dashboard

1. After deploying, copy the contract address from the terminal output
2. Open `client/app.js` and update `CONTRACT_ADDRESS`
3. Start a local server:
   ```bash
   npm run serve
   ```
4. Open your browser to `http://localhost:3000`
5. Connect MetaMask to your local Ganache network
6. Connect your wallet using the dashboard

### MetaMask Configuration for Ganache

1. Open MetaMask > Settings > Networks > Add Network
2. Configure:
   - Network Name: `Ganache`
   - RPC URL: `http://127.0.0.1:7545`
   - Chain ID: `1337` (or `5777` for older Ganache)
   - Currency Symbol: `ETH`

## Contract API

### Read Functions

| Function | Description |
|----------|-------------|
| `name()` | Returns token name ("MyLabCoin") |
| `symbol()` | Returns token symbol ("MLC") |
| `decimals()` | Returns decimal places (18) |
| `totalSupply()` | Returns total token supply |
| `balanceOf(address)` | Returns balance of an address |
| `allowance(owner, spender)` | Returns approved spending amount |

### Write Functions

| Function | Description |
|----------|-------------|
| `transfer(to, value)` | Transfer tokens to an address |
| `approve(spender, value)` | Approve spender to use tokens |
| `transferFrom(from, to, value)` | Transfer tokens on behalf of another |
| `increaseAllowance(spender, addedValue)` | Safely increase allowance |
| `decreaseAllowance(spender, subtractedValue)` | Safely decrease allowance |

### Events

| Event | Description |
|-------|-------------|
| `Transfer(from, to, value)` | Emitted on token transfers |
| `Approval(owner, spender, value)` | Emitted on approval changes |

## Security Considerations

- **Zero Address Protection**: All transfer and approval functions validate against the zero address
- **Safe Allowance Updates**: Use `increaseAllowance`/`decreaseAllowance` instead of `approve` to prevent race conditions
- **Overflow Protection**: Solidity 0.8.19 provides built-in overflow checks
- **Gas Optimized**: Uses `unchecked` blocks only where mathematically safe

## Testing

The test suite covers:
- Deployment and initialization
- Token transfers (success and failure cases)
- Approval mechanism
- TransferFrom functionality
- IncreaseAllowance and DecreaseAllowance
- Edge cases (zero values, zero address, self-transfers)
- Invariants (total supply conservation)

## License

MIT License - see LICENSE file for details.
