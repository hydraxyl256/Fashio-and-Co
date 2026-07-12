-- 0009_seed.sql
-- Seed data for womenswear and jewelry. Idempotent: re-runs are safe and
-- only insert rows that don't already exist (keyed by slug / code).
-- This file does NOT create auth users; the staff/customer test accounts
-- are created manually via the Supabase dashboard or `supabase auth` CLI
-- and then promoted with the `make_staff.sql` and `make_admin.sql` helpers.

------------------------------------------------------------------------
-- Categories
------------------------------------------------------------------------
insert into public.categories (id, name, slug, description, display_order, is_active) values
  ('00000000-0000-0000-0000-0000000000a1', 'Womenswear', 'womenswear', 'Dresses, separates, and tailored pieces.', 1, true),
  ('00000000-0000-0000-0000-0000000000a2', 'Jewelry',    'jewelry',    'Hand-finished brass, silver, and gold pieces.', 2, true),
  ('00000000-0000-0000-0000-0000000000a3', 'Accessories','accessories','Scarves, hair, and small leather goods.', 3, true)
on conflict (slug) do nothing;

------------------------------------------------------------------------
-- Subcategories (one level under womenswear/jewelry)
------------------------------------------------------------------------
insert into public.categories (id, name, slug, description, parent_id, display_order, is_active) values
  ('00000000-0000-0000-0000-0000000000b1', 'Dresses',  'dresses',  'From day dresses to occasion pieces.', '00000000-0000-0000-0000-0000000000a1', 1, true),
  ('00000000-0000-0000-0000-0000000000b2', 'Tops',     'tops',     'Shirts, blouses, knits.',              '00000000-0000-0000-0000-0000000000a1', 2, true),
  ('00000000-0000-0000-0000-0000000000b3', 'Skirts',   'skirts',   'Bias, A-line, and pleated.',           '00000000-0000-0000-0000-0000000000a1', 3, true),
  ('00000000-0000-0000-0000-0000000000b4', 'Trousers', 'trousers', 'Tailored and relaxed fits.',           '00000000-0000-0000-0000-0000000000a1', 4, true),
  ('00000000-0000-0000-0000-0000000000c1', 'Earrings', 'earrings', 'Studs, drops, and hoops.',             '00000000-0000-0000-0000-0000000000a2', 1, true),
  ('00000000-0000-0000-0000-0000000000c2', 'Necklaces','necklaces','Pendants, chains, and collars.',       '00000000-0000-0000-0000-0000000000a2', 2, true),
  ('00000000-0000-0000-0000-0000000000c3', 'Bracelets','bracelets','Cuffs and bangles.',                   '00000000-0000-0000-0000-0000000000a2', 3, true),
  ('00000000-0000-0000-0000-0000000000c4', 'Rings',    'rings',    'Signets and stackable bands.',         '00000000-0000-0000-0000-0000000000a2', 4, true)
on conflict (slug) do nothing;

------------------------------------------------------------------------
-- Collections
------------------------------------------------------------------------
insert into public.collections (id, name, slug, subtitle, description, is_active, is_featured) values
  ('10000000-0000-0000-0000-0000000000d1',
   'Dusk in Nairobi', 'dusk-in-nairobi',
   'Spring 2026',
   'A palette drawn from Nairobi at sundown: warm cocoa, brass, terracotta, and ivory.',
   true, true),

  ('10000000-0000-0000-0000-0000000000d2',
   'Atelier No. 04', 'atelier-no-04',
   'Limited edition',
   'Hand-finished pieces produced in a run of forty. Each piece is signed.',
   true, true),

  ('10000000-0000-0000-0000-0000000000d3',
   'Brass & Bone', 'brass-and-bone',
   'Core jewelry',
   'The foundational brass-cast line. Restocked seasonally.',
   true, false)
on conflict (slug) do nothing;

