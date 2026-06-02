/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CensusRecord {
  lineNumber: string;        // लाईन क्रमांक (e.g. "001")
  buildingNumber: string;    // जनगणना भवन नंबर (e.g. "1")
  houseNumber: string;       // जनगणना मकान नम्बर (e.g. "0001")
  residentialStatus: string; // आवासीय/गैर-आवासीय (e.g. "आवासीय", "गैर-आवासीय", "DELETED")
  householdUse: string;      // परिवार क्रमांक/वास्तविक उपयोग (e.g. "002", "HOTEL")
  plotNumber: string;        // प्लॉट नम्बर (e.g. "461")
  headName: string;          // परिवार के मुखिया का नाम
  mobileNumber: string;      // मोबाइल नंबर
  selfCensusId: string;      // स्व जनगणना SE ID
}

export interface AppsScriptConfig {
  webAppUrl: string;
  isConfigured: boolean;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}
