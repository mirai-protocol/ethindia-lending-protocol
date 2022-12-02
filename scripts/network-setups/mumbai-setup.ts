import hre from "hardhat";
const ethers = hre.ethers;
import { initContracts, deplyContracts } from "../deployment-pipeline";

async function main() {
  await initContracts(ethers.provider, await ethers.getSigners(), "mumbai");
  await deplyContracts(await ethers.getSigners());
}

main();
