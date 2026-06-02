/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Phone, 
  MapPin, 
  Compass, 
  CheckCircle2, 
  Building2, 
  Edit3, 
  Save, 
  FileCheck,
  Building,
  Hash,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Lock,
  MessageCircle
} from 'lucide-react';
import { CensusRecord } from '../types';

interface RecordCardProps {
  record: CensusRecord;
  onSave: (updated: CensusRecord) => Promise<boolean>;
}

export const RecordCard: React.FC<RecordCardProps> = ({ record, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [headName, setHeadName] = useState(record.headName);
  const [mobileNumber, setMobileNumber] = useState(record.mobileNumber);
  const [selfCensusId, setSelfCensusId] = useState(record.selfCensusId);
  const [residentialStatus, setResidentialStatus] = useState(record.residentialStatus);
  const [householdUse, setHouseholdUse] = useState(record.householdUse);
  const [buildingNumber, setBuildingNumber] = useState(record.buildingNumber);
  const [houseNumber, setHouseNumber] = useState(record.houseNumber);
  const [plotNumber, setPlotNumber] = useState(record.plotNumber);

  // Determine if the card has data pre-filled in the sheet
  const hasOriginalData = Boolean(
    record.headName || record.mobileNumber || record.selfCensusId
  );

  // Status Checkers
  const isDeleted = record.residentialStatus.toUpperCase() === 'DELETED';
  const isResidential = record.residentialStatus === 'आवासीय';
  const isNonResidential = record.residentialStatus === 'गैर-आवासीय';
  const isLocked = record.residentialStatus.toUpperCase() === 'LOCKED';
  const isVacant = record.residentialStatus.toUpperCase() === 'VACANT';

  const handleCancel = () => {
    // Reset to current record values
    setHeadName(record.headName);
    setMobileNumber(record.mobileNumber);
    setSelfCensusId(record.selfCensusId);
    setResidentialStatus(record.residentialStatus);
    setHouseholdUse(record.householdUse);
    setBuildingNumber(record.buildingNumber);
    setHouseNumber(record.houseNumber);
    setPlotNumber(record.plotNumber);
    setError(null);
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    const cleanedMobile = mobileNumber.trim();
    const cleanedHeadName = headName.trim();
    const cleanedHouseholdUse = householdUse.trim();

    // Conditional requirements only when residential status is "आवासीय"
    if (residentialStatus === 'आवासीय') {
      if (!cleanedHouseholdUse) {
        setError("कृपया परिवार क्रमांक/वास्तविक उपयोग दर्ज करें। (Family Number / Use is required for Residential status)");
        setIsSaving(false);
        return;
      }
      if (!cleanedHeadName) {
        setError("कृपया परिवार के मुखिया का नाम दर्ज करें। (Head of Family is required for Residential status)");
        setIsSaving(false);
        return;
      }
      if (!cleanedMobile) {
        setError("कृपया मोबाइल नंबर दर्ज करें। (Mobile number is required for Residential status)");
        setIsSaving(false);
        return;
      }
    }

    if (cleanedMobile && !/^[6-9]\d{9}$/.test(cleanedMobile)) {
      setError("अमान्य मोबाइल नंबर! मोबाइल नंबर ठीक १० अंकों का होना चाहिए और ६, ७, ८ या ९ से शुरू होना चाहिए।");
      setIsSaving(false);
      return;
    }

    const cleanedSeId = selfCensusId.trim();
    if (cleanedSeId && !/^[Hh]\d{11}$/.test(cleanedSeId)) {
      setError("स्व जनगणना SE ID अमान्य है! यह 'H' से शुरू होना चाहिए और उसके बाद ठीक ११ अंक होने चाहिए (उदा. H12345678901)।");
      setIsSaving(false);
      return;
    }

    const normalizedSeId = cleanedSeId ? ('H' + cleanedSeId.substring(1)) : '';
    
    const updated: CensusRecord = {
      lineNumber: record.lineNumber,
      buildingNumber,
      houseNumber,
      residentialStatus,
      householdUse: cleanedHouseholdUse,
      plotNumber,
      headName: cleanedHeadName,
      mobileNumber: cleanedMobile,
      selfCensusId: normalizedSeId,
    };

    const success = await onSave(updated);
    setIsSaving(false);
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      layout
      id={`card-${record.lineNumber}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`relative overflow-hidden rounded-2xl border bg-white shadow-xs transition-all ${
        isDeleted 
          ? 'border-rose-100 bg-rose-50/20 opacity-75' 
          : isLocked
            ? 'border-orange-200 bg-orange-50/5 hover:border-orange-300 hover:shadow-md'
            : isEditing
              ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-md'
              : hasOriginalData
                ? 'border-slate-200/80 hover:border-indigo-200 hover:shadow-md'
                : 'border-amber-200 bg-amber-50/10 hover:border-amber-300 hover:shadow-md'
      }`}
    >
      {/* Accent Ribbon */}
      <div className={`h-1.5 w-full ${
        isDeleted 
          ? 'bg-rose-400' 
          : isLocked
            ? 'bg-orange-500'
            : isEditing 
              ? 'bg-indigo-500' 
              : hasOriginalData 
                ? 'bg-emerald-500' 
                : 'bg-amber-400'
      }`} />

      <div className="p-5">
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              <Hash className="w-3 h-3 mr-0.5 text-slate-400" /> #{record.lineNumber}
            </span>
            
            {/* Status Badge */}
            {isDeleted ? (
              <span className="px-2 py-0.5 text-xs font-medium bg-rose-100 text-rose-800 rounded-full">
                DELETED (निरस्त)
              </span>
            ) : isLocked ? (
              <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded-full flex items-center gap-1 font-semibold">
                <Lock className="w-3 h-3 text-orange-600" /> LOCKED
              </span>
            ) : isResidential ? (
              <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                आवासीय
              </span>
            ) : isNonResidential ? (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                गैर-आवासीय
              </span>
            ) : isVacant ? (
              <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                VACANT (खाली)
              </span>
            ) : (
              <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                {record.residentialStatus || 'अनिर्दिष्ट'}
              </span>
            )}
          </div>

          {!isDeleted && (
            <button
              onClick={() => {
                if (isEditing) {
                  handleCancel();
                } else {
                  setError(null);
                  setIsEditing(true);
                }
              }}
              disabled={isSaving}
              className={`p-2 rounded-xl border transition-all ${
                isEditing 
                  ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200' 
                  : 'bg-slate-50 border-slate-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200'
              }`}
              title={isEditing ? "रद्द करें (Cancel)" : "संपादित करें (Edit)"}
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Card Content - Normal Read Mode */}
        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.div
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Location details */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">भवन नंबर / Building</div>
                  <div className="text-sm font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {record.buildingNumber || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">मकान नम्बर / House</div>
                  <div className="text-sm font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {record.houseNumber || '-'}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">परिवार क्रमांक/वास्तविक उपयोग</div>
                  <div className="text-xs font-semibold text-indigo-600 truncate mt-0.5" title={record.householdUse}>
                    {record.householdUse || <span className="text-slate-400 font-normal italic">कोई नहीं</span>}
                  </div>
                </div>
              </div>

              {/* Resident details */}
              <div className="space-y-2.5">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wider block uppercase mb-1">
                    परिवार के मुखिया का नाम / Head Name
                  </span>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                    record.headName 
                      ? 'bg-indigo-50/30 border-indigo-100 text-slate-800 font-medium' 
                      : 'bg-amber-50/40 border-amber-100/70 text-amber-800'
                  }`}>
                    <User className="w-4 h-4 shrink-0 text-slate-400" />
                    <span className="text-sm truncate">
                      {record.headName || (
                        <span className="text-amber-600/80 font-normal italic flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> नाम दर्ज़ नहीं है (No Name)
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wider block uppercase mb-1">
                    मोबाइल नंबर / Mobile No.
                  </span>
                  <div className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border ${
                    record.mobileNumber 
                      ? 'bg-indigo-50/30 border-indigo-100 text-slate-800 font-medium' 
                      : 'bg-amber-50/40 border-amber-100/70 text-amber-800'
                  }`}>
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="w-4 h-4 shrink-0 text-slate-400" />
                      <span className="text-sm font-mono truncate">
                        {record.mobileNumber || (
                          <span className="text-amber-600/80 font-normal italic flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> मोबाइल दर्ज नहीं (No Mobile)
                          </span>
                        )}
                      </span>
                    </div>
                    {record.mobileNumber && (
                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={`tel:${record.mobileNumber.replace(/\D/g, '')}`}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 active:scale-90 transition-all shadow-xs"
                          title="कॉल करें (Call)"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={(() => {
                            const digits = record.mobileNumber.replace(/\D/g, '');
                            return `https://wa.me/${digits.length === 10 ? '91' : ''}${digits}`;
                          })()}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-green-500 text-white hover:bg-green-600 active:scale-90 transition-all shadow-xs"
                          title="WhatsApp चैट करें"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wider block uppercase mb-1">
                    स्व जनगणना SE ID / Self Census ID
                  </span>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                    record.selfCensusId 
                      ? 'bg-indigo-50/30 border-indigo-100 text-slate-800 font-medium' 
                      : 'bg-amber-50/40 border-amber-100/70 text-amber-800'
                  }`}>
                    <Compass className="w-4 h-4 shrink-0 text-slate-400" />
                    <span className="text-sm font-mono truncate">
                      {record.selfCensusId || (
                        <span className="text-amber-600/80 font-normal italic flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> ID दर्ज़ नहीं (No ID)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Alert text */}
              {!isDeleted && (
                <div className={`flex items-center gap-1.5 p-2 rounded-lg text-[11px] ${
                  hasOriginalData 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                    : 'bg-amber-50 text-amber-800 border border-amber-100'
                }`}>
                  {hasOriginalData ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>डाटा शीट में मौजूद है। आप अद्यतन (Update) कर सकते हैं।</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-bounce" />
                      <span>जानकारी भरें और सबमिट (Submit) करें।</span>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            // Edit Mode Form Layout
            <motion.form
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-3.5"
            >
              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/80 mb-2">
                <span className="text-xs text-indigo-800 font-semibold flex items-center gap-1 mb-1">
                  <Edit3 className="w-3.5 h-3.5" /> विवरण संपादित करें (Offline/Live Edit)
                </span>
                <p className="text-[11px] text-indigo-700/80">
                  लाईन नम्बर #{record.lineNumber} का विवरण बदलें। यह सीधे सूची में सुरक्षित होगा।
                </p>
              </div>

              {/* Editable Fields layout - Core Details if needed */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">भवन नम्बर / Bldg</label>
                  <input
                    type="text"
                    disabled
                    value={buildingNumber}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed select-none focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">मकान नम्बर / House</label>
                  <input
                    type="text"
                    disabled
                    value={houseNumber}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed select-none focus:outline-hidden"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">वर्ग / residentialStatus</label>
                  <select
                    value={residentialStatus}
                    onChange={(e) => setResidentialStatus(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="आवासीय">आवासीय</option>
                    <option value="गैर-आवासीय">गैर-आवासीय</option>
                    <option value="VACANT">Vacant</option>
                    <option value="DELETED">DELETED</option>
                    <option value="LOCKED">LOCKED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-1">
                  परिवार क्रमांक/वास्तविक उपयोग {residentialStatus === 'आवासीय' && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="text"
                  required={residentialStatus === 'आवासीय'}
                  value={householdUse}
                  onChange={(e) => setHouseholdUse(e.target.value)}
                  placeholder="उदा. HOTEL, BALAJI PG, 002"
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <hr className="border-slate-100" />

              {/* Main Inputs: Family, Mobile, Census id */}
              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-1">
                  परिवार के मुखिया का नाम (Head of Family) {residentialStatus === 'आवासीय' && <span className="text-rose-500">*</span>}
                </label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required={residentialStatus === 'आवासीय'}
                    value={headName}
                    onChange={(e) => setHeadName(e.target.value)}
                    placeholder="मुखिया का पूरा नाम दर्ज करें"
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-1">
                  मोबाइल नंबर (Mobile Number) {residentialStatus === 'आवासीय' && <span className="text-rose-500">*</span>}
                </label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    maxLength={10}
                    required={residentialStatus === 'आवासीय'}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="10 अंकों का मोबाइल नंबर"
                    className="w-full text-xs font-mono pl-8 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-1">स्व जनगणना SE ID (Self Census SE ID)</label>
                <div className="relative">
                  <Compass className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={selfCensusId}
                    onChange={(e) => setSelfCensusId(e.target.value)}
                    placeholder="SE ID कोड दर्ज करें"
                    className="w-full text-xs font-mono pl-8 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              {error && (
                <div role="alert" className="p-2.5 bg-rose-50 border border-rose-100/80 text-rose-700 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {/* Buttons Panel - Submit vs Update dynamically */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="w-1/3 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-lg transition-all"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`w-2/3 text-xs text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                    hasOriginalData
                      ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-100'
                      : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-100'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>प्रक्रिया जारी है...</span>
                    </>
                  ) : hasOriginalData ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>अपडेट करें (Update)</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>सबमिट करें (Submit)</span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
