import React, { useState } from 'react';
import { useApp, AVAILABLE_USERS } from '../../context/AppContext';
import { UserProfile } from '../../types';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Building2,
  UploadCloud,
  FileText,
  Sun,
  Moon,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, theme, toggleTheme } = useApp();

  // Mode: 'officer' or 'customer'
  const [loginMode, setLoginMode] = useState<'officer' | 'customer'>('officer');

  // Officer selection
  const officerUsers = AVAILABLE_USERS.filter((u) => u.userType !== 'customer');
  const [selectedOfficer, setSelectedOfficer] = useState<UserProfile>(officerUsers[0]);

  // Customer selection
  const customerUsers = AVAILABLE_USERS.filter((u) => u.userType === 'customer');
  const [selectedCustomer, setSelectedCustomer] = useState<UserProfile>(customerUsers[0]);

  // Inputs
  const [username, setUsername] = useState('officer@bank.com');
  const [password, setPassword] = useState('Password@123');

  const handleModeSwitch = (mode: 'officer' | 'customer') => {
    setLoginMode(mode);
    if (mode === 'officer') {
      setUsername(selectedOfficer.email || 'officer@bank.com');
    } else {
      setUsername(selectedCustomer.email || 'customer@gmail.com');
    }
    setPassword('Password@123');
  };

  const handleOfficerSelect = (u: UserProfile) => {
    setSelectedOfficer(u);
    setUsername(u.email || 'officer@bank.com');
  };

  const handleCustomerSelect = (u: UserProfile) => {
    setSelectedCustomer(u);
    setUsername(u.email || 'customer@gmail.com');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginMode === 'officer') {
      login(selectedOfficer);
    } else {
      login(selectedCustomer);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-between bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-slate-100 relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Decorative Vibrant Glowing Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-indigo-600/30 to-blue-400/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-600/30 via-pink-500/20 to-amber-500/20 blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 ring-2 ring-white/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-xl tracking-tight text-white drop-shadow-sm">
                LoanIntake
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400/20 to-indigo-400/20 border border-amber-300/40 text-amber-300">
                India 🇮🇳
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 font-medium">
              Personal Loan Pre-Underwriting & Customer Document Intake Gateway
            </p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          title="Toggle Light/Dark Theme"
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white backdrop-blur-md transition-all cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-200" />}
        </button>
      </header>

      {/* Main Form Content */}
      <main className="relative z-10 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 flex-1 flex flex-col justify-center">
        {/* Guardrail Banner */}
        <div className="mb-6 p-3.5 rounded-xl bg-amber-500/15 border-2 border-amber-400/40 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-lg shadow-amber-950/30">
          <div className="flex items-center space-x-2.5 text-xs text-amber-200 font-semibold">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              <strong className="text-amber-300 font-black tracking-wide mr-1.5 uppercase">
                Regulatory Intake Guardrail:
              </strong>
              Intake validation only. No lending decision is made by this tool. Final review is always performed by an authorized human.
            </span>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0 self-start sm:self-auto">
            Zero Scoring • Human Review
          </span>
        </div>

        {/* Portal Switcher Tabs (Officer vs Customer) */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/80 border-2 border-indigo-400/40 backdrop-blur-xl shadow-2xl">
            <button
              onClick={() => handleModeSwitch('officer')}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                loginMode === 'officer'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-indigo-200/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>🏢 Bank Officer Login</span>
            </button>

            <button
              onClick={() => handleModeSwitch('customer')}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                loginMode === 'customer'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-indigo-200/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>👤 Customer Document Upload Login</span>
            </button>
          </div>
        </div>

        {/* Dynamic Card Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Panel: Profile & Specific Credentials Info */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            {loginMode === 'officer' ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                    Operations Gateway
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Bank Officer Access
                  </h1>
                  <p className="text-xs sm:text-sm text-indigo-200/80 leading-relaxed">
                    Review intake applications, inspect uploaded customer documents, check deterministic policy findings, and enforce Four-Eyes verification.
                  </p>
                </div>

                {/* Specific Officer Quick Select */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">
                    Choose Officer Profile:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {officerUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleOfficerSelect(u)}
                        className={`p-2.5 rounded-xl text-left border-2 transition-all flex items-center space-x-2 cursor-pointer ${
                          selectedOfficer.id === u.id
                            ? 'border-indigo-400 bg-indigo-600/30 shadow-md ring-2 ring-white/20'
                            : 'border-white/10 bg-slate-800/40 hover:bg-slate-800/70'
                        }`}
                      >
                        <span className="text-xl">{u.avatar}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-white truncate">{u.name}</div>
                          <div className="text-[10px] text-indigo-300 truncate">{u.role}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                    Applicant Upload Portal
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Customer Document Login
                  </h1>
                  <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                    Log in as an applicant to upload requested income proofs, salary slips, PAN card, and 6-month bank statements directly for live verification!
                  </p>
                </div>

                {/* Specific Customer Quick Select */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">
                    Choose Applicant Account:
                  </span>
                  <div className="grid grid-cols-1 gap-2.5">
                    {customerUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleCustomerSelect(u)}
                        className={`p-3 rounded-xl text-left border-2 transition-all flex items-center justify-between cursor-pointer ${
                          selectedCustomer.id === u.id
                            ? 'border-emerald-400 bg-emerald-600/30 shadow-md ring-2 ring-white/20'
                            : 'border-white/10 bg-slate-800/40 hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{u.avatar}</span>
                          <div>
                            <div className="font-extrabold text-sm text-white">{u.name}</div>
                            <div className="text-xs text-emerald-300 font-mono">
                              App ID: {u.applicationId} • {u.email}
                            </div>
                          </div>
                        </div>
                        {selectedCustomer.id === u.id && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: High-Definition Login Form */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="p-7 sm:p-8 rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 border-indigo-400/40 shadow-2xl backdrop-blur-xl text-slate-900 dark:text-white space-y-5">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-xl font-black tracking-tight">
                    {loginMode === 'officer' ? 'Staff Gateway Login' : 'Customer Upload Login'}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Signing in to{' '}
                  <strong className="text-indigo-600 dark:text-indigo-400">
                    {loginMode === 'officer' ? selectedOfficer.name : selectedCustomer.name}
                  </strong>{' '}
                  ({loginMode === 'officer' ? selectedOfficer.role : `App: ${selectedCustomer.applicationId}`})
                </p>
              </div>

              {/* Exact Specific User Credentials Callout Box */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/80 dark:to-purple-950/80 border-2 border-indigo-300 dark:border-indigo-700 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-indigo-950 dark:text-indigo-200">
                    Specific Login Credentials:
                  </span>
                  <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-full">
                    Auto-Filled
                  </span>
                </div>
                <div className="font-mono text-xs text-slate-700 dark:text-slate-300 space-y-0.5">
                  <div>
                    Username / Email:{' '}
                    <strong className="text-indigo-700 dark:text-indigo-300 font-bold">{username}</strong>
                  </div>
                  <div>
                    Password:{' '}
                    <strong className="text-indigo-700 dark:text-indigo-300 font-bold">Password@123</strong>
                  </div>
                </div>
              </div>

              {/* Credentials Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {loginMode === 'officer' ? 'Officer Email / Staff ID' : 'Applicant Email / ID'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 px-4 rounded-xl font-black text-sm text-white shadow-lg transition-all flex items-center justify-center space-x-2 group cursor-pointer ${
                    loginMode === 'officer'
                      ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/25'
                      : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-500/25'
                  }`}
                >
                  <span>
                    {loginMode === 'officer'
                      ? 'Log In as Bank Officer ➔'
                      : 'Log In to Upload Documents ➔'}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-6 py-4 border-t border-white/10 text-center text-xs text-indigo-200/60 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 Personal Loan Intake Assistant (India) • Retail Lending Operations</span>
        <span className="text-[11px] text-amber-300 font-medium">
          Confidential • Staff & Applicant Gateway • Strict Non-Decisioning Intake Validation
        </span>
      </footer>
    </div>
  );
};
