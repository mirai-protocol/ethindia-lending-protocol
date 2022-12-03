import hre from "hardhat";
const ethers = hre.ethers;
import {
  initContracts,
  deplyContracts,
  writeAddressManifestToFile,
} from "../deployment-pipeline";

async function main() {
  await _main();
}

async function _main() {
  await initContracts(ethers.provider, await ethers.getSigners(), "mumbai");
  const contractsRegistry = await deplyContracts(await ethers.getSigners());
  const network = await ethers.getDefaultProvider().getNetwork();
  writeAddressManifestToFile(
    contractsRegistry,
    `./deployments/${network.name}/${
      network.name
    } - ${new Date().toJSON()}.json`
  );
  writeAddressManifestToFile(
    contractsRegistry,
    `./deployments/${network.name}/${
      network.name
    } - ${new Date().toJSON()}.json`
  );
  return contractsRegistry;
}

export { _main };

main();
