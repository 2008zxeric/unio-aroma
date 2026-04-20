import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Warehouse, TrendingUp, TrendingDown,
  Plus, Trash2, Edit2, X, DollarSign,
  Package, Save, Download, Filter, Search, RotateCcw,
  ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react';
import { productService, inventoryService, purchaseService, salesService } from '../../lib/dataService';
import type { Product, PurchaseRecord, SalesRecord, ProductInventory } from '../../lib/database.types';
import { SERIES_INFO, SUB_CATEGORY_LABELS } from '../../lib/database.types';
import type { SeriesCode } from '../../lib/database.types';
import { Perm } from '../components/PermissionGuard';

export default function AdminInventory() {
  const [tab, setTab] = useState<'overview' | 'purchases' | 'sales'>('overview');
  const [summaries, setSummaries] = useState<ProductInventory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // ====== 筛选状态 ======
  const [filterSeries, setFilterSeries] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterStockStatus, setFilterStockStatus] = useState<'all' | 'instock' | 'low' | 'zero'>('all');

  // 进货/销售记录筛选
  const [purFilterSeries, setPurFilterSeries] = useState('');
  const [purFilterKeyword, setPurFilterKeyword] = useState('');
  const [purFilterDateFrom, setPurFilterDateFrom] = useState('');
  const [purFilterDateTo, setPurFilterDateTo] = useState('');
  const [purSortField, setPurSortField] = useState<'date' | 'amount'>('date');
  const [purSortDir, setPurSortDir] = useState<'asc' | 'desc'>('desc');

  const [salFilterSeries, setSalFilterSeries] = useState('');
  const [salFilterKeyword, setSalFilterKeyword] = useState('');
  const [salFilterDateFrom, setSalFilterDateFrom] = useState('');
  const [salFilterDateTo, setSalFilterDateTo] = useState('');
  const [salSortField, setSalSortField] = useState<'date' | 'amount'>('date');
  const [salSortDir, setSalSortDir] = useState<'asc' | 'desc'>('desc');

  // 新增记录表单状态
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);

  // 编辑状态
  const [editingPurchase, setEditingPurchase] = useState<PurchaseRecord | null>(null);
  const [editingSale, setEditingSale] = useState<SalesRecord | null>(null);

  // 进货表单
  const [purchaseForm, setPurchaseForm] = useState({
    product_id: '', purchase_date: new Date().toISOString().split('T')[0],
    volume_ml: '', unit_cost: '', supplier_code: '',
  });

  // 销售表单
  const [saleForm, setSaleForm] = useState({
    product_id: '', sale_date: new Date().toISOString().split('T')[0],
    volume_ml: '', total_amount: '',
  });

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [prodData, sumData, purData, salData] = await Promise.all([
        productService.getAll(),
        inventoryService.getAllSummaries(),
        purchaseService.getAll(),
        salesService.getAll(),
      ]);
      setProducts(prodData);
      setSummaries(sumData);
      setPurchases(purData);
      setSales(salData);
    } catch (err) {
      console.error('加载库存数据失败:', err);
      try {
        const prodData = await productService.getAll();
        setProducts(prodData);
      } catch {}
      setSummaries([]);
      setPurchases([]);
      setSales([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadAllData(); }, []);

  // 构建产品ID → 系列code + category 的映射
  const productMetaMap = useMemo(() => {
    const map = new Map<string, { seriesCode: string; seriesName: string; category: string; categoryName: string }>();
    for (const p of products) {
      const sc = (p.series_code || '') as SeriesCode;
      const info = SERIES_INFO[sc];
      map.set(p.id, {
        seriesCode: sc,
        seriesName: info?.name_cn || sc || '未知',
        category: p.category || 'none',
        categoryName: SUB_CATEGORY_LABELS[p.category as keyof typeof SUB_CATEGORY_LABELS] || p.category || '',
      });
    }
    return map;
  }, [products]);

  // 当前系列可选的子分类
  const availableCategories = useMemo(() => {
    if (!filterSeries) return Object.entries(SUB_CATEGORY_LABELS);
    const info = SERIES_INFO[filterSeries as SeriesCode];
    if (!info) return [];
    return info.subCategories.map(c => [c, SUB_CATEGORY_LABELS[c]] as const);
  }, [filterSeries]);

  // ====== 筛选后的数据 ======
  const filteredSummaries = useMemo(() => {
    return summaries.filter(s => {
      const meta = productMetaMap.get(s.product_id);
      if (filterSeries && meta?.seriesCode !== filterSeries) return false;
      if (filterCategory && meta?.category !== filterCategory) return false;
      if (filterStockStatus === 'low' && !(s.current_stock_ml > 0 && s.current_stock_ml < 10)) return false;
      if (filterStockStatus === 'zero' && s.current_stock_ml !== 0) return false;
      if (filterStockStatus === 'instock' && s.current_stock_ml < 10) return false;
      if (filterKeyword) {
        const kw = filterKeyword.toLowerCase();
        if (!s.product_name.toLowerCase().includes(kw) && !s.product_id.includes(kw)) return false;
      }
      return true;
    });
  }, [summaries, filterSeries, filterCategory, filterStockStatus, filterKeyword, productMetaMap]);

  const filteredPurchases = useMemo(() => {
    const result = purchases.filter(p => {
      // 系列筛选
      if (purFilterSeries) {
        const meta = productMetaMap.get(p.product_id);
        if (meta?.seriesCode !== purFilterSeries) return false;
      }
      // 名称搜索
      if (purFilterKeyword) {
        const kw = purFilterKeyword.toLowerCase();
        const prod = products.find(pr => pr.id === p.product_id);
        const name = prod?.name_cn || prod?.name_en || '';
        if (!name.toLowerCase().includes(kw) && !p.product_id.includes(kw)) return false;
      }
      // 日期范围
      if (purFilterDateFrom && p.purchase_date < purFilterDateFrom) return false;
      if (purFilterDateTo && p.purchase_date > purFilterDateTo) return false;
      return true;
    });
    // 排序
    result.sort((a, b) => {
      const dir = purSortDir === 'asc' ? 1 : -1;
      if (purSortField === 'date') return dir * (a.purchase_date > b.purchase_date ? 1 : a.purchase_date < b.purchase_date ? -1 : 0);
      const amtA = (a.volume_ml || 0) * (a.unit_cost || 0);
      const amtB = (b.volume_ml || 0) * (b.unit_cost || 0);
      return dir * (amtA - amtB);
    });
    return result;
  }, [purchases, purFilterSeries, purFilterKeyword, purFilterDateFrom, purFilterDateTo, purSortField, purSortDir, productMetaMap, products]);

  const filteredSales = useMemo(() => {
    const result = sales.filter(s => {
      // 系列筛选
      if (salFilterSeries) {
        const meta = productMetaMap.get(s.product_id);
        if (meta?.seriesCode !== salFilterSeries) return false;
      }
      // 名称搜索
      if (salFilterKeyword) {
        const kw = salFilterKeyword.toLowerCase();
        const prod = products.find(pr => pr.id === s.product_id);
        const name = prod?.name_cn || prod?.name_en || '';
        if (!name.toLowerCase().includes(kw) && !s.product_id.includes(kw)) return false;
      }
      // 日期范围
      if (salFilterDateFrom && s.sale_date < salFilterDateFrom) return false;
      if (salFilterDateTo && s.sale_date > salFilterDateTo) return false;
      return true;
    });
    // 排序
    result.sort((a, b) => {
      const dir = salSortDir === 'asc' ? 1 : -1;
      if (salSortField === 'date') return dir * (a.sale_date > b.sale_date ? 1 : a.sale_date < b.sale_date ? -1 : 0);
      return dir * ((a.total_amount || 0) - (b.total_amount || 0));
    });
    return result;
  }, [sales, salFilterSeries, salFilterKeyword, salFilterDateFrom, salFilterDateTo, salSortField, salSortDir, productMetaMap, products]);

  // 汇总统计（基于筛选后）
  const totalStock = filteredSummaries.reduce((s, item) => s + item.current_stock_ml, 0);
  const totalCost = filteredSummaries.reduce((s, item) => s + item.total_cost, 0);
  const totalRevenue = filteredSummaries.reduce((s, item) => s + item.total_revenue, 0);
  const totalProfit = filteredSummaries.reduce((s, item) => s + item.total_profit, 0);

  // ====== 导出 CSV ======
  const exportCSV = useCallback((type: 'overview' | 'purchases' | 'sales') => {
    const BOM = '\uFEFF'; // UTF-8 BOM for Excel
    let csv = '';
    const fileName = `UNIO_${type === 'overview' ? '库存概览' : type === 'purchases' ? '进货记录' : '销售记录'}_${new Date().toISOString().split('T')[0]}.csv`;

    if (type === 'overview') {
      csv = BOM + '产品名称,系列,子分类,总进货(ml),总销售(ml),当前库存(ml),总成本(¥),总收入(¥),利润(¥)\n';
      for (const s of filteredSummaries) {
        const meta = productMetaMap.get(s.product_id);
        csv += `"${s.product_name}","${meta?.seriesName || ''}","${meta?.categoryName || ''}",${s.total_purchased_ml},${s.total_sold_ml},${s.current_stock_ml},${s.total_cost.toFixed(2)},${s.total_revenue.toFixed(2)},${s.total_profit.toFixed(2)}\n`;
      }
    } else if (type === 'purchases') {
      csv = BOM + '日期,产品,系列,容量(ml),单价(元/ml),总价(元),供货商\n';
      for (const p of filteredPurchases) {
        const prod = products.find(pr => pr.id === p.product_id);
        const meta = productMetaMap.get(p.product_id);
        csv += `${p.purchase_date},"${prod?.name_cn || ''}","${meta?.seriesName || ''}",${p.volume_ml},${p.unit_cost?.toFixed(2) || 0},${((p.volume_ml || 0) * (p.unit_cost || 0)).toFixed(2)},"${p.supplier_code || ''}"\n`;
      }
    } else {
      csv = BOM + '日期,产品,系列,容量(ml),单价(元/ml),金额(¥)\n';
      for (const s of filteredSales) {
        const prod = products.find(p => p.id === s.product_id);
        const meta = productMetaMap.get(s.product_id);
        csv += `${s.sale_date},"${prod?.name_cn || ''}","${meta?.seriesName || ''}",${s.volume_ml},${s.sale_price?.toFixed(2) || 0},${s.total_amount?.toFixed(2) || 0}\n`;
      }
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fileName; a.click();
    URL.revokeObjectURL(url);
  }, [filteredSummaries, filteredPurchases, filteredSales, products, productMetaMap]);

  const resetOverviewFilters = () => {
    setFilterSeries(''); setFilterCategory(''); setFilterKeyword(''); setFilterStockStatus('all');
  };
  const resetPurFilters = () => {
    setPurFilterSeries(''); setPurFilterKeyword(''); setPurFilterDateFrom(''); setPurFilterDateTo('');
    setPurSortField('date'); setPurSortDir('desc');
  };
  const resetSalFilters = () => {
    setSalFilterSeries(''); setSalFilterKeyword(''); setSalFilterDateFrom(''); setSalFilterDateTo('');
    setSalSortField('date'); setSalSortDir('desc');
  };

  // ---- 进货操作 ----
  const handleAddPurchase = async () => {
    if (!purchaseForm.product_id || !purchaseForm.volume_ml || !purchaseForm.unit_cost) {
      alert('请填写完整信息！'); return;
    }
    try {
      if (editingPurchase) {
        await purchaseService.update(editingPurchase.id, {
          product_id: purchaseForm.product_id,
          purchase_date: purchaseForm.purchase_date,
          volume_ml: parseFloat(purchaseForm.volume_ml),
          unit_cost: parseFloat(purchaseForm.unit_cost),
          supplier_code: purchaseForm.supplier_code,
        });
        setEditingPurchase(null);
      } else {
        await purchaseService.create({
          ...purchaseForm,
          volume_ml: parseFloat(purchaseForm.volume_ml),
          unit_cost: parseFloat(purchaseForm.unit_cost),
        });
      }
      setPurchaseForm({ product_id: '', purchase_date: new Date().toISOString().split('T')[0], volume_ml: '', unit_cost: '', supplier_code: '' });
      setShowPurchaseForm(false);
      await loadAllData();
    } catch (err: any) { alert(editingPurchase ? '修改失败：' + err.message : '添加失败：' + err.message); }
  };

  const startEditPurchase = (p: PurchaseRecord) => {
    setEditingPurchase(p);
    setPurchaseForm({
      product_id: p.product_id,
      purchase_date: p.purchase_date,
      volume_ml: String(p.volume_ml),
      unit_cost: String(p.unit_cost),
      supplier_code: p.supplier_code || '',
    });
    setShowPurchaseForm(true);
  };

  const handleDeletePurchase = async (id: string) => {
    if (!confirm('确认删除此进货记录？删除后库存会相应减少。')) return;
    try {
      await purchaseService.delete(id);
      await loadAllData();
    } catch (err: any) { alert('删除失败：' + err.message); }
  };

  const cancelPurchaseForm = () => {
    setShowPurchaseForm(false);
    setEditingPurchase(null);
    setPurchaseForm({ product_id: '', purchase_date: new Date().toISOString().split('T')[0], volume_ml: '', unit_cost: '', supplier_code: '' });
  };

  // ---- 销售操作 ----
  const handleAddSale = async () => {
    if (!saleForm.product_id || !saleForm.volume_ml || !saleForm.total_amount) {
      alert('请填写完整信息！'); return;
    }
    try {
      if (editingSale) {
        await salesService.update(editingSale.id, {
          product_id: saleForm.product_id,
          sale_date: saleForm.sale_date,
          volume_ml: parseFloat(saleForm.volume_ml),
          total_amount: parseFloat(saleForm.total_amount),
          sale_price: parseFloat(saleForm.total_amount) / parseFloat(saleForm.volume_ml),
        });
        setEditingSale(null);
      } else {
        await salesService.create({
          ...saleForm,
          volume_ml: parseFloat(saleForm.volume_ml),
          total_amount: parseFloat(saleForm.total_amount),
          sale_price: parseFloat(saleForm.total_amount) / parseFloat(saleForm.volume_ml),
        });
      }
      setSaleForm({ product_id: '', sale_date: new Date().toISOString().split('T')[0], volume_ml: '', total_amount: '' });
      setShowSaleForm(false);
      await loadAllData();
    } catch (err: any) { alert(editingSale ? '修改失败：' + err.message : '添加失败：' + err.message); }
  };

  const startEditSale = (s: SalesRecord) => {
    setEditingSale(s);
    setSaleForm({
      product_id: s.product_id,
      sale_date: s.sale_date,
      volume_ml: String(s.volume_ml),
      total_amount: String(s.total_amount),
    });
    setShowSaleForm(true);
  };

  const handleDeleteSale = async (id: string) => {
    if (!confirm('确认删除此销售记录？删除后库存会相应增加。')) return;
    try {
      await salesService.delete(id);
      await loadAllData();
    } catch (err: any) { alert('删除失败：' + err.message); }
  };

  const cancelSaleForm = () => {
    setShowSaleForm(false);
    setEditingSale(null);
    setSaleForm({ product_id: '', sale_date: new Date().toISOString().split('T')[0], volume_ml: '', total_amount: '' });
  };

  // 通用 select/input 样式
  const selectCls = 'w-full px-3 py-2 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A]';
  const inputCls = 'w-full px-3 py-2 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] placeholder:text-[#9AAA9A] outline-none focus:border-[#4A7C59]/50';

  // 排序表头组件
  const SortableTh = ({ field, currentField, currentDir, onSort, children }: {
    field: string; currentField: string; currentDir: 'asc' | 'desc';
    onSort: (f: any) => void; children: React.ReactNode;
  }) => (
    <th
      className={`text-${field === 'date' ? 'left' : 'right'} px-4 py-2.5 text-xs text-[#8AA08A] cursor-pointer select-none hover:text-[#4A7C59] transition-colors`}
      onClick={() => {
        if (currentField === field) {
          onSort(currentDir === 'asc' ? 'desc' : 'asc');
        } else {
          onSort('desc');
        }
      }}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {currentField === field && (
          currentDir === 'desc' ? <ArrowDown size={11} /> : <ArrowUp size={11} />
        )}
        {currentField !== field && <ArrowUpDown size={11} className="opacity-30" />}
      </span>
    </th>
  );

  if (loading) {
    return <div className="text-center py-20 text-[#6B856B]"><Warehouse size={32} className="mx-auto mb-3 animate-pulse" /><p>加载库存数据...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A2E1A]">库存与利润</h2>
          <p className="text-sm text-[#6B856B] mt-1">产品库存汇总、进货记录、销售记录与利润计算</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '当前总库存', value: `${totalStock.toLocaleString()} ml`, icon: Package, color: '#7B9EA8', bg: 'rgba(123,158,168,0.1)' },
          { label: '总进货成本', value: `¥${totalCost.toFixed(2)}`, icon: TrendingDown, color: '#E85D3B', bg: 'rgba(232,93,59,0.1)' },
          { label: '总销售收入', value: `¥${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: '#4A9D5C', bg: 'rgba(74,157,92,0.1)' },
          { label: '总利润', value: `¥${totalProfit.toFixed(2)}`, icon: DollarSign, color: totalProfit >= 0 ? '#7BA689' : '#EF4444', bg: totalProfit >= 0 ? 'rgba(212,175,55,0.1)' : 'rgba(239,68,68,0.1)' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-5 rounded-xl bg-white border border-[#E0ECE0]">
              <div className="flex items-center gap-2 mb-2"><Icon size={16} style={{ color: stat.color }} /><span className="text-xs text-[#8AA08A]">{stat.label}</span></div>
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Tab 切换 */}
      <div className="flex items-center gap-1 p-1 bg-white rounded-xl w-fit">
        {[
          { key: 'overview' as const, label: '库存概览' },
          { key: 'purchases' as const, label: '进货记录' },
          { key: 'sales' as const, label: '销售记录' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-[#4A7C59] text-[#1A2E1A]' : 'text-[#5C725C] hover:text-[#1A2E1A]'
            }`}
          >{t.label}</button>
        ))}
      </div>

      {/* ===================== 库存概览 Tab ===================== */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {/* 筛选栏 */}
          <div className="rounded-xl bg-white border border-[#E0ECE0] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-[#3D5C3D]">
                <Filter size={14} /> 筛选条件
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => exportCSV('overview')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#4A7C59] hover:bg-[#EEF4EF] rounded-lg transition-colors border border-[#D5E2D5]">
                  <Download size={12} /> 导出CSV
                </button>
                <button onClick={resetOverviewFilters} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#8AA08A] hover:text-[#5C725C] rounded-lg transition-colors">
                  <RotateCcw size={11} /> 重置
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-[10px] text-[#8AA08A] mb-1">系列</label>
                <select value={filterSeries} onChange={e => { setFilterSeries(e.target.value); setFilterCategory(''); }} className={selectCls}>
                  <option value="">全部系列</option>
                  {Object.entries(SERIES_INFO).map(([code, info]) => (
                    <option key={code} value={code}>{info.name_cn} · {info.slogan.split('/')[0]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-[#8AA08A] mb-1">子分类</label>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={selectCls} disabled={!filterSeries}>
                  <option value="">全部</option>
                  {availableCategories.map(([code, label]) => (
                    <option key={code} value={code}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-[#8AA08A] mb-1">库存状态</label>
                <select value={filterStockStatus} onChange={e => setFilterStockStatus(e.target.value as any)} className={selectCls}>
                  <option value="all">全部</option>
                  <option value="instock">库存充足 (≥10ml)</option>
                  <option value="low">库存偏低 (1-9ml)</option>
                  <option value="zero">已售罄 (0ml)</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] text-[#8AA08A] mb-1">搜索产品</label>
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9AAA9A]" />
                  <input value={filterKeyword} onChange={e => setFilterKeyword(e.target.value)} placeholder="输入产品名称..." className={`${inputCls} pl-8`} />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-[#A8BAA8]">当前显示 {filteredSummaries.length} / {summaries.length} 个产品</p>
          </div>

          {/* 表格 */}
          <div className="rounded-xl bg-white border border-[#E0ECE0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[#D5E2D5]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#8AA08A]">产品名称</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#8AA08A]">系列</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#8AA08A]">子分类</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#8AA08A]">总进货(ml)</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#8AA08A]">总销售(ml)</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#8AA08A]">库存(ml)</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#8AA08A]">成本(¥)</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#8AA08A]">收入(¥)</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#8AA08A]">利润(¥)</th>
                </tr></thead>
                <tbody>
                  {filteredSummaries.map(s => {
                    const meta = productMetaMap.get(s.product_id);
                    return (
                      <tr key={s.product_id} className={`border-b border-[#D5E2D5]/[0.03] hover:bg-[#EEF4EF] ${
                        s.current_stock_ml === 0 ? 'bg-red-500/[0.03]' :
                        s.current_stock_ml > 0 && s.current_stock_ml < 10 ? 'bg-yellow-500/5' : ''
                      }`}>
                        <td className="px-4 py-2.5 text-[#1A2E1A] font-medium">{s.product_name}</td>
                        <td className="px-4 py-2.5 text-[#5C725C] text-xs">{meta?.seriesName || '-'}</td>
                        <td className="px-4 py-2.5 text-[#5C725C] text-xs">{meta?.categoryName || '-'}</td>
                        <td className="px-4 py-2.5 text-right text-[#3D5C3D]">{s.total_purchased_ml}</td>
                        <td className="px-4 py-2.5 text-right text-[#3D5C3D]">{s.total_sold_ml}</td>
                        <td className={`px-4 py-2.5 text-right font-medium ${
                          s.current_stock_ml === 0 ? 'text-red-400' :
                          s.current_stock_ml < 10 ? 'text-yellow-500' : 'text-[#2D442D]'
                        }`}>{s.current_stock_ml}</td>
                        <td className="px-4 py-2.5 text-right text-[#8AA08A]">¥{s.total_cost.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-right text-[#3D5C3D]">¥{s.total_revenue.toFixed(2)}</td>
                        <td className={`px-4 py-2.5 text-right font-semibold ${s.total_profit >= 0 ? 'text-green-500' : 'text-red-400'}`}>¥{s.total_profit.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                  {filteredSummaries.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-12 text-center text-[#9AAA9A]">
                      {summaries.length === 0 ? '暂无库存数据，请先录入进货记录' : '没有符合筛选条件的产品'}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== 进货记录 Tab ===================== */}
      {tab === 'purchases' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Perm action="edit_inventory"><button onClick={() => setShowPurchaseForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium transition-colors">
              <Plus size={16} /> 录入进货
            </button></Perm>
            <button onClick={() => exportCSV('purchases')} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#4A7C59] hover:bg-[#EEF4EF] rounded-lg transition-colors border border-[#D5E2D5]">
              <Download size={12} /> 导出CSV
            </button>
          </div>

          {/* 进货筛选 */}
          <div className="rounded-xl bg-white border border-[#E0ECE0] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#3D5C3D] flex items-center gap-1.5"><Filter size={13} /> 筛选</span>
              <button onClick={resetPurFilters} className="text-[10px] text-[#8AA08A] hover:text-[#5C725C] flex items-center gap-1"><RotateCcw size={10} /> 重置</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-[10px] text-[#8AA08A] mb-1">系列</label>
                <select value={purFilterSeries} onChange={e => setPurFilterSeries(e.target.value)} className={selectCls}>
                  <option value="">全部系列</option>
                  {Object.entries(SERIES_INFO).map(([code, info]) => (
                    <option key={code} value={code}>{info.name_cn}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-[#8AA08A] mb-1">搜索产品</label>
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9AAA9A]" />
                  <input value={purFilterKeyword} onChange={e => setPurFilterKeyword(e.target.value)} placeholder="输入产品名称..." className={`${inputCls} pl-8`} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-[#8AA08A] mb-1">起始日期</label>
                <input type="date" value={purFilterDateFrom} onChange={e => setPurFilterDateFrom(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] text-[#8AA08A] mb-1">截止日期</label>
                <input type="date" value={purFilterDateTo} onChange={e => setPurFilterDateTo(e.target.value)} className={inputCls} />
              </div>
              <div className="flex items-end">
                <p className="text-[10px] text-[#A8BAA8]">{filteredPurchases.length} / {purchases.length} 条记录</p>
              </div>
            </div>
          </div>

          {/* 进货表单 */}
          {showPurchaseForm && (
            <div className="rounded-xl bg-white border border-[#D5E2D5] p-5 space-y-4">
              <h4 className="font-semibold text-[#1A2E1A] flex items-center justify-between">
                {editingPurchase ? '编辑进货记录' : '录入进货记录'}
                <button onClick={cancelPurchaseForm} className="p-1 hover:bg-[#EEF4EF] rounded text-[#6B856B]"><X size={16} /></button>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-[#6B856B] mb-1.5">选择产品 *</label>
                  <select value={purchaseForm.product_id} onChange={e => setPurchaseForm(f => ({ ...f, product_id: e.target.value }))} className={selectCls}>
                    <option value="">选择...</option>{products.map(p => <option key={p.id} value={p.id}>{p.name_cn}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs text-[#6B856B] mb-1.5">进货日期</label><input type="date" value={purchaseForm.purchase_date} onChange={e => setPurchaseForm(f => ({ ...f, purchase_date: e.target.value }))} className={inputCls} /></div>
                <div><label className="block text-xs text-[#6B856B] mb-1.5">容量(ml) *</label><input type="number" placeholder="例如: 100" value={purchaseForm.volume_ml} onChange={e => setPurchaseForm(f => ({ ...f, volume_ml: e.target.value }))} className={inputCls} /></div>
                <div><label className="block text-xs text-[#6B856B] mb-1.5">进价(元/ml) *</label><input type="number" step="0.01" placeholder="单价" value={purchaseForm.unit_cost} onChange={e => setPurchaseForm(f => ({ ...f, unit_cost: e.target.value }))} className={inputCls} /></div>
                <div><label className="block text-xs text-[#6B856B] mb-1.5">供货商代码</label><input placeholder="例如: SUP001" value={purchaseForm.supplier_code} onChange={e => setPurchaseForm(f => ({ ...f, supplier_code: e.target.value }))} className={inputCls} /></div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={cancelPurchaseForm} className="px-5 py-2 text-sm text-[#5C725C] hover:text-[#1A2E1A] rounded-xl hover:bg-[#EEF4EF]">取消</button>
                <button onClick={handleAddPurchase} className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-2"><Save size={14} /> {editingPurchase ? '保存修改' : '保存进货记录'}</button>
              </div>
            </div>
          )}

          {/* 进货列表 */}
          <div className="rounded-xl bg-white border border-[#E0ECE0] overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead><tr className="border-b border-[#D5E2D5]">
                <SortableTh field="date" currentField={purSortField} currentDir={purSortDir} onSort={f => { setPurSortField(f); }}>日期</SortableTh>
                <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">产品</th>
                <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">系列</th>
                <th className="text-right px-4 py-2.5 text-xs text-[#8AA08A]">容量(ml)</th>
                <th className="text-right px-4 py-2.5 text-xs text-[#8AA08A]">单价(元/ml)</th>
                <SortableTh field="amount" currentField={purSortField} currentDir={purSortDir} onSort={f => { setPurSortField(f); }}>总价(元)</SortableTh>
                <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">供货商</th>
                <th className="text-center px-4 py-2.5 text-xs text-[#8AA08A] w-24">操作</th>
              </tr></thead>
              <tbody>
                {filteredPurchases.map(p => {
                  const prod = products.find(pr => pr.id === p.product_id);
                  const meta = productMetaMap.get(p.product_id);
                  return (
                    <tr key={p.id} className="border-b border-[#D5E2D5]/[0.03] hover:bg-[#EEF4EF]">
                      <td className="px-4 py-2 text-[#5C725C]">{p.purchase_date}</td>
                      <td className="px-4 py-2 text-[#2D442D] font-medium">{prod?.name_cn || p.product_id.slice(0,8)}</td>
                      <td className="px-4 py-2 text-xs text-[#5C725C]">{meta?.seriesName || '-'}</td>
                      <td className="px-4 py-2 text-right text-[#3D5C3D]">{p.volume_ml}</td>
                      <td className="px-4 py-2 text-right text-[#3D5C3D]">¥{p.unit_cost?.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right text-green-500/70 font-medium">¥{((p.volume_ml || 0) * (p.unit_cost || 0)).toFixed(2)}</td>
                      <td className="px-4 py-2 text-[#6B856B]">{p.supplier_code || '-'}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <Perm action="edit_inventory"><button onClick={() => startEditPurchase(p)} className="p-1.5 hover:bg-[#EEF4EF] rounded-lg text-[#5C725C]" title="编辑"><Edit2 size={13} /></button></Perm>
                          <Perm action="edit_inventory"><button onClick={() => handleDeletePurchase(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400/50" title="删除"><Trash2 size={13} /></button></Perm>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredPurchases.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-[#9AAA9A]">暂无进货记录</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== 销售记录 Tab ===================== */}
      {tab === 'sales' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Perm action="edit_inventory"><button onClick={() => setShowSaleForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors">
              <Plus size={16} /> 录入销售
            </button></Perm>
            <button onClick={() => exportCSV('sales')} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#4A7C59] hover:bg-[#EEF4EF] rounded-lg transition-colors border border-[#D5E2D5]">
              <Download size={12} /> 导出CSV
            </button>
          </div>

          {/* 销售筛选 */}
          <div className="rounded-xl bg-white border border-[#E0ECE0] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#3D5C3D] flex items-center gap-1.5"><Filter size={13} /> 筛选</span>
              <button onClick={resetSalFilters} className="text-[10px] text-[#8AA08A] hover:text-[#5C725C] flex items-center gap-1"><RotateCcw size={10} /> 重置</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-[10px] text-[#8AA08A] mb-1">系列</label>
                <select value={salFilterSeries} onChange={e => setSalFilterSeries(e.target.value)} className={selectCls}>
                  <option value="">全部系列</option>
                  {Object.entries(SERIES_INFO).map(([code, info]) => (
                    <option key={code} value={code}>{info.name_cn}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-[#8AA08A] mb-1">搜索产品</label>
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9AAA9A]" />
                  <input value={salFilterKeyword} onChange={e => setSalFilterKeyword(e.target.value)} placeholder="输入产品名称..." className={`${inputCls} pl-8`} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-[#8AA08A] mb-1">起始日期</label>
                <input type="date" value={salFilterDateFrom} onChange={e => setSalFilterDateFrom(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] text-[#8AA08A] mb-1">截止日期</label>
                <input type="date" value={salFilterDateTo} onChange={e => setSalFilterDateTo(e.target.value)} className={inputCls} />
              </div>
              <div className="flex items-end">
                <p className="text-[10px] text-[#A8BAA8]">{filteredSales.length} / {sales.length} 条记录</p>
              </div>
            </div>
          </div>

          {showSaleForm && (
            <div className="rounded-xl bg-white border border-[#D5E2D5] p-5 space-y-4">
              <h4 className="font-semibold text-[#1A2E1A] flex items-center justify-between">
                {editingSale ? '编辑销售记录' : '录入销售记录'}
                <button onClick={cancelSaleForm} className="p-1 hover:bg-[#EEF4EF] rounded text-[#6B856B]"><X size={16} /></button>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><label className="block text-xs text-[#6B856B] mb-1.5">选择产品 *</label><select value={saleForm.product_id} onChange={e => setSaleForm(f => ({ ...f, product_id: e.target.value }))} className={selectCls}><option value="">选择...</option>{products.map(p => <option key={p.id} value={p.id}>{p.name_cn}</option>)}</select></div>
                <div><label className="block text-xs text-[#6B856B] mb-1.5">销售日期</label><input type="date" value={saleForm.sale_date} onChange={e => setSaleForm(f => ({ ...f, sale_date: e.target.value }))} className={inputCls} /></div>
                <div><label className="block text-xs text-[#6B856B] mb-1.5">容量(ml) *</label><input type="number" value={saleForm.volume_ml} onChange={e => setSaleForm(f => ({ ...f, volume_ml: e.target.value }))} className={inputCls} /></div>
                <div><label className="block text-xs text-[#6B856B] mb-1.5">销售金额(¥) *</label><input type="number" step="0.01" value={saleForm.total_amount} onChange={e => setSaleForm(f => ({ ...f, total_amount: e.target.value }))} className={inputCls} /></div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={cancelSaleForm} className="px-5 py-2 text-sm text-[#5C725C] hover:text-[#1A2E1A] rounded-xl hover:bg-[#EEF4EF]">取消</button>
                <button onClick={handleAddSale} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2"><Save size={14} /> {editingSale ? '保存修改' : '保存销售记录'}</button>
              </div>
            </div>
          )}

          <div className="rounded-xl bg-white border border-[#E0ECE0] overflow-x-auto">
            <table className="w-full text-sm min-w-[750px]">
              <thead><tr className="border-b border-[#D5E2D5]">
                <SortableTh field="date" currentField={salSortField} currentDir={salSortDir} onSort={f => { setSalSortField(f); }}>日期</SortableTh>
                <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">产品</th>
                <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">系列</th>
                <th className="text-right px-4 py-2.5 text-xs text-[#8AA08A]">容量(ml)</th>
                <th className="text-right px-4 py-2.5 text-xs text-[#8AA08A]">单价</th>
                <SortableTh field="amount" currentField={salSortField} currentDir={salSortDir} onSort={f => { setSalSortField(f); }}>金额(¥)</SortableTh>
                <th className="text-center px-4 py-2.5 text-xs text-[#8AA08A] w-24">操作</th>
              </tr></thead>
              <tbody>
                {filteredSales.map(s => {
                  const prod = products.find(p => p.id === s.product_id);
                  const meta = productMetaMap.get(s.product_id);
                  return (
                    <tr key={s.id} className="border-b border-[#D5E2D5]/[0.03] hover:bg-[#EEF4EF]">
                      <td className="px-4 py-2 text-[#5C725C]">{s.sale_date}</td>
                      <td className="px-4 py-2 text-[#2D442D] font-medium">{prod?.name_cn || s.product_id.slice(0,8)}</td>
                      <td className="px-4 py-2 text-xs text-[#5C725C]">{meta?.seriesName || '-'}</td>
                      <td className="px-4 py-2 text-right text-[#3D5C3D]">{s.volume_ml}</td>
                      <td className="px-4 py-2 text-right text-[#3D5C3D]">¥{s.sale_price?.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right text-blue-500/70 font-medium">¥{s.total_amount?.toFixed(2)}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <Perm action="edit_inventory"><button onClick={() => startEditSale(s)} className="p-1.5 hover:bg-[#EEF4EF] rounded-lg text-[#5C725C]" title="编辑"><Edit2 size={13} /></button></Perm>
                          <Perm action="edit_inventory"><button onClick={() => handleDeleteSale(s.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400/50" title="删除"><Trash2 size={13} /></button></Perm>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredSales.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-[#9AAA9A]">暂无销售记录</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
