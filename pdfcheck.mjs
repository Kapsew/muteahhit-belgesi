import { readFileSync } from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function check(filename) {
  console.log('\n========== ' + filename + ' ==========');
  const buf = readFileSync(filename);
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
  console.log('Pages:', doc.numPages);

  // Check for embedded files (attachments)
  try {
    const attachments = await doc.getAttachments();
    if (attachments && Object.keys(attachments).length > 0) {
      console.log('!!! EMBEDDED FILES:');
      for (const [name, info] of Object.entries(attachments)) {
        console.log('  - ' + name + ' (' + info.content?.length + ' bytes)');
      }
    } else {
      console.log('No embedded files');
    }
  } catch(e) { console.log('Attachment check error:', e.message); }

  // Check metadata
  const meta = await doc.getMetadata();
  console.log('Metadata:', JSON.stringify(meta.info, null, 2).slice(0, 500));

  // Check first page for forms/annotations
  const page = await doc.getPage(1);
  const annotations = await page.getAnnotations();
  console.log('Annotations on page 1:', annotations.length);
  if (annotations.length > 0) {
    annotations.slice(0, 3).forEach(a => {
      console.log('  - Type:', a.subtype, 'Field:', a.fieldName || '-');
    });
  }
}

await check('test1.pdf');
await check('test22.pdf');
