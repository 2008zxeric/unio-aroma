-- ============================================
-- UNIO AROMA CMS 完整数据库 Schema v2.1
-- 在 Supabase SQL Editor 中执行
-- 核心修正：4大系列（元/和/生/香）× 13子分类
-- ============================================

-- =============================================
-- 0. 确保4大系列完整（补上缺失的"香"系列）
-- =============================================

-- 先检查并插入缺失的"香"系列
INSERT INTO series (code, name_cn, name_en, description, sort_order, is_active)
VALUES ('jing', '香', 'Jing', '香 · 空间 / 极简芳香美学', 4, true)
ON CONFLICT (code) DO UPDATE SET name_cn = '香', name_en = 'Jing', description = '香 · 空间 / 极简芳香美学';

-- 确认所有4个系列都存在
INSERT INTO series (code, name_cn, name_en, description, sort_order, is_active) VALUES
  ('yuan', '元', 'Yuan', '元 · 单方 / 极境生存原力', 1, true),
  ('he',   '和', 'He',   '和 · 复方 / 科学频率重构', 2, true),
  ('sheng','生', 'Sheng','生 · 纯露 / 植物生命之水', 3, true)
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- 1. 产品表增强字段（在已有表上添加）
-- =============================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS scientific_name TEXT;           -- 学名
ALTER TABLE products ADD COLUMN IF NOT EXISTS short_desc TEXT;               -- 短描述/特点提炼
ALTER TABLE products ADD COLUMN IF NOT EXISTS origin TEXT;                   -- 产地
ALTER TABLE products ADD COLUMN IF NOT EXISTS extraction_method TEXT;        -- 提炼方式
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_5ml DECIMAL(10,2);       -- 5ml售价
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_10ml DECIMAL(10,2);      -- 10ml售价
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_30ml DECIMAL(10,2);      -- 30ml售价
ALTER TABLE products ADD COLUMN IF NOT EXISTS narrative TEXT;                -- Eric叙事
ALTER TABLE products ADD COLUMN IF NOT EXISTS alice_lab TEXT;               -- Alice Lab日记
ALTER TABLE products ADD COLUMN IF NOT EXISTS group_name TEXT;              -- 子组归类（如"元·金木水火土"）
ALTER TABLE products ADD COLUMN IF NOT EXISTS similar_ids UUID[] DEFAULT '{}'; -- 相似推荐绑定产品ID
ALTER TABLE products ADD COLUMN IF NOT EXISTS series_code TEXT;              -- 冗余系列代码

-- ⭐ 关键：子分类约束 — 13个精确子分类 + 默认值
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'none';

COMMENT ON COLUMN products.scientific_name IS '产品学名（拉丁名）';
COMMENT ON COLUMN products.short_desc IS '短描述（特点提炼，前台展示用）';
COMMENT ON COLUMN products.origin IS '产品产地';
COMMENT ON COLUMN products.extraction_method IS '提炼方式（蒸馏/压榨/溶剂/CO2等）';
COMMENT ON COLUMN products.price_5ml IS '5ml标准售价(元)';
COMMENT ON COLUMN products.price_10ml IS '10ml标准售价(元)';
COMMENT ON COLUMN products.price_30ml IS '30ml标准售价(元)';
COMMENT ON COLUMN products.narrative IS 'Eric寻香叙事';
COMMENT ON COLUMN products.alice_lab IS 'Alice实验室笔记';
COMMENT ON COLUMN products.group_name IS '子组归类显示名（如: 元·金、生·清净）';
COMMENT ON COLUMN products.similar_ids IS '相似推荐绑定的产品ID数组(UUID[])';
COMMENT ON COLUMN products.series_code IS '冗余系列代码(yuan/he/sheng/jing)';
COMMENT ON COLUMN products.category IS '子分类: 元(jin/mu/shui/huo/tu) 和(body/mind/soul) 生(clear/nourish/soothe) 香(aesthetic/meditation)';

-- =============================================
-- 2. 国家表增强字段
-- =============================================

