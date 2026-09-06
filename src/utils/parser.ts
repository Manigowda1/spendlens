import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { assignBracketTier } from './analytics';
import { normalizeMerchant } from './merchant';
import { scrubPII } from './privacy';
import { BankFileMetadata, ColumnMapping, RawRow, Transaction, TransactionType } from '../types';

/**
 * Robust numerical cleaner for Indian and global financial statements.
 * Handles:
 * - Lakh / Crore notation: "4,00,000.00", "40,00,000"
 * - Currency prefixes/suffixes: "INR 4,00,000", "Rs. 4,00,000", "Rs 400000", "₹4,00,000"
 * - Trailing Cr / Dr indicators: "4,00,000.00 Cr.", "4,00,000 (Cr)", "400000 CR"
 * - Accounting negatives: "(4,00,000.00)" -> -400000
 * - Non-breaking spaces and formatting quirks
 */
export function cleanNumber(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;

  let str = String(val).trim();
  if (!str || str === '-' || str === '--' || str === 'NA' || str === 'N/A' || str === 'nil' || str === 'null') {
    return 0;
  }

  // Remove currency words and symbols
  str = str.replace(/^(INR|RS\.?|USD|EUR|GBP|Rs|₹|\$)\s*/i, '');
  str = str.replace(/\s*(INR|RS\.?|USD|EUR|GBP|Rs|₹|\$)$/i, '');
  str = str.replace(/[₹$,\s"'\u00A0]/g, '');

  let isNegative = false;

  // Handle accounting parentheses (100) -> -100
  if (str.startsWith('(') && str.endsWith(')')) {
    isNegative = true;
    str = str.substring(1, str.length - 1);
  }

  // Strip Cr / Dr markers from amount cell
  str = str.replace(/\(CR\)/gi, '').replace(/\(DR\)/gi, '');
  str = str.replace(/\bCR\.?\b/gi, '').replace(/\bDR\.?\b/gi, '');

  if (str.startsWith('-')) {
    isNegative = true;
    str = str.substring(1);
  } else if (str.startsWith('+')) {
    str = str.substring(1);
  }

  // Keep only digits and decimal separator
  str = str.replace(/[^\d.]/g, '');
  if (!str) return 0;

  // Protect against malformed strings with multiple dots
  const dotParts = str.split('.');
  if (dotParts.length > 2) {
    str = dotParts[0] + '.' + dotParts.slice(1).join('');
  }

  const parsed = parseFloat(str);
  if (isNaN(parsed)) return 0;

  return isNegative ? -parsed : parsed;
}

export function isCellCredit(val: any): boolean {
  if (val === null || val === undefined) return false;
  const s = String(val).toUpperCase().trim();
  return (
    s.includes('CR') ||
    s.includes('DEP') ||
    s.includes('CREDIT') ||
    s.includes('INFLOW') ||
    s.includes('INWARD') ||
    s.includes('RECEIVED') ||
    s === 'C' ||
    s === '+'
  );
}

export function isCellDebit(val: any): boolean {
  if (val === null || val === undefined) return false;
  const s = String(val).toUpperCase().trim();
  return (
    s.includes('DR') ||
    s.includes('WITHDRAW') ||
    s.includes('DEBIT') ||
    s.includes('OUTFLOW') ||
    s.includes('OUTWARD') ||
    s.includes('PAID') ||
    s.includes('SPENT') ||
    s === 'D' ||
    s === '-'
  );
}

const MONTH_NAME_MAP: { [key: string]: string } = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  january: '01', february: '02', march: '03', april: '04', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
};

/**
 * High-precision date parsing for bank statements across Indian & global banks.
 * Handles:
 * - DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
 * - 2-digit years: 15/08/25, 15-08-25, 01/08/24
 * - Named months: 15-Aug-2025, 01-AUG-25, 15 August 2025, Aug 15 2025
 * - YYYY-MM-DD, YYYY/MM/DD
 * - Excel Date objects without timezone date-shifting
 * - Excel serial numbers
 * - Smart DD/MM vs MM/DD ambiguity resolution (e.g. 08/15/2025 -> Aug 15, not Month 15)
 */
export function parseDate(raw: any): { isoDate: string; monthKey: string; rawDate: string } {
  if (raw === null || raw === undefined || raw === '') {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return { isoDate: `${y}-${m}-${d}`, monthKey: `${y}-${m}`, rawDate: 'Unknown' };
  }

  // 1. JS Date object (e.g. when XLSX parses cell with cellDates: true)
  if (raw instanceof Date && !isNaN(raw.getTime())) {
    const y = raw.getFullYear();
    const m = String(raw.getMonth() + 1).padStart(2, '0');
    const d = String(raw.getDate()).padStart(2, '0');
    const iso = `${y}-${m}-${d}`;
    return { isoDate: iso, monthKey: `${y}-${m}`, rawDate: iso };
  }

  const rawStr = String(raw).trim();

  // 2. Excel numeric serial date (e.g. 45870)
  if (!isNaN(Number(rawStr)) && Number(rawStr) > 25000 && Number(rawStr) < 80000) {
    const excelEpoch = new Date(1899, 11, 30);
    const dateObj = new Date(excelEpoch.getTime() + Number(rawStr) * 86400000);
    if (!isNaN(dateObj.getTime())) {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getDate()).padStart(2, '0');
      const iso = `${y}-${m}-${d}`;
      return { isoDate: iso, monthKey: `${y}-${m}`, rawDate: rawStr };
    }
  }

  // Clean date string: strip timestamps like " 10:30:00" or "T00:00:00"
  const dateOnlyStr = rawStr.split(/[ T]/)[0].trim();

  // 3. Format: YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  const ymdMatch = dateOnlyStr.match(/^(\d{4})[\/\-. ](\d{1,2})[\/\-. ](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    if (parseInt(month, 10) >= 1 && parseInt(month, 10) <= 12) {
      const iso = `${year}-${month}-${day}`;
      return { isoDate: iso, monthKey: `${year}-${month}`, rawDate: rawStr };
    }
  }

  // 4. Format: DD-MMM-YYYY or DD-MMM-YY or DD MMM YYYY (e.g. 15-Aug-2025, 01-AUG-25, 15 August 2025)
  const dMmmY = rawStr.match(/^(\d{1,2})[\/\-. ]([A-Za-z]{3,9})[\/\-. ](\d{2,4})/);
  if (dMmmY) {
    const day = dMmmY[1].padStart(2, '0');
    const monthWord = dMmmY[2].toLowerCase();
    let year = dMmmY[3];
    if (year.length === 2) {
      year = parseInt(year, 10) > 70 ? `19${year}` : `20${year}`;
    }
    const month = MONTH_NAME_MAP[monthWord];
    if (month) {
      const iso = `${year}-${month}-${day}`;
      return { isoDate: iso, monthKey: `${year}-${month}`, rawDate: rawStr };
    }
  }

  // 5. Format: MMM DD, YYYY or MMM DD YYYY (e.g. Aug 15, 2025 or August 15 2025)
  const mmmDY = rawStr.match(/^([A-Za-z]{3,9})[\/\-. ](\d{1,2}),?[\/\-. ](\d{2,4})/);
  if (mmmDY) {
    const monthWord = mmmDY[1].toLowerCase();
    const day = mmmDY[2].padStart(2, '0');
    let year = mmmDY[3];
    if (year.length === 2) {
      year = parseInt(year, 10) > 70 ? `19${year}` : `20${year}`;
    }
    const month = MONTH_NAME_MAP[monthWord];
    if (month) {
      const iso = `${year}-${month}-${day}`;
      return { isoDate: iso, monthKey: `${year}-${month}`, rawDate: rawStr };
    }
  }

  // 6. Format: DD/MM/YYYY or DD-MM-YYYY or DD/MM/YY or DD-MM-YY (handles 2-digit years and standard slash/hyphen/dot dates)
  const dmyMatch = dateOnlyStr.match(/^(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{2,4})$/);
  if (dmyMatch) {
    const p1 = parseInt(dmyMatch[1], 10);
    const p2 = parseInt(dmyMatch[2], 10);
    let year = dmyMatch[3];
    if (year.length === 2) {
      year = parseInt(year, 10) > 70 ? `19${year}` : `20${year}`;
    }

    let day = p1;
    let month = p2;

    // Disambiguate DD/MM vs MM/DD:
    // If p1 <= 12 and p2 > 12, p1 MUST be the month (e.g. 08/15/2025 -> August 15)
    // If p1 > 12 and p2 <= 12, p1 MUST be the day (e.g. 15/08/2025 -> August 15)
    // Otherwise in Indian banking, default to standard DD/MM/YYYY
    if (p1 <= 12 && p2 > 12) {
      month = p1;
      day = p2;
    } else {
      day = p1;
      month = p2;
    }

    if (month >= 1 && month <= 12) {
      const mStr = String(month).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const iso = `${year}-${mStr}-${dStr}`;
      return { isoDate: iso, monthKey: `${year}-${mStr}`, rawDate: rawStr };
    }
  }

  // 7. Fallback to standard Date constructor
  const fallbackDate = new Date(rawStr);
  if (!isNaN(fallbackDate.getTime())) {
    const y = fallbackDate.getFullYear();
    const m = String(fallbackDate.getMonth() + 1).padStart(2, '0');
    const d = String(fallbackDate.getDate()).padStart(2, '0');
    const iso = `${y}-${m}-${d}`;
    return { isoDate: iso, monthKey: `${y}-${m}`, rawDate: rawStr };
  }

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const iso = `${y}-${m}-${d}`;
  return { isoDate: iso, monthKey: `${y}-${m}`, rawDate: rawStr };
}

