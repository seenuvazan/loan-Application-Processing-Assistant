import rulesConfig from './rules.json';
import db from '../db/database';

export interface Finding {
  ruleId: string;
  category: 'Missing Field' | 'Missing Document' | 'Inconsistency' | 'Format';
  field: string;
  expected: string;
  found: string;
  explanation: string;
  timestamp: string;
}

export interface ValidationResult {
  applicationId: string;
  findings: Finding[];
  validatedAt: string;
}

interface Application {
  id: string;
  applicantName: string | null;
  requestedAmount: number | null;
  loanPurpose: string | null;
  employmentType: string | null;
  declaredEmployer: string | null;
  declaredMonthlyIncome: number | null;
  applicationDate: string | null;
  employmentStartDate: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  maskedAccountNumber: string | null;
  applicantNotes: string | null;
}

interface Document {
  id: string;
  applicationId: string;
  documentType: 'Identity' | 'Address' | 'Income' | 'BankStatement';
  status: 'Received' | 'Missing' | 'Expired' | 'Unclear';
  documentDate: string | null;
  issuerOrEmployerName: string | null;
  incomeAmountOnDocument: number | null;
  statementPeriod: string | null;
}

function normalizeEmployer(name: string | null): string {
  if (!name) return '';
  return name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function getEffectiveRules(): typeof rulesConfig {
  // Check DB for overrides
  const row = db.prepare("SELECT value FROM rule_config WHERE key = 'overrides'").get() as { value: string } | undefined;
  if (row) {
    try {
      const overrides = JSON.parse(row.value);
      return { ...rulesConfig, ...overrides } as typeof rulesConfig;
    } catch {
      return rulesConfig;
    }
  }
  return rulesConfig;
}