ALTER TABLE countries ADD COLUMN IF NOT EXISTS sub_region TEXT;              -- 子区域
ALTER TABLE countries ADD COLUMN IF NOT EXISTS eric_diary TEXT;              -- 寻香日志
ALTER TABLE countries ADD COLUMN IF NOT EXISTS technical_info TEXT;          -- Alice实验室信息
ALTER TABLE countries ADD COLUMN IF NOT EXISTS scenery_url TEXT;             -- 风景图URL
ALTER TABLE countries ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0; -- 到访次数
ALTER TABLE countries ADD COLUMN IF NOT EXISTS unlock_code TEXT DEFAULT '0'; -- 解锁状态：0=未解锁，其它=解锁
ALTER TABLE countries ADD COLUMN IF NOT EXISTS is_china_province BOOLEAN DEFAULT FALSE; -- 是否为中国省份
ALTER TABLE countries ADD COLUMN IF NOT EXISTS flag_emoji TEXT;              -- 国旗emoji
ALTER TABLE countries ADD COLUMN IF NOT EXISTS knowledge TEXT;               -- 知识备注
ALTER TABLE countries ADD COLUMN IF NOT EXISTS product_ids TEXT[] DEFAULT '{}'; -- 关联产品IDs

COMMENT ON COLUMN countries.sub_region IS '子区域（如：南欧、东亚、华北等）';
COMMENT ON COLUMN countries.eric_diary IS 'Eric寻香日志';
COMMENT ON COLUMN countries.technical_info IS 'Alice实验室技术信息';
COMMENT ON COLUMN countries.scenery_url IS '国家风景大图URL';
COMMENT ON COLUMN countries.visit_count IS '到访次数(>=0)';
COMMENT ON COLUMN countries.unlock_code IS '解锁状态：0=未锁定，其它值=已解锁';
COMMENT ON COLUMN countries.is_china_province IS '是否为中国省份';
COMMENT ON COLUMN countries.flag_emoji IS '国旗/地区emoji图标';
COMMENT ON COLUMN countries.knowledge IS '极境原生分子档案知识备注';
COMMENT ON COLUMN countries.product_ids IS '国家推荐精油产品ID数组';

-- =============================================
-- 3. 进货记录表 (purchase_records)
-- =============================================
CREATE TABLE IF NOT EXISTS purchase_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  purchase_date DATE NOT NULL DEFAULT NOW(),     -- 进货日期
  volume_ml NUMERIC(10,2) NOT NULL,              -- 容量(ml)
  unit_cost NUMERIC(10,2) NOT NULL,              -- 进价(元/ml)
  supplier_code TEXT,                            -- 供货商代码
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchase_product ON purchase_records(product_id);
CREATE INDEX IF NOT EXISTS idx_purchase_date ON purchase_records(purchase_date);

-- RLS
ALTER TABLE purchase_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on purchase_records" ON purchase_records FOR ALL USING (true);

-- =============================================
-- 4. 销售记录表 (sales_records)
-- =============================================
CREATE TABLE IF NOT EXISTS sales_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sale_date DATE NOT NULL DEFAULT NOW(),         -- 销售日期
  volume_ml NUMERIC(10,2) NOT NULL,              -- 容量(ml)
  sale_price NUMERIC(10,2),                      -- 单价(元/ml)
  total_amount NUMERIC(10,2) NOT NULL,           -- 销售总金额
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_product ON sales_records(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales_records(sale_date);

ALTER TABLE sales_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on sales_records" ON sales_records FOR ALL USING (true);

-- =============================================
-- 5. 网站文字配置表 (site_texts)
-- =============================================
CREATE TABLE IF NOT EXISTS site_texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,                     -- 唯一键名
  value TEXT NOT NULL,                          -- 文字内容
  description TEXT,                             -- 说明备注
  page TEXT NOT NULL DEFAULT 'home',            -- 所属页面
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_texts_page ON site_texts(page);

ALTER TABLE site_texts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on site_texts" ON site_texts FOR ALL USING (true);

-- =============================================
-- 6. 首页推荐表 (home_recommends)
-- =============================================
CREATE TABLE IF NOT EXISTS home_recommends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('product', 'country', 'series')),
  ref_id UUID NOT NULL,                         -- 关联ID
  title TEXT,
  subtitle TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE home_recommends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on home_recommends" ON home_recommends FOR ALL USING (true);

-- =============================================
-- 7. 字典表 (dict_items)
-- =============================================
CREATE TABLE IF NOT EXISTS dict_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dict_type TEXT NOT NULL,                      -- 字典类型: element/category/region/supplier 等
  label TEXT NOT NULL,                          -- 显示名称
  value TEXT NOT NULL,                          -- 存储值
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES dict_items(id) ON DELETE SET NULL,  -- 支持级联
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dict_type ON dict_items(dict_type);

ALTER TABLE dict_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on dict_items" ON dict_items FOR ALL USING (true);

