-- UNIO AROMA - RLS 安全策略修复 + 表结构更新
-- 在 Supabase SQL Editor (https://supabase.com/dashboard/project/xuicjydgtoltdhkbqoju/sql) 中执行

-- =============================================
-- 1. 给 inquiries 表添加 interest 字段（感兴趣的产品）
-- =============================================
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS interest TEXT;

-- =============================================
-- 2. 删除可能存在的旧策略（避免冲突）
-- =============================================
DROP POLICY IF EXISTS "Allow public insert inquiries" ON inquiries;
DROP POLICY IF EXISTS "Allow public read inquiries" ON inquiries;

-- =============================================
-- 3. 重新创建 RLS 策略
-- =============================================

-- 询单表: 所有人可以插入（提交询单）
CREATE POLICY "Allow public insert inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

-- 询单表: SELECT 只允许 service_role（管理员在后台查看）
-- 普通匿名用户不能读取其他人的询单
-- 无需额外 SELECT 策略，默认拒绝即可

-- =============================================
-- 4. 确保其他表的 RLS 策略完整
-- =============================================

-- products 表
DROP POLICY IF EXISTS "Allow public read products" ON products;
CREATE POLICY "Allow public read products" ON products
  FOR SELECT USING (is_active = true);

-- countries 表
DROP POLICY IF EXISTS "Allow public read countries" ON countries;
CREATE POLICY "Allow public read countries" ON countries
  FOR SELECT USING (true);

-- =============================================
-- 5. 验证
-- =============================================
SELECT 
  schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('inquiries', 'products', 'countries')
ORDER BY tablename, policyname;

SELECT 'RLS 策略更新完成！' as status;
