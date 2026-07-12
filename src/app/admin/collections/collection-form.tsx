'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, Loader2, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SlugInput } from '@/components/admin';
import { cn } from '@/lib/utils';
import type { ActionResult } from '@/lib/admin/actions/tree';

interface ProductOption {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface CollectionFormProps {
  collectionId?: string;
  initialValues?: {
    name: string;
    slug: string;
    subtitle: string | null;
    description: string | null;
    heroImageUrl: string | null;
    launchAt: string | null;
    endAt: string | null;
    isActive: boolean;
    isFeatured: boolean;
    productIds: string[];
  };
  products: ProductOption[];
  saveAction: (input: {
    id?: string;
    name: string;
    slug?: string;
    subtitle?: string | null;
    description?: string | null;
    hero_image_url?: string | null;
    launch_at?: string | null;
    end_at?: string | null;
    is_active?: boolean;
    is_featured?: boolean;
    product_ids: string[];
  }) => Promise<ActionResult<{ id: string; slug: string }>>;
  checkSlugAction: (input: { desired: string; ignoreId?: string }) => Promise<
    { ok: true; data?: { slug: string; available: boolean; suggestion?: string } } | { ok: false; error: string }
  >;
}

function slugifyLocal(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function toDateInputValue(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toISOString().slice(0, 16);
  } catch {
    return '';
  }
}

export function CollectionForm({
  collectionId,
  initialValues,
  products,
  saveAction,
  checkSlugAction,
}: CollectionFormProps) {
  const router = useRouter();
  const [name, setName] = React.useState(initialValues?.name ?? '');
  const [slug, setSlug] = React.useState(initialValues?.slug ?? '');
  const [subtitle, setSubtitle] = React.useState(initialValues?.subtitle ?? '');
  const [description, setDescription] = React.useState(initialValues?.description ?? '');
  const [heroImageUrl, setHeroImageUrl] = React.useState(initialValues?.heroImageUrl ?? '');
  const [launchAt, setLaunchAt] = React.useState<string | null>(initialValues?.launchAt ?? null);
  const [endAt, setEndAt] = React.useState<string | null>(initialValues?.endAt ?? null);
  const [isActive, setIsActive] = React.useState(initialValues?.isActive ?? true);
  const [isFeatured, setIsFeatured] = React.useState(initialValues?.isFeatured ?? false);
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState<string[]>(initialValues?.productIds ?? []);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const byId = React.useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const proposedSlug = React.useMemo(
    () => (slug ? slugifyLocal(slug) : slugifyLocal(name)),
    [slug, name],
  );

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => p.name.toLowerCase().includes(term) || p.slug.includes(term));
  }, [products, search]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function move(id: string, dir: -1 | 1) {
    setSelected((prev) => {
      const idx = prev.indexOf(id);
      if (idx < 0) return prev;
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = prev.slice();
      const [item] = next.splice(idx, 1);
      if (!item) return prev;
      next.splice(j, 0, item);
      return next;
    });
  }

  function remove(id: string) {
    setSelected((prev) => prev.filter((x) => x !== id));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (launchAt && endAt && new Date(launchAt) >= new Date(endAt)) {
      setError('End date must be after the launch date.');
      return;
    }
    setBusy(true);
    const result = await saveAction({
      id: collectionId,
      name,
      slug: slug || undefined,
      subtitle: subtitle || null,
      description: description || null,
      hero_image_url: heroImageUrl.trim() || null,
      launch_at: launchAt ? new Date(launchAt).toISOString() : null,
      end_at: endAt ? new Date(endAt).toISOString() : null,
      is_active: isActive,
      is_featured: isFeatured,
      product_ids: selected,
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? 'Could not save the collection.');
      toast.error(result.error ?? 'Could not save the collection.');
      return;
    }
    toast.success(collectionId ? 'Collection updated.' : 'Collection created.');
    if (result.data?.id && result.data.id !== collectionId) {
      router.push(`/admin/collections/${result.data.id}`);
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
              <Label htmlFor="col-name">Name</Label>
              <Input
                id="col-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="col-sub">Subtitle</Label>
              <Input
                id="col-sub"
                value={subtitle ?? ''}
                onChange={(e) => setSubtitle(e.target.value)}
                className="mt-1"
                maxLength={280}
                placeholder="Optional one-liner"
              />
            </div>
          </div>
          <div>
            <SlugInput
              value={slug}
              onChange={setSlug}
              checkAgainst={proposedSlug}
              ignoreId={collectionId}
              checkAction={checkSlugAction}
            />
          </div>
          <div>
            <Label htmlFor="col-desc">Description</Label>
            <Textarea
              id="col-desc"
              value={description ?? ''}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={4000}
              className="mt-1"
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="col-hero">Hero image URL</Label>
            <Input
              id="col-hero"
              value={heroImageUrl ?? ''}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              className="mt-1"
              placeholder="https://… or upload via the homepage editor"
            />
            <p className="mt-1 text-[0.7rem] text-muted-foreground">
              Paste a public URL, or use the homepage campaign editor for direct uploads.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="col-launch">Launch at</Label>
              <Input
                id="col-launch"
                type="datetime-local"
                value={toDateInputValue(launchAt)}
                onChange={(e) => setLaunchAt(e.target.value ? new Date(e.target.value).toISOString() : null)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="col-end">End at</Label>
              <Input
                id="col-end"
                type="datetime-local"
                value={toDateInputValue(endAt)}
                onChange={(e) => setEndAt(e.target.value ? new Date(e.target.value).toISOString() : null)}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 border border-foreground/60"
              />
              <span>Active on the storefront</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 border border-foreground/60"
              />
              <span>Featured on the homepage</span>
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
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <p className="eyebrow text-muted-foreground">Available</p>
              <div className="mt-2 flex items-center gap-2 border border-border bg-muted/30 px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products…"
                  className="h-8 border-0 bg-transparent px-0 focus-visible:ring-0"
                />
              </div>
              <ul className="mt-2 max-h-96 overflow-y-auto border border-border bg-card">
                {filtered.length === 0 ? (
                  <li className="p-3 text-xs text-muted-foreground">No products match.</li>
                ) : null}
                {filtered.map((p) => {
                  const isPicked = selected.includes(p.id);
                  return (
                    <li
                      key={p.id}
                      className={cn(
                        'flex items-center justify-between gap-2 border-b border-border px-3 py-2 text-sm last:border-0',
                        isPicked && 'bg-accent/10',
                      )}
                    >
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{p.slug}</p>
                      </div>
                      <Button
                        type="button"
                        variant={isPicked ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => toggle(p.id)}
                      >
                        {isPicked ? 'Remove' : 'Add'}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <p className="eyebrow text-muted-foreground">Selected order</p>
              <ol className="mt-2 max-h-96 overflow-y-auto border border-border bg-card">
                {selected.length === 0 ? (
                  <li className="p-3 text-xs text-muted-foreground">No products selected.</li>
                ) : null}
                {selected.map((id, idx) => {
                  const p = byId.get(id);
                  return (
                    <li
                      key={id}
                      className="flex items-center justify-between gap-2 border-b border-border px-3 py-2 text-sm last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-right text-xs text-muted-foreground">{idx + 1}.</span>
                        <div>
                          <p className="font-medium">{p?.name ?? 'Removed product'}</p>
                          <p className="font-mono text-xs text-muted-foreground">{p?.slug ?? id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => move(id, -1)}
                          disabled={idx === 0}
                          aria-label="Move up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => move(id, 1)}
                          disabled={idx === selected.length - 1}
                          aria-label="Move down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(id)}
                          className="text-destructive"
                        >
                          Remove
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {busy ? 'Saving…' : collectionId ? 'Save changes' : 'Create collection'}
        </Button>
      </div>
    </form>
  );
}
