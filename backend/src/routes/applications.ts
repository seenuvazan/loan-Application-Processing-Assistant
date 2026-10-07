import { Router, Request, Response } from 'express';
import db from '../db/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/applications
router.get('/', (_req: Request, res: Response) => {
  const apps = db.prepare('SELECT * FROM applications ORDER BY id ASC').all();
  res.json(apps);
});

// GET /api/applications/:id
router.get('/:id', (req: Request, res: Response) => {
  const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
  if (!app) return res.status(404).json({ error: 'Application not found' });
  res.json(app);
});

// POST /api/applications
router.post('/', (req: Request, res: Response) => {
  const body = req.body;
  const id = body.id || `APP-${String(Date.now()).slice(-6)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO applications (
      id, applicantName, requestedAmount, loanPurpose, employmentType,
      declaredEmployer, declaredMonthlyIncome, applicationDate, employmentStartDate,
      contactEmail, contactPhone, maskedAccountNumber, applicantNotes, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, body.applicantName || null, body.requestedAmount || null, body.loanPurpose || null,
    body.employmentType || null, body.declaredEmployer || null, body.declaredMonthlyIncome || null,
    body.applicationDate || null, body.employmentStartDate || null, body.contactEmail || null,
    body.contactPhone || null, body.maskedAccountNumber || null, body.applicantNotes || null,
    now, now
  );

  const created = db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
  res.status(201).json(created);
});

// PUT /api/applications/:id
router.put('/:id', (req: Request, res: Response) => {
  const body = req.body;
  const now = new Date().toISOString();

  const existing = db.prepare('SELECT id FROM applications WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Application not found' });

  db.prepare(`
    UPDATE applications SET
      applicantName = ?, requestedAmount = ?, loanPurpose = ?, employmentType = ?,
      declaredEmployer = ?, declaredMonthlyIncome = ?, applicationDate = ?, employmentStartDate = ?,
      contactEmail = ?, contactPhone = ?, maskedAccountNumber = ?, applicantNotes = ?, updatedAt = ?
    WHERE id = ?
  `).run(
    body.applicantName || null, body.requestedAmount || null, body.loanPurpose || null,
    body.employmentType || null, body.declaredEmployer || null, body.declaredMonthlyIncome || null,
    body.applicationDate || null, body.employmentStartDate || null, body.contactEmail || null,
    body.contactPhone || null, body.maskedAccountNumber || null, body.applicantNotes || null,
    now, req.params.id
  );

  const updated = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/applications/:id
router.delete('/:id', (req: Request, res: Response) => {
  db.prepare('DELETE FROM applications WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
