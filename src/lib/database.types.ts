// ============================================
// UNIO AROMA 完整数据库类型定义
// ============================================

// ---- 系列枚举（4 大系列） ----
export type SeriesCode = 'yuan' | 'he' | 'sheng' | 'jing';

// ---- 子分类完整枚举 ----
// 元系列 - 按植物部位分类：金木水火土 + 基础油
export type YuanSubCategory = 'fire' | 'metal' | 'wood' | 'water' | 'earth' | 'base';
// 和系列 - 身心灵魂
export type HeSubCategory = 'body' | 'mind' | 'soul';
// 生系列 - 净润舒
export type ShengSubCategory = 'clear' | 'nourish' | 'soothe';
// 香系列 - 芳香美学/凝思之物
export type JingSubCategory = 'aesthetic' | 'meditation';

// 统一子分类类型
export type SubCategory = YuanSubCategory | HeSubCategory | ShengSubCategory | JingSubCategory | 'none';

// ---- 子分类显示名称映射 ----
export const SUB_CATEGORY_LABELS: Record<SubCategory, string> = {
  // 元·按植物部位
  fire: 'Fire · 火（花）', metal: 'Metal · 金（果实/种子）', wood: 'Wood · 木（木质/树皮）',
  water: 'Water · 水（叶/草）', earth: 'Earth · 土（根/树脂）', base: 'Base · 基础油',
  // 和·身心魂
  body: 'Body · 身体', mind: 'Mind · 心智', soul: 'Soul · 灵魂',
  // 生·净润舒
  clear: 'Clear · 清净', nourish: 'Nourish · 润养', soothe: 'Soothe · 舒缓',
  // 香系列
  aesthetic: 'Aesthetic · 芳香美学', meditation: 'Meditation · 凝思之物',
  // 默认
  none: '未分类',
};

// ---- 系列信息映射 ----
export const SERIES_INFO: Record<SeriesCode, { name_cn: string; name_en: string; slogan: string; subCategories: SubCategory[] }> = {
  yuan: { name_cn: '元', name_en: 'Yuan', slogan: '元 · 单方 / 极境生存原力', subCategories: ['fire', 'metal', 'wood', 'water', 'earth', 'base'] },
  he:   { name_cn: '和', name_en: 'He',   slogan: '和 · 复方 / 科学频率重构', subCategories: ['body', 'mind', 'soul'] },
  sheng:{ name_cn: '生', name_en: 'Sheng', slogan: '生 · 纯露 / 植物生命之水', subCategories: ['clear', 'nourish', 'soothe'] },
  jing: { name_cn: '香', name_en: 'Jing', slogan: '香 · 空间 / 极简芳香美学', subCategories: ['aesthetic', 'meditation'] },
};

// ---- 系列相关 ----
export interface Series {
  id: string;
  code: SeriesCode;          // yuan/he/sheng/jing （4大系列）
  name_cn: string;
  name_en: string;
  description?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// ---- 国家/地区 ----
export interface Country {
  id: string;
  name_cn: string;
  name_en?: string;
  region?: string;
  sub_region?: string;
  description?: string;       // 国家印象
  technical_info?: string;    // Alice实验室信息
  image_url?: string;         // 首页大图
  scenery_url?: string;       // 风景图
  gallery_urls?: string[];    // Eric相册（多张）
  eric_diary?: string;        // 寻香日志
  visit_count: number;        // 到访次数
  unlock_code?: string;       // 解锁状态：0=未解锁，其它=已解锁
  is_active: boolean;
  sort_order: number;
  created_at: string;

  // 🔗 产品绑定：关联到此国家的产品ID列表
  product_ids?: string[];

  // 前台展示用扩展字段
  emoji?: string;
  herb_description?: string;
  knowledge?: string;
  alice_diary?: string;
  memory_photos?: string[];
  is_china_province?: boolean;
}

// ---- 产品 ----
export interface Product {
  id: string;
  series_id?: string;           // 关联系列 ID
  country_id?: string;          // 默认关联国家
  code: string;                 // 产品编码
  display_name?: string;        // 前台展示名称（用户看到的友好名称）
  name_cn: string;              // 中文名称（系统用）
  name_en?: string;             // 英文名称
  scientific_name?: string;     // 学名
  element?: string;             // 五行元素 (jin/mu/shui/huo/tu)
  category?: SubCategory;       // 子分类 — 13种精确类型
  group_name?: string;          // 归类子组（如"元·金木水火土"）
  short_desc?: string;          // 短描述（特点提炼）
  description?: string;         // 详细描述/叙事
  benefits?: string[];          // 参考功效
  usage?: string;               // 使用说明
  origin?: string;              // 产地
  extraction_method?: string;   // 提炼方式
  price_5ml?: number;           // 5ml售价
  price_10ml?: number;          // 10ml售价（主力价格）
  price_15ml?: number;          // 15ml售价
  price_30ml?: number;          // 30ml售价
  price_50ml?: number;          // 50ml售价
  price_100ml?: number;         // 100ml售价
  price_piece?: number;         // 香系列单件/套售价

