import type { Metadata } from 'next';
import Link from 'next/link';
import { listProducts } from '@/lib/queries/catalogue';
import { Pagination } from '@/components/storefront/pagination';
import { ProductGrid } from '@/components/storefront/product-grid';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Search | FASHION & CO.',
  description: 'Search the Fashion & Co. edit.',
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

const PAGE_SIZE = 12;

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const query = (searchParams.q ?? '').trim();
  const page = Math.max(1, Number.parseInt(searchParams.page ?? '1', 10) || 1);

  const results = query
    ? await listProducts({ search: query, page, pageSize: PAGE_SIZE })
    : { items: [], total: 0, page: 1, pageSize: PAGE_SIZE, pageCount: 1, facets: { sizes: [], colors: [], priceRange: { min: 0, max: 0 } } };

  const hasResults = results.items.length > 0;

  if (query && !hasResults) {
    // Empty State
    return (
      <main className="min-h-[70vh] flex flex-col bg-[#fef8fc] selection:bg-[#f5d9ff] selection:text-[#430562]">
        <section className="flex flex-col items-center justify-center text-center py-24 px-6 md:px-20 bg-[#fef8fc]">
          <div className="max-w-3xl">
            <span className="font-montserrat text-[14px] font-semibold text-[#775a1a] uppercase tracking-[0.2em] mb-4 block">A Quiet Moment</span>
            <h1 className="font-playfair text-[48px] sm:text-[64px] font-bold text-[#430562] mb-8 leading-tight">We couldn't find matches for your search, but you might adore these.</h1>
            <p className="font-montserrat text-[18px] text-[#4d444f] mb-12 max-w-xl mx-auto">
              Luxury is about discovery. While your specific term is elusive today, our latest curations offer the same artisan soul and timeless elegance you seek.
            </p>
            <Link href="/collections/shop" className="bg-[#430562] text-white px-12 py-4 font-montserrat text-[14px] uppercase tracking-widest font-semibold hover:bg-[#3d174f] transition-all duration-300 shadow-xl shadow-[#430562]/20 inline-block">
              Return to Shop
            </Link>
          </div>
        </section>

        {/* Recommended Collections */}
        <section className="py-24 px-6 md:px-20 bg-[#f8f2f6]">
          <div className="flex justify-between items-end mb-16 max-w-[1440px] mx-auto">
            <h2 className="font-playfair text-[36px] font-bold text-[#430562]">Curated for You</h2>
            <Link href="/collections/new" className="font-montserrat text-[14px] font-semibold text-[#775a1a] border-b border-[#775a1a] pb-1 hover:text-[#430562] hover:border-[#430562] transition-colors">
              Explore All Editions
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-[1440px] mx-auto">
            {/* Large Featured Collection */}
            <Link href="/collections/category/womenswear" className="md:col-span-8 group cursor-pointer overflow-hidden relative h-[400px] md:h-[600px] rounded-xl shadow-xl shadow-[#430562]/10">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=1200&q=80")' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                <span className="font-montserrat text-[12px] text-white/90 uppercase tracking-[0.2em] font-semibold mb-2 block">Edition 01</span>
                <h3 className="font-playfair text-[32px] md:text-[48px] text-white font-bold leading-tight mb-4">Satin & Silhouette</h3>
                <p className="font-montserrat text-[14px] md:text-[16px] text-white/80 max-w-md hidden md:block">
                  Discover flowing pieces designed for the golden hours. An ode to movement and grace.
                </p>
                <div className="mt-8 flex items-center gap-4 text-white font-montserrat text-[14px] uppercase tracking-widest font-semibold group-hover:text-[#fdd589] transition-colors">
                  Shop the Edit <span aria-hidden>&rarr;</span>
                </div>
              </div>
            </Link>

            {/* Smaller Complementary Collection */}
            <Link href="/collections/category/jewelry" className="md:col-span-4 group cursor-pointer overflow-hidden relative h-[400px] md:h-[600px] rounded-xl shadow-xl shadow-[#430562]/10">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1599643478524-fb66f70d00f8?w=800&q=80")' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <span className="font-montserrat text-[12px] text-white/90 uppercase tracking-[0.2em] font-semibold mb-2 block">Accessories</span>
                <h3 className="font-playfair text-[24px] md:text-[32px] text-white font-bold leading-tight mb-8">The Gold Standard</h3>
                <div className="flex items-center gap-4 text-white font-montserrat text-[14px] uppercase tracking-widest font-semibold group-hover:text-[#fdd589] transition-colors">
                  Discover Jewelry <span aria-hidden>&rarr;</span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // Results State or default state (empty query from direct navigation)
  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-20 py-16 bg-[#fef8fc] min-h-screen">
      <header className="mb-16 border-b border-[#cfc2d1]/30 pb-8">
        <h1 className="font-playfair text-[36px] sm:text-[48px] text-[#430562] font-bold mb-2">
          {query ? `Showing results for "${query}"` : 'Search the edit'}
        </h1>
        {query && (
          <p className="font-montserrat text-[14px] text-[#4d444f] uppercase tracking-widest font-semibold">
            {results.total} {results.total === 1 ? 'Product' : 'Products'} Found
          </p>
        )}
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Simplified Sidebar for Aesthetics */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-8 hidden md:block">
          <div>
            <h3 className="font-montserrat text-[14px] font-semibold text-[#430562] uppercase mb-4 border-b border-[#cfc2d1]/30 pb-2">Category</h3>
            <ul className="space-y-3 font-montserrat text-[14px] text-[#4d444f]">
              <li><Link href="/collections/category/womenswear" className="hover:text-[#430562]">Womenswear</Link></li>
              <li><Link href="/collections/category/jewelry" className="hover:text-[#430562]">Fine Jewelry</Link></li>
              <li><Link href="/collections/category/accessories" className="hover:text-[#430562]">Accessories</Link></li>
            </ul>
          </div>
        </aside>

        <div className="flex-grow">
          {!query ? (
            <div className="py-24 text-center border border-[#cfc2d1]/30 bg-[#f8f2f6] rounded-xl shadow-xl shadow-[#430562]/5">
              <h2 className="font-playfair text-[32px] text-[#430562] font-semibold mb-4">What are you looking for?</h2>
              <p className="font-montserrat text-[16px] text-[#4d444f] mb-8">Try "linen dress", "brass cuff", or "ring".</p>
              <div className="flex flex-wrap justify-center gap-4 max-w-lg mx-auto">
                {['Linen', 'Brass cuff', 'Signet ring', 'Dress', 'Earrings'].map((term) => (
                  <Link
                    key={term}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="px-6 py-3 border border-[#cfc2d1] rounded-full font-montserrat text-[14px] font-semibold text-[#4d444f] hover:border-[#430562] hover:text-[#430562] transition-colors"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <>
              <ProductGrid products={results.items} />
              <div className="mt-16">
                <Pagination page={results.page} pageCount={results.pageCount} />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
