import { readFileSync } from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const buf = readFileSync('test22.pdf');
const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;

console.log('Total pages:', doc.numPages);
for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const annots = await page.getAnnotations();
  const formFields = annots.filter(a => a.subtype === 'Widget' || a.fieldName);
  if (formFields.length > 0) {
    console.log('\nPage ' + p + ' form fields:');
    formFields.forEach(f => {
      console.log('  - ' + (f.subtype || '?') + ' | name: ' + (f.fieldName || '-') + ' | type: ' + (f.fieldType || '-') + ' | value: ' + JSON.stringify(f.fieldValue || '').slice(0, 60));
    });
  }
  // Also list link annotations with URLs
  const links = annots.filter(a => a.subtype === 'Link' && a.url);
  if (links.length > 0) {
    console.log('Page ' + p + ' links:');
    links.slice(0, 10).forEach(l => console.log('  - ' + l.url));
  }
}

// Get full text
const page = await doc.getPage(1);
const content = await page.getTextContent();
const text = content.items.map(it => it.str).join(' ');
console.log('\n=== TEXT ===');
console.log(text.slice(0, 3000));
