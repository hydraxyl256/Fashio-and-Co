// One-time logo optimizer. Reads the project-root logo.jpg and writes
// a set of responsive, tightly-cropped, optimized PNG/WebP variants to
// public/brand/. The original logo is never modified.
//
// Run with:  node scripts/optimize-logo.mjs

import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, 'logo.jpg');
const OUT_DIR = path.join(ROOT, 'public', 'brand');

// Widths cover typical rendering sizes for the header (24–40 CSS px),
// the footer (28–48 CSS px), and the mobile-nav sheet header (32–56 CSS px).
// 2x and 3x DPR account for Retina + large desktop headers.
const WIDTHS = [240, 360, 480, 720, 960, 1219];

// Auto-trim removes the cream border around the mark, leaving the F&C
// monogram with a small, even margin that reads as a considered
// "safe area". This is the variant used in the header and footer.
async function buildMark() {
  const src = sharp(SOURCE);
  const trimmed = await src
    .trim({ background: '#f1ebe2', threshold: 12 })
    .toBuffer();
  const trimmedMeta = await sharp(trimmed).metadata();
  const aspect = trimmedMeta.width / trimmedMeta.height;

  for (const w of WIDTHS) {
    const h = Math.round(w / aspect);
    await sharp(trimmed)
      .resize(w, h, { fit: 'inside' })
      .png({ compressionLevel: 9, palette: true })
      .toFile(path.join(OUT_DIR, `logo-mark-${w}.png`));
    await sharp(trimmed)
      .resize(w, h, { fit: 'inside' })
      .webp({ quality: 88 })
      .toFile(path.join(OUT_DIR, `logo-mark-${w}.webp`));
  }
  return { width: trimmedMeta.width, height: trimmedMeta.height, aspect };
}

// A dark-on-cream version: keeps the cream field intact. This is the
// "full lockup" used in the footer and in marketing surfaces, where
// the mark should sit as a single self-contained emblem.
async function buildLockup() {
  for (const w of WIDTHS) {
    await sharp(SOURCE)
      .resize(w, w, { fit: 'inside' })
      .png({ compressionLevel: 9, palette: true })
      .toFile(path.join(OUT_DIR, `logo-lockup-${w}.png`));
    await sharp(SOURCE)
      .resize(w, w, { fit: 'inside' })
      .webp({ quality: 88 })
      .toFile(path.join(OUT_DIR, `logo-lockup-${w}.webp`));
  }
}

// A solid-background monogram: a single character (the F&C glyph) on
// a brand-tinted background. Used for favicons, apple-touch-icon and
// the OG image. We composite by extracting the foreground using the
// cream background of the source.
async function buildMonogramSquare() {
  const trimmed = await sharp(SOURCE)
    .trim({ background: '#f1ebe2', threshold: 12 })
    .toBuffer();
  const meta = await sharp(trimmed).metadata();
  const size = Math.min(meta.width, meta.height);

  // Brand primary from the app: deep purple #430562
  const background = { r: 0x43, g: 0x05, b: 0x62, alpha: 1 };
  // The mark's foreground is very dark. Lift it slightly to off-white
  // for a clean on-color look. We invert via negate + threshold.
  const fg = await sharp(trimmed)
    .resize(size, size, { fit: 'cover', position: 'center' })
    .negate({ alpha: false })
    .grayscale()
    .normalize()
    .threshold(140)
    .png()
    .toBuffer();

  for (const dim of [32, 64, 128, 180, 256, 512]) {
    const monogram = await sharp({
      create: { width: dim, height: dim, channels: 4, background },
    })
      .composite([
        {
          input: await sharp(fg)
            .resize(Math.round(dim * 0.7), Math.round(dim * 0.7), { fit: 'inside' })
            .toBuffer(),
          gravity: 'center',
        },
      ])
      .png({ compressionLevel: 9 })
      .toBuffer();

    await sharp(monogram).toFile(path.join(OUT_DIR, `monogram-${dim}.png`));
  }
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const { aspect } = await buildMark();
  await buildLockup();
  await buildMonogramSquare();
  console.log(`Wrote logo assets to ${path.relative(ROOT, OUT_DIR)}`);
  console.log(`Trimmed mark aspect ratio: ${aspect.toFixed(4)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
