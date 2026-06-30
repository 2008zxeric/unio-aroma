import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const sc = fs.readFileSync('./scripts/add_created_by.mjs', 'utf8');
const sk = sc.match(/SERVICE_KEY = '([^']+)'/)[1];
const supabase = createClient(SUPABASE_URL, sk);

async function runSql(sql) {
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  if (error) return { err: error.message };
  return { data };
}

async function main() {
  // Try multiple table name formats to find the real names
  const names = [
    'purchase_records',
    '"purchase_records"',
    'public.purchase_records',
    'public."purchase_records"',
    'finance_records',
    '"finance_records"',
    'public.finance_records',
  ];
  
  for (const name of names) {
    const r = await runSql(`ALTER TABLE ${name} ADD COLUMN IF NOT EXISTS reimburse_code VARCHAR(20)`);
    console.log(`${name}:`, r.err || 'OK');
    if (!r.err) break;
  }
}
main();
