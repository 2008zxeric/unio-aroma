const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:xuicjydgtoltdhkbqoju@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1',
});

async function main() {
  await client.connect();
  
  // add columns
  await client.query("ALTER TABLE purchase_records ADD COLUMN IF NOT EXISTS created_by VARCHAR(50);");
  console.log('purchase_records: created_by column added');
  
  await client.query("ALTER TABLE sales_records ADD COLUMN IF NOT EXISTS created_by VARCHAR(50);");
  console.log('sales_records: created_by column added');
  
  // backfill
  const r1 = await client.query("UPDATE purchase_records SET created_by = handler WHERE created_by IS NULL AND handler IS NOT NULL;");
  console.log(`purchase_records: ${r1.rowCount} rows backfilled`);
  
  const r2 = await client.query("UPDATE sales_records SET created_by = handler WHERE created_by IS NULL AND handler IS NOT NULL;");
  console.log(`sales_records: ${r2.rowCount} rows backfilled`);
  
  // verify
  const d1 = await client.query("SELECT created_by, handler FROM purchase_records LIMIT 5");
  console.log('purchase sample:', JSON.stringify(d1.rows));
  
  await client.end();
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
