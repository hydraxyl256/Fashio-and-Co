'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Delete } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus after slight delay to allow transition
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#fef8fc]/90 backdrop-blur-md flex flex-col overflow-y-auto animate-in fade-in duration-300">
      <header className="sticky top-0 w-full z-[110] flex justify-between items-center px-6 md:px-20 py-6 bg-[#fef8fc]/60 backdrop-blur-md">
        <div className="font-playfair text-[32px] font-semibold tracking-tighter text-[#430562] uppercase">
          Fashion & Co
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-[#ece6eb] rounded-full transition-all duration-300 text-[#1d1b1e]"
          aria-label="Close search"
        >
          <X className="w-8 h-8" />
        </button>
      </header>

      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-20 py-16 flex-grow">
        {/* Search Input */}
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto mb-16 relative">
          <div className="relative group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 text-[#430562]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent border-b-2 border-[#cfc2d1] focus:border-[#430562] outline-none py-6 pl-12 pr-12 font-playfair text-[32px] font-semibold text-[#1d1b1e] placeholder:text-[#7e7480] transition-all duration-500"
              placeholder="Search for collections, jewelry, or styles..."
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-[#4d444f] hover:text-[#430562] transition-colors"
                aria-label="Clear search"
              >
                <Delete className="w-6 h-6" />
              </button>
            )}
          </div>
          <div className="mt-4 flex justify-between items-center text-[12px] font-montserrat text-[#4d444f] uppercase tracking-widest font-semibold">
            <p>Press <span className="border border-[#cfc2d1] px-1.5 py-0.5 rounded">ESC</span> to exit</p>
            {/* Realtime match count could go here if implemented */}
          </div>
        </form>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Suggestions (Left) */}
          <div className="lg:col-span-5 space-y-12">
            <section>
              <h3 className="font-montserrat text-[14px] font-semibold text-[#430562] uppercase tracking-widest mb-6">Recent Searches</h3>
              <div className="flex flex-wrap gap-3">
                {['Satin Gowns', 'Gold Necklaces', 'Linen Edit'].map((term) => (
                  <button
                    key={term}
                    onClick={() => { onClose(); router.push(`/search?q=${encodeURIComponent(term)}`); }}
                    className="px-4 py-2 bg-[#f8f2f6] border border-[#cfc2d1]/30 hover:border-[#430562] hover:text-[#430562] text-[#1d1b1e] transition-all rounded-lg font-montserrat text-[16px]"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="font-montserrat text-[14px] font-semibold text-[#430562] uppercase tracking-widest mb-6">Trending Categories</h3>
              <ul className="space-y-4 font-montserrat text-[18px] text-[#1d1b1e]">
                <li><Link href="/collections/category/womenswear" onClick={onClose} className="hover:text-[#430562] transition-colors flex items-center justify-between group">Womenswear <Search className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
                <li><Link href="/collections/category/jewelry" onClick={onClose} className="hover:text-[#430562] transition-colors flex items-center justify-between group">Fine Jewelry <Search className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
                <li><Link href="/collections/category/accessories" onClick={onClose} className="hover:text-[#430562] transition-colors flex items-center justify-between group">Accessories <Search className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" /></Link></li>
              </ul>
            </section>
          </div>

          {/* Editorial Visual (Right) */}
          <div className="lg:col-span-7 hidden lg:block">
            <div className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-xl shadow-[#430562]/10 group cursor-pointer" onClick={() => { onClose(); router.push('/collections/new'); }}>
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"
                alt="Editorial inspiration"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <h4 className="font-playfair text-[24px] text-white font-semibold mb-2">The New Standard</h4>
                <p className="font-montserrat text-[14px] text-white/90">Explore our latest arrivals</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
