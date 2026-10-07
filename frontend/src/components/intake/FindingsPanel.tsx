import React, { useState } from 'react';
import { Finding, ValidationResult, FindingCategory } from '../../types';
import {
  AlertTriangle,
  CheckCircle2,
  FileX,
  AlertOctagon,
  HelpCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  validation: ValidationResult;
}

export const FindingsPanel: React.FC<Props> = ({ validation }) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');

  const filteredFindings = validation.findings.filter((f) => {
    if (activeCategoryFilter === 'All') return true;
    if (activeCategoryFilter === 'Inconsistency') {
      return f.category === 'Inconsistency' || f.category === 'Format Issue';
    }
    return f.category === activeCategoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Document Completeness Progress Bar with Breakdown */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Intake Completeness & Rule Health</span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  validation.isComplete
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : validation.completionScore >= 70
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {validation.completionScore}% Complete
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluated at {new Date(validation.validatedAt).toLocaleTimeString()} against current intake policy
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Total Findings:</span>
            <span className="font-extrabold text-slate-900 dark:text-white px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">
              {validation.findings.length}
            </span>
          </div>
        </div>

        {/* Progress bar visual */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden flex">
            {validation.isComplete ? (
              <div className="bg-emerald-500 h-full w-full rounded-full transition-all duration-500" />
            ) : (
              <>
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${validation.completionScore}%` }}
                />
                <div
                  className="bg-rose-500/80 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100 - validation.completionScore, 30)}%` }}
                />
                <div className="bg-amber-500/80 h-full flex-1 transition-all duration-300" />
              </>
            )}
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Mandatory Fields
              </span>
              <span
                className={`text-xs font-bold ${
                  validation.counts.mandatoryFields > 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {validation.counts.mandatoryFields > 0
                  ? `${validation.counts.mandatoryFields} Missing`
                  : 'Pass'}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Missing Docs
              </span>
              <span
                className={`text-xs font-bold ${
                  validation.counts.missingDocuments > 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {validation.counts.missingDocuments > 0
                  ? `${validation.counts.missingDocuments} Items`
                  : 'Pass'}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Inconsistencies
              </span>
              <span
                className={`text-xs font-bold ${
                  validation.counts.inconsistencies > 0 ? 'text-amber-600' : 'text-emerald-600'
                }`}
              >
                {validation.counts.inconsistencies > 0
                  ? `${validation.counts.inconsistencies} Discrepant`
                  : 'Pass'}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Format Checks
              </span>
              <span
                className={`text-xs font-bold ${
                  validation.counts.formatIssues > 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {validation.counts.formatIssues > 0
                  ? `${validation.counts.formatIssues} Invalid`
                  : 'Pass'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center space-x-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveCategoryFilter('All')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeCategoryFilter === 'All'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Items ({validation.findings.length})
        </button>
        <button
          onClick={() => setActiveCategoryFilter('Mandatory Field')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeCategoryFilter === 'Mandatory Field'
              ? 'bg-rose-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Mandatory Fields ({validation.counts.mandatoryFields})
        </button>
        <button
          onClick={() => setActiveCategoryFilter('Missing Document')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeCategoryFilter === 'Missing Document'
              ? 'bg-rose-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Missing Documents ({validation.counts.missingDocuments})
        </button>
        <button
          onClick={() => setActiveCategoryFilter('Inconsistency')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeCategoryFilter === 'Inconsistency'
              ? 'bg-amber-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Inconsistencies & Formats ({validation.counts.inconsistencies + validation.counts.formatIssues})
        </button>
      </div>

      {/* Findings Listing */}
      {validation.findings.length === 0 ? (
        <div className="p-8 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
            Intake Validation Fully Passed
          </h4>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-md mx-auto">
            All mandatory personal loan application inputs and KYC/income document proofs comply with intake policy. Case is ready for four-eyes checker review.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFindings.map((finding) => (
            <div
              key={finding.ruleId}
              className={`p-4 rounded-xl border transition-all ${
                finding.category === 'Mandatory Field' || finding.category === 'Missing Document'
                  ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20'
                  : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      finding.category === 'Mandatory Field' || finding.category === 'Missing Document'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                    }`}
                  >
                    {finding.category}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    {finding.ruleId}
                  </span>
                </div>

                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Field: <span className="font-semibold text-slate-700 dark:text-slate-300">{finding.field}</span>
                </span>
              </div>

              <div className="pt-2.5 space-y-2">
                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {finding.explanation}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Expected Policy Standard
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                      {finding.expected}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Observed Intake Value
                    </span>
                    <span className="text-rose-600 dark:text-rose-400 font-medium">
                      {finding.found}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Empty state prompt verified
