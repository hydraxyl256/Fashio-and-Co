'use client';

import * as React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [pending, setPending] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1000));
    setPending(false);
    setSubmitted(true);
    toast.success('Message sent. Our concierge will be in touch shortly.');
  };

  return (
    <div className="bg-[#fef8fc] font-montserrat text-[#1d1b1e] min-h-screen">
      {/* Hero */}
      <section className="bg-[#430562] text-white py-20 px-6 text-center">
        <p className="font-montserrat text-[12px] uppercase tracking-[0.15em] text-white/60 mb-4">Get In Touch</p>
        <h1 className="font-playfair text-[40px] md:text-[56px] font-bold mb-4">Contact Us</h1>
        <p className="text-[18px] text-white/80 max-w-xl mx-auto">
          Our concierge team is here to help you, Monday to Saturday, 9 AM – 6 PM (EAT).
        </p>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="font-playfair text-[28px] font-semibold text-[#430562] mb-6">Reach Us</h2>
              <div className="space-y-6">
                {[
                  {
                    icon: Mail,
                    title: 'Email',
                    value: 'hello@fashionandco.ke',
                    href: 'mailto:hello@fashionandco.ke',
                  },
                  {
                    icon: Phone,
                    title: 'Phone',
                    value: '+254 712 345 678',
                    href: 'tel:+254712345678',
                  },
                  {
                    icon: MapPin,
                    title: 'Atelier',
                    value: 'The Hub Karen, Nairobi',
                    href: '#',
                  },
                  {
                    icon: Clock,
                    title: 'Hours',
                    value: 'Mon–Sat, 9AM–6PM EAT',
                    href: null,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const content = (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#430562] flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-montserrat text-[12px] uppercase tracking-wider text-[#7e7480] mb-1">{item.title}</p>
                        <p className="font-montserrat text-[16px] text-[#1d1b1e]">{item.value}</p>
                      </div>
                    </div>
                  );
                  return item.href && item.href !== '#' ? (
                    <a key={item.title} href={item.href} className="block hover:opacity-80 transition-opacity">
                      {content}
                    </a>
                  ) : (
                    <div key={item.title}>{content}</div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#f2ecf0] p-6 border border-[#cfc2d1]/30">
              <h4 className="font-playfair text-[18px] font-semibold text-[#430562] mb-2">Personal Shopping</h4>
              <p className="text-[14px] text-[#4d444f] leading-relaxed mb-4">
                Looking for something specific? Our personal stylists can curate a selection just for you.
              </p>
              <Link
                href="/account/wishlist"
                className="font-montserrat text-[12px] font-semibold uppercase tracking-wider text-[#430562] hover:underline"
              >
                Browse the Edit →
              </Link>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="bg-white border border-[#cfc2d1]/30 p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-[#430562] rounded-full flex items-center justify-center mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12L10 17L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-playfair text-[28px] font-semibold text-[#430562] mb-3">Message Received</h3>
                <p className="text-[#4d444f] text-[16px] mb-6">
                  Thank you for reaching out. Our concierge team will respond within one business day.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="font-montserrat text-[14px] text-[#430562] hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white border border-[#cfc2d1]/30 p-10 space-y-8">
                <h2 className="font-playfair text-[28px] font-semibold text-[#430562]">Send a Message</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <label className="block font-montserrat text-[12px] font-semibold uppercase tracking-wider text-[#7e7480] mb-2">
                      First Name
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full bg-transparent border-b border-[#cfc2d1] py-3 font-montserrat text-[16px] text-[#1d1b1e] focus:outline-none focus:border-[#430562] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-montserrat text-[12px] font-semibold uppercase tracking-wider text-[#7e7480] mb-2">
                      Last Name
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full bg-transparent border-b border-[#cfc2d1] py-3 font-montserrat text-[16px] text-[#1d1b1e] focus:outline-none focus:border-[#430562] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-montserrat text-[12px] font-semibold uppercase tracking-wider text-[#7e7480] mb-2">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    className="w-full bg-transparent border-b border-[#cfc2d1] py-3 font-montserrat text-[16px] text-[#1d1b1e] focus:outline-none focus:border-[#430562] transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-montserrat text-[12px] font-semibold uppercase tracking-wider text-[#7e7480] mb-2">
                    Topic
                  </label>
                  <select
                    className="w-full bg-transparent border-b border-[#cfc2d1] py-3 font-montserrat text-[16px] text-[#1d1b1e] focus:outline-none focus:border-[#430562] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Select a topic...</option>
                    <option value="order">Order Enquiry</option>
                    <option value="returns">Returns & Exchanges</option>
                    <option value="styling">Personal Styling</option>
                    <option value="bespoke">Bespoke Orders</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-montserrat text-[12px] font-semibold uppercase tracking-wider text-[#7e7480] mb-2">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="w-full bg-transparent border-b border-[#cfc2d1] py-3 font-montserrat text-[16px] text-[#1d1b1e] focus:outline-none focus:border-[#430562] transition-colors resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full bg-[#430562] text-white py-4 font-montserrat text-[14px] font-semibold uppercase tracking-wider hover:bg-[#3d174f] transition-colors disabled:opacity-60"
                >
                  {pending ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
