// Unified function to set cell value and style based on status
function updateCell(cell, value, status) {
  cell.setValue(value);

  if (status === "success") {
    cell.setBackground("#ffffff"); // White background
    cell.setFontColor("#000000"); // Black font
  } else if (status === "pending") {
    cell.setBackground("#0000ff"); // Blue background
    cell.setFontColor("#ffffff"); // White font
  } else if (status === "warning") {
    cell.setBackground("#ffff00"); // Yellow background
    cell.setFontColor("#000000"); // Black font
  } else {
    cell.setBackground("#ff0000"); // Red background
    cell.setFontColor("#ffffff"); // White font
  }
}

/**
 * Convert column letter to column index (A=1, B=2, etc.)
 * @param {string} columnLetter - Column letter (e.g., "A", "B", "C")
 * @returns {number} Column index (1-based)
 */
function columnLetterToIndex(columnLetter) {
  return columnLetter.charCodeAt(0) - 64;
}

function isResultSuccess(sheetName, rowIndex) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(sheetName);
  const resultCell = sheet.getRange(
    rowIndex,
    columnLetterToIndex(TOKEN_VARIABLE_COLUMNS.result)
  ); // Column C (result)
  return resultCell.getValue().includes("success");
}
