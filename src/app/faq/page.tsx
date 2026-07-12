import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | FASHION & CO.',
  description: 'Find answers to common questions about shipping, returns, payments, and care for your FASHION & CO. pieces.',
};

const FAQ_CATEGORIES = [
  {
    id: 'orders',
    title: 'Orders & Delivery',
    questions: [
      {
        q: 'How long does delivery take?',
        a: 'We offer Same-Day White Glove delivery for orders placed before 11:00 AM within Nairobi. Standard delivery typically takes 1–2 business days. All luxury items are hand-delivered in our signature sustainable packaging.',
      },
      {
        q: 'Can I change or cancel my order?',
        a: 'Orders may be amended or cancelled within 2 hours of placement. After that, our atelier begins preparation and changes may not be possible. Please contact our concierge team immediately via chat or phone.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'Yes, we ship to select East African countries and to Europe. International shipping timelines and rates are calculated at checkout based on your location.',
      },
    ],
  },
  {
    id: 'returns',
    title: 'Returns & Exchanges',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We accept returns within 14 days of delivery for unworn, undamaged items in original packaging. Bespoke and made-to-order pieces are final sale. Please visit our Delivery & Returns page for full details.',
      },
      {
        q: 'How do I initiate a return?',
        a: 'Log into your account, navigate to Order History, and select the order you wish to return. Our concierge team will arrange a complimentary collection from your address within Nairobi.',
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    questions: [
      {
        q: 'Do you accept M-PESA for online purchases?',
        a: 'Yes, we fully integrate M-PESA Express at checkout. Simply select the M-PESA option, enter your phone number, and you will receive a secure STK push on your device to authorize the payment.',
      },
      {
        q: 'What other payment methods do you accept?',
        a: 'We accept all major credit and debit cards (Visa, Mastercard), M-PESA, and bank transfer for orders above a certain value. All transactions are secured and encrypted.',
      },
    ],
  },
  {
    id: 'product-care',
    title: 'Product Care',
    questions: [
      {
        q: 'How should I care for my silk garments?',
        a: 'Silk and chiffon pieces should be professionally dry-cleaned only. Store in a breathable garment bag away from direct sunlight. Avoid contact with perfume and harsh chemicals.',
      },
      {
        q: 'How do I care for my fine jewelry?',
        a: 'Clean with a soft, lint-free cloth after every wear to remove natural oils and residue. Store separately in the provided jewelry pouches to prevent scratching. Avoid contact with water, perfume, and cleaning products.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="bg-[#fef8fc] font-montserrat text-[#1d1b1e] min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#430562] text-white py-20 px-6 text-center">
        <p className="font-montserrat text-[12px] uppercase tracking-[0.15em] text-white/60 mb-4">Support</p>
        <h1 className="font-playfair text-[40px] md:text-[56px] font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-[18px] text-white/80 max-w-xl mx-auto">
          Find answers to the most common questions about your FASHION & CO. experience.
        </p>
      </section>

      {/* FAQ Content */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="space-y-16">
          {FAQ_CATEGORIES.map((category) => (
            <div key={category.id} id={category.id}>
              <h2 className="font-playfair text-[32px] font-semibold text-[#430562] border-b border-[#cfc2d1]/30 pb-4 mb-8">
                {category.title}
              </h2>
              <div className="space-y-0">
                {category.questions.map((item, idx) => (
                  <details
                    key={idx}
                    className="group border-b border-[#cfc2d1]/30"
                  >
                    <summary className="flex justify-between items-center py-6 cursor-pointer list-none hover:text-[#430562] transition-colors">
                      <span className="font-montserrat text-[16px] md:text-[18px] font-medium text-[#1d1b1e] group-hover:text-[#430562] transition-colors pr-4">
                        {item.q}
                      </span>
                      <span className="text-[#4d444f] group-open:rotate-180 transition-transform duration-300 shrink-0">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </summary>
                    <div className="pb-6 text-[#4d444f] font-montserrat text-[16px] leading-relaxed">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Product Care Callout */}
      <section className="bg-[#f2ecf0] py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="border border-[#cfc2d1]/30 p-10 md:p-14 bg-white relative overflow-hidden">
            <div className="relative z-10 max-w-lg">
              <h3 className="font-playfair text-[32px] font-semibold text-[#430562] mb-4">Preserving Elegance</h3>
              <p className="text-[#4d444f] text-[16px] mb-8 leading-relaxed">
                Our garments and jewelry are crafted from the finest materials. Proper care ensures they remain timeless heirlooms for generations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: 'Silk & Chiffon', detail: 'Professional dry clean only. Store in a breathable garment bag.' },
                  { title: 'Fine Jewelry', detail: 'Clean with a soft, lint-free cloth after every wear.' },
                  { title: 'Leather Goods', detail: 'Condition regularly with a leather balm. Store in dust bags.' },
                  { title: 'Delicate Fabrics', detail: 'Hand wash cold or dry clean. Air dry flat away from sunlight.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#430562] flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-montserrat text-[14px] font-semibold uppercase tracking-wider text-[#1d1b1e]">{item.title}</p>
                      <p className="text-[14px] text-[#4d444f] mt-1">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#430562] py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h3 className="font-playfair text-[40px] font-bold text-white">Still need help?</h3>
          <p className="text-white/80 text-[18px] italic font-montserrat">
            Our Concierge team is available Monday to Saturday, 9 AM – 6 PM (EAT).
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <a
              href="/contact"
              className="inline-block bg-white text-[#430562] px-8 py-4 font-montserrat text-[14px] font-semibold uppercase tracking-wider hover:bg-[#f2ecf0] transition-colors"
            >
              Chat with an Advisor
            </a>
            <a
              href="mailto:hello@fashionandco.ke"
              className="inline-block border border-white/30 text-white px-8 py-4 font-montserrat text-[14px] font-semibold uppercase tracking-wider hover:bg-white/10 transition-colors"
            >
              Email Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
