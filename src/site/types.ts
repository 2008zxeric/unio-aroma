/**
 * UNIO AROMA 前台数据库类型
 * 简化版，仅包含前台需要的字段
 */

// ---- 系列枚举 ----
export type SeriesCode = 'yuan' | 'he' | 'sheng' | 'jing';

// ---- 系列信息 ----
export interface Series {
  id: string;
  code: SeriesCode;
  name_cn: string;
  name_en: string;
  description?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
}

// ---- 产品 ----
export interface Product {
  id: string;
  series_id?: string;
  country_id?: string;
  code: string;
  name_cn: string;
  name_en?: string;
  element?: string;
  category?: string;
  group_name?: string;
  description?: string;
  benefits?: string[];
  usage?: string;
  price_5ml?: number;
  price_10ml?: number;
  price_15ml?: number;
  price_30ml?: number;
  price_100ml?: number;
  price_piece?: number;
  price?: number;
  xiaohongshu_url?: string;
  image_url?: string;
  gallery_urls?: string[];
  narrative?: string;
  alice_lab?: string;
  specification?: string;
  // 新增字段
  scientific_name?: string;       // 学名（拉丁名）
  short_desc?: string;           // 短描述/特点提炼
  origin?: string;               // 产品产地（国家/地区）
  extraction_method?: string;    // 提炼方式（蒸馏/冷压榨/溶剂等）
  extraction_site?: string;       // 萃取部位（花、叶、木质、果皮等）
  fragrance_notes?: string;       // 香调描述
  appearance?: string;            // 外观/色泽
  shelf_life?: string;            // 保质期
  net_weight?: string;            // 净重
  usage_scenarios?: string;       // 使用场景
  is_active: boolean;
  sort_order: number;
  series_code?: SeriesCode;
  created_at: string;
  similar_ids?: string[];
}

// ---- 国家 ----
export interface Country {
  id: string;
  name_cn: string;
  name_en?: string;
  region?: string;
  sub_region?: string;
  description?: string;
  technical_info?: string;
  image_url?: string;
  scenery_url?: string;
  gallery_urls?: string[];
  eric_diary?: string;
  visit_count: number;
  is_active: boolean;
  sort_order: number;
  is_china_province?: boolean;
  product_ids?: string[];
}

// ---- Banner ----
export interface Banner {
  id: string;
  name: string;
  image_url: string;
  link_url?: string;
  position: string;
  is_active: boolean;
  sort_order: number;
}

// ---- 系列配置 ----
export const SERIES_CONFIG: Record<SeriesCode, {
  name_cn: string;
  name_en: string;
  fullName_cn: string;
  fullName_en: string;
  description: string;
  icon: string;
}> = {
  yuan: {
    name_cn: '元',
    name_en: 'Yuan',
    fullName_cn: '元 · 单方',
    fullName_en: 'Origin Singles',
    description: '极境生存原力',
    icon: 'shield'
  },
  he: {
    name_cn: '和',
    name_en: 'Harmony',
    fullName_cn: '和 · 复方',
    fullName_en: 'Clinical Blends',
    description: '科学频率重构',
    icon: 'sparkles'
  },
  sheng: {
    name_cn: '生',
    name_en: 'Life',
    fullName_cn: '生 · 纯露',
    fullName_en: 'Hydrosol',
    description: '植物生命之水',
    icon: 'droplets'
  },
  jing: {
    name_cn: '香',
    name_en: 'Jing',
    fullName_cn: '香 · 空间',
    fullName_en: 'Aesthetic Living',
    description: '极简芳香美学',
    icon: 'wind'
  }
};

// ---- 子分类标签 ----
export const ELEMENT_LABELS: Record<string, string> = {
  // 元·五行（按植物部位归类）
  metal: 'Metal · 金（果实/种子）',
  wood: 'Wood · 木（木质/树皮）',
  water: 'Water · 水（叶/草）',
  fire: 'Fire · 火（花）',
  earth: 'Earth · 土（根/树脂）',
  base: 'Base · 基础油',
  // 和·身心
  body: 'Body · 身体',
  mind: 'Mind · 心智',
  soul: 'Soul · 灵魂',
  // 生·纯露
  clear: 'Clear · 清净',
  nourish: 'Nourish · 润养',
  soothe: 'Soothe · 舒缓',
  // 香·空间
  aesthetic: 'Aroma · 芳香美学',
  meditation: 'Zen · 凝思之物'
};
