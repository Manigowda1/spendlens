import React, { useRef, useState } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Building2, 
  Calendar, 
  ArrowDownRight, 
  ArrowUpRight,
  Plus,
  Loader2,
  X
} from 'lucide-react';
import { parseStatementFile } from '../utils/parser';
import { formatCurrencyINR } from '../utils/analytics';
import { BankFileMetadata, Transaction } from '../types';

interface FileUploadSectionProps {
  files: BankFileMetadata[];
  onAddFiles: (newFiles: BankFileMetadata[], newTransactions: Transaction[]) => void;
  onRemoveFile: (fileId: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  files,
  onAddFiles,
  onRemoveFile,
  onClose,
  isModal = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processingStats, setProcessingStats] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingStats(`Ingesting and scrubbing ${fileList.length} statement(s)...`);

    const newMetadataList: BankFileMetadata[] = [];
    const newTransactionsList: Transaction[] = [];
    const errors: string[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setProcessingStats(`Processing (${i + 1}/${fileList.length}): ${file.name}`);

      try {
        const result = await parseStatementFile(file);
        newMetadataList.push(result.metadata);
        newTransactionsList.push(...result.transactions);
      } catch (err: any) {
        console.error(`Error parsing file ${file.name}:`, err);
        errors.push(`${file.name}: ${err.message || 'Failed to parse'}`);
      }
    }

    setIsProcessing(false);
    setProcessingStats(null);

    if (errors.length > 0) {
      setErrorMessage(errors.join(' | '));
    }

    if (newMetadataList.length > 0) {
      onAddFiles(newMetadataList, newTransactionsList);
      if (isModal && onClose && errors.length === 0) {
        onClose();
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className={`bg-white rounded-3xl ${isModal ? 'p-6' : 'p-5 sm:p-6 border border-slate-200/80 shadow-xs'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-emerald-600" />
            Bank Statements Ingestion
          </h3>
          <p className="text-xs text-slate-500">
            Upload 3 or more bank statements simultaneously (.csv, .xlsx, .xls). Processed client-side only.
          </p>
        </div>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Drag & Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/60 scale-[0.99]'
            : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/20'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />

        {isProcessing ? (
          <div className="py-4 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <div className="text-sm font-semibold text-slate-800">{processingStats}</div>
            <div className="text-xs text-slate-500">Client-side scrubbing in progress...</div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-900">
                Tap or drag files here to analyze
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Supports HDFC, ICICI, SBI, Axis, Kotak & global statements in <span className="font-semibold text-slate-700">.CSV, .XLSX, .XLS</span>
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-700 font-medium bg-emerald-50/80 px-3 py-1 rounded-full border border-emerald-200/50">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Flexible column mapping (Auto-detects Date, Narration, CR, DR)
            </div>
          </div>
        )}
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Uploaded Files Grid */}
      {files.length > 0 && (
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ingested Statements ({files.length})
            </span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add More Files
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map(file => (
              <div
                key={file.id}
                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col justify-between relative group hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-900 truncate">
                          {file.detectedBank}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate" title={file.name}>
                          {file.name}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveFile(file.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                      title="Remove statement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {file.dateRange.start} → {file.dateRange.end}
                    </span>
                    <span className="font-mono text-xs font-medium text-slate-700">
                      {file.transactionCount} rows
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-medium inline-flex items-center gap-0.5">
                    <ArrowDownRight className="w-3 h-3" />
                    {formatCurrencyINR(file.creditSum)}
                  </span>
                  <span className="text-rose-700 font-medium inline-flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" />
                    {formatCurrencyINR(file.debitSum)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
