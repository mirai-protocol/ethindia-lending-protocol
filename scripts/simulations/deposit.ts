import { MaxUint256 } from "@uniswap/sdk-core";
import { ethers } from "hardhat";
import {
  deplyContracts,
  initContracts,
  tokenSetup,
} from "../deployment-pipeline";
import { getTokensetup } from "../token-setups";
import { log } from "../utils/logger";

// To be run on local hardhat network.
async function simulateDeposit() {
  {
    await initContracts(ethers.provider, await ethers.getSigners(), "mumbai");
    const contractsRegistry = await deplyContracts(await ethers.getSigners());
    const signers = await ethers.getSigners();
    for (let from of signers) {
      log(
        `******************* RUNNING DEPOSIT SIMULATION for ${from.address} ********************`
      );

      for (let token of tokenSetup.tokensToDeposit || []) {
        // mint
        await contractsRegistry.tokens[token].mint(
          from.address,
          ethers.utils.parseEther("10")
        );
        log(`MINT: ${10} ${token} to ${from.address}`);

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

        // Deposit
        await (
          await contractsRegistry.eTokens[`e${token}`]
            .connect(from)
            .deposit(0, ethers.utils.parseEther("10"))
        ).wait();
        log(`DEPOSIT: ${10} ${token} by ${from.address}`);
      }
      log(
        `******************* COMPLETED DEPOSIT SIMULATION for ${from.address} ********************\n`
      );
    }

    // // Fast forward time so prices become active

    // await checkpointTime();
    // await jumpTime(31 * 60);
    // await mineEmptyBlock();

    // let startTime = (await ctx.provider.getBlock()).timestamp;

    // let rng = seedrandom("");

    // let genAmount = () => {
    //   return et.eth("" + Math.round(rng() * 1000) / 100);
    // };

    // let currIter = 0;
    // let numIters = process.env.ITERS ? parseInt(process.env.ITERS) : Infinity;

    // while (currIter++ < numIters) {
    //   let sleepTimeSeconds = Math.floor(rng() * 86400);
    //   verboseLog(`sleeping ${sleepTimeSeconds}s`);
    //   await ctx.jumpTime(sleepTimeSeconds);
    //   await ctx.mineEmptyBlock();

    //   let now = (await ctx.provider.getBlock()).timestamp;

    //   let op = Math.floor(rng() * 4);
    //   let amount = genAmount();
    //   let amountPretty = ethers.utils.formatEther(amount);

    //   let opts = {};

    //   try {
    //     if (op === 0) {
    //       verboseLog(`deposit ${amountPretty}`);
    //       await (
    //         await ctx.contracts.eTokens.eTST
    //           .connect(ctx.wallet)
    //           .deposit(0, amount, opts)
    //       ).wait();
    //     } else if (op === 1) {
    //       verboseLog(`withdraw ${amountPretty}`);
    //       await (
    //         await ctx.contracts.eTokens.eTST
    //           .connect(ctx.wallet)
    //           .withdraw(0, amount, opts)
    //       ).wait();
    //     } else if (op === 2) {
    //       verboseLog(`borrow ${amountPretty}`);
    //       await (
    //         await ctx.contracts.dTokens.dTST
    //           .connect(ctx.wallet2)
    //           .borrow(0, amount, opts)
    //       ).wait();
    //     } else if (op === 3) {
    //       verboseLog(`repay ${amountPretty}`);
    //       await (
    //         await ctx.contracts.dTokens.dTST
    //           .connect(ctx.wallet2)
    //           .repay(0, amount, opts)
    //       ).wait();
    //     }
    //   } catch (e) {
    //     console.error(e.message);
    //   }

    //   if (process.env.INVARIANTS) {
    //     let markets = ["TST", "TST2"].map(
    //       (m) => ctx.contracts.tokens[m].address
    //     );
    //     let accounts = [ctx.wallet.address, ctx.wallet2.address];

    //     let result = await ctx.contracts.invariantChecker.check(
    //       ctx.contracts.euler.address,
    //       markets,
    //       accounts,
    //       !!process.env.VERBOSE
    //     );
    //   }

    //   let poolSize = await ctx.contracts.tokens.TST.balanceOf(
    //     ctx.contracts.euler.address
    //   );
    //   let totalBorrows = await ctx.contracts.dTokens.dTST.totalSupply();
    //   let interestRate = await ctx.contracts.markets.interestRate(
    //     ctx.contracts.tokens.TST.address
    //   );

    //   let utilisation = totalBorrows.eq(0)
    //     ? et.eth(0)
    //     : totalBorrows.mul(et.c1e18).div(poolSize.add(totalBorrows));
    //   let borrowAPR =
    //     interestRate
    //       .mul(86400 * 365)
    //       .mul(1000000)
    //       .div(et.c1e27)
    //       .toNumber() / 1000000;

    //   verboseLog(
    //     `${now - startTime} ${ethers.utils.formatEther(
    //       poolSize
    //     )} ${ethers.utils.formatEther(totalBorrows)} ${ethers.utils.formatEther(
    //       utilisation
    //     )} => ${interestRate} ${borrowAPR}`
    //   );
    //   console.log(
    //     `${now - startTime} ${ethers.utils.formatEther(
    //       utilisation
    //     )} ${borrowAPR}`
    //   );
    // }
  }
}

simulateDeposit();
