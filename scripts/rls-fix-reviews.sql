-- =====================================================
-- UNIO AROMA 评价系统 — RLS 策略修复
-- 解决 anon 角色无法 INSERT 的问题
-- 在 Supabase SQL Editor 中执行
-- =====================================================

-- 先删除旧的 INSERT 策略（如果存在）
DROP POLICY IF EXISTS "Anyone can submit reviews" ON public.reviews;

-- 重新创建，显式指定 TO anon（前台匿名用户）
CREATE POLICY "Anyone can submit reviews"
  ON public.reviews
  FOR INSERT
  TO anon
  WITH CHECK (status = 'pending');

-- 同样显式指定 SELECT 策略给 anon
DROP POLICY IF EXISTS "Public can read approved reviews" ON public.reviews;

CREATE POLICY "Public can read approved reviews"
  ON public.reviews
  FOR SELECT
  TO anon
  USING (status = 'approved');

-- 确认策略已创建
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'reviews';
