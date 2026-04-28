-- =====================================================
-- UNIO AROMA 评价系统 — 数据库初始化 SQL
-- 在 Supabase SQL Editor 中执行此文件
-- https://supabase.com/dashboard/project/xuicjydgtoltdhkbqoju/sql
-- =====================================================

-- 1. 创建 reviews 表
CREATE TABLE IF NOT EXISTS public.reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code  TEXT NOT NULL,                          -- 关联产品 code（非 UUID，与 products.code 对应）
  content       TEXT NOT NULL CHECK (char_length(content) <= 150),  -- 评价内容，最多 150 字
  ip_address    TEXT,                                   -- 提交者 IP
  ip_location   TEXT,                                   -- IP 归属地（如 "中国·浙江·宁波"）
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_note TEXT,                                   -- 管理员审核备注
  reviewed_at   TIMESTAMPTZ,                            -- 审核时间
  reviewed_by   TEXT,                                   -- 审核人（admin username）
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_reviews_product_code ON public.reviews(product_code);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- 3. 启用 RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. RLS 策略 — 前台：任何人可以查看已审核通过的评价
CREATE POLICY "Public can read approved reviews"
  ON public.reviews
  FOR SELECT
  USING (status = 'approved');

-- 5. RLS 策略 — 前台：任何人可以提交评价（匿名用户也可以 INSERT）
CREATE POLICY "Anyone can submit reviews"
  ON public.reviews
  FOR INSERT
  WITH CHECK (status = 'pending');

-- 6. RLS 策略 — 后台：service_role 可以全量操作（审核）
-- service_role 自动绕过所有 RLS，无需单独策略

-- 7. 完成提示
SELECT 'reviews 表创建成功！' AS result;
