import { readFileSync } from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const buf = readFileSync('sistem.pdf');
const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
console.log('TOTAL PAGES:', doc.numPages);
for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const content = await page.getTextContent();
  const text = content.items.map(it => it.str).join(' ');
  console.log('\n========== PAGE ' + i + ' ==========');
  console.log(text);
}
