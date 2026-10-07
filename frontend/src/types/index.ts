export type EmploymentType = 'Salaried' | 'Self-Employed';

export type DocumentType = 'Identity_PAN' | 'Identity_Aadhaar' | 'Address_Proof' | 'Income_Proof' | 'Bank_Statement';

export type DocumentStatus = 'Received' | 'Missing' | 'Expired' | 'Unclear';

export interface LoanDocument {
  id: string;
  applicationId: string;
  documentType: DocumentType;
  title: string;
  status: DocumentStatus;
  documentDate: string | null; // YYYY-MM-DD
  issuerOrEmployerName: string | null;
  incomeAmountOnDocument: number | null;
  documentReferenceNumber: string | null; // e.g. PAN or masked Aadhaar or bill no.
  statementMonthsCovered?: number;
  statementHasGaps?: boolean;
  uploadedFileName?: string;
  uploadedFileSize?: string;
}

export type CaseStatus = 
  | 'Draft' 
  | 'Follow-up sent' 
  | 'Pending verification' 
  | 'Verified' 
  | 'Ready for underwriting' 
  | 'Escalated';

export interface Application {
  id: string;
  applicantName: string;
  panNumber: string; // Indian PAN AAAAA9999A
  panNameOnDoc: string; // Name as printed on PAN doc
  maskedAadhaar: string; // XXXX-XXXX-1234
  mobileNumber: string; // 10 digits
  email: string;
  requestedAmount: number; // in INR
  loanPurpose: string;
  employmentType: EmploymentType;
  declaredEmployer: string; // employer or business name
  declaredMonthlyIncome: number; // in INR
  applicationDate: string; // YYYY-MM-DD
  employmentStartDate: string; // YYYY-MM-DD
  maskedAccountNumber: string; // e.g. XXXX-XXXX-5821
  bankName: string;
  status: CaseStatus;
  makerUserId?: string;
  makerUserName?: string;
  checkerUserId?: string;
  checkerUserName?: string;
  escalationReason?: string;
  escalationNotes?: string;
  editedSummary?: string;
  summaryEditedBy?: string;
  summaryEditedAt?: string;
  followUpLanguage?: 'en' | 'hi' | 'ta';
  followUpSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type FindingCategory = 'Mandatory Field' | 'Missing Document' | 'Inconsistency' | 'Format Issue';

export interface Finding {
  ruleId: string;
  category: FindingCategory;
  field: string;
  expected: string;
  found: string;
  explanation: string;
  severity: 'high' | 'medium' | 'low';
}

export interface ValidationResult {
  applicationId: string;
  findings: Finding[];
  validatedAt: string;
  isComplete: boolean;
  completionScore: number; // 0 to 100 percentage
  counts: {
    mandatoryFields: number;
    missingDocuments: number;
    inconsistencies: number;
    formatIssues: number;
    total: number;
  };
}

export interface ConfigurableRules {
  incomeTolerancePercent: number; // default 10%
  maxDocumentAgeDays: number; // default 90 days
  minRequestedAmount: number; // default 50000
  maxRequestedAmount: number; // default 4000000
  requiredBankStatementMonths: number; // default 6
}

export type UserRole = 
  | 'L1 Intake Officer' 
  | 'L2 Verifier' 
  | 'L3 Senior Reviewer' 
  | 'Auditor'
  | 'Applicant / Customer';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  userType?: 'officer' | 'customer';
  applicationId?: string;
  email?: string;
}

