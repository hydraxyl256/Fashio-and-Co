'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans text-sm font-medium tracking-wide transition-all duration-250 ease-elegant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Editorial primary: deep cocoa, squared-off silhouette.
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 border border-primary',
        // Quiet secondary: outlined in cocoa, useful for "Continue shopping" etc.
        outline:
          'border border-primary/80 bg-transparent text-primary hover:bg-primary hover:text-primary-foreground',
        // Ghost for tertiary actions inside dense UI.
        ghost: 'bg-transparent text-foreground hover:bg-muted',
        // Brass-tinted destructive — rare, used only for irreversible actions.
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-destructive',
        // Underlined link-style button for inline calls to action in copy.
        link: 'text-foreground underline-offset-4 hover:underline px-0 h-auto',
        // Premium inverse used on dark editorial sections.
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border',
      },
      size: {
        default: 'h-11 px-6 uppercase text-[0.72rem] tracking-[0.18em]',
        sm: 'h-9 px-4 uppercase text-[0.65rem] tracking-[0.16em]',
        lg: 'h-12 px-8 uppercase text-[0.75rem] tracking-[0.2em]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
