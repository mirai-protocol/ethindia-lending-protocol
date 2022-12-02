import * as hre from "hardhat";
const ethers = hre.ethers;
import {
  initContracts,
  deplyContracts,
  updateUniswapPrice,
  increaseTime,
} from "../deployment-pipeline";
import { ContractsRegistry } from "../types";
import { DEFAULT_TEST_ACCOUNTS } from "../utils/constants";
import { log } from "../utils/logger";

async function main() {
  const wallets = await ethers.getSigners();
  await initContracts(ethers.provider, wallets, "dev");
  const contractsRegistry: ContractsRegistry = await deplyContracts(wallets);

  // Supply tokens to test account

  for (let token of Object.keys(contractsRegistry.tokens)) {
    await contractsRegistry.tokens[token].mint(
      wallets[0].address,
      ethers.utils.parseEther("10000")
    );
    log(`Minted: ${token}`);
  }

  for (let addr of DEFAULT_TEST_ACCOUNTS) {
    await contractsRegistry.tokens.TST.mint(
      addr,
      ethers.utils.parseEther("1000")
    );
    await contractsRegistry.tokens.TST2.mint(
      addr,
      ethers.utils.parseEther("1000")
    );
  }

  // Setting prices

  await updateUniswapPrice("TST/WETH", "0.005882");

  await updateUniswapPrice("TST2/WETH", "0.000047411");

  await updateUniswapPrice("TST3/WETH", "6.9145811");

  await updateUniswapPrice("UTST/WETH", "0.019244");

  // Fast forward time so prices become active

  await increaseTime(ethers.provider, 31 * 60);
}

main();
