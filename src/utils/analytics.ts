import { 
  GlobalAnalytics, 
  MonthlySummary, 
  SpendingBracket, 
  Transaction,
  MonthSpentBelow500,
  MonthRepeatedSpending,
  MonthRepeatedMerchant,
  RecurringMerchantSummary
} from '../types';
import { detectRecurringMerchants } from './merchant';

export const BRACKET_DEFINITIONS = [
  // Lower Transaction Brackets
  { id: 'tier-below-500', tierGroup: 'lower' as const, label: 'Below ₹500', min: 0, max: 500 },
  { id: 'tier-500-1000', tierGroup: 'lower' as const, label: '₹500 - ₹1,000', min: 500, max: 1000 },
  { id: 'tier-1000-2000', tierGroup: 'lower' as const, label: '₹1,000 - ₹2,000', min: 1000, max: 2000 },

  // Higher Transaction Brackets
  { id: 'tier-2000-5000', tierGroup: 'higher' as const, label: '₹2,000 - ₹5,000', min: 2000, max: 5000 },
  { id: 'tier-5000-10000', tierGroup: 'higher' as const, label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
  { id: 'tier-10000-15000', tierGroup: 'higher' as const, label: '₹10,000 - ₹15,000', min: 10000, max: 15000 },
  { id: 'tier-15000-20000', tierGroup: 'higher' as const, label: '₹15,000 - ₹20,000', min: 15000, max: 20000 },
  { id: 'tier-above-20000', tierGroup: 'higher' as const, label: 'Greater than ₹20,000', min: 20000, max: null },
];

export function assignBracketTier(amount: number): string {
  if (amount < 500) return 'tier-below-500';
  if (amount <= 1000) return 'tier-500-1000';
  if (amount <= 2000) return 'tier-1000-2000';
  if (amount <= 5000) return 'tier-2000-5000';
  if (amount <= 10000) return 'tier-5000-10000';
  if (amount <= 15000) return 'tier-10000-15000';
  if (amount <= 20000) return 'tier-15000-20000';
  return 'tier-above-20000';
}

export function formatMonthName(monthKey: string): string {
  // monthKey is YYYY-MM
  if (!monthKey || !monthKey.includes('-')) return monthKey || 'Unknown';
  const [year, month] = monthKey.split('-');
  const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function computeMonthlyBrackets(debitTransactions: Transaction[], totalDebit: number): SpendingBracket[] {
  return BRACKET_DEFINITIONS.map(def => {
    const matchingTx = debitTransactions.filter(tx => {
      if (def.max === null) {
        return tx.amount > def.min;
      }
      if (def.min === 0) {
        return tx.amount < def.max;
      }
      return tx.amount >= def.min && tx.amount <= def.max;
    });

    const sum = matchingTx.reduce((acc, tx) => acc + tx.amount, 0);
    const pct = totalDebit > 0 ? (sum / totalDebit) * 100 : 0;

    return {
      id: def.id,
      tierGroup: def.tierGroup,
      label: def.label,
      min: def.min,
      max: def.max,
      totalAmount: Math.round(sum * 100) / 100,
      count: matchingTx.length,
      percentageOfDebit: Math.round(pct * 10) / 10,
    };
  });
}

export function computeMonthlyAnalytics(transactions: Transaction[]): {
  monthlySummaries: MonthlySummary[];
  globalAnalytics: GlobalAnalytics;
} {
  // Pre-detect recurring merchants that appear across 2 or more distinct calendar months
  const allRecurringMerchants = detectRecurringMerchants(transactions);
  const recurringMerchantMap = new Map<string, RecurringMerchantSummary>();
  for (const r of allRecurringMerchants) {
    recurringMerchantMap.set(r.merchantKey, r);
  }

  const monthMap = new Map<string, { credits: Transaction[]; debits: Transaction[] }>();

  let totalCredit = 0;
  let totalDebit = 0;
  let totalPiiRedacted = 0;

  for (const tx of transactions) {
    if (!monthMap.has(tx.monthKey)) {
      monthMap.set(tx.monthKey, { credits: [], debits: [] });
    }
    const bucket = monthMap.get(tx.monthKey)!;
    if (tx.type === 'credit') {
      bucket.credits.push(tx);
      totalCredit += tx.amount;
    } else {
      bucket.debits.push(tx);
      totalDebit += tx.amount;
    }
    totalPiiRedacted += tx.redactionDetails.totalTokensRedacted;
  }

  // Sort months chronologically
  const sortedMonthKeys = Array.from(monthMap.keys()).sort();

  const monthlySummaries: MonthlySummary[] = sortedMonthKeys.map(key => {
    const bucket = monthMap.get(key)!;
    const monthCredit = bucket.credits.reduce((sum, tx) => sum + tx.amount, 0);
    const monthDebit = bucket.debits.reduce((sum, tx) => sum + tx.amount, 0);
    const netSavings = monthCredit - monthDebit;
    const savingsRate = monthCredit > 0 ? (netSavings / monthCredit) * 100 : 0;
    const brackets = computeMonthlyBrackets(bucket.debits, monthDebit);

    // 1. Total amount spent below ₹500 for this month
    const below500Debits = bucket.debits.filter(tx => tx.amount < 500);
    const below500Total = below500Debits.reduce((sum, tx) => sum + tx.amount, 0);
    const spentBelow500: MonthSpentBelow500 = {
      totalAmount: Math.round(below500Total * 100) / 100,
      count: below500Debits.length,
      percentageOfDebit: monthDebit > 0 ? Math.round((below500Total / monthDebit) * 1000) / 10 : 0,
      transactions: below500Debits,
    };

    // 2. Repeated transactions across months in this month
    const monthMerchantMap = new Map<string, MonthRepeatedMerchant>();
    let monthRepeatedTotal = 0;
    let monthRepeatedCount = 0;

    for (const tx of bucket.debits) {
      const merchantKey = tx.normalizedMerchant.toLowerCase();
      const recurInfo = recurringMerchantMap.get(merchantKey);
      if (recurInfo) {
        monthRepeatedTotal += tx.amount;
        monthRepeatedCount += 1;
        const existing = monthMerchantMap.get(merchantKey);
        if (!existing) {
          monthMerchantMap.set(merchantKey, {
            merchantName: recurInfo.merchantDisplayName,
            category: recurInfo.category,
            amountInMonth: tx.amount,
            txnCountInMonth: 1,
            totalMonthsActive: recurInfo.activeMonthsCount,
            isSubscription: recurInfo.isSubscription,
            sampleNarration: tx.sanitizedNarration,
          });
        } else {
          existing.amountInMonth += tx.amount;
          existing.txnCountInMonth += 1;
        }
      }
    }

    const monthRepeatedMerchants = Array.from(monthMerchantMap.values()).sort(
      (a, b) => b.amountInMonth - a.amountInMonth
    );

    const repeatedSpending: MonthRepeatedSpending = {
      totalAmount: Math.round(monthRepeatedTotal * 100) / 100,
      count: monthRepeatedCount,
      percentageOfDebit: monthDebit > 0 ? Math.round((monthRepeatedTotal / monthDebit) * 1000) / 10 : 0,
      merchants: monthRepeatedMerchants,
    };

    return {
      monthKey: key,
      displayMonth: formatMonthName(key),
      totalCredit: Math.round(monthCredit * 100) / 100,
      totalDebit: Math.round(monthDebit * 100) / 100,
      netSavings: Math.round(netSavings * 100) / 100,
      savingsRate: Math.round(savingsRate * 10) / 10,
      transactionCount: bucket.credits.length + bucket.debits.length,
      brackets,
      spentBelow500,
      repeatedSpending,
    };
  });

  const allDebits = transactions.filter(t => t.type === 'debit');
  const globalBrackets = computeMonthlyBrackets(allDebits, totalDebit);

  const lowerTotal = globalBrackets
    .filter(b => b.tierGroup === 'lower')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const higherTotal = globalBrackets
    .filter(b => b.tierGroup === 'higher')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const netSavings = totalCredit - totalDebit;
  const overallSavingsRate = totalCredit > 0 ? (netSavings / totalCredit) * 100 : 0;

  const fileSet = new Set(transactions.map(t => t.sourceFileId));

  // Global below 500
  const globalBelow500Debits = allDebits.filter(tx => tx.amount < 500);
  const globalBelow500Total = globalBelow500Debits.reduce((sum, tx) => sum + tx.amount, 0);
  const totalSpentBelow500: MonthSpentBelow500 = {
    totalAmount: Math.round(globalBelow500Total * 100) / 100,
    count: globalBelow500Debits.length,
    percentageOfDebit: totalDebit > 0 ? Math.round((globalBelow500Total / totalDebit) * 1000) / 10 : 0,
    transactions: globalBelow500Debits,
  };

  // Global repeated
  const globalRepeatedDebits = allDebits.filter(tx => recurringMerchantMap.has(tx.normalizedMerchant.toLowerCase()));
  const globalRepeatedTotal = globalRepeatedDebits.reduce((sum, tx) => sum + tx.amount, 0);
  const globalMerchantList: MonthRepeatedMerchant[] = allRecurringMerchants.map(r => ({
    merchantName: r.merchantDisplayName,
    category: r.category,
    amountInMonth: r.totalSpent,
    txnCountInMonth: r.frequencyCount,
    totalMonthsActive: r.activeMonthsCount,
    isSubscription: r.isSubscription,
    sampleNarration: r.sampleNarration,
  }));

  const totalRepeatedSpending: MonthRepeatedSpending = {
    totalAmount: Math.round(globalRepeatedTotal * 100) / 100,
    count: globalRepeatedDebits.length,
    percentageOfDebit: totalDebit > 0 ? Math.round((globalRepeatedTotal / totalDebit) * 1000) / 10 : 0,
    merchants: globalMerchantList,
  };

  const avgMonthlyCommitment = allRecurringMerchants.reduce((sum, r) => sum + r.averageMonthlySpend, 0);

  const globalAnalytics: GlobalAnalytics = {
    totalCredit: Math.round(totalCredit * 100) / 100,
    totalDebit: Math.round(totalDebit * 100) / 100,
    netSavings: Math.round(netSavings * 100) / 100,
    overallSavingsRate: Math.round(overallSavingsRate * 10) / 10,
    totalTransactions: transactions.length,
    totalFilesParsed: fileSet.size,
    totalPiiRedacted,
    monthsCount: sortedMonthKeys.length,
    lowerBracketTotal: Math.round(lowerTotal * 100) / 100,
    higherBracketTotal: Math.round(higherTotal * 100) / 100,
    recurringCommitmentMonthlyAvg: Math.round(avgMonthlyCommitment * 100) / 100,
    totalSpentBelow500,
    totalRepeatedSpending,
  };

  return {
    monthlySummaries,
    globalAnalytics,
  };
}

export function formatCurrencyINR(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(absAmount);

  return `${isNegative ? '-' : ''}₹${formatted}`;
}
