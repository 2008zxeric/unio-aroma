-- ============================================
-- 全球国家/地区 + 中国省份 完整数据导入
-- 在 Supabase SQL Editor 中执行
-- 安全幂等：使用 WHERE NOT EXISTS 避免重复插入
-- 区域分类：欧洲、亚洲、非洲、美洲、大洋洲、神州（中国省份）
-- 总计：约 200 个国家/地区 + 34 个中国省级行政区
-- ============================================

-- 先确保 countries 表有 flag_emoji 字段
ALTER TABLE countries ADD COLUMN IF NOT EXISTS flag_emoji TEXT;

-- =============================================
-- 1. 欧洲 (48国)
-- =============================================
INSERT INTO countries (name_cn, name_en, region, sub_region, flag_emoji, sort_order, is_active)
SELECT v.*
FROM (VALUES
  ('法国', 'France', '欧洲', '西欧', '🇫🇷', 101, true),
  ('德国', 'Germany', '欧洲', '西欧', '🇩🇪', 102, true),
  ('英国', 'United Kingdom', '欧洲', '西欧', '🇬🇧', 103, true),
  ('意大利', 'Italy', '欧洲', '南欧', '🇮🇹', 104, true),
  ('西班牙', 'Spain', '欧洲', '南欧', '🇪🇸', 105, true),
  ('葡萄牙', 'Portugal', '欧洲', '南欧', '🇵🇹', 106, true),
  ('荷兰', 'Netherlands', '欧洲', '西欧', '🇳🇱', 107, true),
  ('比利时', 'Belgium', '欧洲', '西欧', '🇧🇪', 108, true),
  ('卢森堡', 'Luxembourg', '欧洲', '西欧', '🇱🇺', 109, true),
  ('瑞士', 'Switzerland', '欧洲', '西欧', '🇨🇭', 110, true),
  ('奥地利', 'Austria', '欧洲', '中欧', '🇦🇹', 111, true),
  ('爱尔兰', 'Ireland', '欧洲', '西欧', '🇮🇪', 112, true),
  ('瑞典', 'Sweden', '欧洲', '北欧', '🇸🇪', 120, true),
  ('挪威', 'Norway', '欧洲', '北欧', '🇳🇴', 121, true),
  ('丹麦', 'Denmark', '欧洲', '北欧', '🇩🇰', 122, true),
  ('芬兰', 'Finland', '欧洲', '北欧', '🇫🇮', 123, true),
  ('冰岛', 'Iceland', '欧洲', '北欧', '🇮🇸', 124, true),
  ('希腊', 'Greece', '欧洲', '南欧', '🇬🇷', 130, true),
  ('克罗地亚', 'Croatia', '欧洲', '南欧', '🇭🇷', 131, true),
  ('塞尔维亚', 'Serbia', '欧洲', '南欧', '🇷🇸', 132, true),
  ('斯洛文尼亚', 'Slovenia', '欧洲', '南欧', '🇸🇮', 133, true),
  ('波斯尼亚和黑塞哥维那', 'Bosnia and Herzegovina', '欧洲', '南欧', '🇧🇦', 134, true),
  ('黑山', 'Montenegro', '欧洲', '南欧', '🇲🇪', 135, true),
  ('北马其顿', 'North Macedonia', '欧洲', '南欧', '🇲🇰', 136, true),
  ('阿尔巴尼亚', 'Albania', '欧洲', '南欧', '🇦🇱', 137, true),
  ('保加利亚', 'Bulgaria', '欧洲', '南欧', '🇧🇬', 138, true),
  ('罗马尼亚', 'Romania', '欧洲', '南欧', '🇷🇴', 139, true),
  ('马耳他', 'Malta', '欧洲', '南欧', '🇲🇹', 140, true),
  ('塞浦路斯', 'Cyprus', '欧洲', '南欧', '🇨🇾', 141, true),
  ('波兰', 'Poland', '欧洲', '中东欧', '🇵🇱', 150, true),
  ('捷克', 'Czech Republic', '欧洲', '中东欧', '🇨🇿', 151, true),
  ('斯洛伐克', 'Slovakia', '欧洲', '中东欧', '🇸🇰', 152, true),
  ('匈牙利', 'Hungary', '欧洲', '中东欧', '🇭🇺', 153, true),
  ('乌克兰', 'Ukraine', '欧洲', '中东欧', '🇺🇦', 154, true),
  ('白俄罗斯', 'Belarus', '欧洲', '中东欧', '🇧🇾', 155, true),
  ('摩尔多瓦', 'Moldova', '欧洲', '中东欧', '🇲🇩', 156, true),
  ('立陶宛', 'Lithuania', '欧洲', '波罗的海', '🇱🇹', 157, true),
  ('拉脱维亚', 'Latvia', '欧洲', '波罗的海', '🇱🇻', 158, true),
  ('爱沙尼亚', 'Estonia', '欧洲', '波罗的海', '🇪🇪', 159, true),
  ('俄罗斯', 'Russia', '欧洲', '东欧', '🇷🇺', 160, true),
  ('土耳其', 'Turkey', '欧洲', '跨洲', '🇹🇷', 161, true),
  ('格鲁吉亚', 'Georgia', '欧洲', '外高加索', '🇬🇪', 162, true),
  ('亚美尼亚', 'Armenia', '欧洲', '外高加索', '🇦🇲', 163, true),
  ('阿塞拜疆', 'Azerbaijan', '欧洲', '外高加索', '🇦🇿', 164, true),
  ('列支敦士登', 'Liechtenstein', '欧洲', '西欧', '🇱🇮', 165, true),
  ('摩纳哥', 'Monaco', '欧洲', '西欧', '🇲🇨', 166, true),
  ('安道尔', 'Andorra', '欧洲', '西欧', '🇦🇩', 167, true),
  ('圣马力诺', 'San Marino', '欧洲', '南欧', '🇸🇲', 168, true),
  ('梵蒂冈', 'Vatican City', '欧洲', '南欧', '🇻🇦', 169, true)
) AS v(name_cn, name_en, region, sub_region, flag_emoji, sort_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM countries c WHERE c.name_cn = v.name_cn);

