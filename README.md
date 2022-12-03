# Mirai Protocol Contracts

Smart contracts for Mirai protocol. This repository has been inspired from the Euler's repository and smart contracts.


## ENV Setup

1. Create `.env` file adding required values like RPC and Private key for deploying the contracts. Refer to `.env.example`.
2. There are few preset environment setups. Open [scripts](./scripts/) and checkout [network-setups](./scripts/network-setups/) and [token-setups](./scripts/token-setups/).
3. If you want to add new envrionment ( e.g. Polygin mainnet ): 
    - Create required token setup by creating file called: `polygon.ts` inside [token-setups](./scripts/token-setups/).
    - Create required network setup by creating file called: `polygin-setup.ts` inside [network-setups](./scripts/network-setups/)
    - Make sure thet RPC is being used for Polygon mainnet and account for private key has enough matic for deployments.
    - Make sure that hardhat config file has network block for required network.
    - Run: `npx hardhat run scripts/network-setup/{network-name}-setup.ts --network {network-name}`

## Few commands to get started
1. Compile all the contracts: 
    ``` npm run compile ```

2. Run setup script for hardaht network:
    ``` npm run setup:dev ```

3. Run lending market simulation:
    ``` npm run simulate```
    
## Architecture Diagram

![Mirai protocol architecture](./docs/Mirai%20Protocol%20Architecture.png)

