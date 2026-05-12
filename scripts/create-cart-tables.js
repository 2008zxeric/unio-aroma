/**
 * UNIO AROMA — 购物车功能建表脚本
 * 运行: node scripts/create-cart-tables.js
 * 
 * 需要先设置环境变量 SUPABASE_SERVICE_KEY 或修改下方变量的值
 */
const { Client } = require('pg');

// Supabase 数据库连接参数
// Dashboard → Settings → Database → Connection string
const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const DB_HOST = 'db.xuicjydgtoltdhkbqoju.supabase.co';
const DB_PORT = 5432;
const DB_NAME = 'postgres';
const DB_USER = 'postgres';

const SQL = `
-- 需求单主表
CREATE TABLE IF NOT EXISTS cart_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT DEFAULT '',
  contact_phone TEXT DEFAULT '',
  contact_wechat TEXT DEFAULT '',
  contact_email TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed', 'cancelled')),
  total_amount NUMERIC DEFAULT 0,
  source TEXT DEFAULT 'frontend' CHECK (source IN ('frontend', 'backend')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 需求单明细表
CREATE TABLE IF NOT EXISTS cart_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES cart_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT DEFAULT '',
  size TEXT DEFAULT '',
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  base_cost NUMERIC DEFAULT 0,
  subtotal NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_cart_orders_status ON cart_orders(status);
CREATE INDEX IF NOT EXISTS idx_cart_orders_created_at ON cart_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cart_order_items_order_id ON cart_order_items(order_id);

-- 自动更新 updated_at 触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_cart_orders_updated_at ON cart_orders;
CREATE TRIGGER update_cart_orders_updated_at
  BEFORE UPDATE ON cart_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function main() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  if (!password) {
    console.log('❌ 请设置环境变量 SUPABASE_DB_PASSWORD');
    console.log('   从 Supabase Dashboard → Settings → Database 获取数据库密码');
    console.log('   然后运行: SUPABASE_DB_PASSWORD=your_password node scripts/create-cart-tables.js');
    process.exit(1);
  }

  const client = new Client({
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: password,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ 已连接到 Supabase 数据库');
    
    await client.query(SQL);
    console.log('✅ 建表完成: cart_orders + cart_order_items');
    
    // 验证表已创建
    const { rows } = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('cart_orders', 'cart_order_items')
    `);
    console.log('✅ 已确认表:', rows.map(r => r.table_name).join(', '));
    
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ 错误:', err.message);
    process.exit(1);
  }
}

main();
