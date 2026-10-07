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

