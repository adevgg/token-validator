import { ChainName, getChainConfig } from "./chains";

type EtherscanResponse<T> = {
  status: `${number}`;
  message: string;
  result: T;
};

type ContractCreationData = {
  contractAddress: string;
  contractCreator: string;
  txHash: string;
  blockNumber: string;
  timestamp: string;
  contractFactory: string;
  creationBytecode: string;
};

const ETHERSCAN_API_URL = "https://api.etherscan.io/v2/api";

export class EtherscanClient {
  private readonly apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async getContractCreation(address: string, chain: ChainName) {
    const { viem } = getChainConfig(chain);
    const chainId = viem.id;

    const params = new URLSearchParams({
      chainid: String(chainId),
      module: "contract",
      action: "getcontractcreation",
      address,
      contractaddresses: address,
    });
    if (this.apiKey != null && this.apiKey !== "") {
      params.set("apikey", this.apiKey);
    }

    const url = `${ETHERSCAN_API_URL}?${params.toString()}`;
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Etherscan HTTP ${res.status}: ${body || res.statusText}`);
    }

    const data = (await res.json()) as EtherscanResponse<ContractCreationData[]>;
    return handleEtherscanResponse(data)[0];
  }
}

function handleEtherscanResponse<T>(response: EtherscanResponse<T>) {
  if (response.status !== "1") {
    throw new Error(`Failed to call Etherscan API: ${response.result}`);
  }

  return response.result;
}

let client: EtherscanClient | null = null;

export const getEtherscanClient = (apiKey?: string) => {
  if (client) {
    return client;
  }
  client = new EtherscanClient(apiKey);
  return client;
};
