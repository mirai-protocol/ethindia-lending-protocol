import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import "solidity-coverage";

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      forking: {
        url: "https://polygon-mumbai.infura.io/v3/2a71d34abc2c4388bf4a83a5b01d8517",
        blockNumber: 29162772,
      },
    },
    localhost: {
      chainId: 1,
      url: "http://127.0.0.1:8545",
      timeout: 5 * 60 * 1000,
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: "XCGE6HHEJTEPMTFCTGSBA71VA7XKB8CPDD",
    },
    customChains: [
      {
        network: "polygonMumbai",
        chainId: 80001,
        urls: {
          apiURL: "https://api-testnet.polygonscan.com",
          browserURL: "https://mumbai.polygonscan.com",
        },
      },
    ],
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
