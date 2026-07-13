// One-time favicon generator. Builds a multi-resolution favicon.ico
// from the brand monogram PNG, suitable for /app/favicon.ico.
//
// Run with:  node scripts/build-favicon.mjs

import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import toIco from 'to-ico';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'public', 'brand', 'monogram-256.png');
const OUT = path.join(ROOT, 'src', 'app', 'favicon.ico');

const SIZES = [16, 32, 48];

async function main() {
  const buf = await fs.readFile(SRC);
  const pngs = await Promise.all(
    SIZES.map(async (size) => {
      const png = await sharp(buf).resize(size, size).png().toBuffer();
      return { size, data: png };
    }),
  );
  // to-ico expects a list of Buffers; it picks the appropriate one
  // for each container (browser tab, bookmark, taskbar).
  const ico = await toIco(pngs.map((p) => p.data));
  await fs.writeFile(OUT, ico);
  console.log(`Wrote ${path.relative(ROOT, OUT)} (${ico.length} bytes, ${SIZES.join('/')})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