-- =============================================
-- 2. 亚洲 (48国)
-- =============================================
INSERT INTO countries (name_cn, name_en, region, sub_region, flag_emoji, sort_order, is_active)
SELECT v.*
FROM (VALUES
  ('日本', 'Japan', '亚洲', '东亚', '🇯🇵', 201, true),
  ('韩国', 'South Korea', '亚洲', '东亚', '🇰🇷', 202, true),
  ('朝鲜', 'North Korea', '亚洲', '东亚', '🇰🇵', 203, true),
  ('蒙古', 'Mongolia', '亚洲', '东亚', '🇲🇳', 204, true),
  ('越南', 'Vietnam', '亚洲', '东南亚', '🇻🇳', 210, true),
  ('泰国', 'Thailand', '亚洲', '东南亚', '🇹🇭', 211, true),
  ('缅甸', 'Myanmar', '亚洲', '东南亚', '🇲🇲', 212, true),
  ('柬埔寨', 'Cambodia', '亚洲', '东南亚', '🇰🇭', 213, true),
  ('老挝', 'Laos', '亚洲', '东南亚', '🇱🇦', 214, true),
  ('马来西亚', 'Malaysia', '亚洲', '东南亚', '🇲🇾', 215, true),
  ('新加坡', 'Singapore', '亚洲', '东南亚', '🇸🇬', 216, true),
  ('印度尼西亚', 'Indonesia', '亚洲', '东南亚', '🇮🇩', 217, true),
  ('菲律宾', 'Philippines', '亚洲', '东南亚', '🇵🇭', 218, true),
  ('文莱', 'Brunei', '亚洲', '东南亚', '🇧🇳', 219, true),
  ('东帝汶', 'Timor-Leste', '亚洲', '东南亚', '🇹🇱', 220, true),
  ('印度', 'India', '亚洲', '南亚', '🇮🇳', 225, true),
  ('斯里兰卡', 'Sri Lanka', '亚洲', '南亚', '🇱🇰', 226, true),
  ('尼泊尔', 'Nepal', '亚洲', '南亚', '🇳🇵', 227, true),
  ('孟加拉国', 'Bangladesh', '亚洲', '南亚', '🇧🇩', 228, true),
  ('巴基斯坦', 'Pakistan', '亚洲', '南亚', '🇵🇰', 229, true),
  ('不丹', 'Bhutan', '亚洲', '南亚', '🇧🇹', 230, true),
  ('马尔代夫', 'Maldives', '亚洲', '南亚', '🇲🇻', 231, true),
  ('哈萨克斯坦', 'Kazakhstan', '亚洲', '中亚', '🇰🇿', 235, true),
  ('乌兹别克斯坦', 'Uzbekistan', '亚洲', '中亚', '🇺🇿', 236, true),
  ('土库曼斯坦', 'Turkmenistan', '亚洲', '中亚', '🇹🇲', 237, true),
  ('塔吉克斯坦', 'Tajikistan', '亚洲', '中亚', '🇹🇯', 238, true),
  ('吉尔吉斯斯坦', 'Kyrgyzstan', '亚洲', '中亚', '🇰🇬', 239, true),
  ('阿富汗', 'Afghanistan', '亚洲', '中亚', '🇦🇫', 240, true),
  ('以色列', 'Israel', '亚洲', '西亚', '🇮🇱', 245, true),
  ('约旦', 'Jordan', '亚洲', '西亚', '🇯🇴', 246, true),
  ('黎巴嫩', 'Lebanon', '亚洲', '西亚', '🇱🇧', 247, true),
  ('叙利亚', 'Syria', '亚洲', '西亚', '🇸🇾', 248, true),
  ('伊拉克', 'Iraq', '亚洲', '西亚', '🇮🇶', 249, true),
  ('伊朗', 'Iran', '亚洲', '西亚', '🇮🇷', 250, true),
  ('沙特阿拉伯', 'Saudi Arabia', '亚洲', '西亚', '🇸🇦', 251, true),
  ('阿联酋', 'United Arab Emirates', '亚洲', '西亚', '🇦🇪', 252, true),
  ('卡塔尔', 'Qatar', '亚洲', '西亚', '🇶🇦', 253, true),
  ('科威特', 'Kuwait', '亚洲', '西亚', '🇰🇼', 254, true),
  ('阿曼', 'Oman', '亚洲', '西亚', '🇴🇲', 255, true),
  ('也门', 'Yemen', '亚洲', '西亚', '🇾🇪', 256, true),
  ('巴林', 'Bahrain', '亚洲', '西亚', '🇧🇭', 257, true),
  ('巴勒斯坦', 'Palestine', '亚洲', '西亚', '🇵🇸', 258, true)
) AS v(name_cn, name_en, region, sub_region, flag_emoji, sort_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM countries c WHERE c.name_cn = v.name_cn);

