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


export default app;
