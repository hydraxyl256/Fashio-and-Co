'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SlugInput, VariantForm, type VariantFormValue, ImageUploadField, ImageGalleryManager } from '@/components/admin';
import { cn } from '@/lib/utils';
import type { ActionResult } from '@/lib/admin/actions/products';
import type { AdminGalleryImage } from '@/components/admin/image-gallery-manager';

interface ProductFormProps {
  productId?: string;
  initialValues?: {
    name: string;
    slug: string;
    shortDescription: string | null;
    fullDescription: string | null;
    categoryId: string | null;
    priceCents: number;
    compareAtPriceCents: number | null;
    currency: string;
    careInstructions: string | null;
    fitNotes: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    isFeatured: boolean;
    isActive: boolean;
    publishedAt: string | null;
  };
  categories: Array<{ id: string; name: string; slug: string }>;
  variants: VariantFormValue[];
  images: AdminGalleryImage[];
  saveAction: (input: {
    id?: string;
    name: string;
    slug?: string;
    short_description?: string | null;
    full_description?: string | null;
    category_id?: string | null;
    price_cents: number;
    compare_at_price_cents?: number | null;
    currency?: string;
    care_instructions?: string | null;
    fit_notes?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    is_featured?: boolean;
    is_active?: boolean;
    published_at?: string | null;
    variants: Array<Omit<VariantFormValue, 'sku'> & { sku: string }>;
  }) => Promise<ActionResult<{ id: string; slug: string }>>;
  uploadImageAction: (input: {
    productId: string;
    bytesBase64: string;
    contentType: string;
    altText?: string;
    isCover?: boolean;
    originalName: string;
  }) => Promise<ActionResult<{ id: string; storagePath: string }>>;
  deleteImageAction: (input: { imageId: string }) => Promise<ActionResult>;
  reorderImagesAction: (input: { productId: string; orderedIds: string[] }) => Promise<ActionResult>;
  setCoverAction: (input: { imageId: string }) => Promise<ActionResult>;
  updateAltAction: (input: { imageId: string; altText: string }) => Promise<ActionResult>;
  checkSlugAction: (input: { desired: string; ignoreId?: string }) => Promise<
    { ok: true; data?: { slug: string; available: boolean; suggestion?: string } } | { ok: false; error: string }
  >;
}

