// SPDX-License-Identifier: Unlicense

pragma solidity >=0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

error UserHasAlreadyPlayed(address user);
error GameFinished();
error NoWinnerYet();

contract GuessAndWin is Ownable {

    string private word;
    string private clue;
    address private winner;

    mapping (address => bool) hasPlayed;    

    event GameWon(address indexed _winner);

    enum GameState {
        Setup,
        Guess,
        End
    }

    constructor() Ownable(msg.sender) {}    

    GameState public currentState;

    function setGame(string memory _word, string memory _clue) external onlyOwner {
        word = _word;
        clue = _clue;
        currentState = GameState.Guess;
    }

    function getClue() external view returns(string memory) {
        return clue;
    }

    function guess(string memory _guess) external returns(bool) {
        if(winner != address(0)) {
            revert GameFinished();
        }
        if(hasPlayed[msg.sender]) {
            revert UserHasAlreadyPlayed(msg.sender);
        }
        bool wins;
        if(compareStrings(_guess, word)) {
            winner = msg.sender;
            currentState = GameState.End;
            emit GameWon(msg.sender);        
        }
        hasPlayed[msg.sender] = true;        
        return wins;
    }

    function compareStrings(string memory a, string memory b) private pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    function getWinner() external view returns(address) {
        if(winner == address(0)) {
            revert NoWinnerYet();
        }
        return winner;
    }

}