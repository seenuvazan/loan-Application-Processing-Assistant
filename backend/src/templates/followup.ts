import { Finding } from '../rules/engine';

export function generateFollowUp(applicationId: string, applicantName: string | null, findings: Finding[]): string {
  if (findings.length === 0) {
    return 'NO_FOLLOW_UP_REQUIRED';
  }

  const missingFields = findings.filter(f => f.ruleId === 'R1');
  const missingDocs = findings.filter(f => f.ruleId === 'R2');
  const inconsistencies = findings.filter(f => !['R1', 'R2'].includes(f.ruleId));

  const lines: string[] = [];
  lines.push(`Dear ${applicantName || 'Applicant'},`);
  lines.push('');
  lines.push(`Thank you for submitting your personal loan application (Application ID: ${applicationId}).`);
  lines.push('');
  lines.push('Our operations team has reviewed your application and we require the following information to proceed with processing:');
  lines.push('');

  if (missingDocs.length > 0) {
    lines.push('DOCUMENTS REQUIRED:');
    for (const f of missingDocs) {
      const docType = f.field.replace('Document: ', '');
      lines.push(`  • ${docType} document — ${f.explanation}`);
    }
    lines.push('');
  }

  if (missingFields.length > 0) {
    lines.push('INFORMATION REQUIRED:');
    for (const f of missingFields) {
      lines.push(`  • ${f.field} — ${f.explanation}`);
    }
    lines.push('');
  }

  if (inconsistencies.length > 0) {
    lines.push('CLARIFICATION REQUIRED:');
    for (const f of inconsistencies) {
      lines.push(`  • ${f.field}: ${f.explanation}`);
    }
    lines.push('');
  }

  lines.push('Please provide the above by [RESPONSE DEADLINE — to be filled by operations staff].');
  lines.push('');
  lines.push('If you have any questions, please contact your assigned operations analyst.');
  lines.push('');
  lines.push('Thank you for your cooperation.');
  lines.push('');
  lines.push('Sincerely,');
  lines.push('Operations Team');
  lines.push('Personal Loans — Intake Processing');
  lines.push('');
  lines.push('─────────────────────────────────────────');
  lines.push('This communication is for document collection and intake processing purposes only.');
  lines.push('It does not constitute a lending decision or any assessment of your application.');

  return lines.join('\n');
}

}
