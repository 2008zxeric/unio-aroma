import { supabase } from './supabase';
import type { 
  Product, Country, Series, Banner, SiteText, HomeRecommend,
  PurchaseRecord, SalesRecord, ProductInventory, DictItem, AdminUser
} from './database.types';

// ============================================
// 通用 CRUD 基类
// ============================================

async function getAll<T>(table: string, options?: {
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
}): Promise<T[]> {
  let query = supabase.from(table).select('*');
  
  if (options?.filters) {
    for (const [key, value] of Object.entries(options.filters)) {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    }
  }
  
  if (options?.orderBy) {
    query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true });
  }
  
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as T[];
}

async function getById<T>(table: string, id: string): Promise<T | null> {
  const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
  if (error) return null;
  return data as T;
}

async function create<T>(table: string, record: Partial<T>): Promise<T> {
  const { data, error } = await supabase.from(table).insert(record).select().single();
  if (error) throw error;
  return data as T;
}

async function update<T>(table: string, id: string, record: Partial<T>): Promise<T> {
  const { data, error } = await supabase.from(table).update(record).eq('id', id).select().single();
  if (error) throw error;
  return data as T;
}

async function remove(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// 系列服务
// ============================================

export const seriesService = {
  getAll: () => getAll<Series>('series', { filters: { is_active: true }, orderBy: { column: 'sort_order' } }),
  getAllWithInactive: () => getAll<Series>('series', { orderBy: { column: 'sort_order' } }),
  getById: (id: string) => getById<Series>('series', id),
  create: (record: Partial<Series>) => create<Series>('series', record),
  update: (id: string, record: Partial<Series>) => update<Series>('series', id, record),
  delete: (id: string) => remove('series', id),
};

// ============================================
// 国家服务
// ============================================

export const countryService = {
  // 前台用：只返回激活的国家
  getAllActive: async (): Promise<Country[]> => {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (error) throw error;
    return (data || []) as Country[];
  },

  // 后台用：包含未激活的
  getAll: async (): Promise<Country[]> => {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .order('sort_order');
    if (error) throw error;
    return (data || []) as Country[];
  },

  getByRegion: async (region: string): Promise<Country[]> => {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('region', region)
      .eq('is_active', true)
      .order('sort_order');
    if (error) throw error;
    return (data || []) as Country[];
  },

  getById: (id: string) => getById<Country>('countries', id),
  create: (record: Partial<Country>) => create<Country>('countries', record),
  update: (id: string, record: Partial<Country>) => update<Country>('countries', id, record),
  delete: (id: string) => remove('countries', id),

  // 更新到访次数
  incrementVisitCount: async (id: string): Promise<void> => {
    const country = await getById<Country>('countries', id);
    if (country) {
      await supabase
        .from('countries')
        .update({ visit_count: (country.visit_count || 0) + 1 })
        .eq('id', id);
    }
  },
};

// ============================================
// 产品服务
// ============================================

export const productService = {
  // 前台用：只返回上架的产品，带关联数据
  getAllActive: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*, series(*)')   // ⚠️ country_id 已废弃，不 join countries
      .eq('is_active', true)
      .order('sort_order');
    if (error) throw error;
    return transformProducts(data || []);
  },

  // 按系列获取
  getBySeries: async (seriesCode: string): Promise<Product[]> => {
    // 先获取系列ID
    const { data: seriesData } = await supabase
      .from('series')
      .select('id')
      .eq('code', seriesCode)
      .single();

    if (!seriesData) return [];

    const { data, error } = await supabase
      .from('products')
      .select('*, series(*)')   // ⚠️ country_id 已废弃
      .eq('is_active', true)
      .eq('series_id', seriesData.id)
      .order('sort_order');
    if (error) throw error;
    return transformProducts(data || []);
  },

  // 按国家获取关联产品（通过 countries.product_ids 匹配，不再用 country_id）
  getByCountry: async (countryId: string): Promise<Product[]> => {
    // 先查出该国家的 product_ids
    const { data: countryData } = await supabase
      .from('countries')
      .select('product_ids')
      .eq('id', countryId)
      .single();
    if (!countryData?.product_ids?.length) return [];

    const { data, error } = await supabase
      .from('products')
      .select('*, series(*)')
      .eq('is_active', true)
      .in('id', countryData.product_ids)
      .order('sort_order');
    if (error) throw error;
    return transformProducts(data || []);
  },

  // 后台用：全部产品（含下架）
  getAll: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*, series(*)')   // ⚠️ country_id 已废弃，不再 join countries
      .order('sort_order');
    if (error) throw error;
    return transformProducts(data || []);
  },

  getById: async (id: string): Promise<Product | null> => {
    const { data, error } = await supabase
      .from('products')
      .select('*, series(*)')    // ⚠️ country_id 已废弃
      .eq('id', id)
      .single();
    if (error) return null;
    const transformed = transformProducts([data]);
    return transformed[0] || null;
  },

  create: (record: Partial<Product>) => create<Product>('products', record),
  update: (id: string, record: Partial<Product>) => update<Product>('products', id, record),
  delete: (id: string) => remove('products', id),

  // 批量上架/下架
  bulkUpdateStatus: async (ids: string[], isActive: boolean): Promise<void> => {
    await supabase
      .from('products')
      .update({ is_active: isActive })
      .in('id', ids);
  },

  // 批量导入
  bulkCreate: async (records: Partial<Product>[]): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .insert(records)
      .select('*, series(*)');  // ⚠️ country_id 已废弃
    if (error) throw error;
    return transformProducts(data || []);
  },
};

