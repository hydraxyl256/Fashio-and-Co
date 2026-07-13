import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Open Graph image — 1200×630, generated at build time.
 *
 * Editorial layout: brand wordmark centered, a single hairline rule
 * above the descriptor. The mark is rendered as a cream-on-cocoa
 * emblem by composing the monogram PNG onto a deep brand background
 * in the image response. We avoid rasterizing text so the result is
 * type-perfect on every browser.
 *
 * Note: next/og's `satori` only accepts TTF/OTF font data. We use the
 * system stack with careful fallbacks so the build doesn't depend on
 * bundling a custom font for OG.
 */

export const runtime = 'nodejs';
export const alt = 'Fashion & Co. — considered womenswear and jewelry, curated in Nairobi';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const MONOGRAM_PATH = path.join(process.cwd(), 'public', 'brand', 'monogram-512.png');

export default async function OpengraphImage() {
  const monogram = await readFile(MONOGRAM_PATH);
  const monogramSrc = `data:image/png;base64,${monogram.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(180deg, #1B130E 0%, #2A1D14 50%, #1B130E 100%)',
          color: '#F1EBE2',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        {/* Top hairline */}
        <div
          style={{
            width: 80,
            height: 1,
            background: 'rgba(241, 235, 226, 0.35)',
            marginBottom: 40,
            display: 'flex',
          }}
        />

        {/* Monogram */}
        <img
          src={monogramSrc}
          width={140}
          height={140}
          alt="Fashion & Co. monogram"
          style={{ objectFit: 'contain', marginBottom: 40 }}
        />

        {/* Wordmark */}
        <div
          style={{
            display: 'flex',
            fontSize: 56,
            letterSpacing: 8,
            fontWeight: 500,
            textTransform: 'uppercase',
            marginBottom: 18,
          }}
        >
          Fashion &amp; Co.
        </div>

        {/* Descriptor */}
        <div
          style={{
            display: 'flex',
            fontSize: 22,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: 'rgba(241, 235, 226, 0.65)',
          }}
        >
          Womenswear &middot; Jewelry
        </div>

        {/* Italic-feel tagline via letter-spacing */}
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            color: 'rgba(241, 235, 226, 0.75)',
            marginTop: 28,
            fontStyle: 'italic',
            letterSpacing: 0.5,
          }}
        >
          Curated in Nairobi, sent with care.
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 36,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 14,
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: 'rgba(241, 235, 226, 0.45)',
            }}
          >
            fashionandco.co.ke
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
