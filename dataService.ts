import { supabase } from './supabase';
import { ScentItem, Destination } from './types';

const RAW_BASE = 'https://raw.githubusercontent.com/2008zxeric/unio-aroma/main/assets/';
const ERIC_PHOTO_BASE = `${RAW_BASE}ericphoto/`;
const RAW_DEST = `${RAW_BASE}destinations/`;
const PROVINCE_BASE = `${RAW_BASE}province/`;
const CACHE_V = '?v=1008.67';

// 记忆照片前缀映射（3字母缩写 → 文件前缀）
const PHOTO_PREFIX_MAP: Record<string, string> = {
  'w_thai': 'tha', 'w_in': 'inn', 'w_hk': '', 'w_my': 'mal', 'w_id': '',
  'w_uae': 'uae', 'w_vn': 'vie', 'w_jp': '', 'w_phl': '', 'w_ir': '',
  'w_sg': '', 'w_kr': '', 'w_np': '', 'w_tr': 'tur', 'w_kz': '',
  'w_jo': 'jor', 'w_mac': '', 'w_kh': '', 'w_kp': '', 'w_lk': '',
  'w_fr': '', 'w_de': '', 'w_it': '', 'w_uk': '', 'w_is': '',
  'w_es': '', 'w_nl': 'net', 'w_pl': '', 'w_at': '', 'w_dk': '',
  'w_hu': '', 'w_mc': '', 'w_lu': '', 'w_pt': '', 'w_bg': '',
  'w_sa': '', 'w_eg': '', 'w_ke': '', 'w_mg': '', 'w_zw': '',
  'w_mu': '', 'w_ma': '', 'w_us': '', 'w_ca': '', 'w_br': '',
  'w_au': '', 'w_an': '', 'w_mx': '', 'w_ar': '', 'w_ht': '',
  'w_pe': '', 'w_cu': '',
};

// 省份文件名映射
const PROVINCE_FILE_MAP: Record<string, string> = {
  '北京': 'beijing.webp', '天津': 'tianjin.webp', '河北': 'hebei.webp', '山西': 'shanxi.webp', '内蒙古': 'neimenggu.webp',
  '辽宁': 'liaoning.webp', '吉林': 'jilin.webp', '黑龙江': 'heilongjiang.webp',
  '上海': 'shanghai.webp', '江苏': 'jiangsu.webp', '浙江': 'zhejiang.webp', '安徽': 'anhui.webp', '福建': 'fujian.webp', '江西': 'jiangxi.webp', '山东': 'shandong.webp', '台湾': 'taiwan.webp',
  '河南': 'henan.webp', '湖北': 'hubei.webp', '湖南': 'hunan.webp',
  '广东': 'guangdong.webp', '广西': 'guangxi.webp', '海南': 'hainan.webp',
  '香港': 'Hongkong.webp', '澳门': 'Macau.webp',
  '重庆': 'chongqing.webp', '四川': 'sichuan.webp', '贵州': 'guizhou.webp', '云南': 'yunnan.webp', '西藏': 'xizang.webp',
  '陕西': 'shannxi.webp', '甘肃': 'gansu.webp', '青海': 'qinghai.webp', '宁夏': 'ningxia.webp', '新疆': 'xinjiang.webp'
};

// 记忆照片映射（从 constants.tsx 复制，匹配原始数据源）
const MEMORY_PHOTOS_MAP: Record<string, string[]> = {};

// 从 code 推导记忆照片 URL
function getMemoryPhotos(code: string): string[] {
  if (code.startsWith('cn_')) {
    const provName = code.replace('cn_', '');
    const fileName = PROVINCE_FILE_MAP[provName] || 'beijing.webp';
    const baseUrl = (provName === '香港' || provName === '澳门') ? RAW_DEST : PROVINCE_BASE;
    return [
      `${baseUrl}${fileName}${CACHE_V}`,
      `${baseUrl}${fileName}${CACHE_V}`,
      `${baseUrl}${fileName}${CACHE_V}`
    ];
  }
  const prefix = PHOTO_PREFIX_MAP[code] || code.replace('w_', '').toLowerCase().slice(0, 3);
  return [
    `${ERIC_PHOTO_BASE}${prefix}1.webp${CACHE_V}`,
    `${ERIC_PHOTO_BASE}${prefix}2.webp${CACHE_V}`,
    `${ERIC_PHOTO_BASE}${prefix}3.webp${CACHE_V}`
  ];
}

