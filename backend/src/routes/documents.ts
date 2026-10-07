import { Router, Request, Response } from 'express';
import db from '../db/database';

const router = Router();

// GET /api/documents/:applicationId
router.get('/:applicationId', (req: Request, res: Response) => {
  const docs = db.prepare('SELECT * FROM documents WHERE applicationId = ?').all(req.params.applicationId);
  res.json(docs);
});

// PUT /api/documents/:id
router.put('/:id', (req: Request, res: Response) => {
  const body = req.body;
  const existing = db.prepare('SELECT id FROM documents WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Document not found' });

  db.prepare(`
    UPDATE documents SET
      status = ?, documentDate = ?, issuerOrEmployerName = ?,
      incomeAmountOnDocument = ?, statementPeriod = ?
    WHERE id = ?
  `).run(
    body.status || 'Missing',
    body.documentDate || null,
    body.issuerOrEmployerName || null,
    body.incomeAmountOnDocument || null,
    body.statementPeriod || null,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// POST /api/documents - bulk upsert for an application
router.post('/', (req: Request, res: Response) => {
  const { applicationId, documents } = req.body;
  if (!applicationId || !documents) return res.status(400).json({ error: 'applicationId and documents required' });

  const upsert = db.prepare(`
    INSERT INTO documents (id, applicationId, documentType, status, documentDate, issuerOrEmployerName, incomeAmountOnDocument, statementPeriod)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      status = excluded.status,
      documentDate = excluded.documentDate,
      issuerOrEmployerName = excluded.issuerOrEmployerName,
      incomeAmountOnDocument = excluded.incomeAmountOnDocument,
      statementPeriod = excluded.statementPeriod
  `);

  const upsertAll = db.transaction((docs: typeof documents) => {
    for (const doc of docs) {
      const id = `${applicationId}-${doc.documentType}`;
      upsert.run(id, applicationId, doc.documentType, doc.status || 'Missing', doc.documentDate || null, doc.issuerOrEmployerName || null, doc.incomeAmountOnDocument || null, doc.statementPeriod || null);
    }
  });

  upsertAll(documents);
  const result = db.prepare('SELECT * FROM documents WHERE applicationId = ?').all(applicationId);
  res.json(result);
});

export default router;
