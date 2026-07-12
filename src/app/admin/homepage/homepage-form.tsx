'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import type { ActionResult } from '@/lib/admin/actions/homepage';
import type { HomepageSectionKind } from '@/types/database';

interface HomepageFormProps {
  sectionId?: string;
  initialValues?: {
    kind: HomepageSectionKind;
    slug: string;
    title: string | null;
    subtitle: string | null;
    body: string | null;
    imageUrl: string | null;
    ctaLabel: string | null;
    ctaHref: string | null;
    displayOrder: number;
    isActive: boolean;
    startsAt: string | null;
    endsAt: string | null;
  };
  uploadAction?: (input: {
    sectionId: string;
    bytesBase64: string;
    contentType: string;
    originalName: string;
  }) => Promise<ActionResult<{ imageUrl: string; storagePath: string }>>;
  saveAction: (input: {
    id?: string;
    kind: HomepageSectionKind;
    slug: string;
    title?: string | null;
    subtitle?: string | null;
    body?: string | null;
    image_url?: string | null;
    cta_label?: string | null;
    cta_href?: string | null;
    display_order?: number;
    is_active?: boolean;
    starts_at?: string | null;
    ends_at?: string | null;
  }) => Promise<ActionResult<{ id: string }>>;
}

const KINDS: Array<{ value: HomepageSectionKind; label: string; helper: string }> = [
  { value: 'hero', label: 'Hero', helper: 'Big opening banner with a single CTA.' },
  { value: 'category_grid', label: 'Category grid', helper: 'A row of category tiles.' },
  { value: 'collection_feature', label: 'Collection feature', helper: 'Editorial callout for a collection.' },
  { value: 'editorial', label: 'Editorial block', helper: 'Long-form copy + image.' },
  { value: 'product_grid', label: 'Product grid', helper: 'A grid of curated products.' },
];

function toDateInput(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toISOString().slice(0, 16);
  } catch {
    return '';
  }
}

