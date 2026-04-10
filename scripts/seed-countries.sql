-- ============================================
-- 国家/地区预录入数据
-- 覆盖所有精油常用产地 + COMMON_ORIGINS
-- 在 Supabase SQL Editor 中执行
-- ============================================

-- 先清空旧数据（谨慎！仅空表时使用）
-- DELETE FROM countries;

INSERT INTO countries (id, name_cn, name_en, region, sub_region, is_active, sort_order, visit_count, unlock_code) VALUES
-- === 欧洲 ===
  (gen_random_uuid(), '法国', 'France', '欧洲', '西欧', true, 1, 0, '0'),
  (gen_random_uuid(), '意大利', 'Italy', '欧洲', '南欧', true, 2, 0, '0'),
  (gen_random_uuid(), '德国', 'Germany', '欧洲', '西欧', true, 3, 0, '0'),
  (gen_random_uuid(), '保加利亚', 'Bulgaria', '欧洲', '东欧', true, 4, 0, '0'),
  (gen_random_uuid(), '英国', 'United Kingdom', '欧洲', '西欧', true, 5, 0, '0'),
  (gen_random_uuid(), '西班牙', 'Spain', '欧洲', '南欧', true, 6, 0, '0'),
  (gen_random_uuid(), '克罗地亚', 'Croatia', '欧洲', '南欧', true, 7, 0, '0'),
  (gen_random_uuid(), '乌克兰', 'Ukraine', '欧洲', '东欧', true, 8, 0, '0'),
  (gen_random_uuid(), '希腊', 'Greece', '欧洲', '南欧', true, 9, 0, '0'),
  (gen_random_uuid(), '奥地利', 'Austria', '欧洲', '中欧', true, 10, 0, '0'),

-- === 亚洲 ===
  (gen_random_uuid(), '印度', 'India', '亚洲', '南亚', true, 11, 0, '0'),
  (gen_random_uuid(), '中国', 'China', '神州', '', true, 12, 0, '0'),
  (gen_random_uuid(), '斯里兰卡', 'Sri Lanka', '亚洲', '南亚', true, 13, 0, '0'),
  (gen_random_uuid(), '越南', 'Vietnam', '亚洲', '东南亚', true, 14, 0, '0'),
  (gen_random_uuid(), '印度尼西亚', 'Indonesia', '亚洲', '东南亚', true, 15, 0, '0'),
  (gen_random_uuid(), '日本', 'Japan', '亚洲', '东亚', true, 16, 0, '0'),
  (gen_random_uuid(), '伊朗', 'Iran', '亚洲', '西亚', true, 17, 0, '0'),
  (gen_random_uuid(), '也门', 'Yemen', '亚洲', '西亚', true, 18, 0, '0'),
  (gen_random_uuid(), '以色列', 'Israel', '亚洲', '西亚', true, 19, 0, '0'),
  (gen_random_uuid(), '尼泊尔', 'Nepal', '亚洲', '南亚', true, 20, 0, '0'),
  (gen_random_uuid(), '阿富汗', 'Afghanistan', '亚洲', '中亚', true, 21, 0, '0'),

-- === 非洲 ===
  (gen_random_uuid(), '埃及', 'Egypt', '非洲', '北非', true, 22, 0, '0'),
  (gen_random_uuid(), '摩洛哥', 'Morocco', '非洲', '北非', true, 23, 0, '0'),
  (gen_random_uuid(), '马达加斯加', 'Madagascar', '非洲', '东非', true, 24, 0, '0'),
  (gen_random_uuid(), '南非', 'South Africa', '非洲', '南非', true, 25, 0, '0'),
  (gen_random_uuid(), '肯尼亚', 'Kenya', '非洲', '东非', true, 26, 0, '0'),
  (gen_random_uuid(), '阿尔及利亚', 'Algeria', '非洲', '北非', true, 27, 0, '0'),
  (gen_random_uuid(), '突尼斯', 'Tunisia', '非洲', '北非', true, 28, 0, '0'),
  (gen_random_uuid(), '科摩罗', 'Comoros', '非洲', '东非', true, 29, 0, '0'),
  (gen_random_uuid(), '埃塞俄比亚', 'Ethiopia', '非洲', '东非', true, 30, 0, '0'),

-- === 美洲 / 大洋洲 ===
  (gen_random_uuid(), '美国', 'United States', '美洲', '北美', true, 31, 0, '0'),
  (gen_random_uuid(), '巴西', 'Brazil', '美洲', '南美', true, 32, 0, '0'),
  (gen_random_uuid(), '澳大利亚', 'Australia', '大洋洲', '', true, 33, 0, '0'),
  (gen_random_uuid(), '新西兰', 'New Zealand', '大洋洲', '', true, 34, 0, '0'),
  (gen_random_uuid(), '加拿大', 'Canada', '美洲', '北美', true, 35, 0, '0'),
  (gen_random_uuid(), '危地马拉', 'Guatemala', '美洲', '中美', true, 36, 0, '0'),
  (gen_random_uuid(), '牙买加', 'Jamaica', '美洲', '加勒比', true, 37, 0, '0'),
  (gen_random_uuid(), '海地', 'Haiti', '美洲', '加勒比', true, 38, 0, '0'),
  (gen_random_uuid(), '秘鲁', 'Peru', '美洲', '南美', true, 39, 0, '0'),
  (gen_random_uuid(), '阿根廷', 'Argentina', '美洲', '南美', true, 40, 0, '0'),

-- === 神州（中国省份）===
  (gen_random_uuid(), '云南', 'Yunnan', '神州', '西南', true, 50, 0, '0'),
  (gen_random_uuid(), '新疆', 'Xinjiang', '神州', '西北', true, 51, 0, '0'),
  (gen_random_uuid(), '广西', 'Guangxi', '神州', '华南', true, 52, 0, '0'),
  (gen_random_uuid(), '广东', 'Guangdong', '神州', '华南', true, 53, 0, '0'),
  (gen_random_uuid(), '浙江', 'Zhejiang', '神州', '华东', true, 54, 0, '0')
ON CONFLICT DO NOTHING;

SELECT 
  '✅ 国家预录入完成！' as status,
  count(*) as total_countries,
  count(*) FILTER (WHERE region = '欧洲') as "欧洲",
  count(*) FILTER (WHERE region = '亚洲') as "亚洲",
  count(*) FILTER (WHERE region = '非洲') as "非洲",
  count(*) FILTER (WHERE region = '美洲') as "美洲",
  count(*) FILTER (WHERE region = '大洋洲' OR region = '') as "大洋洲",
  count(*) FILTER (WHERE region = '神州') as "神州"
FROM countries;
