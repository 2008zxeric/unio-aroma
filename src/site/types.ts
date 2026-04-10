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
  price_piece?: number;
  xiaohongshu_url?: string;
  image_url?: string;
  gallery_urls?: string[];
  narrative?: string;
  alice_lab?: string;
  specification?: string;
  is_active: boolean;
  sort_order: number;
  series_code?: SeriesCode;
  created_at: string;
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
  // 五行
  jin: '金',
  mu: '木',
  shui: '水',
  huo: '火',
  tu: '土',
  // 身心
  body: '身体',
  mind: '心智',
  soul: '灵魂',
  // 纯露
  clear: '清净',
  nourish: '润养',
  soothe: '舒缓',
  // 香
  aesthetic: '芳香美学',
  meditation: '凝思之物'
};
