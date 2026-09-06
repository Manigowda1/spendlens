import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Receipt, 
  ShieldCheck, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight,
  Repeat,
  Coins
} from 'lucide-react';
import { formatCurrencyINR } from '../utils/analytics';
import { MonthRepeatedSpending, MonthSpentBelow500 } from '../types';

interface OverviewMetricsProps {
  totalCredit: number;
  totalDebit: number;
  netSavings: number;
  savingsRate: number;
  transactionCount: number;
  totalPiiRedacted: number;
  periodLabel: string;
  repeatedSpending?: MonthRepeatedSpending;
  spentBelow500?: MonthSpentBelow500;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({
  totalCredit,
  totalDebit,
  netSavings,
  savingsRate,
  transactionCount,
  totalPiiRedacted,
  periodLabel,
  repeatedSpending,
  spentBelow500,
}) => {
  const isSurplus = netSavings >= 0;

  return (
    <div className="space-y-3">
      {/* Active Scope Pill */}
      <div className="flex items-center justify-between px-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <span>Overview Analytics</span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 font-medium">
            {periodLabel}
          </span>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          {transactionCount} transactions analyzed
        </div>
      </div>

      {/* Main 3 High-Impact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Earnings (Credit) */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Earnings (Inflow)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {formatCurrencyINR(totalCredit)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-700 font-medium">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Credits & Deposits</span>
            </div>
          </div>
        </div>

        {/* Total Expenditure (Debit) */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs relative overflow-hidden group hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Expenditure (Outflow)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {formatCurrencyINR(totalDebit)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-rose-700 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Debits & Withdrawals</span>
            </div>

            {/* Under Spent Breakdown */}
            {(repeatedSpending || spentBelow500) && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-1.5 text-[11px]">
                {repeatedSpending && (
                  <div className="flex items-center justify-between text-indigo-900 bg-indigo-50/70 px-2.5 py-1 rounded-lg">
                    <span className="flex items-center gap-1 font-semibold">
                      <Repeat className="w-3 h-3 text-indigo-600" />
                      Repeated across months:
                    </span>
                    <span className="font-mono font-bold">
                      {formatCurrencyINR(repeatedSpending.totalAmount)}
                    </span>
                  </div>
                )}
                {spentBelow500 && (
                  <div className="flex items-center justify-between text-amber-900 bg-amber-50/70 px-2.5 py-1 rounded-lg">
                    <span className="flex items-center gap-1 font-semibold">
                      <Coins className="w-3 h-3 text-amber-600" />
                      Spent below ₹500:
                    </span>
                    <span className="font-mono font-bold">
                      {formatCurrencyINR(spentBelow500.totalAmount)} <span className="font-normal text-[10px] text-amber-800">({spentBelow500.count} txns)</span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Net Savings */}
        <div className={`border rounded-3xl p-5 shadow-xs relative overflow-hidden transition-colors ${
          isSurplus
            ? 'bg-gradient-to-br from-emerald-50/60 to-white border-emerald-200/80'
            : 'bg-gradient-to-br from-rose-50/60 to-white border-rose-200/80'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Net Savings (Surplus)</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isSurplus ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono ${
              isSurplus ? 'text-emerald-900' : 'text-rose-900'
            }`}>
              {formatCurrencyINR(netSavings)}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold ${
                isSurplus ? 'bg-emerald-100/80 text-emerald-800' : 'bg-rose-100/80 text-rose-800'
              }`}>
                <Percent className="w-3 h-3" />
                {savingsRate.toFixed(1)}% Savings Rate
              </span>
              <span className="text-slate-500 text-[11px]">of total inflow</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
