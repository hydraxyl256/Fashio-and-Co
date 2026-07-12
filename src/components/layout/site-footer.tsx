import Link from 'next/link';

import { cn } from '@/lib/utils';

const FOOTER_COLUMNS = [
  {
    title: 'Explore',
    links: [
      { label: 'Shop All',        href: '/collections/shop' },
      { label: 'New Arrivals',    href: '/collections/new' },
      { label: 'The Jewelry Edit',href: '/collections/category/jewelry' },
      { label: 'Bespoke Services',href: '/about' },
    ],
  },
  {
    title: 'Customer Care',
    links: [
      { label: 'Shipping & Returns', href: '/delivery-returns' },
      { label: 'M-PESA Payments',    href: '/delivery-returns#mpesa' },
      { label: 'Contact Us',         href: '/contact' },
      { label: 'Sustainability',     href: '/about#sustainability' },
    ],
  },
  {
    title: 'Information',
    links: [
      { label: 'Privacy Policy',  href: '/privacy-terms' },
      { label: 'Terms of Service',href: '/privacy-terms#terms' },
      { label: 'Store Locator',   href: '/contact#locations' },
      { label: 'Wholesale',       href: '/contact#wholesale' },
    ],
  },
] as const;

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        'bg-[#e7e1e5] border-t border-[#cfc2d1]/30',
        'font-montserrat',
        className,
      )}
    >
      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-5 sm:px-10 lg:px-[80px] py-[64px] max-w-[1440px] mx-auto">
        {/* Brand column */}
        <div className="space-y-6">
          <h3 className="font-playfair text-[32px] font-semibold leading-[40px] text-[#430562]">
            FASHION &amp; CO.
          </h3>
          <p className="text-[16px] leading-[24px] text-[#4d444f]">
            Luxury Curated in Nairobi. Celebrating the spirit of the modern African woman through high-fashion and artisanal craft.
          </p>
          {/* Social icons */}
          <div className="flex gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Instagram"
              className="w-10 h-10 rounded-full border border-[#7e7480] flex items-center justify-center text-[#430562] hover:bg-[#430562] hover:text-white hover:border-[#430562] transition-all duration-300"
            >
              {/* Instagram icon (SVG inline) */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Twitter / X"
              className="w-10 h-10 rounded-full border border-[#7e7480] flex items-center justify-center text-[#430562] hover:bg-[#430562] hover:text-white hover:border-[#430562] transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Pinterest"
              className="w-10 h-10 rounded-full border border-[#7e7480] flex items-center justify-center text-[#430562] hover:bg-[#430562] hover:text-white hover:border-[#430562] transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Link columns */}
        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h4 className="font-montserrat text-[14px] font-semibold leading-[20px] uppercase tracking-[0.05em] text-[#1d1b1e] mb-6">
              {column.title}
            </h4>
            <ul className="space-y-4">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#4d444f] hover:text-[#430562] transition-colors duration-300 text-[16px] leading-[24px]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="px-5 sm:px-10 lg:px-[80px] py-8 border-t border-[#cfc2d1]/20 max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[16px] leading-[24px] text-[#4d444f]">
          © {new Date().getFullYear()} FASHION &amp; CO. All Rights Reserved. Powered by Nairobi Excellence.
        </p>
        {/* Payment method icons */}
        <div className="flex items-center gap-6">
          <span className="text-[#4d444f] text-sm uppercase tracking-widest font-montserrat">M-PESA</span>
          <span className="text-[#4d444f] text-sm uppercase tracking-widest font-montserrat">Visa</span>
          <span className="text-[#4d444f] text-sm uppercase tracking-widest font-montserrat">Mastercard</span>
        </div>
      </div>
    </footer>
  );
}
