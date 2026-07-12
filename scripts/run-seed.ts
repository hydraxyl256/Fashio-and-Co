import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import crypto from 'node:crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase URL or Service Role Key in .env.local');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function uuid() {
  return crypto.randomUUID();
}

// --- Real, validated Unsplash photo IDs ---
// Women's fashion
const WOMENSWEAR_PHOTOS = [
  'photo-1515886657613-9f3515b0c78f', // fashion editorial
  'photo-1509631179647-0c37cb1700ee', // dress
  'photo-1550614000-4b95d4ed6032', // style
  'photo-1487222477894-8943e31ef7b2', // fashion
  'photo-1490481651871-ab68de25d43d', // women fashion
  'photo-1572804013309-59a88b7e92f1', // clothing
  'photo-1581044777550-4cfa60707c03', // dress editorial
  'photo-1566207274740-0f8cf6b7d5a5', // outfit
  'photo-1595777457583-95e059d581b8', // evening wear
  'photo-1602810316498-ab67cf68c8e1', // blazer
  'photo-1607522370275-f14206abe5d3', // trench coat
  'photo-1589810635657-232948472d98', // midi skirt
  'photo-1594938298603-c8148c4dae35', // jumpsuit
  'photo-1585487000160-6ebcfceb0d03', // white shirt
];

// Jewelry
const JEWELRY_PHOTOS = [
  'photo-1599643478524-fb524b0d0f72', // gold jewelry
  'photo-1611085583191-a3b181a88401', // necklace
  'photo-1535632066927-ab7c9ab60908', // earrings
  'photo-1602751584552-8ba73aad10e1', // bracelet
  'photo-1617038260897-41a1f14a8ca0', // ring
  'photo-1506630448388-4e683c67ddb0', // hoop earrings
  'photo-1573408301185-9519f94816b5', // pearl jewelry
  'photo-1627384113972-61f85b8e6bc4', // gold bangle
  'photo-1651152993793-af6d8e72f9e2', // chain necklace
  'photo-1583292650898-7d22cd27ca6f', // statement ring
];

function pickPhoto(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)];
}

const WOMENSWEAR_ID = 'eac8973b-40a2-4ffe-a50e-6ffd46d528eb';
const JEWELRY_ID = '19f28ebb-b54c-4cde-a88c-abce56190784';
const COLLECTION_ID = '18f8ab7a-9e04-4fe7-b943-7591ffb84da2'; // The Nairobi Edit

const womenswearNames = [
  'Satin Evening Dress',
  'Linen Wide-Leg Trousers',
  'Tailored Double-Breasted Blazer',
  'Silk Wrap Dress',
  'Classic White Shirt',
  'Pleated Midi Skirt',
  'Knit Lounge Set',
  'Structured Jumpsuit',
  'Cotton Poplin Maxi Dress',
  'Oversized Trench Coat'
];

const jewelryNames = [
  'Gold Hoop Earrings',
  'Pearl Drop Earrings',
  'Minimal Chain Necklace',
  'Layered Pendant Necklace',
  'Tennis Bracelet',
  'Gold Bangle',
  'Statement Ring',
  'Signet Ring',
  'Crystal Bracelet',
  'Layered Jewelry Set'
];

const WOMEN_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const WOMEN_COLORS = ['Black', 'Ivory', 'Beige', 'Olive', 'Navy', 'Burgundy'];
const JEWELRY_COLORS = ['Gold', 'Silver', 'Rose Gold'];

let productCount = 0;
let variantCount = 0;
let imageCount = 0;

async function generateProducts(names: string[], categoryId: string, sizes: string[], colors: string[], photoPool: string[]) {
  for (const name of names) {
    const id = uuid();
    const slug = faker.helpers.slugify(name).toLowerCase() + '-' + faker.string.alphanumeric(4);
    const price = faker.number.int({ min: 500000, max: 5000000 });
    
    const { error: pErr } = await supabase.from('products').insert({
      id,
      slug,
      name,
      short_description: faker.commerce.productDescription(),
      full_description: faker.lorem.paragraphs(2),
      category_id: categoryId,
      price_cents: price,
      currency: 'KES',
      care_instructions: 'Dry clean only.',
      fit_notes: 'True to size.',
      meta_title: name,
      meta_description: `Shop ${name}`,
      is_featured: faker.datatype.boolean(),
      is_active: true,
      published_at: new Date().toISOString()
    });

    if (pErr) {
      console.error('Error inserting product', name, pErr.message);
      continue;
    }
    productCount++;

    await supabase.from('product_collections').insert({
      product_id: id,
      collection_id: COLLECTION_ID
    });

    for (let i = 0; i < 3; i++) {
      const isCover = i === 0;
      // Use a real Unsplash photo from the appropriate pool
      const photoId = pickPhoto(photoPool);
      const url = `https://images.unsplash.com/${photoId}?w=1200&q=80`;
      
      const { error: iErr } = await supabase.from('product_images').insert({
        id: uuid(),
        product_id: id,
        storage_path: url,
        display_order: i,
        is_cover: isCover
      });
      if (!iErr) imageCount++;
    }

    const productColors = faker.helpers.arrayElements(colors, faker.number.int({ min: 1, max: 3 }));
    for (const color of productColors) {
      if (sizes.length > 0) {
        for (const size of sizes) {
          const sku = `${slug.substring(0, 8).toUpperCase()}-${color.substring(0,3).toUpperCase()}-${size}`;
          const stock = faker.number.int({ min: 0, max: 20 });
          const { error: vErr } = await supabase.from('product_variants').insert({
            id: uuid(),
            product_id: id,
            sku,
            size,
            color,
            stock_quantity: stock,
            reserved_quantity: 0,
            low_stock_threshold: 3,
            barcode: faker.string.numeric(12)
          });
          if (!vErr) variantCount++;
        }
      } else {
        const sku = `${slug.substring(0, 8).toUpperCase()}-${color.substring(0,3).toUpperCase()}-OS`;
        const stock = faker.number.int({ min: 0, max: 20 });
        const { error: vErr } = await supabase.from('product_variants').insert({
          id: uuid(),
          product_id: id,
          sku,
          color,
          stock_quantity: stock,
          reserved_quantity: 0,
          low_stock_threshold: 3,
          barcode: faker.string.numeric(12)
        });
        if (!vErr) variantCount++;
      }
    }
  }
}

async function main() {
  // First: delete the previously seeded (broken) products for these two categories
  console.log('Cleaning up previously seeded products...');
  const { data: toDelete } = await supabase
    .from('products')
    .select('id')
    .in('category_id', [WOMENSWEAR_ID, JEWELRY_ID]);
  
  if (toDelete && toDelete.length > 0) {
    const ids = toDelete.map(p => p.id);
    await supabase.from('product_images').delete().in('product_id', ids);
    await supabase.from('product_variants').delete().in('product_id', ids);
    await supabase.from('product_collections').delete().in('product_id', ids);
    await supabase.from('products').delete().in('id', ids);
    console.log(`Deleted ${ids.length} old products.`);
  }

  console.log('Seeding Womenswear...');
  await generateProducts(womenswearNames, WOMENSWEAR_ID, WOMEN_SIZES, WOMEN_COLORS, WOMENSWEAR_PHOTOS);
  
  console.log('Seeding Jewelry...');
  await generateProducts(jewelryNames, JEWELRY_ID, [], JEWELRY_COLORS, JEWELRY_PHOTOS);
  
  console.log(`Done! Generated ${productCount} products, ${variantCount} variants, and ${imageCount} images.`);
}

main().catch(console.error);
