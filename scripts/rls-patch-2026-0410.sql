-- ============================================
-- RLS 策略补丁 — 只添加缺失的策略
-- 在 Supabase SQL Editor 执行即可
-- 2026-04-10 豆豆整理
-- ============================================

-- 1. banners 表：缺 INSERT 和 DELETE 策略
-- （当前只有 SELECT 和 UPDATE）
CREATE POLICY IF NOT EXISTS "Allow anon insert banners" ON banners
  FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow anon delete banners" ON banners
  FOR DELETE USING (true);

-- 2. inquiries 表：缺 INSERT 策略
-- （前台用户提交询单需要）
CREATE POLICY IF NOT EXISTS "Allow anon insert inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

-- 3. countries 表：确保有完整的 ALL（INSERT/UPDATE/DELETE）策略
CREATE POLICY IF NOT EXISTS "Allow anon write countries" ON countries
  FOR ALL USING (true) WITH CHECK (true);

-- 4. products 表：确保有完整的 ALL 策略
CREATE POLICY IF NOT EXISTS "Allow anon write products" ON products
  FOR ALL USING (true) WITH CHECK (true);

-- 5. series 表：确保有完整的 ALL 策略
CREATE POLICY IF NOT EXISTS "Allow anon write series" ON series
  FOR ALL USING (true) WITH CHECK (true);

-- 6. dict_items 表：确保有完整的 ALL 策略
CREATE POLICY IF NOT EXISTS "Allow anon write dict_items" ON dict_items
  FOR ALL USING (true) WITH CHECK (true);

-- 7. purchase_records 表：确保有完整的 ALL 策略
CREATE POLICY IF NOT EXISTS "Allow anon write purchase_records" ON purchase_records
  FOR ALL USING (true) WITH CHECK (true);

-- 8. sales_records 表：确保有完整的 ALL 策略
CREATE POLICY IF NOT EXISTS "Allow anon write sales_records" ON sales_records
  FOR ALL USING (true) WITH CHECK (true);

-- 验证
SELECT tablename, policyname, cmd FROM pg_policies
WHERE tablename IN ('banners', 'inquiries', 'countries', 'products', 'series', 'dict_items', 'purchase_records', 'sales_records')
ORDER BY tablename, cmd;
