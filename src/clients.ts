import { createPublicClient, http, PublicClient } from "viem";
import * as chains from "viem/chains";

const CHAIN_MAPPING = {
  baseMainnet: {
    viem: chains.base,
    infura: "base-mainnet",
  },
};

function infura(infuraChain: string, infuraApiKey: string) {
  return http(`https://${infuraChain}.infura.io/v3/${infuraApiKey}`);
}

const clients: Record<string, PublicClient> = {};

export const getClient = (
  chain: string,
  { infuraApiKey }: Partial<{ infuraApiKey: string }>
) => {
  if (clients[chain]) {
    return clients[chain];
  }

  const chainConfig = CHAIN_MAPPING[chain as keyof typeof CHAIN_MAPPING];

  if (!chainConfig) {
    throw new Error(`Chain ${chain} not supported`);
  }

  const transport =
    infuraApiKey && chainConfig.infura
      ? infura(chainConfig.infura, infuraApiKey)
      : http();

  const client = createPublicClient({
    chain: chainConfig.viem,
    transport,
  }) as PublicClient;

  clients[chain] = client;
  return client;
};
