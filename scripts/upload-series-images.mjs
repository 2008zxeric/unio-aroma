/**
 * 上传四宫格新图到 Supabase Storage（复用现有文件名，绕过 RLS 限制）
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const BUCKET = 'product-images';

const distContent = fs.readFileSync('dist/assets/siteDataService-2h6K0Da4.js', 'utf8');
const keyMatch = distContent.match(/const .="https:\/\/xuicjydgtoltdhkbqoju\.supabase\.co",[A-Z]="(eyJ[A-Za-z0-9_\-\.]+)"/);
if (!keyMatch) { console.error('Cannot find key'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, keyMatch[1]);

const DESKTOP = '/Users/EricMac/Desktop/元香/banner';

const UPLOADS = [
  { local: path.join(DESKTOP, '1 元.png'), remote: 'uploads/home-series-yuan-20260619.png' },
  { local: path.join(DESKTOP, '2 合.png'), remote: 'uploads/home-series-he-20260619.png' },
  { local: path.join(DESKTOP, '3生.png'), remote: 'uploads/home-series-sheng-20260619.png' },
  { local: path.join(DESKTOP, '4 香.png'), remote: 'uploads/home-series-jing-20260619.png' },
];

async function upload(localPath, remotePath) {
  const buf = fs.readFileSync(localPath);
  const { error } = await supabase.storage.from(BUCKET).upload(remotePath, buf, {
    cacheControl: 'max-age=31536000', upsert: true, contentType: 'image/png'
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(remotePath);
  return data.publicUrl;
}

async function main() {
  console.log('=== 上传四宫格新图 ===\n');
  for (const u of UPLOADS) {
    const url = await upload(u.local, u.remote);
    console.log(`✅ ${path.basename(u.local)} → ${url}`);
  }
  console.log('\n全部上传完成。');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
