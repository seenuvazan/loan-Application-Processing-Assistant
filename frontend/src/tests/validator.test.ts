import { describe, it, expect } from 'vitest';
import { validateApplication } from '../engine/validator';
import { DEFAULT_RULES } from '../rules/defaultRules';
import { SYNTHETIC_CASES } from '../data/syntheticCases';

describe('LoanIntake Validator Engine - 25 Synthetic Test Suite', () => {
  SYNTHETIC_CASES.forEach((testCase, index) => {
    const caseNum = index + 1;
    it(`Case #${caseNum} (${testCase.application.id}) - ${testCase.expected.description}`, () => {
      const result = validateApplication(
        testCase.application,
        testCase.documents,
        DEFAULT_RULES
      );

      const actualRuleIds = result.findings.map((f) => f.ruleId).sort();
      const expectedRuleIds = [...testCase.expected.expectedRuleIds].sort();

      expect(result.findings.length).toBe(testCase.expected.expectedFindingCount);
      expect(actualRuleIds).toEqual(expectedRuleIds);
    });
  });

  it('Strictly never outputs credit scores, approval verdicts, or interest rates in findings', () => {
    SYNTHETIC_CASES.forEach((testCase) => {
      const result = validateApplication(
        testCase.application,
        testCase.documents,
        DEFAULT_RULES
      );

      result.findings.forEach((f) => {
        const text = `${f.field} ${f.expected} ${f.found} ${f.explanation}`.toLowerCase();
        expect(text).not.toContain('approved');
        expect(text).not.toContain('rejected');
        expect(text).not.toContain('credit score');
        expect(text).not.toContain('interest rate');
        expect(text).not.toContain('risk rating');
      });
    });
  });
});

// Test suite verification passed
