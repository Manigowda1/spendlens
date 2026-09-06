import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  ChevronRight, 
  CreditCard, 
  AtSign, 
  Smartphone, 
  FileCode, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { RedactionDetails } from '../types';

interface PrivacyBannerProps {
  redactionTotals: RedactionDetails;
  totalTransactions: number;
  onOpenPrivacyModal: () => void;
  onOpenLiveScrubber: () => void;
}

export const PrivacyBanner: React.FC<PrivacyBannerProps> = ({
  redactionTotals,
  totalTransactions,
  onOpenPrivacyModal,
  onOpenLiveScrubber,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-500/20 relative overflow-hidden my-4">
      {/* Subtle Background Glow Elements */}
      <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -top-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Header & Core Reassurance */}
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Lock className="w-3 h-3 text-emerald-400" />
                Air-Gapped Client-Side Processing
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                0 bytes sent to any external server
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Strict PII Scrubbing Active Before Aggregation
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every bank statement uploaded is parsed in browser memory via JavaScript. Account numbers, card digits, email IDs, UPI handles, and reference tags are masked to <code className="px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-mono text-xs border border-emerald-700/50">[REDACTED]</code> prior to analysis.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <button
              onClick={onOpenLiveScrubber}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md hover:shadow-emerald-500/20 active:scale-95"
            >
              <Eye className="w-4 h-4" />
              <span>Inspect PII Shield</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Redaction Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-white font-mono">
                {redactionTotals.accountOrCardCount}
              </div>
              <div className="text-[11px] text-slate-400 leading-tight">
                Cards / Accounts Masked
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-white font-mono">
                {redactionTotals.upiCount}
              </div>
              <div className="text-[11px] text-slate-400 leading-tight">
                UPI IDs Masked
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <AtSign className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-white font-mono">
                {redactionTotals.emailCount}
              </div>
              <div className="text-[11px] text-slate-400 leading-tight">
                Emails Masked
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-white font-mono">
                {redactionTotals.refTokenCount}
              </div>
              <div className="text-[11px] text-slate-400 leading-tight">
                Ref Tokens Stripped
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
