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

export default router;
