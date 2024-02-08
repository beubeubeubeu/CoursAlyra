// SPDX-License-Identifier: MIT
pragma solidity >=0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

error UserHasAlreadyPlayed(address user);
error GameFinished();
error NoWinner();

contract GuessAndWin is Ownable {

    string private word;
    string private indication;
    address private winner;

    mapping(address => bool) hasPlayed;

    event GameWon(address indexed _winner);

    constructor() Ownable(msg.sender) {

    }

    function guess(string memory _word) external returns(bool) {
        if(winner != address(0)) {
            revert GameFinished();
        }
        if(hasPlayed[msg.sender]) {
            revert UserHasAlreadyPlayed(msg.sender);
        }
        if(compareStrings(word, _word)) {
            winner = msg.sender;
            hasPlayed[msg.sender] = true;
            emit GameWon(msg.sender);
            return true;
        }
        hasPlayed[msg.sender] = true;
        return false;
    }

    function setWordAndIndication(string memory _word, string memory _indication) 
    external onlyOwner {
        word = _word;
        indication = _indication;
    }

    function compareStrings(string memory a, string memory b) private pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    function getIndication() external view returns(string memory) {
        return indication;
    }

    function getWinner() external view returns(address) {
        if(winner == address(0)) {
            revert NoWinner();
        }
        return winner;
    }

}