// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  const sendAmountVault = hre.ethers.parseEther("10");
  const sendAmountAttacker = hre.ethers.parseEther("0.1");

  const vault = await hre.ethers.deployContract("Vault");

  await vault.waitForDeployment();
  const vaultAddress = vault.target

  const attacker = await hre.ethers.deployContract("VaultAttacker", [vaultAddress], {
    value: sendAmountAttacker,
  });
  await attacker.waitForDeployment();
  const attackerAddress = attacker.target

  // Initial vault bal
  let vaultBal = await hre.ethers.provider.getBalance(vaultAddress);
  console.log(`Balance of Vault contract at ${vaultAddress} is ${hre.ethers.formatEther(vaultBal)}`);

  await vault.store({ value: sendAmountVault });

  // Vault bal after funding
  vaultBal = await hre.ethers.provider.getBalance(vaultAddress);
  console.log(`Balance of Vault contract at ${vaultAddress} is ${hre.ethers.formatEther(vaultBal)}`);

  // Attacker bal
  let attackerBal = await hre.ethers.provider.getBalance(attackerAddress);
  console.log(`Balance of Attacker contract at ${attackerAddress} is ${hre.ethers.formatEther(attackerBal)}`);

  await attacker.attack();

  attackerBal = await hre.ethers.provider.getBalance(attackerAddress);
  console.log(`Balance of Attacker contract at ${attackerAddress} is ${hre.ethers.formatEther(attackerBal)}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