export function HomepageForm({ sectionId, initialValues, uploadAction, saveAction }: HomepageFormProps) {
  const router = useRouter();
  const [kind, setKind] = React.useState<HomepageSectionKind>(initialValues?.kind ?? 'hero');
  const [slug, setSlug] = React.useState(initialValues?.slug ?? '');
  const [title, setTitle] = React.useState(initialValues?.title ?? '');
  const [subtitle, setSubtitle] = React.useState(initialValues?.subtitle ?? '');
  const [body, setBody] = React.useState(initialValues?.body ?? '');
  const [imageUrl, setImageUrl] = React.useState(initialValues?.imageUrl ?? '');
  const [ctaLabel, setCtaLabel] = React.useState(initialValues?.ctaLabel ?? '');
  const [ctaHref, setCtaHref] = React.useState(initialValues?.ctaHref ?? '');
  const [displayOrder, setDisplayOrder] = React.useState((initialValues?.displayOrder ?? 0).toString());
  const [isActive, setIsActive] = React.useState(initialValues?.isActive ?? true);
  const [startsAt, setStartsAt] = React.useState<string | null>(initialValues?.startsAt ?? null);
  const [endsAt, setEndsAt] = React.useState<string | null>(initialValues?.endsAt ?? null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!slug.trim()) {
      setError('Slug is required.');
      return;
    }
    if (startsAt && endsAt && new Date(startsAt) >= new Date(endsAt)) {
      setError('End date must be after the start date.');
      return;
    }
    setBusy(true);
    const result = await saveAction({
      id: sectionId,
      kind,
      slug: slug.trim().toLowerCase(),
      title: title || null,
      subtitle: subtitle || null,
      body: body || null,
      image_url: imageUrl || null,
      cta_label: ctaLabel || null,
      cta_href: ctaHref || null,
      display_order: Number.parseInt(displayOrder, 10) || 0,
      is_active: isActive,
      starts_at: startsAt,
      ends_at: endsAt,
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? 'Could not save the section.');
      toast.error(result.error ?? 'Could not save the section.');
      return;
    }
    toast.success(sectionId ? 'Section updated.' : 'Section created.');
    if (result.data?.id && result.data.id !== sectionId) {
      router.push(`/admin/homepage/${result.data.id}`);
    } else {
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="h-kind">Kind</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as HomepageSectionKind)}>
                <SelectTrigger id="h-kind" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KINDS.map((k) => (
                    <SelectItem key={k.value} value={k.value}>
                      {k.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-[0.7rem] text-muted-foreground">
                {KINDS.find((k) => k.value === kind)?.helper}
              </p>
            </div>
            <div>
              <Label htmlFor="h-slug">Slug</Label>
              <Input
                id="h-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="mt-1 font-mono"
                required
                maxLength={120}
              />
              <p className="mt-1 text-[0.7rem] text-muted-foreground">
                Used to address this section in URLs and lookups.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="h-title">Title</Label>
              <Input id="h-title" value={title ?? ''} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="h-sub">Subtitle</Label>
              <Input
                id="h-sub"
                value={subtitle ?? ''}
                onChange={(e) => setSubtitle(e.target.value)}
                className="mt-1"
                maxLength={300}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="h-body">Body copy</Label>
            <Textarea
              id="h-body"
              value={body ?? ''}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1"
              rows={4}
              maxLength={4000}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="h-cta-l">CTA label</Label>
              <Input
                id="h-cta-l"
                value={ctaLabel ?? ''}
                onChange={(e) => setCtaLabel(e.target.value)}
                className="mt-1"
                maxLength={60}
              />
            </div>
            <div>
              <Label htmlFor="h-cta-h">CTA href</Label>
              <Input
                id="h-cta-h"
                value={ctaHref ?? ''}
                onChange={(e) => setCtaHref(e.target.value)}
                className="mt-1"
                placeholder="https://… or /collections/…"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="h-img">Image URL</Label>
              <Input
                id="h-img"
                value={imageUrl ?? ''}
                onChange={(e) => setImageUrl(e.target.value)}
                className="mt-1"
                placeholder="https://…"
              />
            </div>
            <div>
              <Label htmlFor="h-order">Display order</Label>
              <Input
                id="h-order"
                type="number"
                min={0}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                className="mt-1"
              />
            </div>
            <label className="flex items-center gap-2 text-sm sm:mt-7">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 border border-foreground/60"
              />
              <span>Active</span>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="h-start">Starts at</Label>
              <Input
                id="h-start"
                type="datetime-local"
                value={toDateInput(startsAt)}
                onChange={(e) => setStartsAt(e.target.value ? new Date(e.target.value).toISOString() : null)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="h-end">Ends at</Label>
              <Input
                id="h-end"
                type="datetime-local"
                value={toDateInput(endsAt)}
                onChange={(e) => setEndsAt(e.target.value ? new Date(e.target.value).toISOString() : null)}
                className="mt-1"
              />
            </div>
          </div>

          {error ? (
            <p className="rounded border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {sectionId && uploadAction ? (
        <Card>
          <CardHeader>
            <CardTitle>Image</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploadField
              productId={sectionId}
              action={async (input) => {
                const res = await uploadAction({
                  sectionId: input.productId,
                  bytesBase64: input.bytesBase64,
                  contentType: input.contentType,
                  originalName: input.originalName,
                });
                if (res.ok && res.data?.imageUrl) {
                  setImageUrl(res.data.imageUrl);
                }
                return res.ok
                  ? { ok: true, data: { id: '', storagePath: res.data?.storagePath ?? '' } }
                  : { ok: false, error: res.error };
              }}
            />
            {imageUrl ? (
              <p className="mt-2 text-xs text-muted-foreground break-all">
                <span className="eyebrow text-muted-foreground">Current</span> <br />
                {imageUrl}
              </p>
            ) : null}
            <p className="mt-2 text-xs text-muted-foreground">
              <Upload className="inline h-3 w-3" /> Uploading replaces the image URL on this section.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {busy ? 'Saving…' : sectionId ? 'Save changes' : 'Create section'}
        </Button>
      </div>
    </form>
  );
}
