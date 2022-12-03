import { MaxUint256 } from "@uniswap/sdk-core";
import { ethers } from "hardhat";
import { jumpTime, mineEmptyBlock, tokenSetup } from "../deployment-pipeline";
import { loadContracts } from "../load-contracts";
import { log, logError } from "../utils/logger";
import * as seedrandom from "seedrandom";
import { Table } from "console-table-printer";
import { ContractsRegistry } from "../types";
import { getTokensetup } from "../token-setups";
import { TokensetupConfig } from "../types/token-setup.types";

let randomNumberGenerator = seedrandom.alea("");

// To be run on local hardhat network.
async function simulateCrossDepositBorrow() {
  {
    const fileName = "./deployments/mumbai.json";
    const contractsRegistry: ContractsRegistry = await loadContracts(fileName);
    const signers = await ethers.getSigners();
    for (let from of signers) {
      log(
        `******************* INITIALISING SIMULATION for ${from.address} ********************`
      );

      for (let token of tokenSetup.tokensToDeposit || ['USDC', 'DAI']) {
        // mint
        await contractsRegistry.tokens[token].mint(
          from.address,
          ethers.utils.parseEther("100000")
        );
        log(`MINT: ${100000} ${token} to ${from.address}`);

        // approve
        await contractsRegistry.tokens[token]
          .connect(from)
          .approve(
            contractsRegistry.euler.address,
            ethers.BigNumber.from(MaxUint256.toString())
          );
        log(
          `APPROVE: ${MaxUint256.toString()} ${token} to ${
            contractsRegistry.euler.address
          }`
        );

        // enter market
        await contractsRegistry.markets
          .connect(from)
          .enterMarket(0, contractsRegistry.tokens[token].address);
        log(`ENTERMARKET: ${token} by ${from.address}`);
      }
      log(
        `******************* COMPLETED SETUP for ${from.address} ********************\n`
      );
    }
    try {
      const actualAmount = 100;
      const actualSigner = signers[0];
      const opts = {};

      await (
        await contractsRegistry.eTokens[`eUSDC`]
          .connect(actualSigner)
          .deposit(
            0,
            ethers.utils.parseUnits(
              `${actualAmount}`,
              await contractsRegistry.tokens[`USDC`].decimals()
            ),
            opts
          )
      ).wait();
      log(`DEPOSIT: ${actualAmount} USDC by ${actualSigner.address}`);

      await (
        await contractsRegistry.dTokens[`dDAI`]
          .connect(actualSigner)
          .borrow(
            0,
            ethers.utils.parseUnits(
              `${actualAmount - 90}`,
              await contractsRegistry.tokens[`DAI`].decimals()
            ),
            opts
          )
      ).wait();
      log(`BORROW: ${actualAmount} DAI by ${actualSigner.address}`);
    } catch (e) {
      logError(e.message);
    }
  }
}

simulateCrossDepositBorrow();
