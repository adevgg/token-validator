function getSBTInfo(chain, tokenAddress) {
  // call api: ${API_BASE_URL}?address=${tokenAddress}&chain=${chain} return MulticallResult[]
  try {
    const url = `${API_BASE_URL}?address=${encodeURIComponent(
      tokenAddress
    )}&chain=${encodeURIComponent(chain)}&_t=${Date.now()}`;

    const response = UrlFetchApp.fetch(url, {
      method: "get",
      muteHttpExceptions: true,
    });

    const statusCode = response.getResponseCode();

    if (statusCode !== 200) {
      const errorResponse = response.getContentText();
      Logger.log(
        `[getSBTInfo] API failed: ${statusCode} for ${tokenAddress}, response: ${errorResponse}`
      );
      return null;
    }

    const responseText = response.getContentText();
    const data = JSON.parse(responseText);
    return data;
  } catch (error) {
    Logger.log(`[getSBTInfo] Error: ${error.toString()}`);
    return null;
  }
}

function writeSBTInfo(sheetName, rowIndex, tokenAddress, info) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    Logger.log(`[writeSBTInfo] Error: Sheet not found: ${sheetName}`);
    return;
  }

  // Validate token address
  const cellAddress = sheet.getRange(rowIndex, TOKEN_COLUMN_AT).getValue();
  if (cellAddress.toLowerCase() !== tokenAddress.toLowerCase()) {
    Logger.log(`[writeSBTInfo] Address mismatch: row ${rowIndex}`);
    const errorCell = sheet.getRange(rowIndex, RESULT_COLUMN_AT);
    updateCell(errorCell, "❌ token address mismatch on update", "error");
    return;
  }

  // Check if info is null or has errors
  if (!info) {
    Logger.log(`[writeSBTInfo] Error: Info is null for row ${rowIndex}`);
    const errorCell = sheet.getRange(rowIndex, RESULT_COLUMN_AT);
    updateCell(errorCell, "❌ something wrong, cannot get info", "error");
    return;
  }

  // Check for errors in info
  let hasError = false;

  for (let i = 0; i < TOKEN_INFO_COLUMNS.length; i++) {
    const field = TOKEN_INFO_COLUMNS[i];
    if (info[field] && info[field].status === "failure") {
      hasError = true;
      break;
    }
  }

  Logger.log(`[writeSBTInfo] hasError: ${hasError}`);

  // Write result
  const resultCell = sheet.getRange(rowIndex, RESULT_COLUMN_AT);
  if (hasError) {
    updateCell(resultCell, "❌ something wrong", "error");
  } else {
    updateCell(resultCell, "✅ update success", "success");
  }

  // Write each field to corresponding column
  for (let i = 0; i < TOKEN_INFO_COLUMNS.length; i++) {
    const field = TOKEN_INFO_COLUMNS[i];
    const columnIndex = TOKEN_INFO_COLUMNS_START_AT + i;
    let [value, status] = getFieldValue(info[field]);
    const cell = sheet.getRange(rowIndex, columnIndex);

    if (field === "createdAt") {
      // Use formula for createdAt field with TIMEAGO function
      if (value && value.trim() !== "") {
        const dateString = Utilities.formatDate(
          new Date(value),
          Session.getScriptTimeZone(),
          "yyyy-MM-dd HH:mm:ss"
        );
        setFormulaCell(cell, `=TIMEAGO("${dateString}")`);
      } else {
        updateCell(cell, "", status);
      }
    } else {
      updateCell(cell, value, status);
    }
  }

  // Write current time formula to UPDATED_AT_COLUMN_AT for TIMEAGO function
  const updatedAtCell = sheet.getRange(rowIndex, UPDATED_AT_COLUMN_AT);
  const currentDate = new Date();
  // Format date as YYYY-MM-DD HH:MM:SS for TIMEAGO function
  const dateString = Utilities.formatDate(
    currentDate,
    Session.getScriptTimeZone(),
    "yyyy-MM-dd HH:mm:ss"
  );
  setFormulaCell(updatedAtCell, `=TIMEAGO("${dateString}")`);
}

// Helper function to extract value from MulticallResult
function getFieldValue(result) {
  if (!result) {
    return ["", "success"];
  }

  if (result.status === "success") {
    // Handle different result types
    if (result.result !== null && result.result !== undefined) {
      let value;
      // If result is an array (like role members), join them
      if (Array.isArray(result.result)) {
        value = result.result.join(", ");
      } else {
        // If result is a big number string, return as is
        value = result.result.toString();
      }
      return [value, "success"];
    }
    return ["", "success"];
  } else if (result.status === "failure") {
    const errorMessage = "error: " + result.error.message;
    return [errorMessage, "error"];
  }

  return ["", "success"];
}

function updateSBTInfo(sheetName, rowIndex) {
  Logger.log(
    `[updateSBTInfo] Starting update for sheet: ${sheetName}, row: ${rowIndex}`
  );
  // get chain name from SHEETS[sheet] as chain
  // get token address from (rowIndex, VARIABLE_COLUMNS.token) as tokenAddress
  // get SBT info from getSBTInfo(chain, tokenAddress)
  // write SBT info to writeSBTInfo(sheet, rowIndex, tokenAddress, info)
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    Logger.log(`[updateSBTInfo] Error: Sheet not found: ${sheetName}`);
    return;
  }

  // Get chain name from SHEETS mapping
  const chain = SHEETS[sheetName];
  if (!chain) {
    Logger.log(`[updateSBTInfo] Error: Chain mapping not found: ${sheetName}`);
    return;
  }

  // Get token address
  const tokenAddress = sheet.getRange(rowIndex, TOKEN_COLUMN_AT).getValue();
  if (!tokenAddress) {
    Logger.log(`[updateSBTInfo] Error: No token address at row ${rowIndex}`);
    return;
  }

  // Clear fieldsToCheck related cells before getting SBT info
  for (let i = 0; i < TOKEN_INFO_COLUMNS.length; i++) {
    const columnIndex = TOKEN_INFO_COLUMNS_START_AT + i;
    const cell = sheet.getRange(rowIndex, columnIndex);
    updateCell(cell, "", "success");
  }

  // Set result cell to "updating"
  const resultCell = sheet.getRange(rowIndex, RESULT_COLUMN_AT);
  updateCell(resultCell, "⏳ updating", "pending");

  // Get SBT info
  const info = getSBTInfo(chain, tokenAddress);
  Logger.log(`[updateSBTInfo] SBT info: ${JSON.stringify(info)}`);

  // Write SBT info
  writeSBTInfo(sheetName, rowIndex, tokenAddress, info);
  Logger.log(
    `[updateSBTInfo] Completed update for sheet: ${sheetName}, row: ${rowIndex}`
  );
}
