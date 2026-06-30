import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';

const scriptContent = fs.readFileSync('./scripts/add_created_by.mjs', 'utf8');
const skMatch = scriptContent.match(/SERVICE_KEY = '([^']+)'/);
const SERVICE_KEY = skMatch ? skMatch[1] : null;
if (!SERVICE_KEY) { console.log('Service key not found'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Step 1: Check if exec_sql RPC exists
const { data: testRpc, error: rpcErr } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' });
if (rpcErr) {
  console.log('exec_sql RPC not available:', rpcErr.message);
  console.log('Will try direct REST API for schema changes...');
  
  // Check if columns exist via info
  const { data: pCols, error: pErr } = await supabase.from('purchase_records').select('reimburse_code').limit(0);
  console.log('purchase_records.reimburse_code exists?', !pErr, pErr?.message || 'OK');
  
  const { data: fCols, error: fErr } = await supabase.from('finance_records').select('reimburse_code').limit(0);
  console.log('finance_records.reimburse_code exists?', !fErr, fErr?.message || 'OK');
} else {
  console.log('exec_sql RPC available');
}
