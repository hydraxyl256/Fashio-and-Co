import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Size Guide | FASHION & CO.',
  description: 'Find your perfect fit with our comprehensive size guide for clothing and jewelry.',
};

const CLOTHING_SIZES = [
  { label: 'XS', ke: '8', uk: '8', eu: '36', bust: '82–84', waist: '63–65', hips: '88–90' },
  { label: 'S',  ke: '10', uk: '10', eu: '38', bust: '86–88', waist: '67–69', hips: '92–94' },
  { label: 'M',  ke: '12', uk: '12', eu: '40', bust: '90–92', waist: '71–73', hips: '96–98' },
  { label: 'L',  ke: '14', uk: '14', eu: '42', bust: '94–96', waist: '75–77', hips: '100–102' },
  { label: 'XL', ke: '16', uk: '16', eu: '44', bust: '98–100', waist: '79–81', hips: '104–106' },
  { label: 'XXL',ke: '18', uk: '18', eu: '46', bust: '102–106', waist: '83–87', hips: '108–112' },
];

const RING_SIZES = [
  { ke: '5', diameter: '15.7', circumference: '49.3' },
  { ke: '6', diameter: '16.5', circumference: '51.8' },
  { ke: '7', diameter: '17.3', circumference: '54.4' },
  { ke: '8', diameter: '18.2', circumference: '57.2' },
  { ke: '9', diameter: '19.0', circumference: '59.7' },
  { ke: '10', diameter: '19.8', circumference: '62.1' },
];

export default function SizeGuidePage() {
  return (
    <div className="bg-[#fef8fc] font-montserrat text-[#1d1b1e] min-h-screen">
      {/* Hero */}
      <section className="bg-[#430562] text-white py-20 px-6 text-center">
        <p className="font-montserrat text-[12px] uppercase tracking-[0.15em] text-white/60 mb-4">Style Assistance</p>
        <h1 className="font-playfair text-[40px] md:text-[56px] font-bold mb-4">Size Guide</h1>
        <p className="text-[18px] text-white/80 max-w-xl mx-auto">
          Every body is unique. Our size guide ensures every piece fits the way it was designed to.
        </p>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-6 py-20 space-y-20">
        
        {/* How to Measure */}
        <div>
          <h2 className="font-playfair text-[32px] font-semibold text-[#430562] mb-8 pb-4 border-b border-[#cfc2d1]/30">
            How to Measure
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Bust',
                desc: 'Measure around the fullest part of your chest, keeping the tape parallel to the floor. Do not pull too tight.',
              },
              {
                title: 'Waist',
                desc: 'Measure around your natural waistline — the narrowest part of your torso, usually just above the navel.',
              },
              {
                title: 'Hips',
                desc: 'Stand with feet together and measure around the fullest part of your hips, approximately 20 cm below your waist.',
              },
            ].map((item) => (
              <div key={item.title} className="p-6 bg-white border border-[#cfc2d1]/30">
                <div className="w-10 h-10 bg-[#430562] mb-4 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M2 9H16M9 2V16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <h4 className="font-montserrat text-[14px] font-semibold uppercase tracking-wider text-[#1d1b1e] mb-2">{item.title}</h4>
                <p className="text-[14px] text-[#4d444f] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Clothing Sizes */}
        <div>
          <h2 className="font-playfair text-[32px] font-semibold text-[#430562] mb-8 pb-4 border-b border-[#cfc2d1]/30">
            Clothing Sizes
          </h2>
          <p className="text-[14px] text-[#4d444f] mb-6">All measurements in centimetres (cm). If you are between sizes, we recommend sizing up.</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#430562] text-white">
                  <th className="text-left py-4 px-5 font-montserrat text-[12px] uppercase tracking-wider">Size</th>
                  <th className="text-center py-4 px-4 font-montserrat text-[12px] uppercase tracking-wider">KE</th>
                  <th className="text-center py-4 px-4 font-montserrat text-[12px] uppercase tracking-wider">UK</th>
                  <th className="text-center py-4 px-4 font-montserrat text-[12px] uppercase tracking-wider">EU</th>
                  <th className="text-center py-4 px-4 font-montserrat text-[12px] uppercase tracking-wider">Bust</th>
                  <th className="text-center py-4 px-4 font-montserrat text-[12px] uppercase tracking-wider">Waist</th>
                  <th className="text-center py-4 px-4 font-montserrat text-[12px] uppercase tracking-wider">Hips</th>
                </tr>
              </thead>
              <tbody>
                {CLOTHING_SIZES.map((row, idx) => (
                  <tr key={row.label} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#f8f2f6]'}>
                    <td className="py-4 px-5 font-montserrat text-[14px] font-bold text-[#430562]">{row.label}</td>
                    <td className="py-4 px-4 text-center font-montserrat text-[14px] text-[#4d444f]">{row.ke}</td>
                    <td className="py-4 px-4 text-center font-montserrat text-[14px] text-[#4d444f]">{row.uk}</td>
                    <td className="py-4 px-4 text-center font-montserrat text-[14px] text-[#4d444f]">{row.eu}</td>
                    <td className="py-4 px-4 text-center font-montserrat text-[14px] text-[#4d444f]">{row.bust}</td>
                    <td className="py-4 px-4 text-center font-montserrat text-[14px] text-[#4d444f]">{row.waist}</td>
                    <td className="py-4 px-4 text-center font-montserrat text-[14px] text-[#4d444f]">{row.hips}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ring Sizes */}
        <div>
          <h2 className="font-playfair text-[32px] font-semibold text-[#430562] mb-8 pb-4 border-b border-[#cfc2d1]/30">
            Ring Sizes
          </h2>
          <p className="text-[14px] text-[#4d444f] mb-6">
            To find your ring size, measure the circumference of your finger with a piece of string or strip of paper and compare with the chart below.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#430562] text-white">
                  <th className="text-center py-4 px-5 font-montserrat text-[12px] uppercase tracking-wider">Ring Size</th>
                  <th className="text-center py-4 px-5 font-montserrat text-[12px] uppercase tracking-wider">Diameter (mm)</th>
                  <th className="text-center py-4 px-5 font-montserrat text-[12px] uppercase tracking-wider">Circumference (mm)</th>
                </tr>
              </thead>
              <tbody>
                {RING_SIZES.map((row, idx) => (
                  <tr key={row.ke} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#f8f2f6]'}>
                    <td className="py-4 px-5 text-center font-montserrat text-[14px] font-bold text-[#430562]">{row.ke}</td>
                    <td className="py-4 px-5 text-center font-montserrat text-[14px] text-[#4d444f]">{row.diameter}</td>
                    <td className="py-4 px-5 text-center font-montserrat text-[14px] text-[#4d444f]">{row.circumference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Need Help Callout */}
        <div className="bg-[#f2ecf0] p-10 border border-[#cfc2d1]/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-playfair text-[24px] font-semibold text-[#430562] mb-2">Not sure of your size?</h3>
            <p className="text-[#4d444f] text-[14px]">Our styling concierge can assist you with measurements and personal recommendations.</p>
          </div>
          <a
            href="/contact"
            className="shrink-0 bg-[#430562] text-white px-8 py-4 font-montserrat text-[14px] font-semibold uppercase tracking-wider hover:bg-[#3d174f] transition-colors"
          >
            Ask a Stylist
          </a>
        </div>

      </section>
    </div>
  );
}
