import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  FileCheck2,
  AlertTriangle,
  ClipboardList,
  MessageSquare,
  ShieldCheck,
  History,
  ShieldAlert,
} from 'lucide-react';
import { ApplicationDataForm } from './ApplicationDataForm';
import { DocumentChecklist } from './DocumentChecklist';
import { FindingsPanel } from './FindingsPanel';
import { OperationsSummary } from './OperationsSummary';
import { CustomerFollowUp } from './CustomerFollowUp';
import { WorkflowSignOff } from './WorkflowSignOff';
import { AuditTrail } from './AuditTrail';
import { formatINRCompact } from '../../utils/formatters';

type TabKey = 'form' | 'docs' | 'findings' | 'summary' | 'followup' | 'signoff' | 'audit';

export const CaseDetail: React.FC = () => {
  const { selectedCase, selectedCaseDocuments, selectedCaseValidation } = useApp();
  const [activeTab, setActiveTab] = useState<TabKey>('form');

  if (!selectedCase || !selectedCaseValidation) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-400">
        Please select an application from the intake queue.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Top Case Identity Bar */}
      <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white rounded-xl font-black font-mono text-xs shadow-md shadow-indigo-500/20 ring-2 ring-indigo-400/30">
            {selectedCase.id}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {selectedCase.applicantName || 'Unnamed Applicant'}
              </h2>
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {selectedCase.employmentType}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Requested: <strong className="text-slate-800 dark:text-slate-200 font-black">{formatINRCompact(selectedCase.requestedAmount)}</strong> • Employer: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{selectedCase.declaredEmployer || 'N/A'}</span> • PAN: <span className="font-mono">{selectedCase.panNumber || 'Missing'}</span>
            </p>
          </div>
        </div>

        {/* Status Pill & Completeness indicator */}
        <div className="flex items-center space-x-3.5">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Intake Score
            </span>
            <span
              className={`text-xs font-black ${
                selectedCaseValidation.isComplete
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {selectedCaseValidation.completionScore}% ({selectedCaseValidation.findings.length} findings)
            </span>
          </div>

          <span
            className={`px-3.5 py-1 text-xs font-extrabold rounded-full border shadow-sm ${
              selectedCase.status === 'Verified'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700'
                : selectedCase.status === 'Ready for underwriting'
                ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-900 border-indigo-400 dark:from-indigo-950 dark:to-purple-950 dark:text-indigo-200 dark:border-indigo-700'
                : selectedCase.status === 'Escalated'
                ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-700'
                : selectedCase.status === 'Follow-up sent'
                ? 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-700'
                : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700'
            }`}
          >
            {selectedCase.status}
          </span>
        </div>
      </div>

      {/* Colourful & Defined Tabs Header Navigation */}
      <div className="px-6 bg-white dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 flex items-center space-x-1.5 overflow-x-auto scrollbar-none shrink-0 py-1.5">
        <button
          onClick={() => setActiveTab('form')}
          className={`flex items-center space-x-2 py-2 px-3 text-xs font-bold rounded-xl transition-all border ${
            activeTab === 'form'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-500" />
          <span>Application Data</span>
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center space-x-2 py-2 px-3 text-xs font-bold rounded-xl transition-all border ${
            activeTab === 'docs'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-emerald-500" />
          <span>Document Checklist</span>
          {selectedCaseDocuments.some((d) => d.status === 'Missing') && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('findings')}
          className={`flex items-center space-x-2 py-2 px-3 text-xs font-bold rounded-xl transition-all border ${
            activeTab === 'findings'
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Findings & Progress</span>
          {selectedCaseValidation.findings.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-sm">
              {selectedCaseValidation.findings.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center space-x-2 py-2 px-3 text-xs font-bold rounded-xl transition-all border ${
            activeTab === 'summary'
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4 text-indigo-500" />
          <span>Operations Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('followup')}
          className={`flex items-center space-x-2 py-2 px-3 text-xs font-bold rounded-xl transition-all border ${
            activeTab === 'followup'
              ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-purple-500" />
          <span>Customer Follow-Up</span>
        </button>

        <button
          onClick={() => setActiveTab('signoff')}
          className={`flex items-center space-x-2 py-2 px-3 text-xs font-bold rounded-xl transition-all border ${
            activeTab === 'signoff'
              ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-cyan-500" />
          <span>Maker-Checker Sign-Off</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center space-x-2 py-2 px-3 text-xs font-bold rounded-xl transition-all border ${
            activeTab === 'audit'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4 text-slate-500" />
          <span>Audit Trail</span>
        </button>
      </div>

      {/* Main Tab Content View */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {activeTab === 'form' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm">
              <ApplicationDataForm
                application={selectedCase}
                findings={selectedCaseValidation.findings}
              />
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm">
              <DocumentChecklist
                application={selectedCase}
                documents={selectedCaseDocuments}
                findings={selectedCaseValidation.findings}
              />
            </div>
          )}

          {activeTab === 'findings' && (
            <div className="space-y-4">
              <FindingsPanel validation={selectedCaseValidation} />
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm">
              <OperationsSummary
                application={selectedCase}
                documents={selectedCaseDocuments}
                validation={selectedCaseValidation}
              />
            </div>
          )}

          {activeTab === 'followup' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm">
              <CustomerFollowUp
                application={selectedCase}
                validation={selectedCaseValidation}
              />
            </div>
          )}

          {activeTab === 'signoff' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm">
              <WorkflowSignOff
                application={selectedCase}
                validation={selectedCaseValidation}
              />
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm">
              <AuditTrail applicationId={selectedCase.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

  return null;
};
