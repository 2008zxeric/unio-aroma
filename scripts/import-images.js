/**
 * 批量导入图片URL到Supabase
 * 产品图片、国家图片、省份图片一次搞定
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1aWNqeWRndG9sdGRoa2Jxb2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MzI2NjgsImV4cCI6MjA5MTEwODY2OH0.7E-VPqi7m9WbCWw96jbEeVdVBVrwubIjAGEB-_MV5ng';
const GITHUB_RAW = 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/feature/supabase/assets';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const assetsDir = path.join(__dirname, 'assets');

async function main() {
  console.log('=== 开始批量导入图片URL ===\n');

  // 1. 导入产品图片
  await importProductImages();

  // 2. 导入国家/省份图片
  await importCountryImages();

  console.log('\n=== 全部完成 ===');
}

async function importProductImages() {
  console.log('--- 产品图片 ---');
  
  // 获取所有产品
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name_en, code, category, series_code, image_url')
    .eq('is_active', true);

  if (error) { console.error('获取产品失败:', error); return; }
  console.log(`共 ${products.length} 个产品\n`);

  // 文件夹名映射: category英文key -> assets文件夹名
  const categoryFolderMap = {
    'jin': 'metal',
    'mu': 'wood',
    'shui': 'water',
    'huo': 'fire',
    'tu': 'earth',
    'body': 'body',
    'mind': 'heart',
    'soul': 'soul',
    'clear': 'place',
    'nourish': 'place',
    'soothe': 'place',
    'aesthetic': 'place',
    'meditation': 'Meditation',
  };

  let updated = 0;
  let notFound = [];

  for (const product of products) {
    // 跳过已有图片的
    if (product.image_url) continue;

    const folder = categoryFolderMap[product.category];
    if (!folder) {
      notFound.push(`${product.name_en} (${product.category}: 无对应文件夹)`);
      continue;
    }

    const folderPath = path.join(assetsDir, 'products', folder);
    if (!fs.existsSync(folderPath)) {
      notFound.push(`${product.name_en} (文件夹不存在: ${folder})`);
      continue;
    }

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.webp'));
    
    // 尝试匹配: 用 name_en 的各个单词匹配文件名
    const nameWords = product.name_en.toLowerCase().split(/\s+/);
    const matchedFile = files.find(f => {
      const fname = f.toLowerCase().replace(/\.webp$/, '');
      // 精确匹配
      if (fname === product.name_en.toLowerCase()) return true;
      // 至少2个关键单词匹配
      const matchCount = nameWords.filter(w => w.length > 2 && fname.includes(w)).length;
      return matchCount >= 2;
    });

    if (matchedFile) {
      const imageUrl = `${GITHUB_RAW}/products/${folder}/${encodeURIComponent(matchedFile)}`;
      const { error: updateErr } = await supabase
        .from('products')
        .update({ image_url: imageUrl })
        .eq('id', product.id);
      
      if (updateErr) {
        console.error(`  ❌ ${product.name_en}: 更新失败`, updateErr.message);
      } else {
        console.log(`  ✅ ${product.name_en} → ${matchedFile}`);
        updated++;
      }
    } else {
      notFound.push(`${product.name_en} (${folder}: ${files.join(', ')})`);
    }
  }

  console.log(`\n产品图片更新: ${updated} 个`);
  if (notFound.length > 0) {
    console.log(`未匹配 (${notFound.length}):`);
    notFound.forEach(n => console.log(`  ⚠️ ${n}`));
  }
}

async function importCountryImages() {
  console.log('\n--- 国家/省份图片 ---');
  
  const { data: countries, error } = await supabase
    .from('countries')
    .select('id, name_cn, name_en, region, image_url, is_active');

  if (error) { console.error('获取国家失败:', error); return; }
  console.log(`共 ${countries.length} 个国家/地区\n`);

  // 先处理全球国家 (destinations文件夹)
  const destFiles = fs.existsSync(path.join(assetsDir, 'destinations'))
    ? fs.readdirSync(path.join(assetsDir, 'destinations')).filter(f => f.endsWith('.webp'))
    : [];

  // 省份文件夹
  const provFiles = fs.existsSync(path.join(assetsDir, 'province'))
    ? fs.readdirSync(path.join(assetsDir, 'province')).filter(f => f.endsWith('.webp'))
    : [];

  let updated = 0;
  let notFound = [];

  for (const country of countries) {
    if (country.image_url) continue;

    let imageUrl = null;

    if (country.region === '神州') {
      // 省份: 匹配拼音
      const matched = provFiles.find(f => {
        const base = f.toLowerCase().replace(/\.webp$/, '');
        return base === country.name_en?.toLowerCase() || 
               base === country.name_cn?.toLowerCase() ||
               country.name_en?.toLowerCase().includes(base);
      });
      if (matched) {
        imageUrl = `${GITHUB_RAW}/province/${encodeURIComponent(matched)}`;
      }
    } else {
      // 全球国家: 匹配英文名
      const matched = destFiles.find(f => {
        const base = f.toLowerCase().replace(/\.webp$/, '').replace(/\s+/g, '');
        const nameBase = country.name_en?.toLowerCase().replace(/\s+/g, '');
        return base === nameBase || (nameBase && nameBase.startsWith(base)) || base.startsWith(nameBase || '');
      });
      if (matched) {
        imageUrl = `${GITHUB_RAW}/destinations/${encodeURIComponent(matched)}`;
      }
    }

    if (imageUrl) {
      const { error: updateErr } = await supabase
        .from('countries')
        .update({ image_url: imageUrl })
        .eq('id', country.id);
      
      if (updateErr) {
        console.error(`  ❌ ${country.name_cn}: 更新失败`, updateErr.message);
      } else {
        console.log(`  ✅ ${country.name_cn} (${country.region})`);
        updated++;
      }
    } else {
      notFound.push(`${country.name_cn} (${country.name_en})`);
    }
  }

  console.log(`\n国家/地区图片更新: ${updated} 个`);
  if (notFound.length > 0) {
    console.log(`未匹配 (${notFound.length}):`);
    notFound.forEach(n => console.log(`  ⚠️ ${n}`));
  }
}

main().catch(console.error);
