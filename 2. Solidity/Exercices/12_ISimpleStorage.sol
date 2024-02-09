// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface ISimpleStorage {
    function setNombre(uint256 _nombre) external;
    function getNombre() external view returns(uint256);
}