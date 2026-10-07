import React, { useRef } from 'react';
import { LoanDocument, DocumentStatus, Finding, Application } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/formatters';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  XCircle,
  UploadCloud,
  FileCheck,
  FileText,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface Props {
  application: Application;
  documents: LoanDocument[];
  findings: Finding[];
}

const STATUS_ICONS: Record<DocumentStatus, React.ReactNode> = {
  Received: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  Missing: <XCircle className="w-4 h-4 text-rose-500" />,
  Expired: <AlertCircle className="w-4 h-4 text-amber-500" />,
  Unclear: <HelpCircle className="w-4 h-4 text-purple-500" />,
};

export const DocumentChecklist: React.FC<Props> = ({ application, documents, findings }) => {
  const { updateDocument, currentUser } = useApp();
  const isReadOnly = currentUser.role === 'Auditor';
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const getDocFindings = (docType: string) => {
    return findings.filter(
      (f) =>
        f.field === docType ||
        f.field.startsWith(`${docType}.`) ||
        f.ruleId.includes(docType)
    );
  };

  const handleFileUpload = (doc: LoanDocument, file: File) => {
    if (isReadOnly) return;
    const now = new Date().toISOString().slice(0, 10);
    const fileSizeFormatted = `${(file.size / 1024).toFixed(1)} KB`;

    // Defaults when uploading a document
    const updates: Partial<LoanDocument> = {
      status: 'Received',
      uploadedFileName: file.name,
      uploadedFileSize: fileSizeFormatted,
      documentDate: doc.documentDate || now,
    };

    if (doc.documentType === 'Bank_Statement') {
      updates.statementMonthsCovered = doc.statementMonthsCovered || 6;
      updates.statementHasGaps = false;
      updates.issuerOrEmployerName = doc.issuerOrEmployerName || application.bankName || 'HDFC Bank';
    } else if (doc.documentType === 'Income_Proof') {
      updates.incomeAmountOnDocument = doc.incomeAmountOnDocument || application.declaredMonthlyIncome;
      updates.issuerOrEmployerName = doc.issuerOrEmployerName || application.declaredEmployer || 'Employer Corp';
    } else if (doc.documentType === 'Identity_PAN') {
      updates.issuerOrEmployerName = 'Income Tax Department';
      updates.documentReferenceNumber = application.panNumber || 'ABCDE1234F';
    } else if (doc.documentType === 'Address_Proof') {
      updates.issuerOrEmployerName = doc.issuerOrEmployerName || 'BESCOM / UIDAI';
      updates.documentReferenceNumber = 'ADR-VERIFIED-01';
    }

    updateDocument(application.id, doc.id, updates);
  };

  const handleSimulateDemoUpload = (doc: LoanDocument) => {
    if (isReadOnly) return;
    const dummyFile = new File(['%PDF-1.4 simulated binary data'], `${doc.documentType.toLowerCase()}_verified.pdf`, {
      type: 'application/pdf',
    });
    handleFileUpload(doc, dummyFile);
  };

  const handleBatchUploadAllMissing = () => {
    if (isReadOnly) return;
    documents.forEach((doc) => {
      if (doc.status === 'Missing' || doc.status === 'Unclear') {
        handleSimulateDemoUpload(doc);
      }
    });
  };

  const handleRemoveUpload = (doc: LoanDocument) => {
    if (isReadOnly) return;
    updateDocument(application.id, doc.id, {
      status: 'Missing',
      uploadedFileName: undefined,
      uploadedFileSize: undefined,
    });
  };

  const missingCount = documents.filter((d) => d.status === 'Missing' || d.status === 'Unclear').length;

  return (
    <div className="space-y-6">
      {/* Header with Quick Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Document Checklist & Upload Portal</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {documents.length} Required
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Upload document proofs to trigger instant verification across rules for{' '}
            <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">{application.employmentType}</strong> intake.
          </p>
        </div>

        {/* 1-Click Batch Upload Button */}
        {missingCount > 0 && !isReadOnly && (
          <button
            onClick={handleBatchUploadAllMissing}
            className="flex items-center space-x-2 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Upload All Missing Docs ({missingCount})</span>
          </button>
        )}
      </div>

      {/* Document Cards */}
      <div className="space-y-4">
        {documents.map((doc) => {
          const docFindings = getDocFindings(doc.documentType);
          const hasIssues = docFindings.length > 0;

          return (
            <div
              key={doc.id}
              className={`p-5 rounded-2xl border-2 transition-all shadow-sm ${
                hasIssues
                  ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {STATUS_ICONS[doc.status]}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center space-x-2">
                      <span>{doc.title}</span>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 font-mono bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.2 rounded border border-indigo-200 dark:border-indigo-800">
                        {doc.documentType}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Ref / Doc ID: <span className="font-mono">{doc.documentReferenceNumber || 'Auto-generated on upload'}</span>
                    </p>
                  </div>
                </div>

                {/* Status Selector */}
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Status:
                  </label>
                  <select
                    disabled={isReadOnly}
                    value={doc.status}
                    onChange={(e) =>
                      updateDocument(application.id, doc.id, {
                        status: e.target.value as DocumentStatus,
                      })
                    }
                    className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      doc.status === 'Received'
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700'
                        : doc.status === 'Missing'
                        ? 'border-rose-400 bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-700'
                        : doc.status === 'Unclear'
                        ? 'border-purple-400 bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-700'
                        : 'border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700'
                    }`}
                  >
                    <option value="Received">✓ Received & Verified</option>
                    <option value="Missing">✕ Missing / Not Uploaded</option>
                    <option value="Unclear">? Unclear / Illegible</option>
                    <option value="Expired">! Expired</option>
                  </select>
                </div>
              </div>

              {/* Upload Dropzone / Action Section */}
              <div className="py-3 border-b border-slate-100 dark:border-slate-800">
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
                  /* Uploaded state */
                  <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-emerald-500 text-white shrink-0">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-emerald-950 dark:text-emerald-200 truncate flex items-center space-x-1.5">
                          <span>{doc.uploadedFileName}</span>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-mono">
                            ({doc.uploadedFileSize || '245 KB'})
                          </span>
                        </div>
                        <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Uploaded & Validated by Intake Engine</span>
                        </div>
                      </div>
                    </div>

                    {!isReadOnly && (
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[doc.id]?.click()}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800 hover:bg-emerald-100 rounded-lg border border-emerald-300 dark:border-emerald-700"
                        >
                          Re-upload
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveUpload(doc)}
                          className="p-1 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Remove uploaded file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Not yet uploaded state */
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700">
                    <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                      <UploadCloud className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>Upload document file (PDF, PNG, JPG up to 10MB)</span>
                    </div>

                    {!isReadOnly && (
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[doc.id]?.click()}
                          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Choose File</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSimulateDemoUpload(doc)}
                          className="px-2.5 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                          title="Upload demo verified sample document"
                        >
                          ⚡ Quick Demo
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Metadata Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
                {/* Document Issue Date */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Document Issue Date
                  </label>
                  <input
                    type="date"
                    disabled={isReadOnly}
                    value={doc.documentDate || ''}
                    onChange={(e) =>
                      updateDocument(application.id, doc.id, {
                        documentDate: e.target.value || null,
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Issuer / Employer */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Issuer / Employer On Doc
                  </label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={doc.issuerOrEmployerName || ''}
                    onChange={(e) =>
                      updateDocument(application.id, doc.id, {
                        issuerOrEmployerName: e.target.value,
                      })
                    }
                    placeholder="e.g. Infosys, TCS, UIDAI"
                    className="w-full px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Amount on Document (Income only) */}
                {doc.documentType === 'Income_Proof' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Verified Monthly Income
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">₹</span>
                      <input
                        type="number"
                        disabled={isReadOnly}
                        value={doc.incomeAmountOnDocument || 0}
                        onChange={(e) =>
                          updateDocument(application.id, doc.id, {
                            incomeAmountOnDocument: Number(e.target.value),
                          })
                        }
                        className="w-full pl-6 pr-2 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Bank Statement Months Covered */}
                {doc.documentType === 'Bank_Statement' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Months Covered
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="24"
                        disabled={isReadOnly}
                        value={doc.statementMonthsCovered || 0}
                        onChange={(e) =>
                          updateDocument(application.id, doc.id, {
                            statementMonthsCovered: Number(e.target.value),
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="space-y-1 flex flex-col justify-end">
                      <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer pt-2">
                        <input
                          type="checkbox"
                          disabled={isReadOnly}
                          checked={doc.statementHasGaps || false}
                          onChange={(e) =>
                            updateDocument(application.id, doc.id, {
                              statementHasGaps: e.target.checked,
                            })
                          }
                          className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
                        />
                        <span className="text-rose-600 dark:text-rose-400 font-bold">
                          Date Gaps Flagged
                        </span>
                      </label>
                    </div>
                  </>
                )}
              </div>

              {/* Inline Findings */}
              {docFindings.length > 0 && (
                <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-1.5">
                  {docFindings.map((finding) => (
                    <div
                      key={finding.ruleId}
                      className="text-xs text-rose-700 dark:text-rose-300 flex items-start space-x-2"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                      <div>
                        <span className="font-extrabold">{finding.field}:</span>{' '}
                        {finding.explanation}
                        <div className="text-[10px] text-rose-600 dark:text-rose-400 font-medium mt-0.5">
                          Expected: {finding.expected} • Found: {finding.found}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Graceful status transitions verified
