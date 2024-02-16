yarn hardhat node

hardhat compile contracts/Bank.sol

yarn hardhat run scripts/deploy.js --network sepolia
yarn hardhat run scripts/deploy.js --network localhost
yarn hardhat run scripts/deploy.js --network sepolia

yarn hardhat verify --network NETWORK verify 0xcAe0987Eae91c6D4E68f740f0C6d1Bd937095D6E

yarn hardhat run scripts/deploySimpleStorage.js --network localhost
yarn hardhat run scripts/deploySimpleStorage.js --network localhost
yarn hardhat run scripts/getContractBalance.js --network localhost
yarn hardhat run scripts/bankScript.js --network localhost

yarn hardhat console --network localhost
