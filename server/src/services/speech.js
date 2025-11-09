import fs from "fs";
import dotenv from "dotenv";
import { translateText } from "./translate.js";   // ✅ translation helper
dotenv.config();

let speechClient;

/**
 * Ensure Google Speech client
 */
async function ensureClient() {
  if (speechClient) return speechClient;
  try {
    const mod = await import("@google-cloud/speech");
    const { SpeechClient } = mod;
    speechClient = new SpeechClient();
    return speechClient;
  } catch (err) {
    console.error("⚠️ Google STT not available:", err.message);
    return null;
  }
}

/**
 * Transcribe WAV (LINEAR16) buffer → text + English translation
 */
export async function transcribeAudio(audioBuffer, languageCode = "en-US") {
  const client = await ensureClient();
  if (!client) {
    return {
      transcript: "Transcription (mock)",
      translation: "",
      language: languageCode,
      confidence: 0,
    };
  }

  try {
    const audioBytes = audioBuffer.toString("base64");

    const config = {
      encoding: "LINEAR16",
      sampleRateHertz: 16000,
      languageCode: languageCode === "auto" ? "en-US" : languageCode,
      alternativeLanguageCodes: [
        "en-US","es-ES","hi-IN","te-IN","bn-IN","zh-CN","ja-JP","fr-FR","de-DE",
      ],
      enableAutomaticPunctuation: true,
    };

    const [resp] = await client.recognize({ audio: { content: audioBytes }, config });
    const results = resp.results || [];
    const transcript = results.map(r => r.alternatives?.[0]?.transcript || "").join(" ").trim();
    const confidence = results[0]?.alternatives?.[0]?.confidence || 0;

    let englishTranslation = "";
    if (transcript && !languageCode.startsWith("en")) {
      try {
        englishTranslation = await translateText(transcript, "en");
      } catch (e) {
        console.warn("Translation failed:", e.message);
      }
    }

    return {
      transcript,
      translation: englishTranslation,
      language: languageCode,
      confidence,
    };
  } catch (e) {
    console.error("❌ Speech error:", e.message);
    return { transcript: "", translation: "", language: languageCode, confidence: 0 };
  }
}
