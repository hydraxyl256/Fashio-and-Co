'use client';

import * as React from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';

import { cn } from '@/lib/utils';
import { publicImageUrl } from '@/lib/queries/catalogue-types';

export interface GalleryImage {
  storagePath: string;
  altText: string | null;
  bucket?: 'product-images' | 'collection-images' | 'campaign-images';
}

interface ProductGalleryProps {
  images: GalleryImage[];
  productName: string;
}

/**
 * Stitch-spec asymmetric product gallery.
 * Desktop: 2-col grid — hero (col-span-2, aspect-[4/5]) + thumbnails (aspect-square below).
 * Mobile: vertical stack.
 * Clicking any image opens a fullscreen lightbox.
 */
export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [active, setActive] = React.useState(0);
  const [zoomOpen, setZoomOpen] = React.useState(false);
  const reduced = useReducedMotion();

  // Touch swipe
  const touchStartX = React.useRef<number | null>(null);
  const next = () => setActive((i) => Math.min(images.length - 1, i + 1));
  const prev = () => setActive((i) => Math.max(0, i - 1));

  if (images.length === 0) {
    return <div className="aspect-[4/5] w-full bg-[#f2ecf0]" aria-label={`${productName} image`} />;
  }

  const [hero, ...thumbs] = images;
  const activeImage = images[active]!;
  const getUrl = (img: GalleryImage) => publicImageUrl(img.storagePath, img.bucket ?? 'product-images');

  return (
    <>
      {/* Stitch: 2-col grid — hero spans full width top, thumbs below side-by-side */}
      <div
        className="grid grid-cols-2 gap-4"
        onTouchStart={(e) => (touchStartX.current = e.touches[0]?.clientX ?? null)}
        onTouchEnd={(e) => {
          if (touchStartX.current == null) return;
          const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
          if (Math.abs(dx) > 40) { if (dx < 0) next(); else prev(); }
          touchStartX.current = null;
        }}
      >
        {/* Hero image — col-span-2, aspect-[4/5] */}
        <div
          onClick={() => { setActive(0); setZoomOpen(true); }}
          aria-label={`View ${productName} main image — click to zoom`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActive(0);
              setZoomOpen(true);
            }
          }}
          className="col-span-2 relative overflow-hidden aspect-[4/5] bg-[#f2ecf0] group cursor-zoom-in"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={`hero-${active}`}
              src={getUrl(activeImage)}
              alt={activeImage.altText ?? productName}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              loading="eager"
              fetchPriority="high"
              decoding="sync"
            />
          </AnimatePresence>

          {/* Zoom hint */}
          <div className="absolute top-4 right-4 bg-white/80 p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <ZoomIn className="h-4 w-4 text-[#430562]" aria-hidden />
          </div>

          {/* Mobile dots */}
          {images.length > 1 && (
            <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5 md:hidden">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setActive(i); }}
                  aria-label={`Go to image ${i + 1}`}
                  className={cn('h-1.5 rounded-full transition-all', i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/50')}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail images — side by side, aspect-square */}
        {images.slice(1, 3).map((img, i) => {
          const idx = i + 1;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => { setActive(idx); setZoomOpen(true); }}
              aria-label={`View image ${idx + 1} — click to zoom`}
              className={cn(
                'relative overflow-hidden aspect-square bg-[#f2ecf0] group cursor-zoom-in',
                'ring-0 hover:ring-2 hover:ring-[#430562] hover:ring-offset-2 transition-all',
                active === idx && 'ring-2 ring-[#430562] ring-offset-2',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getUrl(img)}
                alt={img.altText ?? `${productName} — image ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
            </button>
          );
        })}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {zoomOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d1b1e]/90 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Image zoom"
            onClick={() => setZoomOpen(false)}
          >
            <button
              type="button"
              className="absolute right-4 top-4 text-white/80 hover:text-white"
              onClick={(e) => { e.stopPropagation(); setZoomOpen(false); }}
              aria-label="Close zoom"
            >
              <X className="h-6 w-6" aria-hidden />
            </button>
            <div className="relative h-[85vh] w-full max-w-3xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getUrl(activeImage)}
                alt={activeImage.altText ?? productName}
                className="h-full w-full object-contain"
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
