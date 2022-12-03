import { TokensetupConfig } from "../types/token-setup.types";

const tokenSetup: TokensetupConfig = {
  deployUniswap: true,
  tokens: [
    {
      name: "Wrapped ETH",
      symbol: "WETH",
      decimals: 18,
      config: {
        collateralFactor: 0.75,
        borrowIsolated: false,
      },
    },
    {
      name: "Test Token",
      symbol: "TST",
      decimals: 18,
      config: {
        collateralFactor: 0.75,
        borrowIsolated: false,
      },
    },
    {
      name: "Test Token 2",
      symbol: "TST2",
      decimals: 18,
      config: {
        collateralFactor: 0.75,
        borrowIsolated: false,
      },
    },
    {
      name: "Test Token 3",
      symbol: "TST3",
      decimals: 18,
      config: {
        collateralFactor: 0.75,
        borrowIsolated: false,
      },
    },
    {
      name: "Test Token 4",
      symbol: "TST4",
      decimals: 6,
    },
    {
      name: "Uninited Test Token 3",
      symbol: "UTST",
      decimals: 18,
    },
  ],

  uniswapPools: [
    ["TST", "WETH"],
    ["TST2", "WETH"],
    ["TST3", "WETH"],
    ["TST4", "WETH"],
    ["UTST", "WETH"],
    ["TST2", "TST3"],
    ["TST4", "TST"],
  ],

  marketsToActivate: ["WETH", "TST", "TST2", "TST3", "TST4"],
};

export default tokenSetup;