------------------------------------------------------------------------
-- Products (12)
------------------------------------------------------------------------
insert into public.products (
  id, slug, name, short_description, full_description,
  category_id, price_cents, compare_at_price_cents, currency,
  care_instructions, fit_notes, meta_title, meta_description,
  is_featured, is_active, published_at
) values
('20000000-0000-0000-0000-0000000000e1',
 'dusk-linen-midi-dress', 'Dusk Linen Midi Dress',
 'A bias-cut linen dress in warm ivory.',
 'Cut from heavyweight Belgian linen and washed for softness. Bias silhouette skims without clinging. Mother-of-pearl buttons at the shoulder.',
 '00000000-0000-0000-0000-0000000000b1', 1890000, 2100000, 'KES',
 'Hand wash cold, line dry, cool iron.', 'True to size. Bias cut, sits close on the body.',
 'Dusk Linen Midi Dress — Fashion & Co.',
 'Bias-cut linen midi dress, hand-finished in Nairobi.',
 true, true, now()),

('20000000-0000-0000-0000-0000000000e2',
 'cocoa-wrap-blouse', 'Cocoa Wrap Blouse',
 'A silk-blend wrap blouse in deep cocoa.',
 'A relaxed wrap silhouette with a hand-rolled hem. Slightly cropped at the waist.',
 '00000000-0000-0000-0000-0000000000b2', 1250000, null, 'KES',
 'Dry clean recommended.', 'Runs slightly large; size down for a closer fit.',
 null, null, true, true, now()),

('20000000-0000-0000-0000-0000000000e3',
 'terracotta-pleated-skirt', 'Terracotta Pleated Skirt',
 'Sun-pleated skirt in washed terracotta cotton.',
 'Knife-pleated for movement, lined in cotton voile. Hits below the knee.',
 '00000000-0000-0000-0000-0000000000b3', 1450000, null, 'KES',
 'Cool wash, hang to dry.', 'High-rise; sits at the natural waist.',
 null, null, true, true, now()),

('20000000-0000-0000-0000-0000000000e4',
 'tailored-ivory-trouser', 'Tailored Ivory Trouser',
 'Wide-leg trouser in heavyweight ivory wool.',
 'A clean front, side seam pockets, and a pressed crease. Cut to break at the shoe.',
 '00000000-0000-0000-0000-0000000000b4', 1680000, 1900000, 'KES',
 'Dry clean only.', 'Take your usual trouser size; the waist is true.',
 null, null, true, true, now()),

('20000000-0000-0000-0000-0000000000e5',
 'brass-tapered-hoop', 'Brass Tapered Hoop',
 'Tapered brass hoop, hand-cast in Nairobi.',
 'A small, sculptural hoop. Hollow-cast brass with a hand-hammered finish.',
 '00000000-0000-0000-0000-0000000000c1', 380000, null, 'KES',
 'Store dry. Polish with a soft cloth.', 'Lightweight, ~6g per pair.',
 null, null, true, true, now()),

('20000000-0000-0000-0000-0000000000e6',
 'ivory-pearl-drop-earring', 'Ivory Pearl Drop Earring',
 'Freshwater pearl suspended on a brass post.',
 'A small ivory pearl on a hand-cast brass post. Sold as a pair.',
 '00000000-0000-0000-0000-0000000000c1', 520000, null, 'KES',
 'Avoid contact with perfume and water.', 'Hypoallergenic brass post; lightweight.',
 null, null, true, true, now()),

('20000000-0000-0000-0000-0000000000e7',
 'brass-coin-pendant', 'Brass Coin Pendant',
 'A polished brass pendant on a fine chain.',
 'A flat circular pendant cast from an original coin die. Sits at the collarbone.',
 '00000000-0000-0000-0000-0000000000c2', 680000, 780000, 'KES',
 'Polish with a soft, dry cloth.', 'Chain 45 cm; pendant 22 mm.',
 null, null, true, true, now()),

('20000000-0000-0000-0000-0000000000e8',
 'silver-collar-necklace', 'Silver Collar Necklace',
 'Sterling silver collar with a hand-hammered finish.',
 'A clean, architectural collar that sits high on the neck. Polished to a soft sheen.',
 '00000000-0000-0000-0000-0000000000c2', 1450000, null, 'KES',
 'Store in the suede pouch provided.', 'Sterling silver, 38 cm.',
 null, null, true, true, now()),

