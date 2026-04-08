import { supabase } from './supabase';
import { ScentItem, Destination } from './types';

// 将 Supabase 产品数据转换为 ScentItem 格式
function transformProduct(product: any): ScentItem {
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
    hero: product.image_url || 'https://images.unsplash.com/photo-1540555700478-4be289fbecee?q=80&w=800',
    herb: product.name_cn,
    herbEn: product.name_en || '',
    price: product.price?.toString(),
    specification: product.specification,
    shortDesc: product.description?.substring(0, 50) || '',
    narrative: product.narrative || product.description || '',
    benefits: product.benefits || [],
    isPopular: product.is_active,
    emoji: '',
    ericDiary: product.narrative || '',
    aliceDiary: product.alice_lab || '',
    aliceLabDiary: product.alice_lab || '',
    recommendation: product.usage || '',
    usage: product.usage || '',
    precautions: '',
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

// 加载所有国家
export async function loadDestinations(): Promise<Record<string, Destination>> {
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .order('name_cn', { ascending: true });

  if (error) {
    console.error('Error loading destinations:', error);
    return {};
  }

  const destinations: Record<string, Destination> = {};
  data?.forEach((country) => {
    destinations[country.code] = {
      id: country.code,
      name: country.name_cn,
      en: country.name_en,
      region: country.region,
      status: country.is_active ? 'arrived' : 'locked',
      visitCount: 0,
      scenery: country.description || '',
      emoji: country.flag_emoji || '',
      herbDescription: country.description || '',
      knowledge: country.description || '',
      productIds: [],
      isChinaProvince: country.is_china,
      subRegion: country.region,
      ericDiary: '',
      aliceDiary: '',
      memoryPhotos: [],
    };
  });

  return destinations;
}
