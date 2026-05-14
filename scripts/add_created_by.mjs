import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1aWNqeWRndG9sdGRoa2Jxb2p1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzMjY2OCwiZXhwIjoyMDkxMTA4NjY4fQ.PrfPpjQH0pWxzUUVqooXui1f3avjexLNsMPlj6CtvUQ';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  // test connection first
  const { data: testData, error: testErr } = await supabase.from('purchase_records').select('id').limit(1);
  console.log('test connection:', testErr?.message || 'OK, got ' + (testData?.length || 0) + ' rows');

  // add column via raw sql
  const { error: e1 } = await supabase.rpc('exec_sql', {
    sql: "ALTER TABLE purchase_records ADD COLUMN IF NOT EXISTS created_by VARCHAR(50);"
  });
  console.log('purchase_records add column:', e1?.message || 'OK');

  const { error: e2 } = await supabase.rpc('exec_sql', {
    sql: "ALTER TABLE sales_records ADD COLUMN IF NOT EXISTS created_by VARCHAR(50);"
  });
  console.log('sales_records add column:', e2?.message || 'OK');

  // backfill: set created_by = handler for existing records
  const { error: e3 } = await supabase.rpc('exec_sql', {
    sql: "UPDATE purchase_records SET created_by = handler WHERE created_by IS NULL AND handler IS NOT NULL;"
  });
  console.log('purchase_records backfill:', e3?.message || 'OK');

  const { error: e4 } = await supabase.rpc('exec_sql', {
    sql: "UPDATE sales_records SET created_by = handler WHERE created_by IS NULL AND handler IS NOT NULL;"
  });
  console.log('sales_records backfill:', e4?.message || 'OK');

  // verify
  const { data: d1 } = await supabase.from('purchase_records').select('created_by, handler').limit(5);
  console.log('purchase sample:', JSON.stringify(d1));
}

main().catch(e => console.error('FATAL:', e.message));
