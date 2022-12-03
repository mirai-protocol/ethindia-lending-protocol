export interface TokensetupConfig {
  tokens?: Token[];
  existingTokens?: ExistingToken[];
  uniswapPools?: string[][];
  marketsToActivate?: string[];
  existingContracts?: {
    [key: string]: string;
  };
  riskManagerSettings?: {
    [key: string]: string;
  }
  deployUniswap: boolean;
  public?: boolean;
}

export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  config?: TokenConfig;
}

export interface ExistingToken extends Token {
  address: string;
}

export interface TokenConfig {
  collateralFactor: number;
  borrowIsolated: boolean;
  borrowFactor?: number | 'default';
  twapWindow?: number | 'default';
}
