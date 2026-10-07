import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sliders, RotateCcw, Check, X, ShieldAlert } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesConfigModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { rules, setRules, resetRules } = useApp();
  const [localRules, setLocalRules] = useState(rules);

  if (!isOpen) return null;

  const handleSave = () => {
    setRules(localRules);
    onClose();
  };

  const handleReset = () => {
    resetRules();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Configurable Intake Rules
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust intake policy thresholds with live re-validation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg flex items-start space-x-2.5 text-xs text-amber-800 dark:text-amber-300">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <span>
              Threshold modifications apply immediately to all active intake applications and trigger deterministic live re-evaluations.
            </span>
          </div>

          {/* Income Tolerance % */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Income Variance Tolerance
              </label>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                ±{localRules.incomeTolerancePercent}%
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Allowed discrepancy between declared income and document verified income.
            </p>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={localRules.incomeTolerancePercent}
              onChange={(e) =>
                setLocalRules({ ...localRules, incomeTolerancePercent: Number(e.target.value) })
              }
              className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0% (Strict)</span>
              <span>10% (Default)</span>
              <span>25% (Lenient)</span>
            </div>
          </div>

          {/* Document Age Days */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Max Document Freshness Age
              </label>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {localRules.maxDocumentAgeDays} Days
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Maximum allowable age for utility bills, salary slips, and recent statements.
            </p>
            <input
              type="range"
              min="30"
              max="180"
              step="15"
              value={localRules.maxDocumentAgeDays}
              onChange={(e) =>
                setLocalRules({ ...localRules, maxDocumentAgeDays: Number(e.target.value) })
              }
              className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>30 Days (1 Month)</span>
              <span>90 Days (Default)</span>
              <span>180 Days (6 Months)</span>
            </div>
          </div>

          {/* Required Bank Statement Months */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Required Bank Statement Period
              </label>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {localRules.requiredBankStatementMonths} Months
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Continuous transaction statement duration required for personal loan intake.
            </p>
            <input
              type="range"
              min="3"
              max="12"
              step="1"
              value={localRules.requiredBankStatementMonths}
              onChange={(e) =>
                setLocalRules({ ...localRules, requiredBankStatementMonths: Number(e.target.value) })
              }
              className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>3 Months</span>
              <span>6 Months (Default)</span>
              <span>12 Months</span>
            </div>
          </div>

          {/* Min & Max Loan Amount Range */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Intake Loan Amount Range (INR)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                  Minimum Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    step="10000"
                    value={localRules.minRequestedAmount}
                    onChange={(e) =>
                      setLocalRules({ ...localRules, minRequestedAmount: Number(e.target.value) })
                    }
                    className="w-full pl-6 pr-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400">
                  {formatINR(localRules.minRequestedAmount)}
                </span>
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                  Maximum Limit
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    step="100000"
                    value={localRules.maxRequestedAmount}
                    onChange={(e) =>
                      setLocalRules({ ...localRules, maxRequestedAmount: Number(e.target.value) })
                    }
                    className="w-full pl-6 pr-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400">
                  {formatINR(localRules.maxRequestedAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply & Re-validate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
