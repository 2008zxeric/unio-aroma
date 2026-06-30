/**
 * 上传正确的四宫格图片（桌面直放，非banner子目录）
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const BUCKET = 'product-images';

// Service key for banners table write
const srcFile = fs.readFileSync('scripts/add_created_by.mjs', 'utf8');
const keyMatch = srcFile.match(/const SERVICE_KEY = '(eyJ[A-Za-z0-9_\-\.]+)'/);
if (!keyMatch) { console.error('No service key'); process.exit(1); }
const supabase = createClient(SUPABASE_URL, keyMatch[1]);

const DESKTOP = '/Users/EricMac/Desktop';

const UPLOADS = [
  { local: path.join(DESKTOP, '1 元.png'), remote: 'uploads/home-series-yuan-20260619v2.png', bk: 'home_series_yuan' },
  { local: path.join(DESKTOP, '2 合.png'), remote: 'uploads/home-series-he-20260619v2.png',   bk: 'home_series_he' },
  { local: path.join(DESKTOP, '3 生.png'), remote: 'uploads/home-series-sheng-20260619v2.png', bk: 'home_series_sheng' },
  { local: path.join(DESKTOP, '4 香.png'), remote: 'uploads/home-series-jing-20260619v2.png',  bk: 'home_series_jing' },
];

async function main() {
  console.log('=== 上传四宫格新图（桌面直放版）===\n');
  for (const u of UPLOADS) {
    // Upload
    const buf = fs.readFileSync(u.local);
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(u.remote, buf, {
      cacheControl: 'max-age=31536000', upsert: true, contentType: 'image/png'
    });
    if (upErr) { console.log(`❌ Upload ${u.bk}: ${upErr.message}`); continue; }
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(u.remote);
    const url = urlData.publicUrl;
    console.log(`📤 ${path.basename(u.local)} → uploaded`);
    
    // Update banner
    const { error: bErr } = await supabase.from('banners').update({ image_url: url }).eq('name', u.bk);
    if (bErr) { console.log(`  ❌ Banner update: ${bErr.message}`); }
    else { console.log(`  ✅ Banner updated → ${url}`); }
  }
  console.log('\nDone. Now update code fallbacks + deploy.');
}
main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