('20000000-0000-0000-0000-0000000000e9',
 'brass-wide-cuff', 'Brass Wide Cuff',
 'A wide, hand-hammered brass cuff.',
 'Cast in solid brass, then hand-hammered for a soft, irregular surface.',
 '00000000-0000-0000-0000-0000000000c3', 950000, null, 'KES',
 'Polish with a soft cloth; avoid water.', 'Slightly adjustable; one size fits most.',
 null, null, true, true, now()),

('20000000-0000-0000-0000-0000000000ea',
 'signet-ring-cocoa', 'Signet Ring — Cocoa',
 'Brass signet ring with a hand-finished face.',
 'A heavy brass signet ring with a softly polished face. Engravable.',
 '00000000-0000-0000-0000-0000000000c4', 720000, null, 'KES',
 'Polish with a soft cloth.', 'Available in sizes 5–9.',
 null, null, true, true, now()),

('20000000-0000-0000-0000-0000000000eb',
 'bone-silk-scarf', 'Bone Silk Scarf',
 'Hand-rolled silk scarf in ivory and brass.',
 'A square silk twill scarf, hand-rolled at the edges.',
 '00000000-0000-0000-0000-0000000000a3', 480000, null, 'KES',
 'Dry clean only.', '90 x 90 cm.',
 null, null, true, true, now()),

('20000000-0000-0000-0000-0000000000ec',
 'ivory-leather-belt', 'Ivory Leather Belt',
 'A slim, vegetable-tanned ivory belt.',
 'Hand-cut and edged. A small brass buckle.',
 '00000000-0000-0000-0000-0000000000a3', 580000, null, 'KES',
 'Wipe with a damp cloth; condition yearly.', 'S/M/L; five holes.',
 null, null, true, true, now())
on conflict (slug) do nothing;

------------------------------------------------------------------------
-- Product variants
------------------------------------------------------------------------
insert into public.product_variants (
  id, product_id, sku, size, color, material, metal, gemstone,
  stock_quantity, low_stock_threshold, is_active, position
) values
-- Dusk Linen Midi Dress — sizes XS/S/M/L
('30000000-0000-0000-0000-0000000000f1','20000000-0000-0000-0000-0000000000e1','FC-DUSK-DR-IV-XS','XS','Ivory','Linen',null,null,8,3,true,1),
('30000000-0000-0000-0000-0000000000f2','20000000-0000-0000-0000-0000000000e1','FC-DUSK-DR-IV-S', 'S', 'Ivory','Linen',null,null,12,3,true,2),
('30000000-0000-0000-0000-0000000000f3','20000000-0000-0000-0000-0000000000e1','FC-DUSK-DR-IV-M', 'M', 'Ivory','Linen',null,null,14,3,true,3),
('30000000-0000-0000-0000-0000000000f4','20000000-0000-0000-0000-0000000000e1','FC-DUSK-DR-IV-L', 'L', 'Ivory','Linen',null,null,6,3,true,4),

-- Cocoa Wrap Blouse
('30000000-0000-0000-0000-0000000000f5','20000000-0000-0000-0000-0000000000e2','FC-COCOA-BL-S','S','Cocoa','Silk-blend',null,null,10,3,true,1),
('30000000-0000-0000-0000-0000000000f6','20000000-0000-0000-0000-0000000000e2','FC-COCOA-BL-M','M','Cocoa','Silk-blend',null,null,10,3,true,2),
('30000000-0000-0000-0000-0000000000f7','20000000-0000-0000-0000-0000000000e2','FC-COCOA-BL-L','L','Cocoa','Silk-blend',null,null,8,3,true,3),

-- Terracotta Pleated Skirt
('30000000-0000-0000-0000-0000000000f8','20000000-0000-0000-0000-0000000000e3','FC-TERRA-SK-S','S','Terracotta','Cotton',null,null,6,3,true,1),
('30000000-0000-0000-0000-0000000000f9','20000000-0000-0000-0000-0000000000e3','FC-TERRA-SK-M','M','Terracotta','Cotton',null,null,9,3,true,2),
('30000000-0000-0000-0000-0000000000fa','20000000-0000-0000-0000-0000000000e3','FC-TERRA-SK-L','L','Terracotta','Cotton',null,null,4,3,true,3),

