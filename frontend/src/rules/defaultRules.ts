import { ConfigurableRules } from '../types';

export const DEFAULT_RULES: ConfigurableRules = {
  incomeTolerancePercent: 10, // 10% allowed variance between declared income & document income
  maxDocumentAgeDays: 90, // Document must not be older than 90 days from application date
  minRequestedAmount: 50000, // ₹50,000 minimum loan request
  maxRequestedAmount: 4000000, // ₹40,00,000 (40 Lakhs) maximum personal loan limit
  requiredBankStatementMonths: 6, // 6 months of continuous statement required
};

export const RULE_DEFINITIONS = [
  {
    id: 'MANDATORY_FIELDS',
    category: 'Mandatory Field',
    name: 'Mandatory Application Fields',
    description: 'Applicant name, PAN, mobile, declared income, requested amount, purpose, employment type, and account number must be provided.',
  },
  {
    id: 'PAN_FORMAT',
    category: 'Format Issue',
    name: 'Valid Indian PAN Pattern',
    description: 'PAN must strictly adhere to the Indian Income Tax format: 5 uppercase letters, 4 digits, 1 letter (e.g. ABCDE1234F).',
  },
  {
    id: 'MOBILE_FORMAT',
    category: 'Format Issue',
    name: '10-Digit Indian Mobile Number',
    description: 'Mobile number must be a valid 10-digit Indian cellular number starting with 6, 7, 8, or 9.',
  },
  {
    id: 'AADHAAR_MASKED',
    category: 'Format Issue',
    name: 'Aadhaar Masking Standard',
    description: 'Aadhaar must only display masked digits with only the last 4 digits visible (XXXX-XXXX-1234) as per UIDAI guidelines.',
  },
  {
    id: 'REQUIRED_DOCUMENTS',
    category: 'Missing Document',
    name: 'Mandatory KYC & Income Set',
    description: 'Must provide PAN doc, Address proof, Bank statement, and income proof (Salary slip/Form 16 for Salaried, ITR for Self-Employed).',
  },
  {
    id: 'NAME_MATCH',
    category: 'Inconsistency',
    name: 'PAN Name vs Application Name Match',
    description: 'The name printed on the PAN document must match the applicant name on the loan form.',
  },
  {
    id: 'EMPLOYER_MATCH',
    category: 'Inconsistency',
    name: 'Declared vs Document Employer/Entity',
    description: 'For salaried applicants, declared employer must match the employer on salary slips/Form 16.',
  },
  {
    id: 'INCOME_TOLERANCE',
    category: 'Inconsistency',
    name: 'Income Variance Tolerance',
    description: 'Declared income must not deviate from document income by more than the configurable tolerance threshold.',
  },
  {
    id: 'DOCUMENT_STALENESS',
    category: 'Inconsistency',
    name: 'Document Age Freshness',
    description: 'Address proof, salary slips, and recent statements must not be older than the configurable freshness days.',
  },
  {
    id: 'STATEMENT_PERIOD',
    category: 'Inconsistency',
    name: 'Bank Statement Period & Continuity',
    description: 'Bank statement must cover the required months continuously without any period gaps.',
  },
  {
    id: 'LOAN_AMOUNT_RANGE',
    category: 'Inconsistency',
    name: 'Requested Loan Amount Bounds',
    description: 'Requested amount must be between the configured min (₹50k) and max (₹40L) thresholds.',
  },
  {
    id: 'DATE_CHRONOLOGY',
    category: 'Inconsistency',
    name: 'Date Chronology & Validity',
    description: 'Employment start date must not be in the future relative to the application date.',
  },
];
