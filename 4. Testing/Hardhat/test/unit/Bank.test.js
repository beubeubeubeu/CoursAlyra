const { ethers } = require('hardhat');
const { expect, assert } = require('chai');

describe('Test Bank contract', function() {
  let bank;
  let owner, account1, account2;

  beforeEach(async function() {
    [owner, account1, account2] = await ethers.getSigners();
    let contract = await ethers.getContractFactory('Bank');
    bank = await contract.deploy();
  });

  describe('Initialization', function() {
    it('should have deployer as owner', async function() {
      let contractOwnerAddr = await bank.owner();
      assert(contractOwnerAddr === owner.address);
    });
  })

  describe('deposit', function() {
    it('should not be callable by non-owner', async function() {
      const depositAmount = ethers.parseEther('0.1')
      await expect(bank.connect(account1).deposit({ value: depositAmount })).to.be.revertedWithCustomError(bank, 'OwnableUnauthorizedAccount').withArgs(account1.address);
    })

    it('should revert if deposited value < 0.1 wei', async function() {
      const depositAmount = ethers.parseEther('0.05')
      await expect(bank.connect(owner).deposit({ value: depositAmount })).to.be.revertedWith('not enough funds provided');
    })

    it('should deposit value if owner and enough funds provided', async function() {
      const depositAmount = ethers.parseEther('0.1');
      await expect(bank.deposit({ value: depositAmount })).to.changeEtherBalance(bank, depositAmount);
    })

    it('should emit Deposit event if success', async function() {
      const depositAmount = ethers.parseEther('0.1');
      await expect(bank.deposit({ value: depositAmount })).to.emit(bank, 'Deposit').withArgs(owner.address, depositAmount);
    })
  })

  describe('withdraw', function() {
    it('should not be callable by non-owner', async function() {
      const withdrawAmount = ethers.parseEther('0.1');
      await expect(bank.connect(account1).withdraw(withdrawAmount)).to.be.revertedWithCustomError(bank, 'OwnableUnauthorizedAccount').withArgs(account1.address);
    })

    beforeEach(async function() {
      const depositAmount = ethers.parseEther('0.1');
      await bank.deposit({ value: depositAmount });
    })

    it('should not be possible to withdraw if contract balance is inferior to withdraw amount', async function() {
      const withdrawAmount = ethers.parseEther('10');
      await expect(bank.withdraw(withdrawAmount)).to.be.revertedWith('you cannot withdraw this amount');
    })

    it('should bring down contract balance if contract balance is superior to withdraw amount and called by the owner', async function() {
      const withdrawAmount = ethers.parseEther('0.05');
      await expect(bank.withdraw(withdrawAmount)).to.changeEtherBalance(bank, -withdrawAmount);
    })

    it('should send amount to owner if contract balance is superior to withdraw amount and called by the owner', async function() {
      const withdrawAmount = ethers.parseEther('0.05');
      await expect(bank.withdraw(withdrawAmount)).to.changeEtherBalance(owner, withdrawAmount);
    })

  })
})
