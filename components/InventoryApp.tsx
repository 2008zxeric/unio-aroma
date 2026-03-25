import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  History, 
  Settings, 
  Plus, 
  Minus, 
  Search, 
  AlertTriangle, 
  Download, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  Lock, 
  Unlock,
  ArrowLeft,
  Filter,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  X,
  Save,
  RefreshCw,
  FileJson,
  Edit3,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { 
  InventoryProduct, 
  Transaction, 
  INITIAL_BASE_OILS, 
  INITIAL_ESSENTIAL_OILS, 
  INITIAL_HYDROSOLS,
  INITIAL_STOCK_DATA
} from '../constants/inventory';

type Tab = 'dashboard' | 'products' | 'history' | 'settings';
type ProductViewMode = 'stock' | 'price';
type AdminUser = '管理员 A' | '管理员 B' | '管理员 C';

const ADMIN_USERS: AdminUser[] = ['管理员 A', '管理员 B', '管理员 C'];

const InventoryApp: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [productViewMode, setProductViewMode] = useState<ProductViewMode>('stock');
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const stored = sessionStorage.getItem('unio_inventory_user');
    if (stored) {
      try {
        return JSON.parse(stored) as AdminUser;
      } catch (e) {
        return stored as AdminUser;
      }
    }
    return null;
  });
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLocked, setIsLocked] = useState(() => {
    const sessionAuth = sessionStorage.getItem('unio_inventory_auth');
    return sessionAuth !== 'true';
  });
  const [accessCode, setAccessCode] = useState('');
  const [storedCode, setStoredCode] = useState('unio2026'); // Default code
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  
  // Modals
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'purchase' | 'sale'>('purchase');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'base' | 'essential' | 'hydrosol'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'outOfStock' | 'lowStock'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price'>('name');
  const [lastActivity, setLastActivity] = useState(Date.now());

  // --- Inactivity Timeout ---
  useEffect(() => {
    if (isLocked) return;

    const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      setLastActivity(Date.now());
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsLocked(true);
        onBack(); // Auto exit to home
      }, INACTIVITY_TIMEOUT);
    };

    // Initial timer
    resetTimer();

    // Events to track activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimer();
    
    events.forEach(event => document.addEventListener(event, handleActivity));

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, handleActivity));
    };
  }, [isLocked, onBack]);

  // --- Persistence ---
  useEffect(() => {
    const savedProducts = localStorage.getItem('unio_inventory_products');
    const savedTransactions = localStorage.getItem('unio_inventory_transactions');
    const savedCode = localStorage.getItem('unio_inventory_code');

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      // Initialize with default data
      const allInitial = [...INITIAL_BASE_OILS, ...INITIAL_ESSENTIAL_OILS, ...INITIAL_HYDROSOLS];
      // Apply initial stock from the user's "目前库存" table
      const initialized = allInitial.map(p => {
        const stockItem = INITIAL_STOCK_DATA.find(s => p.name.includes(s.name) || s.name.includes(p.name));
        if (stockItem) {
          return { ...p, stock: stockItem.amount };
        }
        return p;
      });
      setProducts(initialized);
    }

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }

    if (savedCode) {
      setStoredCode(savedCode);
    }
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('unio_inventory_products', JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    localStorage.setItem('unio_inventory_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // --- Handlers ---
  const handleUnlock = () => {
    if (!selectedUser) {
      alert('请先选择管理员');
      return;
    }
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

  // Update session auth when locked (e.g. by timeout)
  useEffect(() => {
    if (isLocked) {
      sessionStorage.removeItem('unio_inventory_auth');
    }
  }, [isLocked]);

  const addTransaction = (data: Omit<Transaction, 'id' | 'date'>, updateProductInfo?: Partial<InventoryProduct>) => {
    const newTransaction: Transaction = {
      ...data,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      performedBy: currentUser || '未知管理员',
    };

    setTransactions([newTransaction, ...transactions]);

    // Update stock and optionally product info
    setProducts(prev => prev.map(p => {
      if (p.id === data.productId) {
        const stockChange = data.type === 'purchase' ? data.amount : -data.amount;
        return { 
          ...p, 
          stock: Math.max(0, p.stock + stockChange),
          ...(updateProductInfo || {})
        };
      }
      return p;
    }));

    setIsTransactionModalOpen(false);
  };

  const updateShippingStatus = (id: string, status: Transaction['shippingStatus']) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, shippingStatus: status } : t));
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    // Revert stock
    setProducts(prev => prev.map(p => {
      if (p.id === tx.productId) {
        const stockChange = tx.type === 'purchase' ? -tx.amount : tx.amount;
        return { ...p, stock: Math.max(0, p.stock + stockChange) };
      }
      return p;
    }));

    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateProduct = (updatedProduct: InventoryProduct) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  const resetSystem = () => {
    if (window.confirm('确定要清空所有数据并重置吗？此操作不可恢复。')) {
      localStorage.removeItem('unio_inventory_products');
      localStorage.removeItem('unio_inventory_transactions');
      window.location.reload();
    }
  };

  const exportData = () => {
    const data = { products, transactions };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unio_inventory_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        if (data.length === 0) {
          alert('Excel文件为空或格式不正确');
          return;
        }

        if (window.confirm(`检测到 ${data.length} 条数据，是否覆盖现有库存和定价信息？`)) {
          setProducts(prev => {
            const newProducts = [...prev];
            data.forEach(row => {
              // Match by ID or Name
              const index = newProducts.findIndex(p => 
                p.id === String(row['产品编号'] || row['ID']) || 
                p.name === String(row['产品名称'] || row['Name'])
              );

              if (index !== -1) {
                const p = newProducts[index];
                newProducts[index] = {
                  ...p,
                  stock: row['当前库存'] !== undefined ? parseFloat(row['当前库存']) : p.stock,
                  priceB: row['B端售价'] !== undefined ? parseFloat(row['B端售价']) : p.priceB,
                  priceC: row['C端售价'] !== undefined ? parseFloat(row['C端售价']) : p.priceC,
                  enName: row['英文名称'] || row['英文名'] || p.enName,
                  botanicalName: row['学名'] || p.botanicalName,
                  origin: row['产地'] || p.origin,
                  method: row['萃取方法'] || (row['萃取方法 / 部位'] ? row['萃取方法 / 部位'].split('/')[0]?.trim() : p.method),
                  site: row['萃取部位'] || (row['萃取方法 / 部位'] ? row['萃取方法 / 部位'].split('/')[1]?.trim() : p.site),
                  supplierCode: row['供应商代码'] || p.supplierCode,
                  cost3ml: row['3ml进价'] !== undefined ? parseFloat(row['3ml进价']) : p.cost3ml,
                  priceB3ml: row['3ml建议售价B'] !== undefined ? parseFloat(row['3ml建议售价B']) : p.priceB3ml,
                  priceC3ml: row['3ml建议售价C'] !== undefined ? parseFloat(row['3ml建议售价C']) : p.priceC3ml,
                  cost5ml: row['5ml进价'] !== undefined ? parseFloat(row['5ml进价']) : p.cost5ml,
                  priceB5ml: row['5ml建议售价B'] !== undefined ? parseFloat(row['5ml建议售价B']) : p.priceB5ml,
                  priceC5ml: row['5ml建议售价C'] !== undefined ? parseFloat(row['5ml建议售价C']) : p.priceC5ml,
                  cost100ml: row['100ml进价'] !== undefined ? parseFloat(row['100ml进价']) : p.cost100ml,
                  priceB100ml: row['100ml建议售价B'] !== undefined ? parseFloat(row['100ml建议售价B']) : p.priceB100ml,
                  priceC100ml: row['100ml建议售价C'] !== undefined ? parseFloat(row['100ml建议售价C']) : p.priceC100ml,
                  cost500ml: row['500ml进价'] !== undefined ? parseFloat(row['500ml进价']) : p.cost500ml,
                  priceB500ml: row['500ml建议售价B'] !== undefined ? parseFloat(row['500ml建议售价B']) : p.priceB500ml,
                  priceC500ml: row['500ml建议售价C'] !== undefined ? parseFloat(row['500ml建议售价C']) : p.priceC500ml,
                  cost1000ml: row['1000ml进价'] !== undefined ? parseFloat(row['1000ml建议售价']) : p.cost1000ml,
                  priceB1000ml: row['1000ml建议售价B'] !== undefined ? parseFloat(row['1000ml建议售价B']) : p.priceB1000ml,
                  priceC1000ml: row['1000ml建议售价C'] !== undefined ? parseFloat(row['1000ml建议售价C']) : p.priceC1000ml,
                  cost10ml: row['10ml成本'] !== undefined ? parseFloat(row['10ml成本']) : p.cost10ml,
                  cost1L: row['1L成本'] !== undefined ? parseFloat(row['1L成本']) : p.cost1L,
                };
              }
            });
            return newProducts;
          });
          alert('导入成功！');
        }
      } catch (err) {
        console.error(err);
        alert('导入失败，请检查文件格式。');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleQuickStockChange = (productId: string, delta: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, stock: Math.max(0, p.stock + delta) };
      }
      return p;
    }));
  };

  const handleDirectStockChange = (productId: string, value: string) => {
    const numValue = parseFloat(value);
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, stock: isNaN(numValue) ? 0 : Math.max(0, numValue) };
      }
      return p;
    }));
  };

  // --- Calculations ---
  const stats = useMemo(() => {
    const totalExpense = transactions
      .filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + t.price, 0);
    
    const totalIncome = transactions
      .filter(t => t.type === 'sale')
      .reduce((sum, t) => sum + t.price, 0);
    
    const inventoryValue = products.reduce((sum, p) => {
      const cost = p.cost10ml ? (p.cost10ml / 10) : (p.cost1L ? p.cost1L / 1000 : (p.cost100ml ? p.cost100ml / 100 : 0));
      return sum + (p.stock * cost);
    }, 0);

    const lowStockCount = products.filter(p => p.stock <= 10).length;

    return {
      expense: totalExpense,
      income: totalIncome,
      profit: totalIncome - totalExpense,
      value: inventoryValue,
      lowStockCount
    };
  }, [transactions, products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (p.enName && p.enName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesStock = stockFilter === 'all' || 
                          (stockFilter === 'inStock' && p.stock > 0) || 
                          (stockFilter === 'outOfStock' && p.stock === 0) ||
                          (stockFilter === 'lowStock' && p.stock <= 10);
      return matchesSearch && matchesCategory && matchesStock;
    });

    if (sortBy === 'stock') {
      result.sort((a, b) => b.stock - a.stock);
    } else if (sortBy === 'price') {
      result.sort((a, b) => (b.priceB3ml || 0) - (a.priceB3ml || 0));
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    }

    return result;
  }, [products, searchQuery, categoryFilter, stockFilter, sortBy]);

  // --- Render Helpers ---
  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 text-center space-y-8"
        >
          <div className="w-20 h-20 bg-[#4CAF80]/10 rounded-full flex items-center justify-center mx-auto">
            <Lock className="text-[#4CAF80]" size={32} />
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
                  <button
                    key={user}
                    onClick={() => setSelectedUser(user)}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                      selectedUser === user 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                      : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    {user.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <input 
                type="password" 
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="访问代码"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#4CAF80]/20 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              />
              <button 
                onClick={handleUnlock}
                className="w-full py-4 bg-[#4CAF80] text-white rounded-2xl font-bold text-lg shadow-lg shadow-[#4CAF80]/20 hover:bg-[#3d9163] transition-all active:scale-95"
              >
                解锁系统
              </button>
            </div>
          </div>

          <button 
            onClick={onBack}
            className="text-slate-400 text-sm hover:text-slate-600 transition-colors"
          >
            返回官网
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-24">
      {/* Header */}
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
        <button 
          onClick={() => {
            setIsLocked(true);
            setCurrentUser(null);
            sessionStorage.removeItem('unio_inventory_auth');
            sessionStorage.removeItem('unio_inventory_user');
          }}
          className="p-2 text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-2"
        >
          <span className="text-[10px] font-bold text-slate-400 hidden sm:block">退出登录</span>
          <Lock size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-lg mx-auto space-y-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
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

              {/* Alerts & Quick Actions */}
              <div className="space-y-4">
                {stats.lowStockCount > 0 && (
                  <button 
                    onClick={() => {
                      setActiveTab('products');
                      setStockFilter('lowStock');
                      setProductViewMode('stock');
                      setCategoryFilter('all');
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center justify-between p-5 bg-red-50 border border-red-100 rounded-3xl group"
                  >
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
                  <button 
                    onClick={() => { setTransactionType('purchase'); setIsTransactionModalOpen(true); }}
                    className="flex flex-col items-center justify-center gap-3 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
                  >
                    <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                      <Plus size={24} />
                    </div>
                    <span className="font-bold text-sm">录入进货</span>
                  </button>
                  <button 
                    onClick={() => { setTransactionType('sale'); setIsTransactionModalOpen(true); }}
                    className="flex flex-col items-center justify-center gap-3 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
                  >
                    <div className="w-12 h-12 bg-[#4CAF80]/10 text-[#4CAF80] rounded-full flex items-center justify-center">
                      <Minus size={24} />
                    </div>
                    <span className="font-bold text-sm">录入销售</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div 
              key="products"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Search & Mode Switch */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    placeholder="搜索产品名称、英文名或编号..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4CAF80]/10 transition-all"
                  />
                </div>

                <div className="flex gap-2 p-1 bg-white rounded-2xl border border-slate-100">
                  <button
                    onClick={() => setProductViewMode('stock')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                      productViewMode === 'stock' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'
                    }`}
                  >
                    <Package size={16} />
                    库存管理
                  </button>
                  <button
                    onClick={() => setProductViewMode('price')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                      productViewMode === 'price' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'
                    }`}
                  >
                    <DollarSign size={16} />
                    价目查询
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">筛选状态</p>
                    <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-100">
                      {(['all', 'inStock', 'lowStock'] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setStockFilter(f)}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                            stockFilter === f ? 'bg-[#4CAF80] text-white' : 'text-slate-400'
                          }`}
                        >
                          {f === 'all' ? '全部' : f === 'inStock' ? '有货' : '预警'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-1">排序方式</p>
                    <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-100">
                      {(['name', 'stock', 'price'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setSortBy(s)}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                            sortBy === s ? 'bg-slate-900 text-white' : 'text-slate-400'
                          }`}
                        >
                          {s === 'name' ? '名称' : s === 'stock' ? '库存' : '价格'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {(['all', 'base', 'essential', 'hydrosol'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setCategoryFilter(f)}
                      className={`px-6 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                        categoryFilter === f 
                        ? 'bg-[#4CAF80] text-white shadow-md shadow-[#4CAF80]/20' 
                        : 'bg-white text-slate-400 border border-slate-100'
                      }`}
                    >
                      {f === 'all' ? '全部类别' : f === 'base' ? '基础油' : f === 'essential' ? '精油' : '纯露'}
                    </button>
                  ))}
                </div>
              </div>
              {activeTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                      <History size={32} />
                    </div>
                    <p className="text-slate-400 text-sm">暂无流水记录</p>
                  </div>
                ) : (
                  transactions.map(tx => (
                    <div key={tx.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden">
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${tx.type === 'purchase' ? 'bg-red-400' : 'bg-[#4CAF80]'}`} />
                      <div className="flex flex-col gap-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'purchase' ? 'bg-red-50 text-red-500' : 'bg-[#4CAF80]/10 text-[#4CAF80]'}`}>
                              {tx.type === 'purchase' ? <Plus size={16} /> : <Minus size={16} />}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm">{tx.productName}</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                {new Date(tx.date).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${tx.type === 'purchase' ? 'text-red-500' : 'text-[#4CAF80]'}`}>
                              {tx.type === 'purchase' ? '-' : '+'}¥{tx.price.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold">{tx.amount} {tx.unit}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md font-bold uppercase tracking-widest">
                              {tx.performedBy}
                            </span>
                            {tx.note && (
                              <span className="text-[9px] text-slate-400 italic line-clamp-1 max-w-[100px]">
                                "{tx.note}"
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {tx.type === 'sale' && (
                              <select 
                                value={tx.shippingStatus || 'pending'}
                                onChange={(e) => updateShippingStatus(tx.id, e.target.value as any)}
                                className={`text-[9px] font-bold px-2 py-1 rounded-lg border-none focus:ring-0 ${
                                  tx.shippingStatus === 'shipped' ? 'bg-blue-50 text-blue-500' : 
                                  tx.shippingStatus === 'delivered' ? 'bg-[#4CAF80]/10 text-[#4CAF80]' : 'bg-amber-50 text-amber-500'
                                }`}
                              >
                                <option value="pending">待发货</option>
                                <option value="shipped">已发货</option>
                                <option value="delivered">已送达</option>
                              </select>
                            )}
                            <button 
                              onClick={() => {
                                if (window.confirm('确定要删除这条记录并还原库存吗？')) {
                                  deleteTransaction(tx.id);
                                }
                              }}
                              className="p-1.5 text-slate-200 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 space-y-1">
                  <h3 className="font-bold text-lg">系统设置</h3>
                  <p className="text-slate-400 text-xs">管理数据备份与安全选项</p>
                </div>
                
                <div className="p-4 space-y-2">
                  <button 
                    onClick={() => setIsCodeModalOpen(true)}
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                        <Lock size={18} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">修改访问代码</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Security Settings</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-200 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button 
                    onClick={exportData}
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
                        <Download size={18} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">导出数据备份 (JSON)</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Data Backup</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-200 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <label className="w-full flex items-center justify-between p-5 hover:bg-slate-50 rounded-2xl transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                        <FileSpreadsheet size={18} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">从 Excel 导入数据</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Batch Import</p>
                      </div>
                    </div>
                    <input type="file" accept=".xlsx, .xls" onChange={handleExcelImport} className="hidden" />
                    <ChevronRight size={18} className="text-slate-200 group-hover:translate-x-1 transition-transform" />
                  </label>

                  <div className="pt-4 mt-4 border-t border-slate-50">
                    <button 
                      onClick={resetSystem}
                      className="w-full flex items-center justify-between p-5 hover:bg-red-50 rounded-2xl transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                          <RefreshCw size={18} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-red-500">重置系统数据</p>
                          <p className="text-[10px] text-red-300 uppercase tracking-widest font-bold">Factory Reset</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-red-100 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">UNIO Inventory System v2.0</p>
                <p className="text-[10px] text-slate-200">© 2026 UNIO Essential Oils</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex items-center justify-around z-40">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: '概览' },
          { id: 'products', icon: Package, label: '库存' },
          { id: 'history', icon: History, label: '流水' },
          { id: 'settings', icon: Settings, label: '设置' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as Tab)}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === item.id ? 'text-[#4CAF80]' : 'text-slate-300 hover:text-slate-400'
            }`}
          >
            <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            <span className="text-[10px] font-bold tracking-wider">{item.label}</span>
            {activeTab === item.id && (
              <motion.div layoutId="nav-indicator" className="w-1 h-1 bg-[#4CAF80] rounded-full mt-0.5" />
            )}
          </button>
        ))}
      </nav>

      {/* Modals */}
      <Modal 
        isOpen={isTransactionModalOpen} 
        onClose={() => setIsTransactionModalOpen(false)}
        title={transactionType === 'purchase' ? '录入进货' : '录入销售'}
      >
        <TransactionForm 
          type={transactionType} 
          products={products} 
          onSubmit={addTransaction} 
        />
      </Modal>

      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title="编辑产品信息"
      >
        {editingProduct && (
          <ProductEditForm 
            product={editingProduct} 
            onSubmit={updateProduct} 
          />
        )}
      </Modal>

      <Modal 
        isOpen={isCodeModalOpen} 
        onClose={() => setIsCodeModalOpen(false)}
        title="修改访问代码"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">新访问代码</label>
            <input 
              type="text" 
              placeholder="输入新代码..."
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value;
                  if (val) {
                    setStoredCode(val);
                    localStorage.setItem('unio_inventory_code', val);
                    setIsCodeModalOpen(false);
                    alert('访问代码已更新');
                  }
                }
              }}
            />
          </div>
          <p className="text-[10px] text-slate-400 text-center">按回车键确认修改</p>
        </div>
      </Modal>
    </div>
  );
};

// --- Sub-components ---

const Modal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode 
}> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">{title}</h3>
              <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 rounded-full hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto no-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const PriceItem: React.FC<{ product: InventoryProduct }> = ({ product }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden transition-all">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            product.category === 'essential' ? 'bg-purple-50 text-purple-500' : 
            product.category === 'base' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-500'
          }`}>
            <Package size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm">{product.name}</h3>
            <p className="text-[10px] text-slate-400 font-mono">{product.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-bold text-[#4CAF80]">¥{product.priceB3ml || product.priceB5ml || product.priceB100ml || '---'}</p>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">B端起步价</p>
          </div>
          <ChevronDown size={18} className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden bg-slate-50/50"
          >
            <div className="p-6 pt-0 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-1">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">英文名称</p>
                  <p className="text-xs font-medium line-clamp-1">{product.enName || '---'}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-1">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">学名</p>
                  <p className="text-xs font-medium line-clamp-1 italic">{product.botanicalName || '---'}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">详细价目表 (B端 / C端)</p>
                <div className="space-y-1">
                  {[
                    { label: '3ml', b: product.priceB3ml, c: product.priceC3ml },
                    { label: '5ml', b: product.priceB5ml, c: product.priceC5ml },
                    { label: '100ml', b: product.priceB100ml, c: product.priceC100ml },
                    { label: '500ml', b: product.priceB500ml, c: product.priceC500ml },
                    { label: '1000ml', b: product.priceB1000ml, c: product.priceC1000ml },
                  ].filter(item => item.b || item.c).map(item => (
                    <div key={item.label} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-600">{item.label}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-[#4CAF80]">¥{item.b || '---'}</span>
                        <span className="text-xs font-bold text-amber-600">¥{item.c || '---'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductEditForm: React.FC<{ 
  product: InventoryProduct; 
  onSubmit: (p: InventoryProduct) => void 
}> = ({ product, onSubmit }) => {
  const [formData, setFormData] = useState(product);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">产品名称</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">英文名称</label>
          <input 
            type="text" 
            value={formData.enName || ''}
            onChange={(e) => setFormData({ ...formData, enName: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">学名</label>
        <input 
          type="text" 
          value={formData.botanicalName || ''}
          onChange={(e) => setFormData({ ...formData, botanicalName: e.target.value })}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none italic"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">产地</label>
          <input 
            type="text" 
            value={formData.origin || ''}
            onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">当前库存</label>
          <input 
            type="number" 
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none font-bold text-[#4CAF80]"
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">详细定价 (B端 / C端)</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '3ml', bKey: 'priceB3ml', cKey: 'priceC3ml' },
            { label: '5ml', bKey: 'priceB5ml', cKey: 'priceC5ml' },
            { label: '100ml', bKey: 'priceB100ml', cKey: 'priceC100ml' },
            { label: '500ml', bKey: 'priceB500ml', cKey: 'priceC500ml' },
            { label: '1000ml', bKey: 'priceB1000ml', cKey: 'priceC1000ml' },
          ].map(item => (
            <div key={item.label} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
              <p className="text-[9px] font-bold text-slate-500">{item.label}</p>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="B端"
                  value={(formData as any)[item.bKey] || ''}
                  onChange={(e) => setFormData({ ...formData, [item.bKey]: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1 bg-white border border-slate-100 rounded-md text-[10px] focus:outline-none"
                />
                <input 
                  type="number" 
                  placeholder="C端"
                  value={(formData as any)[item.cKey] || ''}
                  onChange={(e) => setFormData({ ...formData, [item.cKey]: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1 bg-white border border-slate-100 rounded-md text-[10px] focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={() => onSubmit(formData)}
        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95"
      >
        保存修改
      </button>
    </div>
  );
};

const TransactionForm: React.FC<{ 
  type: 'purchase' | 'sale'; 
  products: InventoryProduct[]; 
  onSubmit: (data: Omit<Transaction, 'id' | 'date'>, updateProductInfo?: Partial<InventoryProduct>) => void 
}> = ({ type, products, onSubmit }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredProducts = products.filter(p => 
    p.name.includes(searchTerm) || p.id.includes(searchTerm)
  );

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !amount || !price) {
      alert('请填写完整信息');
      return;
    }

    onSubmit({
      productId: selectedProductId,
      productName: selectedProduct?.name || '',
      type,
      amount: parseFloat(amount),
      price: parseFloat(price),
      unit: selectedProduct?.unit || '瓶',
      note,
      shippingStatus: type === 'sale' ? 'pending' : undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input 
            type="text" 
            placeholder="搜索产品..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto no-scrollbar p-1">
          {filteredProducts.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedProductId(p.id)}
              className={`p-3 rounded-xl text-left border transition-all ${
                selectedProductId === p.id 
                ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
              }`}
            >
              <p className="text-[10px] font-bold truncate">{p.name}</p>
              <p className={`text-[8px] mt-0.5 ${selectedProductId === p.id ? 'text-slate-400' : 'text-slate-300'}`}>库存: {p.stock}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">数量 ({selectedProduct?.unit || '瓶'})</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none font-bold"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">总金额 (¥)</label>
            <input 
              type="number" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none font-bold text-[#4CAF80]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">备注</label>
          <input 
            type="text" 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="添加备注..."
            className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none"
          />
        </div>
      </div>

      <button 
        type="submit"
        className={`w-full py-5 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-95 ${
          type === 'purchase' 
          ? 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600' 
          : 'bg-[#4CAF80] text-white shadow-[#4CAF80]/20 hover:bg-[#3d9163]'
        }`}
      >
        确认{type === 'purchase' ? '进货' : '销售'}
      </button>
    </form>
  );
};

export default InventoryApp;
