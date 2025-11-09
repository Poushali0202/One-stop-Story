# One-stop-Story (Mobile + Backend)

A **mobile-first**, trauma‑informed demo app for the California Homeless Youth Project:
- Youth **tell their story once** (voice or chat)
- System maps the story to a **master schema** with provenance
- Youth **chooses** which fields to share with each agency (consent slices)
- App **fills agency PDFs** (locally via `pdf-lib` or Google **Document AI** when configured)
- **Facility Match** shows shelters with **privacy/ADA/egress** scores (via **Bild AI** or demo data)

This repo includes:
- `mobile/` — React Native (Expo) app
- `server/` — Node.js Express backend with optional integrations (Google Cloud, Bild)

> ⚠️ **Privacy-first**: This demo stores all youth data in-device by default. Nothing leaves the device unless the user taps **Share**.

---

## Quick Start (Local Demo)

### Requirements
- Node.js 18+ and npm
- (Optional) Google Cloud service account (for Speech-to-Text, Translation, Vertex AI, Document AI)
- (Optional) Bild API key (for facility scoring — demo JSON included)

### 1) Start the backend

```bash
cd server
cp .env.sample .env
# (edit .env to set API keys or leave as-is to run in local mock mode)
npm install
npm start
# Server runs on http://127.0.0.1:8787
```

The server auto-generates two **fillable PDF templates** for example agencies at `server/runtime/templates/AgencyA.pdf` and `AgencyB.pdf` on first run.

### 2) Start the mobile app

```bash
cd ../mobile
cp .env.sample .env
# Set EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8787 (Android emulator may need http://10.0.2.2:8787)
npm install
npm start
```

Open the app in Expo Go (Android/iOS) or a simulator. If using a **device**, ensure it can reach your computer’s IP (replace the base URL accordingly).

---

## Optional Cloud Integrations

You can run end-to-end **without** any cloud credentials (mock mode). To enable real services:

1. **Google Cloud** (any subset works)
   - Create a service account with roles for:
     - Cloud Speech-to-Text, Cloud Translation, Vertex AI (Text), Document AI
   - Download the JSON key and set in `server/.env`:
     ```ini
     GOOGLE_APPLICATION_CREDENTIALS=./gcp-service-account.json
     GCP_PROJECT_ID=your-project
     GCP_LOCATION=us-central1
     ```
   - Place the downloaded `gcp-service-account.json` file at `server/gcp-service-account.json`.

2. **Bild AI** (facility scoring)
   - Set in `server/.env` (or leave unset to use demo JSON):
     ```ini
     BILD_API_URL=https://api.bild.ai/facilities/score
     BILD_API_KEY=your-bild-key
     ```

3. **Tokens / Consent**
   - JWT used for share tokens:
     ```ini
     JWT_SECRET=dev-secret-change-me
     PUBLIC_BASE_URL=http://127.0.0.1:8787
     ```

---

## What’s Included

- Mobile App (Expo):
  - Intake (voice or typed), Review & Edit with **source highlights**, Consent (per-agency field toggles), Facility Match (scores), Backpack (download artifacts), and Quick Exit (panic wipe).
  - Offline-first local store; bilingual EN/ES UI strings.

- Backend (Express):
  - `/speech/transcribe` — Google STT if configured, else **mock**.
  - `/intake/map` — Vertex AI JSON mapping + provenance if configured, else **rule-based** mapper.
  - `/forms/fill` — fills a PDF **without** Google using `pdf-lib`; optionally attach Document AI parse if configured.
  - `/consent/create` + `/consent/view/:token` — time‑boxed share tokens (JWT).
  - `/facilities` — Bild AI call if configured, else demo JSON.
  - Serves generated artifacts from `server/runtime/artifacts/`.

---

## Notes

- This is a hackathon-grade codebase meant to run locally with **zero credentials**. When credentials are present, cloud paths activate at runtime.
- **Do not** put real PII in the demo.
- License: MIT (see `LICENSE`).
