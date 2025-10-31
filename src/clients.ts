import { createPublicClient, http, PublicClient } from "viem";
import { base } from "viem/chains";

const baseMainnet = createPublicClient({
  chain: base,
  transport: http(),
}) as PublicClient;

const clients = {
  baseMainnet,
};

export const getClient = (chain: string) => {
  return clients[chain as keyof typeof clients];
};
