/**
 * Update banners table using service key (bypasses RLS)
 * Extends the key from scripts/add_created_by.mjs
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';

// Read the service key from add_created_by.mjs
const srcFile = fs.readFileSync('scripts/add_created_by.mjs', 'utf8');
const keyMatch = srcFile.match(/const SERVICE_KEY = '(eyJ[A-Za-z0-9_\-\.]+)'/);
if (!keyMatch) { console.error('Cannot find service key'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, keyMatch[1]);

const UPDATES = [
  { name: 'home_hero', url: 'https://xuicjydgtoltdhkbqoju.supabase.co/storage/v1/object/public/product-images/uploads/home-hero-20260619.png' },
  { name: 'home_series_yuan', url: 'https://xuicjydgtoltdhkbqoju.supabase.co/storage/v1/object/public/product-images/uploads/home-series-yuan-20260619.png' },
  { name: 'home_series_he', url: 'https://xuicjydgtoltdhkbqoju.supabase.co/storage/v1/object/public/product-images/uploads/home-series-he-20260619.png' },
  { name: 'home_series_sheng', url: 'https://xuicjydgtoltdhkbqoju.supabase.co/storage/v1/object/public/product-images/uploads/home-series-sheng-20260619.png' },
  { name: 'home_series_jing', url: 'https://xuicjydgtoltdhkbqoju.supabase.co/storage/v1/object/public/product-images/uploads/home-series-jing-20260619.png' },
];

async function main() {
  console.log('=== 更新 Banners 表 (service key) ===\n');
  for (const u of UPDATES) {
    // Try upsert: check exists first
    const { data: existing } = await supabase.from('banners').select('id').eq('name', u.name).limit(1);
    if (existing && existing.length > 0) {
      const { error } = await supabase.from('banners').update({ image_url: u.url, is_active: true }).eq('name', u.name);
      if (error) { console.log(`❌ UPDATE ${u.name}: ${error.message}`); }
      else { console.log(`✅ UPDATED ${u.name}`); }
    } else {
      const { error } = await supabase.from('banners').insert({ name: u.name, image_url: u.url, is_active: true, position: 'home' });
      if (error) { console.log(`❌ INSERT ${u.name}: ${error.message}`); }
      else { console.log(`✅ INSERTED ${u.name}`); }
    }
  }
  console.log('\nDone');
}
main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
