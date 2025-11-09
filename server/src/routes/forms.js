import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { fillAgencyPdf } from '../services/forms.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

router.post('/fill', async (req, res) => {
  try {
    const { agency, schema } = req.body || {};
    if (!agency || !schema) return res.status(400).json({ error: 'agency and schema required' });
    const pdfPath = await fillAgencyPdf(agency, schema);
    const filename = path.basename(pdfPath);
    res.json({
      ok: true,
      artifact_url: `${process.env.PUBLIC_BASE_URL || 'http://127.0.0.1:8787'}/artifacts/${filename}`
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Form fill failed', detail: String(e) });
  }
});

export default router;
