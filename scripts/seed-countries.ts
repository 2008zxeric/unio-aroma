/**
 * 国家预录入脚本
 * 用法: npx tsx scripts/seed-countries.ts
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1aWNqeWRndG9sdGRoa2Jxb2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MzI2NjgsImV4cCI6MjA5MTEwODY2OH0.7E-VPqi7m9WbCWw96jbEeVdVBVrwubIjAGEB-_MV5ng';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 55个国家/地区 — 覆盖所有精油产地 + COMMON_ORIGINS
const COUNTRIES = [
  // === 欧洲 ===
  { name_cn: '法国', name_en: 'France', region: '欧洲', sub_region: '西欧', sort_order: 1 },
  { name_cn: '意大利', name_en: 'Italy', region: '欧洲', sub_region: '南欧', sort_order: 2 },
  { name_cn: '德国', name_en: 'Germany', region: '欧洲', sub_region: '西欧', sort_order: 3 },
  { name_cn: '保加利亚', name_en: 'Bulgaria', region: '欧洲', sub_region: '东欧', sort_order: 4 },
  { name_cn: '英国', name_en: 'United Kingdom', region: '欧洲', sub_region: '西欧', sort_order: 5 },
  { name_cn: '西班牙', name_en: 'Spain', region: '欧洲', sub_region: '南欧', sort_order: 6 },
  { name_cn: '克罗地亚', name_en: 'Croatia', region: '欧洲', sub_region: '南欧', sort_order: 7 },
  { name_cn: '乌克兰', name_en: 'Ukraine', region: '欧洲', sub_region: '东欧', sort_order: 8 },
  { name_cn: '希腊', name_en: 'Greece', region: '欧洲', sub_region: '南欧', sort_order: 9 },
  { name_cn: '奥地利', name_en: 'Austria', region: '欧洲', sub_region: '中欧', sort_order: 10 },

  // === 亚洲 ===
  { name_cn: '印度', name_en: 'India', region: '亚洲', sub_region: '南亚', sort_order: 11 },
  { name_cn: '中国', name_en: 'China', region: '神州', sub_region: '', sort_order: 12 },
  { name_cn: '斯里兰卡', name_en: 'Sri Lanka', region: '亚洲', sub_region: '南亚', sort_order: 13 },
  { name_cn: '越南', name_en: 'Vietnam', region: '亚洲', sub_region: '东南亚', sort_order: 14 },
  { name_cn: '印度尼西亚', name_en: 'Indonesia', region: '亚洲', sub_region: '东南亚', sort_order: 15 },
  { name_cn: '日本', name_en: 'Japan', region: '亚洲', sub_region: '东亚', sort_order: 16 },
  { name_cn: '伊朗', name_en: 'Iran', region: '亚洲', sub_region: '西亚', sort_order: 17 },
  { name_cn: '也门', name_en: 'Yemen', region: '亚洲', sub_region: '西亚', sort_order: 18 },
  { name_cn: '以色列', name_en: 'Israel', region: '亚洲', sub_region: '西亚', sort_order: 19 },
  { name_cn: '尼泊尔', name_en: 'Nepal', region: '亚洲', sub_region: '南亚', sort_order: 20 },
  { name_cn: '阿富汗', name_en: 'Afghanistan', region: '亚洲', sub_region: '中亚', sort_order: 21 },

  // === 非洲 ===
  { name_cn: '埃及', name_en: 'Egypt', region: '非洲', sub_region: '北非', sort_order: 22 },
  { name_cn: '摩洛哥', name_en: 'Morocco', region: '非洲', sub_region: '北非', sort_order: 23 },
  { name_cn: '马达加斯加', name_en: 'Madagascar', region: '非洲', sub_region: '东非', sort_order: 24 },
  { name_cn: '南非', name_en: 'South Africa', region: '非洲', sub_region: '南非', sort_order: 25 },
  { name_cn: '肯尼亚', name_en: 'Kenya', region: '非洲', sub_region: '东非', sort_order: 26 },
  { name_cn: '阿尔及利亚', name_en: 'Algeria', region: '非洲', sub_region: '北非', sort_order: 27 },
  { name_cn: '突尼斯', name_en: 'Tunisia', region: '非洲', sub_role: '北非', sort_order: 28 },
  { name_cn: '科摩罗', name_en: 'Comoros', region: '非洲', sub_region: '东非', sort_order: 29 },
  { name_cn: '埃塞俄比亚', name_en: 'Ethiopia', region: '非洲', sub_region: '东非', sort_order: 30 },

  // === 美洲 / 大洋洲 ===
  { name_cn: '美国', name_en: 'United States', region: '美洲', sub_region: '北美', sort_order: 31 },
  { name_cn: '巴西', name_en: 'Brazil', region: '美洲', sub_region: '南美', sort_order: 32 },
  { name_cn: '澳大利亚', name_en: 'Australia', region: '大洋洲', sub_region: '', sort_order: 33 },
  { name_cn: '新西兰', name_en: 'New Zealand', region: '大洋洲', sub_region: '', sort_order: 34 },
  { name_cn: '加拿大', name_en: 'Canada', region: '美洲', sub_region: '北美', sort_order: 35 },
  { name_cn: '危地马拉', name_en: 'Guatemala', region: '美洲', sub_region: '中美', sort_order: 36 },
  { name_cn: '牙买加', name_en: 'Jamaica', region: '美洲', sub_region: '加勒比', sort_order: 37 },
  { name_cn: '海地', name_en: 'Haiti', region: '美洲', sub_region: '加勒比', sort_order: 38 },
  { name_cn: '秘鲁', name_en: 'Peru', region: '美洲', sub_region: '南美', sort_order: 39 },
  { name_cn: '阿根廷', name_en: 'Argentina', region: '美洲', sub_region: '南美', sort_order: 40 },

  // === 神州（中国省份）===
  { name_cn: '云南', name_en: 'Yunnan', region: '神州', sub_region: '西南', sort_order: 50 },
  { name_cn: '新疆', name_en: 'Xinjiang', region: '神州', sub_region: '西北', sort_order: 51 },
  { name_cn: '广西', name_en: 'Guangxi', region: '神州', sub_region: '华南', sort_order: 52 },
  { name_cn: '广东', name_en: 'Guangdong', region: '神州', sub_region: '华南', sort_order: 53 },
  { name_cn: '浙江', name_en: 'Zhejiang', region: '神州', sub_region: '华东', sort_order: 54 },
];

async function main() {
  console.log('🌍 开始预录入国家数据...\n');

  // 先检查现有数量
  const { count: existing } = await supabase.from('countries').select('*', { count: 'exact', head: true });
  console.log(`📊 当前国家表已有 ${existing} 条记录\n`);

  if (existing && existing > 0) {
    console.log('⚠️ 国家表已有数据，跳过预录入。如需重新导入请先清空 countries 表。\n');
    process.exit(0);
  }

  let success = 0;
  let failed = 0;

  // 分批插入（每批10条）
  for (let i = 0; i < COUNTRIES.length; i += 10) {
    const batch = COUNTRIES.slice(i, i + 10).map(c => ({
      name_cn: c.name_cn,
      name_en: c.name_en,
      region: c.region,
      sub_region: c.sub_region || null,
      is_active: true,
      sort_order: c.sort_order,
      visit_count: 0,
      unlock_code: '0',
    }));

    const { error } = await supabase.from('countries').insert(batch);
    if (error) {
      console.error(`❌ 批次 ${Math.floor(i/10)+1} 失败:`, error.message);
      failed += batch.length;
    } else {
      success += batch.length;
      console.log(`✅ 批次 ${Math.floor(i/10)+1}: ${batch.length} 条成功`);
    }
  }

  console.log(`\n========================================`);
  console.log(`🎉 完成！成功 ${success} 条，失败 ${failed} 条`);
  console.log(`========================================\n`);
}

main().catch(console.error);
