const { Client } = require('pg');

// Supabase connection string format: postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[HOST]:[PORT]/postgres
const PROJECT_REF = 'xuicjydgtoltdhkbqoju';
const PASSWORD = 'xuicjydgtoltdhkbqoju';  // try the project ref as password

async function tryConnect(host, port, user, password, database = 'postgres') {
  const client = new Client({
    host,
    port,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    const res = await client.query('SELECT 1 as test');
    await client.end();
    return { ok: true, result: res.rows };
  } catch (e) {
    await client.end().catch(() => {});
    return { ok: false, error: e.message };
  }
}

async function main() {
  const attempts = [
    // Pooler format
    { host: `aws-0-us-west-1.pooler.supabase.com`, port: 6543, user: `postgres.${PROJECT_REF}`, password: PASSWORD },
    { host: `aws-0-us-west-1.pooler.supabase.com`, port: 5432, user: `postgres.${PROJECT_REF}`, password: PASSWORD },
    // Direct connection
    { host: `db.${PROJECT_REF}.supabase.co`, port: 5432, user: 'postgres', password: PASSWORD },
    { host: `${PROJECT_REF}.supabase.co`, port: 5432, user: 'postgres', password: PASSWORD },
  ];
  
  for (const a of attempts) {
    console.log(`Trying ${a.user}@${a.host}:${a.port}...`);
    const r = await tryConnect(a.host, a.port, a.user, a.password);
    if (r.ok) {
      console.log('SUCCESS!');
      return a;
    } else {
      console.log('  Failed:', r.error.slice(0, 100));
    }
  }
  
  return null;
}

main().then(r => {
  if (r) console.log('Works:', JSON.stringify(r));
  else console.log('No connection found');
}).catch(e => console.error('FATAL:', e.message));
