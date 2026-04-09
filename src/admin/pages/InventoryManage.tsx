import React, { useEffect, useState } from 'react';
import {
  Warehouse, TrendingUp, TrendingDown,
  Plus, Trash2, Edit2, X, DollarSign,
  Package, AlertTriangle
} from 'lucide-react';
import { productService, inventoryService, purchaseService, salesService } from '../../lib/dataService';
import type { Product, PurchaseRecord, SalesRecord, ProductInventory } from '../../lib/database.types';

export default function AdminInventory() {
  const [tab, setTab] = useState<'overview' | 'purchases' | 'sales'>('overview');
  const [summaries, setSummaries] = useState<ProductInventory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // 新增记录表单状态
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [formProductId, setFormProductId] = useState('');
  
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
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadAllData(); }, []);

  // 汇总统计
  const totalStock = summaries.reduce((s, item) => s + item.current_stock_ml, 0);
  const totalCost = summaries.reduce((s, item) => s + item.total_cost, 0);
  const totalRevenue = summaries.reduce((s, item) => s + item.total_revenue, 0);
  const totalProfit = summaries.reduce((s, item) => s + item.total_profit, 0);

  // ---- 进货操作 ----
  const handleAddPurchase = async () => {
    if (!purchaseForm.product_id || !purchaseForm.volume_ml || !purchaseForm.unit_cost) {
      alert('请填写完整信息！'); return;
    }
    try {
      await purchaseService.create({
        ...purchaseForm,
        volume_ml: parseFloat(purchaseForm.volume_ml),
        unit_cost: parseFloat(purchaseForm.unit_cost),
      });
      setPurchaseForm({ product_id: '', purchase_date: new Date().toISOString().split('T')[0], volume_ml: '', unit_cost: '', supplier_code: '' });
      setShowPurchaseForm(false);
      await loadAllData();
    } catch (err: any) { alert('添加失败：' + err.message); }
  };

  // ---- 销售操作 ----
  const handleAddSale = async () => {
    if (!saleForm.product_id || !saleForm.volume_ml || !saleForm.total_amount) {
      alert('请填写完整信息！'); return;
    }
    try {
      await salesService.create({
        ...saleForm,
        volume_ml: parseFloat(saleForm.volume_ml),
        total_amount: parseFloat(saleForm.total_amount),
        sale_price: parseFloat(saleForm.total_amount) / parseFloat(saleForm.volume_ml),
      });
      setSaleForm({ product_id: '', sale_date: new Date().toISOString().split('T')[0], volume_ml: '', total_amount: '' });
      setShowSaleForm(false);
      await loadAllData();
    } catch (err: any) { alert('添加失败：' + err.message); }
  };

  if (loading) {
    return <div className="text-center py-20 text-white/40"><Warehouse size={32} className="mx-auto mb-3 animate-pulse" /><p>加载库存数据...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">库存与利润</h2>
          <p className="text-sm text-white/40 mt-1">产品库存汇总、进货记录、销售记录与利润计算</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '当前总库存', value: `${totalStock.toLocaleString()} ml`, icon: Package, color: '#7B9EA8', bg: 'rgba(123,158,168,0.1)' },
          { label: '总进货成本', value: `¥${totalCost.toFixed(2)}`, icon: TrendingDown, color: '#E85D3B', bg: 'rgba(232,93,59,0.1)' },
          { label: '总销售收入', value: `¥${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: '#4A9D5C', bg: 'rgba(74,157,92,0.1)' },
          { label: '总利润', value: `¥${totalProfit.toFixed(2)}`, icon: DollarSign, color: totalProfit >= 0 ? '#D4AF37' : '#EF4444', bg: totalProfit >= 0 ? 'rgba(212,175,55,0.1)' : 'rgba(239,68,68,0.1)' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-5 rounded-xl bg-[#1a1a1a] border border-white/5">
              <div className="flex items-center gap-2 mb-2"><Icon size={16} style={{ color: stat.color }} /><span className="text-xs text-white/35">{stat.label}</span></div>
              <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-1 p-1 bg-[#1a1a1a] rounded-xl w-fit">
        {[
          { key: 'overview' as const, label: '库存概览' },
          { key: 'purchases' as const, label: '进货记录' },
          { key: 'sales' as const, label: '销售记录' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-[#D75437] text-white' : 'text-white/50 hover:text-white'
            }`}
          >{t.label}</button>
        ))}
      </div>

      {/* 库存概览 Tab */}
      {tab === 'overview' && (
        <div className="rounded-xl bg-[#1a1a1a] border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-xs font-medium text-white/35 uppercase">产品名称</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-white/35 uppercase">总进货(ml)</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-white/35 uppercase">总销售(ml)</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-white/35 uppercase">当前库存(ml)</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-white/35 uppercase">总成本(¥)</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-white/35 uppercase">总收入(¥)</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-white/35 uppercase">利润(¥)</th>
            </tr></thead>
            <tbody>
              {summaries.map(s => (
                <tr key={s.product_id} className={`border-b border-white/[0.03] hover:bg-white/[0.02] ${s.current_stock_ml < 10 && s.current_stock_ml > 0 ? 'bg-yellow-500/5' : ''}`}>
                  <td className="px-4 py-2.5 text-white/90">{s.product_name}</td>
                  <td className="px-4 py-2.5 text-right text-white/60">{s.total_purchased_ml}</td>
                  <td className="px-4 py-2.5 text-right text-white/60">{s.total_sold_ml}</td>
                  <td className={`px-4 py-2.5 text-right font-medium ${s.current_stock_ml < 10 && s.current_stock_ml > 0 ? 'text-yellow-400' : 'text-white/80'}`}>{s.current_stock_ml}</td>
                  <td className="px-4 py-2.5 text-right text-red-300/60">¥{s.total_cost.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-green-400/70">¥{s.total_revenue.toFixed(2)}</td>
                  <td className={`px-4 py-2.5 text-right font-medium ${s.total_profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>¥{s.total_profit.toFixed(2)}</td>
                </tr>
              ))}
              {summaries.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-white/30">暂无库存数据，请先录入进货记录</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 进货记录 Tab */}
      {tab === 'purchases' && (
        <div className="space-y-4">
          <button onClick={() => setShowPurchaseForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus size={16} /> 录入进货
          </button>
          
          {showPurchaseForm && (
            <div className="rounded-xl bg-[#161616] border border-white/10 p-5 space-y-4">
              <h4 className="font-semibold text-white flex items-center justify-between">录入进货记录<button onClick={() => setShowPurchaseForm(false)} className="p-1 hover:bg-white/5 rounded text-white/40"><X size={16} /></button></h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">选择产品 *</label>
                  <select value={purchaseForm.product_id} onChange={e => setPurchaseForm(f => ({ ...f, product_id: e.target.value }))} className="w-full px-3 py-2.5 bg-[#0f0f0f] border border-white/8 rounded-lg text-sm text-white">
                    <option value="">选择...</option>{products.map(p => <option key={p.id} value={p.id}>{p.name_cn}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs text-white/40 mb-1.5">进货日期</label><input type="date" value={purchaseForm.purchase_date} onChange={e => setPurchaseForm(f => ({ ...f, purchase_date: e.target.value }))} className="w-full px-3 py-2.5 bg-[#0f0f0f] border border-white/8 rounded-lg text-sm text-white" /></div>
                <div><label className="block text-xs text-white/40 mb-1.5">容量(ml) *</label><input type="number" placeholder="例如: 100" value={purchaseForm.volume_ml} onChange={e => setPurchaseForm(f => ({ ...f, volume_ml: e.target.value }))} className="w-full px-3 py-2.5 bg-[#0f0f0f] border border-white/8 rounded-lg text-sm text-white" /></div>
                <div><label className="block text-xs text-white/40 mb-1.5">进价(元/ml) *</label><input type="number" step="0.01" placeholder="单价" value={purchaseForm.unit_cost} onChange={e => setPurchaseForm(f => ({ ...f, unit_cost: e.target.value }))} className="w-full px-3 py-2.5 bg-[#0f0f0f] border border-white/8 rounded-lg text-sm text-white" /></div>
                <div><label className="block text-xs text-white/40 mb-1.5">供货商代码</label><input placeholder="例如: SUP001" value={purchaseForm.supplier_code} onChange={e => setPurchaseForm(f => ({ ...f, supplier_code: e.target.value }))} className="w-full px-3 py-2.5 bg-[#0f0f0f] border border-white/8 rounded-lg text-sm text-white" /></div>
              </div>
              <div className="flex justify-end"><button onClick={handleAddPurchase} className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm">保存进货记录</button></div>
            </div>
          )}

          {/* 进货列表 */}
          <div className="rounded-xl bg-[#1a1a1a] border border-white/5 overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead><tr className="border-b border-white/5"><th className="text-left px-4 py-2.5 text-xs text-white/35 uppercase">日期</th><th className="text-left px-4 py-2.5 text-xs text-white/35 uppercase">产品</th><th className="text-right px-4 py-2.5 text-xs text-white/35 uppercase">容量(ml)</th><th className="text-right px-4 py-2.5 text-xs text-white/35 uppercase">单价(元/ml)</th><th className="text-right px-4 py-2.5 text-xs text-white/35 uppercase">总价(元)</th><th className="text-left px-4 py-2.5 text-xs text-white/35 uppercase">供货商</th></tr></thead>
              <tbody>
                {purchases.slice(0, 50).map(p => {
                  const prod = products.find(pr => pr.id === p.product_id);
                  return (
                    <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-4 py-2 text-white/50">{p.purchase_date}</td>
                      <td className="px-4 py-2 text-white/80">{prod?.name_cn || p.product_id.slice(0,8)}</td>
                      <td className="px-4 py-2 text-right text-white/60">{p.volume_ml}</td>
                      <td className="px-4 py-2 text-right text-white/60">¥{p.unit_cost?.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right text-green-400/70">¥{((p.volume_ml || 0) * (p.unit_cost || 0)).toFixed(2)}</td>
                      <td className="px-4 py-2 text-white/40">{p.supplier_code || '-'}</td>
                    </tr>
                  );
                })}
                {purchases.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-white/30">暂无进货记录</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 销售记录 Tab */}
      {tab === 'sales' && (
        <div className="space-y-4">
          <button onClick={() => setShowSaleForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus size={16} /> 录入销售
          </button>

          {showSaleForm && (
            <div className="rounded-xl bg-[#161616] border border-white/10 p-5 space-y-4">
              <h4 className="font-semibold text-white flex items-center justify-between">录入销售记录<button onClick={() => setShowSaleForm(false)} className="p-1 hover:bg-white/5 rounded text-white/40"><X size={16} /></button></h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><label className="block text-xs text-white/40 mb-1.5">选择产品 *</label><select value={saleForm.product_id} onChange={e => setSaleForm(f => ({ ...f, product_id: e.target.value }))} className="w-full px-3 py-2.5 bg-[#0f0f0f] border border-white/8 rounded-lg text-sm text-white"><option value="">选择...</option>{products.map(p => <option key={p.id} value={p.id}>{p.name_cn}</option>)}</select></div>
                <div><label className="block text-xs text-white/40 mb-1.5">销售日期</label><input type="date" value={saleForm.sale_date} onChange={e => setSaleForm(f => ({ ...f, sale_date: e.target.value }))} className="w-full px-3 py-2.5 bg-[#0f0f0f] border border-white/8 rounded-lg text-sm text-white" /></div>
                <div><label className="block text-xs text-white/40 mb-1.5">容量(ml) *</label><input type="number" value={saleForm.volume_ml} onChange={e => setSaleForm(f => ({ ...f, volume_ml: e.target.value }))} className="w-full px-3 py-2.5 bg-[#0f0f0f] border border-white/8 rounded-lg text-sm text-white" /></div>
                <div><label className="block text-xs text-white/40 mb-1.5">销售金额(¥) *</label><input type="number" step="0.01" value={saleForm.total_amount} onChange={e => setSaleForm(f => ({ ...f, total_amount: e.target.value }))} className="w-full px-3 py-2.5 bg-[#0f0f0f] border border-white/8 rounded-lg text-sm text-white" /></div>
              </div>
              <div className="flex justify-end"><button onClick={handleAddSale} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm">保存销售记录</button></div>
            </div>
          )}

          <div className="rounded-xl bg-[#1a1a1a] border border-white/5 overflow-x-auto">
            <table className="w-full text-sm min-w-[650px]">
              <thead><tr className="border-b border-white/5"><th className="text-left px-4 py-2.5 text-xs text-white/35 uppercase">日期</th><th className="text-left px-4 py-2.5 text-xs text-white/35 uppercase">产品</th><th className="text-right px-4 py-2.5 text-xs text-white/35 uppercase">容量(ml)</th><th className="text-right px-4 py-2.5 text-xs text-white/35 uppercase">单价</th><th className="text-right px-4 py-2.5 text-xs text-white/35 uppercase">金额(¥)</th></tr></thead>
              <tbody>
                {sales.slice(0, 50).map(s => {
                  const prod = products.find(p => p.id === s.product_id);
                  return (
                    <tr key={s.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-4 py-2 text-white/50">{s.sale_date}</td>
                      <td className="px-4 py-2 text-white/80">{prod?.name_cn || s.product_id.slice(0,8)}</td>
                      <td className="px-4 py-2 text-right text-white/60">{s.volume_ml}</td>
                      <td className="px-4 py-2 text-right text-white/60">¥{s.sale_price?.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right text-blue-400/70">¥{s.total_amount?.toFixed(2)}</td>
                    </tr>
                  );
                })}
                {sales.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-white/30">暂无销售记录</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
