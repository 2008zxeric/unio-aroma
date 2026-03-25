
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
  AlertCircle,
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
  const [adminPasswords, setAdminPasswords] = useState<Record<AdminUser, string>>({
    '管理员 A': 'unio2026',
    '管理员 B': 'unio2026',
    '管理员 C': 'unio2026'
  });
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  
  // Modals
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'purchase' | 'sale'>('purchase');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  
  // Notifications & Confirmations
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'warning' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ message: string, onConfirm: () => void } | null>(null);

  const notify = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  
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
    const savedPasswords = localStorage.getItem('unio_inventory_passwords');

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

    if (savedPasswords) {
      try {
        setAdminPasswords(JSON.parse(savedPasswords));
      } catch (e) {
        console.error('Failed to parse passwords', e);
      }
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
      notify('请先选择管理员', 'error');
      return;
    }
    const expectedPassword = adminPasswords[selectedUser];
    if (accessCode === expectedPassword) {
      setIsLocked(false);
      setCurrentUser(selectedUser);
      sessionStorage.setItem('unio_inventory_auth', 'true');
      sessionStorage.setItem('unio_inventory_user', JSON.stringify(selectedUser));
      setAccessCode('');
    } else {
      notify('密码错误', 'error');
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
    setConfirmDialog({
      message: '确定要清空所有数据并重置吗？此操作不可恢复。',
      onConfirm: () => {
        localStorage.removeItem('unio_inventory_products');
        localStorage.removeItem('unio_inventory_transactions');
        window.location.reload();
      }
    });
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
          notify('Excel文件为空或格式不正确', 'error');
          return;
        }

        setConfirmDialog({
          message: `检测到 ${data.length} 条数据，是否覆盖现有库存和定价信息？`,
          onConfirm: () => {
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
            notify('导入成功！', 'success');
            setConfirmDialog(null);
          }
        });
      } catch (err) {
        console.error(err);
        notify('导入失败，请检查文件格式。', 'error');
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
                      {f === 'all' ? '全部类别' : f === 'base' ? '基础油' : f === 'essential' ? '精油' : '生 · 纯露'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product List */}
              <div className="space-y-4">
                {filteredProducts.map(product => (
                  productViewMode === 'stock' ? (
                    <div 
                      key={product.id} 
                      className={`bg-white p-5 rounded-3xl border transition-all flex items-center justify-between group ${
                        product.stock <= 10 ? 'border-red-100 bg-red-50/30' : 'border-slate-100 shadow-sm'
                      }`}
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
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] text-slate-400 font-mono">{product.id}</p>
                            {product.origin && (
                              <span className="text-[8px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md font-bold uppercase tracking-tighter">
                                {product.origin}
                              </span>
                            )}
                          </div>
                          {product.botanicalName && (
                            <p className="text-[9px] text-slate-400 italic mt-0.5 line-clamp-1 max-w-[120px]">
                              {product.botanicalName}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-slate-100/50 rounded-xl p-1">
                          <button 
                            onClick={() => handleQuickStockChange(product.id, -1)}
                            className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-red-500 transition-all active:scale-90"
                          >
                            <Minus size={14} />
                          </button>
                          <div className="px-1 text-center min-w-[3.5rem]">
                            <input 
                              type="number"
                              value={product.stock}
                              onChange={(e) => handleDirectStockChange(product.id, e.target.value)}
                              className={`w-full bg-transparent text-center text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[#4CAF80]/30 rounded-md ${product.stock <= 10 ? 'text-red-500' : 'text-slate-900'}`}
                            />
                            <div className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">{product.unit}</div>
                          </div>
                          <button 
                            onClick={() => handleQuickStockChange(product.id, 1)}
                            className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-[#4CAF80] transition-all active:scale-90"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => { setEditingProduct(product); setIsEditModalOpen(true); }}
                          className="p-2 text-slate-300 hover:text-slate-600 transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>

                        {product.stock <= 10 && (
                          <div className="hidden sm:flex items-center gap-1 text-red-500 text-[8px] font-bold uppercase tracking-tighter">
                            <AlertTriangle size={10} />
                            库存不足
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div key={product.id} className="relative group">
                      <PriceItem product={product} />
                      <button 
                        onClick={() => { setEditingProduct(product); setIsEditModalOpen(true); }}
                        className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  )
                ))}
              </div>
            </motion.div>
          )}



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
                              <h3 className="font-bold text-sm">{tx.productName}</h3>
                              <p className="text-[10px] text-slate-400">
                                {new Date(tx.date).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                {tx.customerType && ` · ${tx.customerType}端客户`}
                                {tx.performedBy && ` · 操作人: ${tx.performedBy}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`font-bold ${tx.type === 'purchase' ? 'text-red-500' : 'text-[#4CAF80]'}`}>
                                {tx.type === 'purchase' ? '-' : '+'}¥{tx.price.toLocaleString()}
                              </p>
                              <p className="text-[10px] text-slate-400">{tx.amount}{tx.unit}</p>
                            </div>
                            <button 
                              onClick={() => deleteTransaction(tx.id)}
                              className="p-2 text-slate-200 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        {tx.type === 'sale' && (
                          <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                            <div className="flex gap-1.5">
                              {(['pending', 'shipped', 'delivered'] as const).map(s => (
                                <button
                                  key={s}
                                  onClick={() => updateShippingStatus(tx.id, s)}
                                  className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all border ${
                                    tx.shippingStatus === s 
                                    ? 'bg-slate-900 text-white border-slate-900' 
                                    : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                                  }`}
                                >
                                  {s === 'pending' ? '待发货' : s === 'shipped' ? '已发货' : '已签收'}
                                </button>
                              ))}
                            </div>
                            {tx.note && (
                              <p className="text-[9px] text-slate-400 italic truncate max-w-[120px]">
                                "{tx.note}"
                              </p>
                            )}
                          </div>
                        )}
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
                <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                  <div className="p-2 bg-green-50 text-green-500 rounded-lg"><FileSpreadsheet size={16} /></div>
                  <h3 className="font-bold text-sm">批量导入/更新</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-slate-300" />
                        <p className="mb-1 text-xs text-slate-500 font-bold">点击或拖拽上传 Excel</p>
                        <p className="text-[10px] text-slate-400">支持字段：产品名称, 当前库存, B端售价, C端售价...</p>
                      </div>
                      <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleExcelImport} />
                    </label>
                    <button 
                      onClick={() => {
                        const template = [
                          { 
                            '产品编号': 'JC1001',
                            '产品名称': '甜杏仁油', 
                            '英文名': 'Almond Oil', 
                            '学名': 'Prunus amygdalus',
                            '产地': '英国',
                            '萃取方法 / 部位': '冷压榨 / 果仁',
                            '供应商代码': 'SUP001',
                            '当前库存': 1000, 
                            '3ml进价': 10, '3ml建议售价B': 20, '3ml建议售价C': 38,
                            '5ml进价': 15, '5ml建议售价B': 30, '5ml建议售价C': 58,
                            '100ml进价': 80, '100ml建议售价B': 150, '100ml建议售价C': 280,
                            '500ml进价': 350, '500ml建议售价B': 600, '500ml建议售价C': 1200,
                            '1000ml进价': 600, '1000ml建议售价B': 1000, '1000ml建议售价C': 2000,
                          }
                        ];
                        const ws = XLSX.utils.json_to_sheet(template);
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, "Template");
                        XLSX.writeFile(wb, "unio_import_template.xlsx");
                      }}
                      className="w-full py-3 text-xs font-bold text-blue-500 border border-blue-100 rounded-xl hover:bg-blue-50 transition-all"
                    >
                      下载 Excel 模板
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Lock size={16} /></div>
                  <h3 className="font-bold text-sm">管理员密码设置</h3>
                </div>
                <div className="p-6 space-y-6">
                  {ADMIN_USERS.map(user => (
                    <div key={user} className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user} 密码</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={adminPasswords[user]}
                          onChange={(e) => {
                            const newPasswords = { ...adminPasswords, [user]: e.target.value };
                            setAdminPasswords(newPasswords);
                          }}
                          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none"
                        />
                        <button 
                          onClick={() => {
                            localStorage.setItem('unio_inventory_passwords', JSON.stringify(adminPasswords));
                            notify(`${user} 密码已保存`, 'success');
                          }}
                          className="px-4 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold active:scale-95 transition-all"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                  <div className="p-2 bg-purple-50 text-purple-500 rounded-lg"><FileJson size={16} /></div>
                  <h3 className="font-bold text-sm">数据管理</h3>
                </div>
                <div className="p-6 space-y-3">
                  <button 
                    onClick={() => {
                      setIsLocked(true);
                      onBack();
                    }}
                    className="w-full flex items-center justify-between p-4 bg-slate-900 rounded-2xl hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Lock size={18} className="text-white/50" />
                      <span className="text-sm font-medium text-white">退出管理系统</span>
                    </div>
                    <ChevronRight size={16} className="text-white/30 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={exportData}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Download size={18} className="text-slate-400" />
                      <span className="text-sm font-medium">导出 JSON 备份</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={resetSystem}
                    className="w-full flex items-center justify-between p-4 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <RefreshCw size={18} className="text-red-400" />
                      <span className="text-sm font-medium text-red-600">重置系统数据</span>
                    </div>
                    <Trash2 size={16} className="text-red-300 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>

              <div className="pt-10 text-center">
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">UNIO Inventory v1.0.0</p>
                <p className="text-[10px] text-slate-300 mt-1">Designed for Professional Aromatherapists</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex items-center justify-around z-40">
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="看板" />
        <NavButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Package size={20} />} label="产品" />
        <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={20} />} label="流水" />
        <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20} />} label="设置" />
      </nav>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingProduct && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">编辑产品信息</h2>
                  <p className="text-xs text-slate-400 mt-1">{editingProduct.name} ({editingProduct.id})</p>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <ProductEditForm 
                product={editingProduct} 
                onSubmit={updateProduct} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transaction Modal */}
      <AnimatePresence>
        {isTransactionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTransactionModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-lg bg-white rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{transactionType === 'purchase' ? '录入进货' : '录入销售'}</h2>
                <button onClick={() => setIsTransactionModalOpen(false)} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={20} /></button>
              </div>
              
              <TransactionForm 
                type={transactionType} 
                products={products} 
                onSubmit={addTransaction} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 bg-white border border-slate-100 min-w-[200px]"
          >
            <div className={`w-2 h-2 rounded-full ${
              notification.type === 'success' ? 'bg-[#4CAF80]' : 
              notification.type === 'error' ? 'bg-red-500' : 'bg-amber-500'
            }`} />
            <span className="text-sm font-medium text-slate-700">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Confirm Dialog */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDialog(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">确认操作</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">{confirmDialog.message}</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={confirmDialog.onConfirm}
                  className="flex-1 py-4 bg-[#4CAF80] text-white font-bold rounded-2xl shadow-lg shadow-[#4CAF80]/20 hover:bg-[#3d9163] transition-colors"
                >
                  确定
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-[#4CAF80]' : 'text-slate-300'}`}
  >
    <div className={`p-2 rounded-xl transition-all ${active ? 'bg-[#4CAF80]/10' : ''}`}>
      {icon}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
  </button>
);

const PriceItem: React.FC<{ product: InventoryProduct }> = ({ product }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            product.category === 'essential' ? 'bg-purple-50 text-purple-500' : 
            product.category === 'base' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-500'
          }`}>
            <Package size={18} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-sm">{product.name}</h3>
            <p className="text-[10px] text-slate-400">{product.enName || product.id}</p>
          </div>
        </div>
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={18} className="text-slate-300" />
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-50/50"
          >
            <div className="p-5 pt-0 space-y-6">
              {/* Product Metadata */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-4 border-t border-slate-100/50">
                {product.enName && (
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">English Name</p>
                    <p className="text-[10px] font-medium text-slate-600">{product.enName}</p>
                  </div>
                )}
                {product.botanicalName && (
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Botanical Name</p>
                    <p className="text-[10px] font-medium text-slate-600 italic">{product.botanicalName}</p>
                  </div>
                )}
                {product.origin && (
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">产地 (Origin)</p>
                    <p className="text-[10px] font-medium text-slate-600">{product.origin}</p>
                  </div>
                )}
                {product.method && (
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">萃取方法 (Method)</p>
                    <p className="text-[10px] font-medium text-slate-600">{product.method}</p>
                  </div>
                )}
                {product.site && (
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">萃取部位 (Site)</p>
                    <p className="text-[10px] font-medium text-slate-600">{product.site}</p>
                  </div>
                )}
                {product.supplierCode && (
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">供应商代码 (Supplier Code)</p>
                    <p className="text-[10px] font-medium text-slate-600">{product.supplierCode}</p>
                  </div>
                )}
              </div>

              {/* Pricing Table (Optimized) */}
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                  <span>规格</span>
                  <span>进价</span>
                  <span>售价 B</span>
                  <span>售价 C</span>
                </div>
                
                {[
                  { size: '3ml', cost: product.cost3ml, b: product.priceB3ml, c: product.priceC3ml },
                  { size: '5ml', cost: product.cost5ml, b: product.priceB5ml, c: product.priceC5ml },
                  { size: '100ml', cost: product.cost100ml, b: product.priceB100ml, c: product.priceC100ml },
                  { size: '500ml', cost: product.cost500ml, b: product.priceB500ml, c: product.priceC500ml },
                  { size: '1000ml', cost: product.cost1000ml, b: product.priceB1000ml, c: product.priceC1000ml },
                ].map((item, idx) => (
                  (item.cost || item.b || item.c) ? (
                    <div key={idx} className="grid grid-cols-4 gap-2 items-center py-1 border-b border-slate-50 last:border-0">
                      <span className="text-[10px] font-bold text-slate-600">{item.size}</span>
                      <span className="text-[10px] font-mono text-slate-400">¥{item.cost || '-'}</span>
                      <span className="text-[10px] font-bold text-[#4CAF80]">¥{item.b || '-'}</span>
                      <span className="text-[10px] font-bold text-blue-500">¥{item.c || '-'}</span>
                    </div>
                  ) : null
                ))}

                {/* Legacy Specifications if any */}
                {product.specifications && product.specifications.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">其他规格</p>
                    {product.specifications.map((spec, idx) => (
                      <div key={idx} className="grid grid-cols-4 gap-2 items-center">
                        <span className="text-[10px] font-bold text-slate-600">{spec.size}</span>
                        <span className="text-[10px] font-mono text-slate-400">¥{spec.cost || '-'}</span>
                        <span className="text-[10px] font-bold text-[#4CAF80]">¥{spec.priceB || '-'}</span>
                        <span className="text-[10px] font-bold text-blue-500">¥{spec.priceC || '-'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
};

const ProductEditForm: React.FC<{ 
  product: InventoryProduct, 
  onSubmit: (data: InventoryProduct) => void 
}> = ({ product, onSubmit }) => {
  const [formData, setFormData] = useState<InventoryProduct>({ ...product });

  const handleChange = (field: keyof InventoryProduct, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">产品名称</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">英文名称</label>
            <input 
              type="text" 
              value={formData.enName || ''}
              onChange={(e) => handleChange('enName', e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">产地 (Origin)</label>
            <input 
              type="text" 
              value={formData.origin || ''}
              onChange={(e) => handleChange('origin', e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">学名 (Botanical Name)</label>
            <input 
              type="text" 
              value={formData.botanicalName || ''}
              onChange={(e) => handleChange('botanicalName', e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none italic"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">萃取方法</label>
            <input 
              type="text" 
              value={formData.method || ''}
              onChange={(e) => handleChange('method', e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">萃取部位</label>
            <input 
              type="text" 
              value={formData.site || ''}
              onChange={(e) => handleChange('site', e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">供应商代码</label>
            <input 
              type="text" 
              value={formData.supplierCode || ''}
              onChange={(e) => handleChange('supplierCode', e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">规格定价 (3ml / 5ml / 100ml / 500ml / 1000ml)</label>
          
          {[
            { size: '3ml', costKey: 'cost3ml', bKey: 'priceB3ml', cKey: 'priceC3ml' },
            { size: '5ml', costKey: 'cost5ml', bKey: 'priceB5ml', cKey: 'priceC5ml' },
            { size: '100ml', costKey: 'cost100ml', bKey: 'priceB100ml', cKey: 'priceC100ml' },
            { size: '500ml', costKey: 'cost500ml', bKey: 'priceB500ml', cKey: 'priceC500ml' },
            { size: '1000ml', costKey: 'cost1000ml', bKey: 'priceB1000ml', cKey: 'priceC1000ml' },
          ].map((item) => (
            <div key={item.size} className="grid grid-cols-4 gap-2 items-center">
              <span className="text-xs font-bold text-slate-500">{item.size}</span>
              <input 
                type="number" 
                placeholder="进价"
                value={formData[item.costKey as keyof InventoryProduct] || ''}
                onChange={(e) => handleChange(item.costKey as keyof InventoryProduct, parseFloat(e.target.value))}
                className="px-2 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[10px] focus:outline-none"
              />
              <input 
                type="number" 
                placeholder="售价B"
                value={formData[item.bKey as keyof InventoryProduct] || ''}
                onChange={(e) => handleChange(item.bKey as keyof InventoryProduct, parseFloat(e.target.value))}
                className="px-2 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[10px] focus:outline-none text-[#4CAF80] font-bold"
              />
              <input 
                type="number" 
                placeholder="售价C"
                value={formData[item.cKey as keyof InventoryProduct] || ''}
                onChange={(e) => handleChange(item.cKey as keyof InventoryProduct, parseFloat(e.target.value))}
                className="px-2 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[10px] focus:outline-none text-blue-500 font-bold"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">库存单位</label>
            <input 
              type="text" 
              value={formData.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">当前库存 ({formData.unit})</label>
            <input 
              type="number" 
              value={formData.stock}
              onChange={(e) => handleChange('stock', parseFloat(e.target.value))}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none"
              required
            />
          </div>
        </div>
      </div>

      <button 
        type="submit"
        className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-all"
      >
        保存修改
      </button>
    </form>
  );
};

const TransactionForm: React.FC<{ 
  type: 'purchase' | 'sale', 
  products: InventoryProduct[], 
  onSubmit: (data: Omit<Transaction, 'id' | 'date'>, updateProductInfo?: Partial<InventoryProduct>) => void 
}> = ({ type, products, onSubmit }) => {
  const [productId, setProductId] = useState('');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [customerType, setCustomerType] = useState<'B' | 'C'>('C');
  const [note, setNote] = useState('');
  const [shippingStatus, setShippingStatus] = useState<Transaction['shippingStatus']>('pending');
  
  // New fields for syncing
  const [enName, setEnName] = useState('');
  const [botanicalName, setBotanicalName] = useState('');
  const [origin, setOrigin] = useState('');
  const [method, setMethod] = useState('');
  const [site, setSite] = useState('');
  const [supplierCode, setSupplierCode] = useState('');
  const [syncToProduct, setSyncToProduct] = useState(false);

  const selectedProduct = products.find(p => p.id === productId);

  // Auto-fill price and info
  useEffect(() => {
    if (selectedProduct) {
      setEnName(selectedProduct.enName || '');
      setBotanicalName(selectedProduct.botanicalName || '');
      setOrigin(selectedProduct.origin || '');
      setMethod(selectedProduct.method || '');
      setSite(selectedProduct.site || '');
      setSupplierCode(selectedProduct.supplierCode || '');
      
      if (type === 'sale') {
        if (selectedProduct.priceB && customerType === 'B') {
          setPrice(selectedProduct.priceB.toString());
        } else if (selectedProduct.priceC && customerType === 'C') {
          setPrice(selectedProduct.priceC.toString());
        }
      }
    }
  }, [productId, customerType, type, selectedProduct]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !amount || !price) return;

    const updateInfo = syncToProduct ? { enName, botanicalName, origin, method, site, supplierCode } : undefined;

    onSubmit({
      type,
      productId,
      productName: selectedProduct?.name || 'Unknown',
      amount: parseFloat(amount),
      unit: selectedProduct?.unit || 'ml',
      price: parseFloat(price),
      customerType: type === 'sale' ? customerType : undefined,
      shippingStatus: type === 'sale' ? shippingStatus : undefined,
      note: updateInfo ? `${note} (已同步更新产品信息)`.trim() : note
    }, updateInfo);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">选择产品</label>
          <select 
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none"
            required
          >
            <option value="">请选择产品...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.stock}{p.unit})</option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 bg-slate-50 rounded-2xl space-y-4 border border-slate-100"
          >
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">英文名称</label>
                <input 
                  type="text"
                  value={enName}
                  onChange={(e) => setEnName(e.target.value)}
                  className="w-full bg-transparent text-[10px] font-medium text-slate-600 focus:outline-none border-b border-slate-200 pb-1"
                  placeholder="未设置"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">学名</label>
                <input 
                  type="text"
                  value={botanicalName}
                  onChange={(e) => setBotanicalName(e.target.value)}
                  className="w-full bg-transparent text-[10px] font-medium text-slate-600 focus:outline-none border-b border-slate-200 pb-1 italic"
                  placeholder="未设置"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">产地</label>
                <input 
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-transparent text-[10px] font-medium text-slate-600 focus:outline-none border-b border-slate-200 pb-1"
                  placeholder="未设置"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">供应商代码</label>
                <input 
                  type="text"
                  value={supplierCode}
                  onChange={(e) => setSupplierCode(e.target.value)}
                  className="w-full bg-transparent text-[10px] font-medium text-slate-600 focus:outline-none border-b border-slate-200 pb-1"
                  placeholder="未设置"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">萃取方法</label>
                <input 
                  type="text"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-transparent text-[10px] font-medium text-slate-600 focus:outline-none border-b border-slate-200 pb-1"
                  placeholder="未设置"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">萃取部位</label>
                <input 
                  type="text"
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  className="w-full bg-transparent text-[10px] font-medium text-slate-600 focus:outline-none border-b border-slate-200 pb-1"
                  placeholder="未设置"
                />
              </div>
            </div>
            {type === 'purchase' && (
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={syncToProduct}
                  onChange={(e) => setSyncToProduct(e.target.checked)}
                  className="w-3 h-3 rounded border-slate-300 text-[#4CAF80] focus:ring-[#4CAF80]"
                />
                <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors">同步更新产品库中的这些信息</span>
              </label>
            )}
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">数量 ({selectedProduct?.unit || 'ml'})</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">总价 (元)</label>
            <input 
              type="number" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none"
              required
            />
          </div>
        </div>

        {type === 'sale' && (
          <>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">客户类型</label>
              <div className="flex gap-2">
                {(['B', 'C'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCustomerType(t)}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                      customerType === t 
                      ? 'bg-[#4CAF80] text-white shadow-md shadow-[#4CAF80]/20' 
                      : 'bg-slate-50 text-slate-400 border border-slate-100'
                    }`}
                  >
                    {t}端客户
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">发货状态</label>
              <div className="flex gap-2">
                {(['pending', 'shipped', 'delivered'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setShippingStatus(s)}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                      shippingStatus === s 
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20' 
                      : 'bg-slate-50 text-slate-400 border border-slate-100'
                    }`}
                  >
                    {s === 'pending' ? '待发货' : s === 'shipped' ? '已发货' : '已签收'}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">备注 (可选)</label>
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
