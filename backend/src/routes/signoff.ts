import { Router, Request, Response } from 'express';
import db from '../db/database';
import { validateApplication } from '../rules/engine';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/signoff/:applicationId
router.get('/:applicationId', (req: Request, res: Response) => {
  const signoffs = db.prepare('SELECT * FROM signoffs WHERE applicationId = ? ORDER BY timestamp DESC').all(req.params.applicationId);
  res.json(signoffs);
});

// POST /api/signoff/:applicationId
router.post('/:applicationId', (req: Request, res: Response) => {
  const { applicationId } = req.params;
  const { reviewerName, reviewerRole, outcome, comment } = req.body;

  if (reviewerRole === 'Operations Analyst') {
    return res.status(403).json({
      error: 'Operations Analysts cannot sign off. Only Authorized Reviewers may mark an application as Intake Verified or Returned for Correction.'
    });
  }

  const allowed = ['Intake Verified', 'Returned for Correction'];
  if (!allowed.includes(outcome)) {
    return res.status(400).json({ error: `Outcome must be one of: ${allowed.join(', ')}` });
  }

  const id = uuidv4();
  const timestamp = new Date().toISOString();

  db.prepare(`
    INSERT INTO signoffs (id, applicationId, reviewerName, reviewerRole, outcome, comment, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, applicationId, reviewerName, reviewerRole, outcome, comment || null, timestamp);

  const result = db.prepare('SELECT * FROM signoffs WHERE id = ?').get(id);
  res.status(201).json(result);
});

export default router;