-- Tailored Ivory Trouser
('30000000-0000-0000-0000-0000000000fb','20000000-0000-0000-0000-0000000000e4','FC-TAIL-TR-S','S','Ivory','Wool',null,null,7,3,true,1),
('30000000-0000-0000-0000-0000000000fc','20000000-0000-0000-0000-0000000000e4','FC-TAIL-TR-M','M','Ivory','Wool',null,null,10,3,true,2),
('30000000-0000-0000-0000-0000000000fd','20000000-0000-0000-0000-0000000000e4','FC-TAIL-TR-L','L','Ivory','Wool',null,null,5,3,true,3),

-- Brass Tapered Hoop (one size)
('30000000-0000-0000-0000-0000000000fe','20000000-0000-0000-0000-0000000000e5','FC-BR-HOOP-OS','One size',null,null,'Brass',null,40,5,true,1),

-- Ivory Pearl Drop Earring
('30000000-0000-0000-0000-0000000000ff','20000000-0000-0000-0000-0000000000e6','FC-PEARL-EAR-OS','One size',null,null,'Brass','Freshwater pearl',24,5,true,1),

-- Brass Coin Pendant
('30000000-0000-0000-0000-000000000100','20000000-0000-0000-0000-0000000000e7','FC-COIN-PEND-OS','One size',null,null,'Brass',null,18,5,true,1),

-- Silver Collar Necklace
('30000000-0000-0000-0000-000000000101','20000000-0000-0000-0000-0000000000e8','FC-SIL-COL-OS','One size',null,null,'Sterling silver',null,6,3,true,1),

-- Brass Wide Cuff
('30000000-0000-0000-0000-000000000102','20000000-0000-0000-0000-0000000000e9','FC-CUFF-OS','One size',null,null,'Brass',null,12,3,true,1),

-- Signet Ring Cocoa (sizes 5–9)
('30000000-0000-0000-0000-000000000103','20000000-0000-0000-0000-0000000000ea','FC-SIGN-RING-5','5',null,null,'Brass',null,4,3,true,1),
('30000000-0000-0000-0000-000000000104','20000000-0000-0000-0000-0000000000ea','FC-SIGN-RING-6','6',null,null,'Brass',null,6,3,true,2),
('30000000-0000-0000-0000-000000000105','20000000-0000-0000-0000-0000000000ea','FC-SIGN-RING-7','7',null,null,'Brass',null,7,3,true,3),
('30000000-0000-0000-0000-000000000106','20000000-0000-0000-0000-0000000000ea','FC-SIGN-RING-8','8',null,null,'Brass',null,5,3,true,4),
('30000000-0000-0000-0000-000000000107','20000000-0000-0000-0000-0000000000ea','FC-SIGN-RING-9','9',null,null,'Brass',null,3,3,true,5),

-- Bone Silk Scarf
('30000000-0000-0000-0000-000000000108','20000000-0000-0000-0000-0000000000eb','FC-SCARF-BONE-OS','One size','Ivory','Silk',null,null,15,3,true,1),

-- Ivory Leather Belt
('30000000-0000-0000-0000-000000000109','20000000-0000-0000-0000-0000000000ec','FC-BELT-IV-S','S','Ivory','Leather','Brass',null,5,3,true,1),
('30000000-0000-0000-0000-00000000010a','20000000-0000-0000-0000-0000000000ec','FC-BELT-IV-M','M','Ivory','Leather','Brass',null,7,3,true,2),
('30000000-0000-0000-0000-00000000010b','20000000-0000-0000-0000-0000000000ec','FC-BELT-IV-L','L','Ivory','Leather','Brass',null,4,3,true,3)
on conflict (sku) do nothing;

