// SPDX-License-Identifier: Unlicense

pragma solidity >=0.8.9;

contract Random {
    
    uint256 private nonce;    

    function generateRandom() external returns(uint) {
        nonce++;
        return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 100;                
    }
}