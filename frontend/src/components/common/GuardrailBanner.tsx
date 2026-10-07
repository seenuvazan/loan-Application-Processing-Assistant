import React from 'react';
import { ShieldAlert, AlertCircle } from 'lucide-react';

export const GuardrailBanner: React.FC = () => {
  return (
    <div className="bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-900 dark:text-amber-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-semibold tracking-wide uppercase text-[11px] bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded">
            Mandatory Intake Guardrail
          </span>
          <span className="font-medium">
            Intake validation only. No lending decision is made by this tool. Final review is always performed by an authorized human.
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-300/80 text-[11px] self-end sm:self-auto">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Zero scoring • No automated approvals/rejections • Strict human-in-the-loop</span>
        </div>
      </div>
    </div>
  );
};
