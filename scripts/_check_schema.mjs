import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const sc = fs.readFileSync('./scripts/add_created_by.mjs', 'utf8');
const sk = sc.match(/SERVICE_KEY = '([^']+)'/)[1];
const supabase = createClient(SUPABASE_URL, sk);

async function main() {
  // Check what columns purchase_records already has (via REST API)
  const { data: cols, error } = await supabase
    .from('purchase_records')
    .select('*')
    .limit(0);
  
  // Use HEAD request to see column names via the response
  console.log('purchase_records columns available:', error?.message || 'OK');
  
  // Try the PostgREST schema introspection
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: { 
      'apikey': sk,
      'Authorization': `Bearer ${sk}`
    }
  });
  const text = await resp.text();
  console.log('REST root (openapi):', text.slice(0, 500));
}
main();
