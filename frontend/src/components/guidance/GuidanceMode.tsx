import React, { useState } from 'react';
import { Compass, ShieldAlert, Info, Calculator, FileText, CheckCircle2 } from 'lucide-react';
import { formatINR, formatINRCompact } from '../../utils/formatters';

interface LoanCategoryInfo {
  category: string;
  type: 'Unsecured' | 'Secured';
  plainExplanation: string;
  typicalDocuments: string[];
}

const CATEGORY_MAP: Record<string, LoanCategoryInfo> = {
  'Home Renovation / Repair': {
    category: 'Personal Loan (Home Improvement) or Home Improvement Loan',
    type: 'Unsecured',
    plainExplanation:
      'For refurbishing, painting, or extending an existing residential property without mortgaging property title deeds.',
    typicalDocuments: ['PAN & Aadhaar', 'Salary Slips / ITR', '6 Months Bank Statement', 'Home Ownership Proof / Tax Receipt'],
  },
  'Medical Emergency': {
    category: 'Personal Loan (Medical)',
    type: 'Unsecured',
    plainExplanation:
      'Fast liquidity to meet hospitalization or emergency healthcare outlays without collateral.',
    typicalDocuments: ['PAN & Aadhaar', 'Salary Slips / Income Proof', 'Bank Statement', 'Hospital Estimate (Optional)'],
  },
  'Higher Education': {
    category: 'Education Loan or Personal Loan for Studies',
    type: 'Unsecured',
    plainExplanation:
      'Covers tuition fees, living expenses, and overseas costs. Specialized education loans may offer student tax benefits (Sec 80E).',
    typicalDocuments: ['Admission Letter', 'KYC of Applicant & Co-applicant', 'Income Proof of Co-borrower', 'Fee Structure'],
  },
  'Wedding / Family Event': {
    category: 'Personal Loan (Wedding / Celebration)',
    type: 'Unsecured',
    plainExplanation:
      'Flexible end-use personal financing for event catering, venue bookings, and ceremonies.',
    typicalDocuments: ['PAN & Masked Aadhaar', 'Salary Slips / Form 16', 'Bank Statement (6 Months)'],
  },
  'Business Expansion / Working Capital': {
    category: 'Business / MSME Loan',
    type: 'Secured',
    plainExplanation:
      'Funding for business machinery, inventory, or operational receivables. Often supported under CGTMSE or bank MSME policies.',
    typicalDocuments: ['GST Returns (12 Months)', 'ITR with Audit Report (2 Years)', 'Current Account Bank Statement', 'Udyam Registration'],
  },
  'Vehicle Purchase (Car / Bike)': {
    category: 'Vehicle / Auto Loan',
    type: 'Secured',
    plainExplanation:
      'Secured against the vehicle hypothecation. Usually offers lower interest rates than unsecured personal loans.',
    typicalDocuments: ['Proforma Invoice from Dealer', 'Income Proof / Salary Slips', 'Bank Statement', 'KYC & Address Proof'],
  },
  'Debt Consolidation': {
    category: 'Personal Loan (Consolidation)',
    type: 'Unsecured',
    plainExplanation:
      'Combines multiple high-cost credit cards or small short-term loans into a single structured monthly instalment.',
    typicalDocuments: ['Existing Loan Sanction Letters / Foreclosure Statements', 'PAN & Aadhaar', 'Salary Slips', 'Bank Statement'],
  },
  'Gold / Jewellery Backed': {
    category: 'Gold Loan',
    type: 'Secured',
    plainExplanation:
      'Secured against 18-22K gold ornaments with fast appraisal and minimal income documentation required.',
    typicalDocuments: ['Physical Gold Ornaments for Valuation', 'Basic KYC (PAN & Aadhaar)'],
  },
  'Loan Against Fixed Deposit / Mutual Funds': {
    category: 'Loan Against Securities / FD',
    type: 'Secured',
    plainExplanation:
      'Overdraft or term loan pledged against existing term deposits or mutual fund units without liquidating investments.',
    typicalDocuments: ['FD Receipt / Demat Holding Statement', 'Lien Marking Consent', 'Basic KYC'],
  },
};