------------------------------------------------------------------------
-- Product images (placeholder paths; upload actual files via Supabase)
------------------------------------------------------------------------
insert into public.product_images (id, product_id, storage_path, alt_text, display_order, is_cover) values
('40000000-0000-0000-0000-000000000110','20000000-0000-0000-0000-0000000000e1','product-images/dusk-linen-midi-dress-01.jpg','Dusk Linen Midi Dress — front',1,true),
('40000000-0000-0000-0000-000000000111','20000000-0000-0000-0000-0000000000e2','product-images/cocoa-wrap-blouse-01.jpg','Cocoa Wrap Blouse — front',1,true),
('40000000-0000-0000-0000-000000000112','20000000-0000-0000-0000-0000000000e3','product-images/terracotta-pleated-skirt-01.jpg','Terracotta Pleated Skirt — front',1,true),
('40000000-0000-0000-0000-000000000113','20000000-0000-0000-0000-0000000000e4','product-images/tailored-ivory-trouser-01.jpg','Tailored Ivory Trouser — front',1,true),
('40000000-0000-0000-0000-000000000114','20000000-0000-0000-0000-0000000000e5','product-images/brass-tapered-hoop-01.jpg','Brass Tapered Hoop — pair',1,true),
('40000000-0000-0000-0000-000000000115','20000000-0000-0000-0000-0000000000e6','product-images/ivory-pearl-drop-earring-01.jpg','Ivory Pearl Drop Earring — pair',1,true),
('40000000-0000-0000-0000-000000000116','20000000-0000-0000-0000-0000000000e7','product-images/brass-coin-pendant-01.jpg','Brass Coin Pendant',1,true),
('40000000-0000-0000-0000-000000000117','20000000-0000-0000-0000-0000000000e8','product-images/silver-collar-necklace-01.jpg','Silver Collar Necklace',1,true),
('40000000-0000-0000-0000-000000000118','20000000-0000-0000-0000-0000000000e9','product-images/brass-wide-cuff-01.jpg','Brass Wide Cuff',1,true),
('40000000-0000-0000-0000-000000000119','20000000-0000-0000-0000-0000000000ea','product-images/signet-ring-cocoa-01.jpg','Signet Ring — Cocoa',1,true),
('40000000-0000-0000-0000-00000000011a','20000000-0000-0000-0000-0000000000eb','product-images/bone-silk-scarf-01.jpg','Bone Silk Scarf',1,true),
('40000000-0000-0000-0000-00000000011b','20000000-0000-0000-0000-0000000000ec','product-images/ivory-leather-belt-01.jpg','Ivory Leather Belt',1,true)
on conflict do nothing;

------------------------------------------------------------------------
-- product_collections (Dusk in Nairobi + Brass & Bone for the jewelry)
------------------------------------------------------------------------
insert into public.product_collections (product_id, collection_id, display_order) values
('20000000-0000-0000-0000-0000000000e1','10000000-0000-0000-0000-0000000000d1',1),
('20000000-0000-0000-0000-0000000000e2','10000000-0000-0000-0000-0000000000d1',2),
('20000000-0000-0000-0000-0000000000e3','10000000-0000-0000-0000-0000000000d1',3),
('20000000-0000-0000-0000-0000000000e4','10000000-0000-0000-0000-0000000000d1',4),
('20000000-0000-0000-0000-0000000000e5','10000000-0000-0000-0000-0000000000d2',1),
('20000000-0000-0000-0000-0000000000e5','10000000-0000-0000-0000-0000000000d3',1),
('20000000-0000-0000-0000-0000000000e6','10000000-0000-0000-0000-0000000000d2',2),
('20000000-0000-0000-0000-0000000000e7','10000000-0000-0000-0000-0000000000d3',2),
('20000000-0000-0000-0000-0000000000e8','10000000-0000-0000-0000-0000000000d3',3),
('20000000-0000-0000-0000-0000000000e9','10000000-0000-0000-0000-0000000000d3',4),
('20000000-0000-0000-0000-0000000000ea','10000000-0000-0000-0000-0000000000d3',5)
on conflict do nothing;

