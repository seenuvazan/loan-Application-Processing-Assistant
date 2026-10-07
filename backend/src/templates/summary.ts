import { Finding } from '../rules/engine';

interface Application {
  id: string;
  applicantName: string | null;
  requestedAmount: number | null;
  loanPurpose: string | null;
  employmentType: string | null;
  declaredEmployer: string | null;
  declaredMonthlyIncome: number | null;
  applicationDate: string | null;
}

interface Document {
  documentType: string;
  status: string;
}

export function generateSummary(app: Application, docs: Document[], findings: Finding[]): string {
  const fmt = (n: number | null) => n !== null ? `₹${n.toLocaleString('en-IN')}` : 'Not provided';
  const dateStr = app.applicationDate ? new Date(app.applicationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Not provided';

  const docStatuses = ['Identity', 'Address', 'Income', 'BankStatement'].map(type => {
    const doc = docs.find(d => d.documentType === type);
    return `  • ${type}: ${doc ? doc.status : 'Missing'}`;
  }).join('\n');

  const missingFields = findings.filter(f => f.ruleId === 'R1').map(f => `  • ${f.field}`).join('\n') || '  • None';
  const missingDocs = findings.filter(f => f.ruleId === 'R2').map(f => `  • ${f.field.replace('Document: ', '')}`).join('\n') || '  • None';
  const inconsistencies = findings.filter(f => !['R1', 'R2'].includes(f.ruleId));
  const formatIssues = findings.filter(f => f.ruleId === 'R8');
  const otherFindings = findings.filter(f => !['R1', 'R2', 'R8'].includes(f.ruleId));

  const inconsistencyText = [...otherFindings, ...formatIssues].map(f =>
    `  • [${f.ruleId}] ${f.field}\n    Expected: ${f.expected}\n    Found: ${f.found}\n    Note: ${f.explanation}`
  ).join('\n\n') || '  • None';

  const totalFindings = findings.length;
  const status = totalFindings === 0 ? 'COMPLETE — No outstanding items' : `INCOMPLETE — ${totalFindings} item(s) require attention`;

  return `INTAKE VALIDATION SUMMARY
Application ID: ${app.id}
Generated: ${new Date().toLocaleString('en-IN')}
Status: ${status}

─────────────────────────────────────────
CASE SNAPSHOT
─────────────────────────────────────────
Applicant Name  : ${app.applicantName || 'Not provided'}
Application Date: ${dateStr}
Loan Purpose    : ${app.loanPurpose || 'Not provided'}
Requested Amount: ${fmt(app.requestedAmount)}
Employment Type : ${app.employmentType || 'Not provided'}
Employer        : ${app.declaredEmployer || 'Not provided'}
Declared Income : ${fmt(app.declaredMonthlyIncome)} per month

─────────────────────────────────────────
DOCUMENT STATUS
─────────────────────────────────────────
${docStatuses}

─────────────────────────────────────────
OUTSTANDING ITEMS
─────────────────────────────────────────
Missing Mandatory Fields:
${missingFields}

Missing Documents:
${missingDocs}

Inconsistencies & Format Issues:
${inconsistencyText}

─────────────────────────────────────────
NOTE: This summary is for operational intake processing only.
No lending decision, credit assessment, or applicant evaluation
is made or implied by this tool. All final determinations are
made by an authorized human reviewer.
─────────────────────────────────────────`;
}

  return "";
}
