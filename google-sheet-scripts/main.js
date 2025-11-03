/**
 * @OnlyCurrentDoc
 * This script only accesses the current spreadsheet it is bound to.
 * It does not need access to all spreadsheets.
 */
function runValidateAndUpdateSBT(sheetName, rowIndex) {
  Logger.log(
    `[runValidateAndUpdateSBT] Starting validate and update for sheet ${sheetName}, row ${rowIndex}`
  );

  updateSBTInfo(sheetName, rowIndex);
  const isSuccess = isResultSuccess(sheetName, rowIndex);
  if (!isSuccess) {
    Logger.log(
      `[runValidateAndUpdateSBT] SBT is not valid at row ${rowIndex} in sheet ${sheetName}, skip validate`
    );
    return;
  }

  validateSBT(sheetName, rowIndex);
  Logger.log(
    `[runValidateAndUpdateSBT] Completed validate and update for sheet ${sheetName}, row ${rowIndex}`
  );
}

function handleValidateClick() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getActiveRange();

  if (!range) {
    throw new Error("No selection");
  }

  const sheetName = sheet.getName();
  const tokenColumnIndex = TOKEN_COLUMN_AT;

  // Get the range dimensions
  const startRow = range.getRow();
  const startColumn = range.getColumn();
  const numRows = range.getNumRows();
  const numColumns = range.getNumColumns();

  // Iterate through all selected cells
  for (let rowOffset = 0; rowOffset < numRows; rowOffset++) {
    for (let colOffset = 0; colOffset < numColumns; colOffset++) {
      const rowIndex = startRow + rowOffset;
      const columnIndex = startColumn + colOffset;

      // Check if the cell is in the token column (B) and row index >= TOKEN_ROW_INDEX_START
      if (
        columnIndex === tokenColumnIndex &&
        rowIndex >= TOKEN_ROW_INDEX_START
      ) {
        runValidateAndUpdateSBT(sheetName, rowIndex);
      }
    }
  }
}
