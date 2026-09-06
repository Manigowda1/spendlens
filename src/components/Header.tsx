import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UploadCloud, 
  Sparkles, 
  Download, 
  Trash2, 
  FileSpreadsheet, 
  FileText, 
  Info,
  ChevronDown
} from 'lucide-react';
import { exportMonthlySummaryCSV, exportScrubbedJSON, exportScrubbedLedgerCSV } from '../utils/export';
import { MonthlySummary, RecurringMerchantSummary, Transaction } from '../types';

interface HeaderProps {
  isSampleActive: boolean;
  onToggleSample: () => void;
  onClearAll: () => void;
  onOpenUpload: () => void;
  onOpenPrivacyModal: () => void;
  transactions: Transaction[];
  monthlySummaries: MonthlySummary[];
  recurringMerchants: RecurringMerchantSummary[];
  totalPiiRedacted: number;
  filesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isSampleActive,
  onToggleSample,
  onClearAll,
  onOpenUpload,
  onOpenPrivacyModal,
  transactions,
  monthlySummaries,
  recurringMerchants,
  totalPiiRedacted,
  filesCount,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Privacy Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <span className="font-bold text-xl tracking-tight">S</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">SpendLens</h1>
                <button
                  onClick={onOpenPrivacyModal}
                  className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70 hover:bg-emerald-100 transition-colors"
                  title="Click to view client-side zero-cloud privacy architecture"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Client-Side Privacy</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Private Multi-Bank Statement & Spending Bracket Analyzer
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Privacy Pill */}
            <button
              onClick={onOpenPrivacyModal}
              className="sm:hidden inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Private</span>
            </button>

            {/* Sample Data Toggle */}
            <button
              id="sample-data-toggle-btn"
              onClick={onToggleSample}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs ${
                isSampleActive
                  ? 'bg-emerald-700 text-white shadow-emerald-700/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSampleActive ? 'text-amber-300' : 'text-slate-500'}`} />
              <span>{isSampleActive ? 'Sample Active' : 'Sample Data'}</span>
            </button>

            {/* Upload Statements Button */}
            <button
              id="upload-statements-header-btn"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              <span className="hidden xs:inline">Upload</span>
              <span className="hidden sm:inline">Statements</span>
              {filesCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-slate-700 rounded-full text-[10px]">
                  {filesCount}
                </span>
              )}
            </button>

            {/* Export Scrubbed Summary Dropdown */}
            {transactions.length > 0 && (
              <div className="relative">
                <button
                  id="export-scrubbed-btn"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
                  title="Download sanitized reports with zero PII"
                >
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
                  <span className="hidden sm:inline">Export</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showExportMenu && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setShowExportMenu(false)}
                  >
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Scrubbed Export (Zero PII)
                    </div>

                    <button
                      onClick={() => {
                        exportMonthlySummaryCSV(monthlySummaries, recurringMerchants);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center gap-2 transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="font-medium text-slate-800">Monthly Summary (CSV)</div>
                        <div className="text-[10px] text-slate-400">Income, debit brackets & recurring</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        exportScrubbedLedgerCSV(transactions);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center gap-2 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-medium text-slate-800">Full Scrubbed Ledger (CSV)</div>
                        <div className="text-[10px] text-slate-400">All transactions sanitized</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        exportScrubbedJSON(transactions, monthlySummaries, recurringMerchants);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center gap-2 transition-colors"
                    >
                      <Info className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="font-medium text-slate-800">Full Privacy Report (JSON)</div>
                        <div className="text-[10px] text-slate-400">Structured data + PII metrics</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Clear All */}
            {transactions.length > 0 && (
              <button
                onClick={onClearAll}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Clear all statements and reset"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
