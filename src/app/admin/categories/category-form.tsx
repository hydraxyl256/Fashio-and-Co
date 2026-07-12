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
import { SlugInput } from '@/components/admin';
import type { ActionResult } from '@/lib/admin/actions/tree';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface CategoryFormProps {
  categoryId?: string;
  initialValues?: {
    name: string;
    slug: string;
    description: string | null;
    parentId: string | null;
    displayOrder: number;
    isActive: boolean;
  };
  candidates: CategoryOption[];
  saveAction: (input: {
    id?: string;
    name: string;
    slug?: string;
    description?: string | null;
    parent_id?: string | null;
    display_order?: number;
    is_active?: boolean;
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

export function CategoryForm({
  categoryId,
  initialValues,
  candidates,
  saveAction,
  checkSlugAction,
}: CategoryFormProps) {
  const router = useRouter();
  const [name, setName] = React.useState(initialValues?.name ?? '');
  const [slug, setSlug] = React.useState(initialValues?.slug ?? '');
  const [description, setDescription] = React.useState(initialValues?.description ?? '');
  const [parentId, setParentId] = React.useState<string | null>(initialValues?.parentId ?? null);
  const [displayOrder, setDisplayOrder] = React.useState(
    (initialValues?.displayOrder ?? 0).toString(),
  );
  const [isActive, setIsActive] = React.useState(initialValues?.isActive ?? true);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const proposedSlug = React.useMemo(
    () => (slug ? slugifyLocal(slug) : slugifyLocal(name)),
    [slug, name],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const order = Number.parseInt(displayOrder, 10);
    if (!Number.isFinite(order) || order < 0) {
      setError('Display order must be a non-negative number.');
      setBusy(false);
      return;
    }
    const result = await saveAction({
      id: categoryId,
      name,
      slug: slug || undefined,
      description: description || null,
      parent_id: parentId,
      display_order: order,
      is_active: isActive,
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? 'Could not save the category.');
      toast.error(result.error ?? 'Could not save the category.');
      return;
    }
    toast.success(categoryId ? 'Category updated.' : 'Category created.');
    if (result.data?.id && result.data.id !== categoryId) {
      router.push(`/admin/categories/${result.data.id}`);
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
              <Label htmlFor="c-name">Name</Label>
              <Input
                id="c-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="c-parent">Parent</Label>
              <select
                id="c-parent"
                value={parentId ?? ''}
                onChange={(e) => setParentId(e.target.value || null)}
                className="mt-1 h-11 w-full border border-input bg-background px-4 text-sm"
              >
                <option value="">Top-level</option>
                {candidates
                  .filter((c) => c.id !== categoryId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <SlugInput
              value={slug}
              onChange={setSlug}
              checkAgainst={proposedSlug}
              ignoreId={categoryId}
              checkAction={checkSlugAction}
            />
          </div>

          <div>
            <Label htmlFor="c-desc">Description</Label>
            <Textarea
              id="c-desc"
              value={description ?? ''}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="c-order">Display order</Label>
              <Input
                id="c-order"
                type="number"
                min={0}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                className="mt-1"
              />
              <p className="mt-1 text-[0.7rem] text-muted-foreground">
                Lower numbers show first in the storefront navigation.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm sm:mt-7">
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

      <div className="flex justify-end">
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {busy ? 'Saving…' : categoryId ? 'Save changes' : 'Create category'}
        </Button>
      </div>
    </form>
  );
}
