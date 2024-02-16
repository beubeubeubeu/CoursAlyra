const hre = require("hardhat");
const { verify } = require("../utils/verify.js");
const { network } = require("hardhat");

async function main() {
  const arguments = [];
  // Change this whenever needed
  let contractName = "Bank";

  const contract = await hre.ethers.deployContract(contractName, arguments);

  // await contract.waitForDeployment();
  await contract.deploymentTransaction().wait(network.config.blockConfirmations || 1);

  console.log(
    `${contractName} deployed to ${contract.target}`
  );

  if(!network.name.includes('localhost') && process.env.ETHERSCAN_API_KEY) {
    console.log('Veryfiying...');
    await verify(contract.target, arguments);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
