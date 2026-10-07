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
