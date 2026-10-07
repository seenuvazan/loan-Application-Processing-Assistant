import { Router, Request, Response } from 'express';
import db from '../db/database';
import { validateApplication } from '../rules/engine';
import { generateSummary } from '../templates/summary';
import { generateFollowUp } from '../templates/followup';
import { assertGuardrail } from '../guardrail';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/summaries/:applicationId
router.get('/:applicationId', (req: Request, res: Response) => {
  const summary = db.prepare('SELECT * FROM summaries WHERE applicationId = ?').get(req.params.applicationId);
  res.json(summary || null);
});

// POST /api/summaries/:applicationId/generate
router.post('/:applicationId/generate', (req: Request, res: Response) => {
  const { applicationId } = req.params;
  const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(applicationId) as Record<string, unknown> | undefined;
  if (!app) return res.status(404).json({ error: 'Application not found' });

  const docs = db.prepare('SELECT * FROM documents WHERE applicationId = ?').all(applicationId) as Array<{ documentType: string; status: string }>;
  const { findings } = validateApplication(applicationId);

  const content = generateSummary(
    app as Parameters<typeof generateSummary>[0],
    docs,
    findings
  );

  assertGuardrail(content, `summary for ${applicationId}`);

  const existing = db.prepare('SELECT id FROM summaries WHERE applicationId = ?').get(applicationId) as { id: string } | undefined;
  const id = existing?.id || uuidv4();

  db.prepare(`
    INSERT INTO summaries (id, applicationId, content, editedBy, editedAt, isEdited)
    VALUES (?, ?, ?, NULL, NULL, 0)
    ON CONFLICT(applicationId) DO UPDATE SET content = excluded.content, editedBy = NULL, editedAt = NULL, isEdited = 0
  `).run(id, applicationId, content);

  const result = db.prepare('SELECT * FROM summaries WHERE applicationId = ?').get(applicationId);
  res.json(result);
});

// PUT /api/summaries/:applicationId
router.put('/:applicationId', (req: Request, res: Response) => {
  const { applicationId } = req.params;
  const { content, editedBy } = req.body;
  const now = new Date().toISOString();

  assertGuardrail(content, `summary edit for ${applicationId}`);

  const existing = db.prepare('SELECT id FROM summaries WHERE applicationId = ?').get(applicationId) as { id: string } | undefined;
  if (!existing) return res.status(404).json({ error: 'Summary not found. Generate first.' });

  db.prepare(`
    UPDATE summaries SET content = ?, editedBy = ?, editedAt = ?, isEdited = 1 WHERE applicationId = ?
  `).run(content, editedBy || 'Operations User', now, applicationId);

  const result = db.prepare('SELECT * FROM summaries WHERE applicationId = ?').get(applicationId);
  res.json(result);
});

// POST /api/summaries/:applicationId/reset
router.post('/:applicationId/reset', (req: Request, res: Response) => {
  const { applicationId } = req.params;
  const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(applicationId) as Record<string, unknown> | undefined;
  if (!app) return res.status(404).json({ error: 'Application not found' });

  const docs = db.prepare('SELECT * FROM documents WHERE applicationId = ?').all(applicationId) as Array<{ documentType: string; status: string }>;
  const { findings } = validateApplication(applicationId);
  const content = generateSummary(app as Parameters<typeof generateSummary>[0], docs, findings);

  assertGuardrail(content, `summary reset for ${applicationId}`);

  db.prepare(`
    UPDATE summaries SET content = ?, editedBy = NULL, editedAt = NULL, isEdited = 0 WHERE applicationId = ?
  `).run(content, applicationId);

  const result = db.prepare('SELECT * FROM summaries WHERE applicationId = ?').get(applicationId);
  res.json(result);
});

export default router;
