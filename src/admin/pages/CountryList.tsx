import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus, Search, Edit2, Trash2, Globe,
  ToggleLeft, ToggleRight, X, ChevronDown, ChevronRight,
  Package, Link2, Check,
  AlertCircle, RefreshCw, Eye, ExternalLink, Save, Zap, Camera,
} from 'lucide-react';
import { countryService, productService, seriesService } from '../../lib/dataService';
import type { Country, Product, Series } from '../../lib/database.types';
import { Perm } from '../components/PermissionGuard';
import ImageUploadField from '../components/ImageUploadField';

// ============================================
// 国家表单接口（含产品绑定）
// ============================================

interface CountryForm {
  name_cn: string;
  name_en: string;
  region: string;
  sub_region: string;
  description: string;
  eric_diary: string;
  technical_info: string;
  image_url: string;
  scenery_url: string;
  gallery_urls: string;
  visit_count: string;
  unlock_code: string;
  is_active: boolean;
  sort_order: string;
  boundProductIds: string[];
}

const emptyCountryForm = (): CountryForm => ({
  name_cn: '', name_en: '', region: '', sub_region: '',
  description: '', eric_diary: '', technical_info: '',
  image_url: '', scenery_url: '', gallery_urls: '',
  visit_count: '0', unlock_code: '0', is_active: true, sort_order: '0',
  boundProductIds: [],
});

const REGIONS = [
  { value: '欧洲', label: '🇪🇺 欧洲' },
  { value: '亚洲', label: '🌏 亚洲' },
  { value: '非洲', label: '🌍 非洲' },
  { value: '美洲', label: '🌎 美洲' },
  { value: '大洋洲', label: '🌏 大洋洲' },
  { value: '神州', label: '🇨🇳 神州（中国省份）' },
];

const COUNTRY_SECTIONS = [
  { id: 'basic', label: '基础信息', color: '#7BA689' },
  { id: 'logs', label: '日志笔记', color: '#8B7355' },
  { id: 'images', label: '图片资源', color: '#6B7280' },
  { id: 'products', label: '关联产品', color: '#3B82F6' },
];

// 获取某个国家的绑定数量
function getBoundCount(country: Country): number {
  const ids = (country as any).product_ids;
  return Array.isArray(ids) ? ids.length : 0;
}

// ============================================
// 主页面组件
// ============================================

