/**
 * UNIO AROMA 后台需求单管理页面
 * 
 * 功能：
 * - 列表显示所有需求单（按时间倒序）
 * - 状态筛选（全部/待处理/已联系/已完成/已取消）
 * - 展开详情查看明细（含底价）
 * - 编辑客户信息 + 修改状态
 * - 删除需求单
 * 
 * 风格：匹配后台现有配色 — 绿色系 #4A7C59
 */
import React, { useState, useEffect } from 'react';
import {
  ShoppingBag, Search, X, ChevronDown, ChevronUp, Loader2, Phone, MessageCircle, User,
  CheckCircle, Clock, AlertCircle, Trash2, Edit3, Save, FileText,
  RefreshCw, Layers
} from 'lucide-react';
import { cartOrderService } from '../../lib/dataService';
import { CartOrder, CartOrderItem } from '../../lib/database.types';

// ===== 状态配置 =====
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending:    { label: '待处理',   color: '#B8860B', bg: '#FFFAE6', icon: Clock },
  contacted:  { label: '已联系',   color: '#4A7C59', bg: '#E8F3EC', icon: CheckCircle },
  completed:  { label: '已完成',   color: '#2E5E3E', bg: '#DCEDE2', icon: CheckCircle },
  cancelled:  { label: '已取消',   color: '#9AAA9A', bg: '#F0F2F0', icon: AlertCircle },
};

const STATUS_ORDER = ['pending', 'contacted', 'completed', 'cancelled'];