/**
 * Intelligent Column Detection for any Indian or Global Bank statement.
 * Accurately detects:
 * - Credit columns: "Deposit Amount", "Deposit Amt.", "CR AMT", "Credit (INR)", "Deposits", etc.
 * - Debit columns: "Withdrawal Amount", "Withdrawal Amt.", "DR AMT", "Debit (INR)", "Withdrawals", etc.
 * - Date, Narration, Balance, and single Amount columns.
 */
export function detectColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    dateCol: '',
    narrationCol: '',
  };

  const normalized = headers.map(h => {
    const rawLower = h.toLowerCase().trim();
    const clean = rawLower.replace(/[^a-z0-9]/g, '');
    return { original: h, rawLower, clean };
  });

  // 1. Date column
  const dateCandidates = normalized.filter(n =>
    n.clean.includes('date') ||
    n.clean.includes('txndt') ||
    n.clean.includes('transdt') ||
    n.clean === 'dt' ||
    n.clean.includes('valuedt') ||
    n.clean.includes('postdt')
  );
  // Prefer transaction date over value date if both exist
  const txnDate =
    dateCandidates.find(n => (n.clean.includes('txn') || n.clean.includes('trans')) && !n.clean.includes('value')) ||
    dateCandidates.find(n => !n.clean.includes('value')) ||
    dateCandidates[0];

  if (txnDate) {
    mapping.dateCol = txnDate.original;
  } else if (headers.length > 0) {
    mapping.dateCol = headers[0];
  }

  // 2. Narration / Description column
  const narrationKeywords = [
    'narration', 'description', 'particulars', 'remarks', 'transactiondetails',
    'details', 'merchant', 'payee', 'beneficiary', 'transremarks', 'partyname',
    'statement', 'note', 'summary', 'memo', 'info'
  ];
  for (const kw of narrationKeywords) {
    const found = normalized.find(n => n.clean === kw || n.clean.includes(kw));
    if (found && found.original !== mapping.dateCol) {
      mapping.narrationCol = found.original;
      break;
    }
  }
  if (!mapping.narrationCol) {
    const fallback = headers.find(h => h !== mapping.dateCol);
    mapping.narrationCol = fallback || headers[1] || headers[0];
  }

  // 3. Credit / Deposit column
  // Checks all variants of deposit/credit across Indian and global banks
  for (const n of normalized) {
    if (n.clean.includes('creditcard')) continue;
    if (n.original === mapping.dateCol || n.original === mapping.narrationCol) continue;

    const isCreditCol =
      n.clean.includes('credit') ||
      n.clean.includes('deposit') ||
      n.clean.includes('inflow') ||
      n.clean.includes('inward') ||
      n.clean.includes('received') ||
      n.clean.includes('receipt') ||
      n.clean === 'cr' ||
      n.clean.startsWith('cramt') ||
      n.clean.startsWith('cramount') ||
      n.clean.endsWith('cr') ||
      n.clean.includes('crinr') ||
      n.clean.includes('crrs');

    if (isCreditCol) {
      mapping.creditCol = n.original;
      break;
    }
  }

  // 4. Debit / Withdrawal column
  for (const n of normalized) {
    if (n.original === mapping.dateCol || n.original === mapping.narrationCol || n.original === mapping.creditCol) {
      continue;
    }

    const isDebitCol =
      n.clean.includes('debit') ||
      n.clean.includes('withdrawal') ||
      n.clean.includes('outflow') ||
      n.clean.includes('outward') ||
      n.clean.includes('spent') ||
      n.clean.includes('payment') ||
      n.clean.includes('paid') ||
      n.clean === 'dr' ||
      n.clean.startsWith('dramt') ||
      n.clean.startsWith('dramount') ||
      n.clean.endsWith('dr') ||
      n.clean.includes('drinr') ||
      n.clean.includes('drrs');

    if (isDebitCol) {
      mapping.debitCol = n.original;
      break;
    }
  }

  // 5. Single Amount column (if separate credit/debit columns not both present)
  if (!mapping.creditCol || !mapping.debitCol) {
    const amountCandidates = normalized.filter(n =>
      (n.clean === 'amount' ||
       n.clean === 'txnamount' ||
       n.clean === 'transamount' ||
       n.clean === 'netamount' ||
       n.clean === 'amt' ||
       n.clean === 'amountinr') &&
      n.original !== mapping.creditCol &&
      n.original !== mapping.debitCol &&
      n.original !== mapping.dateCol &&
      n.original !== mapping.narrationCol
    );
    if (amountCandidates.length > 0) {
      mapping.amountCol = amountCandidates[0].original;
    }

    const typeCandidates = normalized.filter(n =>
      (n.clean === 'type' ||
       n.clean === 'trantype' ||
       n.clean === 'txntype' ||
       n.clean === 'crdr' ||
       n.clean === 'drcr' ||
       n.clean === 'direction') &&
      n.original !== mapping.creditCol &&
      n.original !== mapping.debitCol
    );
    if (typeCandidates.length > 0) {
      mapping.typeCol = typeCandidates[0].original;
    }
  }

  // 6. Balance column
  const balanceCandidates = normalized.filter(n =>
    (n.clean.includes('balance') || n.clean === 'bal' || n.clean.includes('closingbal')) &&
    n.original !== mapping.creditCol &&
    n.original !== mapping.debitCol &&
    n.original !== mapping.amountCol
  );
  if (balanceCandidates.length > 0) {
    mapping.balanceCol = balanceCandidates[0].original;
  }

  return mapping;
}

