import React, { useState, useEffect } from 'react';
import { Application, ValidationResult } from '../../types';
import { useApp } from '../../context/AppContext';
import { generateCustomerFollowUp } from '../../utils/followupGenerator';
import { Copy, Send, Check, Languages, CheckCircle2, MessageSquare } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

interface Props {
  application: Application;
  validation: ValidationResult;
}

export const CustomerFollowUp: React.FC<Props> = ({ application, validation }) => {
  const { markFollowUpSent, currentUser } = useApp();
  const isReadOnly = currentUser.role === 'Auditor';

  const [language, setLanguage] = useState<'en' | 'hi' | 'ta'>(
    application.followUpLanguage || 'en'
  );
  const [draftContent, setDraftContent] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSentFeedback, setIsSentFeedback] = useState(false);

  useEffect(() => {
    setDraftContent(generateCustomerFollowUp(application, validation, language));
  }, [application, validation, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draftContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSend = () => {
    if (isReadOnly) return;
    markFollowUpSent(application.id, language);
    setIsSentFeedback(true);
    setTimeout(() => setIsSentFeedback(false), 2500);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <span>Customer Follow-Up Notice Draft</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Consolidated request covering all outstanding KYC and income documentation items
          </p>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <Languages className="w-3.5 h-3.5 text-slate-400 ml-1 mr-0.5" />
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              language === 'en'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              language === 'hi'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            हिन्दी (Hindi)
          </button>
          <button
            onClick={() => setLanguage('ta')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              language === 'ta'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            தமிழ் (Tamil)
          </button>
        </div>
      </div>

      {/* Sent status badge */}
      {application.followUpSentAt && (
        <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 rounded-lg text-xs text-blue-700 dark:text-blue-300">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>
            Follow-up notice dispatched to applicant on{' '}
            <strong className="font-semibold">{formatDateTime(application.followUpSentAt)}</strong>
          </span>
        </div>
      )}

      {/* Draft text area */}
      <div className="relative">
        <textarea
          rows={14}
          value={draftContent}
          onChange={(e) => setDraftContent(e.target.value)}
          className="w-full p-4 text-xs font-sans rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          placeholder="Draft message content..."
        />
      </div>

      {/* Action footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <span className="text-[11px] text-slate-400">
          {validation.isComplete
            ? '✓ No items pending; polite completion notice generated.'
            : `Draft covers ${validation.findings.length} open clarification items in a single notice.`}
        </span>

        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <button
            onClick={handleCopy}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>

          {!validation.isComplete && (
            <button
              disabled={isReadOnly}
              onClick={handleSend}
              className={`flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-all disabled:opacity-50 ${
                isSentFeedback
                  ? 'bg-emerald-600'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isSentFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Marked as Sent!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Mark Follow-Up Sent</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
