import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts } from 'pdf-lib';

export async function ensureTemplates(dir) {
  const targets = ['AgencyA.pdf','AgencyB.pdf'];
  for (const name of targets) {
    const full = path.join(dir, name);
    if (!fs.existsSync(full)) {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const form = pdfDoc.getForm();
      const title = name.replace('.pdf','') + ' – Intake Form';
      page.drawText(title, { x: 50, y: 800, size: 18, font });

      const fields = [
        ['full_name', 'Full Name', 50, 760, 400, 20],
        ['preferred_language', 'Preferred Language', 50, 730, 200, 20],
        ['current_sleeping', 'Current Sleeping', 50, 700, 200, 20],
        ['nights', 'Nights (approx)', 280, 700, 80, 20],
        ['needs', 'Key Needs', 50, 670, 500, 20],
        ['risks', 'Safety Risks', 50, 640, 500, 20],
        ['phone', 'Contact Phone', 50, 610, 200, 20]
      ];
      fields.forEach(([name, label, x, y, w, h]) => {
        page.drawText(label, { x, y: y+5, size: 10, font });
        const tf = form.createTextField(name);
        tf.setText('');
        tf.addToPage(page, { x: x+150, y, width: w, height: h });
      });

      const bytes = await pdfDoc.save();
      fs.writeFileSync(full, bytes);
      console.log('Generated template', full);
    }
  }
}
