// server/src/routes/intake.js
import express from 'express';
import { mapNarrativeToSchema } from '../services/mapper.js';
import { translateText } from '../services/translate.js';

const router = express.Router();

router.post('/map', async (req, res) => {
  try {
    let { transcript, language, contact_phone } = req.body || {};
    if (!transcript) return res.status(400).json({ error: 'transcript required' });

    // optional: translate to English before mapping if non-en
    if (language && language !== 'en') {
      try {
        transcript = await translateText(transcript, 'en');
      } catch (e) {
        console.warn("Translation before mapping failed; proceeding with original text.");
      }
    }

    const out = await mapNarrativeToSchema(transcript, language || 'en', { contact_phone });
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Mapping failed', detail: String(e) });
  }
});

export default router;
