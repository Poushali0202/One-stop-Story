import express from 'express';
import jwt from 'jsonwebtoken';
import { sliceForAgency } from '../services/agency.js';

const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    const { agency, schema, allowedFields, minutes } = req.body || {};
    if (!agency || !schema || !Array.isArray(allowedFields)) {
      return res.status(400).json({ error: 'agency, schema, allowedFields required' });
    }
    const slice = sliceForAgency(schema, allowedFields);
    const token = jwt.sign({ a: agency, s: slice }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: (minutes || 10) * 60 });
    const url = `${process.env.PUBLIC_BASE_URL || 'http://127.0.0.1:8787'}/consent/view/${token}`;
    res.json({ ok: true, token, url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Consent create failed', detail: String(e) });
  }
});

router.get('/view/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    res.json({ ok: true, agency: decoded.a, fields: decoded.s });
  } catch (e) {
    console.error(e);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

export default router;
