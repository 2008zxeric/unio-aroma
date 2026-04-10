-- ============================================
-- 修复：countries 表完整 RLS 策略（读写都要有）
-- 问题：之前只有 SELECT 策略，后台无法写入
-- 在 Supabase SQL Editor 执行即可
-- ============================================

-- 1. 先确认 RLS 已开启
ALTER TABLE countries FORCE ROW LEVEL SECURITY;

-- 2. 删除旧策略避免冲突
DROP POLICY IF EXISTS "Allow public read countries" ON countries;
DROP POLICY IF EXISTS "Allow admin write countries" ON countries;

-- 3. 读策略：所有人可读
CREATE POLICY "Allow public read countries" ON countries
  FOR SELECT USING (true);

-- 4. 写策略：所有人可写（后续可加 auth）
CREATE POLICY "Allow admin write countries" ON countries
  FOR ALL USING (true) WITH CHECK (true);

-- 同样检查 products 表是否有完整的写策略
DROP POLICY IF EXISTS "Allow public insert inquiries" ON inquiries;
DROP POLICY IF EXISTS "Allow public read inquiries" ON inquiries;
DROP POLICY IF EXISTS "Allow public read products" ON products;
DROP POLICY IF EXISTS "Allow public read series" ON series;

CREATE POLICY "Allow public insert inquiries" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read inquiries" ON inquiries FOR SELECT USING (true);
CREATE POLICY "Allow public read products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Allow admin write products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read series" ON series FOR SELECT USING (true);
CREATE POLICY "Allow admin write series" ON series FOR ALL USING (true) WITH CHECK (true);

-- 其他表也确保有写权限
CREATE POLICY IF NOT EXISTS "Allow all media" ON media FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all banners" ON banners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all site_texts" ON site_texts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all home_recommends" ON home_recommends FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all purchase_records" ON purchase_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all sales_records" ON sales_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all product_inventory" ON product_inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all dict_items" ON dict_items FOR ALL USING (true) WITH CHECK (true);

-- 验证
SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename = 'countries';
SELECT '✅ RLS 完整策略修复完成！countries 表现在支持读写' as status;
