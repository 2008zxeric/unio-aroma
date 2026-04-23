// 批量下架重复产品 - 只保留每个组的一个
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xuicjydgtoltdhkbqoju.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1aWNqeWRndG9sdGRoa2Jxb2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MzI2NjgsImV4cCI6MjA5MTEwODY2OH0.7E-VPqi7m9WbCWw96jbEeVdVBVrwubIjAGEB-_MV5ng'
);

// 需要下架的产品 code 列表（26个）
const codesToDeactivate = [
  // 1. 依兰依兰 - 保留 y11，下架 y12
  'YUAN-y12',
  // 2. 大马士革玫瑰 - 保留 y2，下架 y1 + BG版
  'YUAN-y1',
  'BG-rose-damascena-otto',
  // 3. 佛手柑 - 保留 YUAN-y23，下架 IT版
  'IT-bergamot-alba',
  // 4. 乳香 - 保留 y47，下架 y46
  'YUAN-y46',
  // 5. 东印度檀香 - 保留 y38，下架 y39
  'YUAN-y39',
  // 6. 天竺葵 - 保留 y5，下架 y6
  'YUAN-y6',
  // 7. 真薰衣草 - 保留 y8，下架 y9
  'YUAN-y9',
  // 8. 德国洋甘菊 - 保留 y36，下架 y37 + SHENG版
  'YUAN-y37',
  'SHENG-cl15',
  // 9. 快乐鼠尾草 - 保留 y54，下架 y53
  'YUAN-y53',
  // 10. 意大利永久花 - 保留 y33，下架 y34 + SHENG版
  'YUAN-y34',
  'SHENG-cl14',
  // 11. 柠檬 - 保留 y22，下架 y21
  'YUAN-y21',
  // 12. 柠檬草 - 保留 y55，下架 y56
  'YUAN-y56',
  // 13. 甜橙 - 保留 y19，下架 y20
  'YUAN-y20',
  // 14. 澳洲茶树 - 保留 y16，下架 y17
  'YUAN-y17',
  // 15. 欧薄荷 - 保留 y26，下架 y27
  'YUAN-y27',
  // 16. 香蜂草 - 保留 y57，下架 y58
  'YUAN-y58',
  // 17. 椰子油 - 保留 JC1016，下架 JC1016A
  'JC1016A',
  // 18. 橙花 - 保留 y32，下架 y31
  'YUAN-y31',
  // 19. 罗马洋甘菊 - 保留 y35，下架 SHENG版
  'SHENG-cl19',
  // 20. 大马士革玫瑰纯露 - 保留 SHENG-cl1，下架 SE版
  'SE-cl01',
  // 21. 橙花纯露 - 保留 SHENG-cl2，下架 SE版
  'SE-cl02',
  // 22. 薰衣草纯露 - 保留 SHENG-cl8，下架 SE版
  'SE-cl08',
  // 23. 马鞭草酮迷迭香 - 保留 YUAN-y65，下架 SHENG版
  'SHENG-cl18',
];

async function main() {
  console.log(`📦 准备下架 ${codesToDeactivate.length} 个重复产品...\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const code of codesToDeactivate) {
    const { data, error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('code', code)
      .select('id, code, name_cn, is_active');
    
    if (error) {
      console.log(`❌ 失败 | ${code} | ${error.message}`);
      failCount++;
    } else if (data && data.length > 0) {
      console.log(`✅ 已下架 | ${code} | ${data[0].name_cn} | id:${data[0].id}`);
      successCount++;
    } else {
      console.log(`⚠️ 未找到 | ${code} | （数据库中不存在）`);
      failCount++;
    }
  }
  
  console.log(`\n📊 结果：成功 ${successCount} / 失败 ${failCount} / 总计 ${codesToDeactivate.length}`);
  
  // 验证：检查还剩多少上架产品
  const { count } = await supabase
    .from('products', { count: 'exact' })
    .select('*', { count: 'exact' })
    .eq('is_active', true);
  
  console.log(`📈 下架后剩余上架产品：${count} 个`);
}

main().catch(console.error);
