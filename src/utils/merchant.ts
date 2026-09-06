import { RecurringMerchantSummary, Transaction } from '../types';

interface MerchantRule {
  pattern: RegExp;
  displayName: string;
  category: 'Subscriptions' | 'Food & Dining' | 'Groceries' | 'Shopping' | 'Utilities & Bills' | 'Investments & SIP' | 'Housing & Rent' | 'Commute & Travel' | 'Fuel' | 'Healthcare' | 'Fitness' | 'Salary & Income' | 'Transfers & Payments';
  isSubscriptionCandidate?: boolean;
}

const KNOWN_MERCHANT_RULES: MerchantRule[] = [
  // Subscriptions & Entertainment
  { pattern: /netflix/i, displayName: 'Netflix', category: 'Subscriptions', isSubscriptionCandidate: true },
  { pattern: /spotify/i, displayName: 'Spotify', category: 'Subscriptions', isSubscriptionCandidate: true },
  { pattern: /(?:amazon prime|prime video|amzn prime)/i, displayName: 'Amazon Prime', category: 'Subscriptions', isSubscriptionCandidate: true },
  { pattern: /(?:hotstar|disney)/i, displayName: 'Disney+ Hotstar', category: 'Subscriptions', isSubscriptionCandidate: true },
  { pattern: /youtube/i, displayName: 'YouTube Premium', category: 'Subscriptions', isSubscriptionCandidate: true },
  { pattern: /(?:apple\.com|itunes|icloud)/i, displayName: 'Apple Services', category: 'Subscriptions', isSubscriptionCandidate: true },
  { pattern: /(?:google\*|google play|google storage|google one)/i, displayName: 'Google Services', category: 'Subscriptions', isSubscriptionCandidate: true },
  { pattern: /chatgpt|openai/i, displayName: 'OpenAI / ChatGPT', category: 'Subscriptions', isSubscriptionCandidate: true },

  // Food & Dining
  { pattern: /swiggy/i, displayName: 'Swiggy', category: 'Food & Dining' },
  { pattern: /zomato/i, displayName: 'Zomato', category: 'Food & Dining' },
  { pattern: /starbucks/i, displayName: 'Starbucks', category: 'Food & Dining' },
  { pattern: /mcdonald|mcd /i, displayName: "McDonald's", category: 'Food & Dining' },
  { pattern: /domino/i, displayName: "Domino's Pizza", category: 'Food & Dining' },
  { pattern: /blue tokai|third wave/i, displayName: 'Coffee Cafe', category: 'Food & Dining' },
  { pattern: /burger king/i, displayName: 'Burger King', category: 'Food & Dining' },

  // Groceries & Quick Commerce
  { pattern: /blinkit/i, displayName: 'Blinkit', category: 'Groceries' },
  { pattern: /zepto/i, displayName: 'Zepto', category: 'Groceries' },
  { pattern: /instamart/i, displayName: 'Swiggy Instamart', category: 'Groceries' },
  { pattern: /bigbasket|bbdaily/i, displayName: 'BigBasket', category: 'Groceries' },
  { pattern: /dmart|avenue supermarts/i, displayName: 'DMart', category: 'Groceries' },
  { pattern: /nature.*basket|more retail/i, displayName: 'Supermarket Grocery', category: 'Groceries' },

  // Shopping & E-commerce
  { pattern: /amazon|amzn/i, displayName: 'Amazon', category: 'Shopping' },
  { pattern: /flipkart/i, displayName: 'Flipkart', category: 'Shopping' },
  { pattern: /myntra/i, displayName: 'Myntra', category: 'Shopping' },
  { pattern: /ajio/i, displayName: 'Ajio', category: 'Shopping' },
  { pattern: /decathlon/i, displayName: 'Decathlon', category: 'Shopping' },
  { pattern: /tata cliq|tata neu/i, displayName: 'Tata Digital', category: 'Shopping' },
  { pattern: /ikea/i, displayName: 'IKEA', category: 'Shopping' },
  { pattern: /nykaa/i, displayName: 'Nykaa', category: 'Shopping' },
  { pattern: /zara|h&m|uniqlo/i, displayName: 'Apparel Store', category: 'Shopping' },

  // Utilities & Bills
  { pattern: /airtel/i, displayName: 'Airtel Telecom', category: 'Utilities & Bills', isSubscriptionCandidate: true },
  { pattern: /jio /i, displayName: 'Reliance Jio', category: 'Utilities & Bills', isSubscriptionCandidate: true },
  { pattern: /act broadband|act fibernet/i, displayName: 'ACT Fibernet', category: 'Utilities & Bills', isSubscriptionCandidate: true },
  { pattern: /electricity|bescom|tata power|adani power|mseb|discom|uppcl/i, displayName: 'Electricity Utility', category: 'Utilities & Bills', isSubscriptionCandidate: true },
  { pattern: /gas bill|igl|mgl|indane|hpcl gas/i, displayName: 'Piped / LPG Gas', category: 'Utilities & Bills', isSubscriptionCandidate: true },
  { pattern: /water board|bwssb|djb/i, displayName: 'Water Utility', category: 'Utilities & Bills', isSubscriptionCandidate: true },

  // Housing & Rent
  { pattern: /rent|society maintenance|maintenance fee|landlord|flat rent|house rent/i, displayName: 'House Rent & Society', category: 'Housing & Rent', isSubscriptionCandidate: true },

  // Investments & SIP
  { pattern: /zerodha/i, displayName: 'Zerodha Broking', category: 'Investments & SIP', isSubscriptionCandidate: true },
  { pattern: /groww/i, displayName: 'Groww Invest', category: 'Investments & SIP', isSubscriptionCandidate: true },
  { pattern: /angel one|upstox/i, displayName: 'Stock Broker', category: 'Investments & SIP', isSubscriptionCandidate: true },
  { pattern: /(?:sip|mutual fund|mf |hdfc mf|sbi mf|icici pru|nippon|uti mf|parag parikh|mirae)/i, displayName: 'Mutual Fund SIP', category: 'Investments & SIP', isSubscriptionCandidate: true },
  { pattern: /(?:ppf|nps|sukanya|national pension)/i, displayName: 'Retirement Savings (NPS/PPF)', category: 'Investments & SIP', isSubscriptionCandidate: true },
  { pattern: /(?:lic of india|hdfc life|max life|icici lombard|star health|bajaj allianz)/i, displayName: 'Insurance Premium', category: 'Investments & SIP', isSubscriptionCandidate: true },

  // Commute, Fuel & Travel
  { pattern: /uber/i, displayName: 'Uber', category: 'Commute & Travel' },
  { pattern: /ola cabs|ola /i, displayName: 'Ola Cabs', category: 'Commute & Travel' },
  { pattern: /rapido/i, displayName: 'Rapido Bike', category: 'Commute & Travel' },
  { pattern: /fastag|nhai|toll/i, displayName: 'FASTag Toll', category: 'Commute & Travel' },
  { pattern: /irctc|indian railway/i, displayName: 'IRCTC Railways', category: 'Commute & Travel' },
  { pattern: /indigo|air india|vistara|spicejet|makemytrip|cleartrip/i, displayName: 'Airlines & Travel', category: 'Commute & Travel' },
  { pattern: /(?:iocl|bpcl|hpcl|petrol|fuel|shell petrol)/i, displayName: 'Fuel & Petrol Station', category: 'Fuel' },

  // Healthcare & Wellness
  { pattern: /apollo/i, displayName: 'Apollo Healthcare', category: 'Healthcare' },
  { pattern: /pharmeasy|netmeds|1mg|tata 1mg|medplus/i, displayName: 'Pharmacy / Medicines', category: 'Healthcare' },
  { pattern: /cult\.fit|curefit|gym|fitness/i, displayName: 'Cult.fit / Gym', category: 'Fitness', isSubscriptionCandidate: true },

  // Credit Cards & Financial Services
  { pattern: /cred/i, displayName: 'CRED Club', category: 'Utilities & Bills' },

  // Income
  { pattern: /(?:salary|payroll|stipend|salary credit|wages|employer)/i, displayName: 'Monthly Salary', category: 'Salary & Income' },
  { pattern: /(?:interest credit|int\.pd|bank interest|saving int)/i, displayName: 'Savings Bank Interest', category: 'Salary & Income' },
  { pattern: /(?:dividend)/i, displayName: 'Stock Dividend', category: 'Salary & Income' },
];

