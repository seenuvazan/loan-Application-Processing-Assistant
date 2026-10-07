import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SYNTHETIC_CASES } from '../../data/syntheticCases';
import { validateApplication } from '../../engine/validator';
import { TestEvidenceResult } from '../../types';
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  Download,
  Search,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const ValidationEvidence: React.FC = () => {
  const { rules } = useApp();
  const [filter, setFilter] = useState<'All' | 'Matched' | 'Mismatched'>('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Compute test evidence across all 25 synthetic cases against active rules
  const evidenceResults: TestEvidenceResult[] = useMemo(() => {
    return SYNTHETIC_CASES.map((sc) => {
      const validation = validateApplication(sc.application, sc.documents, rules);
      const actualRuleIds = validation.findings.map((f) => f.ruleId).sort();
      const expectedRuleIds = [...sc.expected.expectedRuleIds].sort();

      const missingRuleIds = expectedRuleIds.filter((r) => !actualRuleIds.includes(r));
      const unexpectedRuleIds = actualRuleIds.filter((r) => !expectedRuleIds.includes(r));

      const matched =
        validation.findings.length === sc.expected.expectedFindingCount &&
        missingRuleIds.length === 0 &&
        unexpectedRuleIds.length === 0;

      return {
        applicationId: sc.application.id,
        applicantName: sc.application.applicantName || 'Unnamed',
        description: sc.expected.description,
        expectedRuleIds,
        actualRuleIds,
        expectedCount: sc.expected.expectedFindingCount,
        actualCount: validation.findings.length,
        matched,
        missingRuleIds,
        unexpectedRuleIds,
        actualFindings: validation.findings,
      };
    });
  }, [rules]);

  const totalCases = evidenceResults.length;
  const matchedCases = evidenceResults.filter((r) => r.matched).length;
  const matchRate = Math.round((matchedCases / totalCases) * 100);

  const filtered = useMemo(() => {
    return evidenceResults.filter((r) => {
      if (filter === 'Matched' && !r.matched) return false;
      if (filter === 'Mismatched' && r.matched) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.applicationId.toLowerCase().includes(q) ||
        r.applicantName.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    });
  }, [evidenceResults, filter, search]);

  const exportCSV = () => {
    const headers = [
      'Application_ID',
      'Applicant_Name',
      'Test_Scenario_Description',
      'Expected_Count',
      'Actual_Count',
      'Expected_Rule_IDs',
      'Actual_Rule_IDs',
      'Validation_Match_Status',
    ];
    const rows = evidenceResults.map((r) => [
      `"${r.applicationId}"`,
      `"${r.applicantName}"`,
      `"${r.description.replace(/"/g, '""')}"`,
      r.expectedCount,
      r.actualCount,
      `"${r.expectedRuleIds.join(', ')}"`,
      `"${r.actualRuleIds.join(', ')}"`,
      r.matched ? 'MATCH' : 'MISMATCH',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Validation_Evidence_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Evidence Summary Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Validation Evidence Laboratory (25 Synthetic Cases)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated regression test suite validating the intake engine against expected outcomes
              </p>
            </div>
          </div>
        </div>

        {/* Big Metrics Ring / Pill */}
        <div className="flex items-center space-x-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center min-w-[130px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Match Accuracy
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {matchRate}%
            </span>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block">
              {matchedCases} / {totalCases} Cases
            </span>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center space-x-2 px-4 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export Evidence (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('All')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'All'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All 25 Cases
          </button>
          <button
            onClick={() => setFilter('Matched')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'Matched'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Matched ({matchedCases})
          </button>
          <button
            onClick={() => setFilter('Mismatched')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'Mismatched'
                ? 'bg-rose-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Mismatches ({totalCases - matchedCases})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search scenarios or IDs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Evidence Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4 w-12"></th>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Scenario Description</th>
                <th className="py-3 px-4 text-center">Expected</th>
                <th className="py-3 px-4 text-center">Actual</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.map((r) => {
                const isExpanded = expandedId === r.applicationId;
                return (
                  <React.Fragment key={r.applicationId}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : r.applicationId)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 text-slate-400 text-center">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {r.applicationId}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {r.applicantName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-md">
                        {r.description}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                        {r.expectedCount}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                        {r.actualCount}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {r.matched ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>MATCH</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <XCircle className="w-3 h-3" />
                            <span>MISMATCH</span>
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Expandable finding breakdown */}
                    {isExpanded && (
                      <tr className="bg-slate-50/60 dark:bg-slate-950/40">
                        <td colSpan={7} className="p-4 pl-12 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                Expected Rule IDs ({r.expectedRuleIds.length})
                              </span>
                              {r.expectedRuleIds.length === 0 ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium italic">
                                  None (clean compliant case expected)
                                </span>
                              ) : (
                                <div className="flex flex-wrap gap-1">
                                  {r.expectedRuleIds.map((id) => (
                                    <span
                                      key={id}
                                      className="px-2 py-0.5 rounded font-mono text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                                    >
                                      {id}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                Actual Findings Evaluated ({r.actualCount})
                              </span>
                              {r.actualFindings.length === 0 ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium italic">
                                  0 findings generated
                                </span>
                              ) : (
                                <div className="space-y-1.5">
                                  {r.actualFindings.map((f) => (
                                    <div
                                      key={f.ruleId}
                                      className="text-[11px] text-slate-700 dark:text-slate-300 flex items-start space-x-1.5"
                                    >
                                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                        [{f.ruleId}]
                                      </span>
                                      <span>
                                        {f.field}: {f.explanation}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
