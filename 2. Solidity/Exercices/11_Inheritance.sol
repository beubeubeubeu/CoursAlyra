// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

contract Parent {

    uint public parentNumber;

    function parentNumberPlus10() external {
        parentNumber += 10;
    }
}

contract Children is Parent {    

    function displayParentNumber() external view returns(uint) {
        return parentNumber;
    }

}

contract Caller is Children {

    // Children caller;
    Children caller = new Children();

    function callDisplayParentNumber() external view returns(uint) {
        return caller.displayParentNumber();
    }

}