import { Application, LoanDocument, ValidationResult } from '../types';
import { formatINR, formatDateIndian } from './formatters';

export function generateOperationsSummary(
  app: Application,
  documents: LoanDocument[],
  validation: ValidationResult
): string {
  const parts: string[] = [];

  parts.push(`=== INTAKE OPERATIONS SUMMARY ===`);
  parts.push(`Application ID: ${app.id}`);
  parts.push(`Applicant: ${app.applicantName || 'Not Provided'}`);
  parts.push(`Employment: ${app.employmentType} (${app.declaredEmployer || 'Employer not stated'})`);
  parts.push(`Declared Net Monthly Income: ${formatINR(app.declaredMonthlyIncome)}`);
  parts.push(`Requested Loan Amount: ${formatINR(app.requestedAmount)}`);
  parts.push(`Stated Purpose: ${app.loanPurpose || 'Not Stated'}`);
  parts.push(`Application Date: ${formatDateIndian(app.applicationDate)}`);
  parts.push('');

  parts.push(`--- DOCUMENT CHECKLIST STATUS ---`);
  documents.forEach((doc) => {
    let extra = '';
    if (doc.documentType === 'Bank_Statement' && doc.statementMonthsCovered) {
      extra = ` (${doc.statementMonthsCovered} months covered${doc.statementHasGaps ? ', gaps flagged' : ''})`;
    } else if (doc.incomeAmountOnDocument) {
      extra = ` (Doc Income: ${formatINR(doc.incomeAmountOnDocument)})`;
    }
    parts.push(`• ${doc.title}: [${doc.status.toUpperCase()}]${extra}`);
  });
  parts.push('');

  parts.push(`--- INTAKE VALIDATION STATUS ---`);
  if (validation.isComplete) {
    parts.push(`STATUS: COMPLETE & CONSISTENT (100% Intake Completeness)`);
    parts.push(`All mandatory application fields, Indian identity documents (PAN / masked Aadhaar), income proofs, and bank statements have been verified with no data discrepancies.`);
    parts.push(`Case is ready for verifier review and subsequent underwriting hand-off.`);
  } else {
    parts.push(`STATUS: ACTION REQUIRED (${validation.findings.length} Finding(s) Detected)`);
    parts.push(`Intake Completeness Score: ${validation.completionScore}%`);
    parts.push('');

    if (validation.counts.mandatoryFields > 0) {
      parts.push(`[Mandatory Fields Missing (${validation.counts.mandatoryFields})]:`);
      validation.findings
        .filter((f) => f.category === 'Mandatory Field')
        .forEach((f) => parts.push(`  - ${f.field}: ${f.found}. (Expected: ${f.expected})`));
    }

    if (validation.counts.missingDocuments > 0) {
      parts.push(`[Missing / Incomplete Documents (${validation.counts.missingDocuments})]:`);
      validation.findings
        .filter((f) => f.category === 'Missing Document')
        .forEach((f) => parts.push(`  - ${f.field}: ${f.explanation}`));
    }

    if (validation.counts.inconsistencies > 0) {
      parts.push(`[Data Inconsistencies (${validation.counts.inconsistencies})]:`);
      validation.findings
        .filter((f) => f.category === 'Inconsistency')
        .forEach((f) => parts.push(`  - ${f.field}: ${f.explanation}`));
    }

    if (validation.counts.formatIssues > 0) {
      parts.push(`[Format Violations (${validation.counts.formatIssues})]:`);
      validation.findings
        .filter((f) => f.category === 'Format Issue')
        .forEach((f) => parts.push(`  - ${f.field}: ${f.explanation}`));
    }
  }

  parts.push('');
  parts.push(`[GOVERNANCE NOTICE]: Intake validation only. No lending decision, pricing, risk rating, or credit score is provided by this tool. Final determination is conducted by an authorized credit underwriter.`);

  return parts.join('\n');
}
