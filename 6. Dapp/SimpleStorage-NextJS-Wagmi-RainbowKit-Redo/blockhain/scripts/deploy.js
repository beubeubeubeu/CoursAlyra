const hre = require("hardhat");

async function main() {

  const SimpleStorage = await hre.ethers.deployContract("SimpleStorage");

  await SimpleStorage.waitForDeployment();

  console.log(
    `SimpleStorage deployed to ${SimpleStorage.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});