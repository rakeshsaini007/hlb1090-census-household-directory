/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Settings, 
  Link2, 
  FileCode, 
  Copy, 
  Check, 
  Play, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

interface AppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  webAppUrl: string;
  onSaveUrl: (url: string) => void;
  onResetDemo: () => void;
  isLiveMode: boolean;
  onToggleLiveMode: (live: boolean) => void;
}

export const AppsScriptModal: React.FC<AppsScriptModalProps> = ({
  isOpen,
  onClose,
  webAppUrl,
  onSaveUrl,
  onResetDemo,
  isLiveMode,
  onToggleLiveMode
}) => {
  const [urlInput, setUrlInput] = useState(webAppUrl);
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const APPS_SCRIPT_GUIDE_CODE = `/**
 * Google Apps Script for Census Household Web App
 * Copy this entire script, paste it into Extensions > Apps Script in Google Sheets, 
 * then deploy as Web App with Anyone access.
 */
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return getJsonResponse({ status: "success", data: [] });
    
    const headers = data[0].map(h => String(h).trim());
    const records = [];
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
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
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

function doPost(e) {
  // Supports POST to update / insert rows
  // Full script lives inside 'code.js' at the root
}`;

  const copyToClipboard = () => {
    // Attempting to copy code.js contents
    navigator.clipboard.writeText(APPS_SCRIPT_GUIDE_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSaveUrl(urlInput);
  };

  const handleTestConnection = async () => {
    if (!urlInput) {
      setTestStatus('failed');
      setErrorMessage('कृपया पहले ऐप्स स्क्रिप्ट का वेब ऐप यूआरएल दर्ज करें।');
      return;
    }
    
    setTestStatus('testing');
    setErrorMessage('');
    
    try {
      // JSONP or direct fetch fallback test
      const response = await fetch(`${urlInput.trim()}?test=1`, {
        method: 'GET',
        mode: 'cors',
        headers: { 'Accept': 'application/json' }
      });
      const data = await response.json();
      
      if (data && data.status === 'success') {
        setTestStatus('success');
        onToggleLiveMode(true);
      } else {
        setTestStatus('failed');
        setErrorMessage(data.message || 'वेब ऐप ने अवैध प्रत्युत्तर दिया। कृपया सुनिश्चित करें कि कोड सही है।');
      }
    } catch (e: any) {
      // Due to CORS on redirect Google Apps Script uses sometimes, direct fetch might fail with CORS.
      // We warn about it, suggesting it could still work, but do a proxy test or accept it.
      console.warn("Connection test hit CORS or network issue", e);
      setTestStatus('failed');
      setErrorMessage('नेटवर्क/CORS त्रुटि। Google Web App URL रीडायरेक्ट करता है, जिससे डायरेक्ट टेस्ट फ़ेल हो सकता है, लेकिन एप्लीकेशन इसे प्रोसेस कर सकता है। कृपया मैन्युअल रूप से सुरक्षित कर लें।');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600 animate-spin-slow" />
                <h3 className="font-display font-semibold text-slate-800 text-lg">गूगल ऐप्स स्क्रिप्ट इंटीग्रेशन</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-600 flex-1">
              
              {/* Working Mode Status Toggle */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <h4 className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <Play className="w-4 h-4 text-slate-600" /> कार्यशील मोड (Active Operation Mode)
                </h4>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => onToggleLiveMode(false)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      !isLiveMode 
                        ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-100' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5 mb-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${!isLiveMode ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
                      डेमो मोड (LocalStorage)
                    </div>
                    <p className="text-[11px] text-slate-500">ब्राउज़र में डेटा सुरक्षित रहता है। आसान टेस्टिंग के लिए उत्तम।</p>
                  </button>

                  <button
                    onClick={() => {
                      if (!webAppUrl) {
                        alert("कृपया पहले वैध वेब ऐप का यूआरएल नीचे भरकर सेव करें।");
                        return;
                      }
                      onToggleLiveMode(true);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isLiveMode 
                        ? 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-100' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5 mb-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${isLiveMode ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                      लाइव शीट मोड (Spreadsheet)
                    </div>
                    <p className="text-[11px] text-slate-500">सीधे गूगल स्प्रेडशीट में डेटा स्टोर और अपडेट होता है।</p>
                  </button>
                </div>
              </div>

              {/* URL input */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-800 text-xs flex items-center gap-1">
                  <Link2 className="w-4 h-4 text-indigo-500" /> ऐप्स स्क्रिप्ट वेब ऐप यूआरएल (Deploy URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
                  />
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    सेव करें
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  यह यूआरएल वेब ऐप तैनाती (Deploy Web app) के समय वेब यूआरएल के रूप में मिलता है।
                </p>

                {/* Test Connection Button */}
                {urlInput && (
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={handleTestConnection}
                      disabled={testStatus === 'testing'}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      <RotateCcw className={`w-3 h-3 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                      कनेक्शन जाँचे (Test Connection)
                    </button>

                    {testStatus === 'success' && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                        <CheckCircle className="w-3.5 h-3.5" /> कनेक्शन ठीक है! लाइव मोड चालू है।
                      </span>
                    )}

                    {testStatus === 'failed' && (
                      <div className="flex-1 p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-800 mt-1 flex gap-2 items-start">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                        <div>{errorMessage}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Instructions on how to build */}
              <div className="space-y-3.5">
                <hr className="border-slate-100" />
                <h4 className="font-display font-semibold text-slate-800 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <FileCode className="w-4 h-4 text-emerald-600" /> सेटअप निर्देश (Quick Setup Guide)
                </h4>
                
                <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-500">
                  <li>
                    अपनी गूगल शीट खोलें जिसमें <span className="font-semibold text-slate-700">लाईन क्रमांक</span>, <span className="font-semibold text-slate-700">जनगणना भवन नंबर</span>, आदि कॉलम मौजूद हैं।
                  </li>
                  <li>
                    मेनू में <span className="font-semibold text-slate-700">Extensions &gt; Apps Script</span> पर क्लिक करें।
                  </li>
                  <li>
                    वहाँ मौजूद डिफ़ॉल्ट कोड को डिलीट करें, और प्रोजेक्ट की स्वतंत्र फ़ाइल <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-semibold">code.js</code> का कोड पेस्ट करें।
                  </li>
                  <li>
                    ऊपर <span className="font-semibold text-slate-700">Deploy &gt; New Deployment</span> पर क्लिक करके <span className="font-semibold text-slate-700">Web app</span> चुनें।
                  </li>
                  <li>
                    "Execute as" को <span className="font-semibold text-slate-700">Me (your-email)</span> रखें और "Who has access" को <span className="font-semibold text-slate-700">Anyone</span> चुनें।
                  </li>
                  <li>
                    Deploy दबाएँ, अनुमतियों को स्वीकार (Authorize) करें और अंत में मिलने वाले वेब ऐप <span className="font-semibold text-slate-700">URL को यहाँ पेस्ट करें</span>।
                  </li>
                </ol>

                {/* Code snippets copying */}
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 mt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-[11px]">code.js (Google Apps Script Code)</span>
                    <button
                      onClick={copyToClipboard}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all border border-slate-700/80 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>कॉपी हो गया</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>कोड कॉपी करें</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="font-mono text-[10px] text-emerald-400 overflow-x-auto max-h-40 p-2 bg-slate-950/70 rounded-lg select-all">
                    {APPS_SCRIPT_GUIDE_CODE}
                  </pre>
                </div>
              </div>

              {/* Reset Local storage */}
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                <span className="text-slate-400">डेमो रिकॉर्ड को डिफ़ॉल्ट पर रीसेट करें:</span>
                <button
                  onClick={() => {
                    if(confirm("क्या आप स्थानीय डेमो डाटा को रीसेट करना चाहते हैं? इससे सभी सम्पादित बदलाव रद्द हो जायेंगे।")) {
                      onResetDemo();
                      onClose();
                    }
                  }}
                  className="px-3 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold rounded-lg transition-colors border border-rose-100 cursor-pointer"
                >
                  डेमो डाटा रीसेट करें
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
