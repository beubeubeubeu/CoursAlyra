// SPDX-Licence-Identifier: MIT

pragma solidity 0.8.24;

contract SimpleStorage {
  uint256 public number;

  function getNumber() public view returns (uint256) {
    return number;
  }

  function setNumber(uint256 _number) public {
    number = _number;
  }
}