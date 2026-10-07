# Personal Loan Intake Assistant (India) 🇮🇳

> **Demo-Ready Personal Loan Intake Validation & Maker-Checker System**  
> Built with **React 18 + TypeScript + Vite + Tailwind CSS**.  
> **100% In-Browser Execution** (zero external servers or paid APIs needed; state persists in browser `localStorage`).

---

## 🛡️ Global Regulatory Guardrail

> ⚠️ **Persistent Guardrail Banner**:  
> *"Intake validation only. No lending decision is made by this tool. Final review is always performed by an authorized human."*

**Hard System Rules (Enforced across all screens and generated text):**
- **NEVER** approves, rejects, prices, scores, or ranks applicants.
- **NO** credit scores (e.g. CIBIL/Experian), risk grades, interest rate offers, or eligibility verdicts are generated.
- All decisions are strictly reserved for authorized human credit underwriters.

---

## 📌 Executive Summary & Problem Solved

In retail personal loan operations across Indian banks and NBFCs, branch officers and intake desks frequently handle incomplete application forms, missing income proofs, mismatched employer names, and stale documents. This leads to repeated, fragmented customer follow-ups and prolonged turnaround times (TAT).

**LoanIntake Assistant (India)** solves this pre-underwriting bottleneck by:
1. Validating mandatory Indian personal loan inputs and KYC documents against a deterministic policy engine.
2. Grouping issues into **Mandatory Fields**, **Missing Documents**, and **Inconsistencies & Format Issues**.
3. Generating an **editable plain-language operations summary** for underwriter hand-off.
4. Drafting a **consolidated customer follow-up notice** (with a language switcher for **English**, **Hindi (हिन्दी)**, and **Tamil (தமிழ்)**).
5. Enforcing a **maker-checker hierarchy (Four-Eyes principle)** with an immutable audit log.
6. Providing a **Validation Evidence Lab** benchmarking all 25 synthetic cases against expected rules.
7. Providing a visibly separate **Guidance Mode** (customer planning aid).

---

## 🇮🇳 India-Specific Features

| Feature | Implementation Details |
| :--- | :--- |
| **Government Identity (KYC)** | **PAN**: Validated against `[A-Z]{5}[0-9]{4}[A-Z]{1}` regex; PAN card name cross-checked against application form name.<br>**Aadhaar**: Enforces UIDAI masking standard (`XXXX-XXXX-1234` only; flags full unmasked numbers). |
| **Mobile Number Format** | Validated as a 10-digit Indian mobile number (`^[6-9]\d{9}$`). |
| **Employment-Specific Income Proofs** | • **Salaried**: Requires recent 3 months salary slips or Form 16.<br>• **Self-Employed**: Requires ITR (Income Tax Return) computation and acknowledgments (AY 2025-26). |
| **Bank Statement Period & Continuity** | Validates minimum continuous months (default 6 months) and flags broken ledger periods / missing page gaps. |
| **Currency & Amounts** | Formatted in Indian Rupee (`₹`) with Indian numbering (`₹2,50,000`, `₹40 Lakh`). |
| **Multi-Lingual Follow-Up** | Customer follow-up draft instantly toggles between **English**, **Hindi (हिन्दी)**, and **Tamil (தமிழ்)**. |
| **Configurable Intake Rules** | Staff can adjust Income Variance Tolerance (±10%), Max Document Freshness (90 days), Required Statement Months (6 months), and Loan Bounds (₹50k – ₹40L) with live re-validation. |

---

## 👥 Hierarchy & Maker-Checker Workflow (Four-Eyes Enforcement)

The top header includes an interactive role switcher demonstrating institutional maker-checker separation:

```
[ L1 Intake Officer (Maker) ] ──▶ [ L2 Verifier (Checker) ] ──▶ [ Ready for Underwriting ]
          │                                  ▲
          │ (Escalations / Discrepancies)    │ (Resolved)
          ▼                                  │
[ L3 Senior Reviewer (Mandatory Written Reason) ]
```

