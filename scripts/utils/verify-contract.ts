const hre = require("hardhat");

export async function verifyContract(contractAddress: string, params: any[]) {
  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: params,
  });
}