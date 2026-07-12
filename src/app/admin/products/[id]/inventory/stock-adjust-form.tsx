'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { InventoryMovementReason } from '@/types/database';
import type { ActionResult } from '@/lib/admin/actions/inventory';

const REASONS: Array<{ value: InventoryMovementReason; label: string; helper: string }> = [
  { value: 'restock', label: 'Restock', helper: 'Add new inventory arriving at the studio.' },
  { value: 'adjustment', label: 'Adjustment', helper: 'Reconcile a count difference (cycle count, damage, etc).' },
  { value: 'return', label: 'Customer return', helper: 'A returned piece is back in sellable condition.' },
  { value: 'sale', label: 'Manual sale', helper: 'For in-person or offline sales outside the cart.' },
  { value: 'release', label: 'Release reservation', helper: 'Release stock that was reserved against a cancelled cart.' },
  { value: 'reservation', label: 'Reserve stock', helper: 'Hold stock against an order without an order yet.' },
];

interface StockAdjustFormProps {
  variantId: string;
  initialStock: number;
  action: (input: {
    variantId: string;
    delta: number;
    reason: InventoryMovementReason;
    note?: string;
  }) => Promise<ActionResult<{ newStock: number }>>;
}

export function StockAdjustForm({ variantId, initialStock, action }: StockAdjustFormProps) {
  const router = useRouter();
  const [direction, setDirection] = React.useState<'in' | 'out'>('in');
  const [quantity, setQuantity] = React.useState('1');
  const [reason, setReason] = React.useState<InventoryMovementReason>('restock');
  const [note, setNote] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = Number.parseInt(quantity, 10);
    if (!Number.isFinite(q) || q === 0) {
      toast.error('Enter a non-zero quantity.');
      return;
    }
    const delta = direction === 'in' ? q : -q;
    setBusy(true);
    const result = await action({
      variantId,
      delta,
      reason,
      note: note.trim() || undefined,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? 'Could not adjust stock.');
      return;
    }
    toast.success(`Stock now ${result.data?.newStock ?? '?'}.`);
    setQuantity('1');
    setNote('');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div>
          <Label>Direction</Label>
          <div className="mt-1 grid grid-cols-2 gap-1">
            {(['in', 'out'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDirection(d)}
                className={cn(
                  'border px-3 py-2 text-eyebrow uppercase',
                  direction === d
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground',
                )}
              >
                {d === 'in' ? 'In' : 'Out'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="adjust-qty">Quantity</Label>
          <Input
            id="adjust-qty"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mt-1"
          />
          <p className="mt-1 text-[0.7rem] text-muted-foreground">
            Currently {initialStock} in stock
          </p>
        </div>
        <div>
          <Label htmlFor="adjust-reason">Reason</Label>
          <Select value={reason} onValueChange={(v) => setReason(v as InventoryMovementReason)}>
            <SelectTrigger id="adjust-reason" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REASONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-[0.7rem] text-muted-foreground">
            {REASONS.find((r) => r.value === reason)?.helper}
          </p>
        </div>
      </div>
      <div>
        <Label htmlFor="adjust-note">Note (optional)</Label>
        <Input
          id="adjust-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          placeholder="e.g. PO #2014 received, two damaged on inspection"
          className="mt-1"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {busy ? 'Recording…' : 'Record movement'}
        </Button>
      </div>
    </form>
  );
}
