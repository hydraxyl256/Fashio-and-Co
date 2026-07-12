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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ActionResult } from '@/lib/admin/actions/discounts';
import type { DiscountAppliesTo, DiscountKind } from '@/types/database';

interface DiscountFormProps {
  discountId?: string;
  initialValues?: {
    code: string;
    description: string | null;
    kind: DiscountKind;
    appliesTo: DiscountAppliesTo;
    value: number;
    minSubtotalCents: number | null;
    maxRedemptions: number | null;
    startsAt: string | null;
    endsAt: string | null;
    isActive: boolean;
  };
  saveAction: (input: {
    id?: string;
    code: string;
    description?: string | null;
    kind: DiscountKind;
    applies_to: DiscountAppliesTo;
    value: number;
    min_subtotal_cents?: number | null;
    max_redemptions?: number | null;
    starts_at?: string | null;
    ends_at?: string | null;
    is_active?: boolean;
  }) => Promise<ActionResult<{ id: string }>>;
}

function toDateTimeInput(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toISOString().slice(0, 16);
  } catch {
    return '';
  }
}

export function DiscountForm({ discountId, initialValues, saveAction }: DiscountFormProps) {
  const router = useRouter();
  const [code, setCode] = React.useState(initialValues?.code ?? '');
  const [description, setDescription] = React.useState(initialValues?.description ?? '');
  const [kind, setKind] = React.useState<DiscountKind>(initialValues?.kind ?? 'percentage');
  const [appliesTo, setAppliesTo] = React.useState<DiscountAppliesTo>(
    initialValues?.appliesTo ?? 'order',
  );
  const [valueDisplay, setValueDisplay] = React.useState(() => {
    if (!initialValues) return '';
    if (initialValues.kind === 'percentage') {
      return (initialValues.value / 100).toString();
    }
    return (initialValues.value / 100).toString();
  });
  const [minSubtotal, setMinSubtotal] = React.useState(() =>
    initialValues?.minSubtotalCents != null ? (initialValues.minSubtotalCents / 100).toString() : '',
  );
  const [maxRedemptions, setMaxRedemptions] = React.useState(
    initialValues?.maxRedemptions != null ? initialValues.maxRedemptions.toString() : '',
  );
  const [startsAt, setStartsAt] = React.useState<string | null>(initialValues?.startsAt ?? null);
  const [endsAt, setEndsAt] = React.useState<string | null>(initialValues?.endsAt ?? null);
  const [isActive, setIsActive] = React.useState(initialValues?.isActive ?? true);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 2) {
      setError('Code must be at least 2 characters.');
      return;
    }
    const numericValue = Number(valueDisplay);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      setError('Discount value must be a positive number.');
      return;
    }
    let valueCents: number;
    if (kind === 'percentage') {
      if (numericValue > 100) {
        setError('Percentage value cannot exceed 100%.');
        return;
      }
      valueCents = Math.round(numericValue * 100);
    } else {
      valueCents = Math.round(numericValue * 100);
    }
    const minSubtotalCents = minSubtotal.trim() ? Math.round(Number(minSubtotal) * 100) : null;
    if (minSubtotalCents != null && (!Number.isFinite(minSubtotalCents) || minSubtotalCents < 0)) {
      setError('Minimum subtotal must be a non-negative number.');
      return;
    }
    const maxR = maxRedemptions.trim() ? Number.parseInt(maxRedemptions, 10) : null;
    if (maxR != null && (!Number.isFinite(maxR) || maxR < 1)) {
      setError('Max redemptions must be a positive whole number.');
      return;
    }
    if (startsAt && endsAt && new Date(startsAt) >= new Date(endsAt)) {
      setError('End date must be after the start date.');
      return;
    }
    setBusy(true);
    const result = await saveAction({
      id: discountId,
      code: trimmed,
      description: description || null,
      kind,
      applies_to: appliesTo,
      value: valueCents,
      min_subtotal_cents: minSubtotalCents,
      max_redemptions: maxR,
      starts_at: startsAt,
      ends_at: endsAt,
      is_active: isActive,
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? 'Could not save the discount.');
      toast.error(result.error ?? 'Could not save the discount.');
      return;
    }
    toast.success(discountId ? 'Discount updated.' : 'Discount created.');
    if (result.data?.id && result.data.id !== discountId) {
      router.push(`/admin/discounts/${result.data.id}`);
    } else {
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Code & value</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="d-code">Code</Label>
              <Input
                id="d-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="mt-1 font-mono uppercase"
                required
                maxLength={32}
                placeholder="WELCOME10"
              />
              <p className="mt-1 text-[0.7rem] text-muted-foreground">
                Customers type this at checkout. Codes are uppercased automatically.
              </p>
            </div>
            <div>
              <Label htmlFor="d-kind">Kind</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as DiscountKind)}>
                <SelectTrigger id="d-kind" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage off</SelectItem>
                  <SelectItem value="fixed_amount">Fixed amount off (KES)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="d-value">{kind === 'percentage' ? 'Percent' : 'Amount (KES)'}</Label>
              <Input
                id="d-value"
                type="number"
                min={0}
                step={kind === 'percentage' ? '0.01' : '0.01'}
                value={valueDisplay}
                onChange={(e) => setValueDisplay(e.target.value)}
                className="mt-1"
                required
              />
              <p className="mt-1 text-[0.7rem] text-muted-foreground">
                {kind === 'percentage'
                  ? 'Between 0.01 and 100. Stored as basis points (e.g. 10% = 1000).'
                  : 'Amount in KES. Stored as integer cents.'}
              </p>
            </div>
            <div>
              <Label htmlFor="d-applies">Applies to</Label>
              <Select value={appliesTo} onValueChange={(v) => setAppliesTo(v as DiscountAppliesTo)}>
                <SelectTrigger id="d-applies" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order">Entire order</SelectItem>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="product">Specific products</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="d-min">Min subtotal (KES)</Label>
              <Input
                id="d-min"
                type="number"
                min={0}
                step="0.01"
                value={minSubtotal}
                onChange={(e) => setMinSubtotal(e.target.value)}
                className="mt-1"
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="d-desc">Internal description</Label>
            <Textarea
              id="d-desc"
              value={description ?? ''}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              rows={2}
              maxLength={200}
              placeholder="Optional — shown only in the admin"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="d-start">Starts at</Label>
              <Input
                id="d-start"
                type="datetime-local"
                value={toDateTimeInput(startsAt)}
                onChange={(e) => setStartsAt(e.target.value ? new Date(e.target.value).toISOString() : null)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="d-end">Ends at</Label>
              <Input
                id="d-end"
                type="datetime-local"
                value={toDateTimeInput(endsAt)}
                onChange={(e) => setEndsAt(e.target.value ? new Date(e.target.value).toISOString() : null)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="d-max">Max redemptions</Label>
              <Input
                id="d-max"
                type="number"
                min={1}
                value={maxRedemptions}
                onChange={(e) => setMaxRedemptions(e.target.value)}
                className="mt-1"
                placeholder="Unlimited"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 border border-foreground/60"
            />
            <span>Active — customers can apply this code</span>
          </label>
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
          {busy ? 'Saving…' : discountId ? 'Save changes' : 'Create discount'}
        </Button>
      </div>
    </form>
  );
}
