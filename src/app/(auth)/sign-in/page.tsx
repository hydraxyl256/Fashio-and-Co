import Link from 'next/link';
import type { Metadata } from 'next';

import { StitchSignInForm } from './stitch-sign-in-form';
import { signInAction } from '@/app/(auth)/actions';

export const metadata: Metadata = {
  title: 'Sign In | FASHION & CO.',
  description: 'Sign in to access your FASHION & CO. account, your wishlist, and order history.',
};

export default function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col md:flex-row font-montserrat">
      {/* Left: Editorial Image Panel */}
      <div className="hidden md:block md:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-[#430562]/40" />
        <div className="absolute bottom-16 left-12 z-10 max-w-sm">
          <p className="font-montserrat text-[12px] uppercase tracking-[0.2em] text-white/60 mb-4">The Autumn Collection</p>
          <h2 className="font-playfair text-[56px] font-bold text-white leading-none mb-4">Timeless Grace.</h2>
          <div className="h-1 w-12 bg-[#c89b3c]" />
        </div>
      </div>

      {/* Right: Sign In Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 md:px-20 py-16 bg-[#fef8fc]">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10">
            <h1 className="font-playfair text-[40px] md:text-[48px] font-bold text-[#430562] mb-2">
              Welcome Back
            </h1>
            <p className="font-montserrat text-[16px] text-[#4d444f]">
              Access your exclusive boutique profile and curated collections.
            </p>
          </div>

          {/* Form */}
          <SignInFormServer searchParams={searchParams} />

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-[#cfc2d1]" />
            <span className="font-montserrat text-[12px] uppercase tracking-wider text-[#7e7480]">or</span>
            <div className="flex-1 h-px bg-[#cfc2d1]" />
          </div>

          {/* Sign up link */}
          <p className="text-center font-montserrat text-[14px] text-[#4d444f]">
            New to the house?{' '}
            <Link href="/sign-up" className="text-[#430562] font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

async function SignInFormServer({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <StitchSignInForm action={signInAction} next={next} />;
}
