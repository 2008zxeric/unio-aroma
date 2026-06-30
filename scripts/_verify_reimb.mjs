import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const sc = fs.readFileSync('./scripts/add_created_by.mjs', 'utf8');
const sk = sc.match(/SERVICE_KEY = '([^']+)'/)[1];
const supabase = createClient(SUPABASE_URL, sk);

async function main() {
  const { data: purchases } = await supabase.from('purchase_records').select('id,purchase_date,total_cost,unit_cost,volume_ml,reimbursed,handler,reimburse_code').order('purchase_date');
  const { data: finances } = await supabase.from('finance_records').select('id,record_date,record_type,category,amount,reimbursed,handler,reimburse_code').order('record_date');

  function amt(p) { return p.total_cost || ((p.unit_cost||0)*(p.volume_ml||0)) || 0; }

  console.log('采购 (C编码)'.padEnd(50) + '财务支出 (Z编码)');
  console.log('─'.repeat(80));

  const max = Math.max(purchases.length, finances.length);
  for (let i = 0; i < max; i++) {
    let left = '', right = '';
    if (i < purchases.length) {
      const p = purchases[i];
      left = `${p.reimburse_code||'(空)'} ${p.purchase_date} ¥${amt(p).toFixed(0)} ${p.handler||'-'}`;
    }
    if (i < finances.length) {
      const f = finances[i];
      if (f.record_type !== 'income' && f.record_type !== 'other_income') {
        right = `${f.reimburse_code||'(空)'} ${f.record_date} ${f.category} ¥${f.amount}`;
      } else {
        right = `[收入-跳过] ${f.record_date} ¥${f.amount} (${f.handler||'-'})`;
      }
    }
    console.log(left.padEnd(50) + right);
  }

  // Pending calc (excluding income as frontend does)
  const pPending = (purchases||[]).filter(p => !p.reimbursed);
  const fPending = (finances||[]).filter(f => !f.reimbursed && f.record_type !== 'income' && f.record_type !== 'other_income');
  console.log('\n待处理:', pPending.length + fPending.length);
}
main();
