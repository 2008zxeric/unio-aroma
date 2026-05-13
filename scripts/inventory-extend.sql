-- ============================================
-- UNIO AROMA 库存管理 - 数据库扩展
-- 2026-05-13
-- ============================================

-- 1. 给 purchase_records 加 handler 和 total_cost 字段
ALTER TABLE purchase_records ADD COLUMN IF NOT EXISTS handler text;
ALTER TABLE purchase_records ADD COLUMN IF NOT EXISTS total_cost numeric DEFAULT 0;

-- 2. 给 sales_records 加 handler 字段
ALTER TABLE sales_records ADD COLUMN IF NOT EXISTS handler text;

-- 3. 创建其他收支记录表
CREATE TABLE IF NOT EXISTS finance_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  record_date date NOT NULL,
  record_type text NOT NULL CHECK (record_type IN ('other_income', 'other_expense')),
  category text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  notes text,
  handler text,
  created_at timestamptz DEFAULT now()
);

-- 4. 向 dict_items 添加字典项（如果还没有）
INSERT INTO dict_items (dict_type, item_value, item_label, sort_order)
SELECT * FROM (VALUES
  ('handler', 'eric', 'ERIC老大', 1),
  ('handler', 'amanda', 'Amanda', 2),
  ('handler', 'xiaowang', '小王', 3),
  ('handler', 'others', '其他', 99),
  ('other_income', 'event_income', '活动收入', 1),
  ('other_income', 'service_fee', '服务费', 2),
  ('other_income', 'consulting', '咨询费', 3),
  ('other_income', 'other_inc', '其他收入', 99),
  ('other_expense', 'advertising', '广告推广', 1),
  ('other_expense', 'packaging', '包材', 2),
  ('other_expense', 'design', '设计费', 3),
  ('other_expense', 'shipping', '运费', 4),
  ('other_expense', 'platform_fee', '平台费用', 5),
  ('other_expense', 'venue', '场地费', 6),
  ('other_expense', 'marketing', '营销费用', 7),
  ('other_expense', 'other_exp', '其他支出', 99)
) AS new_items (dict_type, item_value, item_label, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM dict_items 
  WHERE dict_type = new_items.dict_type AND item_value = new_items.item_value
);
