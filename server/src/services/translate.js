import dotenv from 'dotenv';
import { v2 as Translate } from '@google-cloud/translate';
dotenv.config();

const translate = new Translate.Translate({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export async function translateText(text, targetLang = 'en') {
  if (!text) return '';
  try {
    const [translation] = await translate.translate(text, targetLang);
    return translation;
  } catch (err) {
    console.error('Translation error:', err.message);
    return text; // fallback to original
  }
}
