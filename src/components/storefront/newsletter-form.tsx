'use client';

import { useState, type FormEvent } from 'react';
import { Mail, Check } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface NewsletterFormProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export function NewsletterForm({ className, variant = 'light' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    // Simulated subscribe — wire to Resend audience via Server Action in a future milestone.
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubmitting(false);
    setDone(true);
    toast.success('Thank you. Please check your inbox.');
  };

  if (done) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 border-b py-3 text-sm',
          variant === 'dark' ? 'border-bone-50/30 text-bone-50' : 'border-foreground/30',
          className,
        )}
      >
        <Check className="h-4 w-4" aria-hidden /> Thank you. You are on the list.
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'flex max-w-md items-center gap-2 border-b pb-2',
        variant === 'dark' ? 'border-bone-50/30' : 'border-foreground/30',
        className,
      )}
    >
      <Mail
        className={cn('h-4 w-4', variant === 'dark' ? 'text-bone-50/70' : 'text-muted-foreground')}
        aria-hidden
      />
      <Input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        aria-label="Email address"
        className={cn(
          'border-0 bg-transparent px-0',
          variant === 'dark' ? 'placeholder:text-bone-50/60' : '',
        )}
      />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={submitting}
        className={cn(variant === 'dark' ? 'text-bone-50 hover:text-accent' : '')}
      >
        {submitting ? 'Subscribing…' : 'Subscribe'}
      </Button>
    </form>
  );
}
