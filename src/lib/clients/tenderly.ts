import { ChainName, getChainConfig } from "./chains";

/** Shape aligned with Etherscan getcontractcreation result. */
export type ContractCreationData = {
  contractAddress: string;
  contractCreator: string;
  txHash: string;
  blockNumber: string;
  /** Unix seconds as string (same as Etherscan). */
  timestamp: string;
  contractFactory: string;
};

type TenderlyCreationTx = {
  contractAddress: string;
  contractCreator: string;
  creatorType: string;
  txHash: string;
  blockNumber: string;
  blockHash: string;
  timestamp: string;
  isPrecompile: boolean;
};

const TENDERLY_API_URL = "https://api.tenderly.co/api/v1/public-contracts";

export class TenderlyClient {
  async getContractCreation(
    address: string,
    chain: ChainName
  ): Promise<ContractCreationData> {
    const { viem } = getChainConfig(chain);
    const chainId = viem.id;
    const url = `${TENDERLY_API_URL}/contract/${chainId}/${address.toLowerCase()}/creation-tx`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Tenderly HTTP ${res.status}: ${body || res.statusText}`);
    }

    const data = (await res.json()) as TenderlyCreationTx;
    return normalizeCreationTx(data);
  }
}

function normalizeCreationTx(data: TenderlyCreationTx): ContractCreationData {
  const unixSeconds = Math.floor(Date.parse(data.timestamp) / 1000);
  if (Number.isNaN(unixSeconds)) {
    throw new Error(`Tenderly invalid timestamp: ${data.timestamp}`);
  }

  const blockNumber = data.blockNumber.startsWith("0x")
    ? BigInt(data.blockNumber).toString()
    : data.blockNumber;

  // Tenderly's contractCreator is the direct creator (factory for CREATE/CREATE2).
  return {
    contractAddress: data.contractAddress,
    contractCreator: data.contractCreator,
    txHash: data.txHash,
    blockNumber,
    timestamp: String(unixSeconds),
    contractFactory: data.contractCreator,
  };
}

let client: TenderlyClient | null = null;

export const getTenderlyClient = () => {
  if (client) {
    return client;
  }
  client = new TenderlyClient();
  return client;
};
