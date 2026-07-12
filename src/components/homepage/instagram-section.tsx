// Stitch section 13: Social / Instagram grid
// 5-col image strip at h-[300px], hover scale-110

interface InstagramItem {
  src: string;
  alt: string;
  href?: string;
}

interface InstagramSectionProps {
  items?: InstagramItem[];
}

const STITCH_PHOTOS: InstagramItem[] = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmX9GZRliWobPd06u28ODqFOobp8OU-VA2oeXgsy9zCMR5J8VMsZNCOgydugO2w2gUIXLa-jJxs4XIuh0N9xDNRJY9Wv6oswFL853ACV2xbF-4L7nYXFrbwicVmGzMNYL0sl3H3fRdHmJ4pz4BNYv7k_csG1v4_pP0SdWisU5HpJzCsedohOgIAha_U3xXAafufHUvAfG2bXGFxxYA21v-PtaK-9ANxOe-mnu6MvkZtRP-bD5ZJFMdOy_jmLIFlNuwvL0JDOjuIA',
    alt: 'Instagram style photo of a model walking in Nairobi with urban luxury fashion vibes.',
    href: 'https://instagram.com',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAP31rPLsHnC8Zkt9QEgklkXQmWzyDie0LxAuwq5MCdvH8tyoA2qQxDgWjBxGVEkvM4tPhs1Uxnoii3kWvddQi9NL8H09u7PWqx34cX_vNmeFQh97zyyPfE12uRJyzcZRwLzJ5pwjnYrLWe-zo6G86fiJd2iwvgIzZl-T86HRi4EVRQycgwiPQ1C6AN6T6ifasuHScHQ039jRF-6PoiklnIlam-VFoS6wEk0yvfksO-8DJQ_A4cXTHl0zVh6pj6KrhtRHag3yCLGA',
    alt: 'Close up of a luxury store interior with gold hangers and silk dresses.',
    href: 'https://instagram.com',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMyjgjgw69lsa1BWWVcf6wZ7aF2nhLPW6y7EvG-cLn3DFa0wrkCo8yhDoAO4qkWEuseOVgp8ZasSZwewf4t9jSrZR8CHXX8f0UqwuuOaZBg0lvbZI5aCIFq1mtP7tfueqkGCGBFS6aYO25KZrgAm5M-CXWvJAMsRwpwJmpQeflb7LvsCtY3odSdWeWWO_PkinywMoUYSqNRNIj_68cYT6GO-KSXXLlUAvwgkbRSKTiGpdgJ3WxGc_y8DLp03qbgd1kMGiOCGyf1Q',
    alt: 'A fashion influencer wearing a FASHION & CO. silk scarf as a top in a tropical garden.',
    href: 'https://instagram.com',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLbsbMiWM42Z0swnD1fLNIDInWmEQJRM9G-Q7H_hmFAKKVrtIrbP_yhp1W2uzlQ5KkrZsNT2qu6kYrkFrCyom2A-AVdV85YpjLQ5FCIw3iQU1efMAZdZBP5iD5nDrrXh465lhYFiX7Jys8GkbfuMC4cAtUvuy7ASPe54BLNBTsrZI7FyJFU6D2qku6-2PouC-NOxreKRWGroJBqCkVnKhcoxHea7C3m1JJh4P2jA6t2c_FvVjp4Va1wKfS2HxHzEhvzOOJ0EJy8w',
    alt: 'A flat lay of gold jewelry, a fashion magazine, and a glass of champagne on a marble table.',
    href: 'https://instagram.com',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7FsPwWTLCUA_Z2-gXBCEhxDJruGMfGjESC9a-ifdazBlZhf0vEPIx5e93Q_PgCPza97RDmb6vqLKSQfzf9njHS1OQ5sZFvDXt2bYBAkLeblGNXbz63B6KRNKFvO22WfyD1kvDdp4aQDUXavXBng6tLevLUxOixZP287y7IoUiOjkcfupvWLDvjtlcmJOV9WFGcv_EeCh52LvfegN0v0aeuTgKhrqUCjOmV53hHR4aDqrWNN6Lxwg1YEvxj_qYTJJviE8oM-AcFA',
    alt: 'Two models laughing together in a sun-lit studio wearing coordinated linen and silk outfits.',
    href: 'https://instagram.com',
  },
];

export function InstagramSection({ items = STITCH_PHOTOS }: InstagramSectionProps) {
  return (
    <section
      className="grid grid-cols-2 md:grid-cols-5 h-[300px]"
      aria-label="Instagram gallery"
    >
      {items.map((item, idx) => {
        const content = (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src}
              alt={item.alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              decoding="async"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-[#430562]/0 group-hover:bg-[#430562]/10 transition-colors duration-300" aria-hidden />
          </>
        );

        return item.href ? (
          <a
            key={idx}
            href={item.href}
            target="_blank"
            rel="noreferrer noopener"
            className="relative overflow-hidden group"
            aria-label={`View on Instagram — ${item.alt}`}
          >
            {content}
          </a>
        ) : (
          <div key={idx} className="relative overflow-hidden group">
            {content}
          </div>
        );
      })}
    </section>
  );
}
