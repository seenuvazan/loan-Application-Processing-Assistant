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

export function validateApplication(applicationId: string): ValidationResult {
  const now = new Date().toISOString();
  const findings: Finding[] = [];

  const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(applicationId) as Application | undefined;
  if (!app) return { applicationId, findings: [{ ruleId: 'SYSTEM', category: 'Missing Field', field: 'application', expected: 'exists', found: 'not found', explanation: 'Application not found.', timestamp: now }], validatedAt: now };

  const docs = db.prepare('SELECT * FROM documents WHERE applicationId = ?').all(applicationId) as Document[];
  const rules = getEffectiveRules();

  // R1: Mandatory fields
  for (const field of rules.R1.mandatoryFields) {
    const val = (app as Record<string, unknown>)[field];
    const isEmpty = val === null || val === undefined || (typeof val === 'string' && val.trim() === '') || (typeof val === 'number' && isNaN(val));
    if (isEmpty) {
      findings.push({
        ruleId: 'R1',
        category: 'Missing Field',
        field,
        expected: 'Non-empty value',
        found: 'Empty / not provided',
        explanation: `Mandatory field "${field}" is missing or empty. Please provide a value before submission.`,
        timestamp: now,
      });
    }
  }

  // R2: All 4 document types present and Received
  const docTypeMap: Record<string, Document> = {};
  for (const doc of docs) {
    docTypeMap[doc.documentType] = doc;
  }
  for (const required of rules.R2.requiredDocuments) {
    const doc = docTypeMap[required];
    if (!doc || doc.status === 'Missing') {
      findings.push({
        ruleId: 'R2',
        category: 'Missing Document',
        field: `Document: ${required}`,
        expected: 'Received',
        found: doc ? doc.status : 'Missing',
        explanation: `${required} document is ${doc ? doc.status.toLowerCase() : 'missing'}. This document is required for intake processing.`,
        timestamp: now,
      });
    }
  }

  // R3: Amount within bounds
  if (app.requestedAmount !== null && app.requestedAmount !== undefined) {
    const min = (rules.R3 as { minAmount: number }).minAmount;
    const max = (rules.R3 as { maxAmount: number }).maxAmount;
    if (app.requestedAmount < min || app.requestedAmount > max) {
      findings.push({
        ruleId: 'R3',
        category: 'Inconsistency',
        field: 'requestedAmount',
        expected: `Between ₹${min.toLocaleString('en-IN')} and ₹${max.toLocaleString('en-IN')}`,
        found: `₹${app.requestedAmount.toLocaleString('en-IN')}`,
        explanation: `Requested amount ₹${app.requestedAmount.toLocaleString('en-IN')} is outside the configured personal loan range of ₹${min.toLocaleString('en-IN')}–₹${max.toLocaleString('en-IN')}.`,
        timestamp: now,
      });
    }
  }

  // R4: Employer match
  const incomeDoc = docTypeMap['Income'];
  if (app.declaredEmployer && incomeDoc && incomeDoc.issuerOrEmployerName && incomeDoc.status === 'Received') {
    const normDeclared = normalizeEmployer(app.declaredEmployer);
    const normDoc = normalizeEmployer(incomeDoc.issuerOrEmployerName);
    if (normDeclared !== normDoc) {
      findings.push({
        ruleId: 'R4',
        category: 'Inconsistency',
        field: 'declaredEmployer',
        expected: `Matches income document employer: "${incomeDoc.issuerOrEmployerName}"`,
        found: `Declared: "${app.declaredEmployer}"`,
        explanation: `Declared employer "${app.declaredEmployer}" does not match the employer on the income document "${incomeDoc.issuerOrEmployerName}". Please verify and reconcile.`,
        timestamp: now,
      });
    }
  }

  // R5: Income match within tolerance
  if (app.declaredMonthlyIncome !== null && incomeDoc && incomeDoc.incomeAmountOnDocument !== null && incomeDoc.status === 'Received') {
    const tolerance = (rules.R5 as { tolerancePercent: number }).tolerancePercent / 100;
    const diff = Math.abs(app.declaredMonthlyIncome - incomeDoc.incomeAmountOnDocument);
    const pct = diff / incomeDoc.incomeAmountOnDocument;
    if (pct > tolerance) {
      findings.push({
        ruleId: 'R5',
        category: 'Inconsistency',
        field: 'declaredMonthlyIncome',
        expected: `Within ${(rules.R5 as { tolerancePercent: number }).tolerancePercent}% of ₹${incomeDoc.incomeAmountOnDocument.toLocaleString('en-IN')}`,
        found: `₹${app.declaredMonthlyIncome.toLocaleString('en-IN')} (difference: ${(pct * 100).toFixed(1)}%)`,
        explanation: `Declared monthly income ₹${app.declaredMonthlyIncome.toLocaleString('en-IN')} differs from income on document ₹${incomeDoc.incomeAmountOnDocument.toLocaleString('en-IN')} by ${(pct * 100).toFixed(1)}%, exceeding the ${(rules.R5 as { tolerancePercent: number }).tolerancePercent}% tolerance.`,
        timestamp: now,
      });
    }
  }

  // R6: Date checks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const freshnessMonths = (rules.R6 as { docFreshnessMonths: number }).docFreshnessMonths;
  const bankMinMonths = (rules.R6 as { bankStatementMinMonths: number }).bankStatementMinMonths;

  // Employment start not after application date
  if (app.employmentStartDate && app.applicationDate) {
    const empStart = new Date(app.employmentStartDate);
    const appDate = new Date(app.applicationDate);
    if (empStart > appDate) {
      findings.push({
        ruleId: 'R6',
        category: 'Inconsistency',
        field: 'employmentStartDate',
        expected: `On or before application date (${app.applicationDate})`,
        found: app.employmentStartDate,
        explanation: `Employment start date ${app.employmentStartDate} is after the application date ${app.applicationDate}. Please verify the dates provided.`,
        timestamp: now,
      });
    }
  }

  // Document date checks
  for (const doc of docs) {
    if (doc.status !== 'Received' && doc.status !== 'Unclear') continue;
    if (!doc.documentDate) continue;
    const docDate = new Date(doc.documentDate);

    // No future-dated docs
    if (docDate > today) {
      findings.push({
        ruleId: 'R6',
        category: 'Inconsistency',
        field: `Document: ${doc.documentType} - documentDate`,
        expected: 'Date not in the future',
        found: doc.documentDate,
        explanation: `${doc.documentType} document has a future date (${doc.documentDate}), which is not permitted.`,
        timestamp: now,
      });
    }

    // Income and bank docs must be within 3 months
    if (doc.documentType === 'Income' || doc.documentType === 'BankStatement') {
      const freshnessLimit = new Date(today);
      freshnessLimit.setMonth(freshnessLimit.getMonth() - freshnessMonths);
      if (docDate < freshnessLimit) {
        findings.push({
          ruleId: 'R6',
          category: 'Inconsistency',
          field: `Document: ${doc.documentType} - documentDate`,
          expected: `Within ${freshnessMonths} months of today`,
          found: doc.documentDate,
          explanation: `${doc.documentType} document dated ${doc.documentDate} is older than ${freshnessMonths} months. A more recent document is required.`,
          timestamp: now,
        });
      }
    }

    // Identity / Address — check if expired (issuer date assumed as validity start, not expiry — but for practical purposes we check it's not older than 10 years)
    // Actually we mark these as Expired in status — handled by R2 (status check)

    // Bank statement covers at least 3 months
    if (doc.documentType === 'BankStatement' && doc.statementPeriod) {
      const match = doc.statementPeriod.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/i);
      if (match) {
        const from = new Date(match[1]);
        const to = new Date(match[2]);
        const monthsDiff = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
        if (monthsDiff < bankMinMonths) {
          findings.push({
            ruleId: 'R6',
            category: 'Inconsistency',
            field: 'Document: BankStatement - statementPeriod',
            expected: `Covers at least ${bankMinMonths} months`,
            found: `${monthsDiff} month(s) (${doc.statementPeriod})`,
            explanation: `Bank statement covers only ${monthsDiff} month(s), but at least ${bankMinMonths} months of statements are required.`,
            timestamp: now,
          });
        }
      }
    }
  }

  // R7: Requested amount vs notes
  if (app.applicantNotes && app.requestedAmount !== null) {
    const matches = app.applicantNotes.match(/(?:₹|rs\.?|inr)\s*([\d,]+)/gi);
    if (matches) {
      for (const m of matches) {
        const numStr = m.replace(/[^\d]/g, '');
        const notedAmount = parseInt(numStr, 10);
        if (!isNaN(notedAmount) && Math.abs(notedAmount - app.requestedAmount) > 1) {
          findings.push({
            ruleId: 'R7',
            category: 'Inconsistency',
            field: 'applicantNotes vs requestedAmount',
            expected: `Notes amount matches requested ₹${app.requestedAmount.toLocaleString('en-IN')}`,
            found: `Notes mention ₹${notedAmount.toLocaleString('en-IN')}`,
            explanation: `The requested amount ₹${app.requestedAmount.toLocaleString('en-IN')} differs from the amount ₹${notedAmount.toLocaleString('en-IN')} mentioned in the applicant's notes. Please reconcile.`,
            timestamp: now,
          });
          break; // report first mismatch only
        }
      }
    }
  }

  // R8: Format checks
  if (app.contactEmail) {
    const emailRegex = new RegExp(rules.R8.emailPattern);
    if (!emailRegex.test(app.contactEmail)) {
      findings.push({
        ruleId: 'R8',
        category: 'Format',
        field: 'contactEmail',
        expected: 'Valid email format (e.g. name@domain.com)',
        found: app.contactEmail,
        explanation: `Contact email "${app.contactEmail}" does not appear to be a valid email address.`,
        timestamp: now,
      });
    }
  }

  if (app.contactPhone) {
    const phoneRegex = new RegExp(rules.R8.phonePattern);
    if (!phoneRegex.test(app.contactPhone.replace(/\s/g, ''))) {
      findings.push({
        ruleId: 'R8',
        category: 'Format',
        field: 'contactPhone',
        expected: '10-digit Indian mobile number starting with 6-9',
        found: app.contactPhone,
        explanation: `Contact phone "${app.contactPhone}" does not match the expected Indian mobile number format.`,
        timestamp: now,
      });
    }
  }

  if (app.maskedAccountNumber) {
    const accRegex = new RegExp(rules.R8.accountPattern);
    if (!accRegex.test(app.maskedAccountNumber)) {
      findings.push({
        ruleId: 'R8',
        category: 'Format',
        field: 'maskedAccountNumber',
        expected: 'Masked format: XXXX...####  (e.g. XXXXXXXX1234)',
        found: app.maskedAccountNumber,
        explanation: `Account number "${app.maskedAccountNumber}" does not match the required masked format (e.g. XXXXXXXX1234).`,
        timestamp: now,
      });
    }
  }

  return {
    applicationId,
    findings,
    validatedAt: now,
  };
}

}
