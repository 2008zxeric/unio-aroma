import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const distContent = fs.readFileSync('./dist/assets/data-layer-C1GrXCU4.js', 'utf8');
const match = distContent.match(/supabase\.co","([A-Za-z0-9_\-\.]+)"/);
const KEY = match ? match[1] : null;

if (!KEY) { console.log('Key not found'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, KEY);

const { data: purchases } = await supabase.from('purchase_records').select('id,product_id,purchase_date,total_cost,unit_cost,volume_ml,reimbursed,handler').order('purchase_date', { ascending: false });
const { data: finances } = await supabase.from('finance_records').select('id,record_date,record_type,category,amount,reimbursed,handler').order('record_date', { ascending: false });

console.log('=== PURCHASES ===');
for (const p of purchases || []) {
  const amt = p.total_cost || ((p.unit_cost || 0) * (p.volume_ml || 0));
  console.log(p.id.slice(0,8), p.purchase_date, 'Y' + (amt||0).toFixed(0), 'handler:'+(p.handler||'-'), 'reimb:'+p.reimbursed);
}

console.log('\n=== FINANCE ===');
for (const f of finances || []) {
  console.log(f.id.slice(0,8), f.record_date, f.record_type, f.category, 'Y'+f.amount, 'handler:'+(f.handler||'-'), 'reimb:'+f.reimbursed);
}

const pendPur = (purchases||[]).filter(p => !p.reimbursed);
const pendFin = (finances||[]).filter(f => !f.reimbursed && (f.record_type === 'expense' || f.record_type === 'other_expense'));
console.log('\n=== PENDING REIMBURSEMENT ===');
console.log('Purchases pending:', pendPur.length);
console.log('Expenses pending:', pendFin.length);
console.log('TOTAL:', pendPur.length + pendFin.length);
