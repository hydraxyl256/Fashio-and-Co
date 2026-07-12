'use client';

import * as React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** When set, the user must type this exact string to enable the confirm button. */
  requireText?: string;
  /** Destructive buttons use the destructive variant. */
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
}

/**
 * Generic confirmation dialog. Use for destructive admin actions
 * (archive, delete). Optionally requires the user to type a
 * confirmation phrase to prevent fat-finger mistakes.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  requireText,
  destructive = false,
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [typed, setTyped] = React.useState('');
  const enabled = !loading && (!requireText || typed.trim() === requireText);

  React.useEffect(() => {
    if (!open) setTyped('');
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {requireText ? (
          <div className="space-y-2">
            <Label htmlFor="confirm-phrase">Type {requireText} to confirm</Label>
            <Input
              id="confirm-phrase"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              autoCapitalize="off"
            />
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            disabled={!enabled}
            onClick={onConfirm}
            className={cn(loading && 'opacity-60')}
          >
            {loading ? 'Working…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
