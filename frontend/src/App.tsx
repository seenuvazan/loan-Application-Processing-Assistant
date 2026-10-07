import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { GuardrailBanner } from './components/common/GuardrailBanner';
import { CaseList } from './components/intake/CaseList';
import { CaseDetail } from './components/intake/CaseDetail';
import { ValidationEvidence } from './components/evidence/ValidationEvidence';
import { GuidanceMode } from './components/guidance/GuidanceMode';
import { LoginPage } from './components/auth/LoginPage';
import { CustomerUploadPortal } from './components/customer/CustomerUploadPortal';

const AppContent: React.FC = () => {
  const { isAuthenticated, currentUser, mode } = useApp();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Customer View
  if (currentUser.userType === 'customer') {
    return <CustomerUploadPortal />;
  }

  // Bank Officer View
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased overflow-hidden select-text">
      <Header />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {mode === 'intake' && <GuardrailBanner />}

        {mode === 'intake' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <CaseList />
            <CaseDetail />
          </div>
        )}

        {mode === 'evidence' && (
          <div className="flex-1 overflow-y-auto">
            <ValidationEvidence />
          </div>
        )}

        {mode === 'guidance' && (
          <div className="flex-1 overflow-y-auto">
            <GuidanceMode />
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

  return null;
}
