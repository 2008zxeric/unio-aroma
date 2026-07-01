import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import {
  Package, Globe, Image as ImageIcon, Eye,
  TrendingUp, TrendingDown, DollarSign,
  ArrowUpRight, RefreshCw, AlertCircle,
  MessageSquare, Plus, Minus, Search,
  Save, X, Warehouse,
  Receipt, Coins, ShoppingCart, CreditCard, BarChart3, ArrowRight, ClipboardCheck
} from 'lucide-react';
import { productService, countryService, bannerService, inventoryService, purchaseService, salesService, reviewService, financeRecordService } from '../../lib/dataService';
import type { Product } from '../../lib/database.types';
import { SERIES_INFO } from '../../lib/database.types';
import type { SeriesCode } from '../../lib/database.types';
import { isPieceUnit, parseSizeToMl, INBOUND_SIZES_ML, INBOUND_SIZES_PIECE, SALES_SIZES_ML, SALES_SIZES_PIECE, getReferencePrice } from '../lib/specUtils';

interface StatCard {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  trend?: { value: string; up: boolean };
  linkTo?: string;
  detailType?: 'revenue' | 'expense' | 'stock';
  badge?: string;
  badgePulse?: boolean;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { success, error, warning } = useToast();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // ---- 财务摘要 ----
  const [financeSummary, setFinanceSummary] = useState({
    totalSales: 0, totalPurchases: 0,
    totalOtherIncome: 0, totalOtherExpenses: 0,
    pendingReimburse: 0, totalStockMl: 0, lowStockCount: 0,
  });
  // ---- 详情弹窗 ----
  const [detailModal, setDetailModal] = useState<{ type: 'revenue' | 'expense' | 'stock' } | null>(null);

