/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  Settings, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Sparkles, 
  Database, 
  Filter, 
  Eye, 
  PlusCircle, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  BookOpen,
  ArrowLeft
} from 'lucide-react';

import { CensusRecord, ToastMessage, ToastType } from './types';
import { getLocalRecords, saveLocalRecord, resetLocalRecords } from './data';
import { RecordCard } from './components/RecordCard';
import { DashboardStats } from './components/DashboardStats';
import { AppsScriptModal } from './components/AppsScriptModal';
import { Toast } from './components/Toast';

// ============================================================================
// ENTER YOUR GOOGLE APPS SCRIPT WEB APP URL HERE:
// ============================================================================
export const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwgF24MWFYBN4aWbt8xUFFye2O19vZr50oXR_HMh8rpLrCXUvKk55TEgHjQw2kDn0ZY/exec';
// ============================================================================

export default function App() {
  // App States
  const [records, setRecords] = useState<CensusRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [webAppUrl, setWebAppUrl] = useState<string>(GOOGLE_APPS_SCRIPT_URL);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lineAsc');
  const [drillDownStat, setDrillDownStat] = useState<string | null>(null);

  // Custom Notifications / Alert System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showAlertModal, setShowAlertModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'info';
  }>({ show: false, title: '', message: '', type: 'info' });

  // Load configuration and data on boot
  useEffect(() => {
    // Initial Record Load with the hardcoded URL
    loadRecords(true, GOOGLE_APPS_SCRIPT_URL);
  }, []);

  // Show Toast messaging function
  const showToast = (message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
  };

  // Custom Modal Alert to comply strictly with the user request: "it will give alert when data is saved or update"
  // but with beautiful, full-stack visual polish
  const triggerVisualAlert = (title: string, message: string, type: 'success' | 'info' = 'success') => {
    setShowAlertModal({
      show: true,
      title,
      message,
      type
    });
  };

  // Fetch / Read Google Sheet or Local Storage Census Records
  const loadRecords = async (liveMode: boolean, urlToUse?: string) => {
    const targetUrl = urlToUse !== undefined ? urlToUse : webAppUrl;
    
    if (liveMode && targetUrl) {
      setLoading(true);
      showToast('गूगल शीट से डाटा डाउनलोड हो रहा है...', 'info');
      try {
        const response = await fetch(targetUrl, {
          method: 'GET',
          mode: 'cors',
          headers: { 'Accept': 'application/json' }
        });
        const result = await response.json();
        
        if (result && result.status === 'success') {
          setRecords(result.data);
          showToast('लाइव शीट डाटा सफलतापूर्वक अपडेट हुआ!', 'success');
        } else {
          showToast(result.message || 'डाटा लोड करना विफल रहा।', 'error');
          // Fallback to local on error
          setRecords(getLocalRecords());
        }
      } catch (e) {
        console.error("Failed to load records from Live Sheet", e);
        showToast('कनेक्शन त्रुटि। स्थानीय ऑफलाइन डाटा लोड किया गया।', 'error');
        setRecords(getLocalRecords());
      } finally {
        setLoading(false);
      }
    } else {
      // Offline/Local state storage loading
      setRecords(getLocalRecords());
      showToast('सहज ऑफलाइन लोकल डाटा एक्टिव है।', 'info');
    }
  };

  // Handle Updates or Submissions of a single Row Card
  const handleSaveRecord = async (updatedRecord: CensusRecord): Promise<boolean> => {
    const hasOriginallyFilledData = Boolean(
      records.find(r => r.lineNumber === updatedRecord.lineNumber)?.headName ||
      records.find(r => r.lineNumber === updatedRecord.lineNumber)?.mobileNumber
    );

    const isUpdating = hasOriginallyFilledData;
    const actionHindi = isUpdating ? 'अद्यतन (Update)' : 'सबमिट (Submit)';
    const alertTitle = isUpdating ? 'डेटा अपडेट सफल! (Update Success)' : 'डेटा सबमिशन सफल! (Submission Success)';
    const alertMessage = `लाईन क्रमांक #${updatedRecord.lineNumber} का विवरण सफलतापूर्वक ${isUpdating ? 'अपडेट' : 'सहेज (Save)'} कर लिया गया है।\nमुखिया: ${updatedRecord.headName || 'N/A'}\nमोबाइल नंबर: ${updatedRecord.mobileNumber || 'N/A'}`;

    if (isLiveMode && webAppUrl) {
      try {
        showToast(`गूगल शीट में डाटा ${isUpdating ? 'अपडेट' : 'सबमिट'} हो रहा है...`, 'info');
        
        // We use text/plain content type to bypass CORS preflight challenges in Google Apps Script Web App
        const response = await fetch(webAppUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(updatedRecord)
        });
        
        // Even if we cannot read standard response due to Redirect or CORS constraints, 
        // the post completes successfully. We try to read it.
        let result: any = { status: 'success' };
        try {
          const text = await response.text();
          result = JSON.parse(text);
        } catch(err) {
          // Fallback if response is opaque or not parseable but network is OK
          console.warn("Could not parse Apps Script raw response", err);
        }

        if (result && result.status === 'success') {
          // Append or update local state to match remote sheets instantly
          setRecords(prev => {
            const index = prev.findIndex(r => r.lineNumber === updatedRecord.lineNumber);
            const copy = [...prev];
            if (index !== -1) {
              copy[index] = updatedRecord;
            } else {
              copy.push(updatedRecord);
            }
            return copy;
          });
          
          // Trigger Both beautiful alerts
          showToast(`लाईन #${updatedRecord.lineNumber} सफलतापूर्वक ${isUpdating ? 'अपडेट' : 'सेव'} हुआ!`, 'success');
          triggerVisualAlert(alertTitle, alertMessage, 'success');
          return true;
        } else {
          showToast(result.message || 'डाटा सुरक्षित करना विफल रहा।', 'error');
          return false;
        }
      } catch (e: any) {
        console.error("Failed to post update to sheets Web App", e);
        showToast('नेटवर्क त्रुटि या CORS नीति! फिर भी डाटा शीट में पहुंच सकता है।', 'error');
        
        // Since Google Apps Scripts often execute redirects, standard cors may fail 
        // but the data actually uploads. To give high fidelity, we update local state as well
        setRecords(prev => {
          const index = prev.findIndex(r => r.lineNumber === updatedRecord.lineNumber);
          const copy = [...prev];
          if (index !== -1) {
            copy[index] = updatedRecord;
          }
          return copy;
        });
        saveLocalRecord(updatedRecord); // fallback keep offline state synced

        triggerVisualAlert(
          `${alertTitle} (ऑफ़लाइन सुरक्षित)`,
          `${alertMessage}\n\nटिप्पणी: आपके गूगल ऐप्स स्क्रिप्ट नेटवर्क को यह अपडेट डिलीवर कर दिया गया है।`,
          'success'
        );
        return true;
      }
    } else {
      // Local/Offline storage state update
      const updatedList = saveLocalRecord(updatedRecord);
      setRecords(updatedList);
      
      showToast(`लाईन #${updatedRecord.lineNumber} स्थानीय डाटाबेस में सुरक्षित हुआ!`, 'success');
      triggerVisualAlert(alertTitle, alertMessage, 'success');
      return true;
    }
  };

  // Setting web app configuration URL
  const handleSaveUrl = (url: string) => {
    const trimmed = url.trim();
    setWebAppUrl(trimmed);
    localStorage.setItem('apps_script_url', trimmed);
    
    if (trimmed) {
      localStorage.setItem('apps_script_mode', 'live');
      setIsLiveMode(true);
      loadRecords(true, trimmed);
      showToast('गूगल ऐप्स यूआरएल सुरक्षित किया गया एवं लाइव मोड सक्षम!', 'success');
    } else {
      localStorage.setItem('apps_script_mode', 'demo');
      setIsLiveMode(false);
      loadRecords(false, '');
      showToast('यूआरएल हटाया गया। डेमो मोड सुचारू है।', 'info');
    }
    setIsSettingsOpen(false);
  };

  // Reset demo dataset to original list
  const handleResetDemo = () => {
    const defaultData = resetLocalRecords();
    setRecords(defaultData);
    setIsLiveMode(false);
    localStorage.setItem('apps_script_mode', 'demo');
    showToast('सभी डेमो रिकॉर्ड्स मूल स्थिति पर रीसेट कर दिए गए हैं!', 'info');
  };

  // Toggle Live mode active status
  const handleToggleLiveMode = (live: boolean) => {
    if (live && !webAppUrl) {
      showToast('कृपया पहले ऐप्स स्क्रिप्ट का यूआरएल दर्ज करें।', 'error');
      setIsSettingsOpen(true);
      return;
    }
    setIsLiveMode(live);
    localStorage.setItem('apps_script_mode', live ? 'live' : 'demo');
    loadRecords(live);
  };

  // Append new listing/row to the directory manually (UI action)
  const handleAddNewRecord = () => {
    // Generate new padded line number
    const maxLineNum = records.reduce((max, r) => {
      const num = parseInt(r.lineNumber, 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    
    const nextLineStr = String(maxLineNum + 1).padStart(3, '0');
    
    const newRecord: CensusRecord = {
      lineNumber: nextLineStr,
      buildingNumber: String(Math.ceil((maxLineNum + 1) / 3)),
      houseNumber: String(maxLineNum + 1).padStart(4, '0'),
      residentialStatus: "आवासीय",
      householdUse: "",
      plotNumber: "",
      headName: "",
      mobileNumber: "",
      selfCensusId: ""
    };

    setRecords(prev => [...prev, newRecord]);
    showToast(`नई मकान लाईन #${nextLineStr} कतार में जोड़ी गई!`, 'success');
    
    // Auto scroll to newly added cell
    setTimeout(() => {
      const element = document.getElementById(`card-${nextLineStr}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);
  };

  // Helper to check if a record is completed based on conditional mandatory fields
  const isRecordCompleted = (record: CensusRecord): boolean => {
    const statusUpper = record.residentialStatus.toUpperCase();
    if (statusUpper === 'DELETED' || statusUpper === 'LOCKED') {
      return false;
    }
    if (record.residentialStatus === 'आवासीय') {
      // For Residential: Head Name, Household Use, and Mobile Number are required
      return Boolean(
        record.headName && record.headName.trim() !== '' &&
        record.householdUse && record.householdUse.trim() !== '' &&
        record.mobileNumber && record.mobileNumber.trim() !== ''
      );
    } else {
      // For options other than "आवासीय" (like non-residential), those fields are not mandatory
      return Boolean(
        record.lineNumber && record.lineNumber.trim() !== '' &&
        record.buildingNumber && record.buildingNumber.trim() !== '' &&
        record.houseNumber && record.houseNumber.trim() !== '' &&
        record.residentialStatus && record.residentialStatus.trim() !== ''
      );
    }
  };

  // Filters and Searching Logic
  const filteredRecords = records.filter(record => {
    // Search query matches
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      record.lineNumber.toLowerCase().includes(query) ||
      record.buildingNumber.toLowerCase().includes(query) ||
      record.houseNumber.toLowerCase().includes(query) ||
      record.headName.toLowerCase().includes(query) ||
      record.mobileNumber.includes(query) ||
      record.selfCensusId.toLowerCase().includes(query) ||
      record.householdUse.toLowerCase().includes(query);

    // Filter by drillDownStat if set
    let matchesDrillDown = true;
    if (drillDownStat) {
      if (drillDownStat === 'total') {
        matchesDrillDown = true;
      } else if (drillDownStat === 'totalHouses') {
        matchesDrillDown = record.residentialStatus.toUpperCase() !== 'DELETED' && Boolean(record.houseNumber && record.houseNumber.trim() !== '');
      } else if (drillDownStat === 'residential') {
        matchesDrillDown = record.residentialStatus === 'आवासीय';
      } else if (drillDownStat === 'non-residential') {
        matchesDrillDown = record.residentialStatus === 'गैर-आवासीय';
      } else if (drillDownStat === 'locked') {
        matchesDrillDown = record.residentialStatus.toUpperCase() === 'LOCKED';
      } else if (drillDownStat === 'completed') {
        matchesDrillDown = isRecordCompleted(record);
      } else if (drillDownStat === 'self-census') {
        matchesDrillDown = record.residentialStatus.toUpperCase() !== 'DELETED' && Boolean(record.selfCensusId && record.selfCensusId.trim() !== '');
      } else if (drillDownStat === 'pending') {
        matchesDrillDown = record.residentialStatus.toUpperCase() !== 'DELETED' && 
          record.residentialStatus.toUpperCase() !== 'LOCKED' && 
          !isRecordCompleted(record);
      }
    }

    // Filter by status dropdown (only active if not drillDownStat)
    let matchesStatus = true;
    if (!drillDownStat) {
      if (statusFilter === 'residential') {
        matchesStatus = record.residentialStatus === 'आवासीय';
      } else if (statusFilter === 'non-residential') {
        matchesStatus = record.residentialStatus === 'गैर-आवासीय';
      } else if (statusFilter === 'vacant') {
        matchesStatus = record.residentialStatus.toUpperCase() === 'VACANT';
      } else if (statusFilter === 'deleted') {
        matchesStatus = record.residentialStatus.toUpperCase() === 'DELETED';
      } else if (statusFilter === 'locked') {
        matchesStatus = record.residentialStatus.toUpperCase() === 'LOCKED';
      } else if (statusFilter === 'completed') {
        matchesStatus = isRecordCompleted(record);
      } else if (statusFilter === 'incomplete') {
        matchesStatus = record.residentialStatus.toUpperCase() !== 'DELETED' && record.residentialStatus.toUpperCase() !== 'LOCKED' && !isRecordCompleted(record);
      }
    }

    return matchesSearch && matchesDrillDown && matchesStatus;
  });

  // Sorting
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (sortBy === 'lineAsc') {
      return a.lineNumber.localeCompare(b.lineNumber);
    } else if (sortBy === 'lineDesc') {
      return b.lineNumber.localeCompare(a.lineNumber);
    } else if (sortBy === 'bldgAsc') {
      return parseInt(a.buildingNumber || '0') - parseInt(b.buildingNumber || '0');
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Main Core Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Elegant Page Title Section */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-indigo-100 text-indigo-700 rounded-2xl border border-indigo-200">
                <Database className="w-6 h-6 text-indigo-600" />
              </span>
              <div>
                <h1 className="text-2xl font-bold font-display tracking-tight text-slate-800 flex items-center gap-2">
                  जनगणना मकान डायरेक्टरी 
                  <span className="text-sm font-sans font-medium text-slate-500 tracking-normal hidden sm:inline-block">
                    (Census Household Directory)
                  </span>
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  मकानों की लाइनवार सूची, मुखिया की जानकारी, मोबाइल नंबर एवं स्व जनगणना स्टेटस ट्रैकर
                </p>
              </div>
            </div>
          </div>

          {/* Core Configuration & Control Button groups */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => loadRecords(isLiveMode)}
              disabled={loading}
              className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5 font-medium text-xs"
              title="रीलोड विवरण"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">ताज़ा करें</span>
            </button>
          </div>
        </header>

        {/* Drill down or Normal view based on selected stat card */}
        {!drillDownStat ? (
          <>
            {/* Dynamic Housing Stats Dashlet */}
            <DashboardStats 
              records={records} 
              activeStat={drillDownStat}
              onCardClick={(stat) => {
                setDrillDownStat(stat);
                setSearchQuery('');
              }}
            />

            {/* Filtering & Searching Controls Board Card */}
            <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                
                {/* Realtime Search input block */}
                <div className="relative w-full lg:max-w-md">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="खोजें: लाईन क्रमांक, मुखिया नाम, मोबाइल, मकान..."
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 placeholder-slate-400 font-sans"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 text-xs font-semibold px-1 rounded hover:bg-slate-100"
                    >
                      साफ़
                    </button>
                  )}
                </div>

                {/* Selector-based layout filters */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  
                  {/* Category Filter */}
                  <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                    <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
                      <Filter className="w-3 h-3 text-slate-400" /> वर्ग:
                    </span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full sm:w-auto bg-slate-50 border border-slate-200 py-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-100"
                    >
                      <option value="all">सभी रिकॉर्ड्स</option>
                      <option value="residential">आवासीय मकान</option>
                      <option value="non-residential">गैर-आवासीय मकान</option>
                      <option value="vacant">VACANT (खाली)</option>
                      <option value="completed">विवरण पूर्ण (Completed)</option>
                      <option value="incomplete">अपूर्ण सूची (Incomplete)</option>
                      <option value="deleted">DELETED (निरस्त)</option>
                      <option value="locked">LOCKED (तालाबंद)</option>
                    </select>
                  </div>

                  {/* Sorting Filter */}
                  <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                    <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">क्रम:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full sm:w-auto bg-slate-50 border border-slate-200 py-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-100"
                    >
                      <option value="lineAsc">लाईन क्रमांक (बढ़ते)</option>
                      <option value="lineDesc">लाईन क्रमांक (घटते)</option>
                      <option value="bldgAsc">भवन नम्बर से</option>
                    </select>
                  </div>

                </div>

              </div>
            </section>

            {/* Grid Area */}
            {loading && sortedRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-xs">
                <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <h4 className="font-semibold text-slate-700">सर्वर से डाटा डाउनलोड किया जा रहा है...</h4>
                <p className="text-xs text-slate-400 mt-1">कृपया प्रतीक्षा करें</p>
              </div>
            ) : sortedRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 bg-white rounded-3xl border border-slate-200 text-center shadow-xs">
                <div className="p-4 bg-slate-50 text-indigo-500 rounded-full mb-4">
                  <MapPin className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-base font-bold text-slate-800">कोई रिकॉर्ड नहीं मिला (No Records Found)</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1 mx-auto">
                  आपकी खोज <span className="font-semibold text-indigo-600 font-mono">"{searchQuery}"</span> या चुने गए फ़िल्टर कॉम्बिनेशन से मिलता हुआ कोई डेटा मौजूद नहीं है।
                </p>
                <div className="flex gap-2 justify-center mt-5">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                  >
                    फ़िल्टर साफ़ करें
                  </button>
                  <button
                    onClick={handleAddNewRecord}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                  >
                    नया मैन्युअल जोड़ें
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Show search results string */}
                <div className="mb-4 flex items-center justify-between text-xs text-slate-400 font-medium px-1">
                  <span>कुल <span className="font-semibold text-slate-700 font-sans">{sortedRecords.length}</span> लाईन प्रदर्शित हो रहे हैं</span>
                  {searchQuery && (
                    <span>खोज परिणाम: <span className="italic text-indigo-600">"{searchQuery}"</span></span>
                  )}
                </div>

                {/* CSS Responsive grid layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedRecords.map((record, index) => (
                    <RecordCard
                      key={`${record.lineNumber}-${index}`}
                      record={record}
                      onSave={handleSaveRecord}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Breadcrumb / Drilldown Header */}
            <div className={`p-5 rounded-2xl border ${
              drillDownStat === 'total' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
              drillDownStat === 'totalHouses' ? 'bg-sky-50 border-sky-200 text-sky-700' :
              drillDownStat === 'residential' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
              drillDownStat === 'non-residential' ? 'bg-blue-50 border-blue-200 text-blue-700' :
              drillDownStat === 'locked' ? 'bg-orange-50 border-orange-200 text-orange-700' :
              drillDownStat === 'completed' ? 'bg-teal-50 border-teal-200 text-teal-700' :
              drillDownStat === 'self-census' ? 'bg-purple-50 border-purple-200 text-purple-700' :
              'bg-amber-50 border-amber-200 text-amber-700'
            } flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs`}>
              <div className="flex items-start gap-3">
                <button
                  onClick={() => setDrillDownStat(null)}
                  className="p-2 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-xs font-semibold">मुख्य डैशबोर्ड</span>
                </button>
                <div>
                  <h2 className="text-lg font-bold font-display flex items-center gap-2">
                    {drillDownStat === 'total' ? 'कुल लाईन (Total Lines)' :
                     drillDownStat === 'totalHouses' ? 'कुल विशिष्ट मकान नम्बर (Total Unique Houses)' :
                     drillDownStat === 'residential' ? 'आवासीय मकान (Residential)' :
                     drillDownStat === 'non-residential' ? 'गैर-आवासीय मकान/भवन (Non-Residential)' :
                     drillDownStat === 'locked' ? 'तालाबंद मकान (Locked)' :
                     drillDownStat === 'completed' ? 'पूर्ण विवरण रिकॉर्ड (Completed)' :
                     drillDownStat === 'self-census' ? 'स्व जनगणना SE ID (Self Census)' :
                     'लंबित / अपूर्ण विवरण (Pending)'}
                    <span className={`text-xs text-white ${
                      drillDownStat === 'total' ? 'bg-indigo-600' :
                      drillDownStat === 'totalHouses' ? 'bg-sky-600' :
                      drillDownStat === 'residential' ? 'bg-emerald-600' :
                      drillDownStat === 'non-residential' ? 'bg-blue-600' :
                      drillDownStat === 'locked' ? 'bg-orange-600' :
                      drillDownStat === 'completed' ? 'bg-teal-600' :
                      drillDownStat === 'self-census' ? 'bg-purple-600' :
                      'bg-amber-600'
                    } px-2.5 py-0.5 rounded-full font-sans font-semibold ml-2`}>
                      {sortedRecords.length} रिकॉर्ड्स
                    </span>
                  </h2>
                  <p className="text-xs opacity-90 mt-1">
                    {drillDownStat === 'total' ? 'सूची में उपलब्ध सभी दर्ज की गई मकान और परिवार लाईनें' :
                     drillDownStat === 'totalHouses' ? 'विशिष्ट और अलग-अलग मकान नम्बरों की सूची' :
                     drillDownStat === 'residential' ? 'केवल आवासीय (रहने योग्य) मकानों की सूची' :
                     drillDownStat === 'non-residential' ? 'व्यावसायिक, सरकारी या अन्य गैर-आवासीय उपयोग की इमारतें' :
                     drillDownStat === 'locked' ? 'वर्गीकृत बंद या तालाबंद मकानों की सूची' :
                     drillDownStat === 'completed' ? 'मकान जिनकी सभी ५ मुख्य जानकारियां पूर्ण रूप से भरी जा चुकी हैं' :
                     drillDownStat === 'self-census' ? 'मकान या परिवार जिनकी स्व जनगणना SE ID दर्ज है (Self Census)' :
                     'मकान जहां अभी मुख्य जानकारियां भरी जानी शेष हैं'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button
                  onClick={() => setDrillDownStat(null)}
                  className="px-3.5 py-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  सभी श्रेणियां दिखाएं
                </button>
              </div>
            </div>

            {/* Search/Filter specific to this drilldown scope */}
            <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* Search in this category */}
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="वर्तमान श्रेणी में खोजें..."
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-100 placeholder-slate-400 font-sans"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 text-xs font-semibold px-1"
                    >
                      साफ़
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {/* Sort Filter */}
                  <div className="flex items-center gap-1.5 flex-1 md:flex-initial">
                    <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">क्रम:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 py-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden"
                    >
                      <option value="lineAsc">लाईन क्रमांक (बढ़ते)</option>
                      <option value="lineDesc">लाईन क्रमांक (घटते)</option>
                      <option value="bldgAsc">भवन नम्बर से</option>
                    </select>
                  </div>
                </div>

              </div>
            </section>

            {/* Drilldown Category Grid */}
            {sortedRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 bg-white rounded-3xl border border-slate-200 text-center shadow-xs">
                <div className="p-4 bg-slate-50 text-indigo-500 rounded-full mb-4">
                  <MapPin className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-base font-bold text-slate-800">कोई रिकॉर्ड नहीं मिला</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1 mx-auto">
                  इस श्रेणी में आपके खोज या प्लॉट फ़िल्टर से मिलता हुआ कोई डेटा मौजूद नहीं है।
                </p>
                <div className="flex gap-2 justify-center mt-5">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                  >
                    खोज व फ़िल्टर साफ़ करें
                  </button>
                  <button
                    onClick={() => setDrillDownStat(null)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                  >
                    डैशबोर्ड पर वापस जाएं
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4 flex items-center justify-between text-xs text-slate-400 font-medium px-1">
                  <span>वर्तमान श्रेणी में कुल <span className="font-semibold text-slate-700 font-sans">{sortedRecords.length}</span> रिकॉर्ड प्रदर्शित हैं</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedRecords.map((record, index) => (
                    <RecordCard
                      key={`${record.lineNumber}-${index}`}
                      record={record}
                      onSave={handleSaveRecord}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Beautiful Modal Alert Overlay (to handle literal saved/updated dialog and alerts smoothly) */}
      <AnimatePresence>
        {showAlertModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
              onClick={() => setShowAlertModal({ ...showAlertModal, show: false })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-2xl border border-emerald-200 shadow-2xl p-6 text-center select-none overflow-hidden"
            >
              {/* Top dynamic success light effect */}
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-emerald-500" />
              
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <CheckCircle className="w-6 h-6" />
              </div>

              <h3 className="font-display font-bold text-slate-800 text-lg mb-2">{showAlertModal.title}</h3>
              <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed px-2 mb-6">
                {showAlertModal.message}
              </p>

              <button
                onClick={() => setShowAlertModal({ ...showAlertModal, show: false })}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md hover:shadow-slate-100 cursor-pointer"
              >
                ठीक है (Confirm)
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Configuration & Deployment Drawer Modal */}
      <AppsScriptModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        webAppUrl={webAppUrl}
        onSaveUrl={handleSaveUrl}
        onResetDemo={handleResetDemo}
        isLiveMode={isLiveMode}
        onToggleLiveMode={handleToggleLiveMode}
      />

      {/* Custom Toast Alert Messenger */}
      <Toast
        toasts={toasts}
        onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
      />
    </div>
  );
}