1. **L1 Intake Officer (Maker)**:
   - Corrects application data, adjusts document statuses, drafts follow-ups, and submits for verification.
   - Status transitions: `Draft` ➔ `Follow-up sent` ➔ `Pending verification`.
2. **L2 Verifier (Checker)**:
   - **Four-Eyes Enforcement**: Verifier **CANNOT** be the same person who prepared/submitted the case as Maker. If the same user attempts verification, the system blocks the action with a clear policy alert.
   - Status transition: `Pending verification` ➔ `Verified`.
3. **L3 Senior Reviewer**:
   - Handles escalations (e.g., 2+ inconsistency types, repeated employer/income mismatches).
   - Override requires a **mandatory written justification** (minimum 10 characters) recorded in the audit log.
4. **Auditor (Read-Only)**:
   - Read-only inspection across the entire intake queue, audit trails, and validation evidence without mutation permissions.
5. **Append-Only Audit Log**:
   - Immutable chronological event stream tracking: `Timestamp`, `User Name`, `Role`, `Action Taken`, `Details`, and `Status Changes`. Exportable as CSV per case.

---

## 🧪 Synthetic Data & Validation Evidence (25 Cases)

The application includes 25 diverse synthetic Indian loan profiles representing edge cases:

1. `APP-IND-1001`: Fully compliant salaried applicant (0 findings)
2. `APP-IND-1002`: Missing physical PAN document (`MISS_DOC_PAN`)
3. `APP-IND-1003`: Missing income proof for salaried applicant (`MISS_DOC_INCOME_SALARIED`)
4. `APP-IND-1004`: Missing bank statement (`MISS_DOC_BANK_STMT`)
5. `APP-IND-1005`: Invalid PAN pattern `ABC123456F` (`PAN_FORMAT_INVALID`)
6. `APP-IND-1006`: Invalid mobile number `44556677` (`MOBILE_FORMAT_INVALID`)
7. `APP-IND-1007`: PAN name mismatch (`PAN_NAME_MISMATCH`)
8. `APP-IND-1008`: Declared income vs salary slip mismatch (>10% variance, `INCOME_MISMATCH`)
9. `APP-IND-1009`: Declared employer vs document employer mismatch (`EMPLOYER_MISMATCH`)
10. `APP-IND-1010`: Stale salary slip >90 days old (`DOCUMENT_STALE_Income_Proof`)
11. `APP-IND-1011`: Bank statement duration deficit (3 months instead of 6, `STATEMENT_PERIOD_DEFICIT`)
12. `APP-IND-1012`: Bank statement transaction date gap flagged (`STATEMENT_GAP_DETECTED`)
13. `APP-IND-1013`: Fully compliant self-employed applicant with ITR (0 findings)
14. `APP-IND-1014`: Self-employed missing ITR (`MISS_DOC_INCOME_SELF_EMP`)
15. `APP-IND-1015`: Missing requested loan amount (`MANDATORY_FIELD_AMOUNT`)
16. `APP-IND-1016`: Missing loan purpose (`MANDATORY_FIELD_PURPOSE`)
17. `APP-IND-1017`: Requested amount out of bounds (`AMOUNT_OUT_OF_BOUNDS`)
18. `APP-IND-1018`: Stale utility bill address proof (`DOCUMENT_STALE_Address_Proof`)
19. `APP-IND-1019`: Blurry/unclear salary slip (`DOC_UNCLEAR_Income_Proof`)
20. `APP-IND-1020`: Aadhaar unmasked 12 digits violation (`AADHAAR_UNMASKED_VIOLATION`)
21. `APP-IND-1021`: Future employment start date (`EMPLOYMENT_DATE_FUTURE`)
22. `APP-IND-1022`: Combined missing bank statement + income mismatch (2 findings)
23. `APP-IND-1023`: Combined malformed PAN + invalid mobile + name mismatch (3 findings)
24. `APP-IND-1024`: Combined missing ITR + stale bank statement (2 findings)
25. `APP-IND-1025`: Borderline income variance within 10% tolerance (0 findings)

### Automated Test Verification:
Run the Vitest test suite directly:
```bash
npm test
```
All **26 tests** (25 synthetic cases + guardrail non-decision test) pass with **100% match accuracy**.

