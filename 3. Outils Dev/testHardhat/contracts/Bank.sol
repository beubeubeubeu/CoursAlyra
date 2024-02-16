// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

error Bank__NotEnoughFundsProvided();
error Bank__NotEnoughEthersOnTheSC();
error Bank__WithrdrawFailed();

contract Bank {

  mapping (address => uint) public balances;

  function sendEthers() external payable {
    if(msg.value < 1 wei) {
      revert Bank__NotEnoughFundsProvided();
    }
    balances[msg.sender] += msg.value;
  }

  function withdraw(uint _amount) external {
    if (balances[msg.sender] < _amount) {
      revert Bank__NotEnoughEthersOnTheSC();
    }
    (bool success, ) = msg.sender.call{value: _amount}("");
    if(!success) {
      revert Bank__WithrdrawFailed();
    }
    balances[msg.sender] -= _amount;
  }

  function getBalance(address _user) external view returns (uint) {
    return balances[_user];
  }
}