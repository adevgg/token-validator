import * as chains from "viem/chains";

const CHAIN_CONFIG = {
  baseMainnet: {
    viem: chains.base,
    infura: "base-mainnet",
  },
} satisfies Record<string, ChainConfig>;

export type ChainName = keyof typeof CHAIN_CONFIG;

export type ChainConfig = {
  viem: chains.Chain;
  infura: string;
};

export function getChainConfig(chain: ChainName) {
  const config = CHAIN_CONFIG[chain];
  if (!config) {
    throw new Error(`Chain ${chain} not supported`);
  }
  return config;
}
