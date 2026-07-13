import Image from 'next/image';

/**
 * Refined loading experience.
 *
 * Renders a quiet, full-bleed monogram centered on the brand cream
 * field. A single, slow opacity fade signals "working" without
 * pulling the eye — luxury brands don't spin.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6 bg-background"
    >
      <div
        className="brand-mark-fade"
        style={{ width: '72px', height: '72px', position: 'relative' }}
      >
        <Image
          src="/brand/monogram-512.png"
          alt=""
          aria-hidden
          fill
          sizes="72px"
          priority
          className="object-contain"
        />
      </div>
      <p className="font-montserrat text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
        Fashion &amp; Co.
      </p>
    </div>
  );
}
