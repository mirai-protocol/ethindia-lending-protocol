import { HardhatUserConfig } from "hardhat/config";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import "solidity-coverage";
import * as dotenv from "dotenv";

// load all ENV variables from .env file.
dotenv.config();

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      forking: {
        url: process.env.RPC || "",
        blockNumber: 29248478,
      },
    },
    mumbai: {
      url: process.env.RPC,
      accounts: [process.env.PRIVATE_KEY || ""],
      gas: 8000000,
      gasPrice: 1500000008,
    },
  },
  etherscan: {
    apiKey: process.env.EXPLORER_API_KEY || "",
  },
  solidity: {
    compilers: [
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000000,
          },
          outputSelection: {
            "contracts/Storage.sol": {
              "*": ["storageLayout"],
            },
          },
        },
      },
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000000,
          },
        },
      },
    ],
  },

  gasReporter: {
    enabled: !!process.env.REPORT_GAS,
  },

  mocha: {
    timeout: 100000,
  },
};

export default config;
