import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Globe, Image as ImageIcon, Eye,
  TrendingUp, TrendingDown, DollarSign,
  ArrowUpRight, RefreshCw, AlertCircle
} from 'lucide-react';
import { productService, countryService, bannerService, inventoryService } from '../../lib/dataService';

interface StatCard {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  trend?: { value: string; up: boolean };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const [products, countries, banners] = await Promise.all([
        productService.getAll(),
        countryService.getAll(),
        bannerService.getAll(),
      ]);

      const activeProducts = products.filter(p => p.is_active).length;
      const inactiveProducts = products.length - activeProducts;
      const activeCountries = countries.filter(c => c.is_active).length;

      // 库存预警（独立超时，不阻塞主流程）
      let lowStockCount = 0;
      const inventoryPromise = inventoryService.getAllSummaries();
      const timeoutPromise = new Promise<'timeout'>((resolve) =>
        setTimeout(() => resolve('timeout'), 5000)
      );
      try {
        const result = await Promise.race([inventoryPromise, timeoutPromise]);
        if (result !== 'timeout') {
          lowStockCount = result.filter(s => s.current_stock_ml > 0 && s.current_stock_ml < 10).length;
        }
      } catch {}

      setStats([
        {
          title: '总产品数',
          value: products.length,
          icon: Package,
          color: '#4A7C59',
          bgColor: 'rgba(74,124,89,0.12)',
          trend: { value: `${activeProducts} 上架`, up: true },
        },
        {
          title: '国家/地区',
          value: countries.length,
          icon: Globe,
          color: '#1C39BB',
          bgColor: 'rgba(28,57,187,0.1)',
          trend: { value: `${activeCountries} 激活`, up: true },
        },
        {
          title: '海报/Banner',
          value: banners.length,
          icon: ImageIcon,
          color: '#7BA689',
          bgColor: 'rgba(123,166,137,0.15)',
        },
        {
          title: '库存预警',
          value: lowStockCount,
          icon: AlertCircle,
          color: '#E85D3B',
          bgColor: 'rgba(232,93,59,0.1)',
          trend: lowStockCount > 0 ? { value: `${lowStockCount} 个产品`, up: false } : undefined,
        },
      ]);

      // 最近更新的产品
      setRecentProducts(products.slice(-5).reverse());
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
          <p className="text-sm text-[#6B856B] mt-1">欢迎回来，Eric。</p>
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
      <div>
        <h2 className="text-2xl font-bold text-[#1A2E1A]">控制台</h2>
        <p className="text-sm text-[#6B856B] mt-1">欢迎回来，Eric。这是你的 UNIO AROMA 数据概览。</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="group p-5 rounded-2xl bg-white border border-[#E0ECE0] hover:border-[#D5E2D5] transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-[#7A967A] uppercase tracking-wider">{stat.title}</p>
                  <p className="text-3xl font-bold text-[#1A2E1A] mt-2">{stat.value}</p>
                </div>
                <div 
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: stat.bgColor }}
                >
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
              </div>
              {stat.trend && (
                <div className={`flex items-center gap-1 mt-3 text-xs ${stat.trend.up ? 'text-green-600' : 'text-red-500'}`}>
                  {stat.trend.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{stat.trend.value}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 快捷操作 + 最近产品 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 快捷操作 */}
        <div className="p-6 rounded-2xl bg-white border border-[#E0ECE0]">
          <h3 className="text-lg font-semibold text-[#1A2E1A] mb-4">快捷操作</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '添加产品', desc: '录入新产品信息', to: '/admin/products', color: '#4A7C59' },
              { label: '添加国家', desc: '新增国家/地区', to: '/admin/countries', color: '#1C39BB' },
              { label: '批量导入', desc: 'CSV 批量导入产品', to: '/admin/products?import=true', color: '#7BA689' },
              { label: '更换海报', desc: '管理首页海报', to: '/admin/banners', color: '#7B9EA8' },
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
      </div>
    </div>
  );
}
