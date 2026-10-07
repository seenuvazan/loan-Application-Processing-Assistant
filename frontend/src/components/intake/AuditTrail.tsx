import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateTime } from '../../utils/formatters';
import { History, Download, ShieldCheck, ArrowRight } from 'lucide-react';

interface Props {
  applicationId: string;
}

export const AuditTrail: React.FC<Props> = ({ applicationId }) => {
  const { getAuditLogsForCase } = useApp();
  const logs = getAuditLogsForCase(applicationId);

  const exportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['ID', 'Timestamp', 'User', 'Role', 'Action', 'Details', 'PrevStatus', 'NewStatus'];
    const rows = logs.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      `"${l.userRole}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.previousStatus || ''}"`,
      `"${l.newStatus || ''}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Audit_Log_${applicationId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <History className="w-4 h-4 text-indigo-500" />
            <span>Append-Only Regulatory Audit Log</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable chronological record of all user interactions, checks, and status mutations
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Case Audit (CSV)</span>
        </button>
      </div>

      <div className="space-y-3">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start space-x-3 text-xs"
          >
            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-slate-900 dark:text-white">
                  {log.action}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formatDateTime(log.timestamp)}
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-300 font-medium">
                {log.details}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span>
                  By: <strong className="font-semibold text-slate-700 dark:text-slate-200">{log.userName}</strong> ({log.userRole})
                </span>

                {log.newStatus && (
                  <span className="flex items-center space-x-1 font-semibold text-indigo-600 dark:text-indigo-400">
                    <span>Status:</span>
                    {log.previousStatus && <span>{log.previousStatus} → </span>}
                    <span>{log.newStatus}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

  return null;
};
