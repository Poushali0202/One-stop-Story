import path from "path";
import fs from "fs";
import { PDFDocument } from "pdf-lib";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_DIR = path.join(__dirname, "../../runtime/templates");
const ARTIFACTS_DIR = path.join(__dirname, "../../runtime/artifacts");

// ✅ ensure runtime folders exist
for (const dir of [TEMPLATE_DIR, ARTIFACTS_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Format a phone number into a clean +1 (XXX) XXX-XXXX form
 */
function formatPhone(raw = "") {
  if (!raw) return "";
  const digits = raw.replace(/[^\d+]/g, "");
  let formatted = digits;

  // if it starts with + already, keep as-is
  if (digits.startsWith("+")) {
    formatted = digits;
  } else if (digits.length === 11 && digits.startsWith("1")) {
    const n = digits.slice(1);
    formatted = `+1 (${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`;
  } else if (digits.length === 10) {
    formatted = `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 12 && digits.startsWith("91")) {
    // Indian numbers example
    const n = digits.slice(2);
    formatted = `+91 ${n.slice(0, 5)}-${n.slice(5)}`;
  }
  return formatted;
}

/**
 * Fill the agency PDF template with schema fields.
 * Works for AgencyA / AgencyB templates under runtime/templates.
 */
export async function fillAgencyPdf(agency, schema) {
  const templatePath = path.join(TEMPLATE_DIR, `${agency}.pdf`);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  const bytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(bytes);
  const form = pdfDoc.getForm();

  const flat = {
    full_name: schema?.person_name || "Anonymous",
    preferred_language: schema?.language || "",
    current_sleeping: schema?.current_status?.sleeping || "",
    nights: String(schema?.current_status?.nights || ""),
    needs: (schema?.needs || [])
      .map((n) => (typeof n === "string" ? n : n.value))
      .join(", "),
    risks: (schema?.risks || [])
      .map((r) => (typeof r === "string" ? r : r.value))
      .join(", "),
    contact_phone:
      formatPhone(
        schema?.contact?.phone ||
          schema?.contact_phone ||
          schema?.phone ||
          ""
      ),
  };

  // ✅ field name aliases (so it fills any reasonable label)
  const FIELD_ALIASES = {
    full_name: ["full_name", "name"],
    preferred_language: ["preferred_language", "language"],
    current_sleeping: ["current_sleeping", "sleeping"],
    nights: ["nights", "duration"],
    needs: ["needs", "key_needs", "requirements"],
    risks: ["risks", "safety_risks"],
    contact_phone: [
      "contact_phone",
      "contact",
      "phone",
      "contact_number",
      "contact_no",
      "phone_number",
      "contact info",
    ],
  };

  for (const [logical, aliases] of Object.entries(FIELD_ALIASES)) {
    const value = flat[logical] || "";
    if (!value) continue;

    for (const alias of aliases) {
      try {
        const field = form.getTextField(alias);
        field.setText(String(value));
        break; // stop after first successful fill
      } catch {
        // ignore if that alias isn't in the template
      }
    }
  }

  form.flatten();

  const outName = `${agency}-${Date.now()}.pdf`;
  const outPath = path.join(ARTIFACTS_DIR, outName);
  fs.writeFileSync(outPath, await pdfDoc.save());
  console.log(`✅ PDF generated for ${agency}: ${outPath}`);
  return outPath;
}
