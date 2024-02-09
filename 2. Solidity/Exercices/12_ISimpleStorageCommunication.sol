// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./12_ISimpleStorage.sol";

contract SimpleStorageCommunication {

    ISimpleStorage lecontrat;

    // du coup les address de contrat sont des pointeurs?
    constructor(ISimpleStorage _lecontrat) {
        lecontrat = _lecontrat;
    }

    function callSet(uint256 _number) external {
        lecontrat.setNombre(_number);
    }

    function callGet() external view returns(uint256) {
        return lecontrat.getNombre();
    }

}