'use client';

import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface VariantFormValue {
  id?: string;
  sku: string;
  size: string | null;
  color: string | null;
  material: string | null;
  metal: string | null;
  gemstone: string | null;
  ring_size: string | null;
  chain_length_cm: number | null;
  stock_quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
  price_override_cents: number | null;
  compare_at_price_cents: number | null;
  weight_grams: number | null;
  is_active: boolean;
  position: number;
}

interface VariantFormProps {
  value: VariantFormValue[];
  onChange: (next: VariantFormValue[]) => void;
  /** Called to generate a default SKU for new variants. */
  suggestSku: () => string;
  className?: string;
}

function empty(sku: string, position: number): VariantFormValue {
  return {
    sku,
    size: null,
    color: null,
    material: null,
    metal: null,
    gemstone: null,
    ring_size: null,
    chain_length_cm: null,
    stock_quantity: 0,
    reserved_quantity: 0,
    low_stock_threshold: 3,
    price_override_cents: null,
    compare_at_price_cents: null,
    weight_grams: null,
    is_active: true,
    position,
  };
}

function toNumberOrNull(v: string): number | null {
  if (v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toIntOrZero(v: string): number {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export function VariantForm({ value, onChange, suggestSku, className }: VariantFormProps) {
  function update(idx: number, patch: Partial<VariantFormValue>) {
    const next = value.slice();
    const current = next[idx];
    if (!current) return;
    next[idx] = { ...current, ...patch };
    onChange(next);
  }

  function remove(idx: number) {
    const next = value.slice();
    next.splice(idx, 1);
    onChange(next);
  }

  function add() {
    onChange([...value, empty(suggestSku(), value.length)]);
  }

  return (
    <div className={cn('space-y-4', className)}>
      {value.length === 0 ? (
        <div className="border border-dashed border-border bg-muted/30 px-6 py-8 text-center text-sm text-muted-foreground">
          No variants yet. Add at least one so the product can be sold.
        </div>
      ) : null}
      {value.map((variant, idx) => (
        <div key={variant.id ?? idx} className="border border-border bg-card p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <div className="col-span-1 sm:col-span-2">
              <Label htmlFor={`v-sku-${idx}`}>SKU</Label>
              <Input
                id={`v-sku-${idx}`}
                value={variant.sku}
                onChange={(e) => update(idx, { sku: e.target.value })}
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <Label htmlFor={`v-stock-${idx}`}>Stock</Label>
              <Input
                id={`v-stock-${idx}`}
                type="number"
                min={0}
                value={variant.stock_quantity}
                onChange={(e) => update(idx, { stock_quantity: toIntOrZero(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`v-threshold-${idx}`}>Low-stock at</Label>
              <Input
                id={`v-threshold-${idx}`}
                type="number"
                min={0}
                value={variant.low_stock_threshold}
                onChange={(e) => update(idx, { low_stock_threshold: toIntOrZero(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`v-size-${idx}`}>Size</Label>
              <Input
                id={`v-size-${idx}`}
                value={variant.size ?? ''}
                onChange={(e) => update(idx, { size: e.target.value || null })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`v-color-${idx}`}>Color</Label>
              <Input
                id={`v-color-${idx}`}
                value={variant.color ?? ''}
                onChange={(e) => update(idx, { color: e.target.value || null })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`v-material-${idx}`}>Material</Label>
              <Input
                id={`v-material-${idx}`}
                value={variant.material ?? ''}
                onChange={(e) => update(idx, { material: e.target.value || null })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`v-metal-${idx}`}>Metal</Label>
              <Input
                id={`v-metal-${idx}`}
                value={variant.metal ?? ''}
                onChange={(e) => update(idx, { metal: e.target.value || null })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`v-gem-${idx}`}>Gemstone</Label>
              <Input
                id={`v-gem-${idx}`}
                value={variant.gemstone ?? ''}
                onChange={(e) => update(idx, { gemstone: e.target.value || null })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`v-ring-${idx}`}>Ring size</Label>
              <Input
                id={`v-ring-${idx}`}
                value={variant.ring_size ?? ''}
                onChange={(e) => update(idx, { ring_size: e.target.value || null })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`v-chain-${idx}`}>Chain length (cm)</Label>
              <Input
                id={`v-chain-${idx}`}
                type="number"
                step="0.1"
                min={0}
                value={variant.chain_length_cm ?? ''}
                onChange={(e) => update(idx, { chain_length_cm: toNumberOrNull(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`v-price-${idx}`}>Price override (cents)</Label>
              <Input
                id={`v-price-${idx}`}
                type="number"
                min={0}
                value={variant.price_override_cents ?? ''}
                onChange={(e) => update(idx, { price_override_cents: toNumberOrNull(e.target.value) })}
                className="mt-1"
                placeholder="(inherits from product)"
              />
            </div>
            <div>
              <Label htmlFor={`v-weight-${idx}`}>Weight (g)</Label>
              <Input
                id={`v-weight-${idx}`}
                type="number"
                min={0}
                value={variant.weight_grams ?? ''}
                onChange={(e) => update(idx, { weight_grams: toNumberOrNull(e.target.value) })}
                className="mt-1"
              />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={variant.is_active}
                onChange={(e) => update(idx, { is_active: e.target.checked })}
                className="h-4 w-4 border border-foreground/60"
              />
              <span>Active for sale</span>
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(idx)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="h-4 w-4" /> Add variant
      </Button>
    </div>
  );
}