-- =============================================
-- 8. 用户表 (admin_users) — 权限管理用
-- =============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT,                           -- bcrypt哈希
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('super_admin', 'admin', 'editor', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on admin_users" ON admin_users FOR ALL USING (true);

-- 初始化管理员账号（密码需要通过应用层设置）
INSERT INTO admin_users (username, display_name, role) VALUES ('eric', 'Eric', 'super_admin')
ON CONFLICT (username) DO NOTHING;

-- =============================================
-- 9. 操作日志表 (audit_logs)
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,                         -- create/update/delete/login/logout
  target_type TEXT NOT NULL,                    -- product/country/banner/user 等
  target_id UUID,
  detail JSONB,                                 -- 变更详情
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on audit_logs" ON audit_logs FOR ALL USING (true);

-- =============================================
-- 10. 预设字典数据初始化
-- =============================================

-- 10a. 五行元素（元系列子分类）
INSERT INTO dict_items (dict_type, label, value, sort_order) VALUES
('element', '金', 'jin', 1),
('element', '木', 'mu', 2),
('element', '水', 'shui', 3),
('element', '火', 'huo', 4),
('element', '土', 'tu', 5)
ON CONFLICT DO NOTHING;

-- 10b. 产品子分类（完整13个）— 用于后台下拉选择
INSERT INTO dict_items (dict_type, label, value, parent_id, sort_order) VALUES
-- 元系列 · 五行
('subcategory', '金', 'jin', NULL, 1),
('subcategory', '木', 'mu', NULL, 2),
('subcategory', '水', 'shui', NULL, 3),
('subcategory', '火', 'huo', NULL, 4),
('subcategory', '土', 'tu', NULL, 5),
-- 和系列 · 身心灵魂
('subcategory', '身体', 'body', NULL, 6),
('subcategory', '心智', 'mind', NULL, 7),
('subcategory', '灵魂', 'soul', NULL, 8),
-- 生系列 · 净润舒
('subcategory', '清净', 'clear', NULL, 9),
('subcategory', '润养', 'nourish', NULL, 10),
('subcategory', '舒缓', 'soothe', NULL, 11),
-- 香系列 · 空间美学
('subcategory', '芳香美学', 'aesthetic', NULL, 12),
('subcategory', '凝思之物', 'meditation', NULL, 13)
ON CONFLICT DO NOTHING;

-- 10c. 区域分类
INSERT INTO dict_items (dict_type, label, value, sort_order) VALUES
('region', '欧洲', 'europe', 1),
('region', '亚洲', 'asia', 2),
('region', '非洲', 'africa', 3),
('region', '美洲/大洋洲', 'americas', 4),
('region', '神州（中国）', 'china', 5)
ON CONFLICT DO NOTHING;

-- 10d. 提炼方式
INSERT INTO dict_items (dict_type, label, value, sort_order) VALUES
('extraction_method', '蒸馏萃取', 'distillation', 1),
('extraction_method', '压榨法', 'expression', 2),
('extraction_method', '溶剂萃取', 'solvent_extraction', 3),
('extraction_method', 'CO2超临界萃取', 'co2_extraction', 4),
('extraction_method', '脂吸法', 'enfleurage', 5),
('extraction_method', '浸泡油', 'infusion', 6)
ON CONFLICT DO NOTHING;

-- 10e. 角色权限
INSERT INTO dict_items (dict_type, label, value, sort_order) VALUES
('role', '超级管理员', 'super_admin', 1),
('role', '管理员', 'admin', 2),
('role', '编辑', 'editor', 3),
('role', '只读', 'viewer', 4)
ON CONFLICT DO NOTHING;

-- 10f. 系列信息（4大系列）
INSERT INTO dict_items (dict_type, label, value, sort_order) VALUES
('series', '元 · 单方 / 极境生存原力', 'yuan', 1),
('series', '和 · 复方 / 科学频率重构', 'he', 2),
('series', '生 · 纯露 / 植物生命之水', 'sheng', 3),
('series', '香 · 空间 / 极简芳香美学', 'jing', 4)
ON CONFLICT DO NOTHING;

-- =============================================
-- 完成！
-- =============================================
SELECT 
  '✅ CMS 数据库 Schema v2 升级完成！' as status,
  (SELECT count(*) FROM products) as products_count,
  (SELECT count(*) FROM countries) as countries_count,
  (SELECT count(*) FROM series) as series_count;
