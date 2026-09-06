import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrencyINR } from '../utils/analytics';
import { MonthlySummary } from '../types';

interface MonthSelectorProps {
  monthlySummaries: MonthlySummary[];
  selectedMonthKey: string | null; // null = 'all'
  onSelectMonth: (monthKey: string | null) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  monthlySummaries,
  selectedMonthKey,
  onSelectMonth,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth',
      });
    }
  };

  if (monthlySummaries.length <= 1 && selectedMonthKey === null) {
    return null;
  }

  return (
    <div className="relative bg-white border border-slate-200/80 rounded-2xl p-2 sm:p-2.5 shadow-xs my-4">
      <div className="flex items-center justify-between px-2 pb-1.5 text-xs text-slate-500 font-medium sm:hidden">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          Filter Month:
        </span>
        <span className="text-slate-400">Swipe horizontally</span>
      </div>

      <div className="relative flex items-center">
        {/* Scroll Buttons for desktop */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 mr-1"
          title="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Pills Track */}
        <div
          ref={containerRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 px-0.5 w-full scroll-smooth"
        >
          {/* All Months Pill */}
          <button
            onClick={() => onSelectMonth(null)}
            className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              selectedMonthKey === null
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <span>All Timeline</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              selectedMonthKey === null ? 'bg-slate-800 text-emerald-400' : 'bg-slate-200 text-slate-700'
            }`}>
              {monthlySummaries.length} Mos
            </span>
          </button>

          {/* Individual Month Pills */}
          {monthlySummaries.map(m => {
            const isSelected = selectedMonthKey === m.monthKey;
            const isSurplus = m.netSavings >= 0;

            return (
              <button
                key={m.monthKey}
                onClick={() => onSelectMonth(m.monthKey)}
                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500/30'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{m.displayMonth}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    isSelected
                      ? 'bg-emerald-800 text-emerald-100'
                      : isSurplus
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                  }`}
                >
                  {isSurplus ? '+' : ''}{formatCurrencyINR(m.netSavings)}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => scroll('right')}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 ml-1"
          title="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
