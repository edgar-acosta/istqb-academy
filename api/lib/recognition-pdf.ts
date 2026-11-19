import fs from "node:fs";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont } from "pdf-lib";
import type { recognitions } from "../../db/schema";
import { createNodeRequire } from "./node-require";

const fontRequire = createNodeRequire();
const latinBytes = fs.readFileSync(fontRequire.resolve("@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff"));
const extendedBytes = fs.readFileSync(fontRequire.resolve("@fontsource/noto-sans/files/noto-sans-latin-ext-400-normal.woff"));
const latinGlyphs = fontkit.create(latinBytes);
const extendedGlyphs = fontkit.create(extendedBytes);

export function supportsRecognitionName(name: string): boolean {
  return [...name].every((c) => {
    const code = c.codePointAt(0);
    return code !== undefined && (latinGlyphs.hasGlyphForCodePoint(code) || extendedGlyphs.hasGlyphForCodePoint(code));
  });
}

export async function makeRecognitionPdf(recognition: typeof recognitions.$inferSelect) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const latin = await pdf.embedFont(latinBytes);
  const extended = await pdf.embedFont(extendedBytes);
  const page = pdf.addPage([842, 595]);
  const width = page.getWidth();
  const color = rgb(0.13, 0.18, 0.23);
  const drawCentered = (text: string, y: number, size: number) => {
    const segments: { text: string; font: PDFFont }[] = [];
    for (const char of text) {
      const code = char.codePointAt(0);
      if (code === undefined) throw new Error("Carácter inválido en el reconocimiento.");
      const font = latinGlyphs.hasGlyphForCodePoint(code) ? latin : extended;
      if (!latinGlyphs.hasGlyphForCodePoint(code) && !extendedGlyphs.hasGlyphForCodePoint(code)) {
        throw new Error("El reconocimiento contiene caracteres no admitidos por la fuente.");
      }
      const last = segments.at(-1);
      if (last && last.font === font) last.text += char;
      else segments.push({ text: char, font });
    }
    let textWidth = segments.reduce((total, segment) => total + segment.font.widthOfTextAtSize(segment.text, size), 0);
    if (textWidth > width - 100) {
      size *= (width - 100) / textWidth;
      textWidth = width - 100;
    }
    let x = (width - textWidth) / 2;
    for (const segment of segments) {
      page.drawText(segment.text, { x, y, size, font: segment.font, color });
      x += segment.font.widthOfTextAtSize(segment.text, size);
    }
  };
  page.drawRectangle({ x: 25, y: 25, width: width - 50, height: 545, borderWidth: 1, borderColor: color });
  drawCentered("RECONOCIMIENTO DE FINALIZACIÓN Y EVALUACIÓN DE CONOCIMIENTOS", 500, 17);
  drawCentered(recognition.issuer, 455, 16);
  drawCentered("Se reconoce que", 407, 14);
  drawCentered(recognition.recipientName, 365, 25);
  drawCentered("completó los requisitos internos y aprobó la evaluación de", 320, 13);
  drawCentered(recognition.courseTitle, 293, 15);
  drawCentered(`Versión ${recognition.courseVersion} · Resultado: ${recognition.score}/${recognition.total}`, 263, 12);
  drawCentered(`Fecha de emisión (UTC): ${recognition.issuedAt.toISOString().slice(0, 10)}`, 228, 11);
  drawCentered(`Folio: ${recognition.folio}`, 205, 10);
  drawCentered("Este reconocimiento acredita una evaluación interna, no una certificación", 135, 11);
  drawCentered("oficial ISTQB ni implica acreditación o aval de ISTQB.", 117, 11);
  return pdf.save();
}
