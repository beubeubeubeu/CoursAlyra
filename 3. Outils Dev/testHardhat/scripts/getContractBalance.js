const hre = require("hardhat");

async function main() {
  const simpleStorage = await ethers.getContractFactory('SimpleStorage')
  const contract = simpleStorage.attach(
      "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9"
  )

  let address = await contract.getAddress();
  let addressTarget = await contract.target;

  console.log("Console log: ", address);
  console.log("Console log: ", addressTarget);

  // TODO

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});