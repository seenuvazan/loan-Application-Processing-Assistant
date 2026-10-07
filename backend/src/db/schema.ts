import db from './database';

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      applicantName TEXT,
      requestedAmount REAL,
      loanPurpose TEXT,
      employmentType TEXT,
      declaredEmployer TEXT,
      declaredMonthlyIncome REAL,
      applicationDate TEXT,
      employmentStartDate TEXT,
      contactEmail TEXT,
      contactPhone TEXT,
      maskedAccountNumber TEXT,
      applicantNotes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    