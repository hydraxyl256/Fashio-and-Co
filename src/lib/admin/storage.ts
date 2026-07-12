import 'server-only';

import { randomUUID } from 'node:crypto';

import { createSupabaseServiceRoleClient } from '@/lib/supabase/admin';

/**
 * Storage helpers for admin image uploads.
 *
 * The four public image buckets (product, collection, campaign, avatars)
 * were created in 0008_storage.sql with RLS that allows staff/admin to
 * write. We use the service role client to bypass RLS *and* ensure that
 * the corresponding row in `product_images` is inserted with the right
 * `storage_path` in the same server action.
 *
 * `MAX_IMAGE_BYTES` is intentionally tighter than the bucket limit
 * (10 MB) so we can show a friendly error before the upload happens.
 */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

const EXT_FOR_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export type ImageBucket = 'product-images' | 'collection-images' | 'campaign-images';

export interface UploadImageInput {
  productId: string;
  bytes: Uint8Array;
  contentType: string;
  originalName: string;
  bucket?: ImageBucket;
}

export interface UploadImageResult {
  storagePath: string;
  bucket: ImageBucket;
  bytes: number;
  mime: string;
}

export class StorageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageValidationError';
  }
}

export function validateImage(input: { contentType: string; bytes: Uint8Array }): {
  contentType: string;
  ext: string;
} {
  if (!ALLOWED_MIMES.has(input.contentType)) {
    throw new StorageValidationError(
      `Unsupported image type (${input.contentType}). Use JPEG, PNG, WebP, or AVIF.`,
    );
  }
  if (input.bytes.byteLength === 0) {
    throw new StorageValidationError('The image is empty.');
  }
  if (input.bytes.byteLength > MAX_IMAGE_BYTES) {
    throw new StorageValidationError(
      `Image is too large (${formatBytes(input.bytes.byteLength)}). Maximum is ${formatBytes(MAX_IMAGE_BYTES)}.`,
    );
  }
  return { contentType: input.contentType, ext: EXT_FOR_MIME[input.contentType] ?? 'bin' };
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Upload an image to one of the public buckets and return the storage
 * path. The caller is responsible for inserting the matching
 * `product_images` / `homepage_sections.image_url` row in a separate
 * call (so the action that drives it can revalidate correctly).
 */
export async function uploadImage(input: UploadImageInput): Promise<UploadImageResult> {
  const { contentType, ext } = validateImage(input);
  const bucket: ImageBucket = input.bucket ?? 'product-images';
  const path = `${input.productId}/${randomUUID()}.${ext}`;

  const admin = await createSupabaseServiceRoleClient();
  const { error } = await admin.storage.from(bucket).upload(path, input.bytes, {
    contentType,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) {
    throw new StorageValidationError(`Upload failed: ${error.message}`);
  }

  return { storagePath: path, bucket, bytes: input.bytes.byteLength, mime: contentType };
}

export async function deleteImage(
  storagePath: string,
  bucket: ImageBucket = 'product-images',
): Promise<void> {
  const admin = await createSupabaseServiceRoleClient();
  const { error } = await admin.storage.from(bucket).remove([storagePath]);
  if (error) {
    throw new StorageValidationError(`Delete failed: ${error.message}`);
  }
}

/**
 * Build the public URL for an object in a public bucket. Mirrors the
 * storefront helper in `lib/queries/catalogue.ts` — kept here so admin
 * server contexts don't need to import the storefront module.
 */
export function publicImageUrl(storagePath: string, bucket: ImageBucket = 'product-images'): string {
  if (!storagePath) return '';
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath;
  }
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return '';
  const encoded = storagePath.split('/').map(encodeURIComponent).join('/');
  return `${base}/storage/v1/object/public/${bucket}/${encoded}`;
}
