import React, { useState } from 'react';
import { Application, ValidationResult } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Unlock,
  AlertOctagon,
  FileCheck,
} from 'lucide-react';

interface Props {
  application: Application;
  validation: ValidationResult;
}

export const WorkflowSignOff: React.FC<Props> = ({ application, validation }) => {
  const {
    currentUser,
    submitForVerification,
    verifyCase,
    handOffToUnderwriting,
    escalateCase,
    resolveEscalation,
  } = useApp();

  const [escalateReasonInput, setEscalateReasonInput] = useState('');
  const [showEscalateBox, setShowEscalateBox] = useState(false);
  const [resolutionInput, setResolutionInput] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null
  );

  const isMaker = currentUser.id === application.makerUserId;
  const isReadOnly = currentUser.role === 'Auditor';

  const clearFeedbackAfterDelay = () => {
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const handleSubmit = () => {
    const res = submitForVerification(application.id);
    if (!res.success) {
      setFeedbackMsg({ type: 'error', text: res.message || 'Submission failed' });
    } else {
      setFeedbackMsg({ type: 'success', text: 'Case successfully submitted for verification!' });
    }
    clearFeedbackAfterDelay();
  };

  const handleVerify = () => {
    const res = verifyCase(application.id);
    if (!res.success) {
      setFeedbackMsg({ type: 'error', text: res.message || 'Verification failed' });
    } else {
      setFeedbackMsg({ type: 'success', text: 'Case successfully verified under four-eyes policy!' });
    }
    clearFeedbackAfterDelay();
  };

  const handleHandOff = () => {
    const res = handOffToUnderwriting(application.id);
    if (!res.success) {
      setFeedbackMsg({ type: 'error', text: res.message || 'Hand-off failed' });
    } else {
      setFeedbackMsg({
        type: 'success',
        text: 'Case transitioned to Ready for Underwriting. Handed off to human credit team.',
      });
    }
    clearFeedbackAfterDelay();
  };

  const handleEscalateSubmit = () => {
    if (!escalateReasonInput.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Please enter an escalation reason.' });
      clearFeedbackAfterDelay();
      return;
    }
    const res = escalateCase(application.id, escalateReasonInput);
    if (!res.success) {
      setFeedbackMsg({ type: 'error', text: res.message || 'Escalation failed' });
    } else {
      setFeedbackMsg({ type: 'success', text: 'Case escalated to L3 Senior Reviewer.' });
      setShowEscalateBox(false);
      setEscalateReasonInput('');
    }
    clearFeedbackAfterDelay();
  };

  const handleResolveEscalationSubmit = () => {
    const res = resolveEscalation(application.id, resolutionInput);
    if (!res.success) {
      setFeedbackMsg({ type: 'error', text: res.message || 'Resolution failed' });
    } else {
      setFeedbackMsg({
        type: 'success',
        text: 'Escalation cleared by L3 Senior Reviewer with logged justification.',
      });
      setResolutionInput('');
    }
    clearFeedbackAfterDelay();
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          <span>Hierarchy & Maker-Checker Verification (Four-Eyes Enforcement)</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enforces regulatory separation between intake preparation (maker) and verification (checker)
        </p>
      </div>

      {/* Alert banner for feedback */}
      {feedbackMsg && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center space-x-2 animate-fadeIn ${
            feedbackMsg.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
          }`}
        >
          {feedbackMsg.type === 'error' ? (
            <AlertOctagon className="w-4 h-4 shrink-0 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Current Workflow Status Card */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Current Case Status
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
            {application.status}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Maker (Intake Prep)
          </span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block">
            {application.makerUserName ? `👤 ${application.makerUserName}` : 'Not yet assigned'}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Checker (Verifier)
          </span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block">
            {application.checkerUserName ? `🔍 ${application.checkerUserName}` : 'Pending Verification'}
          </span>
        </div>
      </div>

      {/* Four-Eyes Enforce Warning Banner */}
      {application.makerUserId && isMaker && application.status === 'Pending verification' && (
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-900 dark:text-amber-200">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Four-Eyes Enforcement Active</span>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            You submitted this application as <strong>Maker ({application.makerUserName})</strong>. Under bank compliance rules, the verifier must be a <em>different user</em>. Switch to an L2 Verifier profile (e.g. Priya Sharma or Amit Patel) in the top header to proceed.
          </p>
        </div>
      )}

      {/* Escalated State Card */}
      {application.status === 'Escalated' && (
        <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-rose-900 dark:text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Case Escalated to L3 Senior Review</span>
          </div>
          <p className="text-xs text-rose-800 dark:text-rose-300">
            <strong>Reason:</strong> {application.escalationReason || 'Multiple anomalies / repeated discrepancies'}
          </p>

          {currentUser.role === 'L3 Senior Reviewer' ? (
            <div className="space-y-2 pt-2 border-t border-rose-200 dark:border-rose-900/60">
              <label className="text-xs font-bold text-rose-900 dark:text-rose-200 block">
                L3 Override / Resolution Justification (Mandatory):
              </label>
              <textarea
                rows={2}
                value={resolutionInput}
                onChange={(e) => setResolutionInput(e.target.value)}
                placeholder="Explain the supervisory review finding and basis for override..."
                className="w-full p-2 text-xs rounded-lg border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <button
                onClick={handleResolveEscalationSubmit}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
              >
                Resolve & Clear Escalation
              </button>
            </div>
          ) : (
            <p className="text-[11px] text-rose-700 dark:text-rose-400 italic">
              Switch role to <strong>L3 Senior Reviewer</strong> in the top header to review or override this escalation.
            </p>
          )}
        </div>
      )}

      {/* Step by Step Maker-Checker Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1: L1 Maker Submission */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[11px]">
                1
              </span>
              <span>L1 Maker Submission</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Intake officer confirms fields and checklist items, then submits for checker review.
            </p>
          </div>

          <button
            disabled={
              isReadOnly ||
              application.status === 'Pending verification' ||
              application.status === 'Verified' ||
              application.status === 'Ready for underwriting' ||
              application.status === 'Escalated'
            }
            onClick={handleSubmit}
            className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-40"
          >
            <span>Submit for Verification</span>
          </button>
        </div>

        {/* Step 2: L2 Verifier (Four-Eyes) */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[11px]">
                2
              </span>
              <span>L2 Checker Verification</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Authorized checker verifies KYC completeness. <em>Blocked if verifier is the maker.</em>
            </p>
          </div>

          <button
            disabled={
              isReadOnly ||
              currentUser.role === 'L1 Intake Officer' ||
              isMaker ||
              application.status !== 'Pending verification'
            }
            onClick={handleVerify}
            className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-40"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Verify Intake (Pass)</span>
          </button>
        </div>

        {/* Step 3: Underwriting Hand-Off */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[11px]">
                3
              </span>
              <span>Underwriting Hand-Off</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Transition verified intake dossier to authorized credit underwriter for decisioning.
            </p>
          </div>

          <button
            disabled={
              isReadOnly ||
              application.status !== 'Verified'
            }
            onClick={handleHandOff}
            className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg transition-colors disabled:opacity-40"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Hand Off to Underwriting</span>
          </button>
        </div>
      </div>

      {/* Escalation Trigger Button */}
      {application.status !== 'Escalated' && (
        <div className="pt-2">
          {!showEscalateBox ? (
            <button
              disabled={isReadOnly}
              onClick={() => setShowEscalateBox(true)}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center space-x-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Flag & Escalate Case to L3 Senior Reviewer</span>
            </button>
          ) : (
            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 space-y-2">
              <label className="text-xs font-bold text-rose-800 dark:text-rose-300 block">
                Escalation Justification:
              </label>
              <input
                type="text"
                value={escalateReasonInput}
                onChange={(e) => setEscalateReasonInput(e.target.value)}
                placeholder="e.g. 2+ inconsistency types, repeated employer discrepancies..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={handleEscalateSubmit}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
                >
                  Confirm Escalation
                </button>
                <button
                  onClick={() => setShowEscalateBox(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
