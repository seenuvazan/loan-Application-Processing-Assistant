import React, { useState } from 'react';
import { useApp, AVAILABLE_USERS } from '../../context/AppContext';
import {
  FileText,
  FlaskConical,
  Compass,
  Sliders,
  Moon,
  Sun,
  RotateCcw,
  UserCheck,
  ShieldCheck,
  User,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { RulesConfigModal } from '../rules/RulesConfigModal';

export const Header: React.FC = () => {
  const {
    mode,
    setMode,
    theme,
    toggleTheme,
    currentUser,
    setCurrentUser,
    logout,
    resetAllToSyntheticDefaults,
  } = useApp();

  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                    LoanIntake
                  </span>
                  <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full uppercase tracking-wider border border-indigo-200/50 dark:border-indigo-800/50">
                    India • Personal Loan
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Pre-Underwriting Intake & KYC Validation Assistant
                </p>
              </div>
            </div>

            {/* Navigation Mode Tabs */}
            <nav className="hidden md:flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-inner">
              <button
                onClick={() => setMode('intake')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mode === 'intake'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Intake Mode</span>
              </button>

              <button
                onClick={() => setMode('evidence')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mode === 'evidence'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Validation Evidence (25)</span>
              </button>

              <button
                onClick={() => setMode('guidance')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mode === 'guidance'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Guidance Mode</span>
              </button>
            </nav>

            {/* Right Action Tools */}
            <div className="flex items-center space-x-2.5">
              {/* Rules Config Button */}
              <button
                onClick={() => setIsRulesOpen(true)}
                title="Configure Validation Rules"
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden lg:inline">Policy Rules</span>
              </button>

              {/* User / Role Switcher (Maker-Checker Demo) */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2.5 px-3 py-1.5 text-xs font-bold rounded-xl border-2 border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-slate-900 dark:text-white transition-all shadow-sm"
                >
                  <span className="text-base p-0.5 rounded-lg bg-white dark:bg-slate-800 shadow-xs">{currentUser.avatar}</span>
                  <div className="text-left hidden sm:block">
                    <div className="font-extrabold leading-tight text-[11px]">{currentUser.name}</div>
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold leading-tight">
                      {currentUser.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-fadeIn">
                    <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Switch Role (Maker-Checker Demo)
                    </div>
                    {AVAILABLE_USERS.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-2.5 px-3 py-2 text-left text-xs transition-colors ${
                          currentUser.id === u.id
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 font-semibold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <span className="text-base">{u.avatar}</span>
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{u.name}</div>
                          <div className="text-[10px] text-slate-400">{u.role}</div>
                        </div>
                        {currentUser.id === u.id && (
                          <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        )}
                      </button>
                    ))}
                    <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Sign Out / Switch Gateway</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Logout Button */}
              <button
                onClick={logout}
                title="Sign out to Login Screen"
                className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors border border-rose-200/50 dark:border-rose-900/50"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                title="Toggle Light/Dark Theme"
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              {/* Reset Data to Seed defaults */}
              <button
                onClick={() => {
                  if (window.confirm('Reset all 25 applications and rules back to initial synthetic seed state?')) {
                    resetAllToSyntheticDefaults();
                  }
                }}
                title="Reset synthetic data to defaults"
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 py-1.5 px-2 bg-slate-50 dark:bg-slate-900">
          <button
            onClick={() => setMode('intake')}
            className={`px-3 py-1 rounded-md text-xs font-semibold ${
              mode === 'intake'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Intake Mode
          </button>
          <button
            onClick={() => setMode('evidence')}
            className={`px-3 py-1 rounded-md text-xs font-semibold ${
              mode === 'evidence'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Evidence (25)
          </button>
          <button
            onClick={() => setMode('guidance')}
            className={`px-3 py-1 rounded-md text-xs font-semibold ${
              mode === 'guidance'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Guidance
          </button>
        </div>
      </header>

      {/* Rules Config Modal */}
      <RulesConfigModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </>
  );
};

  return null;
};
