import axios, { AxiosInstance } from "axios";
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

export class EtherscanClient {
  private readonly axios: AxiosInstance;

  constructor(apiKey?: string) {
    this.axios = axios.create({
      baseURL: "https://api.etherscan.io/v2",
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        apikey: apiKey,
      },
    });
  }

  async getContractCreation(address: string, chain: ChainName) {
    const { viem } = getChainConfig(chain);
    const chainId = viem.id;

    const { data } = await this.axios.get<
      EtherscanResponse<ContractCreationData[]>
    >("/api", {
      params: {
        chainid: chainId,
        module: "contract",
        action: "getcontractcreation",
        address: address,
        contractaddresses: address,
      },
    });

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
