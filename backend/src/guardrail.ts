const FORBIDDEN_TERMS = [
  'approved',
  'rejected',
  'eligible',
  'ineligible',
  'creditworthy',
  'credit score',
  'risk score',
  'risk grade',
  'rank',
  'ranked',
  'ranking',
  'rate offer',
  'interest rate',
  'denial',
  'denied',
  'declined',
  'pre-approved',
  'pre-qualified',
];

export interface GuardrailResult {
  passed: boolean;
  violations: { term: string; context: string }[];
}

export function scanForForbiddenTerms(text: string): GuardrailResult {
  const violations: { term: string; context: string }[] = [];
  const lowerText = text.toLowerCase();

  for (const term of FORBIDDEN_TERMS) {
    const idx = lowerText.indexOf(term.toLowerCase());
    if (idx !== -1) {
      const start = Math.max(0, idx - 30);
      const end = Math.min(text.length, idx + term.length + 30);
      violations.push({
        term,
        context: `...${text.slice(start, end)}...`,
      });
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

export function assertGuardrail(text: string, source: string): void {
  const result = scanForForbiddenTerms(text);
  if (!result.passed) {
    const terms = result.violations.map(v => `"${v.term}"`).join(', ');
    throw new Error(`[GUARDRAIL] Forbidden terms found in ${source}: ${terms}`);
  }
}

export { FORBIDDEN_TERMS };
