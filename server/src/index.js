import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import speechRouter from './routes/speech.js';
import intakeRouter from './routes/intake.js';
import formsRouter from './routes/forms.js';
import consentRouter from './routes/consent.js';
import facilitiesRouter from './routes/facilities.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));


import fs from 'fs';
const runtimeDirs = [
  path.join(__dirname, '../runtime'),
  path.join(__dirname, '../runtime/artifacts'),
  path.join(__dirname, '../runtime/templates'),
  path.join(__dirname, '../runtime/data')
];
runtimeDirs.forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

import { ensureTemplates } from './utils/templates.js';
await ensureTemplates(path.join(__dirname, '../runtime/templates'));

app.use('/artifacts', express.static(path.join(__dirname, '../runtime/artifacts')));

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// 👇 Add this homepage route
app.get('/', (req, res) => {
  res.type('html').send(`
    <h1>One-stop-Story API</h1>
    <ul>
      <li><a href="/health">/health</a></li>
      <li><a href="/facilities">/facilities</a></li>
      <li><a href="/artifacts">/artifacts</a></li>
    </ul>
  `);
});

// Routers
app.use('/speech', speechRouter);
app.use('/intake', intakeRouter);
app.use('/forms', formsRouter);
app.use('/consent', consentRouter);
app.use('/facilities', facilitiesRouter);

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
