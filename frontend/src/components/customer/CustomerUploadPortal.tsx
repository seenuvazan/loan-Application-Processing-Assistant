import React, { useRef, useState } from 'react';
import { useApp, AVAILABLE_USERS } from '../../context/AppContext';
import { LoanDocument, DocumentStatus, UserProfile } from '../../types';
import { formatINRCompact } from '../../utils/formatters';
import {
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  ArrowRight,
  LogOut,
  Building2,
  User,
  Sparkles,
  Trash2,
} from 'lucide-react';

export const CustomerUploadPortal: React.FC = () => {
  const {
    currentUser,
    applications,
    documents,
    updateDocument,
    updateApplication,
    getValidationForCase,
    logout,
    setCurrentUser,
  } = useApp();

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Link to this customer's application
  const userAppId = currentUser.applicationId || 'APP-IND-1002';
  const customerApp = applications.find((a) => a.id === userAppId) || applications[1];
  const customerDocs = documents[customerApp.id] || [];
  const validation = getValidationForCase(customerApp.id);

  const handleFileUpload = (doc: LoanDocument, file: File) => {
    const now = new Date().toISOString().slice(0, 10);
    const fileSizeFormatted = `${(file.size / 1024).toFixed(1)} KB`;

    const updates: Partial<LoanDocument> = {
      status: 'Received',
      uploadedFileName: file.name,
      uploadedFileSize: fileSizeFormatted,
      documentDate: doc.documentDate || now,
    };

    if (doc.documentType === 'Bank_Statement') {
      updates.statementMonthsCovered = doc.statementMonthsCovered || 6;
      updates.statementHasGaps = false;
      updates.issuerOrEmployerName = doc.issuerOrEmployerName || customerApp.bankName || 'HDFC Bank';
    } else if (doc.documentType === 'Income_Proof') {
      updates.incomeAmountOnDocument = doc.incomeAmountOnDocument || customerApp.declaredMonthlyIncome;
      updates.issuerOrEmployerName = doc.issuerOrEmployerName || customerApp.declaredEmployer || 'TCS';
    } else if (doc.documentType === 'Identity_PAN') {
      updates.issuerOrEmployerName = 'Income Tax Department';
      updates.documentReferenceNumber = customerApp.panNumber || 'FGHIJ5678K';
    } else if (doc.documentType === 'Address_Proof') {
      updates.issuerOrEmployerName = doc.issuerOrEmployerName || 'UIDAI';
      updates.documentReferenceNumber = customerApp.maskedAadhaar || 'XXXX-XXXX-9123';
    }

    updateDocument(customerApp.id, doc.id, updates);
  };

  const handleDemoUpload = (doc: LoanDocument) => {
    const dummyFile = new File(['%PDF simulated content'], `${doc.documentType.toLowerCase()}_${customerApp.applicantName.split(' ')[0].toLowerCase()}.pdf`, {
      type: 'application/pdf',
    });
    handleFileUpload(doc, dummyFile);
  };

  const handleRemoveUpload = (doc: LoanDocument) => {
    updateDocument(customerApp.id, doc.id, {
      status: 'Missing',
      uploadedFileName: undefined,
      uploadedFileSize: undefined,
    });
  };

  const handleSubmitAll = () => {
    updateApplication(customerApp.id, { status: 'Pending verification' });
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  const handleSwitchToOfficer = () => {
    const officer = AVAILABLE_USERS.find((u: UserProfile) => u.role === 'L1 Intake Officer') || AVAILABLE_USERS[0];
    setCurrentUser(officer);
  };

  const missingDocsCount = customerDocs.filter((d) => d.status === 'Missing' || d.status === 'Unclear').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Customer Header */}
      <header className="bg-white dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-base tracking-tight text-slate-900 dark:text-white">
                  Customer Document Upload Portal
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Applicant Access
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Personal Loan Intake • Reference: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{customerApp.id}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-base">{currentUser.avatar}</span>
              <div className="text-left text-xs">
                <div className="font-bold text-slate-900 dark:text-white">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{currentUser.email}</div>
              </div>
            </div>

            <button
              onClick={handleSwitchToOfficer}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
              title="Switch role to Bank Officer"
            >
              <span>Switch to Officer View ➔</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl w-full mx-auto p-4 sm:p-6 flex-1 space-y-6">
        {/* Welcome Card & Loan Status */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-xl shadow-indigo-600/15 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200 bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                Personal Loan Application: {customerApp.id}
              </span>
              <h1 className="text-xl sm:text-2xl font-black mt-2">
                Hello, {customerApp.applicantName}!
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed max-w-2xl mt-1">
                Our operations team has received your intake request for <strong>{formatINRCompact(customerApp.requestedAmount)}</strong> ({customerApp.loanPurpose}). Please upload the required documents below for instant pre-underwriting verification.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center min-w-[140px] shrink-0 self-start sm:self-auto">
              <span className="text-[10px] font-bold uppercase text-indigo-200 block">
                Completeness
              </span>
              <span className="text-2xl font-black text-white">
                {validation.completionScore}%
              </span>
              <span className="text-[11px] font-semibold text-emerald-300 block">
                {validation.findings.length === 0 ? '✓ All Docs Verified' : `${missingDocsCount} pending`}
              </span>
            </div>
          </div>
        </div>

        {/* Success Alert if submitted */}
        {submitSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border-2 border-emerald-400 text-emerald-900 dark:text-emerald-200 flex items-center space-x-3 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs font-bold">
              All documents successfully submitted! Your intake file has been sent to the Bank Operations Officer for verification.
            </div>
          </div>
        )}

        {/* Action Callout if documents are missing */}
        {missingDocsCount > 0 ? (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 shadow-sm">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                <strong>{missingDocsCount} Document(s) Outstanding:</strong> Please upload the missing items below to complete your loan file.
              </span>
            </div>
            <button
              onClick={() => {
                customerDocs.forEach((doc) => {
                  if (doc.status === 'Missing' || doc.status === 'Unclear') {
                    handleDemoUpload(doc);
                  }
                });
              }}
              className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm shrink-0 cursor-pointer"
            >
              ⚡ Fast Upload All Missing
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 flex items-center space-x-3 text-xs text-emerald-900 dark:text-emerald-200 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="font-bold">
              ✓ All required documents received and validated! You can submit your complete package for officer review.
            </div>
          </div>
        )}

        {/* Document Checklist Upload Cards */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Required Document Proofs ({customerDocs.length})
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {customerDocs.map((doc) => {
              const isMissing = doc.status === 'Missing' || doc.status === 'Unclear';

              return (
                <div
                  key={doc.id}
                  className={`p-5 rounded-2xl border-2 transition-all shadow-sm ${
                    isMissing
                      ? 'border-amber-300 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-950/10'
                      : 'border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-2.5 rounded-xl text-white ${
                          isMissing ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      >
                        {isMissing ? <AlertCircle className="w-5 h-5" /> : <FileCheck className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {doc.title}
                          </h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isMissing
                                ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {isMissing ? 'Action Required' : '✓ Verified & Complete'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {doc.documentType === 'Identity_PAN'
                            ? `Permanent Account Number: ${customerApp.panNumber || 'Mandatory'}`
                            : doc.documentType === 'Income_Proof'
                            ? `Recent salary slips matching declared income of ${formatINRCompact(customerApp.declaredMonthlyIncome)}`
                            : doc.documentType === 'Bank_Statement'
                            ? `Salary bank statement covering 6 continuous months (${customerApp.bankName})`
                            : 'Valid current address proof (Aadhaar / Utility Bill)'}
                        </p>
                      </div>
                    </div>

                    {/* Upload Controls */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="hidden"
                        ref={(el) => {
                          fileInputRefs.current[doc.id] = el;
                        }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(doc, file);
                        }}
                      />

                      {doc.uploadedFileName ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 truncate max-w-[160px]">
                            {doc.uploadedFileName}
                          </span>
                          <button
                            onClick={() => fileInputRefs.current[doc.id]?.click()}
                            className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg border border-slate-300 dark:border-slate-700"
                          >
                            Replace
                          </button>
                          <button
                            onClick={() => handleRemoveUpload(doc)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg"
                            title="Remove file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => fileInputRefs.current[doc.id]?.click()}
                            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                          >
                            <UploadCloud className="w-4 h-4" />
                            <span>Choose Document File</span>
                          </button>
                          <button
                            onClick={() => handleDemoUpload(doc)}
                            className="px-2.5 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                            title="Upload simulated verified demo file"
                          >
                            ⚡ Demo File
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit to Bank Operations button */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Ready to submit your application documents?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Once submitted, your bank operations officer will perform four-eyes verification before credit review.
            </p>
          </div>

          <button
            onClick={handleSubmitAll}
            disabled={missingDocsCount > 0}
            className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-black text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Submit Documents to Bank</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
};
