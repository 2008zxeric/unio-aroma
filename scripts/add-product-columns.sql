-- ============================================================
-- 产品表字段补全：添加进销存相关缺失列
-- 执行时间：2026-04-09
-- ============================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS display_name TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_15ml REAL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_piece REAL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS total_inbound_ml REAL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS total_sales_ml REAL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS remaining_ml REAL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS total_cost REAL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS total_revenue REAL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS total_profit REAL DEFAULT 0;

-- 验证：查看新增的列
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('display_name', 'price_15ml', 'price_piece', 
                     'total_inbound_ml', 'total_sales_ml', 'remaining_ml',
                     'total_cost', 'total_revenue', 'total_profit')
ORDER BY ordinal_position;
