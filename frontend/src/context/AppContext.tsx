import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Application,
  LoanDocument,
  ConfigurableRules,
  UserProfile,
  AuditLogEntry,
  CaseStatus,
  ValidationResult,
} from '../types';
import { DEFAULT_RULES } from '../rules/defaultRules';
import { SYNTHETIC_CASES } from '../data/syntheticCases';
import { validateApplication } from '../engine/validator';

export const AVAILABLE_USERS: UserProfile[] = [
  { id: 'usr-1', name: 'Rajesh Kumar', role: 'L1 Intake Officer', avatar: '👨‍💼', userType: 'officer', email: 'officer@bank.com' },
  { id: 'usr-2', name: 'Sunita Rao', role: 'L1 Intake Officer', avatar: '👩‍💼', userType: 'officer', email: 'sunita@bank.com' },
  { id: 'usr-3', name: 'Priya Sharma', role: 'L2 Verifier', avatar: '👩‍💻', userType: 'officer', email: 'priya@bank.com' },
  { id: 'usr-4', name: 'Amit Patel', role: 'L2 Verifier', avatar: '👨‍💻', userType: 'officer', email: 'amit@bank.com' },
  { id: 'usr-5', name: 'Anil Mehta', role: 'L3 Senior Reviewer', avatar: '👔', userType: 'officer', email: 'anil@bank.com' },
  { id: 'usr-6', name: 'Deepak Verma', role: 'Auditor', avatar: '🧐', userType: 'officer', email: 'auditor@bank.com' },
  { id: 'cust-1', name: 'Pooja Sundaram', role: 'Applicant / Customer', avatar: '👩', userType: 'customer', email: 'customer@gmail.com', applicationId: 'APP-IND-1002' },
  { id: 'cust-2', name: 'Aarav Venkatesh', role: 'Applicant / Customer', avatar: '🧑', userType: 'customer', email: 'aarav.v@outlook.com', applicationId: 'APP-IND-1001' },
  { id: 'cust-3', name: 'Bhavna Sethi', role: 'Applicant / Customer', avatar: '👩', userType: 'customer', email: 'bhavna.sethi@gmail.com', applicationId: 'APP-IND-1022' },
];

export type AppMode = 'intake' | 'evidence' | 'guidance';

interface AppContextType {
  applications: Application[];
  documents: Record<string, LoanDocument[]>;
  selectedCaseId: string;
  setSelectedCaseId: (id: string) => void;
  selectedCase: Application | undefined;
  selectedCaseDocuments: LoanDocument[];
  selectedCaseValidation: ValidationResult | null;
  rules: ConfigurableRules;
  setRules: (rules: ConfigurableRules) => void;
  resetRules: () => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  auditLogs: AuditLogEntry[];
  isAuthenticated: boolean;
  login: (user: UserProfile) => void;
  logout: () => void;
  
  // Actions
  updateApplication: (appId: string, updates: Partial<Application>) => void;
  updateDocument: (appId: string, docId: string, updates: Partial<LoanDocument>) => void;
  submitForVerification: (appId: string) => { success: boolean; message?: string };
  verifyCase: (appId: string) => { success: boolean; message?: string };
  handOffToUnderwriting: (appId: string) => { success: boolean; message?: string };
  escalateCase: (appId: string, reason: string, notes?: string) => { success: boolean; message?: string };
  resolveEscalation: (appId: string, resolutionReason: string) => { success: boolean; message?: string };
  markFollowUpSent: (appId: string, language: 'en' | 'hi' | 'ta') => void;
  saveOperationsSummary: (appId: string, summary: string) => void;
  resetOperationsSummary: (appId: string) => void;
  resetAllToSyntheticDefaults: () => void;
  
  // Helpers
  getValidationForCase: (appId: string) => ValidationResult;
  getAuditLogsForCase: (appId: string) => AuditLogEntry[];
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY_APPS = 'loan_intake_apps_v2';
const STORAGE_KEY_DOCS = 'loan_intake_docs_v2';
const STORAGE_KEY_RULES = 'loan_intake_rules_v2';
const STORAGE_KEY_LOGS = 'loan_intake_logs_v2';
const STORAGE_KEY_THEME = 'loan_intake_theme_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Mode state
  const [mode, setMode] = useState<AppMode>('intake');

