/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Building, 
  Home, 
  Trash2, 
  UserCheck, 
  Clock, 
  Percent,
  Lock,
  FileText
} from 'lucide-react';
import { CensusRecord } from '../types';

interface DashboardStatsProps {
  records: CensusRecord[];
  activeStat?: string | null;
  onCardClick?: (stat: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ records, activeStat, onCardClick }) => {
  const total = records.length;
  const totalHouses = new Set(
    records
      .filter(r => r.residentialStatus.toUpperCase() !== 'DELETED')
      .map(r => r.houseNumber)
      .filter(val => val && val.trim() !== '')
  ).size;
  const deleted = records.filter(r => r.residentialStatus.toUpperCase() === 'DELETED').length;
  const locked = records.filter(r => r.residentialStatus.toUpperCase() === 'LOCKED').length;
  const active = records.length - deleted - locked;
  
  const residential = records.filter(r => r.residentialStatus === 'आवासीय').length;
  const nonResidential = records.filter(r => r.residentialStatus === 'गैर-आवासीय').length;
  
  // Filled records (completed)
  const filled = records.filter(r => {
    const statusUpper = r.residentialStatus.toUpperCase();
    if (statusUpper === 'DELETED' || statusUpper === 'LOCKED') {
      return false;
    }
    if (r.residentialStatus === 'आवासीय') {
      // For Residential: Head Name, Household Use, and Mobile Number are required
      return Boolean(
        r.headName && r.headName.trim() !== '' &&
        r.householdUse && r.householdUse.trim() !== '' &&
        r.mobileNumber && r.mobileNumber.trim() !== ''
      );
    } else {
      // For options other than "आवासीय" (like non-residential), key fields are not mandatory
      return Boolean(
        r.lineNumber && r.lineNumber.trim() !== '' &&
        r.buildingNumber && r.buildingNumber.trim() !== '' &&
        r.houseNumber && r.houseNumber.trim() !== '' &&
        r.residentialStatus && r.residentialStatus.trim() !== ''
      );
    }
  }).length;

  const selfCensusCount = records.filter(r => 
    r.residentialStatus.toUpperCase() !== 'DELETED' && 
    r.selfCensusId && 
    r.selfCensusId.trim() !== ''
  ).length;

  const pending = active - filled;
  const completionRate = active > 0 ? Math.round((filled / active) * 100) : 0;

  const handleCardClick = (statKey: string) => {
    if (onCardClick) {
      onCardClick(statKey);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3 mb-6">
      {/* Total Card */}
      <div 
        onClick={() => handleCardClick('total')}
        className={`bg-white border rounded-2xl p-4 shadow-xs cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-95 ${
          activeStat === 'total' ? 'border-indigo-500 ring-2 ring-indigo-50 bg-indigo-50/10' : 'border-slate-200/80 hover:border-indigo-300'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-slate-500 font-medium">कुल लाईन (Total)</span>
          <div className="p-1 rounded-lg bg-indigo-50">
            <Building className="w-4 h-4 text-indigo-600" />
          </div>
        </div>
        <div className="text-2xl font-bold font-display text-slate-800">{total}</div>
        <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-between gap-1 flex-wrap">
          <span>शामिल हैं</span>
          {deleted > 0 && (
            <span className="text-rose-600 font-medium">निरस्त (Deleted): {deleted}</span>
          )}
        </p>
      </div>

      {/* Total Houses Card */}
      <div 
        onClick={() => handleCardClick('totalHouses')}
        className={`bg-white border rounded-2xl p-4 shadow-xs cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-95 ${
          activeStat === 'totalHouses' ? 'border-sky-500 ring-2 ring-sky-55 bg-sky-50/10' : 'border-slate-200/80 hover:border-sky-300'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-slate-500 font-medium">कुल मकान (Total)</span>
          <div className="p-1 rounded-lg bg-sky-50">
            <Home className="w-4 h-4 text-sky-600" />
          </div>
        </div>
        <div className="text-2xl font-bold font-display text-slate-800">{totalHouses}</div>
        <p className="text-[10px] text-sky-700 font-medium mt-1">विशिष्ट मकान नम्बर</p>
      </div>

      {/* Residential */}
      <div 
        onClick={() => handleCardClick('residential')}
        className={`bg-white border rounded-2xl p-4 shadow-xs cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-95 ${
          activeStat === 'residential' ? 'border-emerald-500 ring-2 ring-emerald-50 bg-emerald-50/10' : 'border-slate-200/80 hover:border-emerald-300'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-slate-500 font-medium">आवासीय (Res)</span>
          <div className="p-1 rounded-lg bg-emerald-50">
            <Home className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
        <div className="text-2xl font-bold font-display text-slate-800">{residential}</div>
        <p className="text-[10px] text-emerald-700 font-medium mt-1">मकान</p>
      </div>

      {/* Non Residential */}
      <div 
        onClick={() => handleCardClick('non-residential')}
        className={`bg-white border rounded-2xl p-4 shadow-xs cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-95 ${
          activeStat === 'non-residential' ? 'border-blue-500 ring-2 ring-blue-50 bg-blue-50/10' : 'border-slate-200/80 hover:border-blue-300'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-slate-500 font-medium">गैर-आवासीय</span>
          <div className="p-1 rounded-lg bg-blue-50">
            <Building className="w-4 h-4 text-blue-600" />
          </div>
        </div>
        <div className="text-2xl font-bold font-display text-slate-800">{nonResidential}</div>
        <p className="text-[10px] text-blue-700 font-medium mt-1">व्यावसायिक / अन्य</p>
      </div>

      {/* Locked Card */}
      <div 
        onClick={() => handleCardClick('locked')}
        className={`bg-white border rounded-2xl p-4 shadow-xs cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-95 ${
          activeStat === 'locked' ? 'border-orange-500 ring-2 ring-orange-50 bg-orange-50/10' : 'border-slate-200/80 hover:border-orange-300'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-slate-500 font-medium">तालाबंद (Locked)</span>
          <div className="p-1 rounded-lg bg-orange-50">
            <Lock className="w-4 h-4 text-orange-600" />
          </div>
        </div>
        <div className="text-2xl font-bold font-display text-slate-800">{locked}</div>
        <p className="text-[10px] text-orange-700 font-semibold mt-1">बंद मकान</p>
      </div>

      {/* Filled Details */}
      <div 
        onClick={() => handleCardClick('completed')}
        className={`bg-white border rounded-2xl p-4 shadow-xs cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-95 ${
          activeStat === 'completed' ? 'border-teal-500 ring-2 ring-teal-50 bg-teal-50/10' : 'border-slate-200/80 hover:border-teal-300'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-slate-500 font-medium font-sans">पूर्ण (Completed)</span>
          <div className="p-1 rounded-lg bg-teal-50">
            <UserCheck className="w-4 h-4 text-teal-600" />
          </div>
        </div>
        <div className="text-2xl font-bold font-display text-slate-800">{filled}</div>
        <p className="text-[10px] text-teal-700 font-semibold mt-1" title="लाईन क्रमांक, जनगणना भवन नंबर, जनगणना मकान नम्बर, आवासीय/गैर-आवासीय, परिवार क्रमांक/वास्तविक उपयोग पूर्ण">5 मुख्य कॉलम पूर्ण</p>
      </div>

      {/* Self Census Card */}
      <div 
        onClick={() => handleCardClick('self-census')}
        className={`bg-white border rounded-2xl p-4 shadow-xs cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-95 ${
          activeStat === 'self-census' ? 'border-purple-500 ring-2 ring-purple-50 bg-purple-50/10' : 'border-slate-200/80 hover:border-purple-300'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-slate-500 font-medium">स्व जनगणना SE ID</span>
          <div className="p-1 rounded-lg bg-purple-50">
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
        </div>
        <div className="text-2xl font-bold font-display text-slate-800">{selfCensusCount}</div>
        <p className="text-[10px] text-purple-700 font-semibold mt-1">SE ID दर्ज</p>
      </div>

      {/* Pending */}
      <div 
        onClick={() => handleCardClick('pending')}
        className={`bg-white border rounded-2xl p-4 shadow-xs cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-95 ${
          activeStat === 'pending' ? 'border-amber-500 ring-2 ring-amber-50 bg-amber-50/10' : 'border-slate-200/80 hover:border-amber-300'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-slate-500 font-medium">लंबित (Pending)</span>
          <div className="p-1 rounded-lg bg-amber-50">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
        </div>
        <div className="text-2xl font-bold font-display text-slate-800">{pending}</div>
        <p className="text-[10px] text-amber-700 font-semibold mt-1">जानकारी आवश्यक</p>
      </div>

      {/* Completion Rate */}
      <div 
        onClick={() => handleCardClick('completed')}
        className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-95 hover:border-indigo-300"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-slate-500 font-medium">प्रगति (Progress)</span>
          <div className="p-1 rounded-lg bg-indigo-50">
            <Percent className="w-4 h-4 text-indigo-600" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-display text-slate-800">{completionRate}%</span>
        </div>
        {/* Simple Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
          <div 
            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" 
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
};
