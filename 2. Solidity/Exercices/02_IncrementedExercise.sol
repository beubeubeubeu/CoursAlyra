// SPDX-License-Identifier: Unlicense

pragma solidity >=0.8.15;

contract IncrementedExercise {
    
    address private currentAddress;    

    modifier canSendEth(address _givenAddress, uint _amount) {
        require(msg.sender != _givenAddress, "Cannot self send ETH");
        require(addressBalance(_givenAddress) > _amount, "Enough ETH amount not found at sending address");
        _;
    }

    modifier hasOneWei(address _givenAddress) {
        require(addressBalance(_givenAddress) >= 1 wei, "Must at least have 1 wei to send ETH");
        _;
    }

    function setAddress(address _givenAddress) external {
        currentAddress = _givenAddress;
    }

    function getAddress() external view returns (address) {
        return currentAddress;
    }

    function addressBalance(address _givenAddress) private view returns(uint) {        
        return _givenAddress.balance;
    }

    // Faire une fonction qui permet de faire un transfert d'eth vers une adresse passée en paramètre
    function sendEthToAddress(address payable _toAddress) external payable canSendEth(msg.sender, msg.value) hasOneWei(msg.sender) {
        (bool success, ) = _toAddress.call{value: msg.value}("");
        require(success, "Sending ETH failed");
    }

    /* 
        Faire une fonction qui permet de faire un transfert d'eth vers l'adresse stockée, 
        si et seulement si elle a une balance supérieure à une valeur donnée en paramètre
        vous pouvez tester avec 1wei ou 100 ETH

        => remixé en "si et seulement si l'adresse d'envoi a une balance supérieure..."
    */
    function sendEthToCurrentAddress() external payable canSendEth(msg.sender, msg.value) hasOneWei(msg.sender) {
        (bool success, ) = currentAddress.call{value: msg.value}("");
        require(success, "Sending ETH failed");
    }
}