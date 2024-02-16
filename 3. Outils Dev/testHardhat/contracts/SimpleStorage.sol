// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

contract SimpleStorage {

	uint256 public number;

	constructor() payable {

	}

	function setNumber(uint _number) external {
		number = _number;
	}

	function getNumber() external view returns (uint) {
		return number;
	}
}
