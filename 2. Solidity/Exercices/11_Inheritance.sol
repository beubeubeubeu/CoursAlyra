// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

// Check this https://solidity-by-example.org/inheritance/
/*
    Also GPT when unable to call callDisplayParentNumber:

    The issue you're encountering is due to the fact that the displayParentNumber
    function in the Children contract is declared as external instead of public.
    When a function is declared as external, it is only visible to and callable
    from outside the contract, not from within the contract itself or from contracts
    that inherit from it.

    To fix this issue, you should declare the displayParentNumber function in
    the Children contract as public instead of external. Here's the corrected code
*/

contract Parent {

    uint public parentNumber;

    function parentNumberPlus10() external {
        parentNumber += 10;
    }
}

contract Children is Parent {

    function displayParentNumber() public view virtual returns(uint) {
        return parentNumber;
    }

}

contract Caller is Children {

    function callDisplayParentNumber() external view returns(uint) {
        return displayParentNumber();
    }

}