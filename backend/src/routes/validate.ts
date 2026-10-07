import { Router, Request, Response } from 'express';
import { validateApplication } from '../rules/engine';

const router = Router();

// GET /api/validate/:applicationId
router.get('/:applicationId', (req: Request, res: Response) => {
  const result = validateApplication(req.params.applicationId);
  res.json(result);
});

export default router;
