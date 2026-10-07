import React from 'react';
import { Application, Finding } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/formatters';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  application: Application;
  findings: Finding[];
}

export const ApplicationDataForm: React.FC<Props> = ({ application, findings }) => {
  const { updateApplication, currentUser } = useApp();
  const isReadOnly = currentUser.role === 'Auditor';

  const getFieldFinding = (fieldName: string) => {
    return findings.find(
      (f) =>
        f.field === fieldName ||
        (fieldName === 'panNumber' && f.ruleId.includes('PAN')) ||
        (fieldName === 'mobileNumber' && f.ruleId.includes('MOBILE')) ||
        (fieldName === 'maskedAadhaar' && f.ruleId.includes('AADHAAR'))
    );
  };

  const handleChange = (field: keyof Application, value: any) => {
    if (isReadOnly) return;
    updateApplication(application.id, { [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Application Intake Form Data
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Fields update live state and trigger instant re-validation across rules
          </p>
        </div>
        {isReadOnly && (
          <span className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
            Auditor Mode (Read-Only)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Applicant Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Applicant Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            disabled={isReadOnly}
            value={application.applicantName || ''}
            onChange={(e) => handleChange('applicantName', e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          />
          {getFieldFinding('applicantName') && (
            <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center space-x-1 mt-0.5">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{getFieldFinding('applicantName')?.explanation}</span>
            </p>
          )}
        </div>

        {/* PAN Number */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            PAN Number (AAAAA9999A) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            maxLength={10}
            disabled={isReadOnly}
            value={application.panNumber || ''}
            onChange={(e) => handleChange('panNumber', e.target.value.toUpperCase())}
            placeholder="e.g. ABCDE1234F"
            className="w-full px-3 py-1.5 text-xs font-mono uppercase rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          />
          {getFieldFinding('panNumber') && (
            <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center space-x-1 mt-0.5">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{getFieldFinding('panNumber')?.explanation}</span>
            </p>
          )}
        </div>

        {/* Name printed on PAN Doc */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Name Printed on PAN Card
          </label>
          <input
            type="text"
            disabled={isReadOnly}
            value={application.panNameOnDoc || ''}
            onChange={(e) => handleChange('panNameOnDoc', e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          />
          {getFieldFinding('panNameOnDoc') && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center space-x-1 mt-0.5">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{getFieldFinding('panNameOnDoc')?.explanation}</span>
            </p>
          )}
        </div>

        {/* Masked Aadhaar */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Aadhaar Number (Masked Last 4 Digits) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            disabled={isReadOnly}
            value={application.maskedAadhaar || ''}
            onChange={(e) => handleChange('maskedAadhaar', e.target.value)}
            placeholder="XXXX-XXXX-1234"
            className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          />
          {getFieldFinding('maskedAadhaar') && (
            <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center space-x-1 mt-0.5">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{getFieldFinding('maskedAadhaar')?.explanation}</span>
            </p>
          )}
        </div>

        {/* Mobile Number */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Mobile Number (10 digits) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-xs text-slate-400">+91</span>
            <input
              type="text"
              maxLength={12}
              disabled={isReadOnly}
              value={application.mobileNumber || ''}
              onChange={(e) => handleChange('mobileNumber', e.target.value)}
              className="w-full pl-10 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            />
          </div>
          {getFieldFinding('mobileNumber') && (
            <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center space-x-1 mt-0.5">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{getFieldFinding('mobileNumber')?.explanation}</span>
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Email Address
          </label>
          <input
            type="email"
            disabled={isReadOnly}
            value={application.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          />
        </div>

        {/* Employment Type */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Employment Type <span className="text-rose-500">*</span>
          </label>
          <select
            disabled={isReadOnly}
            value={application.employmentType}
            onChange={(e) => handleChange('employmentType', e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          >
            <option value="Salaried">Salaried (Requires Salary Slips / Form 16)</option>
            <option value="Self-Employed">Self-Employed (Requires ITR & Computation)</option>
          </select>
        </div>

        {/* Declared Employer / Business Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Declared Employer / Business Entity
          </label>
          <input
            type="text"
            disabled={isReadOnly}
            value={application.declaredEmployer || ''}
            onChange={(e) => handleChange('declaredEmployer', e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          />
          {getFieldFinding('declaredEmployer') && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center space-x-1 mt-0.5">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{getFieldFinding('declaredEmployer')?.explanation}</span>
            </p>
          )}
        </div>

        {/* Declared Net Monthly Income */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Declared Monthly Income <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              {formatINR(application.declaredMonthlyIncome)}
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-xs text-slate-400">₹</span>
            <input
              type="number"
              step="5000"
              disabled={isReadOnly}
              value={application.declaredMonthlyIncome || 0}
              onChange={(e) => handleChange('declaredMonthlyIncome', Number(e.target.value))}
              className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            />
          </div>
          {getFieldFinding('declaredMonthlyIncome') && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center space-x-1 mt-0.5">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{getFieldFinding('declaredMonthlyIncome')?.explanation}</span>
            </p>
          )}
        </div>

        {/* Requested Loan Amount */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Requested Amount <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              {formatINR(application.requestedAmount)}
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-xs text-slate-400">₹</span>
            <input
              type="number"
              step="25000"
              disabled={isReadOnly}
              value={application.requestedAmount || 0}
              onChange={(e) => handleChange('requestedAmount', Number(e.target.value))}
              className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            />
          </div>
          {getFieldFinding('requestedAmount') && (
            <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center space-x-1 mt-0.5">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{getFieldFinding('requestedAmount')?.explanation}</span>
            </p>
          )}
        </div>

        {/* Loan Purpose */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Loan Purpose <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            disabled={isReadOnly}
            value={application.loanPurpose || ''}
            onChange={(e) => handleChange('loanPurpose', e.target.value)}
            placeholder="e.g. Home Renovation, Medical"
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          />
          {getFieldFinding('loanPurpose') && (
            <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center space-x-1 mt-0.5">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{getFieldFinding('loanPurpose')?.explanation}</span>
            </p>
          )}
        </div>

        {/* Masked Account Number */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Disbursement Account (Masked) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            disabled={isReadOnly}
            value={application.maskedAccountNumber || ''}
            onChange={(e) => handleChange('maskedAccountNumber', e.target.value)}
            className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          />
          {getFieldFinding('maskedAccountNumber') && (
            <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center space-x-1 mt-0.5">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{getFieldFinding('maskedAccountNumber')?.explanation}</span>
            </p>
          )}
        </div>

        {/* Bank Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Primary Bank
          </label>
          <input
            type="text"
            disabled={isReadOnly}
            value={application.bankName || ''}
            onChange={(e) => handleChange('bankName', e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          />
        </div>

        {/* Application Date */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Application Date
          </label>
          <input
            type="date"
            disabled={isReadOnly}
            value={application.applicationDate || ''}
            onChange={(e) => handleChange('applicationDate', e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          />
        </div>

        {/* Employment Start Date */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Employment Start Date
          </label>
          <input
            type="date"
            disabled={isReadOnly}
            value={application.employmentStartDate || ''}
            onChange={(e) => handleChange('employmentStartDate', e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          />
          {getFieldFinding('employmentStartDate') && (
            <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center space-x-1 mt-0.5">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{getFieldFinding('employmentStartDate')?.explanation}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