  // ---- 进销存字段 ----
  supplier_code?: string;       // 供应商代码/名称
  total_inbound_ml?: number;    // 累计进货(ml)
  total_sales_ml?: number;      // 累计销售(ml)
  remaining_ml?: number;        // 剩余库存(ml) = 进货-销售
  total_cost?: number;          // 成本累计(¥)
  total_revenue?: number;       // 销售累计(¥)
  total_profit?: number;        // 利润累计(¥) = 销售-成本
  xiaohongshu_url?: string;     // 小红书购买链接
  image_url?: string;           // 页首大图
  gallery_urls?: string[];      // 产品图片(1-3张)
  narrative?: string;           // Eric叙事
  alice_lab?: string;           // Alice Lab日记
  specification?: string;       // 规格（如"10ml"、"250ml"、"50ml Set"等）
  stock_quantity?: number;      // 当前库存(ml)
  similar_ids?: string[];       // 相似推荐绑定产品ID
  is_active: boolean;           // 上架状态（true=上架, false=下架）
  sort_order: number;
  series_code?: SeriesCode;     // 冗余系列代码
  created_at: string;

  // 关联数据（查询时填充，不入库）
  series?: Series;
  country?: Country;
  countries?: Country[];        // 多对多国家绑定
  similar_products?: Product[];
}

// ---- 进货记录 ----
export interface PurchaseRecord {
  id: string;
  product_id: string;
  purchase_date: string;      // 进货日期
  volume_ml: number;          // 容量(ml)
  unit_cost: number;          // 进价(元/ml 或 总价)
  supplier_code?: string;     // 供货商代码
  notes?: string;
  created_at: string;
}

// ---- 销售记录 ----
export interface SalesRecord {
  id: string;
  product_id: string;
  sale_date: string;
  volume_ml: number;
  sale_price: number;         // 销售单价
  total_amount: number;       // 销售金额
  notes?: string;
  created_at: string;
}

// ---- 库存汇总（计算字段） ----
export interface ProductInventory {
  product_id: string;
  product_name: string;
  total_purchased_ml: number;   // 总进货
  total_sold_ml: number;        // 总销售
  current_stock_ml: number;     // 当前库存 = 进货 - 销售
  total_cost: number;           // 总进价
  total_revenue: number;        // 总销售额
  total_profit: number;         // 总利润 = 销售额 - 进价
}

// ---- 海报/Banner ----
export interface Banner {
  id: string;
  name: string;
  image_url: string;
  link_url?: string;
  position: string;            // home/story/collections/atlas/footer等
  is_active: boolean;
  sort_order: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

// ---- 网站设置/文字 ----
export interface SiteText {
  id: string;
  key: string;                // 唯一键名
  value: string;              // 文字内容
  description?: string;       // 说明
  page: string;               // 所属页面
  updated_at: string;
}

// ---- 首页推荐 ----
export interface HomeRecommend {
  id: string;
  type: 'product' | 'country' | 'series';
  ref_id: string;             // 关联的产品/国家/系列ID
  title?: string;
  subtitle?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
}

// ---- 字典项 ----
export interface DictItem {
  id: string;
  dict_type: string;          // 字典类型：element/category/region/supplier等
  label: string;              // 显示名称
  value: string;              // 存储值
  sort_order: number;
  is_active: boolean;
  parent_id?: string;         // 父级（用于级联字典）
}

// ---- 用户/权限 ----
export interface AdminUser {
  id: string;
  username: string;
  display_name: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

// ---- 操作日志 ----
export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;             // create/update/delete/login等
  target_type: string;        // product/country/banner等
  target_id?: string;
  detail?: string;            // JSON变更详情
  ip?: string;
  created_at: string;
}