-- =============================================
-- 3. 非洲 (54国)
-- =============================================
INSERT INTO countries (name_cn, name_en, region, sub_region, flag_emoji, sort_order, is_active)
SELECT v.*
FROM (VALUES
  ('埃及', 'Egypt', '非洲', '北非', '🇪🇬', 301, true),
  ('摩洛哥', 'Morocco', '非洲', '北非', '🇲🇦', 302, true),
  ('阿尔及利亚', 'Algeria', '非洲', '北非', '🇩🇿', 303, true),
  ('突尼斯', 'Tunisia', '非洲', '北非', '🇹🇳', 304, true),
  ('利比亚', 'Libya', '非洲', '北非', '🇱🇾', 305, true),
  ('苏丹', 'Sudan', '非洲', '北非', '🇸🇩', 306, true),
  ('南苏丹', 'South Sudan', '非洲', '北非', '🇸🇸', 307, true),
  ('肯尼亚', 'Kenya', '非洲', '东非', '🇰🇪', 310, true),
  ('坦桑尼亚', 'Tanzania', '非洲', '东非', '🇹🇿', 311, true),
  ('乌干达', 'Uganda', '非洲', '东非', '🇺🇬', 312, true),
  ('埃塞俄比亚', 'Ethiopia', '非洲', '东非', '🇪🇹', 313, true),
  ('索马里', 'Somalia', '非洲', '东非', '🇸🇴', 314, true),
  ('卢旺达', 'Rwanda', '非洲', '东非', '🇷🇼', 315, true),
  ('布隆迪', 'Burundi', '非洲', '东非', '🇧🇮', 316, true),
  ('厄立特里亚', 'Eritrea', '非洲', '东非', '🇪🇷', 317, true),
  ('吉布提', 'Djibouti', '非洲', '东非', '🇩🇯', 318, true),
  ('马达加斯加', 'Madagascar', '非洲', '东非', '🇲🇬', 319, true),
  ('莫桑比克', 'Mozambique', '非洲', '东非', '🇲🇿', 320, true),
  ('马拉维', 'Malawi', '非洲', '东非', '🇲🇼', 321, true),
  ('赞比亚', 'Zambia', '非洲', '东非', '🇿🇲', 322, true),
  ('津巴布韦', 'Zimbabwe', '非洲', '东非', '🇿🇼', 323, true),
  ('科摩罗', 'Comoros', '非洲', '东非', '🇰🇲', 324, true),
  ('塞舌尔', 'Seychelles', '非洲', '东非', '🇸🇨', 325, true),
  ('毛里求斯', 'Mauritius', '非洲', '东非', '🇲🇺', 326, true),
  ('尼日利亚', 'Nigeria', '非洲', '西非', '🇳🇬', 330, true),
  ('加纳', 'Ghana', '非洲', '西非', '🇬🇭', 331, true),
  ('科特迪瓦', 'Ivory Coast', '非洲', '西非', '🇨🇮', 332, true),
  ('塞内加尔', 'Senegal', '非洲', '西非', '🇸🇳', 333, true),
  ('马里', 'Mali', '非洲', '西非', '🇲🇱', 334, true),
  ('布基纳法索', 'Burkina Faso', '非洲', '西非', '🇧🇫', 335, true),
  ('尼日尔', 'Niger', '非洲', '西非', '🇳🇪', 336, true),
  ('几内亚', 'Guinea', '非洲', '西非', '🇬🇳', 337, true),
  ('几内亚比绍', 'Guinea-Bissau', '非洲', '西非', '🇬🇼', 338, true),
  ('塞拉利昂', 'Sierra Leone', '非洲', '西非', '🇸🇱', 339, true),
  ('利比里亚', 'Liberia', '非洲', '西非', '🇱🇷', 340, true),
  ('多哥', 'Togo', '非洲', '西非', '🇹🇬', 341, true),
  ('贝宁', 'Benin', '非洲', '西非', '🇧🇯', 342, true),
  ('喀麦隆', 'Cameroon', '非洲', '中非', '🇨🇲', 343, true),
  ('毛里塔尼亚', 'Mauritania', '非洲', '西非', '🇲🇷', 344, true),
  ('佛得角', 'Cape Verde', '非洲', '西非', '🇨🇻', 345, true),
  ('冈比亚', 'Gambia', '非洲', '西非', '🇬🇲', 346, true),
  ('刚果民主共和国', 'Democratic Republic of the Congo', '非洲', '中非', '🇨🇩', 350, true),
  ('刚果共和国', 'Republic of the Congo', '非洲', '中非', '🇨🇬', 351, true),
  ('中非共和国', 'Central African Republic', '非洲', '中非', '🇨🇫', 352, true),
  ('乍得', 'Chad', '非洲', '中非', '🇹🇩', 353, true),
  ('赤道几内亚', 'Equatorial Guinea', '非洲', '中非', '🇬🇶', 354, true),
  ('加蓬', 'Gabon', '非洲', '中非', '🇬🇦', 355, true),
  ('圣多美和普林西比', 'Sao Tome and Principe', '非洲', '中非', '🇸🇹', 356, true),
  ('南非', 'South Africa', '非洲', '南部非洲', '🇿🇦', 360, true),
  ('纳米比亚', 'Namibia', '非洲', '南部非洲', '🇳🇦', 361, true),
  ('博茨瓦纳', 'Botswana', '非洲', '南部非洲', '🇧🇼', 362, true),
  ('安哥拉', 'Angola', '非洲', '南部非洲', '🇦🇴', 363, true),
  ('莱索托', 'Lesotho', '非洲', '南部非洲', '🇱🇸', 365, true),
  ('斯威士兰', 'Eswatini', '非洲', '南部非洲', '🇸🇿', 366, true)
) AS v(name_cn, name_en, region, sub_region, flag_emoji, sort_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM countries c WHERE c.name_cn = v.name_cn);

