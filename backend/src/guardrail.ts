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

