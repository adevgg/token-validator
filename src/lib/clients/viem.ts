import { createPublicClient, http, PublicClient } from "viem";
import { ChainName, getChainConfig } from "./chains";

function infura(infuraChain: string, infuraApiKey: string) {
  return http(`https://${infuraChain}.infura.io/v3/${infuraApiKey}`);
}

const clients: Record<string, PublicClient> = {};

export const getClient = (
  chain: ChainName,
  { infuraApiKey }: Partial<{ infuraApiKey: string }>
) => {
  if (clients[chain]) {
    return clients[chain];
  }

  const chainConfig = getChainConfig(chain);

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
