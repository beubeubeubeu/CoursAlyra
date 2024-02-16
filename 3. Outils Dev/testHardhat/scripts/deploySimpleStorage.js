const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Load the contract factory
  const SimpleStorage = await hre.ethers.getContractFactory("SimpleStorage");

  // Deploy the contract using the factory
  const simpleStorage = await SimpleStorage.deploy({ value: hre.ethers.parseEther("0.001") }); // Send 0.001 ETH upon deployment
  await simpleStorage.waitForDeployment();

  console.log("SimpleStorage deployed to:", simpleStorage.address);

  const initialNumber = await simpleStorage.getNumber();
  console.log("Initial number:", initialNumber.toString());

  // Set a new number
  const newNumber = 123;
  await simpleStorage.setNumber(newNumber);
  console.log("Number set to:", newNumber);

  // Get the updated number
  const updatedNumber = await simpleStorage.getNumber();
  console.log("Updated number:", updatedNumber.toString());


}

async function setNumber(simpleStorage) {
  const newNumber = parseInt(process.argv[3]);
  await simpleStorage.setNumber(newNumber);
  console.log("Number set to:", newNumber);
}

async function getBalance(simpleStorage) {
  const balance = await hre.ethers.provider.getBalance(simpleStorage.address);
  console.log("Current balance:", balance.toString());
}

async function getNumber(contractAddress) {
  const contract = await hre.ethers.getContractAt("SimpleStorage", contractAddress);
  const currentNumber = await contract.getNumber();
  console.log("Current number:", currentNumber.toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

await hre.ethers.provider.getBalance(addr);