import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Cpu, 
  Database, 
  WifiOff, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface PrivacyArchitectureModalProps {
  onClose: () => void;
  onOpenLiveScrubber: () => void;
}

export const PrivacyArchitectureModal: React.FC<PrivacyArchitectureModalProps> = ({
  onClose,
  onOpenLiveScrubber,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Zero-Cloud Privacy Guarantee
              </h3>
              <p className="text-xs text-slate-500">
                How SpendLens ensures your financial data never leaves your device.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/70">
            <Cpu className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 text-xs">100% In-Browser Computation</div>
              <div>PapaParse (for CSV) and SheetJS (for Excel) execute strictly within your local browser's JavaScript sandbox. No bank files are uploaded to any server or remote storage.</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <Lock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 text-xs">Immediate PII Scrubbing</div>
              <div>Before calculating any monthly earnings, debits, or spending brackets, all 10-16 digit account/card numbers, email addresses, UPI handles, and trailing reference tokens are scrubbed to <span className="font-mono text-emerald-700">[REDACTED]</span>.</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <WifiOff className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 text-xs">Works Fully Offline</div>
              <div>You can even disconnect your internet connection or turn on airplane mode after loading SpendLens and process your statements completely offline.</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <Database className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 text-xs">Transient Session Memory</div>
              <div>Data stays exclusively in active browser memory during your session. Closing or refreshing the tab clears all statement data immediately.</div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenLiveScrubber();
            }}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Test PII Masking Engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
