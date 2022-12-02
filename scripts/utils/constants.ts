import { ModuleName } from "../types";

// Mnemonic: test test test test test test test test test test test junk
export const DEFAULT_TEST_ACCOUNTS: string[] = [
  "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
  "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
  "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
  "0x90f79bf6eb2c4f870365e785982e1f101e93b906",
  "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65",
  "0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc",
  "0x976ea74026e726554db657fa54763abd0c3a0aa9",
  "0x14dc79964da2c08b23698b3d3cc7ca32193d9955",
  "0x23618e81e3f5cdf7f54c3d65f7fbc0abf5b21e8f",
  "0xa0ee7a142d267c1f36714e4a8f75612f20a79720",
];

export const contractNames: string[] = [
  // Core
  "Euler",

  // Modules
  "Installer",
  "Markets",
  "Liquidation",
  "Governance",
  "Exec",
  "Swap",
  "SwapHub",
  "EToken",
  "DToken",

  // Internal modules
  "RiskManager",
  "IRMDefault",
  "IRMZero",
  "IRMFixed",
  "IRMLinear",
  "IRMClassLido",

  // Adaptors
  "FlashLoan",

  // Liquidity Mining
  "EulStakes",
  "EulDistributor",

  // Swap Handlers
  "SwapHandlerUniswapV3",
  "SwapHandler1Inch",
  "SwapHandlerUniAutoRouter",

  // Testing
  "TestERC20",
  "MockUniswapV3Factory",
  "EulerGeneralView",
  "InvariantChecker",
  "FlashLoanNativeTest",
  "FlashLoanAdaptorTest",
  "SimpleUniswapPeriphery",
  "TestModule",
  "MockAggregatorProxy",
  "MockStETH",

  // Custom Oracles
  "ChainlinkBasedOracle",
  "WSTETHOracle",
];

export const ModuleIds = {
  // Public single-proxy modules
  INSTALLER: 1,
  MARKETS: 2,
  LIQUIDATION: 3,
  GOVERNANCE: 4,
  EXEC: 5,
  SWAP: 6,
  SWAP_HUB: 7,

  // Public multi-proxy modules
  ETOKEN: 500000,
  DTOKEN: 500001,

  // Internal modules
  RISK_MANAGER: 1000000,
  IRM_DEFAULT: 2000000,
  IRM_ZERO: 2000001,
  IRM_FIXED: 2000002,
  IRM_LINEAR: 2000100,
  IRM_CLASS_LIDO: 2000504,
};

export const MODELUES_TO_INSTALL: ModuleName[]= [
  "markets",
  "liquidation",
  "governance",
  "exec",
  "swap",
  "swapHub",

  "eToken",
  "dToken",

  "riskManager",

  "irmDefault",
  "irmZero",
  "irmFixed",
  "irmLinear",
];
