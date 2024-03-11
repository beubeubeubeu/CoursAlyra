// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

contract SimpleStorage {
    uint256 private number;

    function setNumber(uint256 _number) external {
        number = _number;
    }

    function getNumber() external view returns(uint256) {
        return number;
    }
}