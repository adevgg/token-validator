import { Address, erc20Abi, isAddress, PublicClient } from "viem";
import { getClient } from "./clients";
import {
  BURNER_ROLE,
  DEFAULT_ADMIN_ROLE,
  GeneralAbi,
  MANAGER_ROLE,
  MINTER_ROLE,
  PAUSER_ROLE,
  SALVAGER_ROLE,
  UPGRADER_ROLE,
} from "./helpers/abis";
import { getEIP1967ImplicitAddress } from "./helpers/eip1967";
import { createErrorResponse, createSuccessResponse } from "./utils";

export async function handleGetSBTInformation(
  request: Request,
  env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const address = url.searchParams.get("address");
  const chain = url.searchParams.get("chain");
  const client = getClient(chain as string, {
    infuraApiKey: env.INFURA_API_KEY,
  });

  if (!address || !chain || !isAddress(address) || !client) {
    return createErrorResponse(
      "INVALID_REQUEST",
      "Invalid address or chain",
      400
    );
  }

  const info = await getSBTInformation(address as Address, client);
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
  address: Address,
  client: PublicClient
) => {
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

  const [implementation, [name, symbol, decimals, totalSupply], roles] =
    await Promise.all([
      getImplementationPromise,
      getTokenInfoPromise,
      getRolesPromise,
    ]);

  return {
    implementation,
    name,
    symbol,
    decimals,
    totalSupply,
    ...roles,
  };
};
