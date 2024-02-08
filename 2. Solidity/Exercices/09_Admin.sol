// SPDX-License-Identifier: Unlicense

pragma solidity >=0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

error MustBeWhitelisted(string _msg);
error CannotBeBlacklisted(string _msg);
error AlreadyWhitelisted(string _msg);
error AlreadyBlacklisted(string _msg);

contract Admin is Ownable {
    
    struct AddressState {
        bool whitelisted;
        bool blacklisted;
    }

    mapping(address => AddressState) private whitelist;

    event Whitelisted(address _address);
    event Blacklisted(address _address);
    event EthReceived(address _address, uint _value);

    constructor() Ownable(msg.sender) {
        whitelistAddr(msg.sender);
    }

    modifier notBlacklisted() {
        if (whitelist[msg.sender].blacklisted) {
            revert CannotBeBlacklisted("is blacklisted");
        }
        _;
    }

    modifier isWhitelisted() {
        if (!whitelist[msg.sender].whitelisted) {
            revert MustBeWhitelisted("must be whitelisted");
        }
        _;
    }

    modifier notWhitelisted() {
        if (whitelist[msg.sender].whitelisted) {
            revert AlreadyWhitelisted("already whitelisted");
        }
        _;
    }

    function whitelistAddr(address _address) public onlyOwner notBlacklisted notWhitelisted {
        whitelist[_address].whitelisted = true;
        whitelist[_address].blacklisted = false;
        emit Whitelisted(_address);
    }

    function blacklistAddr(address _address) external onlyOwner notBlacklisted {
        whitelist[_address].whitelisted = false;
        whitelist[_address].blacklisted = true;
        emit Blacklisted(_address);
    }

    function getIsWhitelisted(address _address) external view returns(bool) {
        return whitelist[_address].whitelisted;
    }

    function getIsBlacklisted(address _address) external view returns(bool) {
        return whitelist[_address].blacklisted;
    }

    receive() external payable notBlacklisted isWhitelisted { 
        emit EthReceived(msg.sender, msg.value); 
    }    
}