export default function CartOrders() {
  const [orders, setOrders] = useState<CartOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ customer_name: string; contact_phone: string; contact_wechat: string; notes: string }>({
    customer_name: '', contact_phone: '', contact_wechat: '', notes: '',
  });
  const [saving, setSaving] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      let data: CartOrder[];
      if (statusFilter === 'all') {
        data = await cartOrderService.getAll();
      } else {
        data = await cartOrderService.getByStatus(statusFilter);
      }
      setOrders(data);
    } catch (e: any) {
      setError(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, [statusFilter]);

  const filtered = orders.filter(o => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (o.customer_name || '').toLowerCase().includes(q) ||
        (o.contact_phone || '').toLowerCase().includes(q) ||
        (o.contact_wechat || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await cartOrderService.update(id, { status: newStatus as any });
      loadOrders();
    } catch (e: any) {
      alert('状态更新失败: ' + e.message);
    }
  };

  const startEdit = (order: CartOrder) => {
    setEditingId(order.id);
    setEditForm({
      customer_name: order.customer_name || '',
      contact_phone: order.contact_phone || '',
      contact_wechat: order.contact_wechat || '',
      notes: order.notes || '',
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await cartOrderService.update(editingId, editForm);
      setEditingId(null);
      loadOrders();
    } catch (e: any) {
      alert('保存失败: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除此需求单？此操作不可撤销。')) return;
    try {
      await cartOrderService.delete(id);
      loadOrders();
    } catch (e: any) {
      alert('删除失败: ' + e.message);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4A7C59]/10 flex items-center justify-center">
            <ShoppingBag size={20} style={{ color: '#4A7C59' }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1A2E1A]">需求单管理</h1>
            <p className="text-[11px] text-[#9AAA9A]">共 {filtered.length} 条 / 总 {orders.length} 条</p>
          </div>
        </div>
        <button onClick={loadOrders} className="p-2 rounded-xl hover:bg-[#EEF4EF] transition-colors" title="刷新">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} style={{ color: '#5C725C' }} />
        </button>
      </div>

      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* 状态筛选 */}
        <div className="flex items-center gap-1 bg-[#F0F5F0] rounded-xl p-1">
          <button onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${statusFilter === 'all' ? 'bg-white shadow-sm text-[#1A2E1A]' : 'text-[#6B856B] hover:text-[#1A2E1A]'}`}>
            全部
          </button>
          {STATUS_ORDER.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${statusFilter === s ? 'bg-white shadow-sm' : 'text-[#6B856B] hover:text-[#1A2E1A]'}`}
              style={statusFilter === s ? { color: STATUS_CONFIG[s].color } : {}}>
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>

        {/* 搜索 */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E0ECE0] rounded-xl">
            <Search size={13} style={{ color: '#9AAA9A' }} />
            <input type="text" placeholder="搜索客户..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-32 lg:w-48 text-xs outline-none bg-transparent" style={{ color: '#1A2E1A' }} />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-0.5 rounded hover:bg-[#EEF4EF]">
                <X size={12} style={{ color: '#9AAA9A' }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4">{error}</div>
      )}

      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin" style={{ color: '#4A7C59' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FileText size={40} className="mx-auto mb-3" style={{ color: '#D0DDD0' }} />
          <p className="text-sm font-medium" style={{ color: '#9AAA9A' }}>暂无需求单</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(order => {
            const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = sc.icon;
            const isExpanded = expandedId === order.id;
            const isEditing = editingId === order.id;
            const items = (order as any).items as CartOrderItem[] | undefined;

            return (
              <div key={order.id} className="bg-white rounded-xl border border-[#E0ECE0] overflow-hidden transition-all">
                {/* 主行 */}
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#FAFCFA] transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                  {/* 展开箭头 */}
                  <button className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: '#F0F5F0' }}>
                    {isExpanded ? <ChevronUp size={12} style={{ color: '#5C725C' }} /> : <ChevronDown size={12} style={{ color: '#5C725C' }} />}
                  </button>

                  {/* 客户信息 */}
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: order.source === 'backend' ? '#5C725C' : '#4A7C59' }}>
                      {(order.customer_name || '?')[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#1A2E1A' }}>
                        {order.customer_name || '未留名'}
                        {order.source === 'backend' && <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#E8F3EC', color: '#4A7C59' }}>后台</span>}
                      </p>
                      <p className="text-[10px]" style={{ color: '#9AAA9A' }}>
                        {order.contact_phone || order.contact_wechat || '无联系方式'}
                      </p>
                    </div>
                  </div>

                  {/* 产品数 + 总金额 */}
                  <div className="hidden sm:flex items-center gap-4 text-xs">
                    {items && <span style={{ color: '#6B856B' }}>{items.length} 件</span>}
                    <span className="font-bold" style={{ color: '#4A7C59' }}>¥{order.total_amount || 0}</span>
                  </div>

                  {/* 状态徽章 */}
                  <div className={`px-2.5 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1`}
                    style={{ backgroundColor: sc.bg, color: sc.color }}>
                    <StatusIcon size={10} />
                    {sc.label}
                  </div>

                  {/* 来源 */}
                  <span className="text-[9px] px-2 py-0.5 rounded-full hidden lg:inline" style={{ backgroundColor: '#F0F5F0', color: '#9AAA9A' }}>
                    {order.source === 'frontend' ? '前台' : '后台出库'}
                  </span>

                  {/* 时间 */}
                  <span className="text-[10px] hidden lg:block" style={{ color: '#B0C0B0' }}>
                    {new Date(order.created_at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* 展开详情区 */}
                {isExpanded && (
                  <div className="border-t px-4 py-4 space-y-4" style={{ borderColor: '#E0ECE0', backgroundColor: '#FAFCFA' }}>
                    {/* 客户信息编辑 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-bold tracking-wider uppercase" style={{ color: '#6B856B' }}>客户信息</h4>
                        {!isEditing ? (
                          <button onClick={() => startEdit(order)}
                            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg transition-colors"
                            style={{ color: '#5C725C', backgroundColor: '#EEF4EF' }}>
                            <Edit3 size={10} /> 编辑
                          </button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button onClick={saveEdit} disabled={saving}
                              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg text-white transition-colors"
                              style={{ backgroundColor: '#4A7C59' }}>
                              {saving ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
                              保存
                            </button>
                            <button onClick={() => setEditingId(null)}
                              className="text-[10px] px-2 py-1 rounded-lg transition-colors"
                              style={{ color: '#9AAA9A', backgroundColor: '#F0F2F0' }}>
                              取消
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { icon: User, label: '姓名', field: 'customer_name', value: order.customer_name || '-' },
                          { icon: Phone, label: '电话', field: 'contact_phone', value: order.contact_phone || '-' },
                          { icon: MessageCircle, label: '微信', field: 'contact_wechat', value: order.contact_wechat || '-' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-[#E0ECE0]">
                            <item.icon size={12} style={{ color: '#9AAA9A' }} />
                            <div className="min-w-0 flex-1">
                              <span className="block text-[8px] font-medium uppercase tracking-wider" style={{ color: '#B0C0B0' }}>{item.label}</span>
                              {isEditing ? (
                                <input type="text" value={(editForm as any)[item.field]} onChange={e => setEditForm({ ...editForm, [item.field]: e.target.value })}
                                  className="w-full text-xs bg-transparent outline-none" style={{ color: '#1A2E1A' }} />
                              ) : (
                                <span className="text-xs font-medium truncate block" style={{ color: '#1A2E1A' }}>{item.value}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 备注 */}
                      <div className="px-3 py-2 bg-white rounded-xl border border-[#E0ECE0]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <FileText size={11} style={{ color: '#9AAA9A' }} />
                          <span className="text-[8px] font-medium uppercase tracking-wider" style={{ color: '#B0C0B0' }}>备注</span>
                        </div>
                        {isEditing ? (
                          <textarea value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                            className="w-full text-xs bg-transparent outline-none resize-none h-14" style={{ color: '#1A2E1A' }} />
                        ) : (
                          <p className="text-xs" style={{ color: order.notes ? '#1A2E1A' : '#C8D0C8' }}>{order.notes || '无备注'}</p>
                        )}
                      </div>
                    </div>

                    {/* 明细表 */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold tracking-wider uppercase" style={{ color: '#6B856B' }}>
                        <Layers size={11} className="inline mr-1" />
                        需求明细（{items?.length || 0} 项）
                      </h4>

                      {/* 桌面表格 */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-[11px]">
                          <thead>
                            <tr style={{ color: '#6B856B', borderBottom: '1px solid #E0ECE0' }}>
                              <th className="text-left py-2 px-2 font-medium">产品名称</th>
                              <th className="text-center py-2 px-2 font-medium">规格</th>
                              <th className="text-center py-2 px-2 font-medium">数量</th>
                              <th className="text-right py-2 px-2 font-medium">售价</th>
                              <th className="text-right py-2 px-2 font-medium">底价</th>
                              <th className="text-right py-2 px-2 font-medium">小计</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items?.map(item => (
                              <tr key={item.id} style={{ borderBottom: '1px solid #F0F5F0' }}>
                                <td className="py-2.5 px-2 font-medium" style={{ color: '#1A2E1A' }}>{item.product_name}</td>
                                <td className="py-2.5 px-2 text-center" style={{ color: '#6B856B' }}>{item.size}</td>
                                <td className="py-2.5 px-2 text-center" style={{ color: '#1A2E1A' }}>{item.quantity}</td>
                                <td className="py-2.5 px-2 text-right" style={{ color: '#1A2E1A' }}>¥{item.unit_price}</td>
                                <td className="py-2.5 px-2 text-right font-mono" style={{ color: '#B8860B' }}>¥{item.base_cost || 0}</td>
                                <td className="py-2.5 px-2 text-right font-bold" style={{ color: '#4A7C59' }}>¥{item.subtotal}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* 移动端卡片 */}
                      <div className="sm:hidden space-y-1.5">
                        {items?.map(item => (
                          <div key={item.id} className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-[#E0ECE0] text-[11px]">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate" style={{ color: '#1A2E1A' }}>{item.product_name}</p>
                              <p style={{ color: '#9AAA9A' }}>{item.size} × {item.quantity}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-medium" style={{ color: '#4A7C59' }}>¥{item.subtotal}</p>
                              <p className="text-[9px]" style={{ color: '#B8860B' }}>底价 ¥{item.base_cost || 0}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 合计 */}
                      <div className="flex items-center justify-end gap-4 px-3 py-2 bg-white rounded-xl border border-[#E0ECE0] text-xs">
                        <span style={{ color: '#6B856B' }}>合计</span>
                        <span className="font-bold text-base" style={{ color: '#4A7C59' }}>¥{order.total_amount || 0}</span>
                      </div>
                    </div>

                    {/* 底栏操作 */}
                    <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: '#E0ECE0' }}>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px]" style={{ color: '#B0C0B0' }}>
                          创建于 {new Date(order.created_at).toLocaleString('zh-CN')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* 状态变更按钮 */}
                        {STATUS_ORDER.map(s => {
                          if (s === order.status) return null;
                          const sc2 = STATUS_CONFIG[s];
                          return (
                            <button key={s} onClick={() => handleStatusChange(order.id, s)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all hover:opacity-80"
                              style={{ backgroundColor: sc2.bg, color: sc2.color }}>
                              <sc2.icon size={10} />
                              {sc2.label}
                            </button>
                          );
                        })}
                        <button onClick={() => handleDelete(order.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all"
                          style={{ color: '#C85050', backgroundColor: '#FFF0F0' }}>
                          <Trash2 size={10} />
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
