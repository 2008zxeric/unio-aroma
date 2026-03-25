import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // 使用兼容性更好的导入
import { 
  Package, Search, Plus, Minus, History, Settings, 
  TrendingUp, TrendingDown, DollarSign, PieChart, 
  ChevronRight, Filter, Download, Save, Trash2, 
  AlertTriangle, ArrowLeft, LogOut, Lock, User,
  CheckCircle2, Info, MoreHorizontal, Eye, Edit3, X
} from 'lucide-react';
import { 
  InventoryProduct, 
  Transaction, 
  INITIAL_STOCK_DATA 
} from '../constants/inventory';

type Tab = 'dashboard' | 'products' | 'history' | 'settings';
type ProductViewMode = 'stock' | 'price';
type AdminUser = '管理员 A' | '管理员 B' | '管理员 C';

const ADMIN_USERS: AdminUser[] = ['管理员 A', '管理员 B', '管理员 C'];

const InventoryApp: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  // --- 状态管理 ---
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [productViewMode, setProductViewMode] = useState<ProductViewMode>('stock');
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const stored = sessionStorage.getItem('unio_inventory_user');
    if (stored) {
      try { return JSON.parse(stored) as AdminUser; } catch (e) { return stored as AdminUser; }
    }
    return null;
  });
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLocked, setIsLocked] = useState(() => {
    return sessionStorage.getItem('unio_inventory_auth') !== 'true';
  });
  const [accessCode, setAccessCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'lowStock'>('all');

  // 弹窗状态
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'purchase' | 'sale'>('purchase');
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);

  const storedCode = "8888"; // 默认访问码

  // --- 初始化数据 ---
  useEffect(() => {
    const savedProducts = localStorage.getItem('unio_products');
    const savedTransactions = localStorage.getItem('unio_transactions');
    
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    else setProducts(INITIAL_STOCK_DATA);

    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
  }, []);

  useEffect(() => {
    if (products.length > 0) localStorage.setItem('unio_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    if (transactions.length > 0) localStorage.setItem('unio_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // --- 处理函数 ---
  const handleUnlock = () => {
    if (!selectedUser) { alert('请先选择管理员'); return; }
    if (accessCode === storedCode) {
      setIsLocked(false);
      setCurrentUser(selectedUser);
      sessionStorage.setItem('unio_inventory_auth', 'true');
      sessionStorage.setItem('unio_inventory_user', JSON.stringify(selectedUser));
      setAccessCode('');
    } else {
      alert('密码错误');
      setAccessCode('');
    }
  };

  const handleTransaction = (productId: string, quantity: number, price: number, note: string, customerType?: 'B' | 'C') => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: transactionType,
      productId,
      productName: product.name,
      quantity,
      unit: product.unit,
      price,
      customerType,
      note,
      performedBy: currentUser || '未知'
    };

    setTransactions([newTransaction, ...transactions]);
    setProducts(products.map(p => {
      if (p.id === productId) {
        return { ...p, stock: transactionType === 'purchase' ? p.stock + quantity : p.stock - quantity };
      }
      return p;
    }));

    setIsTransactionModalOpen(false);
    setSelectedProduct(null);
  };

  // --- 统计数据 ---
  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.price, 0);
    const expense = transactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.price, 0);
    const value = products.reduce((sum, p) => sum + (p.stock * (p.cost10ml || p.cost1L || 0)), 0);
    const lowStockCount = products.filter(p => p.stock <= 10).length;

    return { income, expense, profit: income - expense, value, lowStockCount };
  }, [transactions, products]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (p.enName && p.enName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesStock = stockFilter === 'all' || p.stock <= 10;
    return matchesSearch && matchesCategory && matchesStock;
  });

  // --- 登录界面 ---
  if (isLocked) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm space-y-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl">
              <Lock size={32} />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">库存管理系统</h2>
            <p className="text-slate-400 text-sm">请选择人员并输入访问代码</p>
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">选择登录人员</p>
              <div className="grid grid-cols-3 gap-2">
                {ADMIN_USERS.map(user => (
                  <button key={user} onClick={() => setSelectedUser(user)}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                      selectedUser === user ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100'
                    }`}
                  >
                    {user.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <input type="password" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} placeholder="访问代码"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#4CAF80]/20"
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              />
              <button onClick={handleUnlock} className="w-full py-4 bg-[#4CAF80] text-white rounded-2xl font-bold text-lg shadow-lg shadow-[#4CAF80]/20">
                解锁系统
              </button>
            </div>
          </div>
          <button onClick={onBack} className="text-slate-400 text-sm hover:text-slate-600">返回官网</button>
        </motion.div>
      </div>
    );
  }

  // --- 主界面 ---
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-24">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4CAF80] rounded-xl flex items-center justify-center text-white">
            <Package size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">UNIO Inventory</h1>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Internal Management</p>
              <span className="w-1 h-1 bg-slate-200 rounded-full" />
              <p className="text-[10px] text-[#4CAF80] font-bold">{currentUser}</p>
            </div>
          </div>
        </div>
        <button onClick={() => { setIsLocked(true); setCurrentUser(null); sessionStorage.removeItem('unio_inventory_auth'); sessionStorage.removeItem('unio_inventory_user'); }}
          className="p-2 text-slate-400 hover:text-slate-600 flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 hidden sm:block">退出登录</span>
          <Lock size={20} />
        </button>
      </header>

      {/* 内容区域 */}
      <main className="p-6 max-w-lg mx-auto space-y-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-red-500">
                    <TrendingDown size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">累计支出</span>
                  </div>
                  <p className="text-2xl font-bold">¥{stats.expense.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-[#4CAF80]">
                    <TrendingUp size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">累计收入</span>
                  </div>
                  <p className="text-2xl font-bold">¥{stats.income.toLocaleString()}</p>
                </div>
                <div className="bg-[#4CAF80] p-6 rounded-[2rem] shadow-lg shadow-[#4CAF80]/20 text-white space-y-2 col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 opacity-80">
                      <DollarSign size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">当前利润</span>
                    </div>
                    <PieChart size={16} className="opacity-60" />
                  </div>
                  <p className="text-4xl font-bold">¥{stats.profit.toLocaleString()}</p>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-60">
                    <span>库存总值</span>
                    <span>¥{stats.value.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 低库存预警 */}
              {stats.lowStockCount > 0 && (
                <button onClick={() => { setActiveTab('products'); setStockFilter('lowStock'); setProductViewMode('stock'); }}
                  className="w-full flex items-center justify-between p-5 bg-red-50 border border-red-100 rounded-3xl group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center">
                      <AlertTriangle size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-red-600">{stats.lowStockCount} 个产品库存不足</p>
                      <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">点击查看详情</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-red-300 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { setTransactionType('purchase'); setIsTransactionModalOpen(true); }}
                  className="flex flex-col items-center justify-center gap-3 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:bg-slate-50">
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center"><Plus size={24} /></div>
                  <span className="font-bold text-sm">录入进货</span>
                </button>
                <button onClick={() => { setTransactionType('sale'); setIsTransactionModalOpen(true); }}
                  className="flex flex-col items-center justify-center gap-3 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:bg-slate-50">
                  <div className="w-12 h-12 bg-[#4CAF80]/10 text-[#4CAF80] rounded-full flex items-center justify-center"><Minus size={24} /></div>
                  <span className="font-bold text-sm">录入销售</span>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div key="products" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="text" placeholder="搜索产品..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4CAF80]/10"
                  />
                </div>
                <div className="flex gap-2 p-1 bg-white rounded-2xl border border-slate-100">
                  <button onClick={() => setProductViewMode('stock')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${productViewMode === 'stock' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>库存管理</button>
                  <button onClick={() => setProductViewMode('price')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${productViewMode === 'price' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>价目查询</button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-[#4CAF80] bg-[#4CAF80]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">{product.id}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.category}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
                        {product.enName && <p className="text-xs text-slate-400 font-medium italic">{product.enName}</p>}
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${product.stock <= 10 ? 'text-red-500' : 'text-slate-900'}`}>{product.stock}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.unit}</p>
                      </div>
                    </div>
                    {productViewMode === 'price' && (
                      <div className="pt-4 border-t border-slate-50 space-y-2">
                        {product.specifications.map((spec, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">{spec.size}</span>
                            <span className="font-bold text-slate-900">¥{spec.priceC}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">操作流水</h2>
                <button onClick={() => { const data = JSON.stringify({ products, transactions }, null, 2); const blob = new Blob([data], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `unio_backup_${new Date().toISOString().split('T')[0]}.json`; a.click(); }}
                  className="p-2 text-[#4CAF80] hover:bg-[#4CAF80]/10 rounded-xl transition-colors"><Download size={20} /></button>
              </div>
              <div className="space-y-4">
                {transactions.map(t => (
                  <div key={t.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'purchase' ? 'bg-red-50 text-red-500' : 'bg-[#4CAF80]/10 text-[#4CAF80]'}`}>
                      {t.type === 'purchase' ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-sm">{t.productName}</h4>
                        <span className="text-xs font-bold">¥{t.price.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>{t.type === 'purchase' ? '进货' : '销售'} {t.quantity}{t.unit}</span>
                        <span>操作人: {t.performedBy}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 z-40">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          {[
            { id: 'dashboard', icon: TrendingUp, label: '概览' },
            { id: 'products', icon: Package, label: '库存' },
            { id: 'history', icon: History, label: '流水' },
            { id: 'settings', icon: Settings, label: '设置' }
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as Tab)}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-[#4CAF80]' : 'text-slate-300 hover:text-slate-400'}`}>
              <item.icon size={22} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* 录入弹窗 */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="w-full max-w-md bg-white rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">{transactionType === 'purchase' ? '录入进货' : '录入销售'}</h3>
              <button onClick={() => setIsTransactionModalOpen(false)} className="p-2 text-slate-400"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" onChange={(e) => setSelectedProduct(products.find(p => p.id === e.target.value) || null)}>
                <option value="">选择产品...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="数量" className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" id="t-qty" />
                <input type="number" placeholder="总金额" className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" id="t-price" />
              </div>
              <button onClick={() => {
                const qty = Number((document.getElementById('t-qty') as HTMLInputElement).value);
                const price = Number((document.getElementById('t-price') as HTMLInputElement).value);
                if (selectedProduct && qty && price) handleTransaction(selectedProduct.id, qty, price, '');
              }} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">确认提交</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default InventoryApp;
