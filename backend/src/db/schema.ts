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

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      applicationId TEXT NOT NULL,
      documentType TEXT NOT NULL CHECK(documentType IN ('Identity','Address','Income','BankStatement')),
      status TEXT NOT NULL CHECK(status IN ('Received','Missing','Expired','Unclear')),
      documentDate TEXT,
      issuerOrEmployerName TEXT,
      incomeAmountOnDocument REAL,
      statementPeriod TEXT,
      FOREIGN KEY (applicationId) REFERENCES applications(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS summaries (
      id TEXT PRIMARY KEY,
      applicationId TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      editedBy TEXT,
      editedAt TEXT,
      isEdited INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (applicationId) REFERENCES applications(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS followup_drafts (
      id TEXT PRIMARY KEY,
      applicationId TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      editedAt TEXT,
      FOREIGN KEY (applicationId) REFERENCES applications(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS signoffs (
      id TEXT PRIMARY KEY,
      applicationId TEXT NOT NULL,
      reviewerName TEXT NOT NULL,
      reviewerRole TEXT NOT NULL,
      outcome TEXT NOT NULL,
      comment TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (applicationId) REFERENCES applications(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS rule_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);
}

// Schema initialization verified
