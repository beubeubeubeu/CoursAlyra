const { ethers } = require('hardhat');
const { expect, assert } = require('chai');

describe('Test SimpleStorage contract', function() {
  let deployedContract;
  let owner, addr1, addr2;

  beforeEach(async function() {
    [owner, addr1, addr2] = await ethers.getSigners();
    let contract = await ethers.getContractFactory('SimpleStorage');
    deployedContract = await contract.deploy();
  });

  describe('Initialization', function() {
    it('should get the number and the number should be equal to 0', async function() {
      let number = await deployedContract.getNumber();
      assert(number.toString() === "0");
    });
  });

  describe('Set and Get', function() {
    it('should set and get the number', async function() {
      let transaction = await deployedContract.setNumber(10);
      await transaction.wait();
      let number = await deployedContract.getNumber();
      assert(number.toString() === "10");
    });
  });
});