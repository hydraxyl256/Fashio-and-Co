'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/admin/status-badge';
import { allowedTransitions, statusLabel } from '@/lib/admin/state-machine';
import type { OrderStatus } from '@/types/database';
import type { ActionResult } from '@/lib/admin/actions/orders';

interface StatusUpdaterProps {
  orderId: string;
  current: OrderStatus;
  updateAction: (input: { orderId: string; toStatus: OrderStatus; note?: string }) => Promise<ActionResult>;
}

export function StatusUpdater({ orderId, current, updateAction }: StatusUpdaterProps) {
  const router = useRouter();
  const allowed = allowedTransitions(current);
  const [next, setNext] = React.useState<OrderStatus | ''>('');
  const [note, setNote] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  if (allowed.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
        This order is in a terminal state and cannot transition further.
      </p>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!next) {
      toast.error('Choose a new status.');
      return;
    }
    setBusy(true);
    const result = await updateAction({
      orderId,
      toStatus: next as OrderStatus,
      note: note.trim() || undefined,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? 'Could not update the status.');
      return;
    }
    toast.success('Status updated.');
    setNext('');
    setNote('');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">From</span>
        <StatusBadge variant={current}>{statusLabel(current)}</StatusBadge>
        <span className="text-muted-foreground">→</span>
        <span className="text-muted-foreground">to</span>
      </div>
      <div>
        <Label htmlFor="status-select">New status</Label>
        <Select value={next} onValueChange={(v) => setNext(v as OrderStatus)}>
          <SelectTrigger id="status-select" className="mt-1">
            <SelectValue placeholder="Choose a status…" />
          </SelectTrigger>
          <SelectContent>
            {allowed.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="status-note">Note (optional)</Label>
        <textarea
          id="status-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={1000}
          rows={3}
          className="mt-1 w-full border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="Why are you changing the status?"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={busy || !next} size="sm">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {busy ? 'Saving…' : 'Apply status change'}
        </Button>
      </div>
    </form>
  );
}