// ============================================
// 海报/Banner 服务
// ============================================

export const bannerService = {
  getByPosition: async (position: string): Promise<Banner[]> => {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('position', position)
      .eq('is_active', true)
      .order('sort_order');
    if (error) throw error;
    return (data || []) as Banner[];
  },

  getAll: () => getAll<Banner>('banners', { orderBy: { column: 'sort_order' } }),
  getById: (id: string) => getById<Banner>('banners', id),
  create: (record: Partial<Banner>) => create<Banner>('banners', record),
  update: (id: string, record: Partial<Banner>) => update<Banner>('banners', id, record),
  delete: (id: string) => remove('banners', id),
};

// ============================================
// 网站文字服务
// ============================================

export const siteTextService = {
  getAll: () => getAll<SiteText>('site_texts'),
  getByPage: async (page: string): Promise<SiteText[]> => {
    const { data, error } = await supabase
      .from('site_texts')
      .select('*')
      .eq('page', page)
      .order('key');
    if (error) throw error;
    return (data || []) as SiteText[];
  },
  getByKey: async (key: string): Promise<SiteText | null> => {
    const { data, error } = await supabase
      .from('site_texts')
      .select('*')
      .eq('key', key)
      .single();
    if (error) return null;
    return data as SiteText;
  },
  upsert: async (key: string, value: string, page: string, description?: string): Promise<SiteText> => {
    // 先尝试更新
    const { data: existing } = await supabase
      .from('site_texts')
      .select('id')
      .eq('key', key)
      .single();

    if (existing) {
      return update<SiteText>('site_texts', existing.id, { value, description, page });
    }
    return create<SiteText>('site_texts', { key, value, description, page });
  },
  update: (id: string, record: Partial<SiteText>) => update<SiteText>('site_texts', id, record),
  delete: (id: string) => remove('site_texts', id),
};

// ============================================
// 首页推荐服务
// ============================================

export const recommendService = {
  getActive: async (): Promise<HomeRecommend[]> => {
    const { data, error } = await supabase
      .from('home_recommends')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (error) throw error;
    return (data || []) as HomeRecommend[];
  },
  getAll: () => getAll<HomeRecommend>('home_recommends', { orderBy: { column: 'sort_order' } }),
  create: (record: Partial<HomeRecommend>) => create<HomeRecommend>('home_recommends', record),
  update: (id: string, record: Partial<HomeRecommend>) => update<HomeRecommend>('home_recommends', id, record),
  delete: (id: string) => remove('home_recommends', id),
};