// 将 Supabase 产品数据转换为 ScentItem 格式
function transformProduct(product: any): ScentItem {
  // 根据 series_code 推断图片路径
  const seriesFolderMap: Record<string, string> = {
    'yuan_metal': 'metal', 'yuan_wood': 'wood', 'yuan_water': 'water',
    'yuan_fire': 'fire', 'yuan_earth': 'earth',
    'he_body': 'body', 'he_heart': 'heart', 'he_soul': 'soul',
    'sheng': 'hydrosol', 'jing_place': 'place', 'jing_Meditation': 'Meditation',
  };

  let heroUrl = product.image_url || '';
  if (!heroUrl) {
    const folder = seriesFolderMap[product.series_code] || '';
    const fileName = product.name_en ? product.name_en.trim().replace(/ /g, '%20') + '.webp' : '';
    if (folder && fileName) {
      heroUrl = `${RAW_BASE}products/${folder}/${fileName}${CACHE_V}`;
    }
  }
  if (!heroUrl) {
    heroUrl = 'https://images.unsplash.com/photo-1540555700478-4be289fbecee?q=80&w=800';
  }

  return {
    id: product.code,
    category: product.series_code as any,
    subGroup: product.group_name,
    name: product.name_cn,
    location: product.element,
    region: product.element,
    status: 'arrived' as const,
    visited: true,
    accent: product.alice_lab || '',
    hero: heroUrl,
    herb: product.name_cn,
    herbEn: product.name_en || '',
    price: product.price?.toString(),
    specification: product.specification,
    shortDesc: product.description?.substring(0, 50) || '',
    narrative: product.narrative || product.description || '',
    benefits: (() => {
      const b = product.benefits;
      if (!b) return [];
      if (typeof b === 'string') {
        try { return JSON.parse(b); } catch { return []; }
      }
      return Array.isArray(b) ? b : [];
    })(),
    isPopular: product.is_active,
    emoji: '',
    ericDiary: product.eric_diary || product.narrative || '',
    aliceDiary: product.alice_diary || product.alice_lab || '',
    aliceLabDiary: product.alice_lab || product.alice_diary || '',
    recommendation: product.usage || '',
    usage: product.usage || '',
    precautions: product.precautions || '',
    isPlaceholder: false,
  };
}

// 加载所有产品
export async function loadProducts(): Promise<Record<string, ScentItem>> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error loading products:', error);
    return {};
  }

  const products: Record<string, ScentItem> = {};
  data?.forEach((product) => {
    products[product.code] = transformProduct(product);
  });

  return products;
}

// 加载所有国家/目的地
export async function loadDestinations(): Promise<Record<string, Destination>> {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error loading destinations:', error);
    return {};
  }

  const destinations: Record<string, Destination> = {};
  data?.forEach((country) => {
    // countries 表使用 id (UUID) 作为唯一标识
    const destId = country.id;
    // is_china 列不存在，默认为 false（如果要支持中国省份，需要在 Supabase 中添加该列）
    const isChina = (country as any).is_china === true;
    // 推导图片 URL（优先用 image_url，否则用 scenery_url）
    let sceneryUrl = country.image_url || country.scenery_url || '';

    destinations[destId] = {
      id: destId,
      name: country.name_cn,
      en: country.name_en || '',
      region: country.region || '',
      status: country.is_active ? 'arrived' : 'locked',
      visitCount: country.visit_count || 0,
      scenery: sceneryUrl,
      emoji: '📍',
      herbDescription: country.description || '',
      knowledge: country.description || '',
      productIds: [],
      isChinaProvince: isChina,
      subRegion: country.sub_region || '',
      ericDiary: country.eric_diary || '',
      aliceDiary: '',
      memoryPhotos: [],
    };
  });

  return destinations;
}
