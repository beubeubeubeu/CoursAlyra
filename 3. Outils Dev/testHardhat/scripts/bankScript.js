const hre = require("hardhat");

async function main() {

  signerStringAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  contractStringAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6"

  // Impersonate the desired account
  await hre.network.provider.request({
		method: "hardhat_impersonateAccount",
		params: [signerStringAddress]
  });

  // Get the impersonated signer
  const signer = await ethers.provider.getSigner(signerStringAddress);

  // Get the contract instance
  const contract = await ethers.getContractAt("Bank", contractStringAddress);

  let balance = await ethers.provider.getBalance(signerStringAddress);

	console.log("Sender balance : " + ethers.formatEther(balance) + " ETH");

  // Call the sendEthers function with the desired value from the signer
  const txSend = await contract.connect(signer).sendEthers({
    value: ethers.parseEther("20")
  });

  console.log("Transaction hash:", txSend.hash);

  balance = await ethers.provider.getBalance(signerStringAddress);
  console.log("Sender balance : " + ethers.formatEther(balance) + " ETH");

  const contractAddress = await contract.getAddress();
  let contractBalance = await ethers.provider.getBalance(contractAddress);
  console.log("Contract balance : " + ethers.formatEther(contractBalance) + " ETH");

  const txWithdraw = await contract.connect(signer).withdraw(ethers.parseEther("21"));

  console.log("Transaction hash:", txWithdraw.hash);

  balance = await ethers.provider.getBalance(signerStringAddress);
  console.log("Sender balance : " + ethers.formatEther(balance) + " ETH");

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});