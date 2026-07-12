import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy & Terms | FASHION & CO.',
  description: 'FASHION & CO. privacy policy and terms of service.',
};

export default function PrivacyTermsPage() {
  const lastUpdated = 'December 2024';

  return (
    <div className="bg-[#fef8fc] font-montserrat text-[#1d1b1e] min-h-screen">
      {/* Hero */}
      <section className="bg-[#430562] text-white py-20 px-6 text-center">
        <p className="font-montserrat text-[12px] uppercase tracking-[0.15em] text-white/60 mb-4">Legal</p>
        <h1 className="font-playfair text-[40px] md:text-[56px] font-bold mb-4">Privacy Policy & Terms</h1>
        <p className="text-[14px] text-white/60">Last updated: {lastUpdated}</p>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-6 py-20 space-y-16">
        
        {/* Privacy Policy */}
        <div>
          <h2 className="font-playfair text-[32px] font-semibold text-[#430562] mb-8 pb-4 border-b border-[#cfc2d1]/30">
            Privacy Policy
          </h2>
          <div className="space-y-8 text-[16px] text-[#4d444f] leading-relaxed">
            <div>
              <h3 className="font-montserrat font-semibold text-[18px] text-[#1d1b1e] mb-3">Information We Collect</h3>
              <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact our customer service team. This includes your name, email address, phone number, delivery address, and payment information.</p>
            </div>
            <div>
              <h3 className="font-montserrat font-semibold text-[18px] text-[#1d1b1e] mb-3">How We Use Your Information</h3>
              <p>We use the information we collect to process transactions, send order confirmations, provide customer support, and personalise your shopping experience. With your consent, we may also send you marketing communications about new collections and exclusive offers.</p>
            </div>
            <div>
              <h3 className="font-montserrat font-semibold text-[18px] text-[#1d1b1e] mb-3">Data Security</h3>
              <p>We implement industry-standard security measures to protect your personal information. All payment transactions are encrypted using SSL technology. We do not store full card details on our servers.</p>
            </div>
            <div>
              <h3 className="font-montserrat font-semibold text-[18px] text-[#1d1b1e] mb-3">Cookies</h3>
              <p>We use cookies to enhance your browsing experience, analyse site traffic, and personalise content. You can control cookie settings through your browser preferences. Disabling cookies may affect some features of our website.</p>
            </div>
            <div>
              <h3 className="font-montserrat font-semibold text-[18px] text-[#1d1b1e] mb-3">Your Rights</h3>
              <p>You have the right to access, correct, or delete your personal information at any time. To exercise these rights or to opt out of marketing communications, contact our data privacy team at <a href="mailto:privacy@fashionandco.ke" className="text-[#430562] underline">privacy@fashionandco.ke</a>.</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-[#430562]/20" />

        {/* Terms of Service */}
        <div>
          <h2 className="font-playfair text-[32px] font-semibold text-[#430562] mb-8 pb-4 border-b border-[#cfc2d1]/30">
            Terms of Service
          </h2>
          <div className="space-y-8 text-[16px] text-[#4d444f] leading-relaxed">
            <div>
              <h3 className="font-montserrat font-semibold text-[18px] text-[#1d1b1e] mb-3">Acceptance of Terms</h3>
              <p>By accessing or using the FASHION & CO. website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
            </div>
            <div>
              <h3 className="font-montserrat font-semibold text-[18px] text-[#1d1b1e] mb-3">Account Responsibility</h3>
              <p>You are responsible for maintaining the confidentiality of your account credentials. Any activities that occur under your account are your responsibility. Please notify us immediately at <a href="mailto:support@fashionandco.ke" className="text-[#430562] underline">support@fashionandco.ke</a> if you suspect unauthorised access.</p>
            </div>
            <div>
              <h3 className="font-montserrat font-semibold text-[18px] text-[#1d1b1e] mb-3">Purchases & Payments</h3>
              <p>By placing an order, you represent that the payment information you provide is accurate and that you are authorised to use the payment method. All prices are displayed in Kenyan Shillings (KES) unless otherwise stated and are subject to applicable taxes.</p>
            </div>
            <div>
              <h3 className="font-montserrat font-semibold text-[18px] text-[#1d1b1e] mb-3">Intellectual Property</h3>
              <p>All content on this website, including images, text, logos, and design elements, is the intellectual property of FASHION & CO. and is protected under copyright law. No content may be reproduced without prior written consent.</p>
            </div>
            <div>
              <h3 className="font-montserrat font-semibold text-[18px] text-[#1d1b1e] mb-3">Limitation of Liability</h3>
              <p>FASHION & CO. shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or services. Our liability is limited to the value of the specific order in question.</p>
            </div>
            <div>
              <h3 className="font-montserrat font-semibold text-[18px] text-[#1d1b1e] mb-3">Governing Law</h3>
              <p>These terms are governed by the laws of Kenya. Any disputes arising from these terms or your use of our services shall be resolved in the courts of Nairobi, Kenya.</p>
            </div>
          </div>
        </div>

        {/* Contact Box */}
        <div className="bg-[#f2ecf0] p-10 border border-[#cfc2d1]/30 text-center">
          <h3 className="font-playfair text-[24px] font-semibold text-[#430562] mb-3">Questions about our policies?</h3>
          <p className="text-[#4d444f] text-[14px] mb-6">Our legal and privacy team is here to assist you with any concerns.</p>
          <a
            href="mailto:legal@fashionandco.ke"
            className="inline-block bg-[#430562] text-white px-8 py-4 font-montserrat text-[14px] font-semibold uppercase tracking-wider hover:bg-[#3d174f] transition-colors"
          >
            Contact Legal Team
          </a>
        </div>

      </section>
    </div>
  );
}
