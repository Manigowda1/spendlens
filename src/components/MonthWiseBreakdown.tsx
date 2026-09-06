import React, { useState } from 'react';
import { 
  CalendarDays, 
  TrendingUp, 
  TrendingDown, 
  Repeat, 
  Coins, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search,
  CheckCircle2,
  Tag,
  Building2,
  Calendar,
  Layers,
  Percent,
  X
} from 'lucide-react';
import { formatCurrencyINR } from '../utils/analytics';
import { MonthlySummary, MonthRepeatedMerchant, Transaction } from '../types';

interface MonthWiseBreakdownProps {
  monthlySummaries: MonthlySummary[];
  selectedMonthKey: string | null;
  onSelectMonth: (monthKey: string | null) => void;
  onInspectTransaction?: (tx: Transaction) => void;
}

export const MonthWiseBreakdown: React.FC<MonthWiseBreakdownProps> = ({
  monthlySummaries,
  selectedMonthKey,
  onSelectMonth,
  onInspectTransaction,
}) => {
  // Mode: 'table' (compare all months) or 'focus' (deep dive into selected month)
  const [expandedRepeatedMonth, setExpandedRepeatedMonth] = useState<string | null>(null);
  const [expandedBelow500Month, setExpandedBelow500Month] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'all-table' | 'focus'>('all-table');
  const [below500SearchQuery, setBelow500SearchQuery] = useState<string>('');

  if (monthlySummaries.length === 0) {
    return null;
  }

  // Active month for focus view (default to selectedMonthKey or first/last month)
  const activeMonth = selectedMonthKey 
    ? monthlySummaries.find(m => m.monthKey === selectedMonthKey) || monthlySummaries[0]
    : monthlySummaries[monthlySummaries.length - 1]; // latest month by default

  const toggleRepeatedExpansion = (monthKey: string) => {
    setExpandedRepeatedMonth(prev => prev === monthKey ? null : monthKey);
  };

  const toggleBelow500Expansion = (monthKey: string) => {
    setExpandedBelow500Month(prev => prev === monthKey ? null : monthKey);
    setBelow500SearchQuery('');
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs my-5 space-y-5">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Month-Wise Spending & Inflow Details
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Month-by-month Amount Credited vs. Amount Spent, plus detailed breakdowns of <span className="font-semibold text-indigo-700">Repeated Transactions</span> across months and <span className="font-semibold text-amber-800">Total Spent Below ₹500</span>.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setViewMode('all-table')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'all-table' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'hover:text-slate-900'
              }`}
            >
              <span>All Months Table</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                {monthlySummaries.length}
              </span>
            </button>
            <button
              onClick={() => setViewMode('focus')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'focus' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'hover:text-slate-900'
              }`}
            >
              <span>Single Month Deep Dive</span>
              <span className="text-[10px] text-emerald-700 font-bold font-mono">
                {activeMonth.displayMonth}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW MODE 1: ALL MONTHS COMPREHENSIVE TABLE & CARDS
          ========================================================================= */}
      {viewMode === 'all-table' && (
        <div className="space-y-4">
          {/* Quick instructions bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-slate-50/80 p-3 rounded-2xl border border-slate-200/60">
            <div className="text-slate-600 flex items-center gap-2">
              <span className="font-semibold text-slate-800">Summary across all {monthlySummaries.length} months:</span>
              <span className="text-slate-400">•</span>
              <span>Click on any month to inspect repeated merchants or micro-transactions under ₹500.</span>
            </div>
            {selectedMonthKey && (
              <button
                onClick={() => onSelectMonth(null)}
                className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-xl hover:bg-slate-50 self-start sm:self-auto"
              >
                Reset Month Filter ({monthlySummaries.find(m => m.monthKey === selectedMonthKey)?.displayMonth}) ✕
              </button>
            )}
          </div>

          {/* Desktop & Tablet Table */}
          <div className="hidden md:block overflow-x-auto border border-slate-200/80 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Month</th>
                  <th className="py-3.5 px-4 text-right">Amount Credited</th>
                  <th className="py-3.5 px-4 text-right">Amount Spent</th>
                  <th className="py-3.5 px-4 text-right">Net Savings</th>
                  <th className="py-3.5 px-4">Under Spent: Repeated Across Months</th>
                  <th className="py-3.5 px-4">Under Spent: Total Below ₹500</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlySummaries.map(m => {
                  const isSelected = selectedMonthKey === m.monthKey;
                  const isSurplus = m.netSavings >= 0;
                  const isRepeatedOpen = expandedRepeatedMonth === m.monthKey;
                  const isBelow500Open = expandedBelow500Month === m.monthKey;

                  return (
                    <React.Fragment key={m.monthKey}>
                      <tr className={`transition-colors ${
                        isSelected 
                          ? 'bg-emerald-50/40 font-medium' 
                          : 'hover:bg-slate-50/70'
                      }`}>
                        {/* Month Name & Txn Count */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900 text-sm">
                            {m.displayMonth}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {m.transactionCount} transactions
                          </div>
                        </td>

                        {/* Amount Credited */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="font-mono font-bold text-emerald-700 text-sm">
                            {formatCurrencyINR(m.totalCredit)}
                          </div>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                            +Inflow
                          </span>
                        </td>

                        {/* Amount Spent */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="font-mono font-bold text-slate-900 text-sm">
                            {formatCurrencyINR(m.totalDebit)}
                          </div>
                          <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded font-medium">
                            -Outflow
                          </span>
                        </td>

                        {/* Net Savings */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className={`font-mono font-bold text-xs ${
                            isSurplus ? 'text-emerald-700' : 'text-rose-700'
                          }`}>
                            {isSurplus ? '+' : ''}{formatCurrencyINR(m.netSavings)}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {m.savingsRate.toFixed(1)}% rate
                          </div>
                        </td>

                        {/* Under Spent: Repeated Transactions Across Months */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <div className="font-mono font-bold text-indigo-950 text-xs">
                                {formatCurrencyINR(m.repeatedSpending.totalAmount)}
                              </div>
                              <div className="text-[11px] text-indigo-700 font-medium">
                                {m.repeatedSpending.percentageOfDebit}% of spent ({m.repeatedSpending.count} txns)
                              </div>
                            </div>
                            <button
                              onClick={() => toggleRepeatedExpansion(m.monthKey)}
                              className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                                isRepeatedOpen
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                              }`}
                              title="Inspect repeated merchants for this month"
                            >
                              <span>{m.repeatedSpending.merchants.length} items</span>
                              {isRepeatedOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>

                        {/* Under Spent: Total Below 500 */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <div className="font-mono font-bold text-amber-950 text-xs">
                                {formatCurrencyINR(m.spentBelow500.totalAmount)}
                              </div>
                              <div className="text-[11px] text-amber-800 font-medium">
                                {m.spentBelow500.percentageOfDebit}% of spent ({m.spentBelow500.count} txns)
                              </div>
                            </div>
                            <button
                              onClick={() => toggleBelow500Expansion(m.monthKey)}
                              className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                                isBelow500Open
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                              }`}
                              title="Inspect transactions below ₹500"
                            >
                              <span>{m.spentBelow500.count} txns</span>
                              {isBelow500Open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>

                        {/* Action: Focus */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => {
                              onSelectMonth(isSelected ? null : m.monthKey);
                              setViewMode('focus');
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                              isSelected
                                ? 'bg-emerald-700 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            Deep Dive
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Row for Repeated Transactions */}
                      {isRepeatedOpen && (
                        <tr className="bg-indigo-50/40 border-b border-indigo-100">
                          <td colSpan={7} className="p-4">
                            <div className="bg-white rounded-2xl p-4 border border-indigo-200/80 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Repeat className="w-4 h-4 text-indigo-600" />
                                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                                    Repeated Transactions in {m.displayMonth} (Recurring across 2+ months)
                                  </span>
                                </div>
                                <span className="text-xs font-mono font-bold text-indigo-900">
                                  Total: {formatCurrencyINR(m.repeatedSpending.totalAmount)} ({m.repeatedSpending.count} txns)
                                </span>
                              </div>

                              {m.repeatedSpending.merchants.length === 0 ? (
                                <p className="text-xs text-slate-500 py-2">
                                  No repeated transactions detected in this month.
                                </p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                                  {m.repeatedSpending.merchants.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between"
                                    >
                                      <div className="flex items-start justify-between gap-1.5">
                                        <div>
                                          <div className="font-bold text-slate-900 text-xs truncate">
                                            {item.merchantName}
                                          </div>
                                          <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.2 rounded text-slate-600">
                                              {item.category}
                                            </span>
                                            {item.isSubscription && (
                                              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-semibold">
                                                Monthly Sub
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                          {item.totalMonthsActive} mos active
                                        </span>
                                      </div>

                                      <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
                                        <span className="text-slate-500 text-[11px]">Spent in {m.displayMonth}:</span>
                                        <span className="font-mono font-bold text-indigo-950">
                                          {formatCurrencyINR(item.amountInMonth)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Expandable Row for Total Below 500 */}
                      {isBelow500Open && (
                        <tr className="bg-amber-50/40 border-b border-amber-100">
                          <td colSpan={7} className="p-4">
                            <div className="bg-white rounded-2xl p-4 border border-amber-200/80 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Coins className="w-4 h-4 text-amber-600" />
                                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                                    All Transactions Below ₹500 in {m.displayMonth}
                                  </span>
                                </div>
                                <span className="text-xs font-mono font-bold text-amber-900">
                                  Total: {formatCurrencyINR(m.spentBelow500.totalAmount)} across {m.spentBelow500.count} micro-spends
                                </span>
                              </div>

                              {m.spentBelow500.transactions.length === 0 ? (
                                <p className="text-xs text-slate-500 py-2">
                                  No transactions below ₹500 recorded for this month.
                                </p>
                              ) : (
                                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                                  {m.spentBelow500.transactions.map(tx => (
                                    <div
                                      key={tx.id}
                                      className="p-2.5 rounded-xl border border-slate-200/70 bg-slate-50/40 flex items-center justify-between gap-2 text-xs"
                                    >
                                      <div className="min-w-0 flex items-center gap-2">
                                        <span className="font-mono text-slate-500 text-[11px] shrink-0">
                                          {tx.date}
                                        </span>
                                        <span className="font-semibold text-slate-900 truncate">
                                          {tx.normalizedMerchant}
                                        </span>
                                        <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.2 rounded text-slate-500 shrink-0">
                                          {tx.category}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-3 shrink-0">
                                        <span className="font-mono font-bold text-amber-950">
                                          {formatCurrencyINR(tx.amount)}
                                        </span>
                                        {onInspectTransaction && (
                                          <button
                                            onClick={() => onInspectTransaction(tx)}
                                            className="text-slate-400 hover:text-emerald-700 p-1"
                                            title="Inspect PII redaction"
                                          >
                                            <Eye className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Accordion Card View (Visible on sm and down) */}
          <div className="md:hidden space-y-3">
            {monthlySummaries.map(m => {
              const isSelected = selectedMonthKey === m.monthKey;
              const isSurplus = m.netSavings >= 0;
              const isRepeatedOpen = expandedRepeatedMonth === m.monthKey;
              const isBelow500Open = expandedBelow500Month === m.monthKey;

              return (
                <div
                  key={m.monthKey}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isSelected
                      ? 'bg-emerald-50/50 border-emerald-400 ring-2 ring-emerald-300/30'
                      : 'bg-white border-slate-200/80 shadow-xs'
                  }`}
                >
                  {/* Top Bar: Month + Net Savings */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">
                        {m.displayMonth}
                      </h3>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {m.transactionCount} transactions
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-mono font-bold text-sm ${
                        isSurplus ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {isSurplus ? '+' : ''}{formatCurrencyINR(m.netSavings)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {m.savingsRate.toFixed(1)}% savings
                      </span>
                    </div>
                  </div>

                  {/* Two Key Figures: Credited & Spent */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
                      <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Amount Credited
                      </div>
                      <div className="text-base font-extrabold font-mono text-emerald-900 mt-0.5">
                        {formatCurrencyINR(m.totalCredit)}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/60">
                      <div className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">
                        Amount Spent
                      </div>
                      <div className="text-base font-extrabold font-mono text-slate-900 mt-0.5">
                        {formatCurrencyINR(m.totalDebit)}
                      </div>
                    </div>
                  </div>

                  {/* Under Spent Detail 1: Repeated Transactions Across Months */}
                  <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Repeat className="w-3.5 h-3.5 text-indigo-700" />
                        <span className="text-xs font-bold text-indigo-950">
                          Repeated in this Month
                        </span>
                      </div>
                      <div className="font-mono font-bold text-xs text-indigo-950">
                        {formatCurrencyINR(m.repeatedSpending.totalAmount)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-indigo-800">
                      <span>{m.repeatedSpending.percentageOfDebit}% of total spent</span>
                      <button
                        onClick={() => toggleRepeatedExpansion(m.monthKey)}
                        className="font-semibold underline text-indigo-900 flex items-center gap-0.5"
                      >
                        <span>{isRepeatedOpen ? 'Hide' : `Show ${m.repeatedSpending.merchants.length} Items`}</span>
                        {isRepeatedOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    {isRepeatedOpen && (
                      <div className="pt-2 border-t border-indigo-200/60 space-y-1.5">
                        {m.repeatedSpending.merchants.map((item, idx) => (
                          <div key={idx} className="bg-white p-2 rounded-lg border border-indigo-100 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-semibold text-slate-900">{item.merchantName}</div>
                              <div className="text-[10px] text-slate-500">{item.category} • {item.totalMonthsActive} mos</div>
                            </div>
                            <span className="font-mono font-bold text-indigo-900">
                              {formatCurrencyINR(item.amountInMonth)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Under Spent Detail 2: Spent Below 500 */}
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-amber-700" />
                        <span className="text-xs font-bold text-amber-950">
                          Total Spent Below ₹500
                        </span>
                      </div>
                      <div className="font-mono font-bold text-xs text-amber-950">
                        {formatCurrencyINR(m.spentBelow500.totalAmount)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-amber-900">
                      <span>{m.spentBelow500.count} txns ({m.spentBelow500.percentageOfDebit}% of spent)</span>
                      <button
                        onClick={() => toggleBelow500Expansion(m.monthKey)}
                        className="font-semibold underline text-amber-950 flex items-center gap-0.5"
                      >
                        <span>{isBelow500Open ? 'Hide' : 'Show Transactions'}</span>
                        {isBelow500Open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    {isBelow500Open && (
                      <div className="pt-2 border-t border-amber-200/60 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {m.spentBelow500.transactions.map(tx => (
                          <div key={tx.id} className="bg-white p-2 rounded-lg border border-amber-100 flex items-center justify-between text-xs">
                            <div className="truncate pr-2">
                              <div className="font-semibold text-slate-900 truncate">{tx.normalizedMerchant}</div>
                              <div className="text-[10px] text-slate-500">{tx.date}</div>
                            </div>
                            <span className="font-mono font-bold text-amber-950 shrink-0">
                              {formatCurrencyINR(tx.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Select button */}
                  <button
                    onClick={() => {
                      onSelectMonth(isSelected ? null : m.monthKey);
                      setViewMode('focus');
                    }}
                    className="w-full py-2 text-xs font-semibold text-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                  >
                    {isSelected ? 'Viewing Selected Month' : `Deep Dive into ${m.displayMonth}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 2: SINGLE MONTH DEEP DIVE FOCUS
          ========================================================================= */}
      {viewMode === 'focus' && (
        <div className="space-y-6">
          {/* Month Selector Pills inside Deep Dive */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Select Month to Deep Dive:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {monthlySummaries.map(m => (
                <button
                  key={m.monthKey}
                  onClick={() => onSelectMonth(m.monthKey)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    activeMonth.monthKey === m.monthKey
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {m.displayMonth}
                </button>
              ))}
            </div>
          </div>

          {/* Month Focus Big Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Amount Credited Card */}
            <div className="bg-gradient-to-br from-emerald-50/70 to-white border border-emerald-200/90 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Amount Credited
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2.5">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                  {formatCurrencyINR(activeMonth.totalCredit)}
                </div>
                <div className="text-xs text-emerald-700 mt-1 font-medium">
                  Inflows & salary for {activeMonth.displayMonth}
                </div>
              </div>
            </div>

            {/* Amount Spent Card */}
            <div className="bg-gradient-to-br from-rose-50/70 to-white border border-rose-200/90 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                  Amount Spent
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2.5">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                  {formatCurrencyINR(activeMonth.totalDebit)}
                </div>
                <div className="text-xs text-rose-700 mt-1 font-medium">
                  Total debits for {activeMonth.displayMonth}
                </div>
              </div>
            </div>

            {/* Net Savings */}
            <div className="bg-gradient-to-br from-slate-50/70 to-white border border-slate-200/90 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Net Surplus / Savings
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                  {activeMonth.savingsRate.toFixed(1)}% Rate
                </span>
              </div>
              <div className="mt-2.5">
                <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono ${
                  activeMonth.netSavings >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {activeMonth.netSavings >= 0 ? '+' : ''}{formatCurrencyINR(activeMonth.netSavings)}
                </div>
                <div className="text-xs text-slate-500 mt-1 font-medium">
                  Surplus retained in {activeMonth.displayMonth}
                </div>
              </div>
            </div>
          </div>

          {/* Under Spent Breakdown Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* SUB-SECTION 1: REPEATED TRANSACTIONS IN THIS MONTH */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Repeated Transactions in {activeMonth.displayMonth}
                    </h3>
                    <div className="text-[11px] text-slate-500">
                      Transactions appearing across 2 or more distinct months
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold font-mono text-indigo-950">
                    {formatCurrencyINR(activeMonth.repeatedSpending.totalAmount)}
                  </div>
                  <div className="text-[10px] text-indigo-700 font-bold">
                    {activeMonth.repeatedSpending.percentageOfDebit}% of {activeMonth.displayMonth} spent
                  </div>
                </div>
              </div>

              {/* List of Repeated Merchants for this month */}
              {activeMonth.repeatedSpending.merchants.length === 0 ? (
                <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                  No recurring transactions recorded in this month.
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {activeMonth.repeatedSpending.merchants.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 transition-colors flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {item.merchantName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                            {item.category}
                          </span>
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-medium">
                            {item.totalMonthsActive} active months
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-sm text-indigo-950">
                          {formatCurrencyINR(item.amountInMonth)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.txnCountInMonth} txn{item.txnCountInMonth > 1 ? 's' : ''} in {activeMonth.displayMonth}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SUB-SECTION 2: TOTAL AMOUNT SPENT BELOW 500 IN THIS MONTH */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Total Spent Below ₹500 in {activeMonth.displayMonth}
                    </h3>
                    <div className="text-[11px] text-slate-500">
                      Everyday micro-transactions & small UPI spends
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold font-mono text-amber-950">
                    {formatCurrencyINR(activeMonth.spentBelow500.totalAmount)}
                  </div>
                  <div className="text-[10px] text-amber-800 font-bold">
                    {activeMonth.spentBelow500.percentageOfDebit}% of {activeMonth.displayMonth} spent ({activeMonth.spentBelow500.count} txns)
                  </div>
                </div>
              </div>

              {/* Search Bar for transactions below 500 */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter below ₹500 transactions..."
                  value={below500SearchQuery}
                  onChange={e => setBelow500SearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-amber-500"
                />
              </div>

              {/* Transactions List */}
              {activeMonth.spentBelow500.transactions.length === 0 ? (
                <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                  No transactions below ₹500 recorded for this month.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                  {activeMonth.spentBelow500.transactions
                    .filter(tx => {
                      if (!below500SearchQuery.trim()) return true;
                      const q = below500SearchQuery.toLowerCase();
                      return tx.normalizedMerchant.toLowerCase().includes(q) ||
                        tx.sanitizedNarration.toLowerCase().includes(q) ||
                        String(tx.amount).includes(q);
                    })
                    .map(tx => (
                      <div
                        key={tx.id}
                        className="p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-amber-300 transition-colors flex items-center justify-between gap-2 text-xs shadow-2xs"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
                            {tx.normalizedMerchant}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>{tx.date}</span>
                            <span>•</span>
                            <span className="truncate max-w-[160px]" title={tx.sanitizedNarration}>
                              {tx.sanitizedNarration}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-bold text-amber-950">
                            {formatCurrencyINR(tx.amount)}
                          </span>
                          {onInspectTransaction && (
                            <button
                              onClick={() => onInspectTransaction(tx)}
                              className="text-slate-400 hover:text-emerald-700 p-1"
                              title="Inspect PII redaction"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