-- =============================================
-- 4. 美洲 (35国)
-- =============================================
INSERT INTO countries (name_cn, name_en, region, sub_region, flag_emoji, sort_order, is_active)
SELECT v.*
FROM (VALUES
  ('美国', 'United States', '美洲', '北美洲', '🇺🇸', 401, true),
  ('加拿大', 'Canada', '美洲', '北美洲', '🇨🇦', 402, true),
  ('墨西哥', 'Mexico', '美洲', '北美洲', '🇲🇽', 403, true),
  ('危地马拉', 'Guatemala', '美洲', '中美洲', '🇬🇹', 410, true),
  ('伯利兹', 'Belize', '美洲', '中美洲', '🇧🇿', 411, true),
  ('洪都拉斯', 'Honduras', '美洲', '中美洲', '🇭🇳', 412, true),
  ('萨尔瓦多', 'El Salvador', '美洲', '中美洲', '🇸🇻', 413, true),
  ('尼加拉瓜', 'Nicaragua', '美洲', '中美洲', '🇳🇮', 414, true),
  ('哥斯达黎加', 'Costa Rica', '美洲', '中美洲', '🇨🇷', 415, true),
  ('巴拿马', 'Panama', '美洲', '中美洲', '🇵🇦', 416, true),
  ('古巴', 'Cuba', '美洲', '加勒比海', '🇨🇺', 420, true),
  ('牙买加', 'Jamaica', '美洲', '加勒比海', '🇯🇲', 421, true),
  ('海地', 'Haiti', '美洲', '加勒比海', '🇭🇹', 422, true),
  ('多米尼加共和国', 'Dominican Republic', '美洲', '加勒比海', '🇩🇴', 423, true),
  ('巴巴多斯', 'Barbados', '美洲', '加勒比海', '🇧🇧', 424, true),
  ('特立尼达和多巴哥', 'Trinidad and Tobago', '美洲', '加勒比海', '🇹🇹', 425, true),
  ('巴哈马', 'Bahamas', '美洲', '加勒比海', '🇧🇸', 426, true),
  ('格林纳达', 'Grenada', '美洲', '加勒比海', '🇬🇩', 427, true),
  ('多米尼克', 'Dominica', '美洲', '加勒比海', '🇩🇲', 428, true),
  ('圣卢西亚', 'Saint Lucia', '美洲', '加勒比海', '🇱🇨', 429, true),
  ('安提瓜和巴布达', 'Antigua and Barbuda', '美洲', '加勒比海', '🇦🇬', 430, true),
  ('圣文森特和格林纳丁斯', 'Saint Vincent and the Grenadines', '美洲', '加勒比海', '🇻🇨', 431, true),
  ('圣基茨和尼维斯', 'Saint Kitts and Nevis', '美洲', '加勒比海', '🇰🇳', 432, true),
  ('巴西', 'Brazil', '美洲', '南美洲', '🇧🇷', 440, true),
  ('阿根廷', 'Argentina', '美洲', '南美洲', '🇦🇷', 441, true),
  ('智利', 'Chile', '美洲', '南美洲', '🇨🇱', 442, true),
  ('秘鲁', 'Peru', '美洲', '南美洲', '🇵🇪', 443, true),
  ('哥伦比亚', 'Colombia', '美洲', '南美洲', '🇨🇴', 444, true),
  ('委内瑞拉', 'Venezuela', '美洲', '南美洲', '🇻🇪', 445, true),
  ('厄瓜多尔', 'Ecuador', '美洲', '南美洲', '🇪🇨', 446, true),
  ('玻利维亚', 'Bolivia', '美洲', '南美洲', '🇧🇴', 447, true),
  ('巴拉圭', 'Paraguay', '美洲', '南美洲', '🇵🇾', 448, true),
  ('乌拉圭', 'Uruguay', '美洲', '南美洲', '🇺🇾', 449, true),
  ('圭亚那', 'Guyana', '美洲', '南美洲', '🇬🇾', 450, true),
  ('苏里南', 'Suriname', '美洲', '南美洲', '🇸🇷', 451, true)
) AS v(name_cn, name_en, region, sub_region, flag_emoji, sort_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM countries c WHERE c.name_cn = v.name_cn);

