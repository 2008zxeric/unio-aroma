/**
 * 上传新首页图片到 Supabase Storage + 更新 banners 表
 * 用法: node scripts/upload-home-images.mjs
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const BUCKET = 'product-images';

// Read key from dist
const distContent = fs.readFileSync('dist/assets/siteDataService-2h6K0Da4.js', 'utf8');
const keyMatch = distContent.match(/const .="https:\/\/xuicjydgtoltdhkbqoju\.supabase\.co",[A-Z]="(eyJ[A-Za-z0-9_\-\.]+)"/);
if (!keyMatch) { console.error('Cannot find Supabase key in dist'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, keyMatch[1]);

const DESKTOP = '/Users/EricMac/Desktop/元香/banner';

// 四宫格图片映射
const SERIES_UPLOADS = [
  { local: path.join(DESKTOP, '1 元.png'), remote: 'uploads/home-series-yuan-20260614.png', bannerKey: 'home_series_yuan' },
  { local: path.join(DESKTOP, '2 合.png'), remote: 'uploads/home-series-he-20260614.png',   bannerKey: 'home_series_he' },
  { local: path.join(DESKTOP, '3生.png'), remote: 'uploads/home-series-sheng-20260614.png', bannerKey: 'home_series_sheng' },
  { local: path.join(DESKTOP, '4 香.png'), remote: 'uploads/home-series-jing-20260614.png',  bannerKey: 'home_series_jing' },
];

// Hero 图片
const HERO_UPLOAD = {
  local: '/Users/EricMac/Desktop/元香/大首页.png',
  remote: 'uploads/home-hero-20260619.png',
  bannerKey: 'home_hero'
};

async function uploadFile(localPath, remotePath) {
  const fileBuffer = fs.readFileSync(localPath);
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(remotePath, fileBuffer, {
      cacheControl: 'max-age=31536000',
      upsert: true,
      contentType: 'image/png'
    });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(remotePath);
  return urlData.publicUrl;
}

async function upsertBanner(key, imageUrl) {
  // Check if exists
  const { data: existing } = await supabase.from('banners').select('id').eq('name', key).limit(1);
  if (existing && existing.length > 0) {
    const { error } = await supabase.from('banners')
      .update({ image_url: imageUrl, is_active: true })
      .eq('name', key);
    if (error) throw error;
    return 'updated';
  } else {
    const { error } = await supabase.from('banners')
      .insert({ name: key, image_url: imageUrl, is_active: true, position: 'home' });
    if (error) throw error;
    return 'created';
  }
}

async function main() {
  console.log('=== 上传首页图片到 Supabase ===\n');

  // 1. Upload hero
  console.log('📤 Hero 图:', HERO_UPLOAD.local);
  const heroUrl = await uploadFile(HERO_UPLOAD.local, HERO_UPLOAD.remote);
  const heroAction = await upsertBanner(HERO_UPLOAD.bannerKey, heroUrl);
  console.log(`   ✅ ${heroAction} → ${heroUrl}\n`);

  // 2. Upload series images
  for (const s of SERIES_UPLOADS) {
    console.log(`📤 ${s.bannerKey}:`, s.local);
    const url = await uploadFile(s.local, s.remote);
    const action = await upsertBanner(s.bannerKey, url);
    console.log(`   ✅ ${action} → ${url}`);
  }

  console.log('\n=== 全部完成 ===');
  console.log('现在需要修改代码去掉 hero 硬编码兜底 URL，然后构建部署。');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
