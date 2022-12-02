import "@nomiclabs/hardhat-waffle";
import * as fs from "fs";
import * as child_process from "child_process";
import {
  Route,
  Pool,
  FeeAmount,
  encodeRouteToPath,
  ADDRESS_ZERO,
} from "@uniswap/v3-sdk";
import { Token } from "@uniswap/sdk-core";
import { ratioToSqrtPriceX96 } from "./utils/sqrtPriceUtils";
import { log } from "./utils/logger";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import * as ethersLib from "ethers";
import {
  ContractsRegistry,
  ModuleContractsRegistry,
  ModuleName,
  Network,
  SwapHandler,
  SwapHandlerRegistry,
  UniswapPool,
} from "./types";
import { TokenConfig, TokensetupConfig } from "./types/token-setup.types";
import {
  contractNames,
  ModuleIds,
  MODELUES_TO_INSTALL,
} from "./utils/constants";
import { getTokensetup } from "./token-setups";

const contractsRegistry = {} as ContractsRegistry;
const contractFactories: any = {
  uniswapV3FactoryFactory: ethersLib.ContractFactory,
};

let tokenSetup: TokensetupConfig = {};
let uniswapV3PoolByteCodeHash: string = "";
let defaultUniswapFee = FeeAmount.MEDIUM;
let lastCheckpointTime: number;
let lastSnapshotId: string;
let swapRouterV2Address = ADDRESS_ZERO;
let swapRouterV3Address = ADDRESS_ZERO;
let swapRouter02Address = ADDRESS_ZERO;
let oneInchAddress = ADDRESS_ZERO;
let gitCommit = ethers.utils.hexZeroPad(
  "0x" + child_process.execSync("git rev-parse HEAD").toString().trim(),
  32
);

export async function initContracts(
  provider: ethersLib.providers.JsonRpcProvider,
  wallets: ethersLib.Signer[],
  tokenSetupName: Network
) {
  tokenSetup = getTokensetup(tokenSetupName);
  // if using existing token, load them all in context.
  for (let [symbol, { address }] of Object.entries(
    tokenSetup.existingTokens || {}
  )) {
    contractsRegistry.tokens[symbol] = await ethers.getContractAt(
      "TestERC20",
      address
    );
    log(`Loaded: ${symbol} - ${contractsRegistry.tokens[symbol].address}`);
  }

  // Init factories for all the contracts
  for (let c of contractNames) {
    contractFactories[c] = await ethers.getContractFactory(c);
  }

  if (tokenSetup.useRealUniswap) {
    {
      const {
        abi,
        bytecode,
      } = require("../vendor-artifacts/UniswapV3Factory.json");
      contractFactories.uniswapV3FactoryFactory = new ethers.ContractFactory(
        abi,
        bytecode,
        wallets[0]
      );
    }
    {
      const {
        abi,
        bytecode,
      } = require("../vendor-artifacts/SwapRouterV3.json");
      contractFactories.SwapRouterFactory = new ethers.ContractFactory(
        abi,
        bytecode,
        wallets[0]
      );
    }
    {
      const {
        abi,
        bytecode,
      } = require("../vendor-artifacts/SwapRouter02.json");
      contractFactories.SwapRouter02Factory = new ethers.ContractFactory(
        abi,
        bytecode,
        wallets[0]
      );
    }
    {
      const {
        abi,
        bytecode,
      } = require("../vendor-artifacts/UniswapV3Pool.json");
      uniswapV3PoolByteCodeHash = ethers.utils.keccak256(bytecode);
    }
  }
  const startTime = await lastBlockTimestamp(provider);
  lastCheckpointTime = startTime;
}

