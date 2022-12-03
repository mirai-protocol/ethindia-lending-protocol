import { ethers } from "hardhat";
import { ContractsRegistry } from "./types";
import * as fs from "fs";
import * as child_process from "child_process";
import { log, logError } from "./utils/logger";

const contractsRegistry = {
  tokens: {},
  eTokens: {},
  dTokens: {},
  modules: {},
  swapHandlers: {},
} as ContractsRegistry;

export async function loadContracts(
  fileName: string
): Promise<ContractsRegistry> {
  const deployedContracts: any = JSON.parse(fs.readFileSync(fileName, "utf-8"));
  contractsRegistry.modules["installer"] = await ethers.getContractAt(
    "Installer",
    deployedContracts.modules.installer || ""
  );
  log(
    `LOADED: Module - Installer at ${contractsRegistry.modules["installer"].address}`
  );
  contractsRegistry.modules["markets"] = await ethers.getContractAt(
    "Markets",
    deployedContracts.modules.markets || ""
  );
  log(
    `LOADED: Module - Markets at ${contractsRegistry.modules["markets"].address}`
  );

  contractsRegistry.modules["liquidation"] = await ethers.getContractAt(
    "Liquidation",
    deployedContracts.modules.liquidation || ""
  );
  log(
    `LOADED: Module - liquidation at ${contractsRegistry.modules["liquidation"].address}`
  );

  contractsRegistry.modules["governance"] = await ethers.getContractAt(
    "Governance",
    deployedContracts.modules.governance || ""
  );
  log(
    `LOADED: Module - governance at ${contractsRegistry.modules["governance"].address}`
  );

  contractsRegistry.modules["exec"] = await ethers.getContractAt(
    "Exec",
    deployedContracts.modules.exec || ""
  );
  log(`LOADED: Module - exec at ${contractsRegistry.modules["exec"].address}`);

  contractsRegistry.modules["swap"] = await ethers.getContractAt(
    "Swap",
    deployedContracts.modules.swap || ""
  );
  log(`LOADED: Module - swap at ${contractsRegistry.modules["swap"].address}`);

  contractsRegistry.modules["eToken"] = await ethers.getContractAt(
    "EToken",
    deployedContracts.modules.eToken || ""
  );
  log(
    `LOADED: Module - eToken at ${contractsRegistry.modules["eToken"].address}`
  );

  contractsRegistry.modules["dToken"] = await ethers.getContractAt(
    "DToken",
    deployedContracts.modules.dToken || ""
  );
  log(
    `LOADED: Module - dToken at ${contractsRegistry.modules["dToken"].address}`
  );

  contractsRegistry.modules["riskManager"] = await ethers.getContractAt(
    "RiskManager",
    deployedContracts.modules.riskManager || ""
  );
  log(
    `LOADED: Module - riskManager at ${contractsRegistry.modules["riskManager"].address}`
  );

  contractsRegistry.modules["irmDefault"] = await ethers.getContractAt(
    "IRMDefault",
    deployedContracts.modules.irmDefault || ""
  );
  log(
    `LOADED: Module - irmDefault at ${contractsRegistry.modules["irmDefault"].address}`
  );

  contractsRegistry.modules["irmZero"] = await ethers.getContractAt(
    "IRMZero",
    deployedContracts.modules.irmZero || ""
  );
  log(
    `LOADED: Module - irmZero at ${contractsRegistry.modules["irmZero"].address}`
  );

  contractsRegistry.modules["irmFixed"] = await ethers.getContractAt(
    "IRMFixed",
    deployedContracts.modules.irmFixed || ""
  );
  log(
    `LOADED: Module - irmFixed at ${contractsRegistry.modules["irmFixed"].address}`
  );

  contractsRegistry.modules["irmLinear"] = await ethers.getContractAt(
    "IRMLinear",
    deployedContracts.modules.irmLinear || ""
  );
  log(
    `LOADED: Module - irmLinear at ${contractsRegistry.modules["irmLinear"].address}`
  );

  contractsRegistry.swapHandlers["swapHandlerUniswapV3"] =
    await ethers.getContractAt(
      "SwapHandlerUniswapV3",
      deployedContracts.swapHandlers.swapHandlerUniswapV3 || ""
    );
  log(
    `LOADED: SwapHandler - swapHandlerUniswapV3 at ${contractsRegistry.swapHandlers["swapHandlerUniswapV3"].address}`
  );

  contractsRegistry.swapHandlers["swapHandler1Inch"] =
    await ethers.getContractAt(
      "SwapHandler1Inch",
      deployedContracts.swapHandlers.swapHandler1Inch || ""
    );
  log(
    `LOADED: SwapHandler - swapHandler1Inch at ${contractsRegistry.swapHandlers["swapHandler1Inch"].address}`
  );
  contractsRegistry.swapHandlers["swapHandlerUniAutoRouter"] =
    await ethers.getContractAt(
      "SwapHandlerUniAutoRouter",
      deployedContracts.swapHandlers.swapHandlerUniAutoRouter || ""
    );
  log(
    `LOADED: SwapHandler - swapHandlerUniAutoRouter at ${contractsRegistry.swapHandlers["swapHandlerUniAutoRouter"].address}`
  );
  contractsRegistry["invariantChecker"] = await ethers.getContractAt(
    "InvariantChecker",
    deployedContracts.invariantChecker || ""
  );
  log(
    `LOADED: invariantChecker at ${contractsRegistry["invariantChecker"].address}`
  );
  contractsRegistry["flashLoanNativeTest"] = await ethers.getContractAt(
    "FlashLoanNativeTest",
    deployedContracts.flashLoanNativeTest || ""
  );
  log(
    `LOADED: flashLoanNativeTest at ${contractsRegistry["flashLoanNativeTest"].address}`
  );
  contractsRegistry["flashLoanAdaptorTest"] = await ethers.getContractAt(
    "FlashLoanAdaptorTest",
    deployedContracts.flashLoanAdaptorTest || ""
  );
  log(
    `LOADED: flashLoanAdaptorTest at ${contractsRegistry["flashLoanAdaptorTest"].address}`
  );
  contractsRegistry["flashLoanAdaptorTest2"] = await ethers.getContractAt(
    "FlashLoanAdaptorTest2",
    deployedContracts.flashLoanAdaptorTest2 || ""
  );
  log(
    `LOADED: flashLoanAdaptorTest2 at ${contractsRegistry["flashLoanAdaptorTest2"].address}`
  );
  contractsRegistry["simpleUniswapPeriphery"] = await ethers.getContractAt(
    "SimpleUniswapPeriphery",
    deployedContracts.simpleUniswapPeriphery || ""
  );
  log(
    `LOADED: simpleUniswapPeriphery at ${contractsRegistry["simpleUniswapPeriphery"].address}`
  );
  contractsRegistry["eulerGeneralView"] = await ethers.getContractAt(
    "EulerGeneralView",
    deployedContracts.eulerGeneralView || ""
  );
  log(
    `LOADED: eulerGeneralView at ${contractsRegistry["eulerGeneralView"].address}`
  );
  contractsRegistry["euler"] = await ethers.getContractAt(
    "Euler",
    deployedContracts.euler || ""
  );
  log(`LOADED: euler at ${contractsRegistry["euler"].address}`);
  contractsRegistry["installer"] = await ethers.getContractAt(
    "Installer",
    deployedContracts.installer || ""
  );
  log(`LOADED: installer at ${contractsRegistry["installer"].address}`);

  contractsRegistry["markets"] = await ethers.getContractAt(
    "Markets",
    deployedContracts.markets || ""
  );
  log(`LOADED: markets at ${contractsRegistry["markets"].address}`);
  contractsRegistry["liquidation"] = await ethers.getContractAt(
    "Liquidation",
    deployedContracts.liquidation || ""
  );
  log(`LOADED: liquidation at ${contractsRegistry["liquidation"].address}`);
  contractsRegistry["governance"] = await ethers.getContractAt(
    "Governance",
    deployedContracts.governance || ""
  );
  log(`LOADED: governance at ${contractsRegistry["governance"].address}`);
  contractsRegistry["exec"] = await ethers.getContractAt(
    "Exec",
    deployedContracts.exec || ""
  );
  log(`LOADED: exec at ${contractsRegistry["exec"].address}`);
  contractsRegistry["swap"] = await ethers.getContractAt(
    "Swap",
    deployedContracts.swap || ""
  );
  log(`LOADED: swap at ${contractsRegistry["swap"].address}`);
  contractsRegistry["swapHub"] = await ethers.getContractAt(
    "SwapHub",
    deployedContracts.swapHub || ""
  );
  log(`LOADED: swapHub at ${contractsRegistry["swapHub"].address}`);
  contractsRegistry["flashLoan"] = await ethers.getContractAt(
    "FlashLoan",
    deployedContracts.flashLoan || ""
  );
  log(`LOADED: flashLoan at ${contractsRegistry["flashLoan"].address}`);

  for (const token in deployedContracts.tokens) {
    contractsRegistry.tokens[token] = await ethers.getContractAt(
      "TestERC20",
      deployedContracts.tokens[token]
    );
    log(`LOADED: ${token} at ${contractsRegistry.tokens[token].address}`);
    try {
      const eTokenAddr = await contractsRegistry.markets.underlyingToEToken(
        contractsRegistry.tokens[token].address
      );
      contractsRegistry.eTokens["e" + token] = await ethers.getContractAt(
        "EToken",
        eTokenAddr
      );
      log(
        `LOADED: e${token} at ${contractsRegistry.eTokens["e" + token].address}`
      );

      let dTokenAddr = await contractsRegistry.markets.eTokenToDToken(
        eTokenAddr
      );
      contractsRegistry.dTokens[`d${token}`] = await ethers.getContractAt(
        "DToken",
        dTokenAddr
      );
      log(
        `LOADED: d${token} at ${contractsRegistry.dTokens["d" + token].address}`
      );
    } catch (e) {
      logError(`Skipping eToken config for ${token}`);
    }
  }

  return contractsRegistry;
}
