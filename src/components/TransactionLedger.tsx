import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowDownRight, 
  ArrowUpRight, 
  Eye, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Tag,
  Building2,
  Calendar
} from 'lucide-react';
import { formatCurrencyINR } from '../utils/analytics';
import { Transaction } from '../types';

interface TransactionLedgerProps {
  transactions: Transaction[];
  onInspectTransaction: (tx: Transaction) => void;
  activeBracketFilter: string | null;
  onClearBracketFilter: () => void;
  activeMerchantFilter: string | null;
  onClearMerchantFilter: () => void;
  selectedMonthKey: string | null;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  transactions,
  onInspectTransaction,
  activeBracketFilter,
  onClearBracketFilter,
  activeMerchantFilter,
  onClearMerchantFilter,
  selectedMonthKey,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(transactions.map(t => t.category));
    return Array.from(set).sort();
  }, [transactions]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      // Month filter
      if (selectedMonthKey && tx.monthKey !== selectedMonthKey) {
        return false;
      }

      // Bracket filter
      if (activeBracketFilter && tx.bracketTier !== activeBracketFilter) {
        return false;
      }

      // Merchant filter
      if (activeMerchantFilter && tx.normalizedMerchant.toLowerCase() !== activeMerchantFilter.toLowerCase()) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNarration = tx.sanitizedNarration.toLowerCase().includes(q);
        const matchMerchant = tx.normalizedMerchant.toLowerCase().includes(q);
        const matchAmount = String(tx.amount).includes(q);
        const matchDate = tx.date.includes(q);
        return matchNarration || matchMerchant || matchAmount || matchDate;
      }

      return true;
    });
  }, [
    transactions,
    selectedMonthKey,
    activeBracketFilter,
    activeMerchantFilter,
    typeFilter,
    categoryFilter,
    searchQuery,
  ]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
    onClearBracketFilter();
    onClearMerchantFilter();
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    activeBracketFilter ||
    activeMerchantFilter
  );

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs my-4">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Sanitized Transaction Ledger
          </h3>
          <p className="text-xs text-slate-500">
            All narrations scrubbed of account numbers, cards, emails, and UPI handles before rendering.
          </p>
        </div>

        {/* Count Pill */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold font-mono">
            Showing {filtered.length} of {transactions.length} txns
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl"
            >
              Reset Filters ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search merchant, narration, amount..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>

        {/* Type Filter */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
          <button
            onClick={() => { setTypeFilter('all'); setCurrentPage(1); }}
            className={`flex-1 py-1 rounded-lg transition-colors ${typeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
          >
            All
          </button>
          <button
            onClick={() => { setTypeFilter('debit'); setCurrentPage(1); }}
            className={`flex-1 py-1 rounded-lg transition-colors ${typeFilter === 'debit' ? 'bg-rose-500 text-white shadow-xs' : 'hover:text-slate-900'}`}
          >
            Debits (DR)
          </button>
          <button
            onClick={() => { setTypeFilter('credit'); setCurrentPage(1); }}
            className={`flex-1 py-1 rounded-lg transition-colors ${typeFilter === 'credit' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:text-slate-900'}`}
          >
            Credits (CR)
          </button>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-emerald-500 outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Active Bracket / Filter indicator */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
          {activeBracketFilter && (
            <span className="bg-amber-100 text-amber-900 px-2 py-1 rounded-lg text-[11px] font-semibold truncate flex items-center gap-1">
              Tier: {activeBracketFilter}
              <button onClick={onClearBracketFilter}>✕</button>
            </span>
          )}
          {activeMerchantFilter && (
            <span className="bg-emerald-100 text-emerald-900 px-2 py-1 rounded-lg text-[11px] font-semibold truncate flex items-center gap-1">
              {activeMerchantFilter}
              <button onClick={onClearMerchantFilter}>✕</button>
            </span>
          )}
        </div>
      </div>

      {/* Responsive Table / Card View */}
      {paginated.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          No transactions match the selected filters. Try clearing filters or search terms.
        </div>
      ) : (
        <>
          {/* Mobile Card List (visible on sm and down) */}
          <div className="sm:hidden space-y-2.5">
            {paginated.map(tx => (
              <div
                key={tx.id}
                onClick={() => onInspectTransaction(tx)}
                className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 space-y-2 active:bg-slate-100 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-xs text-slate-900">
                      {tx.normalizedMerchant}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span className="px-1.5 py-0.2 bg-white rounded border border-slate-200 text-slate-600">
                        {tx.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`font-mono font-bold text-sm ${
                      tx.type === 'credit' ? 'text-emerald-700' : 'text-slate-900'
                    }`}>
                      {tx.type === 'credit' ? '+' : '-'}{formatCurrencyINR(tx.amount)}
                    </div>
                    <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                      tx.type === 'credit' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {tx.type.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Sanitized Narration */}
                <div className="text-[11px] font-mono text-slate-600 bg-white p-2 rounded-xl border border-slate-200/70 break-all flex items-center justify-between gap-2">
                  <span className="truncate">{tx.sanitizedNarration}</span>
                  {tx.redactionDetails.totalTokensRedacted > 0 && (
                    <span className="shrink-0 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded-full font-semibold">
                      {tx.redactionDetails.totalTokensRedacted} scrubbed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop & Tablet Table (visible on sm and up) with horizontal scroll */}
          <div className="hidden sm:block overflow-x-auto border border-slate-200/80 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3.5">Date</th>
                  <th className="py-3 px-3.5">Merchant / Entity</th>
                  <th className="py-3 px-3.5">Category</th>
                  <th className="py-3 px-3.5">Scrubbed Narration (Zero PII)</th>
                  <th className="py-3 px-3.5 text-right">Amount (INR)</th>
                  <th className="py-3 px-3.5 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map(tx => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3 px-3.5 font-mono text-slate-600 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">
                        {tx.normalizedMerchant}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        {tx.sourceFileName}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 font-mono text-[11px] max-w-xs truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate" title={tx.sanitizedNarration}>
                          {tx.sanitizedNarration}
                        </span>
                        {tx.redactionDetails.totalTokensRedacted > 0 && (
                          <span className="shrink-0 px-1.5 py-0.2 text-[10px] rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-sans font-semibold" title={`${tx.redactionDetails.totalTokensRedacted} sensitive tokens redacted`}>
                            Scrubbed
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <div className={`font-mono font-bold text-xs ${
                        tx.type === 'credit' ? 'text-emerald-700' : 'text-slate-900'
                      }`}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrencyINR(tx.amount)}
                      </div>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                        tx.type === 'credit' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {tx.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => onInspectTransaction(tx)}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Inspect PII redaction details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <div>
                Page <span className="font-semibold text-slate-800">{currentPage}</span> of{' '}
                <span className="font-semibold text-slate-800">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