  // User state (defaults to Rajesh Kumar L1)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const savedUserId = localStorage.getItem('loan_intake_user');
    if (savedUserId) {
      const found = AVAILABLE_USERS.find((u) => u.id === savedUserId);
      if (found) return found;
    }
    return AVAILABLE_USERS[0];
  });

  // Auth state (starts false if not previously logged in, showing the login screen)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('loan_intake_auth') === 'true';
  });

  const login = useCallback((user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('loan_intake_auth', 'true');
    localStorage.setItem('loan_intake_user', user.id);
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('loan_intake_auth');
  }, []);

  // Rules state
  const [rules, setRulesState] = useState<ConfigurableRules>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_RULES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_RULES;
  });

  const setRules = useCallback((newRules: ConfigurableRules) => {
    setRulesState(newRules);
    localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(newRules));
  }, []);

  const resetRules = useCallback(() => {
    setRulesState(DEFAULT_RULES);
    localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(DEFAULT_RULES));
  }, []);

  // Applications state
  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_APPS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return SYNTHETIC_CASES.map((sc) => sc.application);
  });

  // Documents state
  const [documents, setDocuments] = useState<Record<string, LoanDocument[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DOCS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    const map: Record<string, LoanDocument[]> = {};
    SYNTHETIC_CASES.forEach((sc) => {
      map[sc.application.id] = sc.documents;
    });
    return map;
  });

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LOGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    // Seed initial intake audit logs
    const initialLogs: AuditLogEntry[] = SYNTHETIC_CASES.map((sc) => ({
      id: `LOG-INIT-${sc.application.id}`,
      applicationId: sc.application.id,
      timestamp: sc.application.createdAt,
      userId: 'usr-sys',
      userName: 'System Intake Engine',
      userRole: 'L1 Intake Officer',
      action: 'Case Initialized',
      details: `Application received via digital channel with initial status ${sc.application.status}.`,
      previousStatus: undefined,
      newStatus: sc.application.status,
    }));
    return initialLogs;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Selected case
  const [selectedCaseId, setSelectedCaseId] = useState<string>('APP-IND-1001');

  const selectedCase = useMemo(
    () => applications.find((a) => a.id === selectedCaseId),
    [applications, selectedCaseId]
  );

  const selectedCaseDocuments = useMemo(
    () => documents[selectedCaseId] || [],
    [documents, selectedCaseId]
  );

  const getValidationForCase = useCallback(
    (appId: string): ValidationResult => {
      const app = applications.find((a) => a.id === appId);
      const docs = documents[appId] || [];
      if (!app) {
        return {
          applicationId: appId,
          findings: [],
          validatedAt: new Date().toISOString(),
          isComplete: false,
          completionScore: 0,
          counts: { mandatoryFields: 0, missingDocuments: 0, inconsistencies: 0, formatIssues: 0, total: 0 },
        };
      }
      return validateApplication(app, docs, rules);
    },
    [applications, documents, rules]
  );

  const selectedCaseValidation = useMemo(() => {
    if (!selectedCase) return null;
    return validateApplication(selectedCase, selectedCaseDocuments, rules);
  }, [selectedCase, selectedCaseDocuments, rules]);

  const addAuditLog = useCallback(
    (
      appId: string,
      action: string,
      details: string,
      previousStatus?: CaseStatus,
      newStatus?: CaseStatus
    ) => {
      const entry: AuditLogEntry = {
        id: `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        applicationId: appId,
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action,
        details,
        previousStatus,
        newStatus,
      };
      setAuditLogs((prev) => [entry, ...prev]);
    },
    [currentUser]
  );

  const getAuditLogsForCase = useCallback(
    (appId: string) => {
      return auditLogs.filter((l) => l.applicationId === appId);
    },
    [auditLogs]
  );

  // Application Updates
  const updateApplication = useCallback(
    (appId: string, updates: Partial<Application>) => {
      setApplications((prev) =>
        prev.map((app) => {
          if (app.id === appId) {
            const updated = {
              ...app,
              ...updates,
              updatedAt: new Date().toISOString(),
            };
            return updated;
          }
          return app;
        })
      );
      addAuditLog(
        appId,
        'Application Data Corrected',
        `Fields modified: ${Object.keys(updates).join(', ')}`
      );
    },
    [addAuditLog]
  );

  // Document Updates
  const updateDocument = useCallback(
    (appId: string, docId: string, updates: Partial<LoanDocument>) => {
      setDocuments((prev) => {
        const caseDocs = prev[appId] || [];
        const nextDocs = caseDocs.map((doc) => {
          if (doc.id === docId) {
            return { ...doc, ...updates };
          }
          return doc;
        });
        return { ...prev, [appId]: nextDocs };
      });
      addAuditLog(
        appId,
        'Document Metadata Updated',
        `Document ID ${docId} modified with: ${JSON.stringify(updates)}`
      );
    },
    [addAuditLog]
  );

  // Maker-Checker Workflows
  const submitForVerification = useCallback(
    (appId: string) => {
      if (currentUser.role === 'Auditor') {
        return { success: false, message: 'Auditors have read-only access and cannot submit cases.' };
      }
      const app = applications.find((a) => a.id === appId);
      if (!app) return { success: false, message: 'Application not found.' };

      const prevStatus = app.status;
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? {
                ...a,
                status: 'Pending verification',
                makerUserId: currentUser.id,
                makerUserName: currentUser.name,
                updatedAt: new Date().toISOString(),
              }
            : a
        )
      );

      addAuditLog(
        appId,
        'Submitted for Verification',
        `Case submitted by Maker ${currentUser.name} (${currentUser.role}).`,
        prevStatus,
        'Pending verification'
      );

      return { success: true };
    },
    [currentUser, applications, addAuditLog]
  );

  const verifyCase = useCallback(
    (appId: string) => {
      if (currentUser.role === 'Auditor') {
        return { success: false, message: 'Auditors have read-only access and cannot verify cases.' };
      }
      if (currentUser.role === 'L1 Intake Officer') {
        return { success: false, message: 'Only an L2 Verifier or L3 Senior Reviewer can verify cases.' };
      }

      const app = applications.find((a) => a.id === appId);
      if (!app) return { success: false, message: 'Application not found.' };

      // Four-eyes policy: Verifier must NOT be the maker
      if (app.makerUserId && app.makerUserId === currentUser.id) {
        return {
          success: false,
          message: `FOUR-EYES ENFORCEMENT: You cannot verify a case that you submitted as Maker (${app.makerUserName}). Another authorized checker must review.`,
        };
      }

      const prevStatus = app.status;
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? {
                ...a,
                status: 'Verified',
                checkerUserId: currentUser.id,
                checkerUserName: currentUser.name,
                updatedAt: new Date().toISOString(),
              }
            : a
        )
      );

      addAuditLog(
        appId,
        'Intake Verified (Checker Review Passed)',
        `Verified by ${currentUser.name} (${currentUser.role}). Four-eyes check satisfied.`,
        prevStatus,
        'Verified'
      );

      return { success: true };
    },
    [currentUser, applications, addAuditLog]
  );

  const handOffToUnderwriting = useCallback(
    (appId: string) => {
      if (currentUser.role === 'Auditor') {
        return { success: false, message: 'Auditors have read-only access.' };
      }
      const app = applications.find((a) => a.id === appId);
      if (!app) return { success: false, message: 'Application not found.' };

      const prevStatus = app.status;
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? {
                ...a,
                status: 'Ready for underwriting',
                updatedAt: new Date().toISOString(),
              }
            : a
        )
      );

      addAuditLog(
        appId,
        'Handed Off to Underwriting',
        `Intake file marked complete and handed off to human credit underwriting team by ${currentUser.name}.`,
        prevStatus,
        'Ready for underwriting'
      );

      return { success: true };
    },
    [currentUser, applications, addAuditLog]
  );

  const escalateCase = useCallback(
    (appId: string, reason: string, notes?: string) => {
      if (currentUser.role === 'Auditor') {
        return { success: false, message: 'Auditors have read-only access.' };
      }
      const app = applications.find((a) => a.id === appId);
      if (!app) return { success: false, message: 'Application not found.' };

      const prevStatus = app.status;
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? {
                ...a,
                status: 'Escalated',
                escalationReason: reason,
                escalationNotes: notes,
                updatedAt: new Date().toISOString(),
              }
            : a
        )
      );

      addAuditLog(
        appId,
        'Case Escalated to L3 Review',
        `Reason: "${reason}". Notes: "${notes || 'None'}". Escalated by ${currentUser.name}.`,
        prevStatus,
        'Escalated'
      );

      return { success: true };
    },
    [currentUser, applications, addAuditLog]
  );

  const resolveEscalation = useCallback(
    (appId: string, resolutionReason: string) => {
      if (currentUser.role !== 'L3 Senior Reviewer') {
        return {
          success: false,
          message: 'Only an authorized L3 Senior Reviewer can resolve or override escalations.',
        };
      }
      if (!resolutionReason || resolutionReason.trim().length < 10) {
        return {
          success: false,
          message: 'A mandatory written resolution justification (min 10 characters) is required for L3 override.',
        };
      }

      const app = applications.find((a) => a.id === appId);
      if (!app) return { success: false, message: 'Application not found.' };

      const prevStatus = app.status;
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? {
                ...a,
                status: 'Pending verification',
                escalationReason: undefined,
                escalationNotes: `Resolved by ${currentUser.name}: ${resolutionReason}`,
                updatedAt: new Date().toISOString(),
              }
            : a
        )
      );

      addAuditLog(
        appId,
        'L3 Escalation Resolved / Override',
        `Escalation cleared by L3 Senior Reviewer ${currentUser.name}. Justification: "${resolutionReason}".`,
        prevStatus,
        'Pending verification'
      );

      return { success: true };
    },
    [currentUser, applications, addAuditLog]
  );

  const markFollowUpSent = useCallback(
    (appId: string, language: 'en' | 'hi' | 'ta') => {
      const app = applications.find((a) => a.id === appId);
      if (!app) return;
      const prevStatus = app.status;
      const now = new Date().toISOString();

      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? {
                ...a,
                status: 'Follow-up sent',
                followUpLanguage: language,
                followUpSentAt: now,
                updatedAt: now,
              }
            : a
        )
      );

      addAuditLog(
        appId,
        'Customer Follow-Up Sent',
        `Missing document / clarification notice dispatched in ${
          language === 'hi' ? 'Hindi' : language === 'ta' ? 'Tamil' : 'English'
        } by ${currentUser.name}.`,
        prevStatus,
        'Follow-up sent'
      );
    },
    [currentUser, applications, addAuditLog]
  );

  const saveOperationsSummary = useCallback(
    (appId: string, summary: string) => {
      const now = new Date().toISOString();
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? {
                ...a,
                editedSummary: summary,
                summaryEditedBy: currentUser.name,
                summaryEditedAt: now,
                updatedAt: now,
              }
            : a
        )
      );

      addAuditLog(
        appId,
        'Operations Summary Saved',
        `Summary updated and saved by ${currentUser.name}.`
      );
    },
    [currentUser, addAuditLog]
  );

  const resetOperationsSummary = useCallback(
    (appId: string) => {
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? {
                ...a,
                editedSummary: undefined,
                summaryEditedBy: undefined,
                summaryEditedAt: undefined,
                updatedAt: new Date().toISOString(),
              }
            : a
        )
      );

      addAuditLog(
        appId,
        'Operations Summary Reset',
        `Summary reverted to auto-generated system template by ${currentUser.name}.`
      );
    },
    [currentUser, addAuditLog]
  );

  const resetAllToSyntheticDefaults = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_APPS);
    localStorage.removeItem(STORAGE_KEY_DOCS);
    localStorage.removeItem(STORAGE_KEY_RULES);
    localStorage.removeItem(STORAGE_KEY_LOGS);

    setApplications(SYNTHETIC_CASES.map((sc) => sc.application));
    const docMap: Record<string, LoanDocument[]> = {};
    SYNTHETIC_CASES.forEach((sc) => {
      docMap[sc.application.id] = sc.documents;
    });
    setDocuments(docMap);
    setRulesState(DEFAULT_RULES);
    setSelectedCaseId('APP-IND-1001');

    const initialLogs: AuditLogEntry[] = SYNTHETIC_CASES.map((sc) => ({
      id: `LOG-INIT-${sc.application.id}`,
      applicationId: sc.application.id,
      timestamp: sc.application.createdAt,
      userId: 'usr-sys',
      userName: 'System Intake Engine',
      userRole: 'L1 Intake Officer',
      action: 'Case Initialized',
      details: `Application reset to synthetic demo state.`,
      newStatus: sc.application.status,
    }));
    setAuditLogs(initialLogs);
  }, []);

  return (
    <AppContext.Provider
      value={{
        applications,
        documents,
        selectedCaseId,
        setSelectedCaseId,
        selectedCase,
        selectedCaseDocuments,
        selectedCaseValidation,
        rules,
        setRules,
        resetRules,
        currentUser,
        setCurrentUser,
        mode,
        setMode,
        theme,
        toggleTheme,
        auditLogs,
        isAuthenticated,
        login,
        logout,
        updateApplication,
        updateDocument,
        submitForVerification,
        verifyCase,
        handOffToUnderwriting,
        escalateCase,
        resolveEscalation,
        markFollowUpSent,
        saveOperationsSummary,
        resetOperationsSummary,
        resetAllToSyntheticDefaults,
        getValidationForCase,
        getAuditLogsForCase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Context dispatchers streamlined
