import { Network } from "../types";
import { TokensetupConfig } from "../types/token-setup.types";
import dev from "./dev";
import mumbai from "./mumbai";
import staging from "./staging";

export function getTokensetup(network: Network): TokensetupConfig {
  switch (network) {
    case "dev":
      return dev;
    case "mumbai":
      return mumbai;
    case "staging":
      return staging;
    default:
      return dev;
  }
}
