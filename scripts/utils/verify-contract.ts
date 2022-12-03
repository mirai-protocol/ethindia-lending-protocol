import { log } from "./logger";

const hre = require("hardhat");

export async function verifyContract(contractAddress: string, params: any[]) {
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: params,
    });
  } catch (err) {
    log(err);
  }
}