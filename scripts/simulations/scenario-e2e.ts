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
async function simulateDeposit() {
  {
    const fileName = "./deployments/mumbai.json";
    const tokenSetup = getTokensetup("mumbai");
    const contractsRegistry: ContractsRegistry = await loadContracts(fileName);
    const signers = await ethers.getSigners();
    for (let from of signers) {
      log(
        `******************* INITIALISING SIMULATION for ${from.address} ********************`
      );

      for (let token of tokenSetup.tokensToDeposit || []) {
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

        await (
          await contractsRegistry.eTokens[`e${token}`]
            .connect(from)
            .deposit(
              0,
              ethers.utils.parseUnits(
                "1000",
                await contractsRegistry.tokens[token].decimals()
              )
            )
        ).wait();
        log(`DEPOSIT: ${1000} ${token} by ${from.address}`);
      }
      log(
        `******************* COMPLETED SETUP for ${from.address} ********************\n`
      );
    }
    let count = 100;
    while (count > 0) {
      try {
        const actualAmount = Math.round(randomNumberGenerator() * 10000) / 100;
        const walletIndex = Math.floor(
          (randomNumberGenerator() * 100) % (signers.length * 10)
        );
        const actualSigner = signers[walletIndex] || signers[0];
        const tokenToUse = (tokenSetup.tokensToDeposit &&
          tokenSetup.tokensToDeposit[
            Math.floor(
              (randomNumberGenerator() * 100) %
                (tokenSetup.tokensToDeposit.length || 2)
            )
          ]) || ["USDC", "DAI"];
        const amount = ethers.utils.parseUnits(
          `${actualAmount}`,
          await contractsRegistry.tokens[`${tokenToUse}`].decimals()
        );
        const opts = {};
        log(`Random wallet index: ${walletIndex}`);
        if (walletIndex % 4 === 0) {
          await (
            await contractsRegistry.eTokens[`e${tokenToUse}`]
              .connect(actualSigner)
              .deposit(0, amount, opts)
          ).wait();
          log(
            `DEPOSIT: ${actualAmount} ${tokenToUse} by ${actualSigner.address}`
          );
        } else if (walletIndex % 4 === 1) {
          await (
            await contractsRegistry.eTokens[`e${tokenToUse}`]
              .connect(actualSigner)
              .withdraw(0, amount, opts)
          ).wait();
          log(
            `WITHDRAW: ${actualAmount} ${tokenToUse} by ${actualSigner.address}`
          );
        } else if (walletIndex % 4 === 2) {
          await (
            await contractsRegistry.dTokens[`d${tokenToUse}`]
              .connect(actualSigner)
              .borrow(0, amount, opts)
          ).wait();
          log(
            `BORROW: ${actualAmount} ${tokenToUse} by ${actualSigner.address}`
          );
        } else if (walletIndex % 4 === 3) {
          await (
            await contractsRegistry.dTokens[`d${tokenToUse}`]
              .connect(actualSigner)
              .repay(0, amount, opts)
          ).wait();
          log(
            `REPAY: ${actualAmount} ${tokenToUse} by ${actualSigner.address}`
          );
        }
        count--;
      } catch (e) {
        logError(e.message);
      }
    }
    await printAnalytics(contractsRegistry, tokenSetup);
  }
}

async function printAnalytics(
  contractsRegistry: ContractsRegistry,
  tokenSetup: TokensetupConfig
) {
  const table = new Table({
    columns: [
      { name: "market", alignment: "left", color: "yellow" },
      { name: "total-pool-size", alignment: "left", color: "yellow" },
      { name: "total-borrows", alignment: "left", color: "yellow" },
      { name: "interest-rate", alignment: "left", color: "yellow" },
      { name: "utilisation", alignment: "left", color: "yellow" },
      { name: "borrow-apr", alignment: "left", color: "yellow" },
    ],
  });
  for (const token of tokenSetup.tokensToDeposit || ["USDC", "DAI"]) {
    const market = token;
    const poolSize = await contractsRegistry.tokens[`${token}`].balanceOf(
      contractsRegistry.euler.address
    );

    const totalBorrows = await contractsRegistry.dTokens[
      `d${token}`
    ].totalSupply();

    const interestRate = await contractsRegistry.markets.interestRate(
      contractsRegistry.tokens[`${token}`].address
    );

    const utilisation = totalBorrows.eq(0)
      ? ethers.utils.parseEther("0")
      : totalBorrows
          .mul(ethers.utils.parseEther("1"))
          .div(poolSize.add(totalBorrows))
          .mul(100)
          .div(ethers.utils.parseEther("1"));

    const borrowAPR =
      interestRate
        .mul(86400 * 365)
        .mul(1000000)
        .div(ethers.BigNumber.from(1e13).mul(ethers.BigNumber.from(1e14)))
        .toNumber() / 10000;

    table.addRow({
      market,
      "total-pool-size": poolSize.toString(),
      "total-borrows": totalBorrows.toString(),
      "interest-rate": interestRate.toString(),
      utilisation: utilisation.toString(),
      "borrow-apr": borrowAPR.toString(),
    });
  }
  table.printTable();
}

simulateDeposit();