export async function deplyContracts(wallets: SignerWithAddress[]) {
  // Deploy test tokens
  contractsRegistry.tokens = {};
  if (tokenSetup.tokens) {
    for (let token of tokenSetup.tokens || []) {
      contractsRegistry.tokens[token.symbol] = await (
        await contractFactories.TestERC20.deploy(
          token.name,
          token.symbol,
          token.decimals,
          false
        )
      ).deployed();
      log(
        `Deployed: ${token.symbol} - ${
          contractsRegistry.tokens[token.symbol].address
        }`
      );
    }
  }

  // Setup Uniswap
  if (tokenSetup.useRealUniswap) {
    {
      contractsRegistry.uniswapV3Factory = await (
        await contractFactories.uniswapV3FactoryFactory.deploy()
      ).deployed();
      log(
        `Deployed: Uniswap V3 Factory - ${contractsRegistry.uniswapV3Factory.address}`
      );
    }
    {
      contractsRegistry.swapRouterV3 = await (
        await contractFactories.SwapRouterFactory.deploy(
          contractsRegistry.uniswapV3Factory.address,
          contractsRegistry.tokens["WETH"].address
        )
      ).deployed();
      log(
        `Deployed: SwapRouter V3 - ${contractsRegistry.swapRouterV3?.address}`
      );
    }
    {
      contractsRegistry.swapRouter02 = await (
        await contractFactories.SwapRouter02Factory.deploy(
          ADDRESS_ZERO, // factoryV2 not needed
          contractsRegistry.uniswapV3Factory.address,
          ADDRESS_ZERO, // positionManager not needed
          contractsRegistry.tokens["WETH"].address
        )
      ).deployed();
      log(
        `Deployed: SwapRouter V2 - ${contractsRegistry.swapRouter02?.address}`
      );
    }
  } else {
    contractsRegistry.uniswapV3Factory = await (
      await contractFactories.MockUniswapV3Factory.deploy()
    ).deployed();

    log(
      `Deployed: Uniswap V3 Factory - ${contractsRegistry.uniswapV3Factory.address}`
    );

    uniswapV3PoolByteCodeHash = ethers.utils.keccak256(
      (await ethers.getContractFactory("MockUniswapV3Pool")).bytecode
    );
  }

  contractsRegistry.invariantChecker = await (
    await contractFactories.InvariantChecker.deploy()
  ).deployed();
  log(
    `Deployed: InvriantChecker - ${contractsRegistry.invariantChecker?.address}`
  );

  contractsRegistry.flashLoanNativeTest = await (
    await contractFactories.FlashLoanNativeTest.deploy()
  ).deployed();
  log(
    `Deployed: FlashLoanNativeTest - ${contractsRegistry.flashLoanNativeTest.address}`
  );

  contractsRegistry.flashLoanAdaptorTest = await (
    await contractFactories.FlashLoanAdaptorTest.deploy()
  ).deployed();
  log(
    `Deployed: FlashLoanAdaptorTest - ${contractsRegistry.flashLoanAdaptorTest.address}`
  );

  contractsRegistry.flashLoanAdaptorTest2 = await (
    await contractFactories.FlashLoanAdaptorTest.deploy()
  ).deployed();
  log(
    `Deployed: FlashLoanAdaptorTest2 - ${contractsRegistry.flashLoanAdaptorTest2.address}`
  );

  contractsRegistry.simpleUniswapPeriphery = await (
    await contractFactories.SimpleUniswapPeriphery.deploy()
  ).deployed();
  log(
    `Deployed: SimpleUniswapPeriphery - ${contractsRegistry.simpleUniswapPeriphery.address}`
  );

  contractsRegistry.uniswapPools = {};
  // Setup uniswap pairs
  for (let pair of tokenSetup.uniswapPools || []) {
    await createUniswapPool(pair, defaultUniswapFee);
  }

  if (tokenSetup.useRealUniswap) {
    for (let tok of tokenSetup.marketsToActivate || []) {
      if (tok === "WETH") continue;
      let config = tokenSetup.tokens?.find((t: any) => t.symbol === tok);
      await (
        await contractsRegistry.uniswapPools[`${tok}/WETH`].contract.initialize(
          poolAdjustedRatioToSqrtPriceX96(
            `${tok}/WETH`,
            10 ** (18 - (config?.decimals || 18)),
            1
          )
        )
      ).wait();
      log(`Initialised: UniswapPool for ${tok}/WETH`);
    }
  }

  // Euler Contracts

  const eulerGeneralView = await (
    await contractFactories.EulerGeneralView.deploy(gitCommit)
  ).deployed();
  log(`Deployed: EulerGeneralView - ${eulerGeneralView.address}`);
  contractsRegistry.eulerGeneralView = eulerGeneralView;

  // Create module implementations

  let riskManagerSettings;

  if (tokenSetup.riskManagerSettings) {
    riskManagerSettings = tokenSetup.riskManagerSettings;
  } else {
    riskManagerSettings = {
      referenceAsset: contractsRegistry.tokens["WETH"].address,
      uniswapFactory: contractsRegistry.uniswapV3Factory.address,
      uniswapPoolInitCodeHash: uniswapV3PoolByteCodeHash,
    };
  }

  if (tokenSetup.existingContracts) {
    if (tokenSetup.existingContracts.swapRouterV2)
      swapRouterV2Address = tokenSetup.existingContracts.swapRouterV2;
    if (tokenSetup.existingContracts.swapRouterV3)
      swapRouterV3Address = tokenSetup.existingContracts.swapRouterV3;
    if (tokenSetup.existingContracts.swapRouter02)
      swapRouter02Address = tokenSetup.existingContracts.swapRouter02;
    if (tokenSetup.existingContracts.oneInch)
      oneInchAddress = tokenSetup.existingContracts.oneInch;
  }

  contractsRegistry.modules = {} as ModuleContractsRegistry;

  contractsRegistry.modules.installer = await (
    await contractFactories.Installer.deploy(gitCommit)
  ).deployed();
  log(
    `Deployed: MODULE Installer - ${contractsRegistry.modules.installer.address}`
  );

  contractsRegistry.modules.markets = await (
    await contractFactories.Markets.deploy(gitCommit)
  ).deployed();
  log(
    `Deployed: MODULE Markets - ${contractsRegistry.modules.markets.address}`
  );

  contractsRegistry.modules.liquidation = await (
    await contractFactories.Liquidation.deploy(gitCommit)
  ).deployed();
  log(
    `Deployed: MODULE Liquidation - ${contractsRegistry.modules.liquidation.address}`
  );

  contractsRegistry.modules.governance = await (
    await contractFactories.Governance.deploy(gitCommit)
  ).deployed();
  log(
    `Deployed: MODULE Governance - ${contractsRegistry.modules.governance.address}`
  );

  contractsRegistry.modules.exec = await (
    await contractFactories.Exec.deploy(gitCommit)
  ).deployed();
  log(`Deployed: MODULE Exec - ${contractsRegistry.modules.exec.address}`);

  contractsRegistry.modules.swap = await (
    await contractFactories.Swap.deploy(
      gitCommit,
      swapRouterV3Address,
      oneInchAddress
    )
  ).deployed();
  log(`Deployed: MODULE Swap - ${contractsRegistry.modules.swap.address}`);

  contractsRegistry.modules.swapHub = await (
    await contractFactories.SwapHub.deploy(gitCommit)
  ).deployed();
  log(
    `Deployed: MODULE SwapHub - ${contractsRegistry.modules.swapHub.address}`
  );

  contractsRegistry.modules.eToken = await (
    await contractFactories.EToken.deploy(gitCommit)
  ).deployed();
  log(`Deployed: MODULE eToken - ${contractsRegistry.modules.eToken.address}`);

  contractsRegistry.modules.dToken = await (
    await contractFactories.DToken.deploy(gitCommit)
  ).deployed();
  log(`Deployed: MODULE dToken - ${contractsRegistry.modules.dToken.address}`);

  contractsRegistry.modules.riskManager = await (
    await contractFactories.RiskManager.deploy(gitCommit, riskManagerSettings)
  ).deployed();
  log(
    `Deployed: MODULE RiskManager - ${contractsRegistry.modules.riskManager.address}`
  );

  contractsRegistry.modules.irmDefault = await (
    await contractFactories.IRMDefault.deploy(gitCommit)
  ).deployed();
  log(
    `Deployed: MODULE irmDefault - ${contractsRegistry.modules.irmDefault.address}`
  );

  contractsRegistry.modules.irmZero = await (
    await contractFactories.IRMZero.deploy(gitCommit)
  ).deployed();
  contractsRegistry.modules.irmFixed = await (
    await contractFactories.IRMFixed.deploy(gitCommit)
  ).deployed();
  contractsRegistry.modules.irmLinear = await (
    await contractFactories.IRMLinear.deploy(gitCommit)
  ).deployed();

  // Create euler contract, which also installs the installer module and creates a proxy

  contractsRegistry.euler = await (
    await contractFactories.Euler.deploy(
      wallets[0].address,
      contractsRegistry.modules.installer.address
    )
  ).deployed();
  log(`Deployed: EULER CONTRACT - ${contractsRegistry.euler.address}`);

  // Get reference to installer proxy

  contractsRegistry.installer = await ethers.getContractAt(
    "Installer",
    await contractsRegistry.euler.moduleIdToProxy(ModuleIds.INSTALLER)
  );

  // Install the modules via Installer module

  let moduleAddresses = MODELUES_TO_INSTALL.map(
    (m) => contractsRegistry.modules[m].address
  );

  await (
    await contractsRegistry.installer
      .connect(wallets[0])
      .installModules(moduleAddresses)
  ).wait();
  log(`Installed the modules.`);

  // Get references to external single proxies

  contractsRegistry.markets = await ethers.getContractAt(
    "Markets",
    await contractsRegistry.euler.moduleIdToProxy(ModuleIds.MARKETS)
  );
  contractsRegistry.liquidation = await ethers.getContractAt(
    "Liquidation",
    await contractsRegistry.euler.moduleIdToProxy(ModuleIds.LIQUIDATION)
  );
  contractsRegistry.governance = await ethers.getContractAt(
    "Governance",
    await contractsRegistry.euler.moduleIdToProxy(ModuleIds.GOVERNANCE)
  );
  contractsRegistry.exec = await ethers.getContractAt(
    "Exec",
    await contractsRegistry.euler.moduleIdToProxy(ModuleIds.EXEC)
  );
  contractsRegistry.swap = await ethers.getContractAt(
    "Swap",
    await contractsRegistry.euler.moduleIdToProxy(ModuleIds.SWAP)
  );
  contractsRegistry.swapHub = await ethers.getContractAt(
    "SwapHub",
    await contractsRegistry.euler.moduleIdToProxy(ModuleIds.SWAP_HUB)
  );

  // Deploy swap handlers
  contractsRegistry.swapHandlers = {} as SwapHandlerRegistry;
  contractsRegistry.swapHandlers.swapHandlerUniswapV3 = await (
    await contractFactories.SwapHandlerUniswapV3.deploy(swapRouterV3Address)
  ).deployed();
  contractsRegistry.swapHandlers.swapHandler1Inch = await (
    await contractFactories.SwapHandler1Inch.deploy(
      oneInchAddress,
      swapRouterV2Address,
      swapRouterV3Address
    )
  ).deployed();
  contractsRegistry.swapHandlers.swapHandlerUniAutoRouter = await (
    await contractFactories.SwapHandlerUniAutoRouter.deploy(
      swapRouter02Address,
      swapRouterV2Address,
      swapRouterV3Address
    )
  ).deployed();
  log("Swap handles deployed.");

  // Setup default ETokens/DTokens

  for (let tok of tokenSetup.marketsToActivate || []) {
    await activateMarket(tok);
    log(`Activated: Market - ${tok}`);
  }

  for (let tok of tokenSetup.tokens || []) {
    if (tok.config && tokenSetup.marketsToActivate) {
      if (!tokenSetup.marketsToActivate.find((s) => s === tok.symbol))
        throw `can't set config for unactivated asset: ${tok.symbol}`;
      await setAssetConfig(
        contractsRegistry.tokens[tok.symbol].address,
        tok.config,
        wallets[0]
      );
      log(`CONFIG SET: Market - ${tok.symbol}`);
    }
  }

  // Setup adaptors

  contractsRegistry.flashLoan = await (
    contractFactories &&
    (await contractFactories.FlashLoan.deploy(
      contractsRegistry.euler.address,
      contractsRegistry.exec.address,
      contractsRegistry.markets.address
    ))
  ).deployed();

  log(
    `Deployed: Flashloan adaptor - ${contractsRegistry.flashLoan.address}`
  );

  writeAddressManifestToFile(contractsRegistry, "./deployed-addresses.json");

  return contractsRegistry;
}