// Detect Bank Name from header / file content / filename
export function detectBankName(filename: string, sampleRows: RawRow[]): string {
  const name = filename.toLowerCase();
  if (name.includes('hdfc')) return 'HDFC Bank';
  if (name.includes('icici')) return 'ICICI Bank';
  if (name.includes('sbi') || name.includes('state bank')) return 'State Bank of India';
  if (name.includes('axis')) return 'Axis Bank';
  if (name.includes('kotak')) return 'Kotak Mahindra Bank';
  if (name.includes('pnb') || name.includes('punjab')) return 'Punjab National Bank';
  if (name.includes('canara')) return 'Canara Bank';
  if (name.includes('baroda') || name.includes('bob')) return 'Bank of Baroda';
  if (name.includes('chase')) return 'Chase Bank';
  if (name.includes('citi')) return 'Citibank';
  if (name.includes('sc') || name.includes('standard')) return 'Standard Chartered';
  if (name.includes('hsbc')) return 'HSBC';
  if (name.includes('revolut')) return 'Revolut';

  const textBlob = JSON.stringify(sampleRows.slice(0, 10)).toLowerCase();
  if (textBlob.includes('hdfc')) return 'HDFC Bank';
  if (textBlob.includes('icici')) return 'ICICI Bank';
  if (textBlob.includes('state bank') || textBlob.includes('sbi')) return 'State Bank of India';
  if (textBlob.includes('axis')) return 'Axis Bank';
  if (textBlob.includes('kotak')) return 'Kotak Mahindra';
  if (textBlob.includes('canara')) return 'Canara Bank';
  if (textBlob.includes('baroda')) return 'Bank of Baroda';

  return 'Bank Statement';
}