export const GuidanceMode: React.FC = () => {
  // Guidance planning state
  const [purpose, setPurpose] = useState<string>('Home Renovation / Repair');
  const [employmentType, setEmploymentType] = useState<'Salaried' | 'Self-Employed'>('Salaried');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(85000);
  const [existingEmis, setExistingEmis] = useState<number>(15000);
  const [amountNeeded, setAmountNeeded] = useState<number>(500000);
  const [tenureMonths, setTenureMonths] = useState<number>(36);

  // User-editable illustrative planning parameters
  const [foirCapPercent, setFoirCapPercent] = useState<number>(45); // default 45% of income
  const [sampleInterestRate, setSampleInterestRate] = useState<number>(10.5); // 10.5% p.a.

  // Affordability calculation
  // Affordable EMI = (Cap % * income) - existing EMIs
  const maxAllowableTotalEmi = Math.round((foirCapPercent / 100) * monthlyIncome);
  const illustrativeAffordableEmi = Math.max(0, maxAllowableTotalEmi - existingEmis);

  // Principal calculation via standard EMI formula:
  // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
  // => P = EMI * ((1+r)^n - 1) / (r * (1+r)^n)
  const monthlyRate = sampleInterestRate / 12 / 100;
  const n = tenureMonths;
  const emiFactor =
    monthlyRate > 0
      ? (Math.pow(1 + monthlyRate, n) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, n))
      : n;
  const illustrativeAffordablePrincipal = Math.round(illustrativeAffordableEmi * emiFactor);

  // EMI for the specific requested amount needed
  const requiredEmiForAmountNeeded =
    monthlyRate > 0
      ? Math.round(
          (amountNeeded * monthlyRate * Math.pow(1 + monthlyRate, n)) /
            (Math.pow(1 + monthlyRate, n) - 1)
        )
      : Math.round(amountNeeded / n);

  const categoryInfo = CATEGORY_MAP[purpose] || CATEGORY_MAP['Home Renovation / Repair'];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Guidance Mode Guardrail Banner */}
      <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <ShieldAlert className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <span className="font-extrabold text-xs uppercase tracking-wider bg-emerald-200 dark:bg-emerald-900/80 px-2 py-0.5 rounded text-emerald-800 dark:text-emerald-300 mr-2">
              Customer Planning Aid
            </span>
            <strong className="text-xs font-bold">
              Indicative only. Not an offer or decision. The lender decides.
            </strong>
          </div>
        </div>
        <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
          Exploratory calculations only • Never ranks applicants • No credit guarantee
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs: Need Summary */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Compass className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Customer Financing Need Profile
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter financial inputs to explore illustrative loan options
              </p>
            </div>
          </div>

          {/* Purpose */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Intended Loan Purpose
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {Object.keys(CATEGORY_MAP).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Employment Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Employment Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEmploymentType('Salaried')}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  employmentType === 'Salaried'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Salaried Employee
              </button>
              <button
                type="button"
                onClick={() => setEmploymentType('Self-Employed')}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  employmentType === 'Self-Employed'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Self-Employed / Business
              </button>
            </div>
          </div>

          {/* Monthly Income */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Net Monthly In-Hand Income
              </label>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatINR(monthlyIncome)}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-slate-400">₹</span>
              <input
                type="number"
                step="5000"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Math.max(0, Number(e.target.value)))}
                className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Existing EMIs */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Existing Monthly Debt / EMI Commitments
              </label>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {formatINR(existingEmis)}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-slate-400">₹</span>
              <input
                type="number"
                step="2000"
                value={existingEmis}
                onChange={(e) => setExistingEmis(Math.max(0, Number(e.target.value)))}
                className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Amount Needed */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Target Loan Amount Needed
              </label>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatINR(amountNeeded)}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-slate-400">₹</span>
              <input
                type="number"
                step="25000"
                value={amountNeeded}
                onChange={(e) => setAmountNeeded(Math.max(10000, Number(e.target.value)))}
                className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Tenure Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Preferred Repayment Tenure
              </label>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {tenureMonths} Months ({(tenureMonths / 12).toFixed(1)} Yrs)
              </span>
            </div>
            <input
              type="range"
              min="12"
              max="84"
              step="6"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>12 Mo (1 Yr)</span>
              <span>36 Mo (3 Yrs)</span>
              <span>84 Mo (7 Yrs)</span>
            </div>
          </div>
        </div>

        {/* Right Output: Loan Category Mapping & Affordability Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {/* Category Mapping Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Mapped Loan Category
                </span>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {categoryInfo.category}
                </h4>
              </div>

              <span
                className={`px-3 py-1 text-xs font-bold rounded-full self-start sm:self-auto ${
                  categoryInfo.type === 'Secured'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                }`}
              >
                {categoryInfo.type} Loan
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {categoryInfo.plainExplanation}
            </p>

            {/* Typical Documents */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                Typical Documents Required by Lenders:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categoryInfo.typicalDocuments.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Illustrative Affordability Range Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-emerald-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Illustrative Affordability Estimation
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">Standard Annuity Formula</span>
            </div>

            {/* Simulation Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    Debt-to-Income (FOIR) Cap
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {foirCapPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="60"
                  step="5"
                  value={foirCapPercent}
                  onChange={(e) => setFoirCapPercent(Number(e.target.value))}
                  className="w-full accent-emerald-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Typical bank guideline: 40%–50%</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    Sample Indicative Rate (p.a.)
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {sampleInterestRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="8.5"
                  max="18.0"
                  step="0.5"
                  value={sampleInterestRate}
                  onChange={(e) => setSampleInterestRate(Number(e.target.value))}
                  className="w-full accent-emerald-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Illustrative benchmark rate</span>
              </div>
            </div>

            {/* Affordability Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">
                  Comfortable Monthly Capacity (EMI)
                </span>
                <div className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                  {formatINR(illustrativeAffordableEmi)}
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400/80">
                  Income ({formatINR(monthlyIncome)}) × {foirCapPercent}% - Existing EMIs ({formatINR(existingEmis)})
                </p>
              </div>

              <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-800 dark:text-indigo-300">
                  Illustrative Principal Capacity
                </span>
                <div className="text-xl font-black text-indigo-700 dark:text-indigo-400">
                  {formatINR(illustrativeAffordablePrincipal)}
                </div>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400/80">
                  Estimated at {sampleInterestRate}% p.a. over {tenureMonths} months
                </p>
              </div>
            </div>

            {/* Requested Amount Comparison */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  EMI Required for Requested {formatINR(amountNeeded)}:
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {formatINR(requiredEmiForAmountNeeded)} / month
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {requiredEmiForAmountNeeded <= illustrativeAffordableEmi
                  ? `✓ Requested amount EMI (${formatINR(requiredEmiForAmountNeeded)}) fits within your illustrative comfort envelope (${formatINR(illustrativeAffordableEmi)}).`
                  : `⚠️ Requested amount EMI (${formatINR(requiredEmiForAmountNeeded)}) exceeds illustrative capacity (${formatINR(illustrativeAffordableEmi)}). Consider increasing tenure or reducing principal.`}
              </p>
            </div>

            {/* Assumptions List & Disclaimer */}
            <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="font-bold uppercase tracking-wider block text-slate-500">
                Mathematical Assumptions:
              </span>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Fixed Obligation to Income Ratio (FOIR) capped at {foirCapPercent}%.</li>
                <li>Uniform monthly reducing balance interest rate calculation.</li>
                <li>Actual sanctions depend on bank credit policy, documentation, and underwriter judgment.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  return null;
};
