// SPDX-License-Identifier: Unlicense

pragma solidity >=0.8.15;

contract Whitelist {

    mapping (address => bool) public whitelist;
    // mapping (address => uint[]) studentGrades;
    event Authorized(address _address);
    event EthReceived(address _address, uint _value);

    constructor() {
        whitelist[msg.sender] = true;
    }

    modifier check(){
        require (whitelist[msg.sender], "must be whitelisted");
        _;
    }

    function authorize(address _address) public check {        
        whitelist[_address] = true;
        emit Authorized(_address);
    }


    receive() external payable { emit EthReceived(msg.sender, msg.value); }
    fallback() external payable { emit EthReceived(msg.sender, msg.value); }
}