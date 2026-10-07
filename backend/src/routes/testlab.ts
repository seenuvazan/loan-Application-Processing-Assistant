import { Router, Request, Response } from 'express';
import { validateApplication } from '../rules/engine';
import { EXPECTED_VALIDATIONS } from '../db/seed';

const router = Router();

// GET /api/testlab
router.get('/', (_req: Request, res: Response) => {
  const results = EXPECTED_VALIDATIONS.map(({ applicationId, expectedRuleIds }) => {
    const { findings, validatedAt } = validateApplication(applicationId);
    const actualRuleIds = findings.map(f => f.ruleId);

    // Check: every expected ruleId appears at least once in actual
    const expectedUnique = [...new Set(expectedRuleIds)];
    const missingExpected = expectedUnique.filter(r => !actualRuleIds.includes(r));

    // Unexpected findings (excluding complete apps — extra R1/R2 from empty fields shouldn't count as false positives if expected is empty)
    const actualUnique = [...new Set(actualRuleIds)];
    const unexpected = actualUnique.filter(r => !expectedRuleIds.includes(r));

    const pass = missingExpected.length === 0 && unexpected.length === 0;

    return {
      applicationId,
      pass,
      expectedRuleIds,
      actualRuleIds,
      findings,
      missingExpected,
      unexpected,
      validatedAt,
    };
  });

  const passed = results.filter(r => r.pass).length;
  const total = results.length;

  res.json({
    passed,
    total,
    matchPercent: Math.round((passed / total) * 100),
    results,
  });
});

// POST /api/testlab/run — re-run with current rules
router.post('/run', (_req: Request, res: Response) => {
  const results = EXPECTED_VALIDATIONS.map(({ applicationId, expectedRuleIds }) => {
    const { findings, validatedAt } = validateApplication(applicationId);
    const actualRuleIds = findings.map(f => f.ruleId);
    const expectedUnique = [...new Set(expectedRuleIds)];
    const missingExpected = expectedUnique.filter(r => !actualRuleIds.includes(r));
    const actualUnique = [...new Set(actualRuleIds)];
    const unexpected = actualUnique.filter(r => !expectedRuleIds.includes(r));
    const pass = missingExpected.length === 0 && unexpected.length === 0;

    return { applicationId, pass, expectedRuleIds, actualRuleIds, findings, missingExpected, unexpected, validatedAt };
  });

  const passed = results.filter(r => r.pass).length;
  res.json({ passed, total: results.length, matchPercent: Math.round((passed / results.length) * 100), results });
});

export default router;
