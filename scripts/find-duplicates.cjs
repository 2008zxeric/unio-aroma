/**
 * 从 Supabase 拉取全量产品并分析重复/相似
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://xuicjydgtoltdhkbqoju.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1aWNqeWRndG9sdGRoa2Jxb2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MzI2NjgsImV4cCI6MjA5MTEwODY2OH0.7E-VPqi7m9WbCWw96jbEeVdVBVrwubIjAGEB-_MV5ng'
);

// 提取核心植物名（去除前缀/后缀/括号内容）
function extractCoreName(name) {
  if (!name) return '';
  return name
    .replace(/[\(（].*?[\)）]/g, '')   // 去掉括号及内容
    .replace(/\/.*$/, '')              // 去掉斜杠后的内容
    .replace(/(有机|ORC|ORG|高地|法国|双|ISO级|原精|净油|I段|III段|Extra|完全|特级|纯正|升级版|测试)$/gi, '')
    .replace(/^(真正|完全|特级|野生|有机|纯正|双|大西洋)/g, '')
    .trim();
}

async function main() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, code, name_cn, name_en, display_name, series_code, category, is_active')
    .order('code', { ascending: true });

  if (error) { console.error('查询失败:', error); process.exit(1); }

  console.log(`\n📊 共 ${products.length} 个产品（含已下架）\n`);

  // 按"核心植物名"分组
  const groups = {};
  products.forEach(p => {
    const core = extractCoreName(p.name_cn);
    if (!core || core.length < 2) return;
    
    const key = core.replace(/\s/g, ''); // 去空格做key
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });

  // 找出有重复的组（同组 > 1 个）
  const duplicates = Object.entries(groups).filter(([k, list]) => list.length > 1);
  
  console.log(`🔍 发现 ${duplicates.length} 组可能重复的产品：\n`);
  
  let totalToDeactivate = 0;
  
  for (const [coreName, items] of duplicates.sort()) {
    // 排序：优先保留 is_active 的、code 更短的/更规范的
    const sorted = [...items].sort((a, b) => {
      // 已上架的排前面
      if (a.is_active !== b.is_active) return b.is_active ? 1 : -1;
      // AL/AU 等新版编码优先
      if (a.code?.length !== b.code?.length) return a.code.length - b.code.length;
      // name_cn 较短的优先
      return a.name_cn.length - b.name_cn.length;
    });
    
    const keep = sorted[0];
    const toDeactivate = sorted.slice(1);
    
    totalToDeactivate += toDeactivate.length;

    console.log(`═══════════════════════════════════════`);
    console.log(`🌿 重复组: ${coreName} (${items.length}个)`);
    console.log(`  ✅ 保留: [${keep.code}] ${keep.name_cn} (${keep.is_active ? '上架' : '下架'}) | 系列:${keep.series_code} | id:${keep.id}`);
    for (const item of toDeactivate) {
      console.log(`  ⬜ 下架: [${item.code}] ${item.name_cn} (${item.is_active ? '上架' : '下架'}) | 系列:${item.series_code} | id:${item.id}`);
    }
    console.log('');
  }

  // 也列出所有产品概览（保存到文件）
  const summary = {
    total: products.length,
    active: products.filter(p => p.is_active).length,
    inactive: products.filter(p => !p.is_active).length,
    duplicateGroups: duplicates.length,
    totalToDeactivate,
    allProducts: products.map(p => ({
      code: p.code,
      name_cn: p.name_cn,
      name_en: p.name_en,
      display_name: p.display_name,
      series: p.series_code,
      category: p.category,
      active: p.is_active,
      id: p.id
    }))
  };

  fs.writeFileSync('/tmp/unio-products-dup-analysis.json', JSON.stringify(summary, null, 2));
  console.log(`\n📁 完整数据已导出到 /tmp/unio-products-dup-analysis.json`);
  console.log(`\n📈 统计:`);
  console.log(`  总产品数: ${summary.total}`);
  console.log(`  上架中: ${summary.active}`);
  console.log(`  已下架: ${summary.inactive}`);
  console.log(`  重复组: ${summary.duplicateGroups}`);
  console.log(`  需下架: ${totalToDeactivate}`);
}

main().catch(console.error);