export function writeAddressManifestToFile(
  contractRegistry: ContractsRegistry,
  filename: string
) {
  let addressManifest = exportAddressManifest(contractRegistry);
  let outputJson = JSON.stringify(addressManifest, (key) => {}, 4);
  fs.writeFileSync(filename, outputJson + "\n");
}

function exportAddressManifest(contractRegistry: ContractsRegistry) {
  let output: any = {
    tokens: {},
    modules: {},
    swapHandlers: {},
  };
  for (let name of Object.keys(contractRegistry)) {
    if (contractRegistry[name as keyof ContractsRegistry].address)
      output[name] = contractRegistry[name as keyof ContractsRegistry].address;
  }

  for (let token of Object.keys(contractRegistry.tokens)) {
    output.tokens[token] = contractRegistry.tokens[token].address;
  }

  for (let moduleName of Object.keys(contractRegistry.modules)) {
    output.modules[moduleName] =
      contractRegistry.modules[moduleName as ModuleName].address;
  }

  for (let swapHandlerName of Object.keys(
    contractRegistry.swapHandlers || {}
  )) {
    output.swapHandlers[swapHandlerName] =
      contractRegistry.swapHandlers &&
      contractRegistry.swapHandlers[swapHandlerName as SwapHandler].address;

    if (tokenSetup.useRealUniswap) {
      output.swapRouterV3.address =
        contractRegistry.swapRouterV3 && contractRegistry?.swapRouterV3.address;
      output.swapRouter02.address =
        contractRegistry.swapRouter02 && contractRegistry?.swapRouter02.address;
    }

    return output;
  }
}

