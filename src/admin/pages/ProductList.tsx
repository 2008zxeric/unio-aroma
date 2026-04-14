import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus, Search, Edit2, Trash2,
  Upload, ChevronDown, ChevronUp, ChevronRight,
  Package, ToggleLeft, ToggleRight, X, Zap, FileSpreadsheet,
  Clock, Settings2, Star, Globe, MapPin, Check,
  Box, TrendingUp, ShoppingCart, DollarSign, AlertCircle,
  Calendar, BarChart3, ArrowDownLeft, ArrowUpRight, Receipt,
  Filter, Download, Eye, ExternalLink, Save, Image as ImageIcon,
  ArrowLeft, Anchor, Link2, Lock,
} from 'lucide-react';
import { productService, seriesService, countryService } from '../../lib/dataService';
import type { Product, Series, Country, SubCategory, SeriesCode } from '../../lib/database.types';
import { SERIES_INFO, SUB_CATEGORY_LABELS } from '../../lib/database.types';
import { useAuth, writeAuditLog } from '../../lib/auth';
import ProfitReportView from '../components/ProfitReportView';
import ImageUploadField from '../components/ImageUploadField';

// ============================================
// 常量定义
// ============================================

const COMMON_ORIGINS = [
  '法国', '意大利', '印度', '澳大利亚', '埃及',
  '摩洛哥', '马达加斯加', '德国', '保加利亚',
  '中国', '美国', '英国', '巴西',
];

// 入库规格（元/和/生系列 — ml）
const INBOUND_SIZES_ML = ['5ml', '10ml', '15ml', '30ml', '50ml', '100ml', '500ml', '1000ml'];
// 香系列规格（个/件/套）
const INBOUND_SIZES_PIECE = ['1个', '1件', '1套', '5个', '10件'];

// 销售规格（元/和/生）
const SALES_SIZES_ML = ['5ml', '10ml', '15ml', '30ml', '50ml', '100ml'];
// 香系列销售规格
const SALES_SIZES_PIECE = ['1个', '1件', '1套'];

// 判断是否为香系列（器物，非ml计量）
function isJingSeries(category: string): boolean {
  return category === 'aesthetic' || category === 'meditation';
}

// ============================================
// 流水账数据类型
// ============================================

interface InboundEntry {
  id: string;                    // 临时ID（前端生成）
  date: string;                  // 进货日期
  size: string;                  // 规格
  qty: number;                   // 数量
  unitPrice: number;             // 单价(¥)
  supplier: string;              // 供应商
  totalMl: number;               // 折合ml（香系列=0或按换算）
  totalCost: number;             // 小计¥
}

interface SalesEntry {
  id: string;
  date: string;                  // 销售日期
  size: string;                  // 销售规格
  qty: number;                   // 数量
  unitPrice: number;             // 实际售价(¥)
  totalMl: number;               // 折合ml
  totalRevenue: number;          // 小计¥
}

interface OtherCostEntry {
  id: string;
  date: string;                  // 发生日期
  category: string;              // 成本类别
  amount: number;                // 金额(¥)
  description: string;           // 说明
}

const COST_CATEGORIES = [
  '包装印刷', '物流运输', '营销推广', '样品损耗',
  '设备折旧', '场地租金', '人工成本', '税费', '其他',
];

// ============================================
// 产品表单 — V4 进销存完整版
// ============================================

interface ProductForm {
  // === 栏目一：基础信息 ===
  display_name: string;
  name_cn: string;
  name_en: string;
  scientific_name: string;
  category: string;
  image_url: string;

  element: string;
  origin: string;
  extraction_method: string;
  short_desc: string;
  description: string;

  // === 栏目二：进销存流水账 ===
  // 销售定价（各规格售价）
  price_5ml: string;
  price_10ml: string;
  price_15ml: string;
  price_30ml: string;
  price_50ml: string;
  price_100ml: string;
  price_piece: string;            // 香系列单件售价

  // 入库流水
  inboundRecords: InboundEntry[];
  // 出库流水
  salesRecords: SalesEntry[];
  // 其他成本
  otherCosts: OtherCostEntry[];

  // === 累计统计（自动计算）===
  total_inbound_ml: string;
  total_sales_ml: string;
  remaining_ml: string;
  total_cost: string;
  total_revenue: string;
  total_profit: string;

  // === 高级 ===
  code: string;
  benefits: string;
  usage: string;
  narrative: string;
  alice_lab: string;
  specification: string;
  xiaohongshu_url: string;
  similar_ids: string;
  gallery_urls: string;
  sort_order: string;
  is_active: boolean;
}

const emptyForm = (): ProductForm => ({
  display_name: '', name_cn: '', name_en: '', scientific_name: '',
  category: '', image_url: '',
  element: '', origin: '', extraction_method: '', short_desc: '', description: '',

  // 定价
  price_5ml: '', price_10ml: '', price_15ml: '', price_30ml: '', price_50ml: '', price_100ml: '', price_piece: '',
  // 流水账
  inboundRecords: [],
  salesRecords: [],
  otherCosts: [],

  // 累计
  total_inbound_ml: '0', total_sales_ml: '0', remaining_ml: '0',
  total_cost: '0', total_revenue: '0', total_profit: '0',

  code: '', benefits: '', usage: '', narrative: '', alice_lab: '',
  specification: '', xiaohongshu_url: '', similar_ids: '', gallery_urls: '',
  sort_order: '0', is_active: true,
});

// 生成临时ID
let tempIdCounter = 0;
const genTempId = () => `temp_${Date.now()}_${++tempIdCounter}`;

// ============================================
// 子分类 → 系列映射
// ============================================

const CATEGORY_SERIES_MAP: Record<string, { seriesCode: string; seriesName: string; label: string }> = {
  jin:       { seriesCode: 'yuan',  seriesName: '元', label: '金' },
  mu:        { seriesCode: 'yuan',  seriesName: '元', label: '木' },
  shui:      { seriesCode: 'yuan',  seriesName: '元', label: '水' },
  huo:       { seriesCode: 'yuan',  seriesName: '元', label: '火' },
  tu:        { seriesCode: 'yuan',  seriesName: '元', label: '土' },
  body:      { seriesCode: 'he',    seriesName: '和', label: '身体' },
  mind:      { seriesCode: 'he',    seriesName: '和', label: '心智' },
  soul:      { seriesCode: 'he',    seriesName: '和', label: '灵魂' },
  clear:     { seriesCode: 'sheng', seriesName: '生', label: '清净' },
  nourish:   { seriesCode: 'sheng', seriesName: '生', label: '润养' },
  soothe:    { seriesCode: 'sheng', seriesName: '生', label: '舒缓' },
  aesthetic:  { seriesCode: 'jing',  seriesName: '香', label: '芳香美学' },
  meditation: { seriesCode: 'jing',  seriesName: '香', label: '凝思之物' },
};

// 各系列对应的子分类选项（用于产品录入页动态下拉）
const SERIES_CATEGORIES_OPTIONS: Record<string, { value: string; label: string }[]> = {
  yuan: [
    { value: 'jin', label: '金 Metal' },
    { value: 'mu', label: '木 Wood' },
    { value: 'shui', label: '水 Water' },
    { value: 'huo', label: '火 Fire' },
    { value: 'tu', label: '土 Earth' },
  ],
  he: [
    { value: 'body', label: '身体 Body' },
    { value: 'mind', label: '心智 Mind' },
    { value: 'soul', label: '灵魂 Soul' },
  ],
  sheng: [
    { value: 'clear', label: '清净 Clear' },
    { value: 'nourish', label: '润养 Nourish' },
    { value: 'soothe', label: '舒缓 Soothe' },
  ],
  jing: [
    { value: 'aesthetic', label: '芳香美学 Aesthetic' },
    { value: 'meditation', label: '凝思之物 Meditation' },
  ],
};

// 元系列子分类 → 五行元素映射（选子分类时自动同步 element 字段）
const CATEGORY_TO_ELEMENT: Record<string, string> = {
  jin: '金', mu: '木', shui: '水', huo: '火', tu: '土',
};

