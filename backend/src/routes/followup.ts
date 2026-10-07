import { Router, Request, Response } from 'express';
import db from '../db/database';
import { validateApplication } from '../rules/engine';
import { generateFollowUp } from '../templates/followup';
import { assertGuardrail } from '../guardrail';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/followup/:applicationId
router.get('/:applicationId', (req: Request, res: Response) => {
  const draft = db.prepare('SELECT * FROM followup_drafts WHERE applicationId = ?').get(req.params.applicationId);
  res.json(draft || null);
});

// POST /api/followup/:applicationId/generate
router.post('/:applicationId/generate', (req: Request, res: Response) => {
  const { applicationId } = req.params;
  const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(applicationId) as { id: string; applicantName: string | null } | undefined;
  if (!app) return res.status(404).json({ error: 'Application not found' });

  const { findings } = validateApplication(applicationId);
  const content = generateFollowUp(applicationId, app.applicantName, findings);

  if (content !== 'NO_FOLLOW_UP_REQUIRED') {
    assertGuardrail(content, `follow-up for ${applicationId}`);
  }

  const existing = db.prepare('SELECT id FROM followup_drafts WHERE applicationId = ?').get(applicationId) as { id: string } | undefined;
  const id = existing?.id || uuidv4();

  db.prepare(`
    INSERT INTO followup_drafts (id, applicationId, content, editedAt)
    VALUES (?, ?, ?, NULL)
    ON CONFLICT(applicationId) DO UPDATE SET content = excluded.content, editedAt = NULL
  `).run(id, applicationId, content);

  const result = db.prepare('SELECT * FROM followup_drafts WHERE applicationId = ?').get(applicationId);
  res.json(result);
});

// PUT /api/followup/:applicationId
router.put('/:applicationId', (req: Request, res: Response) => {
  const { applicationId } = req.params;
  const { content } = req.body;
  const now = new Date().toISOString();

  if (content && content !== 'NO_FOLLOW_UP_REQUIRED') {
    assertGuardrail(content, `follow-up edit for ${applicationId}`);
  }

  const existing = db.prepare('SELECT id FROM followup_drafts WHERE applicationId = ?').get(applicationId) as { id: string } | undefined;
  if (!existing) return res.status(404).json({ error: 'Draft not found. Generate first.' });

  db.prepare(`UPDATE followup_drafts SET content = ?, editedAt = ? WHERE applicationId = ?`).run(content, now, applicationId);

  const result = db.prepare('SELECT * FROM followup_drafts WHERE applicationId = ?').get(applicationId);
  res.json(result);
});

export default router;