export async function setAssetConfig(
  underlying: string,
  newConfig: TokenConfig,
  wallet: SignerWithAddress
) {
  let config: any =
    await contractsRegistry.markets.underlyingToAssetConfigUnresolved(
      underlying
    );

  config = {
    eTokenAddress: config.eTokenAddress,
    borrowIsolated: config.borrowIsolated,
    collateralFactor: config.collateralFactor,
    borrowFactor: config.borrowFactor,
    twapWindow: config.twapWindow,
  };

  if (newConfig.collateralFactor !== undefined)
    config.collateralFactor = Math.floor(
      newConfig.collateralFactor * 4000000000
    );

  if (newConfig.borrowFactor) {
    if (newConfig.borrowFactor === "default")
      newConfig.borrowFactor = 4294967295;
    config.borrowFactor = Math.floor(newConfig.borrowFactor * 4000000000);
  }
  if (newConfig.borrowIsolated !== undefined)
    config.borrowIsolated = newConfig.borrowIsolated;
  if (newConfig.twapWindow !== undefined)
    config.twapWindow = newConfig.twapWindow;
  if (newConfig.twapWindow === "default") newConfig.twapWindow = 16777215;

  await (
    await contractsRegistry.governance
      .connect(wallet)
      .setAssetConfig(underlying, config)
  ).wait();
}

