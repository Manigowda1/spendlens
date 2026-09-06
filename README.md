# SpendLens 🔍

> **Privacy-First Bank Statement & Spending Analyzer**  
> Client-side personal finance intelligence with automatic PII masking, multi-bank statement parsing, month-wise credit/debit breakdowns, repeated transaction tracking, and spending bracket insights.

---

## 🚀 Highlights

- **100% Client-Side Privacy**: All parsing and analysis happen inside your browser memory. Statements are never transmitted to external cloud servers.
- **Smart Bank Parsing**: Seamlessly reads `.csv`, `.xlsx`, and `.xls` statements from Indian (HDFC, SBI, ICICI, Axis, Kotak, Canara, PNB) and global banks.
- **Month-Wise Breakdown**:
  - Accurate **Credits** (handles high-value amounts like ₹4L+ with Indian comma notations).
  - Detailed **Debits** and net savings percentages.
  - **Repeated Across Months**: Identifies recurring bills, rent, SIPs, and subscriptions.
  - **Spending Below ₹500**: Tracks micro-spending habits and high-frequency UPI spends.
- **Zero-Cloud PII Masking**: Automatic client-side redacting of account numbers, credit/debit cards, UPI VPAs, phone numbers, and emails.
- **Spending Brackets**: Categorizes expenses into micro (<₹500), small (₹500–₹2k), medium (₹2k–₹5k), large (₹5k–₹20k), and major (>₹20k).
- **Sanitized Export**: Download scrubbed CSV or JSON reports safely for accounting or budgeting.

---

## 📚 Documentation & Getting Started

For complete setup instructions, usage guides, supported statement formats, and local development details:

👉 **Read the [GET_STARTED.md](./GET_STARTED.md) guide.**

---

## 💻 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open `http://localhost:3000` in your browser.
