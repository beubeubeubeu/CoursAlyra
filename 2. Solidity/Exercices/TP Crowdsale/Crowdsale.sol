// SPDX-License-Identifier: Unlicensed

pragma solidity >=0.8.9;

import "./Token.sol";

contract Crowdsale {
    
    uint public rate = 20;
    Token public token;

    receive() external payable { 
        require(msg.value >= 0.1 ether, "cannot send less than 0.1 eth");
        distribute(msg.value);
    }

    function distribute(uint256 _amount) internal {
        uint256 tokensToSend = _amount * rate;
        token.transfer(msg.sender, tokensToSend);        
    }

}