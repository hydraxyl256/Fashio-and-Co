'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, Star, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { publicImageUrl } from '@/lib/queries/catalogue-types';
import { cn } from '@/lib/utils';

export interface AdminGalleryImage {
  id: string;
  storagePath: string;
  altText: string | null;
  isCover: boolean;
  displayOrder: number;
}

interface ImageGalleryManagerProps {
  productId: string;
  initialImages: AdminGalleryImage[];
  deleteAction: (input: { imageId: string }) => Promise<{ ok: boolean; error?: string }>;
  reorderAction: (input: { productId: string; orderedIds: string[] }) => Promise<{ ok: boolean; error?: string }>;
  setCoverAction: (input: { imageId: string }) => Promise<{ ok: boolean; error?: string }>;
  updateAltAction: (input: { imageId: string; altText: string }) => Promise<{ ok: boolean; error?: string }>;
  bucket?: 'product-images' | 'collection-images' | 'campaign-images';
}

/**
 * Server-managed list of images with inline edit (alt text), reorder
 * (up/down buttons — no extra drag-dep), cover toggle, and delete.
 */
export function ImageGalleryManager({
  productId,
  initialImages,
  deleteAction,
  reorderAction,
  setCoverAction,
  updateAltAction,
  bucket = 'product-images',
}: ImageGalleryManagerProps) {
  const [images, setImages] = React.useState(initialImages);
  const [pendingDelete, setPendingDelete] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  async function commitOrder(next: AdminGalleryImage[]) {
    setBusy(true);
    const result = await reorderAction({ productId, orderedIds: next.map((i) => i.id) });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? 'Could not save the new order.');
      return;
    }
    setImages(next);
    toast.success('Image order saved.');
  }

  function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= images.length) return;
    const next = images.slice();
    const [item] = next.splice(idx, 1);
    if (!item) return;
    next.splice(j, 0, item);
    commitOrder(next.map((i, k) => ({ ...i, displayOrder: k })));
  }

  async function onDelete() {
    if (!pendingDelete) return;
    setBusy(true);
    const result = await deleteAction({ imageId: pendingDelete });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? 'Could not delete the image.');
      return;
    }
    setImages((prev) => prev.filter((i) => i.id !== pendingDelete));
    toast.success('Image removed.');
    setPendingDelete(null);
  }

  async function onSetCover(imageId: string) {
    setBusy(true);
    const result = await setCoverAction({ imageId });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? 'Could not update the cover image.');
      return;
    }
    setImages((prev) => prev.map((i) => ({ ...i, isCover: i.id === imageId })));
    toast.success('Cover image updated.');
  }

  async function onAltBlur(imageId: string, altText: string) {
    setBusy(true);
    const result = await updateAltAction({ imageId, altText });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? 'Could not save alt text.');
      return;
    }
    setImages((prev) => prev.map((i) => (i.id === imageId ? { ...i, altText } : i)));
  }

  if (images.length === 0) {
    return (
      <div className="border border-dashed border-border bg-muted/30 px-6 py-10 text-center text-sm text-muted-foreground">
        No images yet. Upload one above to get started.
      </div>
    );
  }

  return (
    <div>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, idx) => (
          <li
            key={image.id}
            className={cn(
              'border border-border bg-card p-3',
              image.isCover && 'ring-1 ring-accent',
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publicImageUrl(image.storagePath, bucket)}
              alt={image.altText ?? ''}
              className="aspect-[4/5] w-full bg-muted object-cover"
            />
            <div className="mt-3 space-y-2">
              <Input
                defaultValue={image.altText ?? ''}
                placeholder="Alt text"
                onBlur={(e) => {
                  if (e.target.value !== (image.altText ?? '')) {
                    onAltBlur(image.id, e.target.value);
                  }
                }}
                className="h-9 text-xs"
                disabled={busy}
              />
              <div className="flex flex-wrap items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0 || busy}
                  aria-label="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => move(idx, 1)}
                  disabled={idx === images.length - 1 || busy}
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onSetCover(image.id)}
                  disabled={image.isCover || busy}
                  aria-label="Make cover"
                  className={image.isCover ? 'text-accent' : ''}
                >
                  <Star className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setPendingDelete(image.id)}
                  disabled={busy}
                  aria-label="Delete image"
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remove this image?"
        description="The image will be deleted from the bucket and the product gallery. This cannot be undone."
        confirmLabel="Delete image"
        destructive
        loading={busy}
        onConfirm={onDelete}
      />
    </div>
  );
}
