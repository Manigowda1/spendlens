import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Eye, 
  ArrowRight, 
  CheckCircle2, 
  CreditCard, 
  AtSign, 
  Smartphone, 
  FileCode,
  Sparkles
} from 'lucide-react';
import { scrubPII } from '../utils/privacy';
import { Transaction } from '../types';

interface PiiInspectorModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const PiiInspectorModal: React.FC<PiiInspectorModalProps> = ({
  transaction,
  onClose,
}) => {
  const [testInput, setTestInput] = useState(
    'UPI/DR/1029482019/landlord.sharma@oksbi/House Rent Oct/501004829184/CARD 4129-8492-0194-8192/REF:948201/UPI/CR/12345/'
  );

  const testResult = scrubPII(testInput);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Client-Side PII Scrubbing Inspector
              </h3>
              <p className="text-xs text-slate-500">
                Inspect how sensitive information is masked before reaching the dashboard.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If viewing a specific transaction */}
        {transaction && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Selected Transaction: {transaction.date}</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {transaction.normalizedMerchant} ({transaction.category})
              </span>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Original Bank Narration (Scrubbed in RAM)
              </div>
              <div className="p-2.5 bg-rose-50/70 border border-rose-200/70 rounded-xl font-mono text-xs text-rose-900 break-all">
                {transaction.originalNarration}
              </div>
            </div>

            <div className="flex items-center justify-center text-slate-400">
              <ArrowRight className="w-4 h-4 rotate-90 sm:rotate-0" />
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Sanitized Narration (Displayed & Exported)
              </div>
              <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl font-mono text-xs text-emerald-900 break-all">
                {transaction.sanitizedNarration}
              </div>
            </div>

            {/* Redaction breakdown */}
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-600 flex-wrap">
              <span className="font-semibold text-slate-700">Masked tokens:</span>
              <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                💳 Cards/Accounts: {transaction.redactionDetails.accountOrCardCount}
              </span>
              <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                📱 UPI IDs: {transaction.redactionDetails.upiCount}
              </span>
              <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                ✉️ Emails: {transaction.redactionDetails.emailCount}
              </span>
              <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                🏷️ Ref Tokens: {transaction.redactionDetails.refTokenCount}
              </span>
            </div>
          </div>
        )}

        {/* Interactive Regex Sandbox */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Live PII Masking Simulator
            </span>
            <span className="text-[11px] text-slate-400">Type or paste any test narration</span>
          </div>

          <textarea
            rows={2}
            value={testInput}
            onChange={e => setTestInput(e.target.value)}
            className="w-full p-3 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            placeholder="Enter a test bank narration containing cards, accounts, emails, or UPI handles..."
          />

          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1">
            <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              Scrubbed Output:
            </div>
            <div className="font-mono text-xs text-emerald-950 font-medium break-all">
              {testResult.sanitized || '(Empty)'}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-between">
              <span>Card/Accounts:</span>
              <span className="font-bold font-mono">{testResult.details.accountOrCardCount}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-between">
              <span>UPI Handles:</span>
              <span className="font-bold font-mono">{testResult.details.upiCount}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-between">
              <span>Email IDs:</span>
              <span className="font-bold font-mono">{testResult.details.emailCount}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-between">
              <span>Ref Tokens:</span>
              <span className="font-bold font-mono">{testResult.details.refTokenCount}</span>
            </div>
          </div>
        </div>

        {/* Close button */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
