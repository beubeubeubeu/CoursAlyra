// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.24;

contract Auction {
    mapping(address => uint) refunds;
    address highestBidder;
    uint highestBid;

    function bid() payable public {
      require(msg.value >= highestBid);

      // if (highestBidder != address(0)) {
      //   (bool success, ) = highestBidder.call{value:highestBid}("");
      //   require(success, "Blocked here... self DOS"); // if this call consistently fails, no one else can bid
      // }

      if (highestBidder != address(0)) {
        refunds[highestBidder] += highestBid;
      }

      highestBidder = msg.sender;
      highestBid = msg.value;
    }

    function pullBid() public {
      uint refund = refunds[msg.sender];
      refunds[msg.sender] = 0;
      (bool success, ) = msg.sender.call{value: refund}("");
      require(success);
    }
}
