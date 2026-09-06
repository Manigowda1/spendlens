import { MonthlySummary, RecurringMerchantSummary, Transaction } from '../types';

export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports monthly breakdown and spending bracket summaries as CSV
 */
export function exportMonthlySummaryCSV(monthlySummaries: MonthlySummary[], recurring: RecurringMerchantSummary[]) {
  const rows: string[][] = [
    ['--- SPENDLENS MONTHLY SPENDING & EARNINGS SUMMARY ---'],
    ['Generated via SpendLens (100% Client-Side Private Processing)'],
    ['Month', 'Total Earnings (Credit)', 'Total Expenditure (Debit)', 'Net Savings', 'Savings Rate (%)', 'Txn Count'],
  ];

  for (const m of monthlySummaries) {
    rows.push([
      m.displayMonth,
      m.totalCredit.toFixed(2),
      m.totalDebit.toFixed(2),
      m.netSavings.toFixed(2),
      `${m.savingsRate.toFixed(1)}%`,
      String(m.transactionCount),
    ]);
  }

  rows.push([]);
  rows.push(['--- MONTHLY SPENDING BRACKETS BREAKDOWN (DEBIT TIERS) ---']);
  rows.push(['Month', 'Bracket Tier', 'Group', 'Total Spent (INR)', 'Txn Count', '% of Monthly Debit']);

  for (const m of monthlySummaries) {
    for (const b of m.brackets) {
      rows.push([
        m.displayMonth,
        b.label,
        b.tierGroup === 'lower' ? 'Lower (< ₹2,000)' : 'Higher (>= ₹2,000)',
        b.totalAmount.toFixed(2),
        String(b.count),
        `${b.percentageOfDebit.toFixed(1)}%`,
      ]);
    }
  }

  rows.push([]);
  rows.push(['--- RECURRING MERCHANT & COMMITMENT INTELLIGENCE ---']);
  rows.push(['Merchant', 'Category', 'Total Spent (INR)', 'Active Months Count', 'Avg Monthly Spend (INR)', 'Frequency', 'Last Seen']);

  for (const r of recurring) {
    rows.push([
      r.merchantDisplayName,
      r.category,
      r.totalSpent.toFixed(2),
      String(r.activeMonthsCount),
      r.averageMonthlySpend.toFixed(2),
      String(r.frequencyCount),
      r.lastSeenDate,
    ]);
  }

  const csvContent = rows
    .map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `spendlens-scrubbed-monthly-summary-${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Exports full scrubbed transaction ledger as CSV
 */
export function exportScrubbedLedgerCSV(transactions: Transaction[]) {
  const headers = [
    'Date',
    'Normalized Merchant',
    'Category',
    'Type',
    'Amount (INR)',
    'Spending Bracket Tier',
    'PII-Scrubbed Narration',
    'Tokens Redacted',
    'Source Statement',
  ];

  const rows: string[][] = [headers];

  for (const t of transactions) {
    rows.push([
      t.date,
      t.normalizedMerchant,
      t.category,
      t.type.toUpperCase(),
      t.amount.toFixed(2),
      t.bracketTier || 'N/A',
      t.sanitizedNarration,
      String(t.redactionDetails.totalTokensRedacted),
      t.sourceFileName,
    ]);
  }

  const csvContent = rows
    .map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `spendlens-scrubbed-transactions-${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Exports complete JSON archive with scrubbing statistics
 */
export function exportScrubbedJSON(
  transactions: Transaction[],
  monthlySummaries: MonthlySummary[],
  recurring: RecurringMerchantSummary[]
) {
  const payload = {
    exportedAt: new Date().toISOString(),
    generator: 'SpendLens Private Statement Analyzer',
    privacyNotice: 'Zero server uploads. All data parsed client-side and sanitized of PII.',
    summary: {
      totalTransactions: transactions.length,
      totalPIIRedactedCount: transactions.reduce((acc, t) => acc + t.redactionDetails.totalTokensRedacted, 0),
    },
    monthlyBreakdown: monthlySummaries,
    recurringMerchants: recurring,
    transactions: transactions.map(t => ({
      id: t.id,
      date: t.date,
      merchant: t.normalizedMerchant,
      category: t.category,
      type: t.type,
      amount: t.amount,
      spendingBracket: t.bracketTier,
      scrubbedNarration: t.sanitizedNarration,
      redactionStats: t.redactionDetails,
      sourceFile: t.sourceFileName,
    })),
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(jsonStr, `spendlens-privacy-report-${dateStr}.json`, 'application/json');
}
