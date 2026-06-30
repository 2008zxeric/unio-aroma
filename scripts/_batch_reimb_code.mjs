import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const sc = fs.readFileSync('./scripts/add_created_by.mjs', 'utf8');
const sk = sc.match(/SERVICE_KEY = '([^']+)'/)[1];
const supabase = createClient(SUPABASE_URL, sk);

async function runSql(sql) {
  const { error } = await supabase.rpc('exec_sql', { sql });
  return error?.message;
}

async function main() {
  // Add columns
  let err = await runSql('ALTER TABLE public.purchase_records ADD COLUMN IF NOT EXISTS reimburse_code VARCHAR(20)');
  if (err) console.log('ERR purchase column:', err);
  err = await runSql('ALTER TABLE public.finance_records ADD COLUMN IF NOT EXISTS reimburse_code VARCHAR(20)');
  if (err) console.log('ERR finance column:', err);

  // Verify columns exist
  const { data: pTest, error: pe } = await supabase.from('purchase_records').select('id,reimburse_code').limit(1);
  if (pe) { console.log('Column verify FAILED:', pe.message); return; }
  console.log('Columns ready');

  // Fetch + code
  const { data: purchases } = await supabase.from('purchase_records').select('*').order('purchase_date');
  const { data: finances } = await supabase.from('finance_records').select('*').order('record_date');

  // Purchases: C26MMXXX
  let pc = {};
  for (const p of purchases || []) {
    const m = p.purchase_date.slice(5,7);
    pc[m] = (pc[m]||0) + 1;
    const code = 'C26' + m + String(pc[m]).padStart(3,'0');
    await supabase.from('purchase_records').update({
      reimburse_code: code, reimbursed: true,
      reimbursed_date: new Date().toISOString().split('T')[0]
    }).eq('id', p.id);
  }

  // Finance expenses: Z26MMXXX
  let fc = {};
  for (const f of finances || []) {
    if (f.record_type === 'income' || f.record_type === 'other_income') continue;
    const m = f.record_date.slice(5,7);
    fc[m] = (fc[m]||0) + 1;
    const code = 'Z26' + m + String(fc[m]).padStart(3,'0');
    await supabase.from('finance_records').update({
      reimburse_code: code, reimbursed: true,
      reimbursed_date: new Date().toISOString().split('T')[0]
    }).eq('id', f.id);
  }

  console.log('Done');
}
main();