-- =============================================
-- 5. 大洋洲 (16国)
-- =============================================
INSERT INTO countries (name_cn, name_en, region, sub_region, flag_emoji, sort_order, is_active)
SELECT v.*
FROM (VALUES
  ('澳大利亚', 'Australia', '大洋洲', '澳大利亚', '🇦🇺', 501, true),
  ('新西兰', 'New Zealand', '大洋洲', '新西兰', '🇳🇿', 502, true),
  ('巴布亚新几内亚', 'Papua New Guinea', '大洋洲', '美拉尼西亚', '🇵🇬', 510, true),
  ('斐济', 'Fiji', '大洋洲', '美拉尼西亚', '🇫🇯', 511, true),
  ('所罗门群岛', 'Solomon Islands', '大洋洲', '美拉尼西亚', '🇸🇧', 512, true),
  ('瓦努阿图', 'Vanuatu', '大洋洲', '美拉尼西亚', '🇻🇺', 513, true),
  ('萨摩亚', 'Samoa', '大洋洲', '波利尼西亚', '🇼🇸', 520, true),
  ('汤加', 'Tonga', '大洋洲', '波利尼西亚', '🇹🇴', 521, true),
  ('基里巴斯', 'Kiribati', '大洋洲', '波利尼西亚', '🇰🇮', 522, true),
  ('图瓦卢', 'Tuvalu', '大洋洲', '波利尼西亚', '🇹🇻', 523, true),
  ('密克罗尼西亚联邦', 'Micronesia', '大洋洲', '密克罗尼西亚', '🇫🇲', 530, true),
  ('马绍尔群岛', 'Marshall Islands', '大洋洲', '密克罗尼西亚', '🇲🇭', 531, true),
  ('帕劳', 'Palau', '大洋洲', '密克罗尼西亚', '🇵🇼', 532, true),
  ('瑙鲁', 'Nauru', '大洋洲', '密克罗尼西亚', '🇳🇷', 533, true),
  ('库克群岛', 'Cook Islands', '大洋洲', '波利尼西亚', '🇨🇰', 534, true),
  ('纽埃', 'Niue', '大洋洲', '波利尼西亚', '🇳🇺', 535, true)
) AS v(name_cn, name_en, region, sub_region, flag_emoji, sort_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM countries c WHERE c.name_cn = v.name_cn);

