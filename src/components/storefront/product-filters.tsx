'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

// --- Shared Constants ---

export const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export const COLORS = [
  { label: 'Black', value: 'black', hex: '#1d1b1e' },
  { label: 'Ivory', value: 'ivory', hex: '#fef8fc' },
  { label: 'Lavender', value: 'lavender', hex: '#e6b4ff' },
  { label: 'Gold', value: 'gold', hex: '#775a1a' },
  { label: 'Plum', value: 'plum', hex: '#3d174f' },
];

export const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low', value: 'price-asc' },
  { label: 'Price: High', value: 'price-desc' },
];

// --- Types ---

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface FilterContentProps {
  categories?: CategoryItem[];
  showCategory?: boolean;
}

// --- Shared Logic Hook ---

function useFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get('category');
  const activeSize = searchParams.get('size');
  const activeColor = searchParams.get('color');

  const setParam = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to page 1 on filter change
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('size');
    params.delete('color');
    params.delete('category');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return {
    activeCategory,
    activeSize,
    activeColor,
    setParam,
    clearAll,
  };
}

// --- Inner Filter Content (Used in both Sidebar and Sheet) ---

function FilterContent({ categories, showCategory = true }: FilterContentProps) {
  const { activeCategory, activeSize, activeColor, setParam, clearAll } = useFilters();
  const hasFilters = activeSize || activeColor || activeCategory;

  return (
    <div className="space-y-10">
      {/* Category */}
      {showCategory && categories && categories.length > 0 && (
        <div>
          <h3 className="font-montserrat text-[14px] font-semibold uppercase tracking-[0.1em] text-[#430562] mb-4">
            Category
          </h3>
          <ul className="space-y-3">
            <li>
              <button
                type="button"
                onClick={() => setParam('category', undefined)}
                className={`flex items-center gap-3 text-[16px] leading-[24px] hover:text-[#430562] transition-colors ${!activeCategory ? 'text-[#430562] font-semibold' : 'text-[#4d444f]'}`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${!activeCategory ? 'bg-[#430562]' : 'border border-[#7e7480]'}`} />
                All
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => setParam('category', cat.slug)}
                  className={`flex items-center gap-3 text-[16px] leading-[24px] hover:text-[#430562] transition-colors ${activeCategory === cat.slug ? 'text-[#430562] font-semibold' : 'text-[#4d444f]'}`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${activeCategory === cat.slug ? 'bg-[#430562]' : 'border border-[#7e7480]'}`} />
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Size */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-montserrat text-[14px] font-semibold uppercase tracking-[0.1em] text-[#430562]">
            Size
          </h3>
          {activeSize && (
            <button
              onClick={() => setParam('size', undefined)}
              className="text-[12px] font-montserrat text-[#7e7480] hover:text-[#430562] transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => {
            const isActive = activeSize === s;
            return (
              <button
                key={s}
                onClick={() => setParam('size', isActive ? undefined : s)}
                className={`w-10 h-10 flex items-center justify-center text-[12px] font-semibold font-montserrat border transition-all duration-200
                  ${isActive
                    ? 'bg-[#430562] text-white border-[#430562]'
                    : 'border-[#cfc2d1] text-[#4d444f] hover:border-[#430562] hover:text-[#430562]'
                  }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colour */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-montserrat text-[14px] font-semibold uppercase tracking-[0.1em] text-[#430562]">
            Colour
          </h3>
          {activeColor && (
            <button
              onClick={() => setParam('color', undefined)}
              className="text-[12px] font-montserrat text-[#7e7480] hover:text-[#430562] transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {COLORS.map((c) => {
            const isActive = activeColor === c.value;
            return (
              <button
                key={c.value}
                onClick={() => setParam('color', isActive ? undefined : c.value)}
                aria-label={c.label}
                className={`w-6 h-6 rounded-full border transition-all ${
                  isActive
                    ? 'ring-2 ring-[#430562] ring-offset-2'
                    : 'hover:ring-2 hover:ring-[#430562] hover:ring-offset-2'
                }`}
                style={{ backgroundColor: c.hex, borderColor: '#cfc2d1' }}
              />
            );
          })}
        </div>
      </div>

      {/* Clear All */}
      {hasFilters && (
        <div className="pt-4 border-t border-[#cfc2d1]">
          <button
            onClick={clearAll}
            className="w-full font-montserrat text-[12px] font-semibold uppercase tracking-[0.1em] text-[#430562] py-3 border border-[#430562] hover:bg-[#fef8fc] transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}

// --- Desktop Sidebar ---

export function FilterSidebar({ categories, showCategory = true }: FilterContentProps) {
  return (
    <aside className="w-60 flex-shrink-0 hidden lg:block">
      <div className="sticky top-24">
        <FilterContent categories={categories} showCategory={showCategory} />
      </div>
    </aside>
  );
}

// --- Mobile Sheet ---

export function FilterMobileSheet({ categories, showCategory = true }: FilterContentProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="lg:hidden flex items-center gap-2 font-montserrat text-[14px] font-semibold uppercase tracking-wider text-[#430562] border border-[#430562] px-4 py-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto border-r-[#cfc2d1] bg-[#fef8fc]">
        <SheetHeader className="mb-8">
          <SheetTitle className="font-playfair text-[24px] text-[#430562]">
            Filters
          </SheetTitle>
        </SheetHeader>
        <FilterContent categories={categories} showCategory={showCategory} />
      </SheetContent>
    </Sheet>
  );
}
