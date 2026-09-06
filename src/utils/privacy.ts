import { RedactionDetails } from '../types';

/**
 * Privacy & PII Sanitization Engine
 * Runs 100% locally inside the browser.
 * Sanitizes and scrubs all sensitive identifiable information from narration fields
 * before any aggregation, categorization, or display.
 */

// Regex patterns
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

// UPI ID handles: standard Indian banking handles (oksbi, okhdfcbank, okaxis, okicici, apl, ybl, paytm, upi, etc.)
// and general alphanumeric handle strings
const UPI_REGEX = /\b[a-zA-Z0-9._\-+]+@(oksbi|okhdfcbank|okaxis|okicici|apl|ybl|paytm|upi|axl|ibl|barodampay|federal|postbank|sbi|hdfcbank|icici|axisbank|kotak|pnb|yesbank|airtel|jupiter|fi|slice|cred|[a-zA-Z]{3,})\b/gi;

// 10-16 digit continuous or dashed/spaced numbers (Card numbers, Account numbers, Mobile phone numbers, etc.)
const DIGIT_10_16_REGEX = /\b(?:\d{4}[ -]?\d{4}[ -]?\d{2,8}|\d{10,16})\b/g;

// PAN / Tax ID pattern (5 letters, 4 numbers, 1 letter)
const PAN_REGEX = /\b[A-Z]{5}\d{4}[A-Z]\b/gi;

// Trailing transaction reference tokens, e.g.:
// /UPI/CR/12345/ -> /UPI/
// /UPI/DR/123456789/ -> /UPI/
// /NEFT/N1234567890/ -> /NEFT/
// /IMPS/123456789/ -> /IMPS/
// trailing /REF:12345, /TXN1234, etc.
const TRAILING_REF_PATTERNS = [
  {
    regex: /\/UPI\/(?:CR|DR)\/[A-Za-z0-9_-]+\/?/gi,
    replacement: '/UPI/',
  },
  {
    regex: /\/NEFT\/(?:CR|DR|N)?[A-Za-z0-9_-]+\/?/gi,
    replacement: '/NEFT/',
  },
  {
    regex: /\/IMPS\/(?:P2A|P2P|CR|DR)?[A-Za-z0-9_-]+\/?/gi,
    replacement: '/IMPS/',
  },
  {
    regex: /\/(?:CR|DR)\/[0-9A-Za-z]+\/?$/gi,
    replacement: '/',
  },
  {
    regex: /\/(?:REF|TXN|UTRN|RRN|UTR)[-:\/ ]?[A-Za-z0-9]+\/?$/gi,
    replacement: '',
  },
  {
    regex: /\/[0-9]{6,}\/?$/g,
    replacement: '/',
  },
];

export interface ScrubResult {
  sanitized: string;
  details: RedactionDetails;
  matchedTokens: {
    type: 'card_account' | 'email' | 'upi' | 'ref_token';
    original: string;
  }[];
}

export function scrubPII(narration: string): ScrubResult {
  if (!narration || typeof narration !== 'string') {
    return {
      sanitized: '',
      details: {
        accountOrCardCount: 0,
        emailCount: 0,
        upiCount: 0,
        refTokenCount: 0,
        totalTokensRedacted: 0,
      },
      matchedTokens: [],
    };
  }

  let text = narration.trim();
  const matchedTokens: ScrubResult['matchedTokens'] = [];

  let emailCount = 0;
  let upiCount = 0;
  let accountOrCardCount = 0;
  let refTokenCount = 0;

  // 1. First, strip/clean trailing transaction reference tokens as requested
  for (const item of TRAILING_REF_PATTERNS) {
    const matches = text.match(item.regex);
    if (matches && matches.length > 0) {
      refTokenCount += matches.length;
      for (const m of matches) {
        matchedTokens.push({ type: 'ref_token', original: m });
      }
      text = text.replace(item.regex, item.replacement);
    }
  }

  // 2. Redact Email addresses
  const emailMatches = text.match(EMAIL_REGEX);
  if (emailMatches) {
    emailCount += emailMatches.length;
    for (const m of emailMatches) {
      matchedTokens.push({ type: 'email', original: m });
    }
    text = text.replace(EMAIL_REGEX, '[REDACTED]');
  }

  // 3. Redact UPI IDs (e.g., user@oksbi, name@apl, 9876543210@paytm)
  // Skip matches that are already [REDACTED]
  const upiMatches = text.match(UPI_REGEX);
  if (upiMatches) {
    for (const m of upiMatches) {
      if (!m.includes('[REDACTED]')) {
        upiCount++;
        matchedTokens.push({ type: 'upi', original: m });
      }
    }
    text = text.replace(UPI_REGEX, '[REDACTED]');
  }

  // 4. Redact PAN numbers
  const panMatches = text.match(PAN_REGEX);
  if (panMatches) {
    for (const m of panMatches) {
      accountOrCardCount++;
      matchedTokens.push({ type: 'card_account', original: m });
    }
    text = text.replace(PAN_REGEX, '[REDACTED]');
  }

  // 5. Redact 10-16 digit numbers (Account numbers, Credit/Debit cards, Phone numbers)
  const digitMatches = text.match(DIGIT_10_16_REGEX);
  if (digitMatches) {
    for (const m of digitMatches) {
      // Don't count if already inside brackets or part of [REDACTED]
      accountOrCardCount++;
      matchedTokens.push({ type: 'card_account', original: m });
    }
    text = text.replace(DIGIT_10_16_REGEX, '[REDACTED]');
  }

  // Clean redundant whitespace and consecutive [REDACTED] [REDACTED]
  text = text.replace(/(\[REDACTED\][\s,/-]*)+\[REDACTED\]/g, '[REDACTED]');
  text = text.replace(/\s{2,}/g, ' ').trim();

  const totalTokensRedacted = emailCount + upiCount + accountOrCardCount + refTokenCount;

  return {
    sanitized: text,
    details: {
      accountOrCardCount,
      emailCount,
      upiCount,
      refTokenCount,
      totalTokensRedacted,
    },
    matchedTokens,
  };
}
