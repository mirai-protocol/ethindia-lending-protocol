import { TokensetupConfig } from "../types/token-setup.types";

const tokenSetup: TokensetupConfig = {
  existingTokens: [
    {
      name: "Wrapped MATIC",
      symbol: "WMATIC",
      address: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
      decimals: 18,
      config: {
        collateralFactor: 0.9,
        borrowIsolated: false,
      },
    },
    {
      name: "Apple",
      address: "0x286881d76b77617e5F5C6Bc5a4c0A373ba9d297d",
      symbol: "APPLE",
      decimals: 18,
      config: {
        collateralFactor: 0.75,
        borrowIsolated: false,
      },
    },
    {
      name: "Mango",
      address: "0x008600206a950C18b60e15d9E9b8981ab4C0dE50",
      symbol: "MANGO",
      decimals: 18,
      config: {
        collateralFactor: 0.85,
        borrowIsolated: false,
      },
    },
    {
      name: "Cryption Network Token",
      address: "0xcA8fd0EB2975C0D726D8bE7EbBe02e72E3b1eB74",
      symbol: "CNT",
      decimals: 18,
      config: {
        collateralFactor: 0.85,
        borrowIsolated: false,
      },
    },
    {
      name: "Echai Token",
      address: "0x13e538853f4c29E1354D8D80309B8449b9dCCD02",
      symbol: "ECHAI",
      decimals: 18,
    },
    {
      name: "USDC Coin",
      address: "0x671b68fb02778D37a885699dA79c13Faf0d3C560",
      symbol: "USDC",
      decimals: 6,
      config: {
        collateralFactor: 0.9,
        borrowIsolated: false,
      },
    },
  ],

  useRealUniswap: true,

  uniswapPools: [
    ["APPLE", "WMATIC"],
    ["USDC", "WMATIC"],
    ["ECHAI", "WMATIC"],
    ["CNT", "WMATIC"],
    ["MANGO", "WMATIC"],
  ],

  marketsToActivate: ["WMATIC", "APPLE", "USDC", "ECHAI", "CNT", "MANGO"],
};

export default tokenSetup;