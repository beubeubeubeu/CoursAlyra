// SPDX-License-Identifier: Unlicense

pragma solidity >=0.8.9;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {

    constructor(uint _initialSupply) ERC20("TrainingQuest", "TQU") {        
        _mint(msg.sender, _initialSupply);
    }

}