const NOISE_WORDS = new Set([
  'UPI', 'NEFT', 'RTGS', 'POS', 'INB', 'TRANSFER', 'TRF', 'DR', 'CR', 'IMPS', 'ACH',
  'CMS', 'BIL', 'ECOMM', 'E-COMM', 'INF', 'REV', 'MB', 'ATM', 'WDL', 'PAYMENT', 'TO',
  'FROM', 'BY', 'FOR', 'PURCHASE', 'TXN', 'P2A', 'P2M', 'NETBANKING', 'DEBIT', 'CREDIT',
  'NACH', 'ECS', 'ONLINE', 'QR', 'CARD', 'VPS', 'PAY', 'DIRECT', 'REDACTED', 'INR',
  'RS', 'AT', 'REF', 'UTR', 'UTRN', 'RRN', 'VAL', 'DT', 'BILLDESK', 'PAYU', 'RAZORPAY',
  'CC', 'BANK', 'PVT', 'LTD', 'LIMITED', 'SERVICES', 'INDIA', 'NO'
]);

/**
 * Normalizes narration to extract core merchant and category
 */
export function normalizeMerchant(narration: string): { merchant: string; category: string } {
  if (!narration) {
    return { merchant: 'Uncategorized', category: 'Transfers & Payments' };
  }

  // 1. Check known merchant rules
  for (const rule of KNOWN_MERCHANT_RULES) {
    if (rule.pattern.test(narration)) {
      return { merchant: rule.displayName, category: rule.category };
    }
  }

  // 2. Tokenize and remove noise words
  // Remove [REDACTED], slashes, dashes, numbers, special characters
  const cleanStr = narration
    .replace(/\[REDACTED\]/gi, ' ')
    .replace(/[^a-zA-Z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = cleanStr.split(' ');
  const filteredWords: string[] = [];

  for (const w of words) {
    const upper = w.toUpperCase();
    if (upper.length > 2 && !NOISE_WORDS.has(upper)) {
      filteredWords.push(w);
    }
  }

  if (filteredWords.length === 0) {
    return { merchant: 'General Merchant', category: 'Transfers & Payments' };
  }

  // Take top 1-2 words
  const extracted = filteredWords.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

  return {
    merchant: extracted || 'General Merchant',
    category: 'Transfers & Payments',
  };
}

/**
 * Detects recurring transactions across 2 or more distinct calendar months
 */
export function detectRecurringMerchants(transactions: Transaction[]): RecurringMerchantSummary[] {
  // We analyze primarily debits/outflows, but also investments/SIPs
  const merchantMap = new Map<string, {
    displayName: string;
    category: string;
    dates: string[];
    months: Set<string>;
    totalSpent: number;
    count: number;
    isSubscriptionCandidate: boolean;
    sampleNarration: string;
  }>();

  for (const tx of transactions) {
    // Only analyze debit expenses for recurring expense commitments
    if (tx.type !== 'debit') continue;

    const key = tx.normalizedMerchant.toLowerCase();
    const existing = merchantMap.get(key);

    const isSub = KNOWN_MERCHANT_RULES.some(
      r => r.displayName.toLowerCase() === key && r.isSubscriptionCandidate
    );

    if (!existing) {
      const monthSet = new Set<string>();
      monthSet.add(tx.monthKey);
      merchantMap.set(key, {
        displayName: tx.normalizedMerchant,
        category: tx.category,
        dates: [tx.date],
        months: monthSet,
        totalSpent: tx.amount,
        count: 1,
        isSubscriptionCandidate: isSub,
        sampleNarration: tx.sanitizedNarration,
      });
    } else {
      existing.months.add(tx.monthKey);
      existing.dates.push(tx.date);
      existing.totalSpent += tx.amount;
      existing.count += 1;
      if (isSub) existing.isSubscriptionCandidate = true;
    }
  }

  const results: RecurringMerchantSummary[] = [];

  for (const [key, data] of merchantMap.entries()) {
    // Requirement 3: "Detect and flag recurring/repeated transactions that appear across 2 or more distinct calendar months"
    if (data.months.size >= 2) {
      const activeMonthsList = Array.from(data.months).sort();
      const avgMonthly = data.totalSpent / activeMonthsList.length;

      // Sort dates to find last seen
      const sortedDates = [...data.dates].sort();
      const lastSeenDate = sortedDates[sortedDates.length - 1];

      results.push({
        merchantKey: key,
        merchantDisplayName: data.displayName,
        category: data.category,
        frequencyCount: data.count,
        activeMonthsCount: data.months.size,
        activeMonths: activeMonthsList,
        totalSpent: Math.round(data.totalSpent * 100) / 100,
        averageMonthlySpend: Math.round(avgMonthly * 100) / 100,
        lastSeenDate,
        isSubscription: data.isSubscriptionCandidate || (data.count >= 2 && data.count <= data.months.size * 2),
        sampleNarration: data.sampleNarration,
      });
    }
  }

  // Sort by total spent descending
  return results.sort((a, b) => b.totalSpent - a.totalSpent);
}
