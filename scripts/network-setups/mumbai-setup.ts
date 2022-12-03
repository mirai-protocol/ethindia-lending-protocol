import hre from "hardhat";
const ethers = hre.ethers;
import {
  initContracts,
  deplyContracts,
  writeAddressManifestToFile,
} from "../deployment-pipeline";

async function main() {
  await initContracts(ethers.provider, await ethers.getSigners(), "mumbai");
  const contractsRegistry = await deplyContracts(await ethers.getSigners());
  const network = await ethers.getDefaultProvider().getNetwork();
  writeAddressManifestToFile(
    contractsRegistry,
    `./deployments/${network.name} - ${new Date().toJSON()}.json`
  );
}

main();
