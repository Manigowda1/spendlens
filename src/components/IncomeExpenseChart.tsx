import React, { useState } from 'react';
import { BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrencyINR } from '../utils/analytics';
import { MonthlySummary } from '../types';

interface IncomeExpenseChartProps {
  monthlySummaries: MonthlySummary[];
  selectedMonthKey: string | null;
  onSelectMonth: (monthKey: string) => void;
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({
  monthlySummaries,
  selectedMonthKey,
  onSelectMonth,
}) => {
  const [hoveredMonth, setHoveredMonth] = useState<MonthlySummary | null>(null);

  if (monthlySummaries.length === 0) return null;

  // Compute maximum value for chart scaling
  const maxVal = Math.max(
    ...monthlySummaries.map(m => Math.max(m.totalCredit, m.totalDebit)),
    1000
  );

  const chartHeight = 220;
  const paddingBottom = 40;
  const usableHeight = chartHeight - paddingBottom;

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs my-4">
      {/* Chart Title & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Monthly Cashflow: Earnings vs Expenditure
          </h3>
          <p className="text-xs text-slate-500">
            Compare monthly inflows against debits and track net savings trajectory.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-md bg-emerald-500" />
            <span>Earnings (Credit)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-md bg-rose-500" />
            <span>Expenditure (Debit)</span>
          </div>
        </div>
      </div>

      {/* Chart Area with Horizontal Scroll on Mobile if needed */}
      <div className="overflow-x-auto no-scrollbar">
        <div className="min-w-[480px] sm:min-w-0">
          {/* SVG Bars & Grid */}
          <div className="relative" style={{ height: `${chartHeight}px` }}>
            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = usableHeight * (1 - ratio);
              const gridVal = maxVal * ratio;
              return (
                <div
                  key={idx}
                  className="absolute left-0 right-0 border-b border-slate-100 flex items-center justify-end pr-2 text-[10px] text-slate-400 font-mono pointer-events-none"
                  style={{ top: `${y}px` }}
                >
                  {formatCurrencyINR(gridVal)}
                </div>
              );
            })}

            {/* Bars Container */}
            <div className="absolute inset-0 flex items-end justify-around px-4 pb-10">
              {monthlySummaries.map(m => {
                const creditHeight = Math.max(4, (m.totalCredit / maxVal) * usableHeight);
                const debitHeight = Math.max(4, (m.totalDebit / maxVal) * usableHeight);
                const isSelected = selectedMonthKey === m.monthKey;
                const isHovered = hoveredMonth?.monthKey === m.monthKey;

                return (
                  <div
                    key={m.monthKey}
                    onClick={() => onSelectMonth(m.monthKey)}
                    onMouseEnter={() => setHoveredMonth(m)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    className={`flex flex-col items-center cursor-pointer group px-2 py-1 rounded-2xl transition-all ${
                      isSelected ? 'bg-emerald-50/70 ring-2 ring-emerald-500/20' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Double Bars */}
                    <div className="flex items-end gap-2.5 h-[170px]">
                      {/* Credit Bar */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-6 sm:w-8 rounded-t-lg transition-all duration-300 relative ${
                            isSelected || isHovered ? 'bg-emerald-600 shadow-md' : 'bg-emerald-500'
                          }`}
                          style={{ height: `${creditHeight}px` }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-mono text-[9px] px-1.5 py-0.5 rounded shadow-md pointer-events-none whitespace-nowrap z-20">
                            {formatCurrencyINR(m.totalCredit)}
                          </div>
                        </div>
                      </div>

                      {/* Debit Bar */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-6 sm:w-8 rounded-t-lg transition-all duration-300 relative ${
                            isSelected || isHovered ? 'bg-rose-600 shadow-md' : 'bg-rose-500'
                          }`}
                          style={{ height: `${debitHeight}px` }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-mono text-[9px] px-1.5 py-0.5 rounded shadow-md pointer-events-none whitespace-nowrap z-20">
                            {formatCurrencyINR(m.totalDebit)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Month Label */}
                    <div className="mt-2 text-center">
                      <div className={`text-xs font-semibold ${isSelected ? 'text-emerald-800' : 'text-slate-700'}`}>
                        {m.displayMonth.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {m.displayMonth.split(' ')[1]}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Hovered Month Quick Insight Card */}
      {hoveredMonth && (
        <div className="mt-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div className="font-semibold text-slate-900">
            {hoveredMonth.displayMonth} Cashflow Breakdown:
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span className="text-emerald-700 font-medium">
              Credits: {formatCurrencyINR(hoveredMonth.totalCredit)}
            </span>
            <span className="text-rose-700 font-medium">
              Debits: {formatCurrencyINR(hoveredMonth.totalDebit)}
            </span>
            <span className={`font-bold ${hoveredMonth.netSavings >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
              Savings: {formatCurrencyINR(hoveredMonth.netSavings)} ({hoveredMonth.savingsRate}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
