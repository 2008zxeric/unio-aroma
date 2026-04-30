/**
 * 从 Supabase 导出所有首页数据为静态 JSON 文件
 * 运行：node scripts/fetch-static-data.cjs
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1aWNqeWRndG9sdGRoa2Jxb2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxNjU5NjAsImV4cCI6MjA0NDc0MTk2MH0.7E-VPqi7m9WbCWw96jbEeVdVBVrwubIjAGEB-_MV5ng';

async function fetchTable(table, params) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    if (params) {
      params.forEach(([k, v]) => url.searchParams.set(k, v));
    }
    https.get(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const outDir = path.join(__dirname, '..', 'src', 'site', 'data');
  fs.mkdirSync(outDir, { recursive: true });

  console.log('📦 正在从 Supabase 拉取数据...');

  // 获取所有数据
  const [series, products, countries] = await Promise.all([
    fetchTable('series', [['is_active', 'eq.true'], ['order', 'sort_order.asc']]),
    fetchTable('products', [['is_active', 'eq.true'], ['order', 'sort_order.asc'], ['limit', '200']]),
    fetchTable('countries', [['is_active', 'eq.true'], ['order', 'sort_order.asc'], ['limit', '200']]),
  ]);

  console.log(`✅ 系列: ${series.length} 条`);
  console.log(`✅ 产品: ${products.length} 条`);
  console.log(`✅ 国家: ${countries.length} 条`);

  // 导出为 JSON
  fs.writeFileSync(path.join(outDir, 'static-series.json'), JSON.stringify(series, null, 2));
  fs.writeFileSync(path.join(outDir, 'static-products.json'), JSON.stringify(products, null, 2));
  fs.writeFileSync(path.join(outDir, 'static-countries.json'), JSON.stringify(countries, null, 2));

  // 导出为 JS module（可以直接 import）
  const jsContent = `
// 自动生成 - 从 Supabase 导出的静态数据备份
// 生成时间: ${new Date().toISOString()}
// 用途: 首页快速加载，避免 Supabase 跨太平洋延迟

import { Product, Series, Country } from '../types';

export const staticSeries: Series[] = ${JSON.stringify(series, null, 2)};

export const staticProducts: Product[] = ${JSON.stringify(products, null, 2)};

export const staticCountries: Country[] = ${JSON.stringify(countries, null, 2)};
`;
  fs.writeFileSync(path.join(outDir, 'staticData.ts'), jsContent);

  console.log('\n✅ 静态数据已导出到 src/site/data/staticData.ts');
  console.log('   首页可直接 import 使用，无需等待 Supabase 请求');
}

main().catch(err => {
  console.error('❌ 导出失败:', err.message);
  process.exit(1);
});