---

## 🧭 Guidance Mode (Customer Planning Aid)

Accessible via the top navigation bar as a distinct mode with a dedicated disclaimer:
> *"Indicative only. Not an offer or decision. The lender decides."*

- **Need Profile Input**: Purpose, employment type, monthly in-hand income, existing debt EMIs, amount needed, and repayment tenure.
- **Purpose-to-Category Mapper**: Explains suitable loan types (Personal Loan, Home Renovation, Education Loan, Auto Loan, MSME Loan, Gold Loan, Loan against FD) with **Secured vs Unsecured** classification and typical document checklists.
- **Illustrative Affordability Estimation**:
  - Calculates comfortable monthly EMI capacity using user-editable FOIR cap (default 45%):
    $$\text{Affordable EMI} = (\text{Income} \times \text{FOIR Cap}) - \text{Existing EMIs}$$
  - Computes illustrative principal capacity via reducing-balance annuity formula at sample rate:
    $$P = \frac{\text{EMI} \times ((1+r)^n - 1)}{r \times (1+r)^n}$$
  - Clearly articulates assumptions and disclaimers.

---

## 🚀 Quick Start & Local Execution

The entire application runs locally in the browser:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run automated unit tests
npm test

# Start the Vite development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

---

## 🎬 5-Step Demo Script for Evaluators

1. **Step 1: Inspect Case Queue & India-Specific KYC Validation**
   - Click case **`APP-IND-1001`**: Observe 100% completeness and 0 findings for a compliant salaried file.
   - Click case **`APP-IND-1007`**: Observe the **Inconsistency finding** (`PAN_NAME_MISMATCH`) highlighting that the application name differs from the name on the PAN document.
2. **Step 2: Live Re-Validation & Data Correction**
   - In **`APP-IND-1007`**, switch to the **Application Data** tab.
   - Update the applicant name to match `"Rajesh V. Sharma"` (or vice-versa). Notice the finding clears instantly in real time and the progress bar increases!
3. **Step 3: Multi-Lingual Customer Follow-Up Draft**
   - Click case **`APP-IND-1002`** (Missing PAN document) or **`APP-IND-1022`** (Missing bank statement & income mismatch).
   - Go to the **Customer Follow-Up** tab. Toggle between **English**, **हिन्दी (Hindi)**, and **தமிழ் (Tamil)** to demonstrate localized communication.
   - Click **Copy to Clipboard** or **Mark Follow-Up Sent**.
4. **Step 4: Enforce Four-Eyes Maker-Checker Policy**
   - Ensure current user is **Rajesh Kumar (L1 Intake Officer)** in the top header.
   - On any draft case, go to **Maker-Checker Sign-Off** and click **Submit for Verification**. The case is now pending verification by maker Rajesh Kumar.
   - Click **Verify Intake (Pass)**: Notice it is disabled with a prominent **Four-Eyes Enforcement banner**.
   - Use the header user switcher to switch to **Priya Sharma (L2 Verifier)**. Click **Verify Intake (Pass)**: The verification passes successfully!
   - Click **Hand Off to Underwriting** to show smooth operational hand-off.
5. **Step 5: View Validation Evidence & Guidance Mode**
   - Click the **Validation Evidence** tab in the top header: View the automated benchmark table comparing actual vs expected findings for all 25 synthetic cases (100% Match Rate) and click **Export Evidence (CSV)**.
   - Click **Guidance Mode**: Explore the customer loan category mapping and illustrative FOIR affordability simulation under strict non-decision guardrails.

---

## 🏛️ Credit Policy & Regulatory Disclaimer

- **Scope Limits**: This application functions solely as an intake and pre-underwriting verification assistant. It does not perform credit scoring, risk grading, or automated loan underwriting.
- **Policy Sourcing**: Validation thresholds (such as 90-day document freshness and 10% income tolerance) are illustrative defaults and must be aligned with the bank's sanctioned credit policy, internal KYC guidelines, and current Master Directions issued by the **Reserve Bank of India (RBI)**.
<!-- commit 128 -->
