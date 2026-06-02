/**
 * Google Apps Script for Census Household Directory
 * 
 * Instructions:
 * 1. Open your Google Sheet containing the census data.
 * 2. Click on Extensions > Apps Script.
 * 3. Delete any default code and paste this entire code.js.
 * 4. Save (Ctrl+S) and click "Deploy" > "New deployment".
 * 5. Select type "Web app".
 * 6. Set "Execute as": "Me (your-email@gmail.com)".
 * 7. Set "Who has access": "Anyone".
 * 8. Deploy, authorize permissions, and copy the provided Web App URL.
 * 9. Paste this URL into the App's configuration panel.
 */

// Handle HTTP GET requests - Returns all census rows as JSON
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Sheet1") || ss.getSheets()[0];
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return getJsonResponse({ status: "success", data: [] });
    }
    
    const headers = data[0].map(h => String(h).trim());
    const records = [];
    
    // Find column indexes based on headers
    const colIdx = {
      lineNumber: headers.indexOf("लाईन क्रमांक"),
      buildingNumber: headers.indexOf("जनगणना भवन नंबर"),
      houseNumber: headers.indexOf("जनगणना मकान नम्बर"),
      residentialStatus: headers.indexOf("आवासीय/गैर-आवासीय"),
      householdUse: headers.indexOf("परिवार क्रमांक/वास्तविक उपयोग"),
      plotNumber: headers.indexOf("प्लॉट नम्बर"),
      headName: headers.indexOf("परिवार के मुखिया का नाम"),
      mobileNumber: headers.indexOf("मोबाइल नंबर"),
      selfCensusId: headers.indexOf("स्व जनगणना SE ID")
    };
    
    // Build JSON objects for each row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // Skip empty line numbers
      if (!row[colIdx.lineNumber] && row[colIdx.lineNumber] !== 0) continue;
      
      records.push({
        lineNumber: colIdx.lineNumber !== -1 ? String(row[colIdx.lineNumber]).trim() : "",
        buildingNumber: colIdx.buildingNumber !== -1 ? String(row[colIdx.buildingNumber]).trim() : "",
        houseNumber: colIdx.houseNumber !== -1 ? String(row[colIdx.houseNumber]).trim() : "",
        residentialStatus: colIdx.residentialStatus !== -1 ? String(row[colIdx.residentialStatus]).trim() : "",
        householdUse: colIdx.householdUse !== -1 ? String(row[colIdx.householdUse]).trim() : "",
        plotNumber: colIdx.plotNumber !== -1 ? String(row[colIdx.plotNumber]).trim() : "",
        headName: colIdx.headName !== -1 ? String(row[colIdx.headName]).trim() : "",
        mobileNumber: colIdx.mobileNumber !== -1 ? String(row[colIdx.mobileNumber]).trim() : "",
        selfCensusId: colIdx.selfCensusId !== -1 ? String(row[colIdx.selfCensusId]).trim() : ""
      });
    }
    
    return getJsonResponse({ status: "success", data: records });
  } catch (error) {
    return getJsonResponse({ status: "error", message: error.toString() });
  }
}

// Handle HTTP POST requests - Updates or Saves a census row
function doPost(e) {
  try {
    let payloadStr = "";
    if (e.postData && e.postData.contents) {
      payloadStr = e.postData.contents;
    } else {
      payloadStr = e.parameter.data || "{}";
    }
    
    const payload = JSON.parse(payloadStr);
    const targetLineNumber = String(payload.lineNumber).trim();
    
    if (!targetLineNumber) {
      return getJsonResponse({ status: "error", message: "Line number (लाईन क्रमांक) is required." });
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Sheet1") || ss.getSheets()[0];
    const dataRange = sheet.getDataRange();
    const data = dataRange.getValues();
    const headers = data[0].map(h => String(h).trim());
    
    // Header mappings
    const colMap = {
      "लाईन क्रमांक": "lineNumber",
      "जनगणना भवन नंबर": "buildingNumber",
      "जनगणना मकान नम्बर": "houseNumber",
      "आवासीय/गैर-आवासीय": "residentialStatus",
      "परिवार क्रमांक/वास्तविक उपयोग": "householdUse",
      "प्लॉट नम्बर": "plotNumber",
      "परिवार के मुखिया का नाम": "headName",
      "मोबाइल नंबर": "mobileNumber",
      "स्व जनगणना SE ID": "selfCensusId"
    };

    // Find physical column positions (1-based index)
    const colIndices = {};
    headers.forEach((header, index) => {
      const fieldKey = colMap[header];
      if (fieldKey) {
        colIndices[fieldKey] = index + 1;
      }
    });
    
    // Ensure core identifier column exists
    const lineColIdx = headers.indexOf("लाईन क्रमांक");
    if (lineColIdx === -1) {
      return getJsonResponse({ status: "error", message: "Column 'लाईन क्रमांक' not found in spreadsheet." });
    }
    
    let targetRowIndex = -1;
    // Find the row with matching line number
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][lineColIdx]).trim() === targetLineNumber) {
        targetRowIndex = i + 1; // 1-based index for sheets API
        break;
      }
    }
    
    let isUpdate = false;
    
    if (targetRowIndex !== -1) {
      isUpdate = true;
      // Update existing row
      // We only update the editable keys passed in payload
      const editableFields = ["headName", "mobileNumber", "selfCensusId", "residentialStatus", "householdUse", "plotNumber", "buildingNumber", "houseNumber"];
      editableFields.forEach(field => {
        if (payload[field] !== undefined && colIndices[field]) {
          sheet.getRange(targetRowIndex, colIndices[field]).setValue(payload[field]);
        }
      });
    } else {
      // Create new row (append)
      const newRow = new Array(headers.length).fill("");
      headers.forEach((header, index) => {
        const fieldKey = colMap[header];
        if (fieldKey && payload[fieldKey] !== undefined) {
          newRow[index] = payload[fieldKey];
        }
      });
      sheet.appendRow(newRow);
    }
    
    return getJsonResponse({ 
      status: "success", 
      message: isUpdate ? "आंकड़े सफलतापूर्वक अपडेट हो गए हैं।" : "आंकड़े सफलतापूर्वक सहेज लिए गए हैं।",
      isUpdate: isUpdate
    });
  } catch (error) {
    return getJsonResponse({ status: "error", message: error.toString() });
  }
}

// Utility to create properly formatted CORS JSON responses
function getJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
