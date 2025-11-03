// Helper function to get column index for a field name
function getFieldColumnIndex(fieldName) {
  const fieldIndex = TOKEN_INFO_COLUMNS.indexOf(fieldName);
  if (fieldIndex === -1) {
    return null;
  }
  return TOKEN_INFO_COLUMNS_START_AT + fieldIndex;
}

function validateSBTInner(sheetName, rawIndex) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  // Validate fields in EXPECTED_VALUES and EXPECTED_EMPTY_VALUES
  // For EXPECTED_VALUES: get expected value from (EXPECTED_VALUE_COLUMN_AT, EXPECTED_VALUE_ROW_INDEX_START + i)
  // get current value from (rawIndex, getFieldColumnIndex(key))
  // check current value if equal to expected value
  // For EXPECTED_EMPTY_VALUES: check if current value is empty

  const results = {};

  // Validate EXPECTED_VALUES
  for (let i = 0; i < EXPECTED_VALUES.length; i++) {
    const expectedConfig = EXPECTED_VALUES[i];
    const key = expectedConfig.key;

    // Get expected value from the configured cell
    const expectedRowIndex = EXPECTED_VALUE_ROW_INDEX_START + i;
    const expectedCell = sheet.getRange(expectedRowIndex, EXPECTED_VALUE_COLUMN_AT);
    const expectedValue = expectedCell.getValue();

    // Get current value from the row's corresponding column
    const columnIndex = getFieldColumnIndex(key);
    if (columnIndex === null) {
      results[key] = false;
      continue;
    }

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

  // Validate EXPECTED_EMPTY_VALUES
  for (let i = 0; i < EXPECTED_EMPTY_VALUES.length; i++) {
    const key = EXPECTED_EMPTY_VALUES[i];
    const columnIndex = getFieldColumnIndex(key);
    if (columnIndex === null) {
      results[key] = false;
      continue;
    }

    const currentCell = sheet.getRange(rawIndex, columnIndex);
    const currentValue = currentCell.getValue();
    // Check if value is empty
    results[key] = !currentValue || currentValue.toString().trim() === "";
  }

  return results;
}

function validateSBT(sheetName, rawIndex) {
  Logger.log(
    `[validateSBT] Validating SBT for row ${rawIndex} in sheet ${sheetName}`
  );

  const result = validateSBTInner(sheetName, rawIndex);

  // if any value is false, write "warning!" to (rawIndex, RESULT_COLUMN_AT) in yellow color use updateCell function
  // for each false value, write "warning! '{current value}' is not equal to '{expected value}'" to (rawIndex, getFieldColumnIndex(key)) in yellow color use updateCell function

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

  const resultCell = sheet.getRange(rawIndex, RESULT_COLUMN_AT);

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
        const columnIndex = getFieldColumnIndex(key);
        if (columnIndex === null) {
          continue;
        }

        const currentCell = sheet.getRange(rawIndex, columnIndex);
        const currentValue = currentCell.getValue();

        // Check if this field is in EXPECTED_VALUES or EXPECTED_EMPTY_VALUES
        const expectedConfig = EXPECTED_VALUES.find((item) => item.key === key);
        let warningMessage;

        if (expectedConfig) {
          // Get expected value for the warning message
          const expectedIndex = EXPECTED_VALUES.findIndex(
            (item) => item.key === key
          );
          const expectedRowIndex = EXPECTED_VALUE_ROW_INDEX_START + expectedIndex;
          const expectedCell = sheet.getRange(
            expectedRowIndex,
            EXPECTED_VALUE_COLUMN_AT
          );
          const expectedValue = expectedCell.getValue();

          warningMessage = `warning! '${
            currentValue || ""
          }' is not equal to '${expectedValue || ""}'`;
        } else if (EXPECTED_EMPTY_VALUES.includes(key)) {
          // Field should be empty
          warningMessage = `warning! '${
            currentValue || ""
          }' should be empty`;
        } else {
          warningMessage = `warning! validation failed for '${key}'`;
        }

        updateCell(currentCell, warningMessage, "warning");
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
