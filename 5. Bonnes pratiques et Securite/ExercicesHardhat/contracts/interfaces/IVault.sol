// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.24;

// You can store ETH in this contract and redeem them.
interface IVault {

    /// @dev Store ETH in the contract.
    function store() external payable;

    /// @dev Redeem your ETH.
    function redeem() external;
}