------------------------------------------------------------------------
-- Delivery zones (Nairobi + key counties)
------------------------------------------------------------------------
insert into public.delivery_zones (id, name, country, region, sort_order, is_active) values
('50000000-0000-0000-0000-000000000120','Nairobi — Central', 'KE', 'Nairobi', 1, true),
('50000000-0000-0000-0000-000000000121','Nairobi — Outskirts', 'KE', 'Nairobi', 2, true),
('50000000-0000-0000-0000-000000000122','Kenya — Major Towns', 'KE', null, 3, true),
('50000000-0000-0000-0000-000000000123','East Africa — Cross-border', 'KE', null, 4, true)
on conflict do nothing;

------------------------------------------------------------------------
-- Delivery rates
------------------------------------------------------------------------
insert into public.delivery_rates (
  id, zone_id, name, description, price_cents, free_threshold_cents,
  eta_min_days, eta_max_days, sort_order, is_active
) values
-- Nairobi Central
('50000000-0000-0000-0000-000000000130','50000000-0000-0000-0000-000000000120',
  'Same-day courier', 'Hand-delivered within Nairobi (before 2pm orders).',
  80000, 2500000, 0, 0, 1, true),
('50000000-0000-0000-0000-000000000131','50000000-0000-0000-0000-000000000120',
  'Next-day standard', 'Delivered the next day.',
  35000, 1500000, 1, 1, 2, true),

-- Nairobi Outskirts
('50000000-0000-0000-0000-000000000132','50000000-0000-0000-0000-000000000121',
  'Standard', 'Outskirts of Nairobi — Karen, Runda, Athi River, etc.',
  60000, 2000000, 1, 2, 1, true),

-- Kenya Major Towns
('50000000-0000-0000-0000-000000000133','50000000-0000-0000-0000-000000000122',
  'Standard', 'Mombasa, Kisumu, Nakuru, Eldoret, Nanyuki.',
  250000, 5000000, 3, 5, 1, true),
('50000000-0000-0000-0000-000000000134','50000000-0000-0000-0000-000000000122',
  'Express', 'Priority 1–2 day dispatch.',
  450000, null, 1, 2, 2, true),

-- East Africa cross-border
('50000000-0000-0000-0000-000000000135','50000000-0000-0000-0000-000000000123',
  'Standard', 'Uganda, Tanzania, Rwanda.',
  950000, null, 5, 8, 1, true)
on conflict do nothing;

------------------------------------------------------------------------
-- Discount codes
------------------------------------------------------------------------
insert into public.discount_codes (id, code, description, kind, applies_to, value, min_subtotal_cents, is_active) values
('60000000-0000-0000-0000-000000000140','WELCOME10',  '10% off your first order',  'percentage',    'order',  1000, 0, true),
('60000000-0000-0000-0000-000000000141','ATELIER500', 'KES 500 off orders over KES 10,000', 'fixed_amount', 'order', 50000, 1000000, true)
on conflict (code) do nothing;

------------------------------------------------------------------------
-- Homepage sections
------------------------------------------------------------------------
insert into public.homepage_sections (id, kind, slug, title, subtitle, body, image_url, cta_label, cta_href, display_order, is_active) values
('70000000-0000-0000-0000-000000000150','hero','spring-2026',
 'A Quiet Return to Form',
 'Spring · 2026',
 'Architectural linen, brass-cast jewelry, and a palette drawn from the Nairobi dusk.',
 'campaign-images/spring-2026-hero.jpg',
 'Discover the Edit',
 '/collections/dusk-in-nairobi', 1, true),

('70000000-0000-0000-0000-000000000151','category_grid','shop-by-category',
 'Shop the House', null, null, null, null, '/collections', 2, true),

('70000000-0000-0000-0000-000000000152','collection_feature','feature-dusk',
 'Dusk in Nairobi', 'A new collection',
 'Cut from heavyweight linen and washed for softness. A palette of warm cocoa, brass, terracotta, and ivory.',
 'collection-images/dusk-in-nairobi.jpg',
 'Shop the collection',
 '/collections/dusk-in-nairobi', 3, true),

('70000000-0000-0000-0000-000000000153','product_grid','featured-jewelry',
 'Brass & Bone', 'Foundational jewelry',
 null, null, 'Shop jewelry', '/collections/jewelry', 4, true)
on conflict (slug) do nothing;
