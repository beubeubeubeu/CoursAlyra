// SPDX-License-Identifier: Unlicense

pragma solidity >=0.8.15;

contract Time {
    function getTime() public view returns (uint) {
        return block.timestamp;
    }
}