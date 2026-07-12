'use client';

import { Toaster as SonnerToaster, type ToasterProps } from 'sonner';

import { cn } from '@/lib/utils';

/**
 * Single global toast surface. The `richColors` and custom `toastOptions`
 * keep the visual language aligned with the editorial design system — no
 * rounded pills, no glassmorphism.
 */
export function Toaster({ className, ...props }: ToasterProps) {
  return (
    <SonnerToaster
      position="top-right"
      offset={24}
      visibleToasts={4}
      closeButton
      duration={4500}
      className={cn('font-sans', className)}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:border group-[.toaster]:shadow-soft group-[.toaster]:rounded-none group-[.toaster]:px-4 group-[.toaster]:py-3',
          description: 'group-[.toast]:text-muted-foreground group-[.toast]:text-sm',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          error:
            'group-[.toast]:border-destructive/40 group-[.toast]:text-destructive group-[.toast]:bg-destructive/5',
          success: 'group-[.toast]:border-accent/50 group-[.toast]:text-accent group-[.toast]:bg-accent/5',
        },
      }}
      {...props}
    />
  );
}