-- =============================================
-- 6. 神州（中国34个省级行政区）
-- =============================================
INSERT INTO countries (name_cn, name_en, region, sub_region, flag_emoji, sort_order, is_active, is_china_province)
SELECT v.*
FROM (VALUES
  ('北京市', 'Beijing', '神州', '华北', '🏯', 601, true, true),
  ('天津市', 'Tianjin', '神州', '华北', '🏯', 602, true, true),
  ('河北省', 'Hebei', '神州', '华北', '🏯', 603, true, true),
  ('山西省', 'Shanxi', '神州', '华北', '🏯', 604, true, true),
  ('内蒙古自治区', 'Inner Mongolia', '神州', '华北', '🏯', 605, true, true),
  ('辽宁省', 'Liaoning', '神州', '东北', '🏔️', 610, true, true),
  ('吉林省', 'Jilin', '神州', '东北', '🏔️', 611, true, true),
  ('黑龙江省', 'Heilongjiang', '神州', '东北', '🏔️', 612, true, true),
  ('上海市', 'Shanghai', '神州', '华东', '🌆', 615, true, true),
  ('江苏省', 'Jiangsu', '神州', '华东', '🌆', 616, true, true),
  ('浙江省', 'Zhejiang', '神州', '华东', '🌆', 617, true, true),
  ('安徽省', 'Anhui', '神州', '华东', '🌆', 618, true, true),
  ('福建省', 'Fujian', '神州', '华东', '🌆', 619, true, true),
  ('江西省', 'Jiangxi', '神州', '华东', '🌆', 620, true, true),
  ('山东省', 'Shandong', '神州', '华东', '🌆', 621, true, true),
  ('河南省', 'Henan', '神州', '华中', '🌾', 625, true, true),
  ('湖北省', 'Hubei', '神州', '华中', '🌾', 626, true, true),
  ('湖南省', 'Hunan', '神州', '华中', '🌾', 627, true, true),
  ('广东省', 'Guangdong', '神州', '华南', '🌴', 630, true, true),
  ('广西壮族自治区', 'Guangxi', '神州', '华南', '🌴', 631, true, true),
  ('海南省', 'Hainan', '神州', '华南', '🌴', 632, true, true),
  ('重庆市', 'Chongqing', '神州', '西南', '🏔️', 635, true, true),
  ('四川省', 'Sichuan', '神州', '西南', '🏔️', 636, true, true),
  ('贵州省', 'Guizhou', '神州', '西南', '🏔️', 637, true, true),
  ('云南省', 'Yunnan', '神州', '西南', '🏔️', 638, true, true),
  ('西藏自治区', 'Tibet', '神州', '西南', '🏔️', 639, true, true),
  ('陕西省', 'Shaanxi', '神州', '西北', '🏜️', 640, true, true),
  ('甘肃省', 'Gansu', '神州', '西北', '🏜️', 641, true, true),
  ('青海省', 'Qinghai', '神州', '西北', '🏜️', 642, true, true),
  ('宁夏回族自治区', 'Ningxia', '神州', '西北', '🏜️', 643, true, true),
  ('新疆维吾尔自治区', 'Xinjiang', '神州', '西北', '🏜️', 644, true, true),
  ('香港特别行政区', 'Hong Kong', '神州', '港澳台', '🏢', 650, true, true),
  ('澳门特别行政区', 'Macau', '神州', '港澳台', '🏢', 651, true, true),
  ('台湾省', 'Taiwan', '神州', '港澳台', '🏢', 652, true, true)
) AS v(name_cn, name_en, region, sub_region, flag_emoji, sort_order, is_active, is_china_province)
WHERE NOT EXISTS (SELECT 1 FROM countries c WHERE c.name_cn = v.name_cn);

