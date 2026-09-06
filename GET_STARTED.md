# Getting Started with SpendLens

SpendLens is a **privacy-first, 100% client-side personal finance and bank statement analyzer**. It processes `.csv`, `.xlsx`, and `.xls` bank statements entirely in your browser memory, scrubbing all Personally Identifiable Information (PII) before calculating month-wise credit/debit breakdowns, repeated transaction frequencies, and micro-spending brackets.

---

## ⚡ Quick Start (Local Setup)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun** / **yarn**

### Installation & Run

1. **Clone your repository**:
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd <REPO_NAME>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:3000` in your web browser.

5. **Production Build**:
   ```bash
   npm run build
   npm run preview
   ```

---

## 📖 How to Use the Application

### Step 1: Load or Upload Bank Statements
- **Try Demo Data**: On first load, SpendLens provides sample statements (HDFC Salary Account, ICICI Card/UPI, SBI Savings) spanning August 2025 through March 2026.
- **Upload Real Statements**:
  - Drag and drop or click the upload area in the **File Upload & Privacy** section.
  - Supports `.csv`, `.xlsx`, and `.xls` formats from any Indian or global bank (HDFC, ICICI, SBI, Axis, Kotak, Canara, PNB, Chase, Citibank, etc.).
  - Upload multiple bank statements simultaneously to view unified cross-account analytics.

### Step 2: Review Month-Wise Breakdown
Navigate to the **Month-Wise Breakdown** section to inspect:
- **Amount Credited**: All deposits, salaries, consulting retainers, and dividends (accurately handles high-value amounts such as ₹4L+ credits with Indian comma grouping `4,00,000.00`).
- **Amount Spent**: Total debit outflow for the calendar month.
- **Net Balance / Savings Rate**: Inflow vs. outflow surplus and percentage saved.
- **Repeated Across Months**:
  - Automatically identifies recurring expenses occurring across multiple billing cycles (rent, subscriptions, mutual fund SIPs, broadband, utilities).
  - Shows repetition count (e.g., `4/6 months`), average amount, and total spent.
- **Spending Below ₹500 (Micro-Spends)**:
  - Tracks frequent quick UPI, coffee, snack, and cab payments under ₹500.
  - Displays total micro-spend amount and transaction frequency per month.
- **Expanded Monthly Ledger**: Click any month card to view its categorized ledger, merchant distributions, and daily transaction list.

### Step 3: Zero-Cloud Privacy & PII Inspection
- SpendLens operates with **strict client-side isolation**; your financial statements are never sent to external servers or cloud databases.
- Click the **Zero-Cloud Privacy** shield badge in the header or the **PII Inspector** modal to observe the regex sanitization engine:
  - **Account Numbers**: Replaced with `[REDACTED-ACCT]`
  - **Debit / Credit Card Numbers**: Replaced with `[REDACTED-CARD]`
  - **UPI Handles & VPA IDs**: Replaced with `[REDACTED-UPI]`
  - **Email Addresses & Phone Numbers**: Replaced with `[REDACTED-EMAIL]` / `[REDACTED-PHONE]`

### Step 4: Spending Brackets & Merchant Intelligence
- **Tier Analysis**: Sort expenses into 5 distinct brackets:
  - Micro (< ₹500)
  - Small (₹500 - ₹2,000)
  - Medium (₹2,000 - ₹5,000)
  - Large (₹5,000 - ₹20,000)
  - Major (> ₹20,000)
- **Merchant Normalization**: Raw bank remarks like `UPI/DR/10293/swiggy@icici/Order` are automatically grouped under clean merchant brands (**Swiggy**, **Zomato**, **Amazon**, **Zepto**, etc.).

### Step 5: Export Clean Reports
- Export your sanitized ledger as **Clean CSV** or **Clean JSON** with all PII permanently masked, ready for sharing with tax consultants, accountants, or financial planners.

---

## 🏦 Supported Statement Formats

SpendLens features an adaptive parser that automatically identifies table headers up to 60 rows deep, bypassing bank disclaimers, address lines, and multi-sheet cover pages:

| Bank Column Name Variants | Detected As |
| :--- | :--- |
| `Deposit Amount`, `Deposit Amt.`, `CR AMT`, `Credit (INR)`, `Deposits`, `Inflow` | **Credit** |
| `Withdrawal Amount`, `Withdrawal Amt.`, `DR AMT`, `Debit (INR)`, `Withdrawals`, `Outflow` | **Debit** |
| `Amount` + `Type` (`CR`/`DR`) or signed values (`+`/`-`) | **Single Amount** |
| `Date`, `Txn Date`, `Transaction Date`, `Value Date`, `Post Date` | **Date** |
| `Narration`, `Description`, `Particulars`, `Remarks`, `Transaction Details` | **Narration** |
| `Balance`, `Closing Balance`, `Bal (INR)` | **Balance** |

### Supported Date Formats
- `DD/MM/YYYY`, `DD-MM-YYYY`, `DD.MM.YYYY`
- `DD/MM/YY`, `DD-MM-YY` (2-digit years)
- `DD-MMM-YYYY` (e.g. `15-Aug-2025`, `01-AUG-25`)
- `YYYY-MM-DD`, `YYYY/MM/DD`
- Excel numeric serial dates & native timestamp objects

---

## 🛠 Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Server**: Vite + Node.js
- **Styling**: Tailwind CSS
- **Animations**: Motion (`motion/react`)
- **Icons**: Lucide React
- **Parsers**: PapaParse (CSV) & SheetJS XLSX (Excel)

---

## 🔒 Security & Privacy Architecture

1. **In-Memory Only**: Files are processed using Web APIs (`FileReader`, `ArrayBuffer`) and never written to disk or transmitted over HTTP.
2. **Deterministic Scrubbing**: Narrative fields are sanitized before entering component state or calculation functions.
3. **No External Analytics or Trackers**: No third-party marketing SDKs or tracking scripts are bundled.
