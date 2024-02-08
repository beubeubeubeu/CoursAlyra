// SPDX-License-Identifier: Unlicense

pragma solidity >=0.8.9;

contract Bank {
    mapping (address => uint256) _balances;

    function deposit(uint256 _amount) external {
        _balances[msg.sender] += _amount;
    }

    function transfer(address _recipient, uint256 _amount) external {
        require(_recipient != address(0), "cannot burn amount transfering to 0x address :/");
        require(_balances[msg.sender] >= _amount, "insufficient funds");
        _balances[_recipient] += _amount;
    }

    function balanceOf(address _address) external view returns (uint256 balance) {
        return _balances[_address];
    }
}