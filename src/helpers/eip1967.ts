import { Address, isAddress, PublicClient, zeroAddress } from "viem";
import { MulticallResult } from "../utils";

// keccak256("eip1967.proxy.implementation")) - 1
const EIP1967_IMPLICIT_ADDRESS_SLOT =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

export async function getEIP1967ImplicitAddress(
  client: PublicClient,
  address: Address
): Promise<MulticallResult> {
  const storage = await client.getStorageAt({
    address,
    slot: EIP1967_IMPLICIT_ADDRESS_SLOT,
  });

  if (!storage || storage === "0x" || storage === "0x0") {
    return {
      status: "failure",
      error: new Error("No implementation address found at EIP1967 slot"),
    };
  }

  const implementationAddress = "0x" + storage.slice(-40);

  if (
    !isAddress(implementationAddress) ||
    implementationAddress === zeroAddress
  ) {
    return {
      status: "failure",
      error: new Error(
        `Invalid implementation address found at EIP1967 slot: ${implementationAddress}`
      ),
    };
  }

  return {
    status: "success",
    result: implementationAddress,
  };
}
