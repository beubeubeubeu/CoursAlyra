const hre = require("hardhat");

async function main() {
    const simpleStorage = await ethers.getContractFactory('SimpleStorage')
    const contract = simpleStorage.attach(
        "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9"
    )

    let number = await contract.getNumber()
    console.log('Default number : ' + number.toString())

    await contract.setNumber(46)

    number = await contract.getNumber()
    console.log('Updated number : ' + number.toString())
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});