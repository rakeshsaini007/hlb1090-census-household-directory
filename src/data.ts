/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CensusRecord } from './types';

export const INITIAL_CENSUS_DATA: CensusRecord[] = [
  {
    lineNumber: "001",
    buildingNumber: "1",
    houseNumber: "0001",
    residentialStatus: "DELETED",
    householdUse: "",
    plotNumber: "461",
    headName: "",
    mobileNumber: "",
    selfCensusId: ""
  },
  {
    lineNumber: "002",
    buildingNumber: "1",
    houseNumber: "0001",
    residentialStatus: "गैर-आवासीय",
    householdUse: "HOTEL",
    plotNumber: "461",
    headName: "BHARAT GANDHI",
    mobileNumber: "9990764443",
    selfCensusId: ""
  },
  {
    lineNumber: "003",
    buildingNumber: "2",
    houseNumber: "0002",
    residentialStatus: "गैर-आवासीय",
    householdUse: "BALAJI P G BOYS",
    plotNumber: "460",
    headName: "RAHUL VARANWAL",
    mobileNumber: "8010473532",
    selfCensusId: ""
  },
  {
    lineNumber: "004",
    buildingNumber: "2",
    houseNumber: "0003",
    residentialStatus: "गैर-आवासीय",
    householdUse: "KADAMBARI SANGEET MAHAVIDYALAY",
    plotNumber: "460",
    headName: "DEEPAK SHARMA",
    mobileNumber: "9560393095",
    selfCensusId: ""
  },
  {
    lineNumber: "005",
    buildingNumber: "3",
    houseNumber: "0004",
    residentialStatus: "गैर-आवासीय",
    householdUse: "MILLION MINDS",
    plotNumber: "459",
    headName: "AMIT SHANKHDHAR",
    mobileNumber: "",
    selfCensusId: ""
  },
  {
    lineNumber: "006",
    buildingNumber: "3",
    houseNumber: "0005",
    residentialStatus: "आवासीय",
    householdUse: "002",
    plotNumber: "459",
    headName: "SHASHIBALA",
    mobileNumber: "9013007304",
    selfCensusId: ""
  },
  {
    lineNumber: "007",
    buildingNumber: "3",
    houseNumber: "0006",
    residentialStatus: "आवासीय",
    householdUse: "003",
    plotNumber: "459",
    headName: "SUNIL KUMAR",
    mobileNumber: "9717640497",
    selfCensusId: ""
  },
  {
    lineNumber: "008",
    buildingNumber: "3",
    houseNumber: "0007",
    residentialStatus: "आवासीय",
    householdUse: "004",
    plotNumber: "459",
    headName: "SHISHIR UNIYAL",
    mobileNumber: "9212258847",
    selfCensusId: ""
  },
  {
    lineNumber: "009",
    buildingNumber: "4",
    houseNumber: "0008",
    residentialStatus: "गैर-आवासीय",
    householdUse: "HOUSE KEEPING",
    plotNumber: "458",
    headName: "ATULESH KUMAR",
    mobileNumber: "9910377347",
    selfCensusId: ""
  },
  {
    lineNumber: "010",
    buildingNumber: "4",
    houseNumber: "0009",
    residentialStatus: "गैर-आवासीय",
    householdUse: "EXIDE SHOP",
    plotNumber: "458",
    headName: "SANNI MALHOTRA",
    mobileNumber: "9990712413",
    selfCensusId: ""
  },
  {
    lineNumber: "011",
    buildingNumber: "4",
    houseNumber: "0010",
    residentialStatus: "गैर-आवासीय",
    householdUse: "SWAP POINT",
    plotNumber: "458",
    headName: "",
    mobileNumber: "",
    selfCensusId: ""
  }
];

const LOCAL_STORAGE_KEY = 'census_records_data';

export function getLocalRecords(): CensusRecord[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_CENSUS_DATA));
    return INITIAL_CENSUS_DATA;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_CENSUS_DATA;
  }
}

export function saveLocalRecord(updatedRecord: CensusRecord): CensusRecord[] {
  const current = getLocalRecords();
  const index = current.findIndex(r => r.lineNumber === updatedRecord.lineNumber);
  
  if (index !== -1) {
    current[index] = { ...current[index], ...updatedRecord };
  } else {
    current.push(updatedRecord);
  }
  
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  return current;
}

export function resetLocalRecords(): CensusRecord[] {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_CENSUS_DATA));
  return INITIAL_CENSUS_DATA;
}
