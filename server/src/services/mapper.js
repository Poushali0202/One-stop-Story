// server/src/services/mapper.js
import dotenv from "dotenv";
dotenv.config();

/**
 * Very fast rule-based mapper:
 *  - pulls language, sleeping, nights, needs, risks
 *  - extracts phone number if present in narrative
 * Works offline (no LLM), good defaults for hackathon/demo.
 */

const NEED_TAGS = {
  shelter: [
    "shelter", "place to stay", "stay", "room", "housing", "roof", "overnight",
    "बिस्तर", "रहने", "आश्रय", "घर", "住宿", "住处", "住", "shelter", "habitación",
  ],
  food: [
    "food", "eat", "meal", "hunger", "hungry",
    "खाना", "भूख", "饭", "食物", "comida",
  ],
  health: [
    "doctor", "clinic", "medical", "medicine", "health", "nurse",
    "डॉक्टर", "क्लिनिक", "健康", "医院", "salud",
  ],
  safety: [
    "unsafe", "violence", "abuse", "assault", "stalking", "fear", "harm",
    "असुरक्षित", "हिंसा", "安全", "暴力", "seguridad",
  ],
  transportation: [
    "bus", "train", "transport", "fare", "ticket", "transit",
    "बस", "ट्रेन", "交通", "公交", "transporte",
  ],
  employment: [
    "job", "work", "employment", "hire", "resume",
    "काम", "नौकरी", "trabajo",
  ],
  education: [
    "school", "college", "classes", "education", "ged", "training",
    "स्कूल", "교육", "教育", "escuela",
  ],
  hygiene: [
    "shower", "bath", "toilet", "washroom", "hygiene",
    "शावर", "卫生", "aseo",
  ],
};

const RISK_TAGS = {
  dv: ["partner", "ex", "boyfriend", "girlfriend", "domestic", "abuse", "violence", "unsafe", "threat", "fear", "assault", "stalking"],
  animals: ["dog", "dogs", "pet", "pets", "animal", "animals"],
  medical: ["seizure", "asthma", "insulin", "oxygen", "allergy", "diabetic"],
};

const SLEEPING_MAP = [
  { key: "car",   words: ["car", "van", "vehicle", "truck", "parking"] },
  { key: "street", words: ["street", "road", "outside", "sidewalk", "park"] },
  { key: "shelter", words: ["shelter", "drop-in", "warming center", "center"] },
  { key: "couch", words: ["couch", "friend", "relative", "sofa"] },
];

function detectNeeds(text) {
  const t = text.toLowerCase();
  const found = new Set();
  for (const [tag, words] of Object.entries(NEED_TAGS)) {
    if (words.some(w => t.includes(w))) found.add(tag);
  }
  return Array.from(found).map(v => ({ value: v }));
}

function detectRisks(text) {
  const t = text.toLowerCase();
  const found = new Set();
  for (const [tag, words] of Object.entries(RISK_TAGS)) {
    if (words.some(w => t.includes(w))) found.add(tag);
  }
  return Array.from(found).map(v => ({ value: v }));
}

function detectSleeping(text) {
  const t = text.toLowerCase();
  for (const option of SLEEPING_MAP) {
    if (option.words.some(w => t.includes(w))) return option.key;
  }
  return "";
}

function detectNights(text) {
  const t = text.toLowerCase();
  // e.g., "for 3 nights", "3 days", "five nights"
  const digit = t.match(/(\d{1,2})\s+(night|nights|day|days)/);
  if (digit) return Number(digit[1]);
  // words (basic)
  const words = [
    ["one","1"],["two","2"],["three","3"],["four","4"],["five","5"],
    ["six","6"],["seven","7"],["eight","8"],["nine","9"],["ten","10"]
  ];
  for (const [w,n] of words) {
    if (t.includes(`${w} night`) || t.includes(`${w} day`)) return Number(n);
  }
  return 0;
}

function extractPhone(text) {
  // tolerant phone pattern
  const m = text.match(/(\+?\d[\d\s().-]{7,}\d)/);
  if (!m) return "";
  const digits = m[1].replace(/[^\d+]/g, "");
  // normalize US 10/11 digits; otherwise return as found
  if (digits.startsWith("+")) return digits;
  if (digits.length === 11 && digits.startsWith("1")) return `+1${digits.slice(1)}`;
  if (digits.length === 10) return `+1${digits}`;
  return digits;
}

/**
 * Main entry
 */
export async function mapNarrativeToSchema(transcript, language = "en", hints = {}) {
  const text = transcript || "";
  const lang = (language || "en").toLowerCase();

  const schema = {
    language: lang,
    current_status: {
      sleeping: detectSleeping(text),
      nights: detectNights(text),
    },
    needs: detectNeeds(text),
    risks: detectRisks(text),
  };

  // contact phone: prefer explicit hint from client; else extract
  const phone = hints.contact_phone || extractPhone(text);
  if (phone) {
    schema.contact = { phone };
    schema.contact_phone = phone; // keep simple key too (for PDF filler)
  }

  return { schema };
}
