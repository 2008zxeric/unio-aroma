// 按 series_code 正确分组的产品清单
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://xuicjydgtoltdhkbqoju.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1aWNqeWRndG9sdGRoa2Jxb2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MzI2NjgsImV4cCI6MjA5MTEwODY2OH0.7E-VPqi7m9WbCWw96jbEeVdVBVrwubIjAGEB-_MV5ng'
);

// 系列 display name 映射
const SERIES_NAMES = {
  'Yuan': '元和 · 精油',
  'Heng': '恒 · 复方',
  'Sheng': '生 · 纯露',
  'Jing': '境 · 香道',
};

// 子分类名映射
const CAT_NAMES = {
  'jin': '金',
  'huo': '火',
  'mu': '木',
  'shui': '水',
  'tu': '土',
};

function getSeriesName(code) {
  // 从 series_code 字段推断
  if (!code) return '未分类';
  const lower = code.toLowerCase();
  if (lower.includes('yuan') || lower === 'yuan') return '元和 · 精油';
  if (lower.includes('heng') || lower === 'heng') return '恒 · 复方';
  if (lower.includes('sheng') || lower === 'sheng') return '生 · 纯露';
  if (lower.includes('jing') || lower === 'jing') return '境 · 香道';
  return code;
}

function getPriceStr(p) {
  const fields = [
    { key: 'price_30ml', label: '30ml' },
    { key: 'price_10ml', label: '10ml' },
    { key: 'price_15ml', label: '15ml' },
    { key: 'price_50ml', label: '50ml' },
    { key: 'price_100ml', label: '100ml' },
    { key: 'price_250ml', label: '250ml' },
    { key: 'price_500ml', label: '500ml' },
    { key: 'price_1000ml', label: '1000ml' },
  ];
  for (const f of fields) {
    if (p[f.key]) return `¥${p[f.key]}/${f.label}`;
  }
  if (p.price) return `¥${p.price}`;
  return '-';
}

async function main() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('code');
  
  if (error) { console.error(error); return; }
  
  let md = `# UNIO AROMA 上架产品清单\n\n`;
  md += `> 导出时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n`;
  md += `> 总计：**${products.length}** 个上架产品\n\n`;

  // === 按四大系列分组 ===
  const seriesGroups = {
    '元和': [],   // series_code = yuan
    '恒': [],     // series_code = heng  
    '生': [],     // series_code = sheng
    '境': [],     // series_code = jing
  };
  
  products.forEach(p => {
    const sc = (p.series_code || '').toLowerCase();
    if (sc.includes('yuan')) seriesGroups['元和'].push(p);
    else if (sc.includes('heng')) seriesGroups['恒'].push(p);
    else if (sc.includes('sheng')) seriesGroups['生'].push(p);
    else if (sc.includes('jing')) seriesGroups['境'].push(p);
    else seriesGroups['元和'].push(p); // fallback
  });
  
  // 元和系列：按五行子分类
  for (const [serName, items] of Object.entries(seriesGroups)) {
    md += `## ${serName}（${items.length}个）\n\n`;
    
    if (serName === '元和') {
      // 元和内部分五行
      const wuxing = { '金': [], '火': [], '木': [], '水': [], '土': [] };
      items.forEach(p => {
        const cat = (p.category || '').toLowerCase();
        if (cat && wuxing[CAT_NAMES[cat]]) wuxing[CAT_NAMES[cat]].push(p);
        else wuxing['金'].push(p); // default fallback
      });
      
      for (const [wxName, wxItems] of Object.entries(wuxing)) {
        if (wxItems.length === 0) continue;
        md += `### 五行·${wxName}（${wxItems.length}个）\n\n`;
        md += `| # | Code | 产品名称 | 规格 | 参考售价 |\n|---|------|---------|------|----------|\n`;
        wxItems.forEach((p, i) => {
          md += `| ${i+1} | ${p.code} | ${p.name_cn} | ${p.specification || '-'} | ${getPriceStr(p)} |\n`;
        });
        md += `\n`;
      }
    } else {
      md += `| # | Code | 产品名称 | 规格 | 参考售价 |\n|---|------|---------|------|----------|\n`;
      items.forEach((p, i) => {
        md += `| ${i+1} | ${p.code} | ${p.name_cn} | ${p.specification || '-'} | ${getPriceStr(p)} |\n`;
      });
      md += `\n`;
    }
  }

  fs.writeFileSync('/Users/EricMac/WorkBuddy/20260420084631/product-list.md', md, 'utf-8');
  console.log(`✅ 已导出 product-list.md (${products.length} 个产品)`);
}

main();
