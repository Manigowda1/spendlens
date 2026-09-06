import React from 'react';
import { Layers, Coffee, Zap, ChevronRight, Check } from 'lucide-react';
import { formatCurrencyINR } from '../utils/analytics';
import { SpendingBracket } from '../types';

interface SpendingBracketsViewProps {
  brackets: SpendingBracket[];
  totalDebit: number;
  activeBracketFilter: string | null;
  onSelectBracket: (bracketId: string | null) => void;
  periodLabel: string;
}

export const SpendingBracketsView: React.FC<SpendingBracketsViewProps> = ({
  brackets,
  totalDebit,
  activeBracketFilter,
  onSelectBracket,
  periodLabel,
}) => {
  const lowerBrackets = brackets.filter(b => b.tierGroup === 'lower');
  const higherBrackets = brackets.filter(b => b.tierGroup === 'higher');

  const lowerTotal = lowerBrackets.reduce((sum, b) => sum + b.totalAmount, 0);
  const higherTotal = higherBrackets.reduce((sum, b) => sum + b.totalAmount, 0);

  const lowerPct = totalDebit > 0 ? (lowerTotal / totalDebit) * 100 : 0;
  const higherPct = totalDebit > 0 ? (higherTotal / totalDebit) * 100 : 0;

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs my-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              Debit Transaction Spending Brackets
            </h3>
            {activeBracketFilter && (
              <button
                onClick={() => onSelectBracket(null)}
                className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                Reset Filter ✕
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Categorization of debits into lower (daily/micro) and higher (major/commitments) spending tiers for <span className="font-semibold text-slate-700">{periodLabel}</span>.
          </p>
        </div>

        {/* Macro split pill */}
        <div className="flex items-center gap-2 text-xs">
          <div className="bg-amber-50 text-amber-900 border border-amber-200/70 px-2.5 py-1 rounded-xl">
            <span className="font-medium text-amber-700">Lower Tiers:</span>{' '}
            <span className="font-mono font-bold">{lowerPct.toFixed(0)}%</span> ({formatCurrencyINR(lowerTotal)})
          </div>
          <div className="bg-indigo-50 text-indigo-900 border border-indigo-200/70 px-2.5 py-1 rounded-xl">
            <span className="font-medium text-indigo-700">Higher Tiers:</span>{' '}
            <span className="font-mono font-bold">{higherPct.toFixed(0)}%</span> ({formatCurrencyINR(higherTotal)})
          </div>
        </div>
      </div>

      {/* Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
        {/* Lower Transaction Brackets Section */}
        <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Coffee className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Lower Transaction Brackets
                </h4>
                <div className="text-[11px] text-slate-500">Daily UPI, food, groceries & transit</div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-slate-800">
              {formatCurrencyINR(lowerTotal)}
            </span>
          </div>

          {/* Lower Tiers List */}
          <div className="space-y-2 pt-1">
            {lowerBrackets.map(tier => {
              const isSelected = activeBracketFilter === tier.id;

              return (
                <div
                  key={tier.id}
                  onClick={() => onSelectBracket(isSelected ? null : tier.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-300/40'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-600 ring-4 ring-amber-200' : 'bg-amber-400'}`} />
                      <span className="text-xs font-semibold text-slate-800">
                        {tier.label}
                      </span>
                      <span className="text-[10px] text-slate-400 px-1.5 py-0.2 rounded-md bg-slate-100 font-mono">
                        {tier.count} txns
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-slate-900">
                        {formatCurrencyINR(tier.totalAmount)}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 w-10 text-right">
                        {tier.percentageOfDebit}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, tier.percentageOfDebit)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Higher Transaction Brackets Section */}
        <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Higher Transaction Brackets
                </h4>
                <div className="text-[11px] text-slate-500">Rent, SIPs, utilities, gadgets & travel</div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-slate-800">
              {formatCurrencyINR(higherTotal)}
            </span>
          </div>

          {/* Higher Tiers List */}
          <div className="space-y-2 pt-1">
            {higherBrackets.map(tier => {
              const isSelected = activeBracketFilter === tier.id;

              return (
                <div
                  key={tier.id}
                  onClick={() => onSelectBracket(isSelected ? null : tier.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/90 border-indigo-400 ring-2 ring-indigo-300/40'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-indigo-600 ring-4 ring-indigo-200' : 'bg-indigo-400'}`} />
                      <span className="text-xs font-semibold text-slate-800">
                        {tier.label}
                      </span>
                      <span className="text-[10px] text-slate-400 px-1.5 py-0.2 rounded-md bg-slate-100 font-mono">
                        {tier.count} txns
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-slate-900">
                        {formatCurrencyINR(tier.totalAmount)}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 w-10 text-right">
                        {tier.percentageOfDebit}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, tier.percentageOfDebit)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
