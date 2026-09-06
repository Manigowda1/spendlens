import React from 'react';
import { 
  Repeat, 
  CalendarCheck, 
  TrendingDown, 
  Tag, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { formatCurrencyINR } from '../utils/analytics';
import { RecurringMerchantSummary } from '../types';

interface RecurringSectionProps {
  recurringMerchants: RecurringMerchantSummary[];
  selectedMerchantFilter: string | null;
  onSelectMerchant: (merchantName: string | null) => void;
}

export const RecurringSection: React.FC<RecurringSectionProps> = ({
  recurringMerchants,
  selectedMerchantFilter,
  onSelectMerchant,
}) => {
  if (recurringMerchants.length === 0) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs my-4 text-center">
        <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
          <Repeat className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800">No Recurring Transactions Detected Yet</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Upload statements covering at least 2 distinct calendar months to automatically detect recurring subscriptions, rent, and monthly commitments.
        </p>
      </div>
    );
  }

  // Calculate total monthly recurring commitment
  const totalMonthlyBurden = recurringMerchants.reduce((sum, r) => sum + r.averageMonthlySpend, 0);
  const totalSpendAll = recurringMerchants.reduce((sum, r) => sum + r.totalSpent, 0);

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs my-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Repeat className="w-5 h-5 text-emerald-600" />
              Recurring Commitments & Subscriptions
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {recurringMerchants.length} Detected
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Transactions appearing across 2 or more distinct calendar months (rent, SIPs, utilities, streaming).
          </p>
        </div>

        {/* Total Monthly Commitment Pill */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide">
              Est. Monthly Recurring Burden
            </div>
            <div className="text-lg font-extrabold text-slate-900 font-mono">
              {formatCurrencyINR(totalMonthlyBurden)}
              <span className="text-xs font-normal text-slate-500">/mo</span>
            </div>
          </div>
        </div>
      </div>

      {selectedMerchantFilter && (
        <div className="mb-3 flex items-center gap-2 text-xs">
          <span className="text-slate-500">Filtered by merchant:</span>
          <span className="font-semibold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
            {selectedMerchantFilter}
          </span>
          <button
            onClick={() => onSelectMerchant(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
          >
            Clear ✕
          </button>
        </div>
      )}

      {/* Touch-Friendly Responsive Card Grid & Table */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
        {recurringMerchants.map(item => {
          const isSelected = selectedMerchantFilter === item.merchantDisplayName;

          return (
            <div
              key={item.merchantKey}
              onClick={() => onSelectMerchant(isSelected ? null : item.merchantDisplayName)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-300/40'
                  : 'bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div>
                {/* Merchant Name & Category */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {item.merchantDisplayName}
                    </h4>
                    <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-medium text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                      {item.isSubscription && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded-md">
                          Monthly
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 shrink-0">
                    {item.activeMonthsCount} mos
                  </span>
                </div>

                {/* Sample Scrubbed Narration snippet */}
                <div className="mt-2.5 text-[11px] text-slate-500 truncate font-mono bg-white/70 px-2 py-1 rounded-md border border-slate-200/60" title={item.sampleNarration}>
                  {item.sampleNarration}
                </div>
              </div>

              {/* Financial Metrics */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">Average / Month</div>
                  <div className="font-mono font-bold text-slate-900">
                    {formatCurrencyINR(item.averageMonthlySpend)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Total ({item.frequencyCount} txns)</div>
                  <div className="font-mono font-bold text-emerald-700">
                    {formatCurrencyINR(item.totalSpent)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
