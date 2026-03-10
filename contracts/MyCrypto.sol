// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/**
 * @title MyCrypto (MyLabCoin)
 * @notice A simple ERC-20 compliant token for educational purposes
 * @dev Implements standard ERC-20 with increaseAllowance/decreaseAllowance extensions
 */
contract MyCrypto {
    string public constant name = "MyLabCoin";
    string public constant symbol = "MLC";
    uint8 public constant decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @notice Creates the token with an initial supply
     * @param _initialSupply The number of tokens to mint (will be multiplied by 10^decimals)
     */
    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply * 10 ** decimals;
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    /**
     * @notice Transfers tokens to a specified address
     * @param _to The recipient address
     * @param _value The amount of tokens to transfer
     * @return success True if the transfer was successful
     */
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0), "Transfer to zero address");
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");

        unchecked {
            balanceOf[msg.sender] -= _value;
        }
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    /**
     * @notice Approves a spender to spend tokens on behalf of the caller
     * @param _spender The address authorized to spend
     * @param _value The maximum amount they can spend
     * @return success True if the approval was successful
     */
    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(_spender != address(0), "Approve to zero address");

        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
     * @notice Transfers tokens on behalf of another address
     * @param _from The address to transfer from
     * @param _to The address to transfer to
     * @param _value The amount of tokens to transfer
     * @return success True if the transfer was successful
     */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0), "Transfer to zero address");
        require(_value <= balanceOf[_from], "Insufficient balance");
        require(_value <= allowance[_from][msg.sender], "Allowance exceeded");

        unchecked {
            balanceOf[_from] -= _value;
            allowance[_from][msg.sender] -= _value;
        }
        balanceOf[_to] += _value;

        emit Transfer(_from, _to, _value);
        return true;
    }

    /**
     * @notice Increases the allowance granted to a spender
     * @dev This is safer than approve() to prevent the race condition attack
     * @param _spender The address authorized to spend
     * @param _addedValue The amount to increase the allowance by
     * @return success True if the operation was successful
     */
    function increaseAllowance(address _spender, uint256 _addedValue) public returns (bool success) {
        require(_spender != address(0), "Approve to zero address");

        allowance[msg.sender][_spender] += _addedValue;
        emit Approval(msg.sender, _spender, allowance[msg.sender][_spender]);
        return true;
    }

    /**
     * @notice Decreases the allowance granted to a spender
     * @dev This is safer than approve() to prevent the race condition attack
     * @param _spender The address authorized to spend
     * @param _subtractedValue The amount to decrease the allowance by
     * @return success True if the operation was successful
     */
    function decreaseAllowance(address _spender, uint256 _subtractedValue) public returns (bool success) {
        require(_spender != address(0), "Approve to zero address");

        uint256 currentAllowance = allowance[msg.sender][_spender];
        require(currentAllowance >= _subtractedValue, "Decreased allowance below zero");

        unchecked {
            allowance[msg.sender][_spender] = currentAllowance - _subtractedValue;
        }
        emit Approval(msg.sender, _spender, allowance[msg.sender][_spender]);
        return true;
    }
}
