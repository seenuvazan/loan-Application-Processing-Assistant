import db from './database';
import { initSchema } from './schema';
import { v4 as uuidv4 } from 'uuid';

initSchema();

// Reference date: 2026-10-06
const TODAY = '2026-10-06';
const THREE_MONTHS_AGO = '2026-07-06';
const FOUR_MONTHS_AGO = '2026-06-06';
const FUTURE_DATE = '2026-12-01';
const ONE_YEAR_AGO = '2025-10-06';

interface SeedApp {
  id: string;
  applicantName: string | null;
  requestedAmount: number | null;
  loanPurpose: string;
  employmentType: string;
  declaredEmployer: string | null;
  declaredMonthlyIncome: number | null;
  applicationDate: string;
  employmentStartDate: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  maskedAccountNumber: string | null;
  applicantNotes: string;
  documents: Array<{
    documentType: 'Identity' | 'Address' | 'Income' | 'BankStatement';
    status: 'Received' | 'Missing' | 'Expired' | 'Unclear';
    documentDate: string | null;
    issuerOrEmployerName: string | null;
    incomeAmountOnDocument: number | null;
    statementPeriod: string | null;
  }>;
  expectedRuleIds: string[];
}

const apps: SeedApp[] = [
  // ─── GROUP 1: ~6 Complete (no findings) ───────────────────────────────────
  {
    id: 'APP-001',
    applicantName: 'Priya Subramaniam',
    requestedAmount: 500000,
    loanPurpose: 'Home renovation',
    employmentType: 'Salaried',
    declaredEmployer: 'Infosys Limited',
    declaredMonthlyIncome: 85000,
    applicationDate: TODAY,
    employmentStartDate: '2020-03-01',
    contactEmail: 'priya.subramaniam@example.com',
    contactPhone: '9876543210',
    maskedAccountNumber: 'XXXXXXXX3210',
    applicantNotes: 'Applying for home renovation. Requested ₹500000.',
    documents: [
      { documentType: 'Identity', status: 'Received', documentDate: '2023-05-10', issuerOrEmployerName: 'UIDAI', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Received', documentDate: '2023-01-15', issuerOrEmployerName: 'BSNL', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Received', documentDate: '2026-09-01', issuerOrEmployerName: 'Infosys Limited', incomeAmountOnDocument: 85000, statementPeriod: null },
      { documentType: 'BankStatement', status: 'Received', documentDate: '2026-09-30', issuerOrEmployerName: 'SBI', incomeAmountOnDocument: null, statementPeriod: '2026-06-30 to 2026-09-30' },
    ],
    expectedRuleIds: [],
  },
  {
    id: 'APP-002',
    applicantName: 'Arjun Menon',
    requestedAmount: 750000,
    loanPurpose: 'Education',
    employmentType: 'Salaried',
    declaredEmployer: 'Wipro Technologies',
    declaredMonthlyIncome: 95000,
    applicationDate: TODAY,
    employmentStartDate: '2019-06-15',
    contactEmail: 'arjun.menon@example.com',
    contactPhone: '8765432109',
    maskedAccountNumber: 'XXXXXXXX2109',
    applicantNotes: 'Education loan for post-graduate studies.',
    documents: [
      { documentType: 'Identity', status: 'Received', documentDate: '2024-02-20', issuerOrEmployerName: 'Passport Authority', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Received', documentDate: '2024-01-10', issuerOrEmployerName: 'HDFC Bank', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Received', documentDate: '2026-08-31', issuerOrEmployerName: 'Wipro Technologies', incomeAmountOnDocument: 95000, statementPeriod: null },
      { documentType: 'BankStatement', status: 'Received', documentDate: '2026-09-30', issuerOrEmployerName: 'ICICI Bank', incomeAmountOnDocument: null, statementPeriod: '2026-06-30 to 2026-09-30' },
    ],
    expectedRuleIds: [],
  },
  {
    id: 'APP-003',
    applicantName: 'Kavitha Rajan',
    requestedAmount: 300000,
    loanPurpose: 'Medical expenses',
    employmentType: 'Self-Employed',
    declaredEmployer: 'Rajan Textiles',
    declaredMonthlyIncome: 60000,
    applicationDate: TODAY,
    employmentStartDate: '2015-08-01',
    contactEmail: 'kavitha.rajan@example.com',
    contactPhone: '7654321098',
    maskedAccountNumber: 'XXXXXXXX1098',
    applicantNotes: 'Medical emergency expenses.',
    documents: [
      { documentType: 'Identity', status: 'Received', documentDate: '2022-11-05', issuerOrEmployerName: 'UIDAI', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Received', documentDate: '2023-07-20', issuerOrEmployerName: 'EB Office', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Received', documentDate: '2026-09-15', issuerOrEmployerName: 'Rajan Textiles', incomeAmountOnDocument: 60000, statementPeriod: null },
      { documentType: 'BankStatement', status: 'Received', documentDate: '2026-09-30', issuerOrEmployerName: 'Canara Bank', incomeAmountOnDocument: null, statementPeriod: '2026-06-01 to 2026-09-30' },
    ],
    expectedRuleIds: [],
  },
  {
    id: 'APP-004',
    applicantName: 'Suresh Nair',
    requestedAmount: 1200000,
    loanPurpose: 'Vehicle purchase',
    employmentType: 'Salaried',
    declaredEmployer: 'Tata Consultancy Services',
    declaredMonthlyIncome: 150000,
    applicationDate: TODAY,
    employmentStartDate: '2017-01-10',
    contactEmail: 'suresh.nair@example.com',
    contactPhone: '9123456780',
    maskedAccountNumber: 'XXXXXXXX6780',
    applicantNotes: 'Vehicle purchase for family use.',
    documents: [
      { documentType: 'Identity', status: 'Received', documentDate: '2025-01-01', issuerOrEmployerName: 'UIDAI', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Received', documentDate: '2025-03-15', issuerOrEmployerName: 'Gas Agency', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Received', documentDate: '2026-09-30', issuerOrEmployerName: 'Tata Consultancy Services', incomeAmountOnDocument: 150000, statementPeriod: null },
      { documentType: 'BankStatement', status: 'Received', documentDate: '2026-09-30', issuerOrEmployerName: 'Axis Bank', incomeAmountOnDocument: null, statementPeriod: '2026-06-30 to 2026-09-30' },
    ],
    expectedRuleIds: [],
  },
  {
    id: 'APP-005',
    applicantName: 'Deepa Krishnan',
    requestedAmount: 200000,
    loanPurpose: 'Business expansion',
    employmentType: 'Self-Employed',
    declaredEmployer: 'Krishnan Enterprises',
    declaredMonthlyIncome: 45000,
    applicationDate: TODAY,
    employmentStartDate: '2012-04-01',
    contactEmail: 'deepa.krishnan@example.com',
    contactPhone: '8234567891',
    maskedAccountNumber: 'XXXXXXXX7891',
    applicantNotes: 'Looking to expand business operations.',
    documents: [
      { documentType: 'Identity', status: 'Received', documentDate: '2023-08-20', issuerOrEmployerName: 'Passport Authority', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Received', documentDate: '2023-06-10', issuerOrEmployerName: 'Water Board', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Received', documentDate: '2026-08-01', issuerOrEmployerName: 'Krishnan Enterprises', incomeAmountOnDocument: 45000, statementPeriod: null },
      { documentType: 'BankStatement', status: 'Received', documentDate: '2026-09-30', issuerOrEmployerName: 'Union Bank', incomeAmountOnDocument: null, statementPeriod: '2026-06-01 to 2026-09-30' },
    ],
    expectedRuleIds: [],
  },
  {
    id: 'APP-006',
    applicantName: 'Vijay Anand',
    requestedAmount: 900000,
    loanPurpose: 'Home renovation',
    employmentType: 'Salaried',
    declaredEmployer: 'HCL Technologies',
    declaredMonthlyIncome: 120000,
    applicationDate: TODAY,
    employmentStartDate: '2018-09-01',
    contactEmail: 'vijay.anand@example.com',
    contactPhone: '9345678902',
    maskedAccountNumber: 'XXXXXXXX8902',
    applicantNotes: 'Kitchen and bathroom renovation project.',
    documents: [
      { documentType: 'Identity', status: 'Received', documentDate: '2024-04-10', issuerOrEmployerName: 'UIDAI', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Received', documentDate: '2024-02-28', issuerOrEmployerName: 'BSNL', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Received', documentDate: '2026-09-01', issuerOrEmployerName: 'HCL Technologies', incomeAmountOnDocument: 120000, statementPeriod: null },
      { documentType: 'BankStatement', status: 'Received', documentDate: '2026-09-30', issuerOrEmployerName: 'Kotak Bank', incomeAmountOnDocument: null, statementPeriod: '2026-06-30 to 2026-09-30' },
    ],
    expectedRuleIds: [],
  },

  // ─── GROUP 2: ~7 Missing Documents ────────────────────────────────────────
  {
    id: 'APP-007',
    applicantName: 'Meena Pillai',
    requestedAmount: 400000,
    loanPurpose: 'Personal needs',
    employmentType: 'Salaried',
    declaredEmployer: 'Cognizant Technology Solutions',
    declaredMonthlyIncome: 70000,
    applicationDate: TODAY,
    employmentStartDate: '2021-01-15',
    contactEmail: 'meena.pillai@example.com',
    contactPhone: '9456789013',
    maskedAccountNumber: 'XXXXXXXX9013',
    applicantNotes: 'Personal needs.',
    documents: [
      { documentType: 'Identity', status: 'Received', documentDate: '2023-10-01', issuerOrEmployerName: 'UIDAI', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Missing', documentDate: null, issuerOrEmployerName: null, incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Received', documentDate: '2026-09-01', issuerOrEmployerName: 'Cognizant Technology Solutions', incomeAmountOnDocument: 70000, statementPeriod: null },
      { documentType: 'BankStatement', status: 'Received', documentDate: '2026-09-30', issuerOrEmployerName: 'HDFC Bank', incomeAmountOnDocument: null, statementPeriod: '2026-06-30 to 2026-09-30' },
    ],
    expectedRuleIds: ['R2'],
  },
  {
    id: 'APP-008',
    applicantName: 'Ravi Kumar',
    requestedAmount: 600000,
    loanPurpose: 'Debt consolidation',
    employmentType: 'Salaried',
    declaredEmployer: 'Accenture India',
    declaredMonthlyIncome: 90000,
    applicationDate: TODAY,
    employmentStartDate: '2020-08-01',
    contactEmail: 'ravi.kumar@example.com',
    contactPhone: '8567890124',
    maskedAccountNumber: 'XXXXXXXX0124',
    applicantNotes: 'Consolidating existing loans.',
    documents: [
      { documentType: 'Identity', status: 'Missing', documentDate: null, issuerOrEmployerName: null, incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Received', documentDate: '2024-01-20', issuerOrEmployerName: 'BSNL', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Missing', documentDate: null, issuerOrEmployerName: null, incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'BankStatement', status: 'Received', documentDate: '2026-09-30', issuerOrEmployerName: 'PNB', incomeAmountOnDocument: null, statementPeriod: '2026-06-30 to 2026-09-30' },
    ],
    expectedRuleIds: ['R2', 'R2'],
  },
  {
    id: 'APP-009',
    applicantName: 'Lakshmi Venkatesh',
    requestedAmount: 150000,
    loanPurpose: 'Travel',
    employmentType: 'Contract',
    declaredEmployer: 'Freelance Consulting',
    declaredMonthlyIncome: 40000,
    applicationDate: TODAY,
    employmentStartDate: '2022-03-01',
    contactEmail: 'lakshmi.venkatesh@example.com',
    contactPhone: '7678901235',
    maskedAccountNumber: 'XXXXXXXX1235',
    applicantNotes: 'Travel loan for international trip.',
    documents: [
      { documentType: 'Identity', status: 'Received', documentDate: '2023-05-01', issuerOrEmployerName: 'Passport Authority', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Received', documentDate: '2023-04-01', issuerOrEmployerName: 'Water Board', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Received', documentDate: '2026-08-15', issuerOrEmployerName: 'Freelance Consulting', incomeAmountOnDocument: 40000, statementPeriod: null },
      { documentType: 'BankStatement', status: 'Missing', documentDate: null, issuerOrEmployerName: null, incomeAmountOnDocument: null, statementPeriod: null },
    ],
    expectedRuleIds: ['R2'],
  },
  {
    id: 'APP-010',
    applicantName: 'Sanjay Iyer',
    requestedAmount: 800000,
    loanPurpose: 'Home purchase',
    employmentType: 'Salaried',
    declaredEmployer: 'Reliance Industries',
    declaredMonthlyIncome: 110000,
    applicationDate: TODAY,
    employmentStartDate: '2016-05-01',
    contactEmail: 'sanjay.iyer@example.com',
    contactPhone: '9789012346',
    maskedAccountNumber: 'XXXXXXXX2346',
    applicantNotes: 'Looking to purchase a flat.',
    documents: [
      { documentType: 'Identity', status: 'Expired', documentDate: '2020-01-01', issuerOrEmployerName: 'UIDAI', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Received', documentDate: '2025-06-01', issuerOrEmployerName: 'BSNL', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Received', documentDate: '2026-09-01', issuerOrEmployerName: 'Reliance Industries', incomeAmountOnDocument: 110000, statementPeriod: null },
      { documentType: 'BankStatement', status: 'Missing', documentDate: null, issuerOrEmployerName: null, incomeAmountOnDocument: null, statementPeriod: null },
    ],
    expectedRuleIds: ['R2', 'R2'],
  },
  {
    id: 'APP-011',
    applicantName: 'Anitha Chandran',
    requestedAmount: 350000,
    loanPurpose: 'Education',
    employmentType: 'Salaried',
    declaredEmployer: 'Tech Mahindra',
    declaredMonthlyIncome: 65000,
    applicationDate: TODAY,
    employmentStartDate: '2021-07-01',
    contactEmail: 'anitha.chandran@example.com',
    contactPhone: '8890123457',
    maskedAccountNumber: 'XXXXXXXX3457',
    applicantNotes: 'Education loan for professional course.',
    documents: [
      { documentType: 'Identity', status: 'Received', documentDate: '2024-03-01', issuerOrEmployerName: 'UIDAI', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Missing', documentDate: null, issuerOrEmployerName: null, incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Missing', documentDate: null, issuerOrEmployerName: null, incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'BankStatement', status: 'Missing', documentDate: null, issuerOrEmployerName: null, incomeAmountOnDocument: null, statementPeriod: null },
    ],
    expectedRuleIds: ['R2', 'R2', 'R2'],
  },
  {
    id: 'APP-012',
    applicantName: 'Rahul Sharma',
    requestedAmount: 550000,
    loanPurpose: 'Wedding expenses',
    employmentType: 'Salaried',
    declaredEmployer: 'Capgemini India',
    declaredMonthlyIncome: 80000,
    applicationDate: TODAY,
    employmentStartDate: '2019-11-01',
    contactEmail: 'rahul.sharma@example.com',
    contactPhone: '9901234568',
    maskedAccountNumber: 'XXXXXXXX4568',
    applicantNotes: 'Wedding expenses for family function.',
    documents: [
      { documentType: 'Identity', status: 'Unclear', documentDate: '2022-05-01', issuerOrEmployerName: 'UIDAI', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Received', documentDate: '2024-04-01', issuerOrEmployerName: 'BSNL', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Received', documentDate: '2026-09-01', issuerOrEmployerName: 'Capgemini India', incomeAmountOnDocument: 80000, statementPeriod: null },
      { documentType: 'BankStatement', status: 'Received', documentDate: '2026-09-30', issuerOrEmployerName: 'HDFC Bank', incomeAmountOnDocument: null, statementPeriod: '2026-06-30 to 2026-09-30' },
    ],
    expectedRuleIds: [],
  },
  {
    id: 'APP-013',
    applicantName: 'Sneha Balakrishnan',
    requestedAmount: 420000,
    loanPurpose: 'Personal needs',
    employmentType: 'Salaried',
    declaredEmployer: 'L&T Infotech',
    declaredMonthlyIncome: 75000,
    applicationDate: TODAY,
    employmentStartDate: '2020-04-01',
    contactEmail: 'sneha.balakrishnan@example.com',
    contactPhone: '8012345679',
    maskedAccountNumber: 'XXXXXXXX5679',
    applicantNotes: 'Personal loan for household needs.',
    documents: [
      { documentType: 'Identity', status: 'Missing', documentDate: null, issuerOrEmployerName: null, incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Missing', documentDate: null, issuerOrEmployerName: null, incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Received', documentDate: '2026-08-01', issuerOrEmployerName: 'L&T Infotech', incomeAmountOnDocument: 75000, statementPeriod: null },
      { documentType: 'BankStatement', status: 'Received', documentDate: '2026-09-30', issuerOrEmployerName: 'SBI', incomeAmountOnDocument: null, statementPeriod: '2026-06-30 to 2026-09-30' },
    ],
    expectedRuleIds: ['R2', 'R2'],
  },

  // ─── GROUP 3: ~6 Date Mismatches ──────────────────────────────────────────
  {
    id: 'APP-014',
    applicantName: 'Balaji Murugan',
    requestedAmount: 700000,
    loanPurpose: 'Business expansion',
    employmentType: 'Self-Employed',
    declaredEmployer: 'Murugan Textiles',
    declaredMonthlyIncome: 100000,
    applicationDate: TODAY,
    employmentStartDate: '2027-01-01', // R6: after application date
    contactEmail: 'balaji.murugan@example.com',
    contactPhone: '9112345680',
    maskedAccountNumber: 'XXXXXXXX5680',
    applicantNotes: 'Business loan for textile expansion.',
    documents: [
      { documentType: 'Identity', status: 'Received', documentDate: '2024-01-10', issuerOrEmployerName: 'UIDAI', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Received', documentDate: '2023-11-20', issuerOrEmployerName: 'Water Board', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Received', documentDate: FOUR_MONTHS_AGO, issuerOrEmployerName: 'Murugan Textiles', incomeAmountOnDocument: 100000, statementPeriod: null }, // R6: stale
      { documentType: 'BankStatement', status: 'Received', documentDate: '2026-09-30', issuerOrEmployerName: 'IOB', incomeAmountOnDocument: null, statementPeriod: '2026-06-30 to 2026-09-30' },
    ],
    expectedRuleIds: ['R6', 'R6'],
  },
  {
    id: 'APP-015',
    applicantName: 'Geeta Venkataramaiah',
    requestedAmount: 250000,
    loanPurpose: 'Medical expenses',
    employmentType: 'Salaried',
    declaredEmployer: 'Apollo Hospitals',
    declaredMonthlyIncome: 55000,
    applicationDate: TODAY,
    employmentStartDate: '2018-02-01',
    contactEmail: 'geeta.venkataramaiah@example.com',
    contactPhone: '7223456791',
    maskedAccountNumber: 'XXXXXXXX6791',
    applicantNotes: 'Hospital expenses.',
    documents: [
      { documentType: 'Identity', status: 'Received', documentDate: '2023-07-01', issuerOrEmployerName: 'UIDAI', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Received', documentDate: '2023-05-15', issuerOrEmployerName: 'TNEB', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Received', documentDate: FUTURE_DATE, issuerOrEmployerName: 'Apollo Hospitals', incomeAmountOnDocument: 55000, statementPeriod: null }, // R6: future dated
      { documentType: 'BankStatement', status: 'Received', documentDate: '2026-09-30', issuerOrEmployerName: 'SBI', incomeAmountOnDocument: null, statementPeriod: '2026-06-30 to 2026-09-30' },
    ],
    expectedRuleIds: ['R6'],
  },
  {
    id: 'APP-016',
    applicantName: 'Prakash Sundar',
    requestedAmount: 1000000,
    loanPurpose: 'Vehicle purchase',
    employmentType: 'Salaried',
    declaredEmployer: 'Mahindra Finance',
    declaredMonthlyIncome: 140000,
    applicationDate: TODAY,
    employmentStartDate: '2015-06-01',
    contactEmail: 'prakash.sundar@example.com',
    contactPhone: '9334567802',
    maskedAccountNumber: 'XXXXXXXX7802',
    applicantNotes: 'Commercial vehicle purchase.',
    documents: [
      { documentType: 'Identity', status: 'Received', documentDate: '2025-02-01', issuerOrEmployerName: 'UIDAI', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Received', documentDate: '2025-01-01', issuerOrEmployerName: 'Gas Agency', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Received', documentDate: '2026-09-01', issuerOrEmployerName: 'Mahindra Finance', incomeAmountOnDocument: 140000, statementPeriod: null },
      { documentType: 'BankStatement', status: 'Received', documentDate: '2026-09-30', issuerOrEmployerName: 'Axis Bank', incomeAmountOnDocument: null, statementPeriod: '2026-08-30 to 2026-09-30' }, // R6: only 1 month
    ],
    expectedRuleIds: ['R6'],
  },
  {
    id: 'APP-017',
    applicantName: 'Uma Shankar',
    requestedAmount: 450000,
    loanPurpose: 'Home renovation',
    employmentType: 'Contract',
    declaredEmployer: 'Freelance IT',
    declaredMonthlyIncome: 68000,
    applicationDate: TODAY,
    employmentStartDate: '2023-01-01',
    contactEmail: 'uma.shankar@example.com',
    contactPhone: '8445678913',
    maskedAccountNumber: 'XXXXXXXX8913',
    applicantNotes: 'Renovation of living room.',
    documents: [
      { documentType: 'Identity', status: 'Received', documentDate: '2022-12-01', issuerOrEmployerName: 'Passport Authority', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Received', documentDate: '2023-02-01', issuerOrEmployerName: 'Water Board', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Received', documentDate: FOUR_MONTHS_AGO, issuerOrEmployerName: 'Freelance IT', incomeAmountOnDocument: 68000, statementPeriod: null }, // R6: stale
      { documentType: 'BankStatement', status: 'Received', documentDate: '2026-09-30', issuerOrEmployerName: 'Kotak Bank', incomeAmountOnDocument: null, statementPeriod: '2026-07-01 to 2026-09-30' }, // ok (3 months)
    ],
    expectedRuleIds: ['R6'],
  },
  {
    id: 'APP-018',
    applicantName: 'Gowri Devi',
    requestedAmount: 180000,
    loanPurpose: 'Personal needs',
    employmentType: 'Salaried',
    declaredEmployer: 'Chennai Corporation',
    declaredMonthlyIncome: 38000,
    applicationDate: TODAY,
    employmentStartDate: '2010-09-01',
    contactEmail: 'gowri.devi@example.com',
    contactPhone: '9556789024',
    maskedAccountNumber: 'XXXXXXXX9024',
    applicantNotes: 'General personal expenses.',
    documents: [
      { documentType: 'Identity', status: 'Received', documentDate: '2023-03-10', issuerOrEmployerName: 'UIDAI', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Received', documentDate: '2023-01-01', issuerOrEmployerName: 'EB Office', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Received', documentDate: '2026-09-01', issuerOrEmployerName: 'Chennai Corporation', incomeAmountOnDocument: 38000, statementPeriod: null },
      { documentType: 'BankStatement', status: 'Received', documentDate: FUTURE_DATE, issuerOrEmployerName: 'IOB', incomeAmountOnDocument: null, statementPeriod: '2026-09-01 to 2026-09-30' }, // R6: future date + short period
    ],
    expectedRuleIds: ['R6', 'R6'],
  },
  {
    id: 'APP-019',
    applicantName: 'Senthil Kumar',
    requestedAmount: 650000,
    loanPurpose: 'Debt consolidation',
    employmentType: 'Salaried',
    declaredEmployer: 'Muthoot Finance',
    declaredMonthlyIncome: 92000,
    applicationDate: TODAY,
    employmentStartDate: '2014-11-01',
    contactEmail: 'senthil.kumar@example.com',
    contactPhone: '8667890135',
    maskedAccountNumber: 'XXXXXXXX0135',
    applicantNotes: 'Debt consolidation plan.',
    documents: [
      { documentType: 'Identity', status: 'Received', documentDate: '2024-06-01', issuerOrEmployerName: 'UIDAI', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Received', documentDate: '2024-04-15', issuerOrEmployerName: 'BSNL', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Received', documentDate: FOUR_MONTHS_AGO, issuerOrEmployerName: 'Muthoot Finance', incomeAmountOnDocument: 92000, statementPeriod: null }, // R6: stale
      { documentType: 'BankStatement', status: 'Received', documentDate: '2026-09-30', issuerOrEmployerName: 'SBI', incomeAmountOnDocument: null, statementPeriod: '2026-05-01 to 2026-09-30' },
    ],
    expectedRuleIds: ['R6'],
  },

  // ─── GROUP 4: ~6 Amount/Income/Employer Inconsistencies ───────────────────
  {
    id: 'APP-020',
    applicantName: 'Nithya Ramesh',
    requestedAmount: 500000,
    loanPurpose: 'Home renovation',
    employmentType: 'Salaried',
    declaredEmployer: 'Infosys Limited',
    declaredMonthlyIncome: 85000,
    applicationDate: TODAY,
    employmentStartDate: '2020-06-01',
    contactEmail: 'nithya.ramesh@example.com',
    contactPhone: '9778901246',
    maskedAccountNumber: 'XXXXXXXX1246',
    applicantNotes: 'Looking for Rs. 300000 for renovation.',  // R7: notes say 300000 but requested 500000
    documents: [
      { documentType: 'Identity', status: 'Received', documentDate: '2023-10-01', issuerOrEmployerName: 'UIDAI', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Received', documentDate: '2023-09-01', issuerOrEmployerName: 'TNEB', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Received', documentDate: '2026-09-01', issuerOrEmployerName: 'Infosys Ltd', incomeAmountOnDocument: 85000, statementPeriod: null }, // R4: "Infosys Limited" vs "Infosys Ltd"
      { documentType: 'BankStatement', status: 'Received', documentDate: '2026-09-30', issuerOrEmployerName: 'HDFC Bank', incomeAmountOnDocument: null, statementPeriod: '2026-06-30 to 2026-09-30' },
    ],
    expectedRuleIds: ['R4', 'R7'],
  },
  {
    id: 'APP-021',
    applicantName: 'Karthik Sundaram',
    requestedAmount: 850000,
    loanPurpose: 'Education',
    employmentType: 'Salaried',
    declaredEmployer: 'Zoho Corporation',
    declaredMonthlyIncome: 115000,
    applicationDate: TODAY,
    employmentStartDate: '2019-03-01',
    contactEmail: 'karthik.sundaram@example.com',
    contactPhone: '8889012357',
    maskedAccountNumber: 'XXXXXXXX2357',
    applicantNotes: 'Education loan.',
    documents: [
      { documentType: 'Identity', status: 'Received', documentDate: '2024-01-15', issuerOrEmployerName: 'UIDAI', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Received', documentDate: '2023-12-01', issuerOrEmployerName: 'Gas Agency', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Received', documentDate: '2026-09-01', issuerOrEmployerName: 'Zoho Corporation', incomeAmountOnDocument: 95000, statementPeriod: null }, // R5: declared 115000, doc says 95000
      { documentType: 'BankStatement', status: 'Received', documentDate: '2026-09-30', issuerOrEmployerName: 'Axis Bank', incomeAmountOnDocument: null, statementPeriod: '2026-06-30 to 2026-09-30' },
    ],
    expectedRuleIds: ['R5'],
  },
  {
    id: 'APP-022',
    applicantName: 'Padma Venugopal',
    requestedAmount: 2500000, // R3: exceeds 2000000
    loanPurpose: 'Property purchase',
    employmentType: 'Self-Employed',
    declaredEmployer: 'Venugopal Constructions',
    declaredMonthlyIncome: 200000,
    applicationDate: TODAY,
    employmentStartDate: '2005-01-01',
    contactEmail: 'padma.venugopal@example.com',
    contactPhone: '9990123468',
    maskedAccountNumber: 'XXXXXXXX3468',
    applicantNotes: 'Property purchase.',
    documents: [
      { documentType: 'Identity', status: 'Received', documentDate: '2025-01-01', issuerOrEmployerName: 'Passport Authority', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Received', documentDate: '2024-12-01', issuerOrEmployerName: 'EB Office', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Received', documentDate: '2026-09-01', issuerOrEmployerName: 'Venugopal Constructions', incomeAmountOnDocument: 200000, statementPeriod: null },
      { documentType: 'BankStatement', status: 'Received', documentDate: '2026-09-30', issuerOrEmployerName: 'Canara Bank', incomeAmountOnDocument: null, statementPeriod: '2026-06-30 to 2026-09-30' },
    ],
    expectedRuleIds: ['R3'],
  },
  {
    id: 'APP-023',
    applicantName: 'Mohan Raj',
    requestedAmount: 40000, // R3: below 50000
    loanPurpose: 'Emergency',
    employmentType: 'Salaried',
    declaredEmployer: 'Local Grocery Store',
    declaredMonthlyIncome: 18000,
    applicationDate: TODAY,
    employmentStartDate: '2021-08-01',
    contactEmail: 'mohan.raj@example.com',
    contactPhone: '8101234579',
    maskedAccountNumber: 'XXXXXXXX4579',
    applicantNotes: 'Emergency fund requirement.',
    documents: [
      { documentType: 'Identity', status: 'Received', documentDate: '2022-06-01', issuerOrEmployerName: 'UIDAI', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Received', documentDate: '2022-05-01', issuerOrEmployerName: 'Water Board', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Received', documentDate: '2026-09-01', issuerOrEmployerName: 'Local Grocery Store', incomeAmountOnDocument: 18000, statementPeriod: null },
      { documentType: 'BankStatement', status: 'Received', documentDate: '2026-09-30', issuerOrEmployerName: 'SBI', incomeAmountOnDocument: null, statementPeriod: '2026-06-30 to 2026-09-30' },
    ],
    expectedRuleIds: ['R3'],
  },
  {
    id: 'APP-024',
    applicantName: 'Saranya Prabhu',
    requestedAmount: 320000,
    loanPurpose: 'Home renovation',
    employmentType: 'Salaried',
    declaredEmployer: 'Sundaram Finance',
    declaredMonthlyIncome: 58000,
    applicationDate: TODAY,
    employmentStartDate: '2022-09-01',
    contactEmail: 'not-an-email', // R8: bad email
    contactPhone: '12345', // R8: bad phone
    maskedAccountNumber: 'ABCD1234', // R8: bad masked number
    applicantNotes: 'Renovation of kitchen.',
    documents: [
      { documentType: 'Identity', status: 'Received', documentDate: '2023-04-01', issuerOrEmployerName: 'UIDAI', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Received', documentDate: '2023-03-01', issuerOrEmployerName: 'Gas Agency', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Income', status: 'Received', documentDate: '2026-09-01', issuerOrEmployerName: 'Sundaram Finance', incomeAmountOnDocument: 58000, statementPeriod: null },
      { documentType: 'BankStatement', status: 'Received', documentDate: '2026-09-30', issuerOrEmployerName: 'Kotak Bank', incomeAmountOnDocument: null, statementPeriod: '2026-06-30 to 2026-09-30' },
    ],
    expectedRuleIds: ['R8', 'R8', 'R8'],
  },
  {
    id: 'APP-025',
    applicantName: 'Ramesh Babu',
    requestedAmount: 600000,
    loanPurpose: 'Debt consolidation',
    employmentType: 'Salaried',
    declaredEmployer: 'Larsen and Toubro',
    declaredMonthlyIncome: 88000,
    applicationDate: TODAY,
    employmentStartDate: '2016-02-01',
    contactEmail: 'ramesh.babu@example.com',
    contactPhone: '9213456890',
    maskedAccountNumber: 'XXXXXXXX6890',
    applicantNotes: 'Need INR 450000 for debt consolidation purposes.', // R7: noted 450000 vs requested 600000
    documents: [
      { documentType: 'Identity', status: 'Received', documentDate: '2023-09-01', issuerOrEmployerName: 'UIDAI', incomeAmountOnDocument: null, statementPeriod: null },
      { documentType: 'Address', status: 'Missing', documentDate: null, issuerOrEmployerName: null, incomeAmountOnDocument: null, statementPeriod: null }, // R2
      { documentType: 'Income', status: 'Received', documentDate: '2026-09-01', issuerOrEmployerName: 'L and T', incomeAmountOnDocument: 75000, statementPeriod: null }, // R4: L&T vs "L and T", R5: 88k vs 75k
      { documentType: 'BankStatement', status: 'Received', documentDate: '2026-09-30', issuerOrEmployerName: 'SBI', incomeAmountOnDocument: null, statementPeriod: '2026-06-30 to 2026-09-30' },
    ],
    expectedRuleIds: ['R2', 'R4', 'R5', 'R7'],
  },
];

