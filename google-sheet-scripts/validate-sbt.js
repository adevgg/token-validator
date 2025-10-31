function validateSBTInner(sheetName, rawIndex) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  // for each (key, value) in EXPECTED_VALUE_POSITION
  // get current value from (rawIndex, TOKEN_VARIABLE_COLUMNS[key])
  // check current value if equal to value // if type is addresses, check if lowercase(current value) array equals to lowercase(expected value), if type is address, check lowercase(current value) === lowercase(expected value)

  // {[key: EXPECTED_VALUE_POSITION[key]]: boolean}
  const results = {};

  for (const key in EXPECTED_VALUE_POSITION) {
    const expectedConfig = EXPECTED_VALUE_POSITION[key];

    // Get expected value from the configured cell
    const expectedCell = sheet.getRange(expectedConfig.cell);
    const expectedValue = expectedCell.getValue();

    // Get current value from the row's corresponding column
    const column = TOKEN_VARIABLE_COLUMNS[key];
    if (!column) {
      results[key] = false;
      continue;
    }

    const columnIndex = columnLetterToIndex(column);
    const currentCell = sheet.getRange(rawIndex, columnIndex);
    const currentValue = currentCell.getValue();

    // Compare based on type
    if (expectedConfig.type === "address") {
      // Compare single address (case-insensitive)
      const currentLower = (currentValue || "").toString().toLowerCase().trim();
      const expectedLower = (expectedValue || "")
        .toString()
        .toLowerCase()
        .trim();
      results[key] = currentLower === expectedLower;
    } else if (expectedConfig.type === "addresses") {
      // Compare arrays of addresses (case-insensitive)
      // Current value might be a comma-separated string
      const currentStr = (currentValue || "").toString();
      const expectedStr = (expectedValue || "").toString();

      // Split by comma and normalize (trim, lowercase)
      const currentArray = currentStr
        .split(",")
        .map((addr) => addr.trim().toLowerCase())
        .filter((addr) => addr.length > 0)
        .sort();

      const expectedArray = expectedStr
        .split(",")
        .map((addr) => addr.trim().toLowerCase())
        .filter((addr) => addr.length > 0)
        .sort();

      // Compare arrays
      if (currentArray.length !== expectedArray.length) {
        results[key] = false;
      } else {
        results[key] = currentArray.every(
          (addr, index) => addr === expectedArray[index]
        );
      }
    } else {
      // Default: string comparison
      results[key] =
        (currentValue || "").toString() === (expectedValue || "").toString();
    }
  }

  return results;
}

function validateSBT(sheetName, rawIndex) {
  Logger.log(
    `[validateSBT] Validating SBT for row ${rawIndex} in sheet ${sheetName}`
  );

  const result = validateSBTInner(sheetName, rawIndex);

  // if any value is false, write "warning!" to (rawIndex, TOKEN_VARIABLE_COLUMNS.result) in yellow color use updateCell function
  // for each false value, write "warning! '{current value}' is not equal to '{expected value}'" to (rawIndex, TOKEN_VARIABLE_COLUMNS[key]) in yellow color use updateCell function

  let hasWarning = false;

  // Check if any validation failed
  for (const key in result) {
    if (!result[key]) {
      hasWarning = true;
      break;
    }
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(sheetName);

  const resultColumn = TOKEN_VARIABLE_COLUMNS.result;
  const resultColumnIndex = columnLetterToIndex(resultColumn);
  const resultCell = sheet.getRange(rawIndex, resultColumnIndex);

  if (hasWarning) {
    // Write warning to result column
    updateCell(
      resultCell,
      "⚠️ warning! some values are not equal to expected values",
      "warning"
    );

    // Write warning messages to each failed field
    for (const key in result) {
      if (!result[key]) {
        const expectedConfig = EXPECTED_VALUE_POSITION[key];
        const column = TOKEN_VARIABLE_COLUMNS[key];

        if (column && expectedConfig) {
          // Get current and expected values for the warning message
          const expectedCell = sheet.getRange(expectedConfig.cell);
          const expectedValue = expectedCell.getValue();

          const columnIndex = columnLetterToIndex(column);
          const currentCell = sheet.getRange(rawIndex, columnIndex);
          const currentValue = currentCell.getValue();

          // Write warning message
          const warningMessage = `warning! '${
            currentValue || ""
          }' is not equal to '${expectedValue || ""}'`;
          updateCell(currentCell, warningMessage, "warning");
        }
      }
    }
  } else {
    // Write success message to result column
    updateCell(resultCell, "✅ validated!", "success");
  }

  Logger.log(
    `[validateSBT] Validation complete for row ${rawIndex} in sheet ${sheetName}, validated: ${!hasWarning}`
  );
}
