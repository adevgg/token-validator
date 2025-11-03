const UPDATED_AT_COLUMN_AT = columnLetterToIndex("A");
const TOKEN_COLUMN_AT = columnLetterToIndex("B");
const RESULT_COLUMN_AT = columnLetterToIndex("C");

const TOKEN_INFO_COLUMNS_START_AT = columnLetterToIndex("D");
const TOKEN_INFO_COLUMNS = [
  "name",
  "symbol",
  "decimals",
  "totalSupply",
  "contractFactory",
  "implementation",
  "DEFAULT_ADMIN_ROLE",
  "MANAGER_ROLE",
  "MINTER_ROLE",
  "BURNER_ROLE",
  "PAUSER_ROLE",
  "SALVAGER_ROLE",
  "UPGRADER_ROLE",
  "createdAt",
  "txHash",
];

// const TOKEN_INFO_COLUMNS = Object.keys(TOKEN_VARIABLE_COLUMNS).filter(
//   (key) => key !== "token" && key !== "result"
// );

const TOKEN_ROW_INDEX_START = 17;

const EXPECTED_VALUE_COLUMN_AT = columnLetterToIndex("B");
const EXPECTED_VALUE_ROW_INDEX_START = 3;

// EXPECTED_VALUES is at (EXPECTED_VALUE_COLUMN_AT, EXPECTED_VALUE_ROW_INDEX_START + i)
const EXPECTED_VALUES = [
  {
    key: "contractFactory",
    type: "address",
  },
  {
    key: "implementation",
    type: "address",
  },
  {
    key: "DEFAULT_ADMIN_ROLE",
    type: "address",
  },
  {
    key: "MANAGER_ROLE",
    type: "address",
  },
  {
    key: "MINTER_ROLE",
    type: "address",
  },
  {
    key: "BURNER_ROLE",
    type: "address",
  },
  {
    key: "PAUSER_ROLE",
    type: "address",
  },
  {
    key: "SALVAGER_ROLE",
    type: "address",
  },
  {
    key: "UPGRADER_ROLE",
    type: "address",
  },
];

const EXPECTED_EMPTY_VALUES = [];

const SHEETS = {
  "Base Mainnet": "baseMainnet",
}; // sheet name -> chain name

const API_BASE_URL =
  "https://contract-validator-worker.compassdao.workers.dev/sbt";
