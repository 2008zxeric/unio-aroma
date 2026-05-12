/**
 * UNIO AROMA 后台批量出库页面
 * 
 * 功能：
 * - 左侧产品列表（可搜索/筛选/勾选）
 * - 每个勾选的产品 → 选规格+填数量+售价
 * - 右侧客户信息（可选填）
 * - 一键出库：写入 sales_records + 生成需求单
 * 
 * 风格：匹配后台绿色主题
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  Package, Search, X, Check, Plus, Minus, ShoppingBag, Loader2, User, Phone, MessageCircle,
  FileText, Save, Download, AlertTriangle, CheckSquare, Square, RefreshCw, Wallet
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../lib/database.types';

// 品牌色
const C = {
  green: '#4A7C59',
  dark: '#1A2E1A',
  muted: '#9AAA9A',
  border: '#E0ECE0',
  bg: '#FAFCFA',
  light: '#EEF4EF',
};

interface OutboundItem {
  product_id: string;
  product_name: string;
  product_code: string;
  selected: boolean;
  size: string;
  quantity: number;
  unit_price: number;
  base_cost: number;
  series_code?: string;
}

export default function BulkOutbound() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [seriesFilter, setSeriesFilter] = useState<string>('all');
  const [items, setItems] = useState<OutboundItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // 客户信息
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerWechat, setCustomerWechat] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name_cn, name, code, series_code, price_5ml, price_10ml, price_15ml, price_30ml, price_50ml, price_100ml, price_piece, total_cost')
        .order('sort_order');
      if (error) throw error;
      const products = (data || []) as Product[];
      setAllProducts(products);
      setItems(products.map(p => ({
        product_id: p.id,
        product_name: p.name_cn,
        product_code: p.code,
        selected: false,
        size: p.price_10ml ? '10ml' : (p.price_5ml ? '5ml' : ''),
        quantity: 1,
        unit_price: p.price_10ml || p.price_5ml || 0,
        base_cost: (p.total_cost || 0) / 10,
        series_code: p.series_code,
      })));
    } catch (e: any) {
      console.error('加载产品失败:', e);
    } finally {
      setLoading(false);
    }
  };

  const seriesCodes = useMemo(() => {
    const set = new Set(allProducts.map(p => p.series_code).filter(Boolean));
    return ['yuan', 'he', 'sheng', 'jing'].filter(s => set.has(s));
  }, [allProducts]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (seriesFilter !== 'all' && item.series_code !== seriesFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return item.product_name.toLowerCase().includes(q) || item.product_code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, seriesFilter, search]);

  const toggleSelect = (productId: string) => {
    setItems(prev => prev.map(item =>
      item.product_id === productId ? { ...item, selected: !item.selected } : item
    ));
  };

  const selectAll = () => {
    const filteredIds = new Set(filteredItems.map(i => i.product_id));
    const allSelected = filteredItems.every(i => i.selected);
    setItems(prev => prev.map(item =>
      filteredIds.has(item.product_id) ? { ...item, selected: !allSelected } : item
    ));
  };

  const updateItem = (productId: string, updates: Partial<OutboundItem>) => {
    setItems(prev => prev.map(item =>
      item.product_id === productId ? { ...item, ...updates } : item
    ));
  };

  const selectedItems = items.filter(i => i.selected && i.quantity > 0);

  const getAvailableSizes = (product: Product): { size: string; price: number }[] => {
    const sizes: { size: string; price: number }[] = [];
    if (product.price_5ml) sizes.push({ size: '5ml', price: product.price_5ml });
    if (product.price_10ml) sizes.push({ size: '10ml', price: product.price_10ml });
    if (product.price_15ml) sizes.push({ size: '15ml', price: product.price_15ml });
    if (product.price_30ml) sizes.push({ size: '30ml', price: product.price_30ml });
    if (product.price_50ml) sizes.push({ size: '50ml', price: product.price_50ml });
    if (product.price_100ml) sizes.push({ size: '100ml', price: product.price_100ml });
    if (product.price_piece) sizes.push({ size: '瓶', price: product.price_piece });
    return sizes;
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) return alert('请至少选择一件产品');
    setSubmitting(true);
    try {
      // 1. 创建需求单
      const totalAmount = selectedItems.reduce((s, i) => s + i.unit_price * i.quantity, 0);
      const { data: order, error: orderErr } = await supabase
        .from('cart_orders')
        .insert({
          customer_name: customerName || '后台出库',
          contact_phone: customerPhone || '',
          contact_wechat: customerWechat || '',
          notes: notes || '',
          source: 'backend',
          total_amount: totalAmount,
          status: 'completed',
        })
        .select()
        .single();
      if (orderErr) throw orderErr;

      // 2. 批量创建明细
      const orderItems = selectedItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        size: item.size,
        quantity: item.quantity,
        unit_price: item.unit_price,
        base_cost: item.base_cost || 0,
        subtotal: item.unit_price * item.quantity,
      }));
      const { error: itemsErr } = await supabase
        .from('cart_order_items')
        .insert(orderItems);
      if (itemsErr) throw itemsErr;

      // 3. 写入销售记录（出库）
      const salesRecords = selectedItems.map(item => ({
        product_id: item.product_id,
        sale_date: new Date().toISOString().split('T')[0],
        volume_ml: item.size === '瓶' ? 0 : parseFloat(item.size) || 0,
        sale_price: item.unit_price,
        total_amount: item.unit_price * item.quantity,
        notes: `批量出库 - ${customerName || '无名'} - ${order.id.slice(0, 8)}`,
      }));
      const { error: salesErr } = await supabase
        .from('sales_records')
        .insert(salesRecords);
      if (salesErr) throw salesErr;

      // 4. 更新需求单总金额
      await supabase
        .from('cart_orders')
        .update({ total_amount: totalAmount })
        .eq('id', order.id);

      setDone(true);
      setTimeout(() => {
        setDone(false);
        // 重置
        setItems(prev => prev.map(i => ({ ...i, selected: false, quantity: 1 })));
        setCustomerName('');
        setCustomerPhone('');
        setCustomerWechat('');
        setNotes('');
      }, 2500);
    } catch (e: any) {
      alert('出库失败: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4A7C59]/10 flex items-center justify-center">
            <Download size={20} style={{ color: C.green }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1A2E1A]">批量出库</h1>
            <p className="text-[11px]" style={{ color: C.muted }}>
              已选 {selectedItems.length} 件 · 合计 ¥{selectedItems.reduce((s, i) => s + i.unit_price * i.quantity, 0)}
            </p>
          </div>
        </div>
        <button onClick={loadProducts} className="p-2 rounded-xl hover:bg-[#EEF4EF] transition-colors" title="刷新产品">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} style={{ color: '#5C725C' }} />
        </button>
      </div>

      {done && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
          <Check size={14} /> 出库成功！已生成需求单并写入销售记录
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 左侧：产品选择区（占2列） */}
        <div className="lg:col-span-2 space-y-3">
          {/* 搜索 + 筛选 */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E0ECE0] rounded-xl flex-1 max-w-xs">
              <Search size={13} style={{ color: C.muted }} />
              <input type="text" placeholder="搜索产品..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full text-xs outline-none bg-transparent" style={{ color: C.dark }} />
              {search && <button onClick={() => setSearch('')}><X size={12} style={{ color: C.muted }} /></button>}
            </div>
            <div className="flex gap-1 bg-[#F0F5F0] rounded-xl p-1">
              <button onClick={() => setSeriesFilter('all')}
                className={`px-2.5 py-1 text-[10px] font-medium rounded-lg transition-all ${seriesFilter === 'all' ? 'bg-white shadow-sm' : ''}`}
                style={{ color: seriesFilter === 'all' ? C.dark : C.muted }}>全部</button>
              {seriesCodes.map(s => (
                <button key={s} onClick={() => setSeriesFilter(s)}
                  className={`px-2.5 py-1 text-[10px] font-medium rounded-lg transition-all ${seriesFilter === s ? 'bg-white shadow-sm' : ''}`}
                  style={{ color: seriesFilter === s ? C.green : C.muted }}>{s === 'yuan' ? '元' : s === 'he' ? '和' : s === 'sheng' ? '生' : '香'}</button>
              ))}
            </div>
            <button onClick={selectAll}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-medium transition-colors"
              style={{ color: C.green, backgroundColor: C.light }}>
              {filteredItems.every(i => i.selected) ? <CheckSquare size={12} /> : <Square size={12} />}
              {filteredItems.every(i => i.selected) ? '取消全选' : '全选'}
            </button>
          </div>

          {/* 产品列表 */}
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin" style={{ color: C.green }} /></div>
          ) : (
            <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
              {filteredItems.map(item => {
                const product = allProducts.find(p => p.id === item.product_id);
                const sizes = product ? getAvailableSizes(product) : [];

                return (
                  <div key={item.product_id}
                    className={`rounded-xl border transition-all ${item.selected ? 'border-[#4A7C59]/40 bg-[#F0F8F2]' : 'border-[#E0ECE0] bg-white hover:bg-[#FAFCFA]'}`}>
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      {/* 复选框 */}
                      <button onClick={() => toggleSelect(item.product_id)}
                        className="flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                        style={{ borderColor: item.selected ? C.green : '#D0DDD0', backgroundColor: item.selected ? C.green : 'transparent' }}>
                        {item.selected && <Check size={12} className="text-white" />}
                      </button>

                      {/* 产品信息 */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: C.dark }}>{item.product_name}</p>
                        <p className="text-[10px] font-mono" style={{ color: C.muted }}>{item.product_code}</p>
                      </div>

                      {/* 展开后的配置行 */}
                      {item.selected && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* 规格选择 */}
                          <select value={item.size} onChange={e => {
                            const selectedProduct = allProducts.find(p => p.id === item.product_id);
                            const selectedSize = sizes.find(s => s.size === e.target.value);
                            updateItem(item.product_id, {
                              size: e.target.value,
                              unit_price: selectedSize?.price || 0,
                            });
                          }}
                            className="px-2 py-1.5 text-[10px] bg-white border border-[#E0ECE0] rounded-lg outline-none"
                            style={{ color: C.dark }}>
                            {sizes.map(s => <option key={s.size} value={s.size}>{s.size} ¥{s.price}</option>)}
                            {sizes.length === 0 && <option value="">无规格</option>}
                          </select>

                          {/* 数量 */}
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateItem(item.product_id, { quantity: Math.max(1, item.quantity - 1) })}
                              className="w-6 h-6 rounded-full flex items-center justify-center border transition-colors disabled:opacity-30"
                              style={{ borderColor: '#E0ECE0', color: '#5C725C' }} disabled={item.quantity <= 1}>
                              <Minus size={10} />
                            </button>
                            <input type="number" value={item.quantity}
                              onChange={e => updateItem(item.product_id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                              className="w-10 text-center text-xs font-medium bg-transparent outline-none" style={{ color: C.dark }} />
                            <button onClick={() => updateItem(item.product_id, { quantity: item.quantity + 1 })}
                              className="w-6 h-6 rounded-full flex items-center justify-center border transition-colors"
                              style={{ borderColor: '#E0ECE0', color: '#5C725C' }}>
                              <Plus size={10} />
                            </button>
                          </div>

                          {/* 售价（可编辑） */}
                          <input type="number" value={item.unit_price}
                            onChange={e => updateItem(item.product_id, { unit_price: parseFloat(e.target.value) || 0 })}
                            className="w-16 text-right text-xs font-medium bg-white border border-[#E0ECE0] rounded-lg px-2 py-1 outline-none"
                            style={{ color: C.green }} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredItems.length === 0 && (
                <p className="text-center py-12 text-xs" style={{ color: C.muted }}>没有匹配的产品</p>
              )}
            </div>
          )}
        </div>

        {/* 右侧：客户信息 + 提交 */}
        <div className="space-y-4">
          {/* 客户信息 */}
          <div className="bg-white rounded-xl border border-[#E0ECE0] p-4 space-y-3">
            <h3 className="text-xs font-bold" style={{ color: C.dark }}>
              <User size={13} className="inline mr-1.5" style={{ color: C.green }} />
              客户信息
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E0ECE0] rounded-xl">
                <User size={12} style={{ color: C.muted }} />
                <input type="text" placeholder="客户姓名（选填）" value={customerName} onChange={e => setCustomerName(e.target.value)}
                  className="flex-1 text-xs outline-none bg-transparent" style={{ color: C.dark }} />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E0ECE0] rounded-xl">
                <Phone size={12} style={{ color: C.muted }} />
                <input type="tel" placeholder="电话（选填）" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                  className="flex-1 text-xs outline-none bg-transparent" style={{ color: C.dark }} />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E0ECE0] rounded-xl">
                <MessageCircle size={12} style={{ color: C.muted }} />
                <input type="text" placeholder="微信（选填）" value={customerWechat} onChange={e => setCustomerWechat(e.target.value)}
                  className="flex-1 text-xs outline-none bg-transparent" style={{ color: C.dark }} />
              </div>
              <div className="flex items-start gap-2 px-3 py-2 bg-white border border-[#E0ECE0] rounded-xl">
                <FileText size={12} style={{ color: C.muted, marginTop: 2 }} />
                <textarea placeholder="备注（选填）" value={notes} onChange={e => setNotes(e.target.value)}
                  className="flex-1 text-xs outline-none bg-transparent resize-none h-16" style={{ color: C.dark }} />
              </div>
            </div>
          </div>

          {/* 已选清单 */}
          <div className="bg-white rounded-xl border border-[#E0ECE0] p-4 space-y-2">
            <h3 className="text-xs font-bold" style={{ color: C.dark }}>
              <ShoppingBag size={13} className="inline mr-1.5" style={{ color: C.green }} />
              出库清单（{selectedItems.length} 项）
            </h3>
            {selectedItems.length === 0 ? (
              <p className="text-[10px] text-center py-4" style={{ color: C.muted }}>请在左侧选择产品</p>
            ) : (
              <div className="max-h-[200px] overflow-y-auto space-y-1">
                {selectedItems.map(item => (
                  <div key={item.product_id} className="flex items-center justify-between text-[10px] px-2 py-1.5 rounded-lg" style={{ backgroundColor: C.bg }}>
                    <span className="truncate flex-1" style={{ color: C.dark }}>{item.product_name}</span>
                    <span className="mx-2" style={{ color: C.muted }}>{item.size}×{item.quantity}</span>
                    <span className="font-medium" style={{ color: C.green }}>¥{item.unit_price * item.quantity}</span>
                  </div>
                ))}
              </div>
            )}
            {selectedItems.length > 0 && (
              <div className="flex items-center justify-between pt-2 border-t text-xs font-bold" style={{ borderColor: '#E0ECE0' }}>
                <span style={{ color: C.dark }}>合计</span>
                <span style={{ color: C.green }}>¥{selectedItems.reduce((s, i) => s + i.unit_price * i.quantity, 0)}</span>
              </div>
            )}
          </div>

          {/* 提交按钮 */}
          <button onClick={handleSubmit} disabled={selectedItems.length === 0 || submitting}
            className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wider text-white transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${C.green}, #5E9470)` }}>
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {submitting ? '出库中...' : `确认出库（${selectedItems.length} 件）`}
          </button>

          <p className="text-[9px] text-center" style={{ color: C.muted }}>
            出库后自动生成需求单并写入销售记录
          </p>
        </div>
      </div>
    </div>
  );
}
