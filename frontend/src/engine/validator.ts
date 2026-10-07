import {
  Application,
  LoanDocument,
  ConfigurableRules,
  Finding,
  ValidationResult,
} from '../types';
import { formatINR, isValidPAN, isValidIndianMobile, calculateDateDiffDays } from '../utils/formatters';

export function validateApplication(
  app: Application,
  documents: LoanDocument[],
  rules: ConfigurableRules
): ValidationResult {
  const findings: Finding[] = [];

  // ==========================================
  // 1. MANDATORY APPLICATION FIELDS
  // ==========================================
  if (!app.applicantName || !app.applicantName.trim()) {
    findings.push({
      ruleId: 'MANDATORY_FIELD_NAME',
      category: 'Mandatory Field',
      field: 'applicantName',
      expected: 'Non-empty full legal name matching government ID',
      found: 'Missing or blank',
      explanation: 'Applicant name is required for KYC and legal identification.',
      severity: 'high',
    });
  }

  if (!app.panNumber || !app.panNumber.trim()) {
    findings.push({
      ruleId: 'MANDATORY_FIELD_PAN',
      category: 'Mandatory Field',
      field: 'panNumber',
      expected: '10-character Permanent Account Number',
      found: 'Missing or blank',
      explanation: 'PAN is legally mandatory under RBI/CBDT regulations for all personal credit intake.',
      severity: 'high',
    });
  }

  if (!app.mobileNumber || !app.mobileNumber.trim()) {
    findings.push({
      ruleId: 'MANDATORY_FIELD_MOBILE',
      category: 'Mandatory Field',
      field: 'mobileNumber',
      expected: '10-digit Indian cellular phone number',
      found: 'Missing or blank',
      explanation: 'Mobile number is required for OTP authentication and applicant correspondence.',
      severity: 'high',
    });
  }

  if (!app.requestedAmount || app.requestedAmount <= 0) {
    findings.push({
      ruleId: 'MANDATORY_FIELD_AMOUNT',
      category: 'Mandatory Field',
      field: 'requestedAmount',
      expected: `Positive loan amount between ${formatINR(rules.minRequestedAmount)} and ${formatINR(rules.maxRequestedAmount)}`,
      found: app.requestedAmount ? `${formatINR(app.requestedAmount)}` : 'Zero or missing',
      explanation: 'Requested loan amount must be specified by applicant.',
      severity: 'high',
    });
  }

  if (!app.loanPurpose || !app.loanPurpose.trim()) {
    findings.push({
      ruleId: 'MANDATORY_FIELD_PURPOSE',
      category: 'Mandatory Field',
      field: 'loanPurpose',
      expected: 'Specified purpose (e.g. Home Renovation, Medical, Education)',
      found: 'Missing or blank',
      explanation: 'Loan purpose must be recorded for intake compliance categorization.',
      severity: 'medium',
    });
  }

  if (!app.declaredMonthlyIncome || app.declaredMonthlyIncome <= 0) {
    findings.push({
      ruleId: 'MANDATORY_FIELD_INCOME',
      category: 'Mandatory Field',
      field: 'declaredMonthlyIncome',
      expected: 'Positive declared net monthly income in INR',
      found: app.declaredMonthlyIncome ? `${formatINR(app.declaredMonthlyIncome)}` : 'Zero or missing',
      explanation: 'Declared monthly income must be provided for debt capacity evaluation.',
      severity: 'high',
    });
  }

  if (!app.maskedAccountNumber || !app.maskedAccountNumber.trim()) {
    findings.push({
      ruleId: 'MANDATORY_FIELD_ACCOUNT',
      category: 'Mandatory Field',
      field: 'maskedAccountNumber',
      expected: 'Masked disbursement bank account number',
      found: 'Missing or blank',
      explanation: 'Disbursement account details must be captured during intake.',
      severity: 'high',
    });
  }

  // ==========================================
  // 2. FORMAT VALIDATION
  // ==========================================
  if (app.panNumber && app.panNumber.trim()) {
    if (!isValidPAN(app.panNumber)) {
      findings.push({
        ruleId: 'PAN_FORMAT_INVALID',
        category: 'Format Issue',
        field: 'panNumber',
        expected: 'Standard Indian PAN format (5 letters, 4 digits, 1 letter - e.g. ABCDE1234F)',
        found: app.panNumber,
        explanation: 'The provided PAN number does not conform to the Income Tax Department format.',
        severity: 'high',
      });
    }
  }

  if (app.mobileNumber && app.mobileNumber.trim()) {
    if (!isValidIndianMobile(app.mobileNumber)) {
      findings.push({
        ruleId: 'MOBILE_FORMAT_INVALID',
        category: 'Format Issue',
        field: 'mobileNumber',
        expected: '10-digit Indian cellular number starting with 6, 7, 8, or 9',
        found: app.mobileNumber,
        explanation: 'Mobile number must be a valid 10-digit Indian mobile number.',
        severity: 'medium',
      });
    }
  }

  // Aadhaar masking format check (must be masked with only last 4 digits visible)
  if (app.maskedAadhaar && app.maskedAadhaar.trim()) {
    const rawDigits = app.maskedAadhaar.replace(/[^0-9]/g, '');
    if (rawDigits.length > 4 || !app.maskedAadhaar.includes('XXXX')) {
      findings.push({
        ruleId: 'AADHAAR_UNMASKED_VIOLATION',
        category: 'Format Issue',
        field: 'maskedAadhaar',
        expected: 'Masked Aadhaar format: XXXX-XXXX-1234 (only last 4 digits visible)',
        found: app.maskedAadhaar,
        explanation: 'UIDAI compliance mandates masking of the first 8 digits of Aadhaar numbers.',
        severity: 'high',
      });
    }
  }

  // ==========================================
  // 3. REQUIRED DOCUMENTS CHECK
  // ==========================================
  const docMap = new Map<string, LoanDocument>();
  for (const doc of documents) {
    docMap.set(doc.documentType, doc);
  }

  // Check PAN document
  const panDoc = docMap.get('Identity_PAN');
  if (!panDoc || panDoc.status === 'Missing') {
    findings.push({
      ruleId: 'MISS_DOC_PAN',
      category: 'Missing Document',
      field: 'Identity_PAN',
      expected: 'Physical/e-PAN document copy with status Received',
      found: panDoc ? `Status is ${panDoc.status}` : 'Not provided in checklist',
      explanation: 'Identity proof via PAN card copy is mandatory for all personal loans.',
      severity: 'high',
    });
  }

  // Check Address Proof
  const addressDoc = docMap.get('Address_Proof');
  if (!addressDoc || addressDoc.status === 'Missing') {
    findings.push({
      ruleId: 'MISS_DOC_ADDRESS',
      category: 'Missing Document',
      field: 'Address_Proof',
      expected: 'Valid address proof (Aadhaar / Utility Bill / Passport) with status Received',
      found: addressDoc ? `Status is ${addressDoc.status}` : 'Not provided in checklist',
      explanation: 'Current residence address verification proof is required.',
      severity: 'high',
    });
  }

  // Check Bank Statement
  const bankDoc = docMap.get('Bank_Statement');
  if (!bankDoc || bankDoc.status === 'Missing') {
    findings.push({
      ruleId: 'MISS_DOC_BANK_STMT',
      category: 'Missing Document',
      field: 'Bank_Statement',
      expected: `Bank statement covering past ${rules.requiredBankStatementMonths} months with status Received`,
      found: bankDoc ? `Status is ${bankDoc.status}` : 'Not provided in checklist',
      explanation: 'Salary/operating bank account statement is mandatory to assess cash flows.',
      severity: 'high',
    });
  }

  // Check Income Proof based on employment type
  const incomeDoc = docMap.get('Income_Proof');
  if (app.employmentType === 'Salaried') {
    if (!incomeDoc || incomeDoc.status === 'Missing') {
      findings.push({
        ruleId: 'MISS_DOC_INCOME_SALARIED',
        category: 'Missing Document',
        field: 'Income_Proof',
        expected: 'Latest 3 months salary slips or Form 16 with status Received',
        found: incomeDoc ? `Status is ${incomeDoc.status}` : 'Not provided in checklist',
        explanation: 'Salaried applicants must provide recent salary slips or Form 16.',
        severity: 'high',
      });
    }
  } else if (app.employmentType === 'Self-Employed') {
    if (!incomeDoc || incomeDoc.status === 'Missing') {
      findings.push({
        ruleId: 'MISS_DOC_INCOME_SELF_EMP',
        category: 'Missing Document',
        field: 'Income_Proof',
        expected: 'Latest 2 years Income Tax Return (ITR) computation with status Received',
        found: incomeDoc ? `Status is ${incomeDoc.status}` : 'Not provided in checklist',
        explanation: 'Self-employed applicants must provide verified ITR acknowledgements & computation.',
        severity: 'high',
      });
    }
  }

  // Check for unclear documents
  documents.forEach((doc) => {
    if (doc.status === 'Unclear') {
      findings.push({
        ruleId: `DOC_UNCLEAR_${doc.documentType}`,
        category: 'Missing Document',
        field: doc.documentType,
        expected: `Legible, clear document copy for ${doc.title}`,
        found: 'Marked Unclear / Illegible by intake inspector',
        explanation: `${doc.title} is blurry or illegible and must be re-submitted by the applicant.`,
        severity: 'medium',
      });
    }
  });

  // ==========================================
  // 4. INCONSISTENCY & CROSS-DOCUMENT COMPARISON
  // ==========================================
  
  // PAN Name vs Application Name
  if (panDoc && panDoc.status === 'Received' && app.panNameOnDoc && app.applicantName) {
    const cleanApp = app.applicantName.toLowerCase().replace(/[^a-z]/g, '');
    const cleanPan = app.panNameOnDoc.toLowerCase().replace(/[^a-z]/g, '');
    if (cleanApp !== cleanPan) {
      findings.push({
        ruleId: 'PAN_NAME_MISMATCH',
        category: 'Inconsistency',
        field: 'panNameOnDoc',
        expected: `Exact match with application name "${app.applicantName}"`,
        found: `"${app.panNameOnDoc}" on PAN document`,
        explanation: 'Applicant name on loan application differs from the official name recorded on the PAN card.',
        severity: 'high',
      });
    }
  }

  // Employer Match for Salaried
  if (app.employmentType === 'Salaried' && incomeDoc && incomeDoc.status === 'Received') {
    if (app.declaredEmployer && incomeDoc.issuerOrEmployerName) {
      const cleanDeclared = app.declaredEmployer.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanDoc = incomeDoc.issuerOrEmployerName.toLowerCase().replace(/[^a-z0-9]/g, '');
      // Check if one contains the other or identical
      const isMatch = cleanDeclared.includes(cleanDoc) || cleanDoc.includes(cleanDeclared);
      if (!isMatch) {
        findings.push({
          ruleId: 'EMPLOYER_MISMATCH',
          category: 'Inconsistency',
          field: 'declaredEmployer',
          expected: `Employer matching income slip issuer "${incomeDoc.issuerOrEmployerName}"`,
          found: `"${app.declaredEmployer}" declared on application form`,
          explanation: 'Declared employer name does not match the employer stated on the salary slip / Form 16.',
          severity: 'high',
        });
      }
    }
  }

  // Income Tolerance Check
  if (incomeDoc && incomeDoc.status === 'Received' && incomeDoc.incomeAmountOnDocument && app.declaredMonthlyIncome) {
    const declared = app.declaredMonthlyIncome;
    const docIncome = incomeDoc.incomeAmountOnDocument;
    const variancePercent = Math.abs((declared - docIncome) / declared) * 100;
    
    if (variancePercent > rules.incomeTolerancePercent) {
      findings.push({
        ruleId: 'INCOME_MISMATCH',
        category: 'Inconsistency',
        field: 'declaredMonthlyIncome',
        expected: `${formatINR(docIncome)} (within ±${rules.incomeTolerancePercent}% of document income)`,
        found: `${formatINR(declared)} (variance of ${variancePercent.toFixed(1)}%)`,
        explanation: `Declared income differs from document income by ${variancePercent.toFixed(1)}%, exceeding the ${rules.incomeTolerancePercent}% intake tolerance threshold.`,
        severity: 'high',
      });
    }
  }

  // Document Freshness / Staleness Check (applies to transient proofs: Address, Income, Bank Statement; PAN is permanent identity)
  const appDate = app.applicationDate || new Date().toISOString().slice(0, 10);
  documents.forEach((doc) => {
    if (doc.documentType !== 'Identity_PAN' && doc.status === 'Received' && doc.documentDate) {
      const ageDays = calculateDateDiffDays(doc.documentDate, appDate);
      if (ageDays > rules.maxDocumentAgeDays) {
        findings.push({
          ruleId: `DOCUMENT_STALE_${doc.documentType}`,
          category: 'Inconsistency',
          field: `${doc.documentType}.documentDate`,
          expected: `Document issued within the last ${rules.maxDocumentAgeDays} days (after ${getCutoffDate(appDate, rules.maxDocumentAgeDays)})`,
          found: `Dated ${doc.documentDate} (${ageDays} days old)`,
          explanation: `${doc.title} is older than the bank's maximum allowable freshness threshold of ${rules.maxDocumentAgeDays} days.`,
          severity: 'medium',
        });
      }
    }
  });

  // Bank Statement Period & Gap Check
  if (bankDoc && bankDoc.status === 'Received') {
    const monthsCovered = bankDoc.statementMonthsCovered || 0;
    if (monthsCovered < rules.requiredBankStatementMonths) {
      findings.push({
        ruleId: 'STATEMENT_PERIOD_DEFICIT',
        category: 'Inconsistency',
        field: 'Bank_Statement.statementMonthsCovered',
        expected: `Minimum ${rules.requiredBankStatementMonths} continuous months of transactions`,
        found: `Only ${monthsCovered} months provided`,
        explanation: `Submitted bank statement covers only ${monthsCovered} months instead of the mandated ${rules.requiredBankStatementMonths} months.`,
        severity: 'high',
      });
    }
    if (bankDoc.statementHasGaps) {
      findings.push({
        ruleId: 'STATEMENT_GAP_DETECTED',
        category: 'Inconsistency',
        field: 'Bank_Statement.statementHasGaps',
        expected: 'Continuous transaction ledger with zero missing date gaps',
        found: 'Statement has missing month/date gaps',
        explanation: 'Bank statement contains discontinuous transaction periods or missing pages.',
        severity: 'high',
      });
    }
  }

  // Requested Loan Amount Bounds
  if (app.requestedAmount && app.requestedAmount > 0) {
    if (app.requestedAmount < rules.minRequestedAmount || app.requestedAmount > rules.maxRequestedAmount) {
      findings.push({
        ruleId: 'AMOUNT_OUT_OF_BOUNDS',
        category: 'Inconsistency',
        field: 'requestedAmount',
        expected: `Between ${formatINR(rules.minRequestedAmount)} and ${formatINR(rules.maxRequestedAmount)}`,
        found: formatINR(app.requestedAmount),
        explanation: `Requested loan amount is outside standard personal loan intake limits (${formatINR(rules.minRequestedAmount)} to ${formatINR(rules.maxRequestedAmount)}).`,
        severity: 'medium',
      });
    }
  }

  // Employment Start Date Chronology
  if (app.employmentStartDate && appDate) {
    if (app.employmentStartDate > appDate) {
      findings.push({
        ruleId: 'EMPLOYMENT_DATE_FUTURE',
        category: 'Inconsistency',
        field: 'employmentStartDate',
        expected: `Date on or before application date (${appDate})`,
        found: `Future date: ${app.employmentStartDate}`,
        explanation: 'Employment start date cannot be in the future relative to the loan application date.',
        severity: 'high',
      });
    }
  }

  // Grouping & Stats
  const counts = {
    mandatoryFields: findings.filter((f) => f.category === 'Mandatory Field').length,
    missingDocuments: findings.filter((f) => f.category === 'Missing Document').length,
    inconsistencies: findings.filter((f) => f.category === 'Inconsistency').length,
    formatIssues: findings.filter((f) => f.category === 'Format Issue').length,
    total: findings.length,
  };

  const isComplete = findings.length === 0;
  // Completion score calculation (weighting missing docs and mandatory fields)
  const maxPossiblePenalties = 10;
  const penalty = Math.min(
    counts.mandatoryFields * 2.5 +
      counts.missingDocuments * 2 +
      counts.inconsistencies * 1.5 +
      counts.formatIssues * 1,
    maxPossiblePenalties * 2
  );
  const completionScore = Math.max(0, Math.round(100 - (penalty / (maxPossiblePenalties * 2)) * 100));

  return {
    applicationId: app.id,
    findings,
    validatedAt: new Date().toISOString(),
    isComplete,
    completionScore: isComplete ? 100 : completionScore,
    counts,
  };
}

function getCutoffDate(baseDateStr: string, days: number): string {
  try {
    const d = new Date(baseDateStr);
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
  } catch {
    return 'valid period';
  }
}
