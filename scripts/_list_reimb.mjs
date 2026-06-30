import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const distContent = fs.readFileSync('./dist/assets/data-layer-C1GrXCU4.js', 'utf8');
const match = distContent.match(/supabase\.co",\w+="([^"]+)"/);
const KEY = match ? match[1] : null;
if (!KEY) { console.log('Key not found'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, KEY);

const { data: purchases } = await supabase.from('purchase_records').select('*').order('purchase_date');
const { data: finances } = await supabase.from('finance_records').select('*').order('record_date');

function getAmt(p) { return p.total_cost || ((p.unit_cost||0)*(p.volume_ml||0)); }

console.log('=== 采购/Cost (→ C编码) ===');
for (const p of purchases||[]) {
  console.log(p.id.slice(0,8), p.purchase_date, 'Y'+getAmt(p).toFixed(0), 'handler:'+(p.handler||'-'), 'reimb:'+p.reimbursed, 'code:'+(p.reimburse_code||'(空)'));
}

console.log('\n=== 财务/Expense (→ Z编码) ===');
for (const f of finances||[]) {
  console.log(f.id.slice(0,8), f.record_date, f.record_type, f.category||'-', 'Y'+f.amount, 'handler:'+(f.handler||'-'), 'reimb:'+f.reimbursed, 'code:'+(f.reimburse_code||'(空)'));
}
