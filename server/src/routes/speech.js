import express from 'express';
import multer from 'multer';
import { transcribeAudio } from '../services/speech.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const languageCode = req.query.languageCode || 'auto';
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }
    const audioBuffer = req.file.buffer;
    const out = await transcribeAudio(audioBuffer, languageCode);
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Transcription failed', detail: String(e) });
  }
});

export default router;