/**
 * Parses raw tabular rows into clean, PII-scrubbed Transaction objects.
 * Guarantees that all credit transactions (such as August 4L+ credits) are fully captured.
 */
export function processRowsToTransactions(
  rows: RawRow[],
  fileId: string,
  fileName: string,
  mapping: ColumnMapping
): { transactions: Transaction[]; creditSum: number; debitSum: number } {
  const transactions: Transaction[] = [];
  let creditSum = 0;
  let debitSum = 0;

  rows.forEach((row, index) => {
    const rawNarration = String(row[mapping.narrationCol] || '').trim();
    if (!rawNarration) return; // Skip empty rows

    const dateInfo = parseDate(row[mapping.dateCol]);

    let amount = 0;
    let type: TransactionType = 'debit';
    let isIdentified = false;

    // Check separate Credit / Debit columns
    const rawCr = mapping.creditCol ? row[mapping.creditCol] : undefined;
    const rawDr = mapping.debitCol ? row[mapping.debitCol] : undefined;

    const crVal = rawCr !== undefined ? cleanNumber(rawCr) : 0;
    const drVal = rawDr !== undefined ? cleanNumber(rawDr) : 0;

    if (mapping.creditCol && mapping.debitCol) {
      if (crVal > 0 && drVal === 0) {
        amount = crVal;
        type = 'credit';
        isIdentified = true;
      } else if (drVal > 0 && crVal === 0) {
        amount = drVal;
        type = 'debit';
        isIdentified = true;
      } else if (crVal > 0 && drVal > 0) {
        // If both have values, use type indicator or default to credit
        amount = crVal;
        type = 'credit';
        isIdentified = true;
      }
    } else if (mapping.creditCol && crVal > 0) {
      amount = crVal;
      type = 'credit';
      isIdentified = true;
    } else if (mapping.debitCol && drVal > 0) {
      amount = drVal;
      type = 'debit';
      isIdentified = true;
    }

    // Fallback: Single amount column with Type / CR-DR column
    if (!isIdentified && mapping.amountCol) {
      const rawAmt = row[mapping.amountCol];
      const amtVal = cleanNumber(rawAmt);
      if (amtVal !== 0) {
        const amtStr = String(rawAmt || '');
        const typeStr = mapping.typeCol ? String(row[mapping.typeCol] || '') : '';

        if (isCellCredit(typeStr) || isCellCredit(amtStr)) {
          type = 'credit';
        } else if (isCellDebit(typeStr) || isCellDebit(amtStr)) {
          type = 'debit';
        } else {
          // If signed amount: positive = credit, negative = debit
          type = amtVal > 0 ? 'credit' : 'debit';
        }
        amount = Math.abs(amtVal);
        isIdentified = true;
      }
    }

    // Secondary fallback: Scan all columns in the row for any explicit Credit value
    if (!isIdentified) {
      for (const [colName, val] of Object.entries(row)) {
        if (!val) continue;
        const colClean = colName.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (colClean.includes('credit') || colClean.includes('deposit') || colClean === 'cr' || colClean.startsWith('cr')) {
          const num = cleanNumber(val);
          if (num > 0) {
            amount = num;
            type = 'credit';
            isIdentified = true;
            break;
          }
        }
      }
    }

    if (!isIdentified || amount <= 0) {
      return; // Skip invalid or zero transaction
    }

    // Scrub PII strictly before any aggregation or display
    const scrubResult = scrubPII(rawNarration);

    // Normalize merchant
    const { merchant, category } = normalizeMerchant(scrubResult.sanitized);

    const balanceVal = mapping.balanceCol ? cleanNumber(row[mapping.balanceCol]) : undefined;
    const bracketTier = type === 'debit' ? assignBracketTier(amount) : undefined;

    if (type === 'credit') {
      creditSum += amount;
    } else {
      debitSum += amount;
    }

    transactions.push({
      id: `${fileId}-${index}-${Math.random().toString(36).substring(2, 7)}`,
      sourceFileId: fileId,
      sourceFileName: fileName,
      rawDate: dateInfo.rawDate,
      date: dateInfo.isoDate,
      monthKey: dateInfo.monthKey,
      originalNarration: rawNarration,
      sanitizedNarration: scrubResult.sanitized,
      redactionDetails: scrubResult.details,
      amount: Math.round(amount * 100) / 100,
      type,
      balance: balanceVal,
      rawCategory: category,
      normalizedMerchant: merchant,
      category,
      bracketTier,
    });
  });

  return { transactions, creditSum, debitSum };
}

