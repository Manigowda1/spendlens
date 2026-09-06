import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { PrivacyBanner } from './components/PrivacyBanner';
import { FileUploadSection } from './components/FileUploadSection';
import { MonthSelector } from './components/MonthSelector';
import { OverviewMetrics } from './components/OverviewMetrics';
import { IncomeExpenseChart } from './components/IncomeExpenseChart';
import { MonthWiseBreakdown } from './components/MonthWiseBreakdown';
import { SpendingBracketsView } from './components/SpendingBracketsView';
import { RecurringSection } from './components/RecurringSection';
import { TransactionLedger } from './components/TransactionLedger';
import { PiiInspectorModal } from './components/PiiInspectorModal';
import { PrivacyArchitectureModal } from './components/PrivacyArchitectureModal';

import { computeMonthlyAnalytics, computeMonthlyBrackets, formatCurrencyINR } from './utils/analytics';
import { detectRecurringMerchants } from './utils/merchant';
import { getSampleDataset } from './utils/sampleData';
import { BankFileMetadata, Transaction, RedactionDetails } from './types';
import { 
  Sparkles, 
  UploadCloud, 
  ShieldCheck, 
  Layers, 
  Repeat, 
  FileSpreadsheet, 
  ArrowRight,
  Lock,
  Building2,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [files, setFiles] = useState<BankFileMetadata[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);
  const [activeBracketFilter, setActiveBracketFilter] = useState<string | null>(null);
  const [activeMerchantFilter, setActiveMerchantFilter] = useState<string | null>(null);
  const [isSampleActive, setIsSampleActive] = useState<boolean>(false);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isLiveScrubberOpen, setIsLiveScrubberOpen] = useState<boolean>(false);
  const [inspectedTransaction, setInspectedTransaction] = useState<Transaction | null>(null);

  // Compute analytics
  const { monthlySummaries, globalAnalytics } = useMemo(() => {
    return computeMonthlyAnalytics(transactions);
  }, [transactions]);

  // Compute recurring transactions
  const recurringMerchants = useMemo(() => {
    return detectRecurringMerchants(transactions);
  }, [transactions]);

  // Compute total redactions
  const redactionTotals: RedactionDetails = useMemo(() => {
    return transactions.reduce(
      (acc, t) => ({
        accountOrCardCount: acc.accountOrCardCount + t.redactionDetails.accountOrCardCount,
        emailCount: acc.emailCount + t.redactionDetails.emailCount,
        upiCount: acc.upiCount + t.redactionDetails.upiCount,
        refTokenCount: acc.refTokenCount + t.redactionDetails.refTokenCount,
        totalTokensRedacted: acc.totalTokensRedacted + t.redactionDetails.totalTokensRedacted,
      }),
      {
        accountOrCardCount: 0,
        emailCount: 0,
        upiCount: 0,
        refTokenCount: 0,
        totalTokensRedacted: 0,
      }
    );
  }, [transactions]);

  // Handle loading sample data
  const handleToggleSample = () => {
    if (isSampleActive) {
      // Clear sample
      setFiles([]);
      setTransactions([]);
      setSelectedMonthKey(null);
      setActiveBracketFilter(null);
      setActiveMerchantFilter(null);
      setIsSampleActive(false);
    } else {
      // Load 3 multi-bank sample statements covering 6 months
      const sample = getSampleDataset();
      setFiles(sample.files);
      setTransactions(sample.transactions);
      setSelectedMonthKey(null);
      setActiveBracketFilter(null);
      setActiveMerchantFilter(null);
      setIsSampleActive(true);
    }
  };

  const handleClearAll = () => {
    setFiles([]);
    setTransactions([]);
    setSelectedMonthKey(null);
    setActiveBracketFilter(null);
    setActiveMerchantFilter(null);
    setIsSampleActive(false);
  };

  const handleAddFiles = (newFiles: BankFileMetadata[], newTransactions: Transaction[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    setTransactions(prev => [...prev, ...newTransactions]);
    setIsSampleActive(false);
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setTransactions(prev => prev.filter(t => t.sourceFileId !== fileId));
    if (files.length <= 1) {
      setIsSampleActive(false);
    }
  };

  // Determine active view data based on selected month or all months
  const activeSummary = useMemo(() => {
    if (!selectedMonthKey) return null;
    return monthlySummaries.find(m => m.monthKey === selectedMonthKey) || null;
  }, [monthlySummaries, selectedMonthKey]);

  const activeCredit = activeSummary ? activeSummary.totalCredit : globalAnalytics.totalCredit;
  const activeDebit = activeSummary ? activeSummary.totalDebit : globalAnalytics.totalDebit;
  const activeNetSavings = activeSummary ? activeSummary.netSavings : globalAnalytics.netSavings;
  const activeSavingsRate = activeSummary ? activeSummary.savingsRate : globalAnalytics.overallSavingsRate;
  const activeTxnCount = activeSummary
    ? activeSummary.transactionCount
    : transactions.length;

  const activePeriodLabel = activeSummary
    ? activeSummary.displayMonth
    : `All Months (${monthlySummaries.length} Mos)`;

  // Brackets for the active scope
  const activeBrackets = useMemo(() => {
    if (activeSummary) {
      return activeSummary.brackets;
    }
    // Aggregate global brackets
    const allDebits = transactions.filter(t => t.type === 'debit');
    return computeMonthlyBrackets(allDebits, globalAnalytics.totalDebit);
  }, [activeSummary, transactions, globalAnalytics.totalDebit]);

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <Header
        isSampleActive={isSampleActive}
        onToggleSample={handleToggleSample}
        onClearAll={handleClearAll}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        transactions={transactions}
        monthlySummaries={monthlySummaries}
        recurringMerchants={recurringMerchants}
        totalPiiRedacted={redactionTotals.totalTokensRedacted}
        filesCount={files.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Privacy Shield Banner */}
        <PrivacyBanner
          redactionTotals={redactionTotals}
          totalTransactions={transactions.length}
          onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
          onOpenLiveScrubber={() => {
            setInspectedTransaction(null);
            setIsLiveScrubberOpen(true);
          }}
        />

        {/* Empty State / Welcome Hero when no statements are loaded */}
        {transactions.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs my-6 text-center max-w-3xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Analyze Multi-Bank Statements With Total Privacy
              </h2>
              <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                SpendLens parses bank statements (<span className="font-semibold text-slate-800">.csv, .xlsx, .xls</span>) 100% inside your browser. No server uploads. Automatically scrubs card numbers, account details, UPI handles, and categorizes recurring subscriptions and spending brackets.
              </p>
            </div>

            {/* Ingestion CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <button
                id="hero-sample-btn"
                onClick={handleToggleSample}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold bg-emerald-700 text-white hover:bg-emerald-800 transition-all shadow-md shadow-emerald-700/20 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Explore with Sample Data (6 Mos)</span>
              </button>

              <button
                id="hero-upload-btn"
                onClick={() => setIsUploadModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
              >
                <UploadCloud className="w-4 h-4 text-emerald-400" />
                <span>Upload Statement Files</span>
              </button>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-left text-xs text-slate-600">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  Client-Side PII Scrubbing
                </div>
                <p className="text-slate-500">10-16 digit account/cards, emails, and UPI IDs masked to [REDACTED].</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  Spending Tiers & Brackets
                </div>
                <p className="text-slate-500">Micro spending below ₹500 up to major commitments greater than ₹20,000.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-indigo-600" />
                  Recurring Intelligence
                </div>
                <p className="text-slate-500">Auto-detects recurring charges across 2 or more distinct calendar months.</p>
              </div>
            </div>

            {/* Direct Uploader Card embedded in empty state */}
            <div className="pt-2 text-left">
              <FileUploadSection
                files={files}
                onAddFiles={handleAddFiles}
                onRemoveFile={handleRemoveFile}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Statements Bar with quick Add button */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Active Statements ({files.length}):
                </span>
                {files.map(f => (
                  <span
                    key={f.id}
                    className="inline-flex items-center gap-1 text-xs bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-slate-700 shadow-2xs"
                  >
                    <Building2 className="w-3 h-3 text-emerald-600" />
                    <span className="font-medium">{f.detectedBank}</span>
                    <span className="text-slate-400 font-mono text-[10px]">({f.transactionCount})</span>
                  </span>
                ))}
              </div>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-xl flex items-center gap-1 shrink-0"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Add More Files</span>
              </button>
            </div>

            {/* Month Selector Pills Carousel */}
            <MonthSelector
              monthlySummaries={monthlySummaries}
              selectedMonthKey={selectedMonthKey}
              onSelectMonth={setSelectedMonthKey}
            />

            {/* 3 Core Overview Metric Cards (Earnings vs Expenditure vs Net Savings) */}
            <OverviewMetrics
              totalCredit={activeCredit}
              totalDebit={activeDebit}
              netSavings={activeNetSavings}
              savingsRate={activeSavingsRate}
              transactionCount={activeTxnCount}
              totalPiiRedacted={redactionTotals.totalTokensRedacted}
              periodLabel={activePeriodLabel}
              repeatedSpending={activeSummary ? activeSummary.repeatedSpending : globalAnalytics.totalRepeatedSpending}
              spentBelow500={activeSummary ? activeSummary.spentBelow500 : globalAnalytics.totalSpentBelow500}
            />

            {/* User Requested Focal View: Month-Wise Spending & Inflow Details */}
            <MonthWiseBreakdown
              monthlySummaries={monthlySummaries}
              selectedMonthKey={selectedMonthKey}
              onSelectMonth={setSelectedMonthKey}
              onInspectTransaction={tx => {
                setInspectedTransaction(tx);
                setIsLiveScrubberOpen(true);
              }}
            />

            {/* Visual Trend Chart: Monthly Income vs Expense */}
            <IncomeExpenseChart
              monthlySummaries={monthlySummaries}
              selectedMonthKey={selectedMonthKey}
              onSelectMonth={monthKey => setSelectedMonthKey(monthKey === selectedMonthKey ? null : monthKey)}
            />

            {/* Spending Brackets Section (Lower Brackets < ₹2,000 and Higher Brackets >= ₹2,000) */}
            <SpendingBracketsView
              brackets={activeBrackets}
              totalDebit={activeDebit}
              activeBracketFilter={activeBracketFilter}
              onSelectBracket={setActiveBracketFilter}
              periodLabel={activePeriodLabel}
            />

            {/* Recurring Commitments & Subscriptions Intelligence (2+ distinct months) */}
            <RecurringSection
              recurringMerchants={recurringMerchants}
              selectedMerchantFilter={activeMerchantFilter}
              onSelectMerchant={setActiveMerchantFilter}
            />

            {/* Sanitized Transaction Ledger */}
            <TransactionLedger
              transactions={transactions}
              onInspectTransaction={tx => {
                setInspectedTransaction(tx);
                setIsLiveScrubberOpen(true);
              }}
              activeBracketFilter={activeBracketFilter}
              onClearBracketFilter={() => setActiveBracketFilter(null)}
              activeMerchantFilter={activeMerchantFilter}
              onClearMerchantFilter={() => setActiveMerchantFilter(null)}
              selectedMonthKey={selectedMonthKey}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-slate-200/80 bg-white/70 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-800">SpendLens</span>
            <span>—</span>
            <span>100% Client-Side Private Statement Analyzer</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="text-emerald-700 hover:text-emerald-800 font-medium"
            >
              Zero-Cloud Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setInspectedTransaction(null);
                setIsLiveScrubberOpen(true);
              }}
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              PII Redaction Engine
            </button>
          </div>
        </div>
      </footer>

      {/* Upload Statements Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <FileUploadSection
              files={files}
              onAddFiles={handleAddFiles}
              onRemoveFile={handleRemoveFile}
              onClose={() => setIsUploadModalOpen(false)}
              isModal={true}
            />
          </div>
        </div>
      )}

      {/* Privacy Architecture Modal */}
      {isPrivacyModalOpen && (
        <PrivacyArchitectureModal
          onClose={() => setIsPrivacyModalOpen(false)}
          onOpenLiveScrubber={() => {
            setIsPrivacyModalOpen(false);
            setInspectedTransaction(null);
            setIsLiveScrubberOpen(true);
          }}
        />
      )}

      {/* PII Live Scrubber & Inspector Modal */}
      {isLiveScrubberOpen && (
        <PiiInspectorModal
          transaction={inspectedTransaction}
          onClose={() => {
            setIsLiveScrubberOpen(false);
            setInspectedTransaction(null);
          }}
        />
      )}
    </div>
  );
}
