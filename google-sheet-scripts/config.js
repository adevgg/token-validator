const TOKEN_VARIABLE_COLUMNS = {
  token: "B",
  result: "C",
  name: "D",
  symbol: "E",
  decimals: "F",
  totalSupply: "G",
  contractFactory: "H",
  implementation: "I",
  DEFAULT_ADMIN_ROLE: "J",
  MANAGER_ROLE: "K",
  MINTER_ROLE: "L",
  BURNER_ROLE: "M",
  PAUSER_ROLE: "N",
  SALVAGER_ROLE: "O",
  UPGRADER_ROLE: "P",
  createdAt: "Q",
  txHash: "R",
}; // column name -> column index

const TOKEN_INFO_COLUMNS = Object.keys(TOKEN_VARIABLE_COLUMNS).filter(
  (key) => key !== "token" && key !== "result"
);

const TOKEN_ROW_INDEX_START = 14;

const EXPECTED_VALUE_POSITION = {
  contractFactory: {
    cell: "C3",
    type: "address",
  },
  implementation: {
    cell: "C4",
    type: "address",
  },
  DEFAULT_ADMIN_ROLE: {
    cell: "C5",
    type: "addresses",
  },
  MANAGER_ROLE: {
    cell: "C6",
    type: "addresses",
  },
  MINTER_ROLE: {
    cell: "C7",
    type: "addresses",
  },
};

const SHEETS = {
  "Base Mainnet": "baseMainnet",
}; // sheet name -> chain name

const API_BASE_URL =
  "https://contract-validator-worker.compassdao.workers.dev/sbt";
