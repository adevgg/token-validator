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
  const resultCell = sheet.getRange(rowIndex, RESULT_COLUMN_AT);
  return resultCell.getValue().includes("success");
}

// Unified function to set cell formula and style (success style only)
function setFormulaCell(cell, formula) {
  cell.setFormula(formula);
  cell.setBackground("#ffffff"); // White background
  cell.setFontColor("#000000"); // Black font
}

/**
 * Extract Ethereum addresses from a text description
 * Ethereum addresses are in the format: 0x followed by 40 hexadecimal characters
 * @param {string} text - The text description to extract addresses from
 * @returns {string[]} Array of unique Ethereum addresses found (empty array if none found)
 */
function extractEthereumAddresses(text) {
  if (!text || typeof text !== "string") {
    return [];
  }

  // Ethereum address pattern: 0x followed by exactly 40 hexadecimal characters
  // Match case-insensitive to catch variations
  const addressPattern = /0x[a-fA-F0-9]{40}/g;

  // Find all matches
  const matches = text.match(addressPattern);

  if (!matches) {
    return [];
  }

  // Convert to lowercase and remove duplicates
  const uniqueAddresses = [];
  const seen = new Set();

  for (const address of matches) {
    const lowerAddress = address.toLowerCase();
    if (!seen.has(lowerAddress)) {
      seen.add(lowerAddress);
      uniqueAddresses.push(lowerAddress);
    }
  }

  return uniqueAddresses;
}

/**
 * Extract codeHash from a text description
 * codeHash is in the format: 0x followed by 64 hexadecimal characters (32 bytes)
 * @param {string} text - The text description to extract codeHash from
 * @returns {string} The first codeHash found (empty string if none found)
 */
function extractCodeHash(text) {
  if (!text || typeof text !== "string") {
    return "";
  }

  // codeHash pattern: 0x followed by exactly 64 hexadecimal characters (32 bytes)
  // Match case-insensitive to catch variations
  const codeHashPattern = /0x[a-fA-F0-9]{64}/;

  // Find first match
  const match = text.match(codeHashPattern);

  if (!match) {
    return "";
  }

  // Return lowercase version
  return match[0].toLowerCase();
}
