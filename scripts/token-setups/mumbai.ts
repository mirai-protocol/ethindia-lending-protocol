import { TokensetupConfig } from "../types/token-setup.types";

const tokenSetup: TokensetupConfig = {
  riskManagerSettings: {
    referenceAsset: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
    uniswapFactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    uniswapPoolInitCodeHash:
      "0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54",
  },

  existingContracts: {
    swapRouterV2: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    swapRouterV3: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    swapRouter02: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
  },
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
      name: "Wrapped ETH",
      symbol: "WETH",
      decimals: 18,
      address: "0x38f501A3447aD5c009Bd94704eaAe099300d8B46",
      config: {
        collateralFactor: 0.9,
        borrowIsolated: false,
      },
    },
    {
      name: "DAI",
      symbol: "DAI",
      decimals: 18,
      address: "0xd1EFAFdFC8D0fb032D0C5f4f0C8c7d2CE5094D54",

      config: {
        collateralFactor: 0.75,
        borrowIsolated: false,
      },
    },
    {
      name: "USD Coin",
      symbol: "USDC",
      address: "0x2eDdC4D432F0af7c05F9ACf95EBE8b12BD9f83B6",

      decimals: 6,
      config: {
        collateralFactor: 0.85,
        borrowIsolated: false,
      },
    },
    {
      name: "Basic Attention Token",
      symbol: "BAT",
      decimals: 18,
      address: "0xD9B9F2C806eD85cF98560E4be61Cf2D2FdE58a8c",
    },
    {
      name: "Chainlink",
      symbol: "LINK",
      decimals: 18,
      address: "0x998129807491ea8c20648cF6792A7Eff28FE9CeB",
    },
    {
      name: "Uniswap Token",
      address: "0x5a11036d7208BEcc41705AA088bC0a393a24Df8B",

      symbol: "UNI",
      decimals: 18,
      config: {
        collateralFactor: 0.45,
        borrowIsolated: false,
      },
    },
    {
      name: "yearn.finance",
      address: "0x07E99921E80670F67d626BAF53cb0e483a75002a",

      symbol: "YFI",
      decimals: 18,
    },
    {
      name: "Compound",
      address: "0xaab71e3EB7a6E19095c76DA71C635c6852071e90",

      symbol: "COMP",
      decimals: 18,
      config: {
        collateralFactor: 0.5,
        borrowIsolated: false,
      },
    },
    {
      name: "Euler Token",
      address: "0xa0965AdE46Db8BecD96891a3F9d751fDDD589005",
      symbol: "EUL",
      decimals: 18,
    },
  ],

  deployUniswap: false,

  uniswapPools: [
    ["DAI", "WMATIC"],
    ["WETH", "WMATIC"],
    ["USDC", "WMATIC"],
    ["BAT", "WMATIC"],
    ["LINK", "WMATIC"],
    ["UNI", "WMATIC"],
    ["YFI", "WMATIC"],
    ["COMP", "WMATIC"],
  ],

  marketsToActivate: [
    "WETH",
    "DAI",
    "USDC",
    "BAT",
    "WMATIC"
  ],
};

export default tokenSetup;
