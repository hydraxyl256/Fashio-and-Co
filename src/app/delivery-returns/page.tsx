import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Delivery & Returns | FASHION & CO.',
  description: 'Information on our delivery options, timelines, and returns policy for FASHION & CO. orders.',
};

export default function DeliveryReturnsPage() {
  return (
    <div className="bg-[#fef8fc] font-montserrat text-[#1d1b1e] min-h-screen">
      {/* Hero */}
      <section className="bg-[#430562] text-white py-20 px-6 text-center">
        <p className="font-montserrat text-[12px] uppercase tracking-[0.15em] text-white/60 mb-4">Customer Care</p>
        <h1 className="font-playfair text-[40px] md:text-[56px] font-bold mb-4">Delivery & Returns</h1>
        <p className="text-[18px] text-white/80 max-w-xl mx-auto">
          Every piece, delivered with the care it deserves. And if it's not right, we'll make it so.
        </p>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-6 py-20 space-y-16">
        
        {/* Delivery Options */}
        <div>
          <h2 className="font-playfair text-[32px] font-semibold text-[#430562] mb-8 pb-4 border-b border-[#cfc2d1]/30">
            Delivery Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Same-Day White Glove',
                duration: 'Same Day',
                price: 'KES 800',
                detail: 'For orders placed before 11:00 AM within Nairobi. Your piece arrives in our signature luxury packaging, hand-delivered by our concierge team.',
                featured: true,
              },
              {
                title: 'Standard Delivery',
                duration: '1–2 Business Days',
                price: 'KES 350',
                detail: 'Reliable delivery across Nairobi and surrounding areas. Tracked end-to-end with SMS notifications.',
                featured: false,
              },
              {
                title: 'International',
                duration: '5–10 Business Days',
                price: 'From KES 3,500',
                detail: 'We ship to select East African countries and Europe. Rates and timelines calculated at checkout.',
                featured: false,
              },
            ].map((option) => (
              <div
                key={option.title}
                className={`p-8 border ${option.featured ? 'bg-[#430562] text-white border-[#430562]' : 'bg-white border-[#cfc2d1]/30'}`}
              >
                <p className={`font-montserrat text-[12px] uppercase tracking-wider mb-2 ${option.featured ? 'text-white/60' : 'text-[#7e7480]'}`}>
                  {option.duration}
                </p>
                <h3 className={`font-playfair text-[22px] font-semibold mb-2 ${option.featured ? 'text-white' : 'text-[#430562]'}`}>
                  {option.title}
                </h3>
                <p className={`font-montserrat text-[20px] font-bold mb-4 ${option.featured ? 'text-white' : 'text-[#1d1b1e]'}`}>
                  {option.price}
                </p>
                <p className={`text-[14px] leading-relaxed ${option.featured ? 'text-white/80' : 'text-[#4d444f]'}`}>
                  {option.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Returns Policy */}
        <div>
          <h2 className="font-playfair text-[32px] font-semibold text-[#430562] mb-8 pb-4 border-b border-[#cfc2d1]/30">
            Returns Policy
          </h2>
          <div className="space-y-6">
            {[
              {
                step: '01',
                title: '14-Day Return Window',
                desc: 'We accept returns within 14 days of delivery for unworn, undamaged items in their original packaging with all tags attached.',
              },
              {
                step: '02',
                title: 'Initiate Online',
                desc: 'Log into your account, navigate to Order History, and select the item you wish to return. You\'ll receive a confirmation within 24 hours.',
              },
              {
                step: '03',
                title: 'Complimentary Collection',
                desc: 'Our concierge team will arrange a complimentary collection from your address within Nairobi. International returns are at customer cost.',
              },
              {
                step: '04',
                title: 'Refund Processing',
                desc: 'Once received and inspected, refunds are processed within 3–5 business days to your original payment method.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 p-6 bg-white border border-[#cfc2d1]/30">
                <div className="shrink-0 w-10 h-10 bg-[#430562] text-white font-playfair text-[16px] font-bold flex items-center justify-center">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-montserrat text-[16px] font-semibold text-[#1d1b1e] mb-1">{item.title}</h4>
                  <p className="text-[14px] text-[#4d444f] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Non-returnable Items */}
        <div className="bg-[#f2ecf0] p-8 border border-[#cfc2d1]/30">
          <h3 className="font-playfair text-[24px] font-semibold text-[#430562] mb-4">Non-Returnable Items</h3>
          <p className="text-[14px] text-[#4d444f] mb-4">The following items cannot be returned or exchanged:</p>
          <ul className="space-y-2">
            {[
              'Bespoke and made-to-order pieces',
              'Items that have been worn, washed, or altered',
              'Earrings and intimate jewelry (for hygiene reasons)',
              'Items marked as final sale at checkout',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[14px] text-[#4d444f]">
                <span className="text-[#c89b3c] mt-1">—</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

      </section>

      {/* CTA */}
      <section className="bg-[#430562] py-16 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h3 className="font-playfair text-[32px] font-bold text-white mb-3">Questions about your order?</h3>
          <p className="text-white/80 text-[16px] mb-8">Our concierge team is available Mon–Sat, 9 AM – 6 PM (EAT).</p>
          <a
            href="/contact"
            className="inline-block bg-white text-[#430562] px-8 py-4 font-montserrat text-[14px] font-semibold uppercase tracking-wider hover:bg-[#f2ecf0] transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
