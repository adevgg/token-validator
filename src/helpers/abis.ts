import { parseAbi } from "viem";

export const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
export const BURNER_ROLE =
  "0x3c11d16cbaffd01df69ce1c404f6340ee057498f5f00246190ea54220576a848";
export const MANAGER_ROLE =
  "0x241ecf16d79d0f8dbfb92cbc07fe17840425976cf0667f022fe9877caa831b08";
export const MINTER_ROLE =
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

export const PAUSER_ROLE =
  "0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a";
export const SALVAGER_ROLE =
  "0x9e16e6c596d2cf298b0b08786bf3a653eb1a9f723a5a76b814e3fbaa4f944609";
export const UPGRADER_ROLE =
  "0x189ab7a9244df0848122154315af71fe140f3db0fe014031783b0946b8c9d2e3";

export const GeneralAbi = parseAbi([
  "function getRoleMembers(bytes32 role) view returns (address[])",
]);
