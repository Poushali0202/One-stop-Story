import express from "express";
import { getFacilities } from "../services/bild.js";

const router = express.Router();

// POST /facilities { needs: [...] }
router.post("/", async (req, res) => {
  try {
    const { needs = [] } = req.body || {};
    const facilities = await getFacilities(needs);
    res.json({ ok: true, facilities });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Facilities fetch failed", detail: String(e) });
  }
});

export default router;
