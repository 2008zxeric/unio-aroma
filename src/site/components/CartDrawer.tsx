/**
 * UNIO AROMA 前台购物车侧边栏组件
 * 
 * 从右侧滑入，显示购物车内容
 * 支持：增删改数量、提交需求单、清空
 * 完全匹配品牌风格：黑金红 + 大量留白
 */
import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, Plus, Minus, Trash2, Send, Check, ChevronRight, Loader2, MessageCircle } from 'lucide-react';
import { CartItem, getCart, updateCartItemQuantity, removeCartItem, clearCart, getCartTotal } from '../cartStore';
import { supabase } from '../../lib/supabase';

// ===== 品牌色 =====
const C = {
  red: '#D75437',
  gold: '#D4AF37',
  dark: '#1A1A1A',
  cream: '#F8F6F3',
  warm: '#FAFAF8',
  line: 'rgba(26,26,26,0.06)',
};

// ===== 提交表单 Props =====
interface SubmitFormProps {
  items: CartItem[];
  total: number;
  onClose: () => void;
  onSuccess: () => void;
}

function SubmitForm({ items, total, onClose, onSuccess }: SubmitFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [wechat, setWechat] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim() && !phone.trim() && !wechat.trim()) {
      setError('请至少填写姓名、电话或微信中的一项');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      // 1. 创建需求单
      const { data: order, error: orderErr } = await supabase
        .from('cart_orders')
        .insert({
          customer_name: name.trim(),
          contact_phone: phone.trim(),
          contact_wechat: wechat.trim(),
          notes: notes.trim(),
          source: 'frontend',
          total_amount: total,
          status: 'pending',
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      // 2. 批量创建明细
      const orderItems = items.map(item => ({
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

      // 3. 清空购物车
      clearCart();
      setDone(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (e: any) {
      setError(e.message || '提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
          <Check size={32} className="text-green-600" />
        </div>
        <p className="text-sm font-bold" style={{ color: C.dark }}>需求单已提交</p>
        <p className="text-[10px] text-center max-w-[240px]" style={{ color: `${C.dark}45` }}>
          我们会尽快联系您确认订单
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold" style={{ color: C.dark }}>填写联系信息</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5 transition-colors">
          <X size={16} style={{ color: `${C.dark}30` }} />
        </button>
      </div>

      <div className="space-y-2.5 max-h-[200px] overflow-y-auto text-[11px]" style={{ color: `${C.dark}50` }}>
        {items.map((item, i) => (
          <div key={i} className="flex justify-between">
            <span>{item.product_name} × {item.quantity}{item.size}</span>
            <span style={{ color: C.red }}>¥{item.unit_price * item.quantity}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold pt-2 border-t text-sm" style={{ borderColor: C.line, color: C.dark }}>
          <span>合计</span>
          <span style={{ color: C.red }}>¥{total}</span>
        </div>
      </div>

      <div className="space-y-2.5">
        <input type="text" placeholder="姓名" value={name} onChange={e => setName(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs outline-none transition-colors"
          style={{ borderColor: `${C.dark}12`, color: C.dark }}
          onFocus={e => e.target.style.borderColor = C.red}
          onBlur={e => e.target.style.borderColor = `${C.dark}12`} />
        <input type="tel" placeholder="电话" value={phone} onChange={e => setPhone(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs outline-none transition-colors"
          style={{ borderColor: `${C.dark}12`, color: C.dark }}
          onFocus={e => e.target.style.borderColor = C.red}
          onBlur={e => e.target.style.borderColor = `${C.dark}12`} />
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white border rounded-xl text-xs"
          style={{ borderColor: `${C.dark}12`, color: `${C.dark}30` }}>
          <MessageCircle size={12} style={{ color: '#07C160' }} />
          <input type="text" placeholder="微信号（选填）" value={wechat} onChange={e => setWechat(e.target.value)}
            className="flex-1 outline-none bg-transparent" style={{ color: C.dark }} />
        </div>
        <textarea placeholder="备注（选填）" value={notes} onChange={e => setNotes(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs outline-none resize-none h-16 transition-colors"
          style={{ borderColor: `${C.dark}12`, color: C.dark }}
          onFocus={e => e.target.style.borderColor = C.red}
          onBlur={e => e.target.style.borderColor = `${C.dark}12`} />
      </div>

      {error && <p className="text-[10px]" style={{ color: C.red }}>{error}</p>}

      <button onClick={handleSubmit} disabled={submitting}
        className="w-full py-3 rounded-xl font-bold text-xs tracking-wider text-white transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ background: `linear-gradient(135deg, ${C.red}, #E85A3F)` }}>
        {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        {submitting ? '提交中...' : '提交需求单'}
      </button>
    </div>
  );
}

// ===== 购物车抽屉 Props =====
interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showSubmit, setShowSubmit] = useState(false);

  useEffect(() => {
    if (open) {
      setCart(getCart());
      setShowSubmit(false);
    }
  }, [open]);

  const refresh = () => {
    setCart(getCart());
    setShowSubmit(false);
  };

  const total = cart.reduce((s, i) => s + i.unit_price * i.quantity, 0);

  if (!open) return null;

  return (
    <>
      {/* 遮罩 */}
      <div className="fixed inset-0 z-[600] bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* 抽屉 */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[380px] z-[601] bg-white shadow-2xl animate-[slideIn_0.3s_ease] flex flex-col">
        <style>{`
          @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `}</style>

        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: C.line }}>
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} style={{ color: C.red }} />
            <h2 className="text-sm font-bold" style={{ color: C.dark }}>购物车</h2>
            {cart.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: C.red }}>
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button onClick={() => { clearCart(); setCart([]); }}
                className="text-[10px] px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                style={{ color: `${C.dark}35`, backgroundColor: `${C.dark}05` }}>
                <Trash2 size={11} /> 清空
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/5 transition-colors">
              <X size={18} style={{ color: `${C.dark}30` }} />
            </button>
          </div>
        </div>

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3 text-center px-8">
              <ShoppingBag size={40} style={{ color: `${C.dark}10` }} />
              <p className="text-xs" style={{ color: `${C.dark}28` }}>购物车是空的</p>
              <p className="text-[9px]" style={{ color: `${C.dark}18` }}>在产品详情页选择规格加入购物车</p>
            </div>
          ) : (
            <div className="px-4 py-3 space-y-2">
              {cart.map((item, i) => (
                <div key={`${item.product_id}-${item.size}`}
                  className="rounded-xl p-3 flex gap-3 animate-[slideUp_0.25s_ease]"
                  style={{ animationDelay: `${i * 0.03}s`, backgroundColor: C.warm, border: `1px solid ${C.line}` }}>
                  {/* 缩略图 */}
                  <div className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden bg-white" style={{ border: `1px solid ${C.line}` }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px]" style={{ color: `${C.dark}15` }}>{item.product_code}</div>
                    )}
                  </div>
                  {/* 信息 */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between">
                      <p className="text-xs font-bold truncate" style={{ color: C.dark }}>{item.product_name}</p>
                      <button onClick={() => { removeCartItem(item.product_id, item.size); refresh(); }}
                        className="p-0.5 rounded hover:bg-black/5 transition-colors flex-shrink-0 ml-1">
                        <X size={12} style={{ color: `${C.dark}20` }} />
                      </button>
                    </div>
                    <p className="text-[9px]" style={{ color: `${C.dark}35` }}>{item.size}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => {
                          if (item.quantity <= 1) { removeCartItem(item.product_id, item.size); refresh(); }
                          else { updateCartItemQuantity(item.product_id, item.size, item.quantity - 1); refresh(); }
                        }}
                          className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                          style={{ backgroundColor: 'white', border: `1px solid ${C.line}`, color: `${C.dark}40` }}>
                          <Minus size={10} />
                        </button>
                        <span className="text-xs font-medium w-5 text-center" style={{ color: C.dark }}>{item.quantity}</span>
                        <button onClick={() => { updateCartItemQuantity(item.product_id, item.size, item.quantity + 1); refresh(); }}
                          className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                          style={{ backgroundColor: 'white', border: `1px solid ${C.line}`, color: `${C.dark}40` }}>
                          <Plus size={10} />
                        </button>
                      </div>
                      <p className="text-xs font-bold" style={{ color: C.red }}>¥{item.unit_price * item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部 */}
        {cart.length > 0 && (
          <div className="border-t px-5 py-4 space-y-3" style={{ borderColor: C.line }}>
            {showSubmit ? (
              <SubmitForm items={cart} total={total} onClose={() => setShowSubmit(false)} onSuccess={refresh} />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: `${C.dark}45` }}>合计</span>
                  <span className="text-base font-bold" style={{ color: C.red }}>¥{total}</span>
                </div>
                <button onClick={() => setShowSubmit(true)}
                  className="w-full py-3.5 rounded-xl font-bold text-xs tracking-wider text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${C.red}, #E85A3F)` }}>
                  <Send size={14} />
                  提交需求单
                  <ChevronRight size={14} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