function nextSku(suggest: string, existing: string[]): string {
  if (!existing.includes(suggest)) return suggest;
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${suggest}-${n}`;
    if (!existing.includes(candidate)) return candidate;
  }
  return `${suggest}-${Date.now()}`;
}

function slugifyLocal(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function ProductForm(props: ProductFormProps) {
  const router = useRouter();
  const [name, setName] = React.useState(props.initialValues?.name ?? '');
  const [slug, setSlug] = React.useState(props.initialValues?.slug ?? '');
  const [short, setShort] = React.useState(props.initialValues?.shortDescription ?? '');
  const [full, setFull] = React.useState(props.initialValues?.fullDescription ?? '');
  const [categoryId, setCategoryId] = React.useState<string | null>(props.initialValues?.categoryId ?? null);
  const [price, setPrice] = React.useState(((props.initialValues?.priceCents ?? 0) / 100).toString());
  const [compare, setCompare] = React.useState(
    props.initialValues?.compareAtPriceCents != null ? (props.initialValues.compareAtPriceCents / 100).toString() : '',
  );
  const [currency, setCurrency] = React.useState(props.initialValues?.currency ?? 'KES');
  const [care, setCare] = React.useState(props.initialValues?.careInstructions ?? '');
  const [fit, setFit] = React.useState(props.initialValues?.fitNotes ?? '');
  const [metaTitle, setMetaTitle] = React.useState(props.initialValues?.metaTitle ?? '');
  const [metaDescription, setMetaDescription] = React.useState(props.initialValues?.metaDescription ?? '');
  const [isFeatured, setIsFeatured] = React.useState(props.initialValues?.isFeatured ?? false);
  const [isActive, setIsActive] = React.useState(props.initialValues?.isActive ?? true);
  const [publishedAt, setPublishedAt] = React.useState<string | null>(
    props.initialValues?.publishedAt ?? null,
  );
  const [variants, setVariants] = React.useState<VariantFormValue[]>(props.variants);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const proposedSlug = React.useMemo(
    () => (slug ? slugifyLocal(slug) : slugifyLocal(name)),
    [slug, name],
  );

  function suggestSku(): string {
    const base = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 8) || 'var';
    return nextSku(`${base}-001`, variants.map((v) => v.sku));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const priceCents = Math.round(Number(price) * 100);
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      setError('Price must be a non-negative number.');
      setBusy(false);
      return;
    }
    const compareAt = compare.trim() ? Math.round(Number(compare) * 100) : null;
    if (compareAt != null && (!Number.isFinite(compareAt) || compareAt < priceCents)) {
      setError('Compare-at price must be at least the price.');
      setBusy(false);
      return;
    }
    const result = await props.saveAction({
      id: props.productId,
      name,
      slug: slug || undefined,
      short_description: short || null,
      full_description: full || null,
      category_id: categoryId,
      price_cents: priceCents,
      compare_at_price_cents: compareAt,
      currency,
      care_instructions: care || null,
      fit_notes: fit || null,
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      is_featured: isFeatured,
      is_active: isActive,
      published_at: publishedAt,
      variants: variants.map((v) => ({
        ...v,
        sku: v.sku || suggestSku(),
      })),
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? 'Could not save the product.');
      toast.error(result.error ?? 'Could not save the product.');
      return;
    }
    toast.success(props.productId ? 'Product updated.' : 'Product created.');
    if (result.data?.id && result.data.id !== props.productId) {
      router.push(`/admin/products/${result.data.id}`);
    } else {
      router.refresh();
    }
  }

  async function onPublishToggle() {
    if (!props.productId) return;
    const next = !isActive;
    setBusy(true);
    const result = await props.saveAction({
      id: props.productId,
      name,
      slug: slug || undefined,
      short_description: short || null,
      full_description: full || null,
      category_id: categoryId,
      price_cents: Math.round(Number(price) * 100),
      compare_at_price_cents: compare.trim() ? Math.round(Number(compare) * 100) : null,
      currency,
      care_instructions: care || null,
      fit_notes: fit || null,
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      is_featured: isFeatured,
      is_active: next,
      published_at: next ? new Date().toISOString() : null,
      variants: variants.map((v) => ({ ...v, sku: v.sku })),
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? 'Could not update publish state.');
      return;
    }
    setIsActive(next);
    setPublishedAt(next ? new Date().toISOString() : null);
    toast.success(next ? 'Product published.' : 'Product unpublished.');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="p-name">Name</Label>
              <Input
                id="p-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="p-cat">Category</Label>
              <select
                id="p-cat"
                value={categoryId ?? ''}
                onChange={(e) => setCategoryId(e.target.value || null)}
                className="mt-1 h-11 w-full border border-input bg-background px-4 text-sm"
              >
                <option value="">Uncategorised</option>
                {props.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="p-price">Price ({currency})</Label>
              <Input
                id="p-price"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="p-compare">Compare-at ({currency})</Label>
              <Input
                id="p-compare"
                type="number"
                min={0}
                step="0.01"
                value={compare}
                onChange={(e) => setCompare(e.target.value)}
                className="mt-1"
                placeholder="Optional"
              />
            </div>
            <div>
              <Label htmlFor="p-currency">Currency</Label>
              <Input
                id="p-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase().slice(0, 3))}
                className="mt-1 uppercase"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="p-short">Short description</Label>
            <Textarea
              id="p-short"
              value={short ?? ''}
              onChange={(e) => setShort(e.target.value)}
              maxLength={500}
              className="mt-1"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="p-full">Full description</Label>
            <Textarea
              id="p-full"
              value={full ?? ''}
              onChange={(e) => setFull(e.target.value)}
              maxLength={8000}
              className="mt-1"
              rows={5}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="p-care">Care instructions</Label>
              <Textarea
                id="p-care"
                value={care ?? ''}
                onChange={(e) => setCare(e.target.value)}
                maxLength={2000}
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="p-fit">Fit notes</Label>
              <Textarea
                id="p-fit"
                value={fit ?? ''}
                onChange={(e) => setFit(e.target.value)}
                maxLength={2000}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          <div>
            <SlugInput
              value={slug}
              onChange={setSlug}
              checkAgainst={proposedSlug}
              ignoreId={props.productId}
              checkAction={props.checkSlugAction}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="p-meta-title">SEO title</Label>
              <Input
                id="p-meta-title"
                value={metaTitle ?? ''}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="mt-1"
                maxLength={200}
              />
            </div>
            <div>
              <Label htmlFor="p-meta-desc">SEO description</Label>
              <Input
                id="p-meta-desc"
                value={metaDescription ?? ''}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="mt-1"
                maxLength={500}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 border border-foreground/60"
              />
              <span>Featured on the homepage</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 border border-foreground/60"
              />
              <span>Active in the catalogue</span>
            </label>
          </div>

          {error ? (
            <p className="rounded border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <VariantForm
            value={variants}
            onChange={setVariants}
            suggestSku={suggestSku}
          />
        </CardContent>
      </Card>

      {props.productId ? (
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUploadField
              productId={props.productId}
              action={props.uploadImageAction}
            />
            <ImageGalleryManager
              productId={props.productId}
              initialImages={props.images}
              deleteAction={props.deleteImageAction}
              reorderAction={props.reorderImagesAction}
              setCoverAction={props.setCoverAction}
              updateAltAction={props.updateAltAction}
            />
          </CardContent>
        </Card>
      ) : (
        <p className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          Save the product once to start uploading images.
        </p>
      )}

      <div className={cn('flex flex-wrap items-center justify-between gap-2')}>
        {props.productId ? (
          <Button type="button" variant="outline" size="sm" onClick={onPublishToggle} disabled={busy}>
            {isActive ? 'Unpublish' : 'Publish'}
          </Button>
        ) : null}
        <div className="ml-auto flex items-center gap-2">
          <Button type="submit" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {busy ? 'Saving…' : props.productId ? 'Save changes' : 'Create product'}
          </Button>
        </div>
      </div>
    </form>
  );
}