-- =============================================
-- 补充：给已有数据补充 flag_emoji（如果缺失）
-- =============================================
UPDATE countries SET flag_emoji = '🇫🇷' WHERE name_cn = '法国' AND (flag_emoji IS NULL OR flag_emoji = '');
UPDATE countries SET flag_emoji = '🇩🇪' WHERE name_cn = '德国' AND (flag_emoji IS NULL OR flag_emoji = '');
UPDATE countries SET flag_emoji = '🇦🇺' WHERE name_cn = '澳大利亚' AND (flag_emoji IS NULL OR flag_emoji = '');
UPDATE countries SET flag_emoji = '🇬🇧' WHERE name_cn = '英国' AND (flag_emoji IS NULL OR flag_emoji = '');
UPDATE countries SET flag_emoji = '🇯🇵' WHERE name_cn = '日本' AND (flag_emoji IS NULL OR flag_emoji = '');
UPDATE countries SET flag_emoji = '🇮🇳' WHERE name_cn = '印度' AND (flag_emoji IS NULL OR flag_emoji = '');
UPDATE countries SET flag_emoji = '🇧🇷' WHERE name_cn = '巴西' AND (flag_emoji IS NULL OR flag_emoji = '');
UPDATE countries SET flag_emoji = '🇮🇹' WHERE name_cn = '意大利' AND (flag_emoji IS NULL OR flag_emoji = '');
UPDATE countries SET flag_emoji = '🇪🇸' WHERE name_cn = '西班牙' AND (flag_emoji IS NULL OR flag_emoji = '');
UPDATE countries SET flag_emoji = '🇺🇸' WHERE name_cn = '美国' AND (flag_emoji IS NULL OR flag_emoji = '');

-- =============================================
-- 统计结果
-- =============================================
SELECT
  '✅ 全球国家/地区导入完成' as status,
  (SELECT count(*) FROM countries WHERE region = '欧洲') as "欧洲",
  (SELECT count(*) FROM countries WHERE region = '亚洲') as "亚洲",
  (SELECT count(*) FROM countries WHERE region = '非洲') as "非洲",
  (SELECT count(*) FROM countries WHERE region = '美洲') as "美洲",
  (SELECT count(*) FROM countries WHERE region = '大洋洲') as "大洋洲",
  (SELECT count(*) FROM countries WHERE region = '神州') as "神州",
  (SELECT count(*) FROM countries) as "总计";