// ============================================
// 进货/销售记录服务
// ============================================

export const purchaseService = {
  getByProduct: (productId: string) => getAll<PurchaseRecord>('purchase_records', { 
    filters: { product_id: productId },
    orderBy: { column: 'purchase_date', ascending: false }
  }),
  getAll: () => getAll<PurchaseRecord>('purchase_records', { orderBy: { column: 'purchase_date', ascending: false } }),
  create: (record: Partial<PurchaseRecord>) => create<PurchaseRecord>('purchase_records', record),
  update: (id: string, record: Partial<PurchaseRecord>) => update<PurchaseRecord>('purchase_records', id, record),
  delete: (id: string) => remove('purchase_records', id),
};

export const salesService = {
  getByProduct: (productId: string) => getAll<SalesRecord>('sales_records', { 
    filters: { product_id: productId },
    orderBy: { column: 'sale_date', ascending: false }
  }),
  getAll: () => getAll<SalesRecord>('sales_records', { orderBy: { column: 'sale_date', ascending: false } }),
  create: (record: Partial<SalesRecord>) => create<SalesRecord>('sales_records', record),
  update: (id: string, record: Partial<SalesRecord>) => update<SalesRecord>('sales_records', id, record),
  delete: (id: string) => remove('sales_records', id),
};

// ============================================
// 库存/利润汇总
// ============================================

export const inventoryService = {
  getProductSummary: async (productId: string): Promise<ProductInventory | null> => {
    const [allPurchasesRes, allSalesRes, product] = await Promise.all([
      supabase.from('purchase_records').select('volume_ml, unit_cost').eq('product_id', productId),
      supabase.from('sales_records').select('volume_ml, sale_price, total_amount').eq('product_id', productId),
      productService.getById(productId),
    ]);

    const allPurchases = allPurchasesRes.data || [];
    const allSales = allSalesRes.data || [];

    const totalPurchased = allPurchases.reduce((s, r) => s + (Number(r.volume_ml) || 0), 0);
    const totalSold = allSales.reduce((s, r) => s + (Number(r.volume_ml) || 0), 0);
    const totalCost = allPurchases.reduce((s, r) => s + ((Number(r.volume_ml) || 0) * (Number(r.unit_cost) || 0)), 0);
    const totalRevenue = allSales.reduce((s, r) => s + (Number(r.total_amount) || 0), 0);

    return {
      product_id: productId,
      product_name: product?.name_cn || '',
      total_purchased_ml: totalPurchased,
      total_sold_ml: totalSold,
      current_stock_ml: totalPurchased - totalSold,
      total_cost: totalCost,
      total_revenue: totalRevenue,
      total_profit: totalRevenue - totalCost,
    };
  },

  getAllSummaries: async (): Promise<ProductInventory[]> => {
    // 批量查询：一次拿所有产品和进货/销售记录，内存汇总（避免 N×3 次请求）
    const [products, purchasesRes, salesRes] = await Promise.all([
      productService.getAll(),
      supabase.from('purchase_records').select('product_id, volume_ml, unit_cost'),
      supabase.from('sales_records').select('product_id, volume_ml, sale_price, total_amount'),
    ]);

    const allPurchases = purchasesRes.data || [];
    const allSales = salesRes.data || [];

    // 按 product_id 汇总
    const purchaseMap = new Map<string, { totalMl: number; totalCost: number }>();
    for (const r of allPurchases) {
      const pid = r.product_id;
      if (!purchaseMap.has(pid)) purchaseMap.set(pid, { totalMl: 0, totalCost: 0 });
      const entry = purchaseMap.get(pid)!;
      entry.totalMl += Number(r.volume_ml) || 0;
      entry.totalCost += (Number(r.volume_ml) || 0) * (Number(r.unit_cost) || 0);
    }

    const salesMap = new Map<string, { totalMl: number; totalRevenue: number }>();
    for (const r of allSales) {
      const pid = r.product_id;
      if (!salesMap.has(pid)) salesMap.set(pid, { totalMl: 0, totalRevenue: 0 });
      const entry = salesMap.get(pid)!;
      entry.totalMl += Number(r.volume_ml) || 0;
      entry.totalRevenue += Number(r.total_amount) || 0;
    }

    return products.map(p => {
      const pur = purchaseMap.get(p.id) || { totalMl: 0, totalCost: 0 };
      const sal = salesMap.get(p.id) || { totalMl: 0, totalRevenue: 0 };
      return {
        product_id: p.id,
        product_name: p.name_cn,
        total_purchased_ml: pur.totalMl,
        total_sold_ml: sal.totalMl,
        current_stock_ml: pur.totalMl - sal.totalMl,
        total_cost: pur.totalCost,
        total_revenue: sal.totalRevenue,
        total_profit: sal.totalRevenue - pur.totalCost,
      };
    });
  },
};

