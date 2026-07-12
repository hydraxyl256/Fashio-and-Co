'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

interface ImageUploadFieldProps {
  /** Server action that accepts `{ productId, bytesBase64, contentType, originalName, altText? }` and returns `{ ok, data?: { id, storagePath } } | { ok: false, error }`. */
  action: (input: {
    productId: string;
    bytesBase64: string;
    contentType: string;
    altText?: string;
    isCover?: boolean;
    originalName: string;
  }) => Promise<{ ok: true; data?: { id: string; storagePath: string } } | { ok: false; error: string }>;
  productId: string;
  /** Whether to also upload the image as the cover. */
  markAsCover?: boolean;
  /** Called when the upload succeeds. */
  onUploaded?: (input: { id: string; storagePath: string }) => void;
  /** Optional class for the wrapper. */
  className?: string;
  /** Optional accepted MIME types override. */
  accept?: string;
}

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Unexpected reader result.'));
        return;
      }
      // result is "data:<mime>;base64,<payload>" — strip the prefix.
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Editorial image upload field. Validates type + size client-side
 * (defense in depth — the server also validates) and shows a small
 * preview of the chosen file before submitting.
 */
export function ImageUploadField({
  action,
  productId,
  markAsCover = false,
  onUploaded,
  className,
  accept = 'image/jpeg,image/png,image/webp,image/avif',
}: ImageUploadFieldProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [altText, setAltText] = React.useState('');
  const [isCover, setIsCover] = React.useState(markAsCover);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0] ?? null;
    if (!next) {
      setFile(null);
      return;
    }
    if (!ALLOWED_MIMES.includes(next.type)) {
      toast.error('Unsupported image type. Use JPEG, PNG, WebP, or AVIF.');
      return;
    }
    if (next.size > MAX_BYTES) {
      toast.error('Image is larger than 5 MB. Compress and try again.');
      return;
    }
    setFile(next);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    try {
      const bytesBase64 = await readAsBase64(file);
      const result = await action({
        productId,
        bytesBase64,
        contentType: file.type,
        originalName: file.name,
        altText: altText || undefined,
        isCover: isCover || undefined,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success('Image uploaded.');
      setFile(null);
      setAltText('');
      setIsCover(false);
      onUploaded?.(result.data ?? { id: '', storagePath: '' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed.';
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn('space-y-3 border border-dashed border-border bg-muted/30 p-4', className)}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="h-24 w-24 shrink-0 overflow-hidden border border-border bg-muted">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Upload className="h-6 w-6" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <Label htmlFor="image-file">Choose an image</Label>
            <Input
              id="image-file"
              type="file"
              accept={accept}
              onChange={onPick}
              className="mt-1 h-10 cursor-pointer file:mr-3 file:border-0 file:bg-foreground file:px-3 file:py-1 file:text-background"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              JPEG, PNG, WebP, or AVIF — up to 5 MB. Recommend 1600×2000 px @ 72 dpi for product shots.
            </p>
          </div>
          <div>
            <Label htmlFor="image-alt">Alt text (recommended)</Label>
            <Input
              id="image-alt"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="What is the product doing in the shot?"
              className="mt-1"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isCover}
              onChange={(e) => setIsCover(e.target.checked)}
              className="h-4 w-4 border border-foreground/60"
            />
            <span>Use as the cover image</span>
          </label>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        {file ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setFile(null)}
            disabled={busy}
          >
            <X className="h-4 w-4" /> Clear
          </Button>
        ) : null}
        <Button type="submit" size="sm" disabled={!file || busy}>
          {busy ? 'Uploading…' : 'Upload image'}
        </Button>
      </div>
    </form>
  );
}
