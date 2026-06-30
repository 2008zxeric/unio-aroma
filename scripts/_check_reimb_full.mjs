import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const distContent = fs.readFileSync('./dist/assets/data-layer-C1GrXCU4.js', 'utf8');
const match = distContent.match(/supabase\.co",\w+="([^"]+)"/);
const KEY = match ? match[1] : null;

if (!KEY) { console.log('Key not found'); process.exit(1); }
console.log('Key length:', KEY.length);

const supabase = createClient(SUPABASE_URL, KEY);

const { data: purchases, error: pErr } = await supabase.from('purchase_records').select('*').order('purchase_date', { ascending: false });
const { data: finances, error: fErr } = await supabase.from('finance_records').select('*').order('record_date', { ascending: false });

if (pErr) console.log('Purchase error:', pErr.message);
if (fErr) console.log('Finance error:', fErr.message);

function getAmount(item) {
  if (item.total_cost !== undefined) return item.total_cost || ((item.unit_cost || 0) * (item.volume_ml || 0));
  return item.amount || 0;
}

const allItems = [];
for (const p of purchases || []) {
  allItems.push({ source: 'purchase', ...p, amount: getAmount(p) });
}
for (const f of finances || []) {
  allItems.push({ source: 'finance', ...f, amount: f.amount || 0 });
}

const pending = allItems.filter(i => !i.reimbursed);
const done = allItems.filter(i => i.reimbursed);

console.log('\n=== SUMMARY ===');
console.log('Total items:', allItems.length);
console.log('Pending count:', pending.length, '| total amount: ¥' + pending.reduce((s,i) => s + i.amount, 0).toFixed(2));
console.log('Done count:', done.length, '| total amount: ¥' + done.reduce((s,i) => s + i.amount, 0).toFixed(2));

console.log('\n=== PENDING DETAILS ===');
for (const item of pending) {
  const amt = item.amount;
  const date = item.purchase_date || item.record_date;
  console.log(`[${item.source}] id:${item.id.slice(0,8)} | date:${date} | amount:¥${amt.toFixed(2)} | handler:${item.handler||'-'} | reimbursed:${item.reimbursed}`);
}
