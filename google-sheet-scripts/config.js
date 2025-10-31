const TOKEN_VARIABLE_COLUMNS = {
  token: "B",
  result: "C",
  name: "D",
  symbol: "E",
  decimals: "F",
  totalSupply: "G",
  implementation: "H",
  DEFAULT_ADMIN_ROLE: "I",
  MANAGER_ROLE: "J",
  MINTER_ROLE: "K",
  BURNER_ROLE: "L",
  PAUSER_ROLE: "M",
  SALVAGER_ROLE: "N",
  UPGRADER_ROLE: "O",
}; // column name -> column index

const TOKEN_ROW_INDEX_START = 14;

const EXPECTED_VALUE_POSITION = {
  implementation: {
    cell: "C3",
    type: "address",
  },
  DEFAULT_ADMIN_ROLE: {
    cell: "C4",
    type: "addresses",
  },
  MANAGER_ROLE: {
    cell: "C5",
    type: "addresses",
  },
  MINTER_ROLE: {
    cell: "C6",
    type: "addresses",
  },
};

const SHEETS = {
  "Base Mainnet": "baseMainnet",
}; // sheet name -> chain name

const API_BASE_URL =
  "https://contract-validator-worker.compassdao.workers.dev/sbt";
