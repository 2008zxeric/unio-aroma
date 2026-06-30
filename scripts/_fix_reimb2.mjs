import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const distContent = fs.readFileSync('./dist/assets/data-layer-C1GrXCU4.js', 'utf8');
const match = distContent.match(/supabase\.co","([A-Za-z0-9_\-\.]+)"/);
const KEY = match ? match[1] : null;
if (!KEY) { console.log('Key not found'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, KEY);

// Get full IDs
const { data: finances } = await supabase.from('finance_records').select('id,record_date,amount,reimbursed').order('record_date', { ascending: false });

const target = finances.filter(f => f.amount === 473.41 || f.amount === 49);
console.log('Target records:');
for (const f of target) {
  console.log('  FULL ID:', f.id, '| date:', f.record_date, '| amount:', f.amount, '| reimb:', f.reimbursed);
  
  // Fix it
  const { error } = await supabase.from('finance_records').update({ reimbursed: false, reimbursed_date: null }).eq('id', f.id);
  console.log('  ->', error ? 'FAIL: ' + error.message : 'OK');
}