  // ---- 快速入库/出库共享模块 ----
  const [showQuickIn, setShowQuickIn] = useState(false);
  const [showQuickOut, setShowQuickOut] = useState(false);
  const [quickProductId, setQuickProductId] = useState('');
  const [quickProduct, setQuickProduct] = useState<Product | null>(null);
  const [quickSize, setQuickSize] = useState('');
  const [quickCost, setQuickCost] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickSupplier, setQuickSupplier] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickKeyword, setQuickKeyword] = useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      setLoadError(null);

      // === 快速查询（并行，不阻塞） ===
      const [products, countries, banners, reviewResult, pStats, sStats, fStats] = await Promise.all([
        productService.getAll(),
        countryService.getAll(),
        bannerService.getAll(),
        reviewService.getAll().catch(() => ({ data: [], total: 0 })),
        purchaseService.getDashboardStats(),
        salesService.getDashboardStats(),
        financeRecordService.getDashboardStats(),
      ]);
      setAllProducts(products);

      const activeProducts = products.filter(p => p.is_active).length;
      const activeCountries = countries.filter(c => c.is_active).length;
      const totalReviews = reviewResult.total;
      const pendingReviews = (reviewResult.data || []).filter((r: any) => !r.is_approved).length;

      const totalSales = sStats.totalRevenue;
      const totalPurchases = pStats.totalCost;
      const totalOtherIncome = fStats.totalIncome;
      const totalOtherExpenses = fStats.totalExpense;
      const pendingReimburse = pStats.pendingReimburse + fStats.pendingReimburse;

      // 先渲染（库存显示"加载中"）
      setFinanceSummary({ totalSales, totalPurchases, totalOtherIncome, totalOtherExpenses, pendingReimburse, totalStockMl: -1, lowStockCount: -1 });

      const totalRevenue = totalSales + totalOtherIncome;
      const totalExpense = totalPurchases + totalOtherExpenses;

      setStats([
        { title: '总产品数', value: products.length, icon: Package, color: '#4A7C59', bgColor: 'rgba(74,124,89,0.12)', trend: { value: `${activeProducts} 上架`, up: true }, linkTo: '/admin/products' },
        { title: '国家/地区', value: countries.length, icon: Globe, color: '#1C39BB', bgColor: 'rgba(28,57,187,0.1)', trend: { value: `${activeCountries} 激活`, up: true }, linkTo: '/admin/countries' },
        { title: '评价审核', value: `${pendingReviews} 待审`, icon: MessageSquare, color: '#D4AF37', bgColor: 'rgba(212,175,55,0.12)', trend: { value: `共 ${totalReviews} 条`, up: true }, linkTo: '/admin/reviews' },
        { title: '库存预警', value: '加载中…', icon: AlertCircle, color: '#E85D3B', bgColor: 'rgba(232,93,59,0.1)', linkTo: '/admin/inventory?tab=overview' },
        { title: '海报/Banner', value: banners.length, icon: ImageIcon, color: '#7BA689', bgColor: 'rgba(123,166,137,0.15)', linkTo: '/admin/banners' },
        { title: '总收入', value: `¥${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: '#059669', bgColor: 'rgba(5,150,105,0.1)', trend: { value: `销售 ¥${totalSales.toLocaleString()}`, up: true }, badge: '点击看明细' },
        { title: '总费用', value: `¥${totalExpense.toLocaleString()}`, icon: TrendingDown, color: '#DC2626', bgColor: 'rgba(220,38,38,0.08)', trend: { value: `进货 ¥${totalPurchases.toLocaleString()}`, up: false }, badge: '点击看明细' },
        { title: '剩余库存', value: '加载中…', icon: Warehouse, color: '#6366F1', bgColor: 'rgba(99,102,241,0.1)' },
        { title: '待报销', value: pendingReimburse, icon: Receipt, color: '#F59E0B', bgColor: 'rgba(245,158,11,0.12)', trend: pendingReimburse > 0 ? { value: `${pendingReimburse} 条记录`, up: false } : { value: '全部完成 ✓', up: true }, linkTo: '/admin/inventory?tab=reimburse' },
      ]);

      setRecentProducts(products.slice(-5).reverse());
      setLoading(false);

      // === 后台异步：库存数据（慢查询不阻塞页面渲染） ===
      inventoryService.getAllSummaries()
        .then(result => {
          const lowStockCount = result.filter((s: any) => s.current_stock_ml > 0 && s.current_stock_ml < 10).length;
          const totalStockMl = result.reduce((s: number, r: any) => s + (Number(r.current_stock_ml) || 0), 0);
          setFinanceSummary(prev => ({ ...prev, totalStockMl, lowStockCount }));
          setStats(prev => prev.map(stat => {
            if (stat.title === '库存预警') return {
              ...stat, value: lowStockCount,
              trend: lowStockCount > 0 ? { value: `${lowStockCount} 个产品`, up: false } : undefined,
            };
            if (stat.title === '剩余库存') return {
              ...stat, value: `${totalStockMl}ml`,
              trend: { value: `${lowStockCount} 低库存`, up: lowStockCount === 0 },
            };
            return stat;
          }));
        })
        .catch(() => {
          setFinanceSummary(prev => ({ ...prev, totalStockMl: 0, lowStockCount: 0 }));
        });
    } catch (err) {
      console.error('加载仪表盘数据失败:', err);
      setLoadError((err as Error).message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // 快速操作框 — 搜索产品
  const filteredQuickProds = useMemo(() => {
    if (!quickKeyword) return allProducts.slice(0, 10);
    const kw = quickKeyword.toLowerCase();
    return allProducts.filter(p =>
      p.name_cn?.toLowerCase().includes(kw) ||
      p.name_en?.toLowerCase().includes(kw) ||
      p.code?.toLowerCase().includes(kw)
    ).slice(0, 8);
  }, [allProducts, quickKeyword]);

  const selectQuickProduct = (p: Product) => {
    setQuickProductId(p.id);
    setQuickProduct(p);
    setQuickKeyword('');
    setQuickSize('');
    setQuickCost('');
    setQuickAmount('');
    setQuickSupplier('');
  };

  // 判断是否香系列
  const isJing = quickProduct?.series_code === 'jing';
  const inSizes = isJing ? INBOUND_SIZES_PIECE : INBOUND_SIZES_ML;
  const outSizes = isJing ? SALES_SIZES_PIECE : SALES_SIZES_ML;

  const handleQuickPurchase = async () => {
    if (!quickProductId || !quickSize || !quickCost) {
      warning('请选择产品、规格和成本价！'); return;
    }
    setQuickLoading(true);
    try {
      const volMl = isJing ? 0 : parseSizeToMl(quickSize);
      await purchaseService.create({
        product_id: quickProductId,
        purchase_date: new Date().toISOString().split('T')[0],
        volume_ml: volMl,
        unit_cost: parseFloat(quickCost),
        supplier_code: quickSupplier || null,
      });
      success('✅ 入库成功！');
      setShowQuickIn(false);
      resetQuickForm();
      await loadStats();
    } catch (err: any) {
      error('入库失败：' + (err.message || err));
    } finally {
      setQuickLoading(false);
    }
  };

  const handleQuickSale = async () => {
    if (!quickProductId || !quickSize || !quickAmount) {
      warning('请选择产品、规格和售价！'); return;
    }
    setQuickLoading(true);
    try {
      const volMl = isJing ? 0 : parseSizeToMl(quickSize);
      const total = parseFloat(quickAmount);
      await salesService.create({
        product_id: quickProductId,
        sale_date: new Date().toISOString().split('T')[0],
        volume_ml: volMl,
        total_amount: total,
        sale_price: volMl > 0 ? total / volMl : total,
      });
      success('✅ 出库成功！');
      setShowQuickOut(false);
      resetQuickForm();
      await loadStats();
    } catch (err: any) {
      error('出库失败：' + (err.message || err));
    } finally {
      setQuickLoading(false);
    }
  };

  const resetQuickForm = () => {
    setQuickProductId('');
    setQuickProduct(null);
    setQuickSize('');
    setQuickCost('');
    setQuickAmount('');
    setQuickSupplier('');
    setQuickKeyword('');
  };

  const closeAllQuick = () => {
    setShowQuickIn(false);
    setShowQuickOut(false);
    resetQuickForm();
  };

  // ---- 处理卡片点击 ----
  const handleCardClick = (stat: StatCard) => {
    if (stat.title === '总收入') setDetailModal({ type: 'revenue' });
    else if (stat.title === '总费用') setDetailModal({ type: 'expense' });
    else if (stat.title === '剩余库存') setDetailModal({ type: 'stock' });
    else if (stat.linkTo) navigate(stat.linkTo);
  };

  // ---- Detail Modal ----
  const DetailModal = () => {
    if (!detailModal) return null;
    const { totalSales, totalPurchases, totalOtherIncome, totalOtherExpenses, totalStockMl, lowStockCount } = financeSummary;
    const totalRevenue = totalSales + totalOtherIncome;
    const totalExpense = totalPurchases + totalOtherExpenses;
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setDetailModal(null)}>
        <div className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-md max-h-[85vh] flex flex-col border border-[#E0ECE0] overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0ECE0]"><div className="flex items-center gap-2.5">{detailModal.type === 'revenue' ? <TrendingUp size={20} className="text-emerald-600" /> : detailModal.type === 'expense' ? <TrendingDown size={20} className="text-red-500" /> : <Warehouse size={20} className="text-indigo-500" />}<h3 className="font-bold text-[#1A2E1A] text-base">{detailModal.type === 'revenue' ? '总收构成' : detailModal.type === 'expense' ? '总费用构成' : '库存概况'}</h3></div><button onClick={() => setDetailModal(null)} className="p-1.5 text-[#9AAA9A] hover:text-[#5C725C] rounded-lg hover:bg-[#F4F7F4]"><X size={18} /></button></div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {detailModal.type === 'revenue' && (<>
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100"><div className="flex items-center justify-between mb-2"><span className="text-sm text-emerald-700 font-medium flex items-center gap-1.5"><ShoppingCart size={15} /> 销售收入</span><span className="text-lg font-bold text-emerald-700">¥{totalSales.toLocaleString()}</span></div><button onClick={() => { navigate('/admin/inventory?tab=sales'); setDetailModal(null); }} className="text-xs text-emerald-600 hover:underline flex items-center gap-1"><ArrowRight size={10} /> 查看销售明细</button></div>
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100"><div className="flex items-center justify-between mb-2"><span className="text-sm text-amber-700 font-medium flex items-center gap-1.5"><Coins size={15} /> 其它收入</span><span className="text-lg font-bold text-amber-700">¥{totalOtherIncome.toLocaleString()}</span></div><button onClick={() => { navigate('/admin/inventory?tab=finance&type=income'); setDetailModal(null); }} className="text-xs text-amber-600 hover:underline flex items-center gap-1"><ArrowRight size={10} /> 查看其它收入明细</button></div>
              <div className="p-4 rounded-xl bg-white border border-[#E0ECE0]"><div className="flex items-center justify-between"><span className="text-sm text-[#1A2E1A] font-bold">合计总收入</span><span className="text-xl font-bold text-emerald-600">¥{totalRevenue.toLocaleString()}</span></div></div>
            </>)}
            {detailModal.type === 'expense' && (<>
              <div className="p-4 rounded-xl bg-red-50/50 border border-red-100"><div className="flex items-center justify-between mb-2"><span className="text-sm text-red-700 font-medium flex items-center gap-1.5"><ShoppingCart size={15} /> 进货成本</span><span className="text-lg font-bold text-red-700">¥{totalPurchases.toLocaleString()}</span></div><button onClick={() => { navigate('/admin/inventory?tab=purchases'); setDetailModal(null); }} className="text-xs text-red-600 hover:underline flex items-center gap-1"><ArrowRight size={10} /> 查看进货明细</button></div>
              <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100"><div className="flex items-center justify-between mb-2"><span className="text-sm text-orange-700 font-medium flex items-center gap-1.5"><CreditCard size={15} /> 其它支出</span><span className="text-lg font-bold text-orange-700">¥{totalOtherExpenses.toLocaleString()}</span></div><button onClick={() => { navigate('/admin/inventory?tab=finance&type=expense'); setDetailModal(null); }} className="text-xs text-orange-600 hover:underline flex items-center gap-1"><ArrowRight size={10} /> 查看其它支出明细</button></div>
              <div className="p-4 rounded-xl bg-white border border-[#E0ECE0]"><div className="flex items-center justify-between"><span className="text-sm text-[#1A2E1A] font-bold">合计总费用</span><span className="text-xl font-bold text-red-500">¥{totalExpense.toLocaleString()}</span></div></div>
              <div className="p-4 rounded-xl bg-white border border-[#E0ECE0]"><div className="flex items-center justify-between"><span className="text-sm text-[#1A2E1A] font-bold">毛利润</span><span className={`text-xl font-bold ${totalRevenue - totalExpense >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>¥{(totalRevenue - totalExpense).toLocaleString()}</span></div></div>
            </>)}
            {detailModal.type === 'stock' && (<>
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100"><div className="flex items-center justify-between mb-2"><span className="text-sm text-indigo-700 font-medium flex items-center gap-1.5"><BarChart3 size={15} /> 总库存量</span><span className="text-lg font-bold text-indigo-700">{totalStockMl}ml</span></div></div>
              <div className="p-4 rounded-xl bg-red-50/50 border border-red-100"><div className="flex items-center justify-between mb-2"><span className="text-sm text-red-700 font-medium flex items-center gap-1.5"><AlertCircle size={15} /> 低库存预警</span><span className="text-lg font-bold text-red-700">{lowStockCount} 个</span></div></div>
              <div className="p-4 rounded-xl bg-white border border-[#E0ECE0]"><div className="flex items-center justify-between mb-3"><span className="text-sm text-[#1A2E1A] font-bold">快捷操作</span></div><div className="grid grid-cols-2 gap-2"><button onClick={() => { navigate('/admin/inventory?tab=overview'); setDetailModal(null); }} className="py-2.5 px-3 rounded-xl bg-[#EEF4EF] text-sm text-[#4A7C59] font-medium hover:bg-[#E0ECE0] flex items-center justify-center gap-1.5"><BarChart3 size={14} /> 库存总览</button><button onClick={() => { navigate('/admin/products'); setDetailModal(null); }} className="py-2.5 px-3 rounded-xl bg-[#EEF4EF] text-sm text-[#4A7C59] font-medium hover:bg-[#E0ECE0] flex items-center justify-center gap-1.5"><Package size={14} /> 产品管理</button></div></div>
            </>)}
          </div>
        </div>
      </div>
    );
  };

  // ---- Quick Modal (共享) ----
  const QuickModal = ({ mode }: { mode: 'in' | 'out' }) => {
    const isIn = mode === 'in';
    const sizes = isIn ? inSizes : outSizes;
    const title = isIn ? '快速入库' : '快速出库';
    const color = isIn ? '#4A7C59' : '#D4AF37';
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={closeAllQuick}>
        <div className="bg-white rounded-2xl shadow-2xl w-[95vw] sm:w-[90vw] max-w-lg max-h-[90vh] sm:max-h-[85vh] flex flex-col border border-[#E0ECE0] p-3 sm:p-0" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0ECE0]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '18' }}>
                {isIn ? <Plus size={18} style={{ color }} /> : <Minus size={18} style={{ color }} />}
              </div>
              <h3 className="font-bold text-[#1A2E1A]">{title}</h3>
            </div>
            <button onClick={closeAllQuick} className="p-1.5 text-[#9AAA9A] hover:text-[#5C725C] rounded-lg hover:bg-[#F4F7F4]">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* 产品选择 */}
            <div>
              <label className="block text-xs font-bold text-[#5C725C] mb-1.5">选择产品</label>
              {!quickProduct ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AAA9A]" />
                    <input
                      value={quickKeyword}
                      onChange={e => setQuickKeyword(e.target.value)}
                      placeholder="搜索产品名称或代码..."
                      className="w-full pl-9 pr-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] placeholder:text-[#9AAA9A] outline-none focus:border-[color] touch-btn"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1 border border-[#E0ECE0] rounded-lg p-1 w-full sm:max-w-none">
                    {filteredQuickProds.map(p => (
                      <button
                        key={p.id}
                        onClick={() => selectQuickProduct(p)}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-[#1A2E1A] hover:bg-[#F4F7F4] transition-colors flex items-center gap-2"
                      >
                        {p.image_url && <img src={p.image_url} className="w-6 h-6 rounded object-cover" alt="" />}
                        <span className="flex-1 truncate">{p.name_cn}</span>
                        <span className="text-[10px] text-[#9AAA9A]">{SERIES_INFO[p.series_code as SeriesCode]?.slogan?.split('/')[0]}</span>
                      </button>
                    ))}
                    {filteredQuickProds.length === 0 && (
                      <p className="text-xs text-[#9AAA9A] text-center py-4">未找到匹配产品</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-3 py-2.5 bg-[#F4F7F4] rounded-lg">
                  {quickProduct.image_url && <img src={quickProduct.image_url} className="w-8 h-8 rounded object-cover" alt="" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1A2E1A]">{quickProduct.name_cn}</p>
                    <p className="text-[10px] text-[#9AAA9A]">{quickProduct.name_en} · {SERIES_INFO[quickProduct.series_code as SeriesCode]?.name_cn}</p>
                  </div>
                  <button onClick={resetQuickForm} className="text-xs text-[#4A7C59] hover:underline">换一个</button>
                </div>
              )}
            </div>

            {/* 规格选择 */}
            {quickProduct && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#5C725C] mb-1.5">
                    规格 {isJing && <span className="text-[#D4AF37] font-normal">（香系列用个/件/套）</span>}
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                    {sizes.map(s => (
                      <button
                        key={s}
                        onClick={() => { setQuickSize(s); if (isIn && isJing) setQuickCost('0'); }}
                        className={`py-2 rounded-lg text-sm font-medium transition-all border ${
                          quickSize === s
                            ? 'bg-[#4A7C59] text-white border-[#4A7C59] shadow-sm'
                            : 'bg-white text-[#5C725C] border-[#D5E2D5] hover:border-[#4A7C59]/40'
                        }`}
                      >{s}</button>
                    ))}
                  </div>
                </div>

                {isIn ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#5C725C] mb-1.5">
                        成本价 {isJing ? '(¥/个)' : '(¥/ml)'}
                      </label>
                      <input
                        type="number" step="0.01" min="0"
                        value={quickCost}
                        onChange={e => setQuickCost(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] outline-none focus:border-[#4A7C59]/50 touch-btn"
                      />
                      {quickSize && !isJing && (
                        <p className="text-[10px] text-[#9AAA9A] mt-1">参考：¥{getReferencePrice(quickProduct, quickSize, false).toFixed(2)}/ml</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#5C725C] mb-1.5">供货商（可选）</label>
                      <input
                        type="text"
                        value={quickSupplier}
                        onChange={e => setQuickSupplier(e.target.value)}
                        placeholder="供货商代码"
                        className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] outline-none focus:border-[#4A7C59]/50 touch-btn"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-[#5C725C] mb-1.5">
                      销售总价 {isJing ? '(¥)' : '(¥)'}
                    </label>
                    <input
                      type="number" step="0.01" min="0"
                      value={quickAmount}
                      onChange={e => setQuickAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] outline-none focus:border-[#D4AF37]/50 touch-btn"
                    />
                    {quickSize && !isJing && (
                      <p className="text-[10px] text-[#9AAA9A] mt-1">参考售价：¥{getReferencePrice(quickProduct, quickSize, false).toFixed(2)}/ml</p>
                    )}
                  </div>
                )}

                <button
                  onClick={isIn ? handleQuickPurchase : handleQuickSale}
                  disabled={quickLoading || !quickSize || (isIn && !quickCost) || (!isIn && !quickAmount)}
                  className="w-full py-3 rounded-xl text-white text-sm font-bold tracking-wider transition-all disabled:opacity-50"
                  style={{ backgroundColor: color }}
                >
                  {quickLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw size={14} className="animate-spin" /> 处理中...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {isIn ? <Plus size={16} /> : <Minus size={16} />}
                      {isIn ? '确认入库' : '确认出库'}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-[#6B856B]">
          <RefreshCw size={20} className="animate-spin" />
          <span>加载数据中...</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1A2E1A]">控制台</h2>
          <p className="text-sm text-[#6B856B] mt-1">欢迎回来。</p>
        </div>
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
          <AlertCircle size={32} className="mx-auto mb-3 text-red-400" />
          <p className="text-sm text-red-600 font-medium mb-2">加载数据失败</p>
          <p className="text-xs text-red-400 mb-4">{loadError}</p>
          <button onClick={loadStats} className="px-4 py-2 bg-[#4A7C59] text-white text-sm rounded-xl hover:bg-[#3D6B4A]">
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A2E1A]">控制台</h2>
          <p className="text-sm text-[#6B856B] mt-1">欢迎回来。这是你的 UNIO AROMA 数据概览。</p>
        </div>
        <button onClick={loadStats} className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#6B856B] hover:text-[#4A7C59] rounded-lg hover:bg-[#F4F7F4] transition-colors">
          <RefreshCw size={13} /> 刷新
        </button>
      </div>

      {/* 统计卡片 — 响应式3列 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const isClickable = stat.title === '总收入' || stat.title === '总费用' || stat.title === '剩余库存' || !!stat.linkTo;
          return (
            <div
              key={idx}
              onClick={() => isClickable && handleCardClick(stat)}
              className={`group relative p-4 rounded-2xl bg-white border transition-all duration-300 ${
                isClickable ? 'cursor-pointer hover:shadow-md hover:border-[#D5E2D5] hover:scale-[1.02]' : ''
              } ${stat.title === '待报销' && financeSummary.pendingReimburse > 0 ? 'border-amber-300 ring-1 ring-amber-200' : 'border-[#E0ECE0]'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[11px] font-semibold text-[#5C725C] uppercase tracking-wider">{stat.title}</p>
                    {stat.badge && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#EEF4EF] text-[#4A7C59] font-medium">{stat.badge}</span>}
                    {stat.title === '待报销' && financeSummary.pendingReimburse > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold animate-pulse">
                        <ClipboardCheck size={10} /> 待处理
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-[#1A2E1A] mt-1.5 leading-tight">{stat.value}</p>
                </div>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: stat.bgColor }}
                >
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
              </div>
              {stat.trend && (
                <div className={`flex items-center gap-1 mt-2 text-[10px] ${stat.trend.up ? 'text-green-600' : 'text-red-500'}`}>
                  {stat.trend.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span>{stat.trend.value}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 快速入库/出库 + 快捷操作 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 快速入库/出库 共享模块 */}
        <div className="p-6 rounded-2xl bg-white border border-[#E0ECE0]">
          <h3 className="text-lg font-semibold text-[#1A2E1A] mb-4 flex items-center gap-2">
            <Warehouse size={20} className="text-[#4A7C59]" />
            快速出入库
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => { setShowQuickIn(true); setShowQuickOut(false); resetQuickForm(); }}
              className="group p-5 rounded-xl border-2 border-dashed border-[#4A7C59]/30 hover:border-[#4A7C59] bg-[#F2F7F3] hover:bg-[#E8F3EC] transition-all duration-200 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-[#4A7C59]/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Plus size={22} className="text-[#4A7C59]" />
              </div>
              <p className="font-semibold text-[#1A2E1A] text-sm">快速入库</p>
              <p className="text-[10px] text-[#8AA08A] mt-1">进货登记，香系列用个/件/套</p>
            </button>
            <button
              onClick={() => { setShowQuickOut(true); setShowQuickIn(false); resetQuickForm(); }}
              className="group p-5 rounded-xl border-2 border-dashed border-[#D4AF37]/30 hover:border-[#D4AF37] bg-[#FCF9F0] hover:bg-[#F9F4E3] transition-all duration-200 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Minus size={22} className="text-[#D4AF37]" />
              </div>
              <p className="font-semibold text-[#1A2E1A] text-sm">快速出库</p>
              <p className="text-[10px] text-[#8AA08A] mt-1">销售登记，自动匹配规格</p>
            </button>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="p-6 rounded-2xl bg-white border border-[#E0ECE0]">
          <h3 className="text-lg font-semibold text-[#1A2E1A] mb-4">快捷操作</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: '添加产品', desc: '录入新产品信息', to: '/admin/products', color: '#4A7C59' },
              { label: '添加国家', desc: '新增国家/地区', to: '/admin/countries', color: '#1C39BB' },
              { label: '库存利润', desc: '完整进销存管理', to: '/admin/inventory', color: '#7BA689' },
              { label: '查看前台', desc: '前台首页', to: '/admin/images', color: '#7B9EA8' },
              { label: '报销管理', desc: '审批报销记录', to: '/admin/inventory?tab=reimburse', color: '#F59E0B' },
            ].map((action, idx) => (
              <Link
                key={idx}
                to={action.to}
                className="group p-4 rounded-xl border border-[#E0ECE0] hover:border-[#D5E2D5] bg-[#F2F7F3] hover:bg-[#EEF4EF] transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-1">
                  <ArrowUpRight size={16} style={{ color: action.color }} />
                  <span className="font-medium text-sm text-[#1A2E1A] group-hover:text-[#1A2E1A]">{action.label}</span>
                </div>
                <p className="text-xs text-[#8AA08A] pl-5">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 最近产品 */}
      <div className="p-6 rounded-2xl bg-white border border-[#E0ECE0]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1A2E1A]">最近产品</h3>
          <Link to="/admin/products" className="text-xs text-[#4A7C59] hover:text-[#3D6B4A] transition-colors">
            查看全部 →
          </Link>
        </div>
        {recentProducts.length === 0 ? (
          <p className="text-sm text-[#8AA08A] text-center py-8">暂无产品数据，请先导入或手动添加</p>
        ) : (
          <div className="space-y-2">
            {recentProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#F8FAF8] hover:bg-[#EEF4EF] transition-colors"
              >
                {product.image_url && (
                  <img src={product.image_url} alt="" className="w-8 h-8 rounded-md object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1A2E1A] truncate">{product.name_cn}</p>
                  <p className="text-xs text-[#8AA08A] truncate">{product.name_en || product.code}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  product.is_active 
                    ? 'bg-green-500/15 text-green-600' 
                    : 'bg-[#E0ECE0] text-[#6B856B]'
                }`}>
                  {product.is_active ? '上架' : '下架'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 快速入库/出库 Modal */}
      {showQuickIn && <QuickModal mode="in" />}
      {showQuickOut && <QuickModal mode="out" />}
      {detailModal && <DetailModal />}

      {/* 移动端底部安全区域填充 */}
      <div className="mobile-bottom-pad" />
    </div>
  );
}
