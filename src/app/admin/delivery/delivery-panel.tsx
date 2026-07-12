'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import {
  createDeliveryZoneAction,
  updateDeliveryZoneAction,
  deleteDeliveryZoneAction,
  createDeliveryRateAction,
  updateDeliveryRateAction,
  deleteDeliveryRateAction,
} from '@/lib/admin/actions/delivery';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';

interface ZoneSummary {
  id: string;
  name: string;
  country: string;
  region: string | null;
  isActive: boolean;
  sortOrder: number;
  rateCount: number;
  startingPriceCents: number | null;
  startingPriceCurrency: string;
}

interface RateRow {
  id: string;
  zone_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  free_threshold_cents: number | null;
  eta_min_days: number | null;
  eta_max_days: number | null;
  is_active: boolean;
  sort_order: number;
  currency: string;
}

interface DeliveryPanelProps {
  zones: ZoneSummary[];
  // Loaded on demand by an effect that fetches the rates for a zone.
  initialRates?: Record<string, RateRow[]>;
}

type Result = { ok: true; data?: { id: string } } | { ok: false; error: string };

export function DeliveryPanel({ zones: initialZones, initialRates = {} }: DeliveryPanelProps) {
  const router = useRouter();
  const [zones, setZones] = React.useState(initialZones);
  const [ratesByZone, setRatesByZone] = React.useState<Record<string, RateRow[]>>(initialRates);
  const [pendingDelete, setPendingDelete] = React.useState<{ kind: 'zone' | 'rate'; id: string } | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    setZones(initialZones);
  }, [initialZones]);

  async function onCreateZone(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    const result = (await createDeliveryZoneAction({
      name: String(form.get('name') ?? ''),
      country: String(form.get('country') ?? 'KE').toUpperCase(),
      region: (form.get('region') as string | null) || null,
      is_active: form.get('is_active') === 'on',
      sort_order: Number(form.get('sort_order') ?? 0),
    })) as Result;
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success('Zone created.');
    e.currentTarget.reset();
    router.refresh();
  }

  async function onCreateRate(e: React.FormEvent<HTMLFormElement>, zoneId: string) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    const priceCents = Math.round(Number(form.get('price_cents') ?? 0) * 100);
    const freeThreshold = form.get('free_threshold_cents')
      ? Math.round(Number(form.get('free_threshold_cents')) * 100)
      : null;
    const result = (await createDeliveryRateAction({
      zone_id: zoneId,
      name: String(form.get('name') ?? ''),
      description: (form.get('description') as string | null) || null,
      price_cents: priceCents,
      free_threshold_cents: freeThreshold,
      eta_min_days: form.get('eta_min_days') ? Number(form.get('eta_min_days')) : null,
      eta_max_days: form.get('eta_max_days') ? Number(form.get('eta_max_days')) : null,
      is_active: form.get('is_active') === 'on',
      sort_order: Number(form.get('sort_order') ?? 0),
    })) as Result;
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success('Rate added.');
    e.currentTarget.reset();
    router.refresh();
  }

  async function onToggleZoneActive(zone: ZoneSummary) {
    setBusy(true);
    const result = (await updateDeliveryZoneAction({
      id: zone.id,
      name: zone.name,
      country: zone.country,
      region: zone.region,
      is_active: !zone.isActive,
      sort_order: zone.sortOrder,
    })) as Result;
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(zone.isActive ? 'Zone archived.' : 'Zone restored.');
    setZones((prev) => prev.map((z) => (z.id === zone.id ? { ...z, isActive: !z.isActive } : z)));
    router.refresh();
  }

  async function onToggleRateActive(rate: RateRow) {
    setBusy(true);
    const result = (await updateDeliveryRateAction({
      id: rate.id,
      zone_id: rate.zone_id,
      name: rate.name,
      description: rate.description,
      price_cents: rate.price_cents,
      free_threshold_cents: rate.free_threshold_cents,
      eta_min_days: rate.eta_min_days,
      eta_max_days: rate.eta_max_days,
      is_active: !rate.is_active,
      sort_order: rate.sort_order,
    })) as Result;
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(rate.is_active ? 'Rate archived.' : 'Rate restored.');
    setRatesByZone((prev) => {
      const next = { ...prev };
      for (const [zoneId, list] of Object.entries(next)) {
        next[zoneId] = list.map((r) =>
          r.id === rate.id ? { ...r, is_active: !r.is_active } : r,
        );
      }
      return next;
    });
    router.refresh();
  }

  async function onDelete() {
    if (!pendingDelete) return;
    setBusy(true);
    const result = pendingDelete.kind === 'zone'
      ? ((await deleteDeliveryZoneAction(pendingDelete.id)) as Result)
      : ((await deleteDeliveryRateAction(pendingDelete.id)) as Result);
    setBusy(false);
    setPendingDelete(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(pendingDelete.kind === 'zone' ? 'Zone deleted.' : 'Rate deleted.');
    if (pendingDelete.kind === 'zone') {
      setZones((prev) => prev.filter((z) => z.id !== pendingDelete.id));
    } else {
      setRatesByZone((prev) => {
        const next = { ...prev };
        for (const [zoneId, list] of Object.entries(next)) {
          next[zoneId] = list.filter((r) => r.id !== pendingDelete.id);
        }
        return next;
      });
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add a delivery zone</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreateZone} className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            <div className="sm:col-span-2">
              <Label htmlFor="zone-name">Name</Label>
              <Input id="zone-name" name="name" required className="mt-1" placeholder="Nairobi" />
            </div>
            <div>
              <Label htmlFor="zone-country">Country</Label>
              <Input id="zone-country" name="country" defaultValue="KE" className="mt-1 uppercase" maxLength={3} />
            </div>
            <div>
              <Label htmlFor="zone-region">Region</Label>
              <Input id="zone-region" name="region" className="mt-1" placeholder="Optional" />
            </div>
            <div>
              <Label htmlFor="zone-sort">Sort</Label>
              <Input id="zone-sort" name="sort_order" type="number" min={0} defaultValue={0} className="mt-1" />
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked
                className="h-4 w-4 border border-foreground/60"
              />
              <span>Active</span>
            </label>
            <div className="sm:col-span-3 flex justify-end">
              <Button type="submit" size="sm" disabled={busy}>
                <Plus className="h-4 w-4" /> Add zone
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {zones.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
            No zones yet. Add one above to start defining rates.
          </p>
        ) : null}
        {zones.map((zone) => {
          const rates = ratesByZone[zone.id] ?? [];
          return (
            <Card key={zone.id} className={cn(!zone.isActive && 'opacity-70')}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>
                      {zone.name}{' '}
                      <span className="ml-2 text-xs font-mono text-muted-foreground">{zone.country}</span>
                      {zone.region ? <span className="ml-2 text-xs text-muted-foreground">· {zone.region}</span> : null}
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {zone.rateCount} {zone.rateCount === 1 ? 'rate' : 'rates'}
                      {zone.startingPriceCents != null
                        ? ` · from ${formatCurrency(zone.startingPriceCents, { currency: zone.startingPriceCurrency })}`
                        : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => onToggleZoneActive(zone)} disabled={busy}>
                      {zone.isActive ? 'Archive' : 'Restore'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => setPendingDelete({ kind: 'zone', id: zone.id })}
                      disabled={busy}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => router.refresh()}>
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="eyebrow text-muted-foreground">Rates</p>
                  {rates.length === 0 ? (
                    <p className="mt-2 text-xs text-muted-foreground">No rates yet — add one below.</p>
                  ) : (
                    <ul className="mt-2 divide-y divide-border border border-border">
                      {rates.map((rate) => (
                        <li key={rate.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                          <div>
                            <p className="font-medium">
                              {rate.name}
                              {!rate.is_active ? (
                                <span className="ml-2 text-xs text-muted-foreground">(archived)</span>
                              ) : null}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(rate.price_cents, { currency: rate.currency })}
                              {rate.free_threshold_cents != null
                                ? ` · free over ${formatCurrency(rate.free_threshold_cents, { currency: rate.currency })}`
                                : ''}
                              {rate.eta_min_days != null && rate.eta_max_days != null
                                ? ` · ${rate.eta_min_days}–${rate.eta_max_days} d`
                                : ''}
                            </p>
                            {rate.description ? (
                              <p className="text-xs text-muted-foreground">{rate.description}</p>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onToggleRateActive(rate)}
                              disabled={busy}
                            >
                              {rate.is_active ? 'Archive' : 'Restore'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => setPendingDelete({ kind: 'rate', id: rate.id })}
                              disabled={busy}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <form
                  onSubmit={(e) => onCreateRate(e, zone.id)}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-6"
                >
                  <div className="sm:col-span-2">
                    <Label htmlFor={`r-name-${zone.id}`}>Name</Label>
                    <Input id={`r-name-${zone.id}`} name="name" required className="mt-1" placeholder="Standard" />
                  </div>
                  <div>
                    <Label htmlFor={`r-price-${zone.id}`}>Price</Label>
                    <Input
                      id={`r-price-${zone.id}`}
                      name="price_cents"
                      type="number"
                      step="0.01"
                      min={0}
                      defaultValue={0}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`r-free-${zone.id}`}>Free over</Label>
                    <Input
                      id={`r-free-${zone.id}`}
                      name="free_threshold_cents"
                      type="number"
                      step="0.01"
                      min={0}
                      className="mt-1"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`r-eta-min-${zone.id}`}>ETA min (d)</Label>
                    <Input
                      id={`r-eta-min-${zone.id}`}
                      name="eta_min_days"
                      type="number"
                      min={0}
                      className="mt-1"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`r-eta-max-${zone.id}`}>ETA max (d)</Label>
                    <Input
                      id={`r-eta-max-${zone.id}`}
                      name="eta_max_days"
                      type="number"
                      min={0}
                      className="mt-1"
                      placeholder="0"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Label htmlFor={`r-desc-${zone.id}`}>Description</Label>
                    <Input id={`r-desc-${zone.id}`} name="description" className="mt-1" placeholder="Optional" />
                  </div>
                  <div>
                    <Label htmlFor={`r-sort-${zone.id}`}>Sort</Label>
                    <Input
                      id={`r-sort-${zone.id}`}
                      name="sort_order"
                      type="number"
                      min={0}
                      defaultValue={0}
                      className="mt-1"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="is_active"
                      defaultChecked
                      className="h-4 w-4 border border-foreground/60"
                    />
                    <span>Active</span>
                  </label>
                  <div className="sm:col-span-2 flex items-end justify-end">
                    <Button type="submit" size="sm" disabled={busy}>
                      <Plus className="h-4 w-4" /> Add rate
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={pendingDelete?.kind === 'zone' ? 'Delete this zone?' : 'Delete this rate?'}
        description={
          pendingDelete?.kind === 'zone'
            ? 'All rates inside this zone will be removed. Orders referencing them remain intact.'
            : 'The rate will be removed permanently. Orders that referenced it remain intact.'
        }
        confirmLabel="Delete"
        destructive
        loading={busy}
        onConfirm={onDelete}
      />
    </div>
  );
}
