const hre = require("hardhat");

async function main() {
  const sendAmount = hre.ethers.parseEther("1");

  const storage = await hre.ethers.deployContract("Storage", [5], {
    value: sendAmount,
  });

  await storage.waitForDeployment();
  const address = storage.target

  const bal = await ethers.provider.getBalance(address);

  console.log(`Storage contract send to ${address} with balance of ${bal}`);

  let number = await storage.retrieve()
  console.log('Default number : ' + number.toString())

  await storage.store(3)

  number = await storage.retrieve()
  console.log('Updated number : ' + number.toString())


// Faire un retrieve sur la valeur, la console log
// faire un store différent
// Faire un retrieve sur la valeur, la console log

// console log la balance du contrat

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});