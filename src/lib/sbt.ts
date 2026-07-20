import {
  Address,
  erc20Abi,
  getAddress,
  Hash,
  isAddress,
  keccak256,
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
import { getTenderlyClient, TenderlyClient } from "./clients/tenderly";
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

  const tenderly = getTenderlyClient();
  const client = getClient(chain, {
    infuraApiKey: env.INFURA_API_KEY,
  });

  const info = await getSBTInformation(chain, address, client, tenderly);
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
  tenderly: TenderlyClient
) => {
  const contractCreationDetailsPromise = getContractCreationDetails(
    chain,
    address,
    client,
    tenderly
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

  const getRolesPromise = (async () => {
    const counts = await client.multicall({
      contracts: FOCUS_ROLES.map(([, role]) => ({
        address,
        abi: GeneralAbi,
        functionName: "getRoleMemberCount" as const,
        args: [role] as const,
      })),
      allowFailure: true,
    });

    const memberCalls: { roleIndex: number; memberIndex: number }[] = [];
    const contracts: {
      address: Address;
      abi: typeof GeneralAbi;
      functionName: "getRoleMember";
      args: [`0x${string}`, bigint];
    }[] = [];

    for (let roleIndex = 0; roleIndex < FOCUS_ROLES.length; roleIndex++) {
      const countResult = counts[roleIndex];
      if (countResult.status !== "success") {
        continue;
      }

      const count = Number(countResult.result);
      const [, role] = FOCUS_ROLES[roleIndex];
      for (let memberIndex = 0; memberIndex < count; memberIndex++) {
        memberCalls.push({ roleIndex, memberIndex });
        contracts.push({
          address,
          abi: GeneralAbi,
          functionName: "getRoleMember",
          args: [role as `0x${string}`, BigInt(memberIndex)],
        });
      }
    }

    const memberResults =
      contracts.length > 0
        ? await client.multicall({
            contracts,
            allowFailure: true,
          })
        : [];

    const membersByRole: Address[][] = FOCUS_ROLES.map(() => []);
    const failedRoles = new Set<number>();

    for (let i = 0; i < memberCalls.length; i++) {
      const { roleIndex } = memberCalls[i];
      const memberResult = memberResults[i];
      if (memberResult.status !== "success") {
        failedRoles.add(roleIndex);
        continue;
      }
      membersByRole[roleIndex].push(memberResult.result as Address);
    }

    return Object.fromEntries(
      FOCUS_ROLES.map(([roleName], roleIndex) => {
        const countResult = counts[roleIndex];
        if (countResult.status !== "success") {
          return [roleName, countResult];
        }
        if (failedRoles.has(roleIndex)) {
          return [
            roleName,
            {
              status: "failure" as const,
              error: new Error(`Failed to fetch members for ${roleName}`),
            },
          ];
        }
        return [
          roleName,
          {
            status: "success" as const,
            result: membersByRole[roleIndex],
          },
        ];
      })
    );
  })();

  const codeHashPromise = getHashOfContractCode(address, client)
    .then((hash) => {
      return {
        status: "success",
        result: hash,
      };
    })
    .catch((error) => {
      return {
        status: "failure",
        error: error,
      };
    });

  const [
    implementation,
    [name, symbol, decimals, totalSupply],
    roles,
    contractCreationDetails,
    codeHash,
  ] = await Promise.all([
    getImplementationPromise,
    getTokenInfoPromise,
    getRolesPromise,
    contractCreationDetailsPromise,
    codeHashPromise,
  ]);

  return {
    implementation,
    name,
    symbol,
    decimals,
    totalSupply,
    ...roles,
    ...contractCreationDetails,
    codeHash,
  };
};

async function getHashOfContractCode(address: Address, client: PublicClient) {
  const code = await client.getCode({ address });
  if (!code) {
    return null;
  }
  return keccak256(code as `0x${string}`);
}

async function getContractCreationDetails(
  chain: ChainName,
  address: Address,
  client: PublicClient,
  tenderly: TenderlyClient
) {
  try {
    const contractCreation = await tenderly.getContractCreation(
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