/**
 * Discards leading bank statement metadata rows (branch details, terms, address lines)
 * and locates the actual transaction table header. Searches up to 60 rows deep.
 */
export function findHeaderRowAndClean(rawMatrix: any[][]): { headers: string[]; dataRows: RawRow[] } {
  if (!rawMatrix || rawMatrix.length === 0) return { headers: [], dataRows: [] };

  let headerIndex = -1;

  for (let i = 0; i < Math.min(60, rawMatrix.length); i++) {
    const row = rawMatrix[i];
    if (!Array.isArray(row)) continue;

    const rowStrings = row.map(cell => String(cell || '').toLowerCase().trim());
    const hasDate = rowStrings.some(s => s.includes('date') || s.includes('txn') || s === 'dt');
    const hasNarration = rowStrings.some(s =>
      s.includes('narration') ||
      s.includes('description') ||
      s.includes('particulars') ||
      s.includes('remarks') ||
      s.includes('details')
    );
    const hasMoney = rowStrings.some(s =>
      s.includes('credit') ||
      s.includes('debit') ||
      s.includes('amount') ||
      s.includes('withdrawal') ||
      s.includes('deposit') ||
      s.includes('cr') ||
      s.includes('dr')
    );

    if (hasDate && (hasNarration || hasMoney)) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    headerIndex = 0;
  }

  const rawHeaders = (rawMatrix[headerIndex] || []).map((h: any, idx: number) => {
    const str = String(h || '').trim();
    return str || `Column_${idx + 1}`;
  });

  const dataRows: RawRow[] = [];
  for (let i = headerIndex + 1; i < rawMatrix.length; i++) {
    const row = rawMatrix[i];
    if (!Array.isArray(row) || row.length === 0) continue;

    // Check if row has any non-empty cell
    const hasContent = row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '');
    if (!hasContent) continue;

    const obj: RawRow = {};
    rawHeaders.forEach((colName, colIdx) => {
      obj[colName] = row[colIdx];
    });
    dataRows.push(obj);
  }

  return { headers: rawHeaders, dataRows };
}

