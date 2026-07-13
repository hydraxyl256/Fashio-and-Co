import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

/**
 * Fashion & Co. brand logo.
 *
 * Three visual variants:
 *  - mark     — trimmed, transparent background. The everyday monogram.
 *  - lockup   — full lockup with the cream field intact. Marketing / footer.
 *  - monogram — square brand-tinted chip. Favicon, OG, dense icon uses.
 *
 * Sized by height only via `className` (`h-7`, `h-8`, `h-10`, …). The
 * intrinsic width/height we hand to `next/image` reflects the asset's
 * native aspect ratio, and we let the image's CSS `height: 100%; width:
 * auto` style govern the rendered size. This is the most predictable
 * pattern: the consumer's `h-*` utility directly drives the rendered
 * height, and width follows from the asset's aspect ratio.
 *
 * No `fill` mode here: `fill` is anchored to the nearest `position:
 * relative` ancestor, which inside a sticky header can be the whole
 * header — that's the bug we just fixed. The width/height mode keeps
 * the image tightly bound to its own element.
 */

type Variant = 'mark' | 'lockup';

const ASPECT = 480 / 476; // trimmed mark width / height

const SRC_BY_VARIANT: Record<Variant, string> = {
  mark: '/brand/logo-mark-1219.webp',
  lockup: '/brand/logo-lockup-1219.webp',
};
const MONOGRAM_SRC = '/brand/monogram-512.png';

interface BaseProps {
  variant?: Variant;
  monogram?: boolean;
  /** Tailwind sizing utility — typically `h-7`, `h-8`, `h-10`, `h-12`, etc. */
  className?: string;
  /** Empty alt when true (decorative duplication only). */
  decorative?: boolean;
  /** Preload the image — only the header brand mark should set this. */
  priority?: boolean;
  /** Override Next/Image `sizes`. */
  sizes?: string;
}

interface LinkProps extends BaseProps {
  href: string;
  label: string;
}

interface BareProps extends BaseProps {
  href?: undefined;
  label?: undefined;
}

export type BrandLogoProps = LinkProps | BareProps;

const DEFAULT_SIZES = '(max-width: 640px) 96px, (max-width: 1024px) 128px, 144px';
const DEFAULT_LOCKUP_SIZES = '(max-width: 640px) 96px, 144px';
const DEFAULT_MONOGRAM_SIZES = '40px';

export function BrandLogo(props: BrandLogoProps) {
  const {
    variant = 'mark',
    monogram = false,
    className = 'h-9',
    decorative = false,
    priority = false,
    sizes,
  } = props;

  const aspect = monogram ? 1 : ASPECT;
  const src = monogram ? MONOGRAM_SRC : SRC_BY_VARIANT[variant];

  const alt = decorative
    ? ''
    : monogram
      ? 'Fashion & Co. monogram'
      : variant === 'lockup'
        ? 'Fashion & Co. — womenswear and jewelry, curated in Nairobi'
        : 'Fashion & Co. — home';

  const resolvedSizes =
    sizes ?? (monogram ? DEFAULT_MONOGRAM_SIZES : variant === 'lockup' ? DEFAULT_LOCKUP_SIZES : DEFAULT_SIZES);

  // Intrinsic width/height. The actual rendered size is governed by
  // the consumer's `h-*` class on the wrapping element — the image's
  // `style.height: 100%; width: auto` shrinks it to fit the height
  // and keeps the aspect ratio.
  const intrinsicW = monogram ? 512 : 480;
  const intrinsicH = Math.round(intrinsicW / aspect);

  // The image element itself: height fills the wrapper, width auto
  // preserves aspect ratio. `block` removes the inline-image baseline
  // gap that would otherwise push the surrounding line box taller.
  const image = (
    <Image
      src={src}
      alt={alt}
      width={intrinsicW}
      height={intrinsicH}
      sizes={resolvedSizes}
      priority={priority}
      style={{ height: '100%', width: 'auto' }}
      className="block select-none"
    />
  );

  if (props.href) {
    return (
      <Link
        href={props.href}
        aria-label={props.label}
        className={cn(
          // The link itself owns the consumer's sizing class. The image
          // inside is height-100% so it fills the link exactly.
          'inline-flex shrink-0 items-center outline-none',
          'focus-visible:ring-2 focus-visible:ring-[#430562] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'transition-opacity duration-300 hover:opacity-90',
          className,
        )}
      >
        {image}
      </Link>
    );
  }
  return (
    <div className={cn('inline-flex shrink-0 items-center', className)}>
      {image}
    </div>
  );
}
