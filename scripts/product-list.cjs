// 输出完整产品清单
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://xuicjydgtoltdhkbqoju.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1aWNqeWRndG9sdGRoa2Jxb2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MzI2NjgsImV4cCI6MjA5MTEwODY2OH0.7E-VPqi7m9WbCWw96jbEeVdVBVrwubIjAGEB-_MV5ng'
);

async function main() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('code');
  
  if (error) { console.error(error); return; }
  
  console.log(`📦 上架产品总数：${products.length}\n`);
  
  // 按系列分组
  const seriesOrder = ['AL','AU','BG','BR','CN','EU','FR','HE','ID','IN','IT','JG','MG','NP','RU','SC','SE','SHENG','SI','SO','TN','US','YUAN'];
  const groups = {};
  products.forEach(p => {
    // 判断系列
    let series = '其他';
    if (p.code.startsWith('AL-')) series = 'AL 极境·全球';
    else if (p.code.startsWith('AU-')) series = 'AU 极境·澳洲';
    else if (p.code.startsWith('BG-')) series = 'BG 极境·保加利亚';
    else if (p.code.startsWith('BR-')) series = 'BR 极境·巴西';
    else if (p.code.startsWith('CN-')) series = 'CN 极境·中国';
    else if (p.code.startsWith('EU-')) series = 'EU 极境·欧洲';
    else if (p.code.startsWith('FR-')) series = 'FR 极境·法国';
    else if (p.code.startsWith('HE-')) series = 'HE 复方精油';
    else if (p.code.startsWith('ID-')) series = 'ID 极境·印尼';
    else if (p.code.startsWith('IN-')) series = 'IN 极境·印度';
    else if (p.code.startsWith('IT-')) series = 'IT 极境·意大利';
    else if (p.code.startsWith('JG-')) series = 'JG 香道';
    else if (p.code.startsWith('MG-')) series = 'MG 极境·马达加斯加';
    else if (p.code.startsWith('NP-')) series = 'NP 极境·尼泊尔';
    else if (p.code.startsWith('RU-')) series = 'RU 极境·俄罗斯';
    else if (p.code.startsWith('SC-')) series = 'SC 极境·苏格兰';
    else if (p.code.startsWith('SE-')) series = 'SE 纯露';
    else if (p.code.startsWith('SHENG-')) series = 'SHENG 生系列纯露';
    else if (p.code.startsWith('SI-')) series = 'SI 极境·斯里兰卡';
    else if (p.code.startsWith('SO-')) series = 'SO 极境·索马里';
    else if (p.code.startsWith('TN-')) series = 'TN 极境·突尼斯';
    else if (p.code.startsWith('US-')) series = 'US 极境·美国';
    else if (p.code.startsWith('YUAN-') && p.code.includes('-y')) series = 'YUAN 单方精油';
    else if (p.code.startsWith('YUAN-') && p.code.includes('-JC')) series = 'YUAN 基底油';
    
    if (!groups[series]) groups[series] = [];
    groups[series].push(p);
  });
  
  for (const [series, items] of Object.entries(groups)) {
    console.log(`\n${'═'.repeat(80)}`);
    console.log(`📂 ${series} (${items.length}个)`);
    console.log(`${'─'.repeat(80)}`);
    console.log(`  #   Code              产品名称                    规格     参考售价`);
    console.log(`${'─'.repeat(80)}`);
    
    items.forEach((p, i) => {
      const idx = String(i + 1).padStart(2);
      const code = (p.code || '').padEnd(18);
      const name = (p.name_cn || '').padEnd(27);
      const spec = (p.specification || '-').padEnd(7);
      
      // 找价格
      let priceStr = '-';
      const priceFields = [
        { key: 'price_30ml', label: '30ml' },
        { key: 'price_10ml', label: '10ml' },
        { key: 'price_15ml', label: '15ml' },
        { key: 'price_50ml', label: '50ml' },
        { key: 'price_100ml', label: '100ml' },
        { key: 'price_250ml', label: '250ml' },
        { key: 'price_500ml', label: '500ml' },
        { key: 'price_1000ml', label: '1000ml' },
      ];
      for (const f of priceFields) {
        if (p[f.key]) { priceStr = `¥${p[f.key]}/${f.label}`; break; }
      }
      
      console.log(`  ${idx}  ${code}  ${name}  ${spec}  ${priceStr}`);
    });
  }
}

main();
