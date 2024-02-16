const hre = require("hardhat");

async function main() {
  const WETH_CONTRACT_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const SIGNER_ADDRESS = "0x330107F94EE614F6fb5041c29a739B245d9D64CF";
  const interfaceName = "IWeth";

  const WethContract = await ethers.getContractAt(interfaceName, WETH_CONTRACT_ADDRESS);

  let signerWethBalance = await WethContract.balanceOf(SIGNER_ADDRESS);
  console.log(`Signer balance : ${ethers.formatEther(signerWethBalance)} WETH`);

  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [SIGNER_ADDRESS],
  });

  const signer = await ethers.getImpersonatedSigner(SIGNER_ADDRESS);

  const amountToDeposit = ethers.parseEther("0.3");

  let tx = await WethContract.connect(signer).deposit({value: amountToDeposit})

  console.log("Deposit transaction hash:", tx.hash);

  signerWethBalance = await WethContract.balanceOf(SIGNER_ADDRESS);
  console.log(`Signer balance : ${ethers.formatEther(signerWethBalance)} WETH`);

  tx = await WethContract.connect(signer).withdraw(signerWethBalance)

  signerWethBalance = await WethContract.balanceOf(SIGNER_ADDRESS);
  console.log(`Signer balance : ${ethers.formatEther(signerWethBalance)} WETH`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});