async function poolAdjustedRatioToSqrtPriceX96(
  pool: string,
  a: number,
  b: number
) {
  return contractsRegistry.uniswapPools[pool].inverted
    ? ratioToSqrtPriceX96(a, b)
    : ratioToSqrtPriceX96(b, a);
}

async function createUniswapPool(pair: string[], fee: FeeAmount) {
  await (
    await contractsRegistry?.uniswapV3Factory.createPool(
      contractsRegistry?.tokens[pair[0]].address,
      contractsRegistry?.tokens[pair[1]].address,
      fee
    )
  ).wait();
  return await populateUniswapPool(pair, fee);
}

const populateUniswapPool = async (pair: string[], fee: FeeAmount) => {
  const addr = await contractsRegistry.uniswapV3Factory.getPool(
    contractsRegistry.tokens[pair[0]].address,
    contractsRegistry.tokens[pair[1]].address,
    fee
  );
  let inverted = ethers.BigNumber.from(
    contractsRegistry.tokens[pair[0]].address
  ).gt(contractsRegistry.tokens[pair[1]].address);
  contractsRegistry.uniswapPools[`${pair[0]}/${pair[1]}`] = {
    contract: await ethers.getContractAt("MockUniswapV3Pool", addr),
    inverted: !inverted,
  };

  contractsRegistry.uniswapPools[`${pair[1]}/${pair[0]}`] = {
    contract: await ethers.getContractAt("MockUniswapV3Pool", addr),
    inverted,
  };
  log(`Loaded Pool contract for ${`${pair[0]}/${pair[1]}`}: ${addr}`);
};

const lastBlockTimestamp = async (
  provider: ethersLib.providers.JsonRpcProvider
) => {
  return (await provider.getBlock("latest")).timestamp;
};

const checkpointTime = async (
  provider: ethersLib.providers.JsonRpcProvider
) => {
  lastCheckpointTime =
    lastBlockTimestamp && (await lastBlockTimestamp(provider));
};

