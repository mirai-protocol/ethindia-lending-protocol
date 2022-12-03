import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { SwapRouter } from "@uniswap/v3-sdk";
import { Contract, ethers } from "ethers";
import {
  DToken,
  EToken,
  Euler,
  EulerGeneralView,
  Exec,
  FlashLoan,
  FlashLoanAdaptorTest,
  FlashLoanAdaptorTest2,
  FlashLoanNativeTest,
  Governance,
  Installer,
  InvariantChecker,
  IRMClassLido,
  IRMDefault,
  IRMFixed,
  IRMLinear,
  IRMZero,
  Liquidation,
  Markets,
  MockUniswapV3Pool,
  RiskManager,
  SimpleUniswapPeriphery,
  Swap,
  SwapHandler1Inch,
  SwapHandlerUniAutoRouter,
  SwapHandlerUniswapV3,
  SwapHub,
  TestERC20,
} from "../../typechain-types";

export type Network = "mumbai" | "dev" | "staging" | "ethereum";

export interface DeploymentContext {
  moduleIds?: object;
  provider?: ethers.providers.JsonRpcProvider;
  wallet?: SignerWithAddress;
  wallet2?: SignerWithAddress;
  wallet3?: SignerWithAddress;
  wallet4?: SignerWithAddress;
  wallet5?: SignerWithAddress;
  contracts?: {
    tokens: {
      [key: string]: Contract;
    };
    eTokens?: {
      [key: string]: Contract;
    };
    dTokens?: {
      [key: string]: Contract;
    };
    uniswapPools?: {
      [key: string]: Contract;
    };
    modules?: {
      [key: string]: Contract;
    };
    swapHandlers?: Contract;
    markets?: Markets;

    uniswapV3Factory?: Contract;
    swapRouterV3?: Contract;
    swapRouter02?: Contract;
    invariantChecker?: Contract;
    flashLoanNativeTest?: Contract;
    flashLoanAdaptorTest?: Contract;
    flashLoanAdaptorTest2?: Contract;
    simpleUniswapPeriphery?: Contract;
    eulerGeneralView?: Contract;
    euler?: Contract;
    installer?: Contract;
    liquidation?: Contract;
    governance?: Contract;
    exec?: Contract;
    swap?: Contract;
    swapHub?: Contract;
    flashLoan?: Contract;
    eulStakes?: Contract;
    eulDistributor?: Contract;
  };
  uniswapPoolsInverted?: any;
  stash?: {}; // temp storage during testing
  tokenSetup?: any;
  factories?: { [key: string]: ethers.ContractFactory };
  startTime?: number;
  lastCheckpointTime?: number;
  lastBlockTimestamp?: () => Promise<number>;
  jumpTime?: (offset: number) => Promise<void>;
  checkpointTime?: () => Promise<void>;
  activateMarket?: (tok: string) => void;
  populateUniswapPool?: (pair: string[], fee: any) => any;
  createUniswapPool?: (pair: string[], fee: any) => any;
  [key: string]: any;
}

export interface Tokensetup {
  testing: {
    existingTokens: any[];
    tokens: any[];
    forkTokens: {
      [symbol: string]: {
        address: string;
      };
    };
  };
}

export interface ContractsRegistry {
  tokens: {
    [key: string]: TestERC20;
  };
  uniswapV3Factory: any;
  swapRouterV3?: SwapRouter & Contract;
  swapRouter02?: SwapRouter & Contract;
  invariantChecker?: InvariantChecker;
  flashLoanNativeTest: FlashLoanNativeTest;
  flashLoanAdaptorTest: FlashLoanAdaptorTest;
  flashLoanAdaptorTest2: FlashLoanAdaptorTest2;
  simpleUniswapPeriphery: SimpleUniswapPeriphery;
  uniswapPools: UniswapPool;
  eulerGeneralView: EulerGeneralView;
  modules: ModuleContractsRegistry;
  euler: Euler;
  installer: Installer;
  markets: Markets;
  liquidation: Liquidation;
  governance: Governance;
  exec: Exec;
  swap: Swap;
  swapHub: SwapHub;
  eTokens: {
    [key: string]: EToken;
  };
  dTokens: {
    [key: string]: DToken;
  };
  riskManager: RiskManager;
  swapHandlers: SwapHandlerRegistry;
  flashLoan: FlashLoan;
}

export interface ContractsFactory {
  swapRouterFactory: ContractsFactory;
  uniswapV3FactoryFactory: ContractsFactory;
}

export interface ModuleContractsRegistry {
  // Public single-proxy modules
  installer: Installer;
  markets: Markets;
  liquidation: Liquidation;
  governance: Governance;
  exec: Exec;
  swap: Swap;
  swapHub: SwapHub;

  // Public multi-proxy modules
  eToken: EToken;
  dToken: DToken;

  // Internal modules
  riskManager: RiskManager;
  irmDefault: IRMDefault;
  irmZero: IRMZero;
  irmFixed: IRMFixed;
  irmLinear: IRMLinear;
  irmClassLido: IRMClassLido;
}

export interface SwapHandlerRegistry {
  swapHandlerUniswapV3: SwapHandlerUniswapV3;
  swapHandler1Inch: SwapHandler1Inch;
  swapHandlerUniAutoRouter: SwapHandlerUniAutoRouter;
}

export interface UniswapPool {
  [key: string]: {
    contract: MockUniswapV3Pool;
    inverted: boolean;
  };
}

export type ModuleName =
  | "markets"
  | "liquidation"
  | "governance"
  | "exec"
  | "swap"
  | "swapHub"
  | "eToken"
  | "dToken"
  | "riskManager"
  | "irmDefault"
  | "irmZero"
  | "irmFixed"
  | "irmLinear";

export type SwapHandler =
  | `swapHandlerUniswapV3`
  | `swapHandler1Inch`
  | `swapHandlerUniAutoRouter`;
