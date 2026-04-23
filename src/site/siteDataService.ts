/**
 * UNIO AROMA 前台数据服务
 * 基于 Supabase 的前台数据获取
 * 
 * v2 — 加入内存缓存层，避免重复请求导致的10秒等待
 */

import { Product, Series, Country, Banner } from './types';

// Supabase 配置
const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
const SUPABASE_KEY = 'eyJhbG...V5ng';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
};

// ============ 内存缓存（减少重复请求导致的10秒+等待） ============
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 60_000; // 1分钟缓存

function getCacheKey(table: string, params: string): string {
  return `${table}?${params}`;
}

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data as T;
  if (entry) cache.delete(key); // 过期
  return null;
}

function setCache(key: string, data: any): void {
  // 控制缓存大小（最多50条）
  if (cache.size > 50) {
    const oldest = Array.from(cache.entries())
      .sort(([, a], [, b]) => a.ts - b.ts)[0]?.[0];
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, { data, ts: Date.now() });
}

// 并发请求去重：同一时间相同URL只发一个请求
const inflight = new Map<string, Promise<any>>();

// ============ 工具函数 ============
async function fetchFromSupabase(table: string, params: string = '') {
  const cacheKey = getCacheKey(table, params);
  
  // 1. 检查缓存
  const cached = getCached(cacheKey);
  if (cached) return transformArrays(cached);
  
  // 2. 检查是否已有相同请求在飞行中
  if (inflight.has(cacheKey)) {
    const data = await inflight.get(cacheKey)!;
    return transformArrays(data);
  }
  
  // 3. 发起请求
  const url = `${SUPABASE_URL}/rest/v1/${table}?${params}`;
  const promise = fetch(url, { headers })
    .then(async response => {
      if (!response.ok) throw new Error(`Failed to fetch ${table}`);
      const data = await response.json();
      setCache(cacheKey, data);
      return data;
    })
    .finally(() => inflight.delete(cacheKey));
  
  inflight.set(cacheKey, promise);
  const data = await promise;
  return transformArrays(data);
}

// 处理 PostgreSQL 数组字段（{a,b} → ["a","b"]）
function transformArrays(data: any[]): any[] {
  if (!Array.isArray(data)) return data;
  return data.map(row => ({
    ...row,
    gallery_urls: Array.isArray(row.gallery_urls) ? row.gallery_urls : 
      (row.gallery_urls && typeof row.gallery_urls === 'string' ? parsePostgresArray(row.gallery_urls) : (row.gallery_urls || [])),
    benefits: Array.isArray(row.benefits) ? row.benefits : 
      (row.benefits && typeof row.benefits === 'string' ? parsePostgresArray(row.benefits) : (row.benefits || [])),
    similar_ids: Array.isArray(row.similar_ids) ? row.similar_ids : 
      (row.similar_ids && typeof row.similar_ids === 'string' ? parsePostgresArray(row.similar_ids) : (row.similar_ids || [])),
  }));
}

// PostgreSQL 数组格式解析：{url1,url2} → ["url1", "url2"]
function parsePostgresArray(str: string): string[] {
  if (!str || str[0] !== '{' || str[str.length - 1] !== '}') {
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  }
  const inner = str.slice(1, -1);
  if (!inner) return [];
  return inner.split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
}

// 清除缓存（路由切换时的产品详情页，确保不是陈旧的）
export function clearProductCache(): void {
  for (const key of cache.keys()) {
    if (key.startsWith('products?')) cache.delete(key);
  }
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
export async function getCountries(region?: string): Promise<Country[]> {
  let params = 'is_active=eq.true&order=sort_order.asc';
  if (region) {
    params += `&region=eq.${encodeURIComponent(region)}`;
  }
  return fetchFromSupabase('countries', params);
}

export async function getCountriesBySubRegion(subRegion?: string): Promise<Country[]> {
  let params = 'is_active=eq.true&order=sort_order.asc';
  if (subRegion) {
    params += `&sub_region=eq.${encodeURIComponent(subRegion)}`;
  }
  return fetchFromSupabase('countries', params);
}

export async function getGlobalCountries(): Promise<Country[]> {
  return fetchFromSupabase('countries', 'is_active=eq.true&region=neq.%E7%A5%9E%E5%B7%9E&order=sort_order.asc');
}

export async function getChinaProvinces(): Promise<Country[]> {
  return fetchFromSupabase('countries', 'is_active=eq.true&region=eq.%E7%A5%9E%E5%B7%9E&order=sort_order.asc');
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
export async function getHomeData() {
  const [series, products, countries, banners] = await Promise.all([
    getSeries(),
    getProducts(),
    getCountries(),
    getBanners('home')
  ]);
  return { series, products, countries, banners };
}

export async function getCollectionsData(seriesCode?: string) {
  const [series, products] = await Promise.all([
    getSeries(),
    getProducts(seriesCode)
  ]);
  const groupedProducts = products.reduce((acc, product) => {
    const group = product.group_name || '未分类';
    if (!acc[group]) acc[group] = [];
    acc[group].push(product);
    return acc;
  }, {} as Record<string, Product[]>);
  return { series, products, groupedProducts };
}

export async function getProductWithRelations(productId: string) {
  const product = await getProductById(productId);
  if (!product) return null;
  let relatedCountry = null;
  if (product.country_id) {
    relatedCountry = await getCountryById(product.country_id);
  }
  let similarProducts: Product[] = [];
  if (product.similar_ids && product.similar_ids.length > 0) {
    const similarPromises = product.similar_ids.slice(0, 4).map(id => getProductById(id));
    similarProducts = (await Promise.all(similarPromises)).filter(p => p !== null) as Product[];
  }
  return { product, relatedCountry, similarProducts };
}

// ============ 类型导出 ============
export type { Product, Series, Country, Banner };
