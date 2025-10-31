import {
  Address,
  erc20Abi,
  getAddress,
  Hash,
  isAddress,
  PublicClient,
} from "viem";
import {
  BURNER_ROLE,
  DEFAULT_ADMIN_ROLE,
  GeneralAbi,
  MANAGER_ROLE,
  MINTER_ROLE,
  PAUSER_ROLE,
  SALVAGER_ROLE,
  UPGRADER_ROLE,
} from "../helpers/abis";
import { getEIP1967ImplicitAddress } from "../helpers/eip1967";
import { createErrorResponse, createSuccessResponse } from "../helpers/utils";
import { ChainName } from "./clients/chains";
import { EtherscanClient, getEtherscanClient } from "./clients/etherscan";
import { getClient } from "./clients/viem";

export async function handleGetSBTInformation(
  request: Request,
  env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const address = url.searchParams.get("address");
  const chain = url.searchParams.get("chain") as ChainName;

  if (!address || !isAddress(address)) {
    return createErrorResponse("INVALID_REQUEST", "Invalid address", 400);
  }

  if (!chain) {
    return createErrorResponse("INVALID_REQUEST", "Invalid chain", 400);
  }

  const etherscan = getEtherscanClient(env.ETHERSCAN_API_KEY);
  const client = getClient(chain, {
    infuraApiKey: env.INFURA_API_KEY,
  });

  const info = await getSBTInformation(chain, address, client, etherscan);
  return createSuccessResponse(info);
}

const FOCUS_ROLES = Object.entries({
  DEFAULT_ADMIN_ROLE,
  BURNER_ROLE,
  MANAGER_ROLE,
  MINTER_ROLE,
  PAUSER_ROLE,
  SALVAGER_ROLE,
  UPGRADER_ROLE,
});

export const getSBTInformation = async (
  chain: ChainName,
  address: Address,
  client: PublicClient,
  etherscan: EtherscanClient
) => {
  const contractCreationDetailsPromise = getContractCreationDetails(
    chain,
    address,
    client,
    etherscan
  );

  const getImplementationPromise = getEIP1967ImplicitAddress(client, address);
  const getTokenInfoPromise = client.multicall({
    contracts: [
      {
        address,
        abi: erc20Abi,
        functionName: "name",
        args: [],
      },
      {
        address,
        abi: erc20Abi,
        functionName: "symbol",
        args: [],
      },
      {
        address,
        abi: erc20Abi,
        functionName: "decimals",
        args: [],
      },
      {
        address,
        abi: erc20Abi,
        functionName: "totalSupply",
        args: [],
      },
    ],
    allowFailure: true,
  });

  const getRolesPromise = client
    .multicall({
      contracts: FOCUS_ROLES.map(([, role]) => ({
        address,
        abi: GeneralAbi,
        functionName: "getRoleMembers",
        args: [role],
      })),
      allowFailure: true,
    })
    .then((results) => {
      return Object.fromEntries(
        results.map((result, index) => {
          const [roleName] = FOCUS_ROLES[index];

          return [roleName, result];
        })
      );
    });

  const [
    implementation,
    [name, symbol, decimals, totalSupply],
    roles,
    contractCreationDetails,
  ] = await Promise.all([
    getImplementationPromise,
    getTokenInfoPromise,
    getRolesPromise,
    contractCreationDetailsPromise,
  ]);

  return {
    implementation,
    name,
    symbol,
    decimals,
    totalSupply,
    ...roles,
    ...contractCreationDetails,
  };
};

async function getContractCreationDetails(
  chain: ChainName,
  address: Address,
  client: PublicClient,
  etherscan: EtherscanClient
) {
  try {
    const contractCreation = await etherscan.getContractCreation(
      address,
      chain
    );

    const { txHash, timestamp } = contractCreation;
    const tx = await client.getTransaction({ hash: txHash as Hash });
    const contractFactory = tx.to;

    return {
      txHash: { status: "success", result: txHash },
      createdAt: {
        status: "success",
        result: new Date(Number(timestamp) * 1000),
      },
      contractFactory: {
        status: "success",
        result: contractFactory ? getAddress(contractFactory) : null,
      },
    };
  } catch (error) {
    console.error(
      `[getSBTInformation] Error getting contract creation:`,
      error
    );

    return {
      txHash: { status: "failure", error: error },
      createdAt: { status: "failure", error: error },
      contractFactory: { status: "failure", error: error },
    };
  }
}