const jumpTime = async (
  provider: ethersLib.providers.JsonRpcProvider,
  offset: number
) => {
  // Only works on hardhat EVM
  if (lastCheckpointTime) lastCheckpointTime += offset;
  await provider.send("evm_setNextBlockTimestamp", [lastCheckpointTime]);
};

const mineEmptyBlock = async (
  provider: ethersLib.providers.JsonRpcProvider
) => {
  await provider.send("evm_mine", []);
};

const fastForwardToBlock = async (
  provider: ethersLib.providers.JsonRpcProvider,
  targetBlock: any
) => {
  let curr = await provider.getBlockNumber();
  if (curr > targetBlock)
    throw `can't fast forward to block ${targetBlock}, already on ${curr}`;
  while (curr < targetBlock) {
    await mineEmptyBlock(provider);
    curr++;
  }
};

export const increaseTime = async (
  provider: ethersLib.providers.JsonRpcProvider,
  offset: any
) => {
  await provider.send("evm_increaseTime", [offset]);
};

const snapshot = async (provider: ethersLib.providers.JsonRpcProvider) => {
  lastSnapshotId = await provider.send("evm_snapshot", []);
  checkpointTime && (await checkpointTime(provider));
};

const revert = async (provider: ethersLib.providers.JsonRpcProvider) => {
  await provider.send("evm_revert", [lastSnapshotId]);
  checkpointTime && (await checkpointTime(provider));
};

const encodeUniswapPath = async (
  poolSymbols: string[],
  inTokenSymbol: string,
  outTokenSymbol: string,
  exactOutput = false
) => {
  let tokens: any = {};
  let pools = await Promise.all(
    poolSymbols.map(async (ps: string) => {
      let [t0s, t1s] = ps.split("/");
      let t0 = new Token(
        1,
        contractsRegistry.tokens[t0s].address,
        await contractsRegistry.tokens[t0s].decimals(),
        t0s,
        "token0"
      );
      let t1 = new Token(
        1,
        contractsRegistry.tokens[t1s].address,
        await contractsRegistry.tokens[t1s].decimals(),
        t1s,
        "token1"
      );
      tokens[t0s] = t0;
      tokens[t1s] = t1;

      return new Pool(
        t0,
        t1,
        defaultUniswapFee,
        ratioToSqrtPriceX96(1, 1),
        0,
        0,
        []
      );
    })
  );

  let route = new Route(pools, tokens[inTokenSymbol], tokens[outTokenSymbol]);
  return encodeRouteToPath(route, exactOutput);
};

async function activateMarket(tok: string) {
  let result =
    contractsRegistry.markets &&
    (await (
      await contractsRegistry.markets.activateMarket(
        contractsRegistry.tokens[tok]?.address
      )
    ).wait());
  log(`Market activated for token: ${tok}`);

  if (process.env.GAS) log(`GAS(activateMarket) : ${result?.gasUsed}`);

  const eTokenAddr = await contractsRegistry.markets.underlyingToEToken(
    contractsRegistry.tokens[tok].address
  );

  if (contractsRegistry.eTokens)
    contractsRegistry.eTokens["e" + tok] = await ethers.getContractAt(
      "EToken",
      eTokenAddr
    );
  log(`EToken for ${tok}: ${eTokenAddr}`);

  let dTokenAddr = await contractsRegistry.markets.eTokenToDToken(eTokenAddr);
  if (contractsRegistry.dTokens)
    contractsRegistry.dTokens[`d${tok}`] = await ethers.getContractAt(
      "DToken",
      dTokenAddr
    );
  log(`DToken for ${tok}: ${dTokenAddr}`);
}

export async function updateUniswapPrice(
  pair: string,
  price: string | ethersLib.ethers.BigNumber
) {
  let decimals = await contractsRegistry.tokens[pair.split("/")[0]].decimals();
  let a = ethers.utils.parseEther("1");
  let b =
    typeof price === "string"
      ? ethers.utils
          .parseEther(price)
          .mul(ethers.BigNumber.from(10).pow(18 - decimals))
      : price;


  let poolContract = contractsRegistry.uniswapPools[pair];
  if (!poolContract) throw Error(`Unknown pair: ${pair}`);

  if (poolContract.inverted) [a, b] = [b, a];

  let sqrtPriceX96 = ratioToSqrtPriceX96(a, b);
  await (await poolContract.contract.mockSetTwap(sqrtPriceX96)).wait();
  log(`Updated: TWAP for ${pair}`);
}
