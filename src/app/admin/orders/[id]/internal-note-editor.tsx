'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { ActionResult } from '@/lib/admin/actions/orders';

interface NoteEditorProps {
  orderId: string;
  initialNote: string | null;
  updateAction: (input: { orderId: string; internalNote?: string }) => Promise<ActionResult>;
}

export function InternalNoteEditor({ orderId, initialNote, updateAction }: NoteEditorProps) {
  const router = useRouter();
  const [note, setNote] = React.useState(initialNote ?? '');
  const [busy, setBusy] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const result = await updateAction({ orderId, internalNote: note || undefined });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error ?? 'Could not save the note.');
      return;
    }
    toast.success('Note saved.');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Label htmlFor="internal-note">Internal note (staff only)</Label>
      <textarea
        id="internal-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={2000}
        rows={3}
        className="w-full border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {busy ? 'Saving…' : 'Save note'}
        </Button>
      </div>
    </form>
  );
}