export default function AdminCountries() {
  // --- 数据状态 ---
  const [countries, setCountries] = useState<Country[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // --- 视图模式：list / create / edit ---
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CountryForm>(emptyCountryForm());
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // --- 列表筛选 ---
  const [searchQuery, setSearchQuery] = useState('');

  // --- 产品绑定筛选 ---
  const [bindSearch, setBindSearch] = useState('');
  const [bindSeriesFilter, setBindSeriesFilter] = useState('');
  const [collapsedRegions, setCollapsedRegions] = useState<Set<string>>(new Set());

  // --- 表单导航高亮 ---
  const [activeSection, setActiveSection] = useState('basic');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`country-section-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ---- 数据加载 ----
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const countriesData = await countryService.getAll();
      setCountries(countriesData);
      try {
        const [productsData, seriesData] = await Promise.all([
          productService.getAll(),
          seriesService.getAllWithInactive(),
        ]);
        setProducts(productsData);
        setSeries(seriesData);
      } catch (auxErr) {
        console.warn('辅助数据加载失败：', auxErr);
      }
    } catch (err) {
      setLoadError((err as Error).message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ---- 列表筛选 ----
  const filtered = useMemo(() => countries.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.name_cn.toLowerCase().includes(q) ||
      (c.name_en && c.name_en.toLowerCase().includes(q));
  }), [countries, searchQuery]);

  const groupedCountries = useMemo(() => {
    const groups: { region: string; label: string; emoji: string; countries: Country[] }[] = [];
    REGIONS.forEach(r => {
      const items = filtered.filter(c => c.region === r.value);
      if (items.length > 0 || !searchQuery) {
        groups.push({ region: r.value, label: r.value, emoji: r.label.split(' ')[0], countries: items });
      }
    });
    const unclassified = filtered.filter(c => !c.region || !REGIONS.some(r => r.value === c.region));
    if (unclassified.length > 0) {
      groups.push({ region: '', label: '未分类', emoji: '📁', countries: unclassified });
    }
    return groups;
  }, [filtered, searchQuery]);

  const toggleRegionCollapse = (region: string) => {
    setCollapsedRegions(prev => {
      const next = new Set(prev);
      if (next.has(region)) next.delete(region);
      else next.add(region);
      return next;
    });
  };

  // ---- 产品绑定相关 ----
  const bindableProducts = useMemo(() => {
    let result = [...products];
    if (bindSearch) {
      const q = bindSearch.toLowerCase();
      result = result.filter(p =>
        p.name_cn.includes(q) || (p.name_en && p.name_en.toLowerCase().includes(q)) || (p.code && p.code.includes(q))
      );
    }
    if (bindSeriesFilter) {
      result = result.filter(p => p.series_id === bindSeriesFilter);
    }
    return result.sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
  }, [products, bindSearch, bindSeriesFilter]);

  // ---- 操作 ----
  const startCreate = () => {
    setViewMode('create');
    setEditingId(null);
    setForm(emptyCountryForm());
    setBindSearch('');
    setBindSeriesFilter('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEdit = (country: Country) => {
    setViewMode('edit');
    setEditingId(country.id);
    const existingBindings: string[] = Array.isArray((country as any).product_ids)
      ? (country as any).product_ids || []
      : [];
    setForm({
      name_cn: country.name_cn || '',
      name_en: country.name_en || '',
      region: country.region || '',
      sub_region: country.sub_region || '',
      description: country.description || '',
      eric_diary: country.eric_diary || '',
      technical_info: country.technical_info || '',
      image_url: country.image_url || '',
      scenery_url: country.scenery_url || '',
      gallery_urls: Array.isArray(country.gallery_urls) ? country.gallery_urls.join('\n') : (country.gallery_urls || ''),
      visit_count: String(country.visit_count ?? 0),
      unlock_code: String(country.unlock_code ?? 0),
      is_active: country.is_active,
      sort_order: String(country.sort_order ?? 0),
      boundProductIds: existingBindings,
    });
    setBindSearch('');
    setBindSeriesFilter('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backToList = () => {
    setViewMode('list');
    setEditingId(null);
    setForm(emptyCountryForm());
    setShowPreview(false);
  };

  const handleSave = async () => {
    if (!form.name_cn.trim()) { alert('请填写国家名称！'); return; }
    try {
      setSaving(true);
      const record = {
        name_cn: form.name_cn.trim(),
        name_en: form.name_en.trim() || null,
        region: form.region || null,
        sub_region: form.sub_region || null,
        description: form.description.trim() || null,
        eric_diary: form.eric_diary.trim() || null,
        technical_info: form.technical_info.trim() || null,
        image_url: form.image_url.trim() || null,
        scenery_url: form.scenery_url.trim() || null,
        gallery_urls: form.gallery_urls.split('\n').map(s => s.trim()).filter(Boolean),
        visit_count: parseInt(form.visit_count) || 0,
        unlock_code: form.unlock_code || '0',
        is_active: form.is_active,
        sort_order: parseInt(form.sort_order) || 0,
        product_ids: form.boundProductIds,
      };
      if (editingId) await countryService.update(editingId, record);
      else await countryService.create(record);
      await loadData();
      backToList();
    } catch (err: any) {
      alert('保存失败：' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除此国家？')) return;
    try {
      await countryService.delete(id);
      await loadData();
    } catch (err: any) {
      alert('删除失败：' + err.message);
    }
  };

  const handleToggleActive = async (country: Country) => {
    try {
      await countryService.update(country.id, { is_active: !country.is_active });
      await loadData();
    } catch (err: any) {
      alert('操作失败：' + err.message);
    }
  };

  const toggleProductBinding = (productId: string) => {
    setForm(prev => ({
      ...prev,
      boundProductIds: prev.boundProductIds.includes(productId)
        ? prev.boundProductIds.filter(id => id !== productId)
        : [...prev.boundProductIds, productId],
    }));
  };

  // ================================================================
  // 渲染：编辑/新建视图（viewMode = create | edit）
  // ================================================================

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="space-y-4">
        <CountryEditForm
          form={form} setForm={setForm}
          series={series} products={products}
          saving={saving} onSave={handleSave} onCancel={backToList}
          isNew={viewMode === 'create'}
          editingId={editingId}
          showPreview={showPreview}
          onPreviewOpen={() => setShowPreview(true)}
          onPreviewClose={() => setShowPreview(false)}
          activeSection={activeSection}
          onActiveSectionChange={setActiveSection}
          scrollToSection={scrollToSection}
          bindSearch={bindSearch}
          onBindSearchChange={setBindSearch}
          bindSeriesFilter={bindSeriesFilter}
          onBindSeriesFilterChange={setBindSeriesFilter}
          bindableProducts={bindableProducts}
          toggleProductBinding={toggleProductBinding}
        />
      </div>
    );
  }

  // ================================================================
  // 渲染：列表视图（viewMode = list）
  // ================================================================

  return (
    <div className="space-y-6">

      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A2E1A]">国家管理</h2>
          <p className="text-sm text-[#6B856B] mt-1">
            管理全球极境国家/地区信息、到访次数、解锁状态、
            <span className="text-[#7BA689]/70">关联产品</span>、Eric 相册等
          </p>
        </div>
        <Perm action="edit_countries"><button
          onClick={startCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4A7C59] hover:bg-[#3D6B4A] text-white rounded-xl font-medium text-sm transition-colors"
        >
          <Plus size={16} /> 添加国家
        </button></Perm>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-[#6B856B]">
            <RefreshCw size={20} className="animate-spin" />
            <span>加载国家数据中...</span>
          </div>
        </div>
      )}

      {/* 错误状态 */}
      {loadError && !loading && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
          <AlertCircle size={32} className="mx-auto mb-3 text-red-400" />
          <p className="text-sm text-red-600 font-medium mb-2">加载国家数据失败</p>
          <p className="text-xs text-red-400 mb-4">{loadError}</p>
          <button onClick={loadData} className="px-4 py-2 bg-[#4A7C59] text-white text-sm rounded-xl hover:bg-[#3D6B4A]">
            重新加载
          </button>
        </div>
      )}

      {/* 搜索栏 + 分组国家列表 */}
      {!loading && !loadError && (
        <div className="space-y-4">
          {/* 搜索栏 */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AAA9A]" />
            <input
              type="text"
              placeholder="搜索国家名称或英文名..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D5E2D5] rounded-xl text-sm text-[#1A2E1A] placeholder:text-[#9AAA9A] focus:border-[#4A7C59]/50 focus:outline-none"
            />
            {searchQuery && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9AAA9A]">
                {filtered.length} 个结果
              </span>
            )}
          </div>

          {/* 按区域分组展示 */}
          {countries.length === 0 ? (
            <div className="text-center py-20 text-[#8AA08A]">
              <Globe size={48} className="mx-auto mb-4 opacity-30" />
              <p>暂无国家数据</p>
            </div>
          ) : (
            <div className="space-y-5">
              {groupedCountries.map(group => {
                const isCollapsed = collapsedRegions.has(group.region);
                return (
                  <div key={group.region || '_unclassified'} className="space-y-2">
                    {/* 分组标题 */}
                    <button
                      onClick={() => toggleRegionCollapse(group.region)}
                      className="flex items-center gap-2.5 px-1 py-1.5 text-left w-full group/sec hover:bg-[#F2F7F3] rounded-lg transition-colors"
                    >
                      {isCollapsed
                        ? <ChevronRight size={14} className="text-[#9AAA9A]" />
                        : <ChevronDown size={14} className="text-[#9AAA9A]" />
                      }
                      <span className="text-base">{group.emoji}</span>
                      <span className="text-sm font-semibold text-[#2D442D]">{group.label}</span>
                      <span className="text-xs text-[#9AAA9A] font-medium bg-[#F2F7F3] px-2 py-0.5 rounded-full">
                        {group.countries.length}
                      </span>
                      {group.countries.length > 0 && (
                        <div className="flex-1 h-px bg-[#E0ECE0]" />
                      )}
                    </button>

                    {/* 分组内容 */}
                    {!isCollapsed && (
                      <div className="space-y-2">
                        {group.countries.length === 0 && !searchQuery ? (
                          <div className="text-center py-6 text-xs text-[#C8DDD0] border border-dashed border-[#E0ECE0] rounded-xl">
                            暂无国家
                          </div>
                        ) : (
                          group.countries.map(country => {
                            const boundCount = getBoundCount(country);
                            return (
                              <div key={country.id} className="group flex items-center gap-4 px-4 py-3 rounded-xl bg-white border border-[#E0ECE0] hover:border-[#D5E2D5] transition-all">
                                {/* 国旗/图标 */}
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F2F7F3] flex-shrink-0">
                                  {country.image_url ? (
                                    <img src={country.image_url} alt="" className="w-full h-full object-cover"
                                      onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#A8BAA8]">
                                      <Globe size={18} />
                                    </div>
                                  )}
                                </div>

                                {/* 信息 */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-medium text-[#1A2E1A]">{country.name_cn}</h4>
                                    {country.name_en && <span className="text-xs text-[#8AA08A]">{country.name_en}</span>}
                                  </div>
                                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-[#8AA08A]">
                                    {country.sub_region && <span>{country.sub_region}</span>}
                                    <span>到访 {country.visit_count || 0} 次</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                      country.unlock_code !== '0' && country.unlock_code !== ''
                                        ? 'bg-green-500/15 text-green-400'
                                        : 'bg-zinc-700 text-[#8AA08A]'
                                    }`}>
                                      {country.unlock_code !== '0' && country.unlock_code !== '' ? '已解锁' : '未解锁'}
                                    </span>
                                    {boundCount > 0 && (
                                      <span className="flex items-center gap-0.5 text-blue-400/60">
                                        <Link2 size={9} /> {boundCount}款产品
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* 操作按钮 */}
                                <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                  <Perm action="edit_countries"><button onClick={() => handleToggleActive(country)}>
                                    {country.is_active
                                      ? <ToggleRight size={22} className="text-green-400" />
                                      : <ToggleLeft size={22} className="text-[#9AAA9A]" />
                                    }
                                  </button></Perm>
                                  <Perm action="edit_countries"><button onClick={() => startEdit(country)} className="p-1.5 hover:bg-[#EEF4EF] rounded-lg" title="编辑">
                                    <Edit2 size={14} className="text-[#5C725C]" />
                                  </button></Perm>
                                  <Perm action="edit_countries"><button onClick={() => handleDelete(country.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg" title="删除">
                                    <Trash2 size={14} className="text-red-400/50" />
                                  </button></Perm>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 搜索无结果 */}
              {searchQuery && filtered.length === 0 && (
                <div className="text-center py-16 text-[#8AA08A]">
                  <Search size={32} className="mx-auto mb-3 opacity-30" />
                  <p>没有找到匹配「{searchQuery}」的国家</p>
                </div>
              )}
            </div>
          )}

          {/* 统计栏 */}
          <div className="text-center text-xs text-[#A8BAA8] pt-2">
            共 {countries.length} 个国家/地区 · {countries.filter(c => c.is_active).length} 个已上线
          </div>
        </div>
      )}

      {/* ====== 右下角浮动快捷按钮 ====== */}
      {!loading && !loadError && (
        <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-3">
          {/* 搜索浮窗 */}
          <div className="relative">
            {searchQuery && (
              <div className="absolute bottom-12 right-0 mb-2 px-3 py-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-[#E0ECE0] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                <span className="text-xs text-[#8AA08A]">找到 {filtered.length} / {countries.length} 个</span>
              </div>
            )}
            <button
              onClick={() => {
                const input = document.querySelector<HTMLInputElement>('input[placeholder*="搜索国家"]');
                input?.focus();
              }}
              className="w-12 h-12 rounded-full bg-white shadow-lg border border-[#E0ECE0] flex items-center justify-center text-[#5C725C] hover:bg-[#F2F7F3] transition-all hover:shadow-xl"
              title="快速搜索"
            >
              <Search size={20} />
            </button>
          </div>

          {/* 添加国家 */}
          <button
            onClick={startCreate}
            className="w-12 h-12 rounded-full bg-[#4A7C59] shadow-lg flex items-center justify-center text-white hover:bg-[#3D6B4A] transition-all hover:shadow-xl"
            title="添加国家"
          >
            <Plus size={22} />
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// 编辑/新建表单组件（独立视图）
// ============================================

function CountryEditForm({
  form, setForm, series, products,
  saving, onSave, onCancel, isNew, editingId,
  showPreview, onPreviewOpen, onPreviewClose,
  activeSection, onActiveSectionChange, scrollToSection,
  bindSearch, onBindSearchChange, bindSeriesFilter, onBindSeriesFilterChange,
  bindableProducts, toggleProductBinding,
}: {
  form: CountryForm;
  setForm: React.Dispatch<React.SetStateAction<CountryForm>>;
  series: Series[];
  products: Product[];
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
  isNew: boolean;
  editingId: string | null;
  showPreview: boolean;
  onPreviewOpen: () => void;
  onPreviewClose: () => void;
  activeSection: string;
  onActiveSectionChange: (s: string) => void;
  scrollToSection: (id: string) => void;
  bindSearch: string;
  onBindSearchChange: (v: string) => void;
  bindSeriesFilter: string;
  onBindSeriesFilterChange: (v: string) => void;
  bindableProducts: Product[];
  toggleProductBinding: (productId: string) => void;
}) {
  return (
    <div className="relative">

      {/* 固定左侧导航栏 */}
      <div className="fixed left-4 top-24 z-40 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md rounded-2xl border border-[#E0ECE0] shadow-lg p-2.5 min-w-[88px]">
        <div className="flex items-center gap-1.5 px-1 pb-1.5 mb-0.5 border-b border-[#E0ECE0]">
          <div className="w-6 h-6 rounded-md bg-[#4A7C59]/20 flex items-center justify-center flex-shrink-0">
            {isNew ? <Zap size={12} className="text-[#4A7C59]" /> : <Edit2 size={12} className="text-[#4A7C59]" />}
          </div>
          <span className="text-[10px] font-semibold text-[#1A2E1A] leading-tight">
            {isNew ? '添加国家' : '编辑国家'}
          </span>
        </div>

        {COUNTRY_SECTIONS.map(sec => (
          <button
            key={sec.id}
            onClick={() => scrollToSection(sec.id)}
            className={`w-full px-2 py-1.5 rounded-xl text-[11px] font-medium transition-all text-left ${
              activeSection === sec.id
                ? 'text-white shadow-sm'
                : 'text-[#6B856B] hover:bg-[#F2F7F3]'
            }`}
            style={activeSection === sec.id ? { backgroundColor: sec.color } : {}}
          >
            {sec.label}
          </button>
        ))}

        <div className="border-t border-[#E0ECE0] mt-1 pt-1.5 flex flex-col gap-1.5">
          {form.name_cn && (
            <button
              onClick={onPreviewOpen}
              className="w-full flex items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] text-[#1C39BB] hover:bg-blue-50 transition-colors"
            >
              <ExternalLink size={11} />
              <span>预览</span>
            </button>
          )}
          <button
            onClick={onSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-[#4A7C59] hover:bg-[#3D6B4A] text-white text-[11px] font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? <SpinIcon /> : <Save size={11} />}
            {isNew ? '创建' : '保存'}
          </button>
          <button
            onClick={onCancel}
            className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-[#9AAA9A] hover:bg-gray-50 text-[11px] rounded-xl transition-colors"
          >
            <X size={11} />
            取消
          </button>
        </div>
      </div>

      {/* 表单主体 */}
      <div className="pl-28 space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="flex items-center gap-1.5 text-sm text-[#5C725C] hover:text-[#1A2E1A] transition-colors">
            <ChevronRight size={14} className="rotate-180" /> 返回列表
          </button>
          <span className="text-[#9AAA9A]">|</span>
          <span className="text-sm text-[#8AA08A]">
            {isNew ? '添加新国家' : `编辑：${form.name_cn || ''}`}
          </span>
          {!isNew && editingId && (
            <span className="text-xs text-[#A8BAA8]">ID: {editingId.slice(0, 8)}...</span>
          )}
        </div>

        {/* 基础信息 */}
        <fieldset className="space-y-4 bg-[#FAFCFA] rounded-2xl p-5 border border-[#E0ECE0]" id="country-section-basic">
          <legend className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7BA689] pb-2 border-b border-[#E0ECE0] w-full">
            <Globe size={13} /> 基础信息
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="国家名称 *" value={form.name_cn} onChange={v => setForm(f => ({ ...f, name_cn: v }))} placeholder="例如: 法国" required />
            <Field label="英文名" value={form.name_en} onChange={v => setForm(f => ({ ...f, name_en: v }))} placeholder="France" />
            <Select label="区域" value={form.region} onChange={v => setForm(f => ({ ...f, region: v }))}>
              <option value="">选择区域...</option>
              {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </Select>
            <Field label="子区域" value={form.sub_region} onChange={v => setForm(f => ({ ...f, sub_region: v }))} placeholder="例如: 南欧" />
            <div className="md:col-span-2">
              <TextArea label="国家印象" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} rows={3} placeholder="对国家的整体印象描述..." />
            </div>
            <Field label="到访次数" value={form.visit_count} onChange={v => setForm(f => ({ ...f, visit_count: v }))} type="number" />
            <Select label="解锁状态" value={form.unlock_code} onChange={v => setForm(f => ({ ...f, unlock_code: v }))}>
              <option value="0">🔒 未解锁</option>
              <option value="1">✅ 已解锁</option>
            </Select>
          </div>
        </fieldset>

        {/* 日志笔记 */}
        <CollapsibleSection title="日志与笔记（寻香日志 / Alice实验室）" id="country-section-logs">
          <div className="space-y-4 pt-2">
            <TextArea label="寻香日志（Eric Diary）" value={form.eric_diary} onChange={v => setForm(f => ({ ...f, eric_diary: v }))} rows={4} placeholder="Eric 在这个国家的实地探访记录..." />
            <TextArea label="Alice 实验室笔记" value={form.technical_info} onChange={v => setForm(f => ({ ...f, technical_info: v }))} rows={3} placeholder="Alice 的技术分析..." />
          </div>
        </CollapsibleSection>

        {/* 图片资源 */}
        <CollapsibleSection title={`图片资源（首页大图 / 风景相册等${form.image_url ? ' · 已设置' : ''}`} defaultOpen={!!form.image_url} id="country-section-images">
          <div className="space-y-4 pt-2">
            {/* 首页大图 - 缩略图 + 目的地页顶部 */}
            <ImageUploadField
              label="首页大图（缩略图 + 目的地页顶部）"
              value={form.image_url}
              onChange={v => setForm(f => ({ ...f, image_url: v }))}
              previewSize="w-full h-32 rounded-xl object-cover"
            />
            {/* 风景相册 — 国家页下方，建议3张 */}
            <div className="space-y-4 pt-2">
              <label className="text-xs font-medium text-[#5C725C] flex items-center gap-1">
                <Camera size={11} /> 风景相册（国家页下方，建议 3 张）
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map(idx => {
                  const urls = form.gallery_urls.split('\n').filter(Boolean);
                  return (
                    <ImageUploadField
                      key={idx}
                      label={`第${idx + 1}张`}
                      value={urls[idx] || ''}
                      onChange={v => {
                        const arr = form.gallery_urls.split('\n').filter(Boolean);
                        arr[idx] = v;
                        setForm(f => ({ ...f, gallery_urls: arr.join('\n') }));
                      }}
                      previewSize="w-full h-24 rounded-xl object-cover"
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* 关联产品 */}
        <fieldset className="space-y-4" id="country-section-products">
          <legend className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 pb-2 border-b border-[#E0ECE0] w-full">
            <Link2 size={13} /> 关联产品
            <span className="normal-case tracking-normal text-[10px] font-normal text-[#9AAA9A] ml-2">
              — 搜索或按系列筛选，快速绑定到此国家
              {form.boundProductIds.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-blue-500/10 text-blue-400/60 rounded text-[9px]">
                  已选 {form.boundProductIds.length} 款
                </span>
              )}
            </span>
          </legend>

          {products.length === 0 ? (
            <div className="text-center py-8 rounded-xl bg-[#F4F7F4] border border-dashed border-[#C8DDD0]">
              <Package size={24} className="mx-auto mb-2 text-[#9AAA9A]" />
              <p className="text-sm text-[#8AA08A]">暂无产品数据</p>
              <p className="text-xs text-[#A8BAA8] mt-1">请先在「产品管理」中添加产品</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 搜索栏 */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AAA9A]" />
                <input
                  type="text"
                  placeholder="搜索产品名称、英文名或代码..."
                  value={bindSearch}
                  onChange={e => onBindSearchChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] placeholder:text-[#A8BAA8] focus:border-blue-500/50 outline-none"
                />
              </div>

              {/* 系列标签筛选 */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => onBindSeriesFilterChange('')}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    !bindSeriesFilter ? 'bg-blue-500 text-white font-medium' : 'bg-[#F2F7F3] text-[#6B856B] hover:bg-[#E0ECE0]'
                  }`}
                >
                  全部
                </button>
                {series.map(s => (
                  <button
                    key={s.id}
                    onClick={() => onBindSeriesFilterChange(bindSeriesFilter === s.id ? '' : s.id)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${
                      bindSeriesFilter === s.id ? 'bg-blue-500 text-white font-medium' : 'bg-[#F2F7F3] text-[#6B856B] hover:bg-[#E0ECE0]'
                    }`}
                  >
                    {s.name_cn}
                  </button>
                ))}
              </div>

              {/* 产品网格 */}
              {bindableProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                  {bindableProducts.map(product => {
                    const isBound = form.boundProductIds.includes(product.id);
                    const seriesName = series.find(s => s.id === product.series_id)?.name_cn || '';
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => toggleProductBinding(product.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all ${
                          isBound
                            ? 'bg-blue-500/10 border-blue-300/50'
                            : 'bg-[#FAFCFA] border-[#E0ECE0] hover:border-blue-300/30 hover:bg-blue-500/5'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isBound ? 'bg-blue-500 border-blue-500' : 'border-[#C8DDD0]'
                        }`}>
                          {isBound && <Check size={9} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-[#2D442D] truncate leading-tight">{product.name_cn}</div>
                          <div className="text-[10px] text-[#9AAA9A] truncate">{seriesName}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-[#9AAA9A] text-sm rounded-lg bg-[#F4F7F4] border border-dashed border-[#C8DDD0]">
                  无匹配产品，试试换个搜索词
                </div>
              )}

              {/* 匹配数量 */}
              {(bindSearch || bindSeriesFilter) && bindableProducts.length > 0 && (
                <p className="text-xs text-[#9AAA9A] text-center">
                  共 {bindableProducts.length} 款匹配
                  {bindSeriesFilter && ` · 当前系列 ${series.find(s => s.id === bindSeriesFilter)?.name_cn}`}
                </p>
              )}

              {/* 已选产品摘要 */}
              {form.boundProductIds.length > 0 && (
                <div className="rounded-xl bg-blue-500/5 border border-blue-300/20 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Check size={13} className="text-blue-400" />
                    <span className="text-xs font-semibold text-blue-400">已选 {form.boundProductIds.length} 款产品</span>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, boundProductIds: [] }))}
                      className="ml-auto text-[10px] text-red-400/50 hover:text-red-400 transition-colors px-2 py-0.5 rounded hover:bg-red-500/10"
                    >
                      清空
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                    {form.boundProductIds.map(pid => {
                      const p = products.find(x => x.id === pid);
                      if (!p) return null;
                      return (
                        <span
                          key={pid}
                          onClick={() => toggleProductBinding(pid)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-300/80 rounded-full text-[10px] cursor-pointer hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        >
                          {p.name_cn}
                          <X size={9} />
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </fieldset>

        {/* 底部操作栏 */}
        <div className="flex items-center gap-4 pt-3 border-t border-[#E0ECE0]">
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl bg-[#F2F7F3] border border-[#E0ECE0]">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
              className="accent-[#4A7C59]"
            />
            <span className="text-sm text-[#2D442D]">激活显示</span>
          </label>
          <Field label="排序" value={form.sort_order} onChange={v => setForm(f => ({ ...f, sort_order: v }))} type="number" />
        </div>
      </div>

      {/* ====== 底部固定保存栏 ====== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#E0ECE0] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3 text-sm text-[#8AA08A]">
            <Globe size={16} />
            <span>{isNew ? '添加新国家' : `编辑：${form.name_cn || ''}`}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-[#E0ECE0] text-sm text-[#5C725C] hover:bg-[#F4F7F4] transition-colors"
            >
              取消
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#4A7C59] hover:bg-[#3D6B4A] text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-[#4A7C59]/20 disabled:opacity-50"
            >
              {saving ? <SpinIcon /> : <Save size={16} />}
              {saving ? '保存中...' : (isNew ? '创建国家' : '保存修改')}
            </button>
          </div>
        </div>
      </div>
      {/* 底部留白，防止内容被固定栏遮挡 */}
      <div className="h-20" />

      {/* 前台预览弹窗 */}
      {showPreview && editingId && (
        <CountryPreviewModal form={form} countryId={editingId} onClose={onPreviewClose} />
      )}
    </div>
  );
}

// ============================================
// 前台预览弹窗
// ============================================
function CountryPreviewModal({ form, countryId, onClose }: { form: CountryForm; countryId: string; onClose: () => void }) {
  const galleryUrls = form.gallery_urls ? form.gallery_urls.split('\n').filter(Boolean) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-[#E0ECE0] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4A7C59]/20 flex items-center justify-center">
              <Eye size={16} className="text-[#4A7C59]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1A2E1A]">前台预览</h3>
              <p className="text-[10px] text-[#9AAA9A]">模拟用户在前台看到的国家页面</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F2F7F3] rounded-xl text-[#6B856B]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 国家大图 */}
          {form.image_url ? (
            <div className="aspect-video rounded-2xl overflow-hidden bg-[#F2F7F3]">
              <img src={form.image_url} alt={form.name_cn} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-video rounded-2xl bg-[#F2F7F3] border-2 border-dashed border-[#C8DDD0] flex items-center justify-center">
              <Globe size={48} className="text-[#A8BAA8]" />
            </div>
          )}

          {/* 国家信息 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-[#1A2E1A]">{form.name_cn || '未命名国家'}</h1>
              {form.name_en && <span className="text-sm text-[#8AA08A] italic">{form.name_en}</span>}
              {form.region && (
                <span className="px-2.5 py-0.5 rounded-full text-xs bg-[#F2F7F3] text-[#5C725C]">{form.region}</span>
              )}
              {form.sub_region && (
                <span className="px-2.5 py-0.5 rounded-full text-xs bg-[#F2F7F3] text-[#8AA08A]">{form.sub_region}</span>
              )}
            </div>

            {/* 状态标签 */}
            <div className="flex items-center gap-2 flex-wrap">
              {form.is_active ? (
                <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-600">已上线</span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-400">草稿</span>
              )}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                form.unlock_code !== '0' && form.unlock_code !== ''
                  ? 'bg-green-100 text-green-600'
                  : 'bg-zinc-100 text-gray-400'
              }`}>
                {form.unlock_code !== '0' && form.unlock_code !== '' ? '已解锁' : '🔒 未解锁'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-500">
                到访 {form.visit_count || 0} 次
              </span>
              {form.boundProductIds.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-400">
                  <Link2 size={10} className="inline mr-0.5" />
                  {form.boundProductIds.length} 款产品
                </span>
              )}
            </div>

            {/* 国家印象 */}
            {form.description && (
              <div className="rounded-xl bg-[#F8FAF8] border border-[#E0ECE0] p-4">
                <p className="text-sm font-medium text-[#4A7C59] mb-1.5">国家印象</p>
                <p className="text-sm text-[#5C725C] leading-relaxed">{form.description}</p>
              </div>
            )}

            {/* 寻香日志 */}
            {form.eric_diary && (
              <div className="rounded-xl bg-[#FFFBF0] border border-[#F0E8D0] p-4">
                <p className="text-sm font-medium text-[#8B7355] mb-1.5">寻香日志</p>
                <p className="text-sm text-[#5C725C] leading-relaxed">{form.eric_diary}</p>
              </div>
            )}

            {/* Alice实验室 */}
            {form.technical_info && (
              <div className="rounded-xl bg-[#F5F7FF] border border-[#E0E8F5] p-4">
                <p className="text-sm font-medium text-[#4A6891] mb-1.5">Alice 实验室</p>
                <p className="text-sm text-[#5C725C] leading-relaxed">{form.technical_info}</p>
              </div>
            )}

            {/* 风景图 */}
            {form.scenery_url && (
              <div>
                <p className="text-xs font-medium text-[#8AA08A] mb-2">风景图</p>
                <img src={form.scenery_url} alt="风景" className="w-full h-40 object-cover rounded-xl bg-[#F2F7F3]" />
              </div>
            )}

            {/* Eric相册 */}
            {galleryUrls.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[#8AA08A] mb-2">Eric 相册（{galleryUrls.length} 张）</p>
                <div className="grid grid-cols-3 gap-2">
                  {galleryUrls.slice(0, 6).map((url, i) => (
                    <img key={i} src={url} alt="" className="rounded-xl w-full aspect-square object-cover bg-[#F2F7F3]" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 跳转到前台 */}
        <div className="px-6 py-3 bg-[#F2F7F3] border-t border-[#E0ECE0] rounded-b-3xl flex items-center justify-between">
          <p className="text-xs text-[#9AAA9A]">👆 前台展示效果预览</p>
          <a
            href={`${window.location.origin}/#${btoa(JSON.stringify({ v: 'destination', p: { countryId } }))}`}
            target="_new"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#4A7C59] text-white text-xs font-medium hover:bg-[#3D6B4D] transition-colors"
          >
            <ExternalLink size={12} />
            打开前台国家
          </a>
        </div>
      </div>
    </div>
  );
}

// ============================================
// UI 子组件
// ============================================

function Field({ label, value, onChange, type = 'text', placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#6B856B] mb-1.5">{label}{required && ' *'}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] placeholder:text-[#9AAA9A] focus:border-[#4A7C59]/50 outline-none transition-colors"
      />
    </div>
  );
}

function Select({ label, value, onChange, children }: {
  label: string; value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#6B856B] mb-1.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] outline-none"
      >
        {children}
      </select>
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 3, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#6B856B] mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] placeholder:text-[#9AAA9A] focus:border-[#4A7C59]/50 outline-none resize-y"
      />
    </div>
  );
}

function CollapsibleSection({ title, children, defaultOpen = false, id }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean; id?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <fieldset className="space-y-4" id={id}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 text-xs font-semibold uppercase pb-2 border-b border-[#E0ECE0] w-full cursor-pointer select-none transition-colors ${
          open ? 'text-[#7A967A]' : 'text-[#7A967A] hover:text-[#8AA08A]'
        }`}
      >
        {title}
        <ChevronRight size={11} className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && <div>{children}</div>}
    </fieldset>
  );
}

function SpinIcon() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
