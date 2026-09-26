import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const EAN12_PREFIX = "200";
const RANDOM_DIGITS_COUNT = 9;

function generateRandomEan12() {
  let result = EAN12_PREFIX;
  for (let index = 0; index < RANDOM_DIGITS_COUNT; index += 1) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

function calculateEan13CheckDigit(ean12) {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(ean12[i]) * (i % 2 === 0 ? 1 : 3);
  }
  return ((10 - (sum % 10)) % 10).toString();
}

function buildProductQrData(payload) {
  return JSON.stringify({
    id: payload.id,
    name: payload.name,
    price: payload.price,
  });
}

const products = [
  { name: 'Wai Wai Noodles (75g)', name_np: 'वाई वाई नूडल्स (७५जी)', price: 30, category: 'Food', stock: 100, low_stock_threshold: 20, vat_applicable: true },
  { name: 'Dairy Milk Silk 150g', name_np: 'डेरि मिल्क सिल्क १५०जी', price: 350, category: 'Food', stock: 50, low_stock_threshold: 10, vat_applicable: true },
  { name: 'Amul Butter 500g', name_np: 'अमुल बटर ५००जी', price: 600, category: 'Food', stock: 30, low_stock_threshold: 5, vat_applicable: true },
  { name: 'Chaudhary Masala 50g', name_np: 'चौधरी मसला ५०जी', price: 25, category: 'Food', stock: 200, low_stock_threshold: 30, vat_applicable: true },
  { name: 'Coca Cola 500ml', name_np: 'कोका कोला ५००मि.ली.', price: 80, category: 'Beverages', stock: 80, low_stock_threshold: 15, vat_applicable: true },
  { name: 'Himalayan Water 1L', name_np: 'हिमालयन पानी १L', price: 40, category: 'Beverages', stock: 120, low_stock_threshold: 25, vat_applicable: false },
  { name: 'Ncell Recharge 100', name_np: 'एनसेल रिचार्ज १००', price: 100, category: 'Telco', stock: 500, low_stock_threshold: 50, vat_applicable: false },
  { name: 'Ntc Recharge 200', name_np: 'एनटिसी रिचार्ज २००', price: 200, category: 'Telco', stock: 500, low_stock_threshold: 50, vat_applicable: false },
  { name: 'Dettol Soap 100g', name_np: 'डेटोल साबुन १००जी', price: 95, category: 'Personal Care', stock: 60, low_stock_threshold: 10, vat_applicable: true },
  { name: 'Colgate Toothpaste 100g', name_np: 'कोलगेट टूथपेस्ट १००जी', price: 180, category: 'Personal Care', stock: 40, low_stock_threshold: 8, vat_applicable: true },
];

async function seed() {
  console.log('Seeding products...');
  
  for (const p of products) {
    const ean12 = generateRandomEan12();
    const barcode = ean12 + calculateEan13CheckDigit(ean12);
    const qr_data = buildProductQrData({ name: p.name, price: p.price, category: p.category });
    
    const { error } = await supabase
      .from('products')
      .upsert({
        ...p,
        barcode,
        qr_data,
      }, { onConflict: 'barcode' });
    
    if (error) {
      console.error(`Failed to insert ${p.name}:`, error.message);
    } else {
      console.log(`Inserted: ${p.name} (${barcode})`);
    }
  }
  
  console.log('Done!');
}

seed().catch(console.error);