function seedDatabase() {
  const insertApp = db.prepare(`
    INSERT OR REPLACE INTO applications (
      id, applicantName, requestedAmount, loanPurpose, employmentType,
      declaredEmployer, declaredMonthlyIncome, applicationDate, employmentStartDate,
      contactEmail, contactPhone, maskedAccountNumber, applicantNotes, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertDoc = db.prepare(`
    INSERT OR REPLACE INTO documents (
      id, applicationId, documentType, status, documentDate,
      issuerOrEmployerName, incomeAmountOnDocument, statementPeriod
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();

  const seedAll = db.transaction(() => {
    for (const app of apps) {
      insertApp.run(
        app.id, app.applicantName, app.requestedAmount, app.loanPurpose,
        app.employmentType, app.declaredEmployer, app.declaredMonthlyIncome,
        app.applicationDate, app.employmentStartDate, app.contactEmail,
        app.contactPhone, app.maskedAccountNumber, app.applicantNotes, now, now
      );

      for (const doc of app.documents) {
        const docId = `${app.id}-${doc.documentType}`;
        insertDoc.run(
          docId, app.id, doc.documentType, doc.status,
          doc.documentDate, doc.issuerOrEmployerName,
          doc.incomeAmountOnDocument, doc.statementPeriod
        );
      }
    }
  });

  seedAll();
  console.log(`✅ Seeded ${apps.length} applications with documents.`);
}

// Export expected validations for test lab
