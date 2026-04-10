/**
 * UNIO AROMA 前台数据服务
 * 基于 Supabase 的前台数据获取
 */

import { Product, Series, Country, Banner } from './database.types';

// Supabase 配置
const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1aWNqeWRndG9sdGRoa2Jxb2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MzI2NjgsImV4cCI6MjA5MTEwODY2OH0.7E-VPqi7m9WbCWw96jbEeVdVBVrwubIjAGEB-_MV5ng';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
};

// ============ 工具函数 ============
async function fetchFromSupabase(table: string, params: string = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${params}`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`Failed to fetch ${table}`);
  return response.json();
}

// ============ 系列服务 ============
export async function getSeries(): Promise<Series[]> {
  return fetchFromSupabase('series', 'is_active=eq.true&order=sort_order.asc');
}

// ============ 产品服务 ============
export async function getProducts(seriesCode?: string): Promise<Product[]> {
  let params = 'is_active=eq.true&order=sort_order.asc';
  if (seriesCode) {
    params += `&series_code=eq.${seriesCode}`;
  }
  return fetchFromSupabase('products', params);
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await fetchFromSupabase('products', `id=eq.${id}&is_active=eq.true&limit=1`);
  return products.length > 0 ? products[0] : null;
}

export async function getProductByCode(code: string): Promise<Product | null> {
  const products = await fetchFromSupabase('products', `code=eq.${code}&is_active=eq.true&limit=1`);
  return products.length > 0 ? products[0] : null;
}

// ============ 国家服务 ============
export async function getCountries(): Promise<Country[]> {
  return fetchFromSupabase('countries', 'is_active=eq.true&order=sort_order.asc');
}

export async function getCountryById(id: string): Promise<Country | null> {
  const countries = await fetchFromSupabase('countries', `id=eq.${id}&is_active=eq.true&limit=1`);
  return countries.length > 0 ? countries[0] : null;
}

// ============ Banner 服务 ============
export async function getBanners(position: string): Promise<Banner[]> {
  const now = new Date().toISOString();
  return fetchFromSupabase(
    'banners',
    `position=eq.${position}&is_active=eq.true&order=sort_order.asc&start_date=lte.${now}&end_date=gte.${now}`
  );
}

// ============ 组合数据服务 ============
// 获取首页数据
export async function getHomeData() {
  const [series, products, countries, banners] = await Promise.all([
    getSeries(),
    getProducts(),
    getCountries(),
    getBanners('home')
  ]);

  return { series, products, countries, banners };
}

// 获取馆藏页数据（按系列分组）
export async function getCollectionsData(seriesCode?: string) {
  const [series, products] = await Promise.all([
    getSeries(),
    getProducts(seriesCode)
  ]);

  // 按 group_name 分组
  const groupedProducts = products.reduce((acc, product) => {
    const group = product.group_name || '未分类';
    if (!acc[group]) acc[group] = [];
    acc[group].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return { series, products, groupedProducts };
}

// 获取带关联数据的产品
export async function getProductWithRelations(productId: string) {
  const product = await getProductById(productId);
  if (!product) return null;

  // 获取关联国家
  let relatedCountry = null;
  if (product.country_id) {
    relatedCountry = await getCountryById(product.country_id);
  }

  // 获取相似产品（如果有 similar_ids）
  let similarProducts: Product[] = [];
  if (product.similar_ids && product.similar_ids.length > 0) {
    const similarPromises = product.similar_ids.slice(0, 4).map(id => getProductById(id));
    similarProducts = (await Promise.all(similarPromises)).filter(p => p !== null) as Product[];
  }

  return { product, relatedCountry, similarProducts };
}

// ============ 类型导出 ============
export type { Product, Series, Country, Banner };
