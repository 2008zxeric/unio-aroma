import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const distContent = fs.readFileSync('./dist/assets/data-layer-C1GrXCU4.js', 'utf8');
const match = distContent.match(/supabase\.co","([A-Za-z0-9_\-\.]+)"/);
const KEY = match ? match[1] : null;
if (!KEY) { console.log('Key not found'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, KEY);

// 1. Fix the two records: set reimbursed=false
const ids = ['868690cb', '9a84cad0'];
for (const id of ids) {
  const { error } = await supabase.from('finance_records').update({ reimbursed: false, reimbursed_date: null }).eq('id', id);
  console.log(id, error ? 'FAIL: ' + error.message : 'OK -> reimbursed=false');
}

// 2. Verify
const { data: finances } = await supabase.from('finance_records').select('id,record_date,record_type,category,amount,reimbursed,handler').order('record_date', { ascending: false });
console.log('\n=== AFTER FIX ===');
for (const f of finances || []) {
  console.log(f.id.slice(0,8), f.record_date, f.record_type, 'Y'+f.amount, 'reimb:'+f.reimbursed);
}

const pendFin = (finances||[]).filter(f => !f.reimbursed && (f.record_type === 'expense' || f.record_type === 'other_expense'));
console.log('\nPending expenses:', pendFin.length);
