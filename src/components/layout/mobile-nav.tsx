'use client';

import * as React from 'react';
import Link from 'next/link';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface NavLink {
  readonly label: string;
  readonly href: string;
}

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  links: ReadonlyArray<NavLink>;
}

export function MobileNav({ open, onOpenChange, links }: MobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full max-w-sm p-0">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="font-serif text-2xl tracking-[0.16em] uppercase">Fashion &amp; Co.</SheetTitle>
          <SheetDescription>Womenswear &amp; jewelry, made in Nairobi.</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile primary" className="flex flex-col">
          <ul className="flex flex-col">
            {links.map((link, index) => (
              <li
                key={link.href}
                className={cn(
                  'border-b border-border',
                  index === links.length - 1 && 'border-b-0',
                )}
              >
                <Link
                  href={link.href}
                  onClick={() => onOpenChange(false)}
                  className="block px-6 py-5 font-serif text-2xl tracking-tight text-foreground transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto border-t border-border px-6 py-6">
          <p className="eyebrow text-muted-foreground">Need assistance?</p>
          <Link
            href="mailto:atelier@fashionandco.co.ke"
            className="link-elegant mt-1 text-sm font-medium"
          >
            atelier@fashionandco.co.ke
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
