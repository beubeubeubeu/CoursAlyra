// SPDX-License-Identifier: Unlicense

pragma solidity >=0.8.15;

import "hardhat/console.sol";

contract CompteEpargne {

    address private owner;
    uint private withdrawableTime;    
    mapping (uint => uint) private deposits;
    uint private depositId;

    event OwnerSet(address owner);
    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);

    modifier isOwner() {    
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    modifier canWithdraw() {    
        require(depositId != 0, "Must make at least one deposit.");
        require(withdrawableTime > block.timestamp, "Must wait 3 months before retrieving.");
        _;
    }

    modifier canDeposit() {
        require(msg.value > 0, "Not enough funds deposited.");
        _;
    }

    constructor() {
        console.log("Owner contract deployed by:", msg.sender);
        owner = msg.sender; // 'msg.sender' is sender of current call, contract deployer for a constructor
        emit OwnerSet(owner);
    }

    function deposit() external payable isOwner canDeposit {           
        if (depositId == 0) {
            withdrawableTime = block.timestamp + 90 days;
        }
        deposits[depositId] = msg.value;
        depositId++;
        emit Deposit(msg.value);
    }

    function withdraw() external payable isOwner canWithdraw {        
        /*
            TODO: Fix add an argument to know how much to withdraw 
            and add a require to canWithdraw to know if there is enough 
            (when slides instructions are online)
        */
        (bool success, ) = owner.call{value: msg.value}("");
        require(success, "Call to withdraw failed");
        emit Withdraw(msg.value);
    }
}