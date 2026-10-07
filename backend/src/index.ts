import express from 'express';
import cors from 'cors';
import { initSchema } from './db/schema';
import { EXPECTED_VALIDATIONS } from './db/seed';
import applicationsRouter from './routes/applications';
import documentsRouter from './routes/documents';
import summariesRouter from './routes/summaries';
import followupRouter from './routes/followup';
import signoffRouter from './routes/signoff';
import testlabRouter from './routes/testlab';
import validateRouter from './routes/validate';
import rulesJson from './rules/rules.json';
import db from './db/database';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/applications', applicationsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/summaries', summariesRouter);
app.use('/api/followup', followupRouter);
app.use('/api/signoff', signoffRouter);
app.use('/api/testlab', testlabRouter);
app.use('/api/validate', validateRouter);

// Rules config endpoints
app.get('/api/rules', (_req, res) => {
  const overrideRow = db.prepare("SELECT value FROM rule_config WHERE key = 'overrides'").get() as { value: string } | undefined;
  const overrides = overrideRow ? JSON.parse(overrideRow.value) : {};
  res.json({ base: rulesJson, overrides });
});

app.put('/api/rules', (req, res) => {
  const { overrides } = req.body;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO rule_config (key, value, updatedAt) VALUES ('overrides', ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt
  `).run(JSON.stringify(overrides), now);

  // Log the change
  db.prepare(`
    INSERT INTO rule_config (key, value, updatedAt) VALUES ('overrides_log_' || ?, ?, ?)
    ON CONFLICT(key) DO NOTHING
  `).run(now, JSON.stringify(overrides), now);

  res.json({ success: true, overrides });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Guardrail scan endpoint
app.post('/api/guardrail/scan', (req, res) => {
  const { scanForForbiddenTerms } = require('./guardrail');
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });
  const result = scanForForbiddenTerms(text);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`🏦 LoanIntake Assistant Backend running on http://localhost:${PORT}`);
  console.log(`📋 ${EXPECTED_VALIDATIONS.length} seeded applications ready.`);
});

export default app;

// Backend server configured
