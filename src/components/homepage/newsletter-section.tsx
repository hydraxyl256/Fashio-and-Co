'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

// Stitch section 12: Newsletter — centered, border-bottom email input + purple Subscribe button

interface NewsletterSectionProps {
  title?: string;
  body?: string;
}

export function NewsletterSection({
  title = 'Join the Inner Circle',
  body = 'Sign up for early access to new collections and exclusive invitations to our Nairobi showroom events.',
}: NewsletterSectionProps) {
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
    await new Promise((r) => setTimeout(r, 500));
    setSubmitting(false);
    setDone(true);
    toast.success('Thank you. Please check your inbox.');
  };

  return (
    <section
      className="py-[64px] bg-[#f8f2f6] stitch-container-mobile text-center"
      aria-label="Newsletter signup"
    >
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Title — Stitch: headline-md, uppercase, tracking-tight */}
        <h2 className="font-playfair text-[32px] font-semibold leading-[40px] uppercase tracking-tight text-[#1d1b1e]">
          {title}
        </h2>

        {/* Body */}
        <p className="font-montserrat text-[16px] leading-[24px] text-[#4d444f]">
          {body}
        </p>

        {done ? (
          <div className="flex items-center justify-center gap-3 pt-4 text-[#430562] font-montserrat text-[14px] font-semibold uppercase tracking-[0.05em]">
            ✓ You are on the list.
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="flex flex-col md:flex-row gap-4 mt-8"
            aria-label="Subscribe to newsletter"
          >
            {/* Email input — Stitch: bg-transparent, border-b-2 */}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email Address"
              aria-label="Email address"
              className="flex-1 bg-transparent border-b-2 border-[#cfc2d1] py-3 px-2 font-montserrat text-[16px] leading-[24px] text-[#1d1b1e] placeholder:text-[#4d444f]/60 focus:outline-none focus:border-[#430562] transition-colors duration-300"
            />

            {/* Subscribe button */}
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#430562] text-white px-8 py-4 font-montserrat text-[14px] font-semibold uppercase tracking-[0.12em] hover:bg-[#3d174f] disabled:opacity-60 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#430562] focus-visible:ring-offset-2"
            >
              {submitting ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