// ============================================
// 字典服务
// ============================================

export const dictService = {
  getByType: async (type: string): Promise<DictItem[]> => {
    const { data, error } = await supabase
      .from('dict_items')
      .select('*')
      .eq('dict_type', type)
      .eq('is_active', true)
      .order('sort_order');
    if (error) throw error;
    return (data || []) as DictItem[];
  },
  /** 获取指定系列下的子分类 */
  getSubcategoriesBySeries: async (seriesId: string): Promise<DictItem[]> => {
    const { data, error } = await supabase
      .from('dict_items')
      .select('*')
      .eq('dict_type', 'subcategory')
      .eq('parent_id', seriesId)
      .eq('is_active', true)
      .order('sort_order');
    if (error) throw error;
    return (data || []) as DictItem[];
  },
  getAllTypes: async (): Promise<string[]> => {
    const { data, error } = await supabase
      .from('dict_items')
      .select('dict_type');
    if (error) throw error;
    return [...new Set((data || []).map(d => d.dict_type))];
  },
  getAll: () => getAll<DictItem>('dict_items', { orderBy: { column: 'dict_type' } }),
  create: (record: Partial<DictItem>) => create<DictItem>('dict_items', record),
  update: (id: string, record: Partial<DictItem>) => update<DictItem>('dict_items', id, record),
  delete: (id: string) => remove('dict_items', id),
};

// ============================================
// 用户/权限服务
// ============================================

export const userService = {
  getAll: () => getAll<AdminUser>('admin_users', { orderBy: { column: 'created_at', ascending: false } }),
  getById: (id: string) => getById<AdminUser>('admin_users', id),
  create: (record: Partial<AdminUser>) => create<AdminUser>('admin_users', record),
  update: (id: string, record: Partial<AdminUser>) => update<AdminUser>('admin_users', id, record),
  delete: (id: string) => remove('admin_users', id),
};

// ============================================
// 数据转换辅助函数
// ============================================

function transformProducts(rawData: any[]): Product[] {
  return (rawData || []).map(row => ({
    ...row,
    // 确保 benefits 和 gallery_urls 是数组
    benefits: Array.isArray(row.benefits) ? row.benefits : (row.benefits ? JSON.parse(row.benefits) : []),
    gallery_urls: Array.isArray(row.gallery_urls) ? row.gallery_urls : (row.gallery_urls ? JSON.parse(row.gallery_urls) : []),
    similar_ids: Array.isArray(row.similar_ids) ? row.similar_ids : (row.similar_ids ? JSON.parse(row.similar_ids) : []),
    // 展开关联数据（Supabase 返回的是表名 countries，映射到接口字段 country）
    series: row.series || undefined,
    country: row.countries || row.country || undefined,   // ← 兼容两种返回格式
  }));
}
