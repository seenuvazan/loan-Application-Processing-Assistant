import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Application, CaseStatus } from '../../types';
import { Search, CheckCircle2, AlertTriangle, ShieldCheck, Tag } from 'lucide-react';
import { formatINRCompact } from '../../utils/formatters';

const STATUS_CONFIG: Record<
  CaseStatus,
  { label: string; badgeClass: string }
> = {
  Draft: {
    label: 'Draft',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-600',
  },
  'Follow-up sent': {
    label: 'Follow-up Sent',
    badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border-sky-300 dark:border-sky-700',
  },
  'Pending verification': {
    label: 'Pending Checker',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold',
  },
  Verified: {
    label: 'Verified',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-bold',
  },
  'Ready for underwriting': {
    label: 'Underwriting Ready',
    badgeClass: 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-900 dark:from-indigo-950 dark:to-purple-950 dark:text-indigo-200 border-indigo-400 dark:border-indigo-700 font-extrabold shadow-sm',
  },
  Escalated: {
    label: 'Escalated (L3)',
    badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-700 font-extrabold',
  },
};

export const CaseList: React.FC = () => {
  const { applications, selectedCaseId, setSelectedCaseId, getValidationForCase } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (statusFilter !== 'All' && app.status !== statusFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        app.id.toLowerCase().includes(q) ||
        (app.applicantName && app.applicantName.toLowerCase().includes(q)) ||
        (app.panNumber && app.panNumber.toLowerCase().includes(q)) ||
        (app.declaredEmployer && app.declaredEmployer.toLowerCase().includes(q)) ||
        (app.mobileNumber && app.mobileNumber.includes(q))
      );
    });
  }, [applications, statusFilter, searchQuery]);

  return (
    <aside className="w-full md:w-84 lg:w-96 flex flex-col border-r-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
      {/* Header & Search */}
      <div className="p-4 border-b-2 border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/80 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <span>Intake Case Queue</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {applications.length}
            </span>
          </h2>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Ordered by ID
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, name, PAN, employer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
          {['All', 'Draft', 'Follow-up sent', 'Pending verification', 'Verified', 'Ready for underwriting', 'Escalated'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all border ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/30'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {status === 'All' ? 'All (25)' : status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Case List Scrollable Area */}
      <div className="flex-1 overflow-y-auto divide-y-2 divide-slate-100 dark:divide-slate-800/80">
        {filteredApplications.length === 0 ? (
          <div className="p-8 text-center text-xs font-medium text-slate-400">
            No applications match your filter criteria.
          </div>
        ) : (
          filteredApplications.map((app) => {
            const isSelected = app.id === selectedCaseId;
            const validation = getValidationForCase(app.id);
            const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.Draft;

            return (
              <button
                key={app.id}
                onClick={() => setSelectedCaseId(app.id)}
                className={`w-full text-left p-3.5 transition-all flex flex-col space-y-2 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50/40 dark:from-indigo-950/60 dark:to-purple-950/40 border-l-[5px] border-l-indigo-600 shadow-sm'
                    : 'border-l-[5px] border-l-transparent'
                }`}
              >
                {/* Row 1: ID, Employment Type & Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 font-mono tracking-tight bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-200/60 dark:border-indigo-800/60">
                        {app.id}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {app.employmentType}
                      </span>
                    </div>
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-white truncate mt-1">
                      {app.applicantName || 'Unnamed Applicant'}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full border whitespace-nowrap tracking-wide ${statusConfig.badgeClass}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>

                {/* Row 2: Amount & Employer */}
                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs text-indigo-600 dark:text-indigo-300">
                    {formatINRCompact(app.requestedAmount)}
                  </span>
                  <span className="truncate max-w-[140px] text-right font-medium text-slate-600 dark:text-slate-400">
                    {app.declaredEmployer || app.loanPurpose}
                  </span>
                </div>

                {/* Row 3: Completeness Bar & Findings */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      Completeness
                    </span>
                    <span
                      className={`font-black ${
                        validation.isComplete
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : validation.completionScore >= 70
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {validation.completionScore}%
                    </span>
                  </div>

                  {/* Gradient Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700/80 rounded-full h-2 overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        validation.isComplete
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : validation.completionScore >= 70
                          ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                          : 'bg-gradient-to-r from-rose-500 to-pink-500'
                      }`}
                      style={{ width: `${validation.completionScore}%` }}
                    />
                  </div>

                  {/* Findings breakdown badge pills */}
                  <div className="flex items-center justify-between text-[10px] pt-0.5">
                    {validation.findings.length === 0 ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>All checks passed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-amber-600 dark:text-amber-400 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        <span>{validation.findings.length} open issue(s)</span>
                      </span>
                    )}

                    <div className="flex items-center space-x-1 text-[9px]">
                      {validation.counts.missingDocuments > 0 && (
                        <span className="bg-rose-500 text-white font-extrabold px-1.5 py-0.2 rounded-full shadow-sm">
                          {validation.counts.missingDocuments} docs
                        </span>
                      )}
                      {validation.counts.inconsistencies > 0 && (
                        <span className="bg-amber-500 text-white font-extrabold px-1.5 py-0.2 rounded-full shadow-sm">
                          {validation.counts.inconsistencies} misc
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};