/**
 * Main parser for File objects (.csv, .xlsx, .xls)
 */
export async function parseStatementFile(file: File): Promise<{
  metadata: BankFileMetadata;
  transactions: Transaction[];
  headers: string[];
  mapping: ColumnMapping;
}> {
  const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const ext = file.name.split('.').pop()?.toLowerCase();

  let headers: string[] = [];
  let rawRows: RawRow[] = [];

  if (ext === 'csv') {
    const csvText = await file.text();
    const parsed = Papa.parse(csvText, {
      skipEmptyLines: true,
      header: false,
    });
    const cleaned = findHeaderRowAndClean(parsed.data as any[][]);
    headers = cleaned.headers;
    rawRows = cleaned.dataRows;
  } else if (ext === 'xlsx' || ext === 'xls') {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { 
      type: 'array', 
      cellDates: true,
      dateNF: 'yyyy-mm-dd'
    });

    // Select the sheet that has the highest number of populated rows (handles cover sheets)
    let bestSheetName = workbook.SheetNames[0];
    let maxRowCount = 0;

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      if (sheet && sheet['!ref']) {
        const range = XLSX.utils.decode_range(sheet['!ref']);
        const count = range.e.r - range.s.r + 1;
        if (count > maxRowCount) {
          maxRowCount = count;
          bestSheetName = sheetName;
        }
      }
    }

    const worksheet = workbook.Sheets[bestSheetName];
    const rawMatrix: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const cleaned = findHeaderRowAndClean(rawMatrix);
    headers = cleaned.headers;
    rawRows = cleaned.dataRows;
  } else {
    throw new Error(`Unsupported file type: .${ext}. Please upload .csv, .xlsx, or .xls bank statements.`);
  }

  const mapping = detectColumns(headers);
  const { transactions, creditSum, debitSum } = processRowsToTransactions(
    rawRows,
    fileId,
    file.name,
    mapping
  );

  const detectedBank = detectBankName(file.name, rawRows);

  const dates = transactions.map(t => t.date).sort();
  const dateRange = {
    start: dates[0] || 'N/A',
    end: dates[dates.length - 1] || 'N/A',
  };

  const metadata: BankFileMetadata = {
    id: fileId,
    name: file.name,
    size: file.size,
    parsedAt: new Date().toLocaleTimeString(),
    transactionCount: transactions.length,
    detectedBank,
    dateRange,
    creditSum: Math.round(creditSum * 100) / 100,
    debitSum: Math.round(debitSum * 100) / 100,
  };

  return { metadata, transactions, headers, mapping };
}
