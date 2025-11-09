import fetch from "node-fetch";

// demo data (fallback)
const demoFacilities = [
  {
    id: "shelter-22",
    name: "Fifth Street Women’s Center",
    address: "123 Fifth St, San Francisco, CA",
    privacy: 0.72, egress: 0.85, ada: 0.65,
    tags: ["female-only", "near-transit", "shelter", "health"],
    notes: ["Shower area has curtains", "Ramp present at main entry"],
  },
  {
    id: "shelter-31",
    name: "Bayview Youth Housing",
    address: "789 Third St, San Francisco, CA",
    privacy: 0.80, egress: 0.77, ada: 0.70,
    tags: ["youth", "safe", "shelter"],
    notes: ["Private stalls", "Wider corridors"],
  },
  {
    id: "shelter-45",
    name: "Downtown Transitional Housing",
    address: "200 Market St, San Francisco, CA",
    privacy: 0.68, egress: 0.90, ada: 0.85,
    tags: ["employment", "education", "housing"],
    notes: ["Job training onsite", "Wheelchair accessible"],
  },
];

/**
 * Filter or rank facilities dynamically based on needs.
 * You can plug real APIs here later.
 */
export async function getFacilities(userNeeds = []) {
  const lowerNeeds = userNeeds.map(n => n.toLowerCase());

  // Fallback to demo if no external Bild endpoint
  const url = process.env.BILD_API_URL;
  const key = process.env.BILD_API_KEY;
  if (url && key) {
    try {
      const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn("Bild API unavailable, using demo data.");
    }
  }

  // Simple relevance ranking by tag overlap
  const scored = demoFacilities
    .map(f => {
      const matches = f.tags.filter(t =>
        lowerNeeds.some(n => t.includes(n) || n.includes(t))
      ).length;
      return { ...f, score: matches };
    })
    .sort((a, b) => b.score - a.score);

  // Return top 3 relevant facilities
  return scored.slice(0, 3);
}
