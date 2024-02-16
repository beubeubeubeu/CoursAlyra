require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

const SEPOLIA_PK = process.env.SEPOLIA_PK || "";
const INFURA_URL=process.env.INFURA_URL || "";
const ALCHEMY_URL=process.env.ALCHEMY_URL || "";
const ETHERSCAN = process.env.ETHERSCAN_API || "";

module.exports = {
  solidity: "0.8.24",
  networks:{
    hardhat: {
      forking: {
        url: ALCHEMY_URL
      }
    },
    localhost:{
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia : {
      url: INFURA_URL,
      chainId: 11155111,
      accounts: [`0x${SEPOLIA_PK}`]
    }
  },
  etherscan:{
    apiKey:{
      sepolia: ETHERSCAN
    }
  }
};