// 解析规格字符串为数值
function parseSizeToMl(sizeStr: string): number {
  if (!sizeStr || sizeStr.includes('个') || sizeStr.includes('件') || sizeStr.includes('套')) return 0;
  const match = sizeStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

// 获取单位标签
function getUnitLabel(category: string): string {
  return isJingSeries(category) ? '件' : 'ml';
}

// 格式化日期
const todayStr = () => new Date().toISOString().split('T')[0];

// ============================================
// 主页面组件 — 列表优先 + 利润报表
// ============================================

export default function AdminProducts() {
  const [searchParams] = useSearchParams();
  const { user, hasPermission } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  // 权限标记
  const canEdit = hasPermission('edit_products');
  const canToggle = hasPermission('toggle_product_status');

  // 搜索 & 筛选
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeriesCode, setFilterSeriesCode] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterCategory, setFilterCategory] = useState('');

  // 视图模式：list / create / edit / report
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit' | 'report'>('list');

  // 编辑状态
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [showDetailId, setShowDetailId] = useState<string | null>(null);
  const [showBatchImport, setShowBatchImport] = useState(false);
  // 折叠控制：记录展开的系列code（默认全部折叠）
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());
  // 浮动快捷按钮状态
  const [floatingSearchOpen, setFloatingSearchOpen] = useState(false);
  const [floatingMenuOpen, setFloatingMenuOpen] = useState(false);

  // 从 Dashboard 带 ?import=true 跳转时自动展开批量导入
  useEffect(() => {
    if (searchParams.get('import') === 'true') {
      setShowBatchImport(true);
      // 清理 URL 参数
      const url = new URL(window.location.href);
      url.searchParams.delete('import');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, [searchParams]);

  // ---- 加载数据 ----
  // 各数据源独立加载，互不阻塞（避免一个挂了全完）
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // 🎯 核心：产品列表（独立加载）
      try {
        const productsData = await productService.getAll();
        setProducts(productsData);
      } catch (pErr) {
        console.error('产品加载失败:', pErr);
      }

      // 辅助1：系列
      try {
        const seriesData = await seriesService.getAllWithInactive();
        setSeries(seriesData);
      } catch (sErr) {
        console.warn('系列加载失败:', sErr);
      }

      // 辅助2：国家（产地选择器用）
      try {
        const countriesData = await countryService.getAll();
        setCountries(countriesData);
      } catch (cErr) {
        console.warn('国家加载失败:', cErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // 过滤
  const filtered = useMemo(() => products.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q ||
      p.name_cn.includes(q) ||
      (p.name_en && p.name_en.toLowerCase().includes(q)) ||
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.origin && p.origin.includes(q));
    const matchSeries = !filterSeriesCode || p.series?.code === filterSeriesCode || p.series_code === filterSeriesCode;
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? p.is_active : !p.is_active);
    const matchCategory = !filterCategory || p.category === filterCategory;
    return matchSearch && matchSeries && matchStatus && matchCategory;
  }), [products, searchQuery, filterSeriesCode, filterStatus, filterCategory]);

  // 从 countries.product_ids 反查：每个产品被哪些国家绑定（只读展示用）
  const productBoundCountries = useMemo(() => {
    const map: Record<string, string[]> = {};  // productId -> [countryName, ...]
    countries.forEach(c => {
      const ids: string[] = Array.isArray((c as any).product_ids) ? (c as any).product_ids : [];
      ids.forEach(pid => {
        if (!map[pid]) map[pid] = [];
        map[pid].push(c.name_cn);
      });
    });
    return map;
  }, [countries]);

  const toggleSeriesExpand = (code: string) => {
    setExpandedSeries(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  };

  const toggleAllSeries = () => {
    if (expandedSeries.size === 4) {
      setExpandedSeries(new Set());
    } else {
      setExpandedSeries(new Set(['yuan', 'he', 'sheng', 'jing']));
      setFilterSeriesCode('');
      setFilterCategory('');
      setSearchQuery('');
      setFilterStatus('all');
    }
  };

  // 点击筛选栏系列标签：用 code 做过滤，不依赖 series.id
  const handleSeriesFilter = (seriesCode: string) => {
    const newFilter = filterSeriesCode === seriesCode ? '' : seriesCode;
    setFilterSeriesCode(newFilter);
    setFilterCategory('');
    // 自动展开该系列
    if (newFilter) {
      setExpandedSeries(prev => {
        const next = new Set(prev);
        next.add(newFilter);
        return next;
      });
    }
  };

  // 按系列分组（双保险：优先 series.code，兜底 series_code）
  const groupedProducts = useMemo(() => {
    const groups: { code: string; name: string; label: string; color: string; products: Product[] }[] = [];
    const seriesOrder = [
      { code: 'yuan', name: '元·单方', label: '极境生存原力', color: '#D4AF37' },
      { code: 'he',   name: '和·复方', label: '科学频率重构', color: '#60A5FA' },
      { code: 'sheng', name: '生·纯露', label: '植物生命之水', color: '#4ADE80' },
      { code: 'jing', name: '香·空间', label: '极简芳香美学', color: '#A78BFA' },
    ];
    for (const s of seriesOrder) {
      const items = filtered.filter(p =>
        p.series?.code === s.code || p.series_code === s.code
      );
      groups.push({ ...s, products: items });
    }
    return groups;
  }, [filtered]);

  const stats = useMemo(() => ({
    total: products.length,
    active: products.filter(p => p.is_active).length,
    inactive: products.filter(p => !p.is_active).length,
    filtered: filtered.length,
    // 汇总统计
    totalRevenue: products.reduce((sum, p) => sum + (Number(p.total_revenue) || 0), 0),
    totalProfit: products.reduce((sum, p) => sum + (Number(p.total_profit) || 0), 0),
    totalCost: products.reduce((sum, p) => sum + (Number(p.total_cost) || 0), 0),
  }), [products, filtered]);

  // ---- 操作 ----
  const startCreate = () => {
    setViewMode('create');
    setEditingId(null);
    setForm(emptyForm());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEdit = (product: Product) => {
    setViewMode('edit');
    setEditingId(product.id);

    // 从产品字段反推流水账（首次编辑时初始化空数组）
    setForm({
      display_name: product.display_name || product.name_cn || '',
      name_cn: product.name_cn || '',
      name_en: product.name_en || '',
      scientific_name: product.scientific_name || '',
      category: product.category || '',
      image_url: product.image_url || '',

      element: product.element || CATEGORY_TO_ELEMENT[product.category || ''] || '',
      origin: product.origin || '',
      extraction_method: product.extraction_method || '',
      short_desc: product.short_desc || '',
      description: product.description || '',

      // 定价
      price_5ml: String(product.price_5ml ?? ''),
      price_10ml: String(product.price_10ml ?? ''),
      price_15ml: String(product.price_15ml ?? ''),
      price_30ml: String(product.price_30ml ?? ''),
      price_50ml: String(product.price_50ml ?? ''),
      price_100ml: String(product.price_100ml ?? ''),
      price_piece: '',

      // 流水账（从已有累计值反初始化一条记录，如果有的话）
      inboundRecords: (product.total_inbound_ml && Number(product.total_inbound_ml) > 0) ? [{
        id: genTempId(), date: todayStr(), size: '100ml', qty: 1,
        unitPrice: Number(product.total_cost) || 0, supplier: product.supplier_code || '',
        totalMl: Number(product.total_inbound_ml) || 0,
        totalCost: Number(product.total_cost) || 0,
      }] : [],
      salesRecords: [],
      otherCosts: [],

      // 累计
      total_inbound_ml: String(product.total_inbound_ml ?? 0),
      total_sales_ml: String(product.total_sales_ml ?? 0),
      remaining_ml: String(product.remaining_ml ?? 0),
      total_cost: String(product.total_cost ?? 0),
      total_revenue: String(product.total_revenue ?? 0),
      total_profit: String(product.total_profit ?? 0),

      code: product.code || '',
      benefits: Array.isArray(product.benefits) ? product.benefits.join(', ') : (product.benefits || ''),
      usage: product.usage || '',
      narrative: product.narrative || '',
      alice_lab: product.alice_lab || '',
      specification: product.specification || '',
      xiaohongshu_url: product.xiaohongshu_url || '',
      similar_ids: Array.isArray(product.similar_ids) ? product.similar_ids.join(', ') : (product.similar_ids || ''),
      gallery_urls: Array.isArray(product.gallery_urls) ? product.gallery_urls.join('\n') : (product.gallery_urls || ''),
      sort_order: String(product.sort_order ?? 0),
      is_active: product.is_active ?? true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backToList = () => {
    setViewMode('list');
    setEditingId(null);
    setForm(emptyForm());
    setShowDetailId(null);
  };

  // ---- 计算累计值（从流水账自动算）----
  const calcTotals = useCallback((f: ProductForm) => {
    const totalInbound = f.inboundRecords.reduce((s, r) => s + (r.totalMl || 0), 0);
    const totalSales = f.salesRecords.reduce((s, r) => s + (r.totalMl || 0), 0);
    const totalCostFromInbound = f.inboundRecords.reduce((s, r) => s + (r.totalCost || 0), 0);
    const otherCostTotal = f.otherCosts.reduce((s, r) => s + (r.amount || 0), 0);
    const totalCost = totalCostFromInbound + otherCostTotal;
    const totalRevenue = f.salesRecords.reduce((s, r) => s + (r.totalRevenue || 0), 0);
    return {
      totalInbound,
      totalSales,
      remaining: totalInbound - totalSales,
      totalCost,
      totalRevenue,
      profit: totalRevenue - totalCost,
    };
  }, []);

  const handleSave = async () => {
    if (!form.name_cn.trim()) { alert('请填写产品名称！'); return; }
    if (!form.display_name.trim()) { alert('请填写前台展示名称！'); return; }
    if (!form.category) { alert('请选择子分类！'); return; }

    try {
      setSaving(true);

      let finalCode = form.code.trim();
      if (!finalCode && form.category) {
        const catInfo = CATEGORY_SERIES_MAP[form.category];
        if (catInfo) {
          const prefix = catInfo.seriesCode;
          const seq = String(products.length + 1).padStart(3, '0');
          finalCode = `${prefix}-${seq}`;
        }
      }

      const catInfo = CATEGORY_SERIES_MAP[form.category];
      // 宽松匹配：兼容 'yuan'/'yuans' 等格式差异
      const targetSeries = catInfo
        ? series.find(s => s.code === catInfo.seriesCode || s.code.startsWith(catInfo.seriesCode))
        : null;

      // 自动计算累计值
      const totals = calcTotals(form);

      // series_id：编辑时保留原始值，新建时从 category 推断
      const resolvedSeriesId = editingId
        ? (targetSeries?.id || products.find(p => p.id === editingId)?.series_id || null)
        : (targetSeries?.id || null);

      const record: Partial<Product> = {
        code: finalCode || null,
        name_cn: form.name_cn.trim(),
        display_name: form.display_name.trim() || null,
        name_en: form.name_en.trim() || null,
        series_id: resolvedSeriesId,
        // country_id 不再使用，产地信息统一写入 origin 文字字段
        category: form.category as any,
        group_name: catInfo ? `${catInfo.seriesName}·${catInfo.label}` : null,

        short_desc: form.short_desc.trim() || null,
        element: form.element || null,
        origin: form.origin.trim() || null,
        extraction_method: form.extraction_method.trim() || null,
        description: form.description.trim() || null,
        scientific_name: form.scientific_name.trim() || null,

        // 各规格定价
        price_5ml: parseFloat(form.price_5ml) || null,
        price_10ml: parseFloat(form.price_10ml) || null,
        price_15ml: parseFloat(form.price_15ml) || null,
        price_30ml: parseFloat(form.price_30ml) || null,
        price_50ml: parseFloat(form.price_50ml) || null,
        price_100ml: parseFloat(form.price_100ml) || null,

        // 供应商（取最新一条入库记录的供应商）
        supplier_code: form.inboundRecords.length > 0
          ? form.inboundRecords[form.inboundRecords.length - 1].supplier || null
          : null,

        // 进销存累计（自动计算）
        total_inbound_ml: totals.totalInbound,
        total_sales_ml: totals.totalSales,
        remaining_ml: totals.remaining,
        total_cost: totals.totalCost,
        total_revenue: totals.totalRevenue,
        total_profit: totals.profit,

        image_url: form.image_url.trim() || null,
        benefits: form.benefits.split(/[,，]/).map(s => s.trim()).filter(Boolean),
        usage: form.usage.trim() || null,
        narrative: form.narrative.trim() || null,
        alice_lab: form.alice_lab.trim() || null,
        specification: form.specification.trim() || null,
        xiaohongshu_url: form.xiaohongshu_url.trim() || null,
        similar_ids: form.similar_ids.split(/[,，]/).map(s => s.trim()).filter(Boolean),
        gallery_urls: form.gallery_urls.split('\n').map(s => s.trim()).filter(Boolean),
        is_active: form.is_active,
        sort_order: parseInt(form.sort_order) || 0,
      };

      if (editingId) {
        await productService.update(editingId, record);
      } else {
        await productService.create(record);
      }

      await loadData();
      backToList();
    } catch (err: any) {
      console.error('保存失败:', err);
      alert('保存失败：' + (err.message || '未知错误'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除此产品？此操作不可恢复！')) return;
    try {
      await productService.delete(id);
      await loadData();
    } catch (err: any) { alert('删除失败：' + err.message); }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const newStatus = !product.is_active;
      await productService.update(product.id, { is_active: newStatus });
      // 审计日志
      if (user) {
        await writeAuditLog(user.id, 'toggle_status', 'product', product.id, {
          product_name: product.name_cn,
          product_code: product.code,
          from: product.is_active ? '上架' : '下架',
          to: newStatus ? '上架' : '下架',
        });
      }
      await loadData();
    } catch (err: any) { alert('操作失败：' + err.message); }
  };

  // ================================================================
  // 渲染：表单视图（新建/编辑）
  // ================================================================

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="space-y-4">
        <ProductEditFormV4
          form={form} setForm={setForm}
          series={series} countries={countries}
          saving={saving} onSave={handleSave} onCancel={backToList}
          isNew={viewMode === 'create'}
          existingCodes={products.map(p => p.code)}
          calcTotals={calcTotals}
          editingId={editingId}
          productBoundCountries={productBoundCountries}
        />
      </div>
    );
  }

  // ================================================================
  // 渲染：利润报表视图
  // ================================================================

  if (viewMode === 'report') {
    return (
      <ProfitReportView
        products={products}
        series={series}
        onBack={() => setViewMode('list')}
      />
    );
  }

  // ================================================================
  // 渲染：列表视图（默认）
  // ================================================================

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A2E1A]">产品管理</h2>
          <p className="text-sm text-[#6B856B] mt-1">
            4大系列 · 13个子分类 · 共{stats.total}款产品（上架{stats.active} / 下架{stats.inactive}）
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* 利润报表按钮 */}
          <button onClick={() => setViewMode('report')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl font-medium text-sm transition-colors border border-emerald-500/20"
            title="查看利润报表">
            <BarChart3 size={16} /><span className="hidden sm:inline">利润报表</span>
          </button>
          <button onClick={() => setShowBatchImport(!showBatchImport)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#F2F7F3] hover:bg-[#E0ECE0] text-[#3D5C3D] rounded-xl font-medium text-sm transition-colors border border-[#D5E2D5]"
            title="批量导入">
            <FileSpreadsheet size={16} /><span className="hidden sm:inline">批量导入</span>
          </button>
          {canEdit && (
            <button onClick={startCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#E8F3EC] hover:bg-[#D4EDDA] text-[#4A7C59] rounded-xl font-medium text-sm transition-colors border border-[#4A7C59]/20">
              <Plus size={16} /> 添加新产品
            </button>
          )}
        </div>
      </div>

      {/* 批量导入 */}
      {showBatchImport && (
        <div className="rounded-2xl bg-[#FAFCFA] border border-dashed border-[#C8DDD0] p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#F2F7F3] flex items-center justify-center">
              <Upload size={28} className="text-[#8AA08A]" /></div>
            <div><h3 className="text-[#1A2E1A] font-medium">批量导入产品</h3>
              <p className="text-sm text-[#7A967A] mt-1">支持 CSV / JSON 格式</p></div>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E8F3EC] hover:bg-[#D4EDDA] text-[#4A7C59] rounded-xl cursor-pointer text-sm font-medium">
              <Upload size={15} /> 选择文件导入
              <input type="file" accept=".csv,.json" className="hidden" onChange={e => e.target.files?.[0] && alert(`导入功能开发中...已选: ${e.target.files[0].name}`)} />
            </label>
          </div>
        </div>
      )}

      {/* ====== 搜索 & 筛选栏 ====== */}
      <div className="bg-[#FAFCFA] rounded-2xl border border-[#E0ECE0] p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AAA9A]" />
            <input type="text" placeholder="🔍 搜索名称、代码、国家..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-xl text-sm text-[#1A2E1A] placeholder:text-[#9AAA9A] focus:border-[#4A7C59]/50 focus:outline-none transition-colors" />
          </div>
          <select value={filterSeriesCode} onChange={e => {
            setFilterSeriesCode(e.target.value);
            setFilterCategory('');
            if (e.target.value) {
              setExpandedSeries(prev => { const n = new Set(prev); n.add(e.target.value); return n; });
            }
          }}
            className="px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-xl text-sm text-[#1A2E1A] focus:outline-none min-w-[130px]">
            <option value="">📂 全部系列</option>
            {series.map(s => (<option key={s.code} value={s.code}>{s.name_cn}</option>))}
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-xl text-sm text-[#1A2E1A] focus:outline-none min-w-[150px]">
            <option value="">🏷️ 全部子分类</option>
            <optgroup label="🔥 元·单方"><option value="jin">金</option><option value="mu">木</option><option value="shui">水</option><option value="huo">火</option><option value="tu">土</option></optgroup>
            <optgroup label="⚗️ 和·复方"><option value="body">身体</option><option value="mind">心智</option><option value="soul">灵魂</option></optgroup>
            <optgroup label="💧 生·纯露"><option value="clear">清净</option><option value="nourish">润养</option><option value="soothe">舒缓</option></optgroup>
            <optgroup label="✨ 香·空间"><option value="aesthetic">芳香美学</option><option value="meditation">凝思之物</option></optgroup>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
            className="px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-xl text-sm text-[#1A2E1A] focus:outline-none min-w-[120px]">
            <option value="all">📋 全部状态</option>
            <option value="active">✅ 已上架 ({stats.active})</option>
            <option value="inactive">⭕ 已下架 ({stats.inactive})</option>
          </select>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-[#8AA08A]">找到 <strong className="text-[#3D5C3D]">{stats.filtered}</strong> / {stats.total} 款产品</span>
          {(searchQuery || filterSeriesCode || filterCategory || filterStatus !== 'all') && (
            <button onClick={() => { setSearchQuery(''); setFilterSeriesCode(''); setFilterCategory(''); setFilterStatus('all'); }}
              className="text-xs text-[#4A7C59]/80 hover:text-[#4A7C59] flex items-center gap-1"><X size={12} /> 清除筛选</button>
          )}
          <div className="flex items-center gap-1.5 ml-auto">
            {['yuan','he','sheng','jing'].map(sc => {
              const s = series.find(x => x.code === sc || x.code?.startsWith(sc));
              if (!s) return null;
              const cnt = products.filter(p =>
                p.series?.code === sc || p.series?.code?.startsWith(sc) || p.series_code === sc
              ).length;
              return (
                <button key={sc} onClick={() => handleSeriesFilter(sc)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${filterSeriesCode === sc ? 'bg-[#7BA689]/18 text-[#7BA689] border border-[#7BA689]/25' : 'bg-[#F2F7F3] text-[#6B856B] border border-transparent hover:border-[#D5E2D5]'}`}
                  title={filterSeriesCode === sc ? '点击取消筛选' : `点击筛选并展开 ${s.name_cn} 系列`}>
                  {s.name_cn} ({cnt})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ====== 产品列表（折叠分组） ====== */}
      {loading ? (
        <div className="text-center py-20 text-[#6B856B]"><Package size={32} className="mx-auto mb-3 animate-pulse" /><br/>加载中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-[#8AA08A]">
          <Package size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">{searchQuery || filterSeriesCode || filterCategory ? '没有匹配的产品' : '暂无产品数据'}</p>
          {canEdit && (
            <button onClick={startCreate} className="mt-4 px-5 py-2.5 bg-[#4A7C59] hover:bg-[#4A7C59]/80 text-[#1A2E1A] text-sm rounded-xl transition-colors inline-flex items-center gap-2">
              <Plus size={14} /> 添加第一个产品
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {/* 全部展开/折叠 */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-[#9AAA9A]">点击系列名称展开/折叠</span>
            <button onClick={toggleAllSeries}
              className="text-xs text-[#4A7C59]/70 hover:text-[#4A7C59] flex items-center gap-1 transition-colors">
              {expandedSeries.size === 4 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expandedSeries.size === 4 ? '全部折叠' : '全部展开'}
            </button>
          </div>

          {groupedProducts.map(group => {
            const isExpanded = expandedSeries.has(group.code);
            return (
              <div key={group.code} className="rounded-2xl border border-[#E0ECE0] bg-white overflow-hidden">
                {/* 系列标题栏（可点击折叠） */}
                <button
                  onClick={() => toggleSeriesExpand(group.code)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FAFCFA] transition-colors"
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: group.color }}
                  />
                  <span className="text-sm font-semibold text-[#1A2E1A]">{group.name}</span>
                  <span className="text-xs text-[#8AA08A]">{group.label}</span>
                  <span className="ml-auto text-xs text-[#9AAA9A] font-mono">{group.products.length}款</span>
                  <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown size={14} className="text-[#9AAA9A]" />
                  </span>
                </button>

                {/* 展开的产品列表 */}
                {isExpanded && (
                  <div className="border-t border-[#E0ECE0]">
                    {group.products.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-[#A8BAA8]">该系列暂无产品</div>
                    ) : (
                      <div className="divide-y divide-[#F0F4F0]">
                        {group.products.map(product => (
                          <ProductCard
                            key={product.id} product={product}
                            productBoundCountries={productBoundCountries}
                            onEdit={() => startEdit(product)}
                            onDelete={() => handleDelete(product.id)}
                            onToggleActive={() => handleToggleActive(product)}
                            showDetail={showDetailId === product.id}
                            onToggleDetail={() => setShowDetailId(showDetailId === product.id ? null : product.id)}
                            canToggle={canToggle}
                            canEdit={canEdit}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ====== 右下角浮动快捷按钮 ====== */}
      <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-3">
        {/* 搜索浮窗（点击展开/收起） */}
        <div className="relative">
          {floatingSearchOpen && (
            <div className="absolute bottom-12 right-0 mb-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl border border-[#E0ECE0] shadow-2xl p-3 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <input
                autoFocus
                type="text"
                placeholder="搜索产品名称、代码…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') setFloatingSearchOpen(false); }}
                className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-xl text-sm text-[#1A2E1A] placeholder:text-[#9AAA9A] focus:border-[#4A7C59]/50 focus:outline-none"
              />
              {searchQuery && (
                <div className="text-xs text-[#8AA08A] px-1">找到 {stats.filtered} / {stats.total} 款</div>
              )}
            </div>
          )}
          <button
            onClick={() => { setFloatingSearchOpen(!floatingSearchOpen); setFloatingMenuOpen(false); }}
            className="w-12 h-12 rounded-full bg-white shadow-lg border border-[#E0ECE0] flex items-center justify-center text-[#5C725C] hover:bg-[#F2F7F3] transition-all hover:shadow-xl"
            title="快速搜索"
          >
            <Search size={20} />
          </button>
        </div>

        {/* 多功能菜单 */}
        <div className="relative">
          {floatingMenuOpen && (
            <div className="absolute bottom-12 right-0 mb-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-[#E0ECE0] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 min-w-[160px]">
              <button
                onClick={() => { setViewMode('report'); setFloatingMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#3D5C3D] hover:bg-[#F2F7F3] transition-colors"
              >
                <BarChart3 size={16} className="text-emerald-500" />
                利润报表
              </button>
              <button
                onClick={() => { setShowBatchImport(true); setFloatingMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#3D5C3D] hover:bg-[#F2F7F3] transition-colors border-t border-[#F0F4F0]"
              >
                <FileSpreadsheet size={16} className="text-blue-500" />
                批量导入
              </button>
                <button
                  onClick={() => { toggleAllSeries(); setFloatingMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#3D5C3D] hover:bg-[#F2F7F3] transition-colors border-t border-[#F0F4F0]"
                >
                <Package size={16} className="text-amber-500" />
                {expandedSeries.size === 4 ? '全部折叠' : '全部展开并重置筛选'}
              </button>
            </div>
          )}
          <button
            onClick={() => { setFloatingMenuOpen(!floatingMenuOpen); setFloatingSearchOpen(false); }}
            className="w-12 h-12 rounded-full bg-white shadow-lg border border-[#E0ECE0] flex items-center justify-center text-[#5C725C] hover:bg-[#F2F7F3] transition-all hover:shadow-xl"
            title="更多操作"
          >
            <Settings2 size={20} />
          </button>
        </div>

        {/* 添加新产品 — 主按钮 */}
        {canEdit && (
          <button
            onClick={startCreate}
            className="w-14 h-14 rounded-full bg-[#4A7C59] hover:bg-[#3D6B4A] shadow-xl hover:shadow-2xl flex items-center justify-center text-white transition-all active:scale-95"
            title="添加新产品"
          >
            <Plus size={24} />
          </button>
        )}
      </div>
    </div>
  );
}


// ============================================
// 产品卡片组件（列表行）
// ============================================

function ProductCard({ product, productBoundCountries, onEdit, onDelete, onToggleActive, showDetail, onToggleDetail, canToggle, canEdit }: {
  product: Product;
  productBoundCountries: Record<string, string[]>;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  showDetail: boolean;
  onToggleDetail: () => void;
  canToggle: boolean;
  canEdit: boolean;
}) {
  // 检查是否是香系列
  const isJing = product.category === 'aesthetic' || product.category === 'meditation';
  const unit = isJing ? '件' : 'ml';

  return (
    <div className={`group rounded-xl bg-white border transition-all duration-200 ${showDetail ? 'border-[#C8DDD0]' : 'border-[#E0ECE0] hover:border-[#D5E2D5]'}`}>
      <div className="flex items-center gap-4 px-4 py-3 cursor-pointer" onClick={onEdit}>
        {/* 缩略图 */}
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F2F7F3] flex-shrink-0">
          {product.image_url ? (
            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#A8BAA8]"><Package size={18} /></div>
          )}
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${product.is_active ? 'bg-green-400' : 'bg-white/20'}`} />
            <h4 className="text-sm font-medium text-[#1A2E1A] truncate">{product.name_cn}</h4>
            {product.name_en && <span className="text-xs text-[#8AA08A] hidden md:inline truncate">({product.name_en})</span>}
            {!product.is_active && <span className="text-[10px] px-1.5 py-0.5 bg-[#F2F7F3] text-[#9AAA9A] rounded">草稿</span>}
            {/* 香系列标记 */}
            {isJing && <span className="text-[9px] px-1.5 py-0.5 bg-purple-500/15 text-purple-400/70 rounded">器物</span>}
          </div>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#8AA08A] flex-wrap">
            {product.code && <code className="bg-[#F2F7F3] px-1.5 py-0.5 rounded font-mono">{product.code}</code>}
            {product.series && <span className="text-[#D4AF37]/70">{product.series.name_cn}</span>}
            {product.category && (
              <span className="bg-[#F2F7F3] px-1.5 py-0.5 rounded text-[#5C725C]">
                {SUB_CATEGORY_LABELS[product.category as keyof typeof SUB_CATEGORY_LABELS] || product.category}
              </span>
            )}
            {/* 产地文字 */}
            {product.origin && (
              <span className="flex items-center gap-0.5 text-[#8AA08A]">
                <Globe size={10} />
                {product.origin}
              </span>
            )}
            {/* 被国家绑定（只读展示） */}
            {productBoundCountries[product.id]?.length > 0 && (
              <span className="flex items-center gap-0.5 text-blue-400/60">
                <Link2 size={10} />
                {productBoundCountries[product.id].join('、')}
              </span>
            )}
            {/* 库存与价格 */}
            {(product.price_10ml || product.remaining_ml !== undefined) && (
              <>
                {product.price_10ml && !isJing && <span className="text-[#4A7C59]/70 font-medium">¥{product.price_10ml}/10ml</span>}
                {product.remaining_ml !== undefined && product.remaining_ml > 0 && (
                  <span className={`flex items-center gap-0.5 ${Number(product.remaining_ml) < (isJing ? 5 : 50) ? 'text-orange-400/60' : 'text-green-400/50'}`}>
                    <Box size={9} /> 库存{product.remaining_ml}{unit}
                  </span>
                )}
              </>
            )}
            {/* 利润 */}
            {product.total_profit !== undefined && Number(product.total_profit) > 0 && (
              <span className="text-emerald-400/60 flex items-center gap-0.5"><TrendingUp size={9} /> 利润 ¥{product.total_profit}</span>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          {canToggle && (
            <button onClick={(e) => { e.stopPropagation(); onToggleActive(); }} title={product.is_active ? '下架' : '上架'}
              className="p-1.5 hover:bg-[#EEF4EF] rounded-lg transition-colors">
              {product.is_active ? <ToggleRight size={22} className="text-green-400" /> : <ToggleLeft size={22} className="text-[#9AAA9A]" />}
            </button>
          )}
          {canEdit && (
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} title="编辑"
              className="p-1.5 hover:bg-[#EEF4EF] rounded-lg transition-colors">
              <Edit2 size={14} className="text-[#5C725C]" />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onToggleDetail(); }}
            className="p-1.5 hover:bg-[#EEF4EF] rounded-lg" title={showDetail ? '收起' : '详情'}>
            {showDetail ? <ChevronUp size={14} className="text-[#5C725C]" /> : <ChevronDown size={14} className="text-[#5C725C]" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} title="删除"
            className="p-1.5 hover:bg-red-500/10 rounded-lg">
            <Trash2 size={14} className="text-red-400/50 hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* 展开详情 — 含进销存摘要 */}
      {showDetail && (
        <div className="px-4 pb-4 pt-1 border-t border-[#E0ECE0] mt-1" onClick={e => e.stopPropagation()}>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs pt-3">
            {[
              ['学名', product.scientific_name],
              ['产地', product.origin],
              ['供应商', product.supplier_code],
              [`进货总量`, `${product.total_inbound_ml ?? 0}${unit}`],
              [`销售总量`, `${product.total_sales_ml ?? 0}${unit}`],
              ['剩余库存', `${product.remaining_ml ?? 0}${unit}`, Number(product.remaining_ml ?? 0) < (isJing ? 5 : 50) ? 'text-orange-400' : ''],
              ['累计利润', `¥${product.total_profit ?? 0}`, Number(product.total_profit ?? 0) > 0 ? 'text-emerald-400' : ''],
            ].map(([label, val, cls]) => (
              <div key={label}>
                <span className="text-[#9AAA9A] block">{label}</span>
                <span className={`${cls || 'text-[#3D5C3D]'} break-all`}>{val || '-'}</span>
              </div>
            ))}
          </div>
          {Array.isArray(product.gallery_urls) && product.gallery_urls.length > 0 && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {product.gallery_urls.slice(0, 6).map((url, i) => <img key={i} src={url} alt="" className="w-16 h-16 rounded-lg object-cover bg-[#F2F7F3]" />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ============================================
// V4 表单 — 进销存完整版（UX优化版）
// ============================================

const SECTION_NAV = [
  { id: 'sec-basic',   label: '基础信息', color: '#D4AF37', bg: 'bg-amber-50/60' },
  { id: 'sec-price',   label: '销售定价', color: '#60A5FA', bg: 'bg-blue-50/60' },
  { id: 'sec-inbound', label: '入库记录', color: '#4ADE80', bg: 'bg-green-50/60' },
  { id: 'sec-sales',   label: '出库记录', color: '#FB923C', bg: 'bg-orange-50/60' },
  { id: 'sec-cost',    label: '其他成本', color: '#FBBF24', bg: 'bg-yellow-50/60' },
  { id: 'sec-summary', label: '汇总面板', color: '#34D399', bg: 'bg-emerald-50/60' },
  { id: 'sec-advanced',label: '高级选项', color: '#9CA3AF', bg: 'bg-gray-50/60' },
];

const PAGE_SIZE = 10;

function ProductEditFormV4({
  form, setForm, series, countries, saving, onSave, onCancel, isNew,
  existingCodes, calcTotals, editingId, productBoundCountries,
}: {
  form: ProductForm;
  setForm: React.Dispatch<React.SetStateAction<ProductForm>>;
  series: Series[];
  countries: Country[];
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
  isNew: boolean;
  existingCodes: string[];
  calcTotals: (f: ProductForm) => {
    totalInbound: number; totalSales: number; remaining: number;
    totalCost: number; totalRevenue: number; profit: number;
  };
  editingId: string | null;
  productBoundCountries: Record<string, string[]>;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeSection, setActiveSection] = useState('sec-basic');

  // 入库/出库分页
  const [inboundPage, setInboundPage] = useState(1);
  const [salesPage, setSalesPage] = useState(1);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const currentCategoryInfo = form.category ? CATEGORY_SERIES_MAP[form.category] : null;
  const isJing = isJingSeries(form.category);
  const unit = getUnitLabel(form.category);
  const totals = calcTotals(form);

  const updateField = (field: keyof ProductForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // 分页数据
  const inboundPaginated = useMemo(() => {
    const totalPages = Math.ceil(form.inboundRecords.length / PAGE_SIZE) || 1;
    const page = Math.min(inboundPage, totalPages);
    const start = (page - 1) * PAGE_SIZE;
    return { records: form.inboundRecords.slice(start, start + PAGE_SIZE), totalPages, page };
  }, [form.inboundRecords, inboundPage]);

  const salesPaginated = useMemo(() => {
    const totalPages = Math.ceil(form.salesRecords.length / PAGE_SIZE) || 1;
    const page = Math.min(salesPage, totalPages);
    const start = (page - 1) * PAGE_SIZE;
    return { records: form.salesRecords.slice(start, start + PAGE_SIZE), totalPages, page };
  }, [form.salesRecords, salesPage]);

  // 滚动监听高亮当前模块
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );
    SECTION_NAV.forEach(s => {
      const el = sectionRefs.current[s.id];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // 保存单条入库记录（乐观更新 + 提示）
  const saveSingleInbound = async (record: InboundEntry, allRecords: InboundEntry[]) => {
    // 更新本地状态
    setForm(prev => ({ ...prev, inboundRecords: allRecords }));
    const t = calcTotals({ ...form, inboundRecords: allRecords });
    alert(`✅ 入库记录已保存\n规格：${record.size} × ${record.qty}\n金额：¥${record.totalCost.toFixed(2)}\n剩余库存：${t.remaining}${unit}`);
  };

  const saveSingleSales = async (record: SalesEntry, allRecords: SalesEntry[]) => {
    setForm(prev => ({ ...prev, salesRecords: allRecords }));
    alert(`✅ 销售记录已保存\n规格：${record.size} × ${record.qty}\n收入：¥${record.totalRevenue.toFixed(2)}`);
  };

  return (
    <div className="relative">

      {/* ====== 固定左侧导航栏 ====== */}
      <div className="fixed left-4 top-24 z-40 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md rounded-2xl border border-[#E0ECE0] shadow-lg p-2.5 min-w-[88px]">
        {/* Logo */}
        <div className="flex items-center gap-1.5 px-1 pb-1.5 mb-0.5 border-b border-[#E0ECE0]">
          <div className="w-6 h-6 rounded-md bg-[#4A7C59]/20 flex items-center justify-center flex-shrink-0">
            {isNew ? <Zap size={12} className="text-[#4A7C59]" /> : <Edit2 size={12} className="text-[#4A7C59]" />}
          </div>
          <span className="text-[10px] font-semibold text-[#1A2E1A] leading-tight">{isNew ? '添加产品' : '编辑产品'}</span>
        </div>

        {/* 模块导航按钮（竖向） */}
        {SECTION_NAV.map(sec => (
          <button
            key={sec.id}
            onClick={() => scrollToSection(sec.id)}
            className={`w-full px-2 py-1.5 rounded-xl text-[11px] font-medium transition-all text-left ${
              activeSection === sec.id
                ? 'text-white shadow-sm'
                : 'text-[#6B856B] hover:bg-[#F2F7F3]'
            }`}
            style={activeSection === sec.id ? { backgroundColor: sec.color } : {}}
          >
            {sec.label}
          </button>
        ))}

        <div className="border-t border-[#E0ECE0] mt-1 pt-1.5 flex flex-col gap-1.5">
          {/* 前台预览 */}
          {form.name_cn && (
            <button
              onClick={() => setShowPreview(true)}
              className="w-full flex items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] text-[#1C39BB] hover:bg-blue-50 transition-colors"
              title="预览前台展示效果"
            >
              <ExternalLink size={11} />
              <span>预览</span>
            </button>
          )}

          {/* 保存主按钮 */}
          <button onClick={onSave} disabled={saving}
            className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-[#4A7C59] hover:bg-[#3D6B4A] text-white text-[11px] font-medium rounded-xl transition-colors disabled:opacity-50">
            {saving ? <SpinIcon /> : <Save size={11} />}
            {isNew ? '创建' : '保存'}
          </button>

          {/* 取消按钮 */}
          <button onClick={onCancel}
            className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-[#9AAA9A] hover:bg-gray-50 text-[11px] rounded-xl transition-colors">
            <X size={11} />
            取消
          </button>
        </div>
      </div>

      {/* ====== 表单主体（右侧留空给侧边栏） ====== */}
      <div className="pl-28 space-y-5">

        {/* 顶部返回栏 */}
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="flex items-center gap-1.5 text-sm text-[#5C725C] hover:text-[#1A2E1A] transition-colors">
            <ChevronRight size={14} className="rotate-180" /> 返回列表
          </button>
          <span className="text-[#9AAA9A]">|</span>
          <span className="text-sm text-[#8AA08A]">
            {isNew ? '添加新产品' : `编辑：${form.name_cn || ''}`}
          </span>
        </div>

        {/* ─── 📋 栏目一：基础信息 ─── */}
        <div id="sec-basic" ref={el => { sectionRefs.current['sec-basic'] = el; }}
          className={`rounded-2xl border border-[#D5E2D5] overflow-hidden transition-all ${SECTION_NAV[0].bg}`}>
          <div className="px-5 py-3 border-b border-[#E0ECE0] flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: '#D4AF3730' }}>
              <Star size={12} className="text-[#D4AF37]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#D4AF37' }}>栏目一：基础信息</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="前台展示名称 *" value={form.display_name} onChange={v => updateField('display_name', v)} placeholder="如：乳香（用户看到的名字）" required />
              <Field label="产品中文名 *" value={form.name_cn} onChange={v => updateField('name_cn', v)} placeholder="正式中文名" required />
              <Field label="英文名称" value={form.name_en} onChange={v => updateField('name_en', v)} placeholder="Frankincense" />
              <Field label="拉丁学名" value={form.scientific_name} onChange={v => updateField('scientific_name', v)} placeholder="Boswellia sacra" />
            </div>

            {/* 系列 + 子分类：先选系列，再选对应子分类 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 第一步：选系列 */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#5C725C]">系列 <span className="text-[#4A7C59]">*</span></label>
                <select value={currentCategoryInfo?.seriesCode || ''}
                  onChange={e => {
                    const sc = e.target.value;
                    if (!sc) {
                      // 清空系列 → 同时清空子分类
                      setForm(prev => ({ ...prev, category: '', element: '' }));
                    } else {
                      // 切换系列 → 清空子分类（让用户重新选）
                      setForm(prev => ({ ...prev, category: '', element: '' }));
                    }
                  }}
                  className="w-full bg-white border border-[#D5E2D5] rounded-lg px-3 py-2.5 text-sm text-[#1A2E1A] focus:border-[#4A7C59] outline-none">
                  <option value="">→ 选择系列...</option>
                  <option value="yuan">🔥 元 · 单方 / 极境生存原力</option>
                  <option value="he">⚗️ 和 · 复方 / 科学频率重构</option>
                  <option value="sheng">💧 生 · 纯露 / 植物生命之水</option>
                  <option value="jing">✨ 香 · 空间 / 极简芳香美学</option>
                </select>
              </div>

              {/* 第二步：选子分类（根据所选系列动态显示） */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#5C725C]">子分类 <span className="text-[#4A7C59]">*</span></label>
                {currentCategoryInfo?.seriesCode ? (
                  <select value={form.category} onChange={e => {
                    const newCat = e.target.value;
                    const newInfo = newCat ? CATEGORY_SERIES_MAP[newCat] : null;
                    // 元系列：子分类 = 五行元素，自动同步 element
                    const autoElement = newInfo?.seriesCode === 'yuan'
                      ? (CATEGORY_TO_ELEMENT[newCat] || '')
                      : '';
                    setForm(prev => ({ ...prev, category: newCat, element: autoElement }));
                  }}
                    className="w-full bg-white border border-[#D5E2D5] rounded-lg px-3 py-2.5 text-sm text-[#1A2E1A] focus:border-[#4A7C59] outline-none">
                    <option value="">→ 选择子分类...</option>
                    {SERIES_CATEGORIES_OPTIONS[currentCategoryInfo.seriesCode]?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full bg-[#F2F7F3] border border-[#D5E2D5] rounded-lg px-3 py-2.5 text-sm text-[#9AAA9A]">
                    请先选择系列
                  </div>
                )}
                {currentCategoryInfo && (
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${isJing ? 'bg-purple-100 text-purple-500' : 'bg-amber-100 text-amber-600'}`}>
                    {currentCategoryInfo.seriesName}系列 · {currentCategoryInfo.label} {isJing ? '· 器物' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* 产地（从国家库选择，写入 origin 文字字段） */}
            <OriginSelector
              countries={countries}
              currentOrigin={form.origin}
              onSelectOrigin={(name) => updateField('origin', name)}
              onClear={() => updateField('origin', '')}
            />

            {/* 被绑定国家（只读展示，需在国家管理页操作） */}
            {editingId && productBoundCountries[editingId]?.length > 0 && (
              <div className="rounded-xl bg-blue-500/5 border border-blue-200/40 p-3">
                <div className="flex items-center gap-1.5 text-xs text-blue-400/70 mb-2">
                  <Link2 size={12} /> 已被以下国家绑定
                  <span className="text-[10px] text-[#9AAA9A] ml-1">（在国家管理页操作）</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {productBoundCountries[editingId].map(name => (
                    <span key={name} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 text-blue-300/80 rounded-lg text-xs">
                      <Globe size={10} /> {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 图片上传 */}
            <ImageUploadField
              label="产品主图"
              value={form.image_url}
              onChange={v => updateField('image_url', v)}
              showGallery={true}
              onGalleryChange={v => updateField('gallery_urls', v)}
              galleryValue={form.gallery_urls}
              uploadPrefix={`products/${form.display_name || form.name_cn || 'product'}`}
              previewSize="w-20 h-20"
            />

            {/* 折叠：更多 */}
            <CollapsibleSection icon={<Clock size={11} />} title="更多基础信息（五行/产地/描述）" defaultOpen={false}>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 五行元素：仅元系列显示，自动跟随子分类 */}
                  {currentCategoryInfo?.seriesCode === 'yuan' && form.element && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#5C725C]">五行元素</label>
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg">
                        <span className="text-sm font-medium text-[#D4AF37]">{form.element}</span>
                        <span className="text-[10px] text-[#9AAA9A]">（跟随子分类）</span>
                      </div>
                    </div>
                  )}
                  <Field label="产地详情" value={form.origin} onChange={v => updateField('origin', v)} placeholder="法国普罗旺斯" />
                  <Field label="提炼方式" value={form.extraction_method} onChange={v => updateField('extraction_method', v)} placeholder="蒸馏/脂吸/压榨" />
                </div>
                <Field label="短描述" value={form.short_desc} onChange={v => updateField('short_desc', v)} placeholder="一句话特点..." />
                <TextArea label="详细描述" value={form.description} onChange={v => updateField('description', v)} rows={2} placeholder="产品的完整故事..." />
              </div>
            </CollapsibleSection>
          </div>
        </div>

        {/* ─── 💰 栏目二：销售定价 ─── */}
        <div id="sec-price" ref={el => { sectionRefs.current['sec-price'] = el; }}
          className={`rounded-2xl border border-blue-200 overflow-hidden transition-all ${SECTION_NAV[1].bg}`}>
          <div className="px-5 py-3 border-b border-blue-100 flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center bg-blue-100">
              <DollarSign size={12} className="text-blue-500" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-500">栏目二：销售定价</span>
            <span className="text-[10px] text-blue-400/60 ml-2">设定各规格售价（出库时自动引用）</span>
          </div>
          <div className="p-5">
            {!isJing ? (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[['5ml', 'price_5ml'], ['10ml*', 'price_10ml'], ['15ml', 'price_15ml'], ['30ml', 'price_30ml'], ['50ml', 'price_50ml'], ['100ml', 'price_100ml']].map(([label, field]) => (
                  <div key={field}>
                    <label className="block text-[11px] font-medium text-[#7A967A] mb-1">{label}</label>
                    <input type="number" step="0.01" min="0"
                      value={form[field as keyof ProductForm] as string}
                      onChange={e => updateField(field as keyof ProductForm, e.target.value)}
                      placeholder="¥"
                      className="w-full px-3 py-2 bg-white border border-[#D5E2D5] rounded-lg text-sm text-blue-600 font-mono outline-none focus:border-blue-400 placeholder:text-[#9AAA9A]" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-[11px] font-medium text-[#7A967A] mb-1">单件售价 (¥)</label>
                  <input type="number" step="0.01" min="0" value={form.price_piece}
                    onChange={e => updateField('price_piece', e.target.value)} placeholder="388"
                    className="w-full px-3 py-2 bg-white border border-[#D5E2D5] rounded-lg text-sm text-purple-600 font-mono outline-none focus:border-purple-400" />
                </div>
                <div className="text-xs text-purple-400/60">香系列按件/套计量</div>
              </div>
            )}
          </div>
        </div>

        {/* ─── 📦 栏目三：入库记录 ─── */}
        <div id="sec-inbound" ref={el => { sectionRefs.current['sec-inbound'] = el; }}
          className={`rounded-2xl border border-green-200 overflow-hidden transition-all ${SECTION_NAV[2].bg}`}>
          <div className="px-5 py-3 border-b border-green-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md flex items-center justify-center bg-green-100">
                <ArrowDownLeft size={12} className="text-green-500" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-green-500">栏目三：入库记录</span>
              <span className="text-[10px] text-green-400/60">{form.inboundRecords.length}条 · 共{totals.totalInbound}{unit}</span>
            </div>
          </div>
          <div className="p-5 space-y-3">
            <InboundRecordEditorV2
              records={form.inboundRecords}
              paginated={inboundPaginated}
              onChange={(records) => setForm(prev => ({ ...prev, inboundRecords: records }))}
              onPageChange={setInboundPage}
              onSave={saveSingleInbound}
              isJing={isJing}
              unit={unit}
            />
            <button type="button"
              onClick={() => {
                const newSize = isJing ? '1件' : '100ml';
                const newRecords = [...form.inboundRecords, { id: genTempId(), date: todayStr(), size: newSize, qty: 1, unitPrice: 0, supplier: '', totalMl: parseSizeToMl(newSize), totalCost: 0 }];
                setForm(prev => ({ ...prev, inboundRecords: newRecords }));
                setInboundPage(Math.ceil(newRecords.length / PAGE_SIZE));
              }}
              className="w-full py-2 border border-dashed border-green-300 rounded-xl text-green-500 hover:text-green-600 hover:border-green-400 text-sm transition-all flex items-center justify-center gap-2 bg-green-50/50">
              <Plus size={14} /> 添加入库记录
            </button>
          </div>
        </div>

        {/* ─── 🛒 栏目四：出库记录 ─── */}
        <div id="sec-sales" ref={el => { sectionRefs.current['sec-sales'] = el; }}
          className={`rounded-2xl border border-orange-200 overflow-hidden transition-all ${SECTION_NAV[3].bg}`}>
          <div className="px-5 py-3 border-b border-orange-100 flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center bg-orange-100">
              <ArrowUpRight size={12} className="text-orange-500" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-500">栏目四：出库/销售</span>
            <span className="text-[10px] text-orange-400/60">{form.salesRecords.length}条 · 共{totals.totalSales}{unit}</span>
          </div>
          <div className="p-5 space-y-3">
            <SalesRecordEditorV2
              records={form.salesRecords}
              paginated={salesPaginated}
              prices={{
                price_5ml: parseFloat(form.price_5ml) || 0, price_10ml: parseFloat(form.price_10ml) || 0,
                price_15ml: parseFloat(form.price_15ml) || 0, price_30ml: parseFloat(form.price_30ml) || 0,
                price_50ml: parseFloat(form.price_50ml) || 0, price_100ml: parseFloat(form.price_100ml) || 0,
                price_piece: parseFloat(form.price_piece) || 0,
              }}
              onChange={(records) => setForm(prev => ({ ...prev, salesRecords: records }))}
              onPageChange={setSalesPage}
              onSave={saveSingleSales}
              isJing={isJing}
              unit={unit}
            />
            <button type="button"
              onClick={() => {
                const defaultSize = isJing ? '1个' : '10ml';
                const defaultPrice = isJing ? (parseFloat(form.price_piece) || 0) : (parseFloat(form.price_10ml) || 0);
                const newRecords = [...form.salesRecords, { id: genTempId(), date: todayStr(), size: defaultSize, qty: 1, unitPrice: defaultPrice, totalMl: parseSizeToMl(defaultSize), totalRevenue: defaultPrice }];
                setForm(prev => ({ ...prev, salesRecords: newRecords }));
                setSalesPage(Math.ceil(newRecords.length / PAGE_SIZE));
              }}
              className="w-full py-2 border border-dashed border-orange-300 rounded-xl text-orange-500 hover:text-orange-600 hover:border-orange-400 text-sm transition-all flex items-center justify-center gap-2 bg-orange-50/50">
              <Plus size={14} /> 添加销售记录
            </button>
          </div>
        </div>

        {/* ─── 📎 栏目五：其他成本 ─── */}
        <div id="sec-cost" ref={el => { sectionRefs.current['sec-cost'] = el; }}
          className={`rounded-2xl border border-yellow-200 overflow-hidden transition-all ${SECTION_NAV[4].bg}`}>
          <div className="px-5 py-3 border-b border-yellow-100 flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center bg-yellow-100">
              <Receipt size={12} className="text-yellow-600" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-yellow-600">栏目五：其他成本</span>
            <span className="text-[10px] text-yellow-400/60">{form.otherCosts.length}条 · ¥{(totals.totalCost - form.inboundRecords.reduce((s,r) => s+r.totalCost, 0)).toFixed(0)}</span>
          </div>
          <div className="p-5 space-y-3">
            <OtherCostEditorV2
              costs={form.otherCosts}
              onChange={(costs) => setForm(prev => ({ ...prev, otherCosts: costs }))}
            />
            <button type="button"
              onClick={() => setForm(prev => ({ ...prev, otherCosts: [...prev.otherCosts, { id: genTempId(), date: todayStr(), category: '包装印刷', amount: 0, description: '' }] }))}
              className="w-full py-2 border border-dashed border-yellow-300 rounded-xl text-yellow-600 hover:text-yellow-700 hover:border-yellow-400 text-sm transition-all flex items-center justify-center gap-2 bg-yellow-50/50">
              <Plus size={14} /> 添加其他成本
            </button>
          </div>
        </div>

        {/* ─── 📊 栏目六：汇总面板 ─── */}
        <div id="sec-summary" ref={el => { sectionRefs.current['sec-summary'] = el; }}
          className="rounded-2xl border border-emerald-200 bg-emerald-50/60 overflow-hidden">
          <div className="px-5 py-3 border-b border-emerald-100 flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center bg-emerald-100">
              <BarChart3 size={12} className="text-emerald-500" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">实时汇总</span>
            <span className="text-[10px] text-emerald-400/60">自动计算 · 保存后生效</span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                ['进货', totals.totalInbound, unit, 'text-green-600'],
                ['销售', totals.totalSales, unit, 'text-blue-600'],
                ['库存', totals.remaining, unit, totals.remaining < (isJing ? 5 : 50) ? 'text-red-500' : 'text-emerald-600'],
                ['成本', `¥${totals.totalCost.toFixed(0)}`, '', 'text-red-500'],
                ['收入', `¥${totals.totalRevenue.toFixed(0)}`, '', 'text-green-600'],
                ['利润', `¥${totals.profit.toFixed(0)}`, '', totals.profit >= 0 ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'],
              ].map(([label, val, u, cls]) => (
                <div key={String(label)} className="bg-white rounded-xl p-3 text-center border border-emerald-100">
                  <div className="text-[10px] text-[#9AAA9A] mb-1">{String(label)}</div>
                  <div className={`text-sm font-bold font-mono ${String(cls)}`}>{String(val)}<span className="text-[9px] font-normal opacity-50 ml-0.5">{String(u)}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── ⚙️ 高级选项 ─── */}
        <div id="sec-advanced" ref={el => { sectionRefs.current['sec-advanced'] = el; }}
          className="rounded-2xl border border-gray-200 bg-gray-50/60 overflow-hidden">
          <button type="button" onClick={() => setAdvancedOpen(!advancedOpen)}
            className="w-full px-5 py-3 flex items-center gap-2 text-left">
            <Settings2 size={13} className="text-gray-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">高级选项</span>
            <span className="text-[10px] text-gray-400 font-normal normal-case ml-2">(code/功效/小红书链接等)</span>
            <span className={`ml-auto transition-transform ${advancedOpen ? 'rotate-90' : ''}`}><ChevronRight size={12} /></span>
          </button>
          {advancedOpen && (
            <div className="px-5 pb-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="产品代码" value={form.code} onChange={v => updateField('code', v)} placeholder="留空自动生成" />
                <Field label="排序权重" value={form.sort_order} onChange={v => updateField('sort_order', v)} type="number" />
              </div>
              <Field label="小红书链接" value={form.xiaohongshu_url} onChange={v => updateField('xiaohongshu_url', v)} placeholder="https://xhslink.com/..." />
              <TextArea label="功效标签（逗号分隔）" value={form.benefits} onChange={v => updateField('benefits', v)} rows={2} />
              <TextArea label="使用说明" value={form.usage} onChange={v => updateField('usage', v)} rows={2} />
              <TextArea label="Alice Lab 日记" value={form.alice_lab} onChange={v => updateField('alice_lab', v)} rows={2} />
              <TextArea label="Eric 叙事日志" value={form.narrative} onChange={v => updateField('narrative', v)} rows={2} />
            </div>
          )}
        </div>

        {/* ====== 底部操作栏 ====== */}
        <div className="flex items-center justify-between bg-white rounded-2xl border border-[#D5E2D5] p-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => updateField('is_active', e.target.checked)} className="accent-[#4A7C59] w-4 h-4" />
            <span className="text-sm text-[#3D5C3D]">{form.is_active ? '✓ 已上架' : '○ 草稿'}</span>
          </label>
          <div className="flex items-center gap-3">
            <button onClick={onCancel} className="px-4 py-2 text-sm text-[#5C725C] hover:text-[#1A2E1A] rounded-xl hover:bg-[#EEF4EF] transition-colors">取消</button>
            <button onClick={onSave} disabled={saving}
              className="px-6 py-2.5 bg-[#4A7C59] text-white text-sm font-medium rounded-xl hover:bg-[#3D6B4A] disabled:opacity-50 flex items-center gap-2 transition-colors">
              {saving && <SpinIcon />}{isNew ? '✨ 创建产品' : '💾 保存全部'}
            </button>
          </div>
        </div>
      </div>

      {/* ====== 前台预览弹窗 ====== */}
      {showPreview && (
        <ProductPreviewModal
          form={form}
          isJing={isJing}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}


// ============================================
// V2 入库记录编辑器 — 分页 + 单条保存
// ============================================

function InboundRecordEditorV2({ records, paginated, onChange, onPageChange, onSave, isJing }: {
  records: InboundEntry[];
  paginated: { records: InboundEntry[]; totalPages: number; page: number };
  onChange: (r: InboundEntry[]) => void;
  onPageChange: (p: number) => void;
  onSave: (record: InboundEntry, all: InboundEntry[]) => void;
  isJing: boolean;
}) {
  const sizes = isJing ? INBOUND_SIZES_PIECE : INBOUND_SIZES_ML;

  const updateRecord = (id: string, field: keyof InboundEntry, value: any) => {
    onChange(records.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: value };
      updated.totalMl = parseSizeToMl(updated.size) * (updated.qty || 0);
      updated.totalCost = (updated.qty || 0) * (updated.unitPrice || 0);
      return updated;
    }));
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-8 rounded-xl bg-white border border-dashed border-[#E0ECE0]">
        <ArrowDownLeft size={24} className="mx-auto mb-2 text-[#A8BAA8]" />
        <p className="text-sm text-[#8AA08A]">暂无入库记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {paginated.records.map((record) => (
        <div key={record.id} className="rounded-xl bg-white border border-green-100 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-green-500/60 flex items-center gap-1">
              <Box size={11} /> 入库 #{record.id.split('_')[1] || '?'}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => onSave(record, records)}
                className="flex items-center gap-1 px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white text-[10px] rounded-lg transition-colors shadow-sm">
                <Save size={9} /> 保存
              </button>
              <button onClick={() => onChange(records.filter(r => r.id !== record.id))}
                className="p-1 hover:bg-red-50 rounded text-red-400/40 hover:text-red-400 transition-colors">
                <X size={13} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            <div>
              <label className="block text-[10px] text-[#8AA08A] mb-0.5">日期</label>
              <input type="date" value={record.date}
                onChange={e => updateRecord(record.id, 'date', e.target.value)}
                className="w-full px-2 py-1.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded text-xs text-[#1A2E1A] outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-[10px] text-[#8AA08A] mb-0.5">规格</label>
              <select value={record.size}
                onChange={e => updateRecord(record.id, 'size', e.target.value)}
                className="w-full px-2 py-1.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded text-xs text-[#1A2E1A] outline-none focus:border-green-400">
                {sizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-[#8AA08A] mb-0.5">数量</label>
              <input type="number" min="1" value={record.qty}
                onChange={e => updateRecord(record.id, 'qty', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded text-xs text-[#1A2E1A] outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-[10px] text-[#8AA08A] mb-0.5">单价 (¥)</label>
              <input type="number" step="0.01" min="0" value={record.unitPrice || ''}
                onChange={e => updateRecord(record.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded text-xs text-[#1A2E1A] font-mono outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="block text-[10px] text-[#8AA08A] mb-0.5">供应商</label>
              <input type="text" value={record.supplier}
                onChange={e => updateRecord(record.id, 'supplier', e.target.value)}
                placeholder="名称/代码"
                className="w-full px-2 py-1.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded text-xs text-[#1A2E1A] outline-none focus:border-green-400 placeholder:text-[#9AAA9A]" />
            </div>
            <div>
              <label className="block text-[10px] text-[#8AA08A] mb-0.5">小计</label>
              <div className="px-2 py-1.5 bg-green-50 rounded text-xs font-mono text-green-600 font-medium">
                ¥{record.totalCost.toFixed(2)}<span className="text-[9px] opacity-60 ml-0.5">({record.totalMl}{isJing ? '' : 'ml'})</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      {paginated.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-1">
          <button onClick={() => onPageChange(paginated.page - 1)} disabled={paginated.page <= 1}
            className="px-3 py-1 rounded text-xs text-[#6B856B] hover:bg-white border border-[#D5E2D5] disabled:opacity-30">‹ 上一页</button>
          <span className="text-xs text-[#9AAA9A]">{paginated.page} / {paginated.totalPages}</span>
          <button onClick={() => onPageChange(paginated.page + 1)} disabled={paginated.page >= paginated.totalPages}
            className="px-3 py-1 rounded text-xs text-[#6B856B] hover:bg-white border border-[#D5E2D5] disabled:opacity-30">下一页 ›</button>
          <span className="text-[10px] text-[#9AAA9A]">共{records.length}条</span>
        </div>
      )}
    </div>
  );
}


// ============================================
// V2 销售/出库记录编辑器 — 分页 + 单条保存
// ============================================

function SalesRecordEditorV2({ records, paginated, prices, onChange, onPageChange, onSave, isJing }: {
  records: SalesEntry[];
  paginated: { records: SalesEntry[]; totalPages: number; page: number };
  prices: { price_5ml: number; price_10ml: number; price_15ml: number; price_30ml: number; price_50ml: number; price_100ml: number; price_piece: number; };
  onChange: (r: SalesEntry[]) => void;
  onPageChange: (p: number) => void;
  onSave: (record: SalesEntry, all: SalesEntry[]) => void;
  isJing: boolean;
}) {
  const sizes = isJing ? SALES_SIZES_PIECE : SALES_SIZES_ML;

  const getSuggestedPrice = (size: string): number => {
    if (isJing) return prices.price_piece || 0;
    const ml = parseSizeToMl(size);
    if (!ml || !prices.price_10ml) return 0;
    return Number((prices.price_10ml / 10 * ml).toFixed(1));
  };

  const updateRecord = (id: string, field: keyof SalesEntry, value: any) => {
    onChange(records.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: value };
      updated.totalMl = parseSizeToMl(updated.size) * (updated.qty || 0);
      updated.totalRevenue = (updated.qty || 0) * (updated.unitPrice || 0);
      return updated;
    }));
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-8 rounded-xl bg-white border border-dashed border-[#E0ECE0]">
        <ArrowUpRight size={24} className="mx-auto mb-2 text-[#A8BAA8]" />
        <p className="text-sm text-[#8AA08A]">暂无销售记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {paginated.records.map((record) => (
        <div key={record.id} className="rounded-xl bg-white border border-orange-100 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-orange-500/60 flex items-center gap-1">
              <ShoppingCart size={11} /> 销售 #{record.id.split('_')[1] || '?'}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => onSave(record, records)}
                className="flex items-center gap-1 px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white text-[10px] rounded-lg transition-colors shadow-sm">
                <Save size={9} /> 保存
              </button>
              <button onClick={() => onChange(records.filter(r => r.id !== record.id))}
                className="p-1 hover:bg-red-50 rounded text-red-400/40 hover:text-red-400 transition-colors">
                <X size={13} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div>
              <label className="block text-[10px] text-[#8AA08A] mb-0.5">日期</label>
              <input type="date" value={record.date}
                onChange={e => updateRecord(record.id, 'date', e.target.value)}
                className="w-full px-2 py-1.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded text-xs text-[#1A2E1A] outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="block text-[10px] text-[#8AA08A] mb-0.5">规格</label>
              <select value={record.size}
                onChange={e => {
                  const ns = e.target.value;
                  updateRecord(record.id, 'size', ns);
                  const sg = getSuggestedPrice(ns);
                  if (sg) updateRecord(record.id, 'unitPrice', sg);
                }}
                className="w-full px-2 py-1.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded text-xs text-[#1A2E1A] outline-none focus:border-orange-400">
                {sizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-[#8AA08A] mb-0.5">数量</label>
              <input type="number" min="1" value={record.qty}
                onChange={e => updateRecord(record.id, 'qty', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded text-xs text-[#1A2E1A] outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="block text-[10px] text-[#8AA08A] mb-0.5">售价 (¥)</label>
              <input type="number" step="0.01" min="0" value={record.unitPrice || ''}
                onChange={e => updateRecord(record.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded text-xs text-[#1A2E1A] font-mono outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="block text-[10px] text-[#8AA08A] mb-0.5">收入</label>
              <div className="px-2 py-1.5 bg-orange-50 rounded text-xs font-mono text-orange-600 font-medium">
                ¥{record.totalRevenue.toFixed(2)}
                {getSuggestedPrice(record.size) > 0 && record.unitPrice !== getSuggestedPrice(record.size) && (
                  <span className="text-[9px] text-[#A8BAA8] ml-1">建议¥{getSuggestedPrice(record.size)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      {paginated.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-1">
          <button onClick={() => onPageChange(paginated.page - 1)} disabled={paginated.page <= 1}
            className="px-3 py-1 rounded text-xs text-[#6B856B] hover:bg-white border border-[#D5E2D5] disabled:opacity-30">‹ 上一页</button>
          <span className="text-xs text-[#9AAA9A]">{paginated.page} / {paginated.totalPages}</span>
          <button onClick={() => onPageChange(paginated.page + 1)} disabled={paginated.page >= paginated.totalPages}
            className="px-3 py-1 rounded text-xs text-[#6B856B] hover:bg-white border border-[#D5E2D5] disabled:opacity-30">下一页 ›</button>
          <span className="text-[10px] text-[#9AAA9A]">共{records.length}条</span>
        </div>
      )}
    </div>
  );
}


// ============================================
// V2 其他成本编辑器
// ============================================

function OtherCostEditorV2({ costs, onChange }: {
  costs: OtherCostEntry[]; onChange: (c: OtherCostEntry[]) => void;
}) {
  const updateCost = (id: string, field: keyof OtherCostEntry, value: any) => {
    onChange(costs.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  if (costs.length === 0) {
    return (
      <div className="text-center py-6 rounded-xl bg-white border border-dashed border-[#E0ECE0]">
        <Receipt size={22} className="mx-auto mb-2 text-[#A8BAA8]" />
        <p className="text-sm text-[#8AA08A]">暂无其他成本</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {costs.map((cost) => (
        <div key={cost.id} className="rounded-xl bg-white border border-yellow-100 p-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-yellow-500/60">{cost.category}</span>
            <button onClick={() => onChange(costs.filter(c => c.id !== cost.id))}
              className="p-1 hover:bg-red-50 rounded text-red-400/40 hover:text-red-400 ml-auto transition-colors">
              <X size={13} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            <div>
              <label className="block text-[10px] text-[#8AA08A] mb-0.5">日期</label>
              <input type="date" value={cost.date}
                onChange={e => updateCost(cost.id, 'date', e.target.value)}
                className="w-full px-2 py-1.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded text-xs text-[#1A2E1A] outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="block text-[10px] text-[#8AA08A] mb-0.5">类别</label>
              <select value={cost.category}
                onChange={e => updateCost(cost.id, 'category', e.target.value)}
                className="w-full px-2 py-1.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded text-xs text-[#1A2E1A] outline-none focus:border-yellow-400">
                {COST_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-[#8AA08A] mb-0.5">金额 (¥)</label>
              <input type="number" step="0.01" min="0" value={cost.amount || ''}
                onChange={e => updateCost(cost.id, 'amount', parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded text-xs text-[#1A2E1A] font-mono outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="block text-[10px] text-[#8AA08A] mb-0.5">说明</label>
              <input type="text" value={cost.description}
                onChange={e => updateCost(cost.id, 'description', e.target.value)}
                placeholder="展会海报印刷..."
                className="w-full px-2 py-1.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded text-xs text-[#1A2E1A] outline-none focus:border-yellow-400 placeholder:text-[#9AAA9A]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}




// ============================================
// 产品前台预览弹窗
// ============================================

function ProductPreviewModal({ form, isJing, onClose }: {
  form: ProductForm; isJing: boolean; onClose: () => void;
}) {
  const catInfo = form.category ? CATEGORY_SERIES_MAP[form.category] : null;
  const benefits = form.benefits ? form.benefits.split(/[,，]/).filter(Boolean) : [];
  const galleryUrls = form.gallery_urls ? form.gallery_urls.split('\n').filter(Boolean) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        {/* 头部 */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-[#E0ECE0] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4A7C59]/20 flex items-center justify-center">
              <Eye size={16} className="text-[#4A7C59]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1A2E1A]">前台预览</h3>
              <p className="text-[10px] text-[#9AAA9A]">模拟用户在前台看到的产品页面</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F2F7F3] rounded-xl text-[#6B856B]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 产品图片 */}
          {form.image_url ? (
            <div className="aspect-square rounded-2xl overflow-hidden bg-[#F2F7F3]">
              <img src={form.image_url} alt={form.display_name || form.name_cn}
                className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-square rounded-2xl bg-[#F2F7F3] border-2 border-dashed border-[#C8DDD0] flex items-center justify-center">
              <Package size={48} className="text-[#A8BAA8]" />
            </div>
          )}

          {/* 产品信息 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {catInfo && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isJing ? 'bg-purple-100 text-purple-600' : 'bg-amber-100 text-amber-600'}`}>
                  {catInfo.seriesName} · {catInfo.label}
                </span>
              )}
              {form.is_active ? (
                <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-600">上架</span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-400">草稿</span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-[#1A2E1A]">{form.display_name || form.name_cn || '未命名产品'}</h1>
            {form.name_en && <p className="text-sm text-[#8AA08A] italic">{form.name_en}</p>}
            {form.scientific_name && <p className="text-xs text-[#A8BAA8] italic">{form.scientific_name}</p>}

            {/* 定价 */}
            <div className="flex flex-wrap gap-2 pt-2">
              {!isJing && form.price_5ml && <span className="px-3 py-1.5 bg-[#F2F7F3] rounded-lg text-sm text-[#3D5C3D]">5ml ¥{form.price_5ml}</span>}
              {!isJing && form.price_10ml && <span className="px-3 py-1.5 bg-[#4A7C59]/10 rounded-lg text-sm font-medium text-[#4A7C59]">10ml ¥{form.price_10ml} ★</span>}
              {!isJing && form.price_30ml && <span className="px-3 py-1.5 bg-[#F2F7F3] rounded-lg text-sm text-[#3D5C3D]">30ml ¥{form.price_30ml}</span>}
              {isJing && form.price_piece && <span className="px-3 py-1.5 bg-purple-50 rounded-lg text-sm font-medium text-purple-600">¥{form.price_piece}</span>}
            </div>

            {/* 功效 */}
            {benefits.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {benefits.map((b, i) => (
                  <span key={i} className="px-2 py-1 bg-[#F2F7F3] rounded-full text-xs text-[#5C725C]">{b}</span>
                ))}
              </div>
            )}

            {/* 描述 */}
            {form.short_desc && <p className="text-sm text-[#5C725C]">{form.short_desc}</p>}
            {form.description && <p className="text-sm text-[#6B856B] leading-relaxed">{form.description}</p>}

            {/* 产地/元素 */}
            {(form.origin || form.element) && (
              <div className="flex items-center gap-3 text-xs text-[#8AA08A]">
                {form.origin && <span>{form.origin}</span>}
                {form.element && <span className="px-2 py-0.5 bg-[#F2F7F3] rounded text-[#D4AF37]">{form.element}</span>}
                {form.extraction_method && <span>{form.extraction_method}</span>}
              </div>
            )}

            {/* 相册 */}
            {galleryUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {galleryUrls.slice(0, 6).map((url, i) => (
                  <img key={i} src={url} alt="" className="rounded-xl w-full aspect-square object-cover bg-[#F2F7F3]" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 底部提示 */}
        <div className="px-6 py-3 bg-[#F2F7F3] border-t border-[#E0ECE0] rounded-b-3xl">
          <p className="text-xs text-center text-[#9AAA9A]">
            👆 前台展示效果预览 · 实际样式请访问 unioaroma.com
          </p>
        </div>
      </div>
    </div>
  );
}


// ============================================
// 产地选择器（纯文字选择，不再写 country_id）
// ============================================

function OriginSelector({ countries, currentOrigin, onSelectOrigin, onClear }: {
  countries: Country[]; currentOrigin?: string;
  onSelectOrigin: (name: string) => void; onClear: () => void;
}) {
  // 搜索过滤
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCountries = useMemo(() => {
    if (!searchTerm.trim()) return countries;
    const term = searchTerm.trim().toLowerCase();
    return countries.filter(c =>
      c.name_cn.toLowerCase().includes(term) ||
      (c.sub_region && c.sub_region.toLowerCase().includes(term)) ||
      (c.region && c.region.toLowerCase().includes(term)) ||
      (c.name_en && c.name_en.toLowerCase().includes(term))
    );
  }, [countries, searchTerm]);

  // 按地区分组
  const groupedCountries = useMemo(() => {
    const groups: Record<string, typeof countries> = {};
    filteredCountries.forEach(c => {
      const region = c.region || '其他';
      if (!groups[region]) groups[region] = [];
      groups[region].push(c);
    });
    return groups;
  }, [filteredCountries]);

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-[#5C725C] flex items-center gap-1"><Globe size={11} /> 产地</label>
      <p className="text-[10px] text-[#9AAA9A]">从国家库中选择产地（支持全球国家 + 中国省份），选中后自动填入产地文字</p>

      {/* 当前已选产地 */}
      {currentOrigin && (
        <div className="flex items-center justify-between px-3 py-2 bg-[#4A7C59]/10 border border-[#4A7C59]/20 rounded-lg">
          <span className="text-sm text-[#1A2E1A] font-medium">{currentOrigin}</span>
          <button type="button" onClick={onClear}
            className="text-[#9AAA9A] hover:text-red-400 transition-colors"><X size={14} /></button>
        </div>
      )}

      {/* 常用产地快速选择 */}
      {!currentOrigin && (
        <div className="bg-[#F8FAF8]/80 rounded-xl p-3 border border-[#E0ECE0]">
          <div className="text-[10px] text-[#9AAA9A] mb-2 uppercase tracking-wider flex items-center gap-1"><Zap size={9} /> 常用产地（点击快速填入）</div>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_ORIGINS.map(origin => {
              const isInDB = countries.some(c => c.name_cn === origin);
              return (
                <button key={origin} type="button"
                  onClick={() => onSelectOrigin(origin)}
                  title={isInDB ? origin : `${origin}（国家库中暂无此条目）`}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isInDB
                      ? 'bg-[#F2F7F3] text-[#3D5C3D] hover:bg-[#4A7C59] hover:text-white border border-transparent'
                      : 'bg-[#F2F7F3] text-[#9AAA9A] hover:bg-[#E0ECE0] border border-dashed border-[#C8DDD0]'
                  }`}>
                  {origin}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 完整国家库下拉（带搜索 + 地区分组） */}
      <div className="space-y-1.5">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AAA9A]" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder={`搜索国家/省份...（共 ${countries.length} 个）`}
            className="w-full pl-8 pr-3 py-2 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] placeholder:text-[#9AAA9A] focus:border-[#4A7C59]/50 outline-none" />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9AAA9A] hover:text-[#6B856B]">
              <X size={12} />
            </button>
          )}
        </div>

        <select
          onChange={e => { if (e.target.value) { onSelectOrigin(e.target.value); setSearchTerm(''); } }}
          defaultValue=""
          className="w-full bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg px-3 py-2.5 text-sm text-[#1A2E1A] focus:border-[#4A7C59]/50 outline-none appearance-auto">
          <option value="">— 从全部国家/省份中选择 —</option>
          {Object.entries(groupedCountries).map(([region, items]) => (
            <optgroup key={region} label={region}>
              {items.map(c => (
                <option key={c.id} value={c.name_cn}>
                  {c.name_cn}{c.sub_region ? ` / ${c.sub_region}` : ''}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {searchTerm && filteredCountries.length === 0 && (
          <p className="text-[10px] text-[#A8BAA8] text-center py-1">无匹配 "{searchTerm}"，可直接输入产地文字</p>
        )}
      </div>
    </div>
  );
}
// ============================================
// UI 组件
// ============================================

function CollapsibleSection({ icon, title, children, defaultOpen = false }: {
  icon: React.ReactNode; title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <fieldset className="space-y-4">
      <legend className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider pb-2 border-b border-[#E0ECE0] w-full cursor-pointer select-none transition-colors ${open ? 'text-[#7A967A]' : 'text-[#7A967A] hover:text-[#8AA08A]'}`}
        onClick={() => setOpen(!open)}>
        {icon}{title}<ChevronRight size={11} className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
      </legend>
      {open && <div>{children}</div>}
    </fieldset>
  );
}

function Field({ label, value, onChange, children, type = 'text', placeholder, required, autoFocus }: {
  label: string; value: string; onChange: (v: string) => void; children?: React.ReactNode;
  type?: string; placeholder?: string; required?: boolean; autoFocus?: boolean;
}) {
  return (
    <div className="relative">
      <label className="block text-[11px] font-medium text-[#6B856B] mb-1.5">{label}{required && <span className="text-[#4A7C59] ml-0.5">*</span>}</label>
      {children || (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus}
          className="relative w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] placeholder:text-[#9AAA9A] focus:border-[#4A7C59]/50 focus:ring-1 focus:ring-[#4A7C59]/20 outline-none transition-all" />
      )}
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 3, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-[#6B856B] mb-1.5">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] placeholder:text-[#9AAA9A] focus:border-[#4A7C59]/50 outline-none resize-y transition-all" />
    </div>
  );
}

function SpinIcon() {
  return <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.924 3 8.11l2.111-1.819z"/></svg>;
}
