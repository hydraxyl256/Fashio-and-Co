'use client';

import * as React from 'react';
import { Loader2, Check, AlertTriangle } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type AvailabilityState =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'available'; slug: string }
  | { kind: 'taken'; desired: string; suggestion: string };

interface SlugInputProps {
  value: string;
  onChange: (slug: string) => void;
  /** The proposed slug to validate — typically `slugify(name)`. */
  checkAgainst: string;
  ignoreId?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  /** Server action that returns `{ ok, data: { slug, available, suggestion? } }`. */
  checkAction: (input: { desired: string; ignoreId?: string }) => Promise<
    { ok: true; data?: { slug: string; available: boolean; suggestion?: string } } | { ok: false; error: string }
  >;
}

const DEBOUNCE_MS = 400;

export function SlugInput({
  value,
  onChange,
  checkAgainst,
  ignoreId,
  label = 'Slug',
  className,
  disabled,
  checkAction,
}: SlugInputProps) {
  const [state, setState] = React.useState<AvailabilityState>({ kind: 'idle' });

  React.useEffect(() => {
    if (!checkAgainst || checkAgainst.trim().length === 0) {
      setState({ kind: 'idle' });
      return;
    }
    let cancelled = false;
    setState({ kind: 'checking' });
    const handle = setTimeout(async () => {
      const result = await checkAction({ desired: checkAgainst, ignoreId });
      if (cancelled) return;
      if (!result.ok) {
        setState({ kind: 'idle' });
        return;
      }
      if (result.data?.available) {
        setState({ kind: 'available', slug: result.data.slug });
      } else {
        setState({
          kind: 'taken',
          desired: result.data?.slug ?? checkAgainst,
          suggestion: result.data?.suggestion ?? `${checkAgainst}-2`,
        });
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [checkAgainst, ignoreId, checkAction]);

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor="slug-input">{label}</Label>
      <Input
        id="slug-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="my-piece"
        disabled={disabled}
        className="font-mono"
      />
      <div className="text-xs">
        {state.kind === 'checking' ? (
          <span className="flex items-center gap-1 text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Checking availability…
          </span>
        ) : state.kind === 'available' ? (
          <span className="flex items-center gap-1 text-emerald-700">
            <Check className="h-3 w-3" /> Available
          </span>
        ) : state.kind === 'taken' ? (
          <span className="flex items-center gap-1 text-amber-700">
            <AlertTriangle className="h-3 w-3" />
            {state.desired} is taken. Use{' '}
            <button
              type="button"
              className="underline"
              onClick={() => onChange(state.suggestion)}
            >
              {state.suggestion}
            </button>
            .
          </span>
        ) : (
          <span className="text-muted-foreground">Lowercase letters, numbers, and dashes only.</span>
        )}
      </div>
    </div>
  );
}
