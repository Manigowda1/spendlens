export type TransactionType = 'credit' | 'debit';

export interface RawRow {
  [key: string]: any;
}

export interface RedactionDetails {
  accountOrCardCount: number;
  emailCount: number;
  upiCount: number;
  refTokenCount: number;
  totalTokensRedacted: number;
}

export interface Transaction {
  id: string;
  sourceFileId: string;
  sourceFileName: string;
  rawDate: string;
  date: string; // ISO YYYY-MM-DD
  monthKey: string; // YYYY-MM
  originalNarration: string;
  sanitizedNarration: string;
  redactionDetails: RedactionDetails;
  amount: number;
  type: TransactionType;
  balance?: number;
  rawCategory: string;
  normalizedMerchant: string;
  category: string;
  bracketTier?: string;
}

export interface BankFileMetadata {
  id: string;
  name: string;
  size: number;
  parsedAt: string;
  transactionCount: number;
  detectedBank: string;
  dateRange: { start: string; end: string };
  creditSum: number;
  debitSum: number;
}

export interface SpendingBracket {
  id: string;
  tierGroup: 'lower' | 'higher';
  label: string;
  min: number;
  max: number | null; // null for > 20000
  totalAmount: number;
  count: number;
  percentageOfDebit: number;
}

export interface RecurringMerchantSummary {
  merchantKey: string;
  merchantDisplayName: string;
  category: string;
  frequencyCount: number;
  activeMonthsCount: number;
  activeMonths: string[]; // ['2026-01', '2026-02']
  totalSpent: number;
  averageMonthlySpend: number;
  lastSeenDate: string;
  isSubscription: boolean;
  sampleNarration: string;
}

export interface MonthRepeatedMerchant {
  merchantName: string;
  category: string;
  amountInMonth: number;
  txnCountInMonth: number;
  totalMonthsActive: number;
  isSubscription: boolean;
  sampleNarration: string;
}

export interface MonthSpentBelow500 {
  totalAmount: number;
  count: number;
  percentageOfDebit: number;
  transactions: Transaction[];
}

export interface MonthRepeatedSpending {
  totalAmount: number;
  count: number;
  percentageOfDebit: number;
  merchants: MonthRepeatedMerchant[];
}

export interface MonthlySummary {
  monthKey: string; // '2026-01'
  displayMonth: string; // 'Jan 2026'
  totalCredit: number;
  totalDebit: number;
  netSavings: number;
  savingsRate: number; // percentage
  transactionCount: number;
  brackets: SpendingBracket[];
  spentBelow500: MonthSpentBelow500;
  repeatedSpending: MonthRepeatedSpending;
}

export interface GlobalAnalytics {
  totalCredit: number;
  totalDebit: number;
  netSavings: number;
  overallSavingsRate: number;
  totalTransactions: number;
  totalFilesParsed: number;
  totalPiiRedacted: number;
  monthsCount: number;
  lowerBracketTotal: number;
  higherBracketTotal: number;
  recurringCommitmentMonthlyAvg: number;
  totalSpentBelow500: MonthSpentBelow500;
  totalRepeatedSpending: MonthRepeatedSpending;
}

export interface ColumnMapping {
  dateCol: string;
  narrationCol: string;
  creditCol?: string;
  debitCol?: string;
  amountCol?: string;
  typeCol?: string;
  balanceCol?: string;
}
