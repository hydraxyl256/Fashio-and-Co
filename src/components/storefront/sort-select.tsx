'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SortSelectProps {
  sort: string;
  options: { label: string; value: string }[];
}

export function SortSelect({ sort, options }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.set('page', '1');
    router.push(`/collections/shop?${params.toString()}`);
  };

  return (
    <select
      aria-label="Sort products"
      value={sort}
      onChange={handleSortChange}
      className="hidden lg:block font-montserrat text-[14px] bg-transparent border border-[#cfc2d1] px-3 py-2 text-[#4d444f] focus:outline-none focus:border-[#430562] transition-colors"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
