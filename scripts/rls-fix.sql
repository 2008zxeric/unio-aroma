-- UNIO AROMA - RLS 安全策略修复 + 表结构更新
-- 在 Supabase SQL Editor (https://supabase.com/dashboard/project/xuicjydgtoltdhkbqoju/sql) 中执行

-- =============================================
-- 1. 表结构更新
-- =============================================

-- 给 inquiries 表添加 interest 字段
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS interest TEXT;

-- 给 countries 表添加 is_china 字段（用于区分中国省份和外国）
ALTER TABLE countries ADD COLUMN IF NOT EXISTS is_china BOOLEAN DEFAULT false;

-- =============================================
-- 2. 删除可能存在的旧策略（避免冲突）
-- =============================================
DROP POLICY IF EXISTS "Allow public insert inquiries" ON inquiries;
DROP POLICY IF EXISTS "Allow public read inquiries" ON inquiries;
DROP POLICY IF EXISTS "Allow public read products" ON products;
DROP POLICY IF EXISTS "Allow public read countries" ON countries;
DROP POLICY IF EXISTS "Allow public read series" ON series;

-- =============================================
-- 3. 重新创建 RLS 策略
-- =============================================

-- 询单表: 所有人可插入（提交询单）
CREATE POLICY "Allow public insert inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

-- products 表: 所有人可读取已激活产品
CREATE POLICY "Allow public read products" ON products
  FOR SELECT USING (is_active = true);

-- countries 表: 所有人可读取
CREATE POLICY "Allow public read countries" ON countries
  FOR SELECT USING (true);

-- series 表: 所有人可读取
CREATE POLICY "Allow public read series" ON series
  FOR SELECT USING (true);

-- =============================================
-- 4. 将中国省份标记为 is_china = true
-- （目前数据库里的国家都是外国，中国省份暂未录入）
-- 如需录入中国省份，请在 Supabase Table Editor 中设置 is_china = true

-- =============================================
-- 5. 验证
-- =============================================
SELECT
  schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('inquiries', 'products', 'countries', 'series')
ORDER BY tablename, policyname;

SELECT 'RLS 策略 + 表结构更新完成！' as status;
