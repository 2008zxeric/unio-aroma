import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Search, Filter, Edit2, Trash2, Eye,
  Upload, Download, ChevronDown, ChevronUp,
  Package, ToggleLeft, ToggleRight, X,
} from 'lucide-react';
import { productService, seriesService, countryService } from '../../lib/dataService';
import type { Product, Series, Country, SUB_CATEGORY_LABELS } from '../../lib/database.types';
import { SERIES_INFO } from '../../lib/database.types';

// 产品表单字段类型
interface ProductForm {
  // 基本信息
  code: string;
  name_cn: string;
  name_en: string;
  scientific_name: string;
  short_desc: string;
  
  // 分类
  series_id: string;
  country_id: string;        // 主要绑定国家
  element: string;
  category: string;
  group_name: string;

  // 价格
  price_5ml: string;
  price_10ml: string;
  price_30ml: string;

  // 详情
  origin: string;
  extraction_method: string;
  description: string;
  benefits: string;
  usage: string;
  narrative: string;
  alice_lab: string;
  specification: string;
  xiaohongshu_url: string;
  similar_ids: string;

  // 图片
  image_url: string;
  gallery_urls: string;

  // 状态
  is_active: boolean;
  sort_order: string;
}

const emptyForm = (): ProductForm => ({
  code: '', name_cn: '', name_en: '', scientific_name: '', short_desc: '',
  series_id: '', country_id: '', element: '', category: '', group_name: '',
  price_5ml: '', price_10ml: '', price_30ml: '',
  origin: '', extraction_method: '', description: '', benefits: '', usage: '',
  narrative: '', alice_lab: '', specification: '', xiaohongshu_url: '', similar_ids: '',
  image_url: '', gallery_urls: '',
  is_active: true, sort_order: '0',
});

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeries, setFilterSeries] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  
  // 编辑状态
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [showDetailId, setShowDetailId] = useState<string | null>(null);

  // 加载数据
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsData, seriesData, countriesData] = await Promise.all([
        productService.getAll(),
        seriesService.getAllWithInactive(),
        countryService.getAll(),
      ]);
      setProducts(productsData);
      setSeries(seriesData);
      setCountries(countriesData);
    } catch (err) {
      console.error('加载产品失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // 过滤逻辑
  const filtered = products.filter(p => {
    const matchSearch = !searchQuery || 
      p.name_cn.includes(searchQuery) || 
      (p.name_en && p.name_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchSeries = !filterSeries || p.series?.id === filterSeries;
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? p.is_active : !p.is_active);
    
    return matchSearch && matchSeries && matchStatus;
  });

  // ---- CRUD 操作 ----

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      code: product.code || '',
      name_cn: product.name_cn || '',
      name_en: product.name_en || '',
      scientific_name: product.scientific_name || '',
      short_desc: product.short_desc || '',
      series_id: product.series_id || '',
      country_id: product.country_id || '',
      element: product.element || '',
      category: product.category || '',
      group_name: product.group_name || '',
      price_5ml: String(product.price_5ml ?? ''),
      price_10ml: String(product.price_10ml ?? ''),
      price_30ml: String(product.price_30ml ?? ''),
      origin: product.origin || '',
      extraction_method: product.extraction_method || '',
      description: product.description || '',
      benefits: Array.isArray(product.benefits) ? product.benefits.join(', ') : (product.benefits || ''),
      usage: product.usage || '',
      narrative: product.narrative || '',
      alice_lab: product.alice_lab || '',
      specification: product.specification || '',
      xiaohongshu_url: product.xiaohongshu_url || '',
      similar_ids: Array.isArray(product.similar_ids) ? product.similar_ids.join(', ') : (product.similar_ids || ''),
      image_url: product.image_url || '',
      gallery_urls: Array.isArray(product.gallery_urls) ? product.gallery_urls.join('\n') : (product.gallery_urls || ''),
      is_active: product.is_active,
      sort_order: String(product.sort_order ?? 0),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!form.name_cn.trim() || !form.code.trim()) {
      alert('请至少填写产品名称和产品代码！');
      return;
    }

    try {
      setSaving(true);
      
      const record: Partial<Product> = {
        code: form.code.trim(),
        name_cn: form.name_cn.trim(),
        name_en: form.name_en.trim() || null,
        scientific_name: form.scientific_name.trim() || null,
        short_desc: form.short_desc.trim() || null,
        series_id: form.series_id || null,
        country_id: form.country_id || null,
        element: form.element || null,
        category: form.category || null,
        group_name: form.group_name || null,
        price_5ml: form.price_5ml ? parseFloat(form.price_5ml) : null,
        price_10ml: form.price_10ml ? parseFloat(form.price_10ml) : null,
        price_30ml: form.price_30ml ? parseFloat(form.price_30ml) : null,
        origin: form.origin.trim() || null,
        extraction_method: form.extraction_method.trim() || null,
        description: form.description.trim() || null,
        benefits: form.benefits.split(/[,，]/).map(s => s.trim()).filter(Boolean),
        usage: form.usage.trim() || null,
        narrative: form.narrative.trim() || null,
        alice_lab: form.alice_lab.trim() || null,
        specification: form.specification.trim() || null,
        xiaohongshu_url: form.xiaohongshu_url.trim() || null,
        similar_ids: form.similar_ids.split(/[,，]/).map(s => s.trim()).filter(Boolean),
        image_url: form.image_url.trim() || null,
        gallery_urls: form.gallery_urls.split('\n').map(s => s.trim()).filter(Boolean),
        is_active: form.is_active,
        sort_order: parseInt(form.sort_order) || 0,
      };

      if (editingId) {
        await productService.update(editingId, record);
      } else {
        await productService.create(record);
      }
      
      await loadData();
      setEditingId(null);
      setForm(emptyForm());
    } catch (err: any) {
      console.error('保存失败:', err);
      alert('保存失败：' + (err.message || '未知错误'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除此产品？此操作不可恢复！')) return;
    try {
      await productService.delete(id);
      await loadData();
    } catch (err: any) {
      alert('删除失败：' + err.message);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await productService.update(product.id, { is_active: !product.is_active });
      await loadData();
    } catch (err: any) {
      alert('操作失败：' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">产品管理</h2>
          <p className="text-sm text-white/40 mt-1">管理所有精油产品，包括元·单方、和·复方、生·纯露、香·空间</p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#D75437] hover:bg-[#D75437]/80 text-white rounded-xl font-medium text-sm transition-colors"
        >
          <Plus size={16} />
          添加产品
        </button>
      </div>

      {/* 编辑表单（展开在顶部） */}
      {(editingId !== null || (editingId === null && form.code === '' && products.length === 0)) && (
        <ProductEditForm
          form={form}
          setForm={setForm}
          series={series}
          countries={countries}
          saving={saving}
          onSave={handleSave}
          onCancel={() => { setEditingId(null); setForm(emptyForm()); }}
          isNew={editingId === null}
        />
      )}

      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            type="text"
            placeholder="搜索产品名称、代码..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-white/8 rounded-xl text-sm text-white placeholder:text-white/25 focus:border-[#D75437]/50 focus:outline-none transition-colors"
          />
        </div>
        <select
          value={filterSeries}
          onChange={e => setFilterSeries(e.target.value)}
          className="px-3 py-2.5 bg-[#1a1a1a] border border-white/8 rounded-xl text-sm text-white focus:outline-none"
        >
          <option value="">全部系列</option>
          {series.map(s => (
            <option key={s.id} value={s.id}>{s.name_cn}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as any)}
          className="px-3 py-2.5 bg-[#1a1a1a] border border-white/8 rounded-xl text-sm text-white focus:outline-none"
        >
          <option value="all">全部状态</option>
          <option value="active">已上架</option>
          <option value="inactive">已下架</option>
        </select>
      </div>

      {/* 统计 */}
      <div className="flex items-center gap-6 text-xs text-white/35">
        <span>共 {filtered.length} 个产品</span>
        <span>上架 {filtered.filter(p => p.is_active).length}</span>
        <span>下架 {filtered.filter(p => !p.is_active).length}</span>
      </div>

      {/* 产品列表 */}
      {loading ? (
        <div className="text-center py-20 text-white/40">加载中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <Package size={48} className="mx-auto mb-4 opacity-30" />
          <p>暂无产品数据</p>
          <button onClick={startCreate} className="mt-4 text-[#D75437] hover:underline text-sm">添加第一个产品 →</button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(product => (
            <div
              key={product.id}
              className={`group rounded-xl bg-[#1a1a1a] border transition-all duration-200 ${
                showDetailId === product.id ? 'border-white/15' : 'border-white/5 hover:border-white/10'
              }`}
            >
              {/* 主行 */}
              <div className="flex items-center gap-4 px-4 py-3">
                {/* 缩略图 */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                  {product.image_url ? (
                    <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/15">
                      <Package size={18} />
                    </div>
                  )}
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-white truncate">{product.name_cn}</h4>
                    {product.name_en && (
                      <span className="text-xs text-white/30 hidden sm:inline truncate">{product.name_en}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-white/30">
                    <code className="bg-white/5 px-1.5 py-0.5 rounded">{product.code}</code>
                    {product.series && (
                      <span className="text-[#D4AF37]/70">{product.series.name_cn}</span>
                    )}
                    {product.country && (
                      <span>{product.country.name_cn}</span>
                    )}
                    {product.price_10ml && <span>¥{product.price_10ml}/10ml</span>}
                  </div>
                </div>

                {/* 状态标签 + 操作按钮 */}
                <div className="flex items-center gap-2 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleToggleActive(product)}
                    title={product.is_active ? '下架' : '上架'}
                  >
                    {product.is_active ? (
                      <ToggleRight size={22} className="text-green-400" />
                    ) : (
                      <ToggleLeft size={22} className="text-white/25" />
                    )}
                  </button>
                  
                  <Link to={`/admin/products/${product.id}`} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors" title="详情编辑">
                    <Edit2 size={14} className="text-white/50" />
                  </Link>
                  <button onClick={() => setShowDetailId(showDetailId === product.id ? null : product.id)} className="p-1.5 hover:bg-white/5 rounded-lg" title="展开详情">
                    {showDetailId === product.id ? <ChevronUp size={14} className="text-white/50" /> : <ChevronDown size={14} className="text-white/50" />}
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors" title="删除">
                    <Trash2 size={14} className="text-red-400/50 hover:text-red-400" />
                  </button>
                </div>
              </div>

              {/* 展开详情行 */}
              {showDetailId === product.id && (
                <div className="px-4 pb-4 pt-1 border-t border-white/5 mt-1">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs pt-3">
                    {[
                      ['学名', product.scientific_name],
                      ['短描述', product.short_desc],
                      ['产地', product.origin],
                      ['提炼方式', product.extraction_method],
                      ['规格', product.specification],
                      ['库存(ml)', String(product.stock_quantity ?? '-')],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <span className="text-white/25 block">{label}</span>
                        <span className="text-white/60 break-all">{val || '-'}</span>
                      </div>
                    ))}
                  </div>
                  {Array.isArray(product.gallery_urls) && product.gallery_urls.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {product.gallery_urls.slice(0, 6).map((url, i) => (
                        <img key={i} src={url} alt="" className="w-16 h-16 rounded-lg object-cover bg-white/5" />
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex gap-2 justify-end">
                    <Link to={`/admin/products/${product.id}`} className="text-xs text-[#D75437] hover:underline">
                      完整编辑 →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// 内嵌编辑表单组件
// ============================================

function ProductEditForm({ 
  form, setForm, series, countries, saving, onSave, onCancel, isNew 
}: {
  form: ProductForm;
  setForm: React.Dispatch<React.SetStateAction<ProductForm>>;
  series: Series[];
  countries: Country[];
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
  isNew: boolean;
}) {
  const updateField = (field: keyof ProductForm, value: string | boolean) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      
      // ⭐ 选择子分类时，自动填充 group_name 和 series_code
      if (field === 'category' && typeof value === 'string') {
        const cat = value as keyof typeof SUB_CATEGORY_LABELS;
        // 自动生成子组名：如 "元·金"、"生·清净"
        const catLabel = SUB_CATEGORY_LABELS[cat] || '';
        if (catLabel && catLabel !== '未分类') {
          // 根据子分类推断系列
          let seriesName = '';
          if (['jin','mu','shui','huo','tu'].includes(cat)) seriesName = '元';
          else if (['body','mind','soul'].includes(cat)) seriesName = '和';
          else if (['clear','nourish','soothe'].includes(cat)) seriesName = '生';
          else if (['aesthetic','meditation'].includes(cat)) seriesName = '香';
          
          updated.group_name = `${seriesName}·${catLabel}`;
          // 同时自动设置 series_code
          if (seriesName === '元') updated.series_code = 'yuan';
          else if (seriesName === '和') updated.series_code = 'he';
          else if (seriesName === '生') updated.series_code = 'sheng';
          else if (seriesName === '香') updated.series_code = 'jing';
        }
      }
      
      return updated;
    });
  };

  return (
    <div className="rounded-2xl bg-[#161616] border border-white/10 p-6 space-y-6 relative overflow-hidden">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{isNew ? '添加新产品' : '编辑产品'}</h3>
        <button onClick={onCancel} className="p-1.5 hover:bg-white/5 rounded-lg text-white/40">
          <X size={18} />
        </button>
      </div>

      {/* 基本信息区 */}
      <Section title="基本信息" defaultOpen>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="产品代码 *" value={form.code} onChange={v => updateField('code', v)} placeholder="例如: yuans-001" required />
          <FormField label="产品展示名称 *" value={form.name_cn} onChange={v => updateField('name_cn', v)} placeholder="中文显示名" required />
          <FormField label="产品英文名" value={form.name_en} onChange={v => updateField('name_en', v)} placeholder="English Name" />
          <FormField label="产品学名" value={form.scientific_name} onChange={v => updateField('scientific_name', v)} placeholder="拉丁文学名" />
          <div className="md:col-span-2">
            <FormField label="短描述（特点提炼）" value={form.short_desc} onChange={v => updateField('short_desc', v)} placeholder="一句话概括产品特点..." />
          </div>
        </div>
      </Section>

      {/* 归类区 */}
      <Section title="归类与关联">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SelectField label="所属系列" value={form.series_id} onChange={v => updateField('series_id', v)}>
            <option value="">选择系列...</option>
            {series.map(s => <option key={s.id} value={s.id}>{s.name_cn}</option>)}
          </SelectField>
          
          <SelectField label="绑定国家（主要）" value={form.country_id} onChange={v => updateField('country_id', v)}>
            <option value="">选择国家...</option>
            {countries.map(c => <option key={c.id} value={c.id}>{c.name_cn}</option>)}
          </SelectField>
          
          <SelectField label="五行元素" value={form.element} onChange={v => updateField('element', v)}>
            <option value="">选择元素...</option>
            {['金', '木', '水', '火', '土'].map(el => <option key={el} value={el}>{el}</option>)}
          </SelectField>

          {/* ⭐ 子分类 — 13个精确选项 */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">子分类（系列×子类）</label>
            <select
              value={form.category}
              onChange={e => updateField('category', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#D75437] focus:ring-1 focus:ring-[#D75437] outline-none"
            >
              <option value="">选择子分类...</option>
              <optgroup label="🔥 元 · 五行 (yuan)">
                <option value="jin">金 — Metal</option>
                <option value="mu">木 — Wood</option>
                <option value="shui">水 — Water</option>
                <option value="huo">火 — Fire</option>
                <option value="tu">土 — Earth</option>
              </optgroup>
              <optgroup label="⚗️ 和 · 复方 (he)">
                <option value="body">身体 — Body</option>
                <option value="mind">心智 — Mind</option>
                <option value="soul">灵魂 — Soul</option>
              </optgroup>
              <optgroup label="💧 生 · 纯露 (sheng)">
                <option value="clear">清净 — Clear</option>
                <option value="nourish">润养 — Nourish</option>
                <option value="soothe">舒缓 — Soothe</option>
              </optgroup>
              <optgroup label="✨ 香 · 空间 (jing)">
                <option value="aesthetic">芳香美学 — Aesthetic</option>
                <option value="meditation">凝思之物 — Meditation</option>
              </optgroup>
              <option value="none">未分类 — None</option>
            </select>
          </div>

          <FormField label="子组名称" value={form.group_name} onChange={v => updateField('group_name', v)} placeholder="自动生成，如: 元·金" />
          <FormField label="排序" value={form.sort_order} onChange={v => updateField('sort_order', v)} type="number" />
        </div>
      </Section>

      {/* 价格区 */}
      <Section title="价格设置（至少填一项）">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="5ml 售价(¥)" value={form.price_5ml} onChange={v => updateField('price_5ml', v)} type="number" step="0.01" placeholder="0.00" prefix="¥" />
          <FormField label="10ml 售价(¥)" value={form.price_10ml} onChange={v => updateField('price_10ml', v)} type="number" step="0.01" placeholder="0.00" prefix="¥" />
          <FormField label="30ml 售价(¥)" value={form.price_30ml} onChange={v => updateField('price_30ml', v)} type="number" step="0.01" placeholder="0.00" prefix="¥" />
        </div>
      </Section>

      {/* 产地与工艺 */}
      <Section title="产地与工艺">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="产地" value={form.origin} onChange={v => updateField('origin', v)} placeholder="例如: 法国普罗旺斯" />
          <FormField label="提炼方式" value={form.extraction_method} onChange={v => updateField('extraction_method', v)} placeholder="例如: 蒸馏萃取 / 脂吸法 / 压榨法" />
        </div>
      </Section>

      {/* 详细内容 */}
      <Section title="详细内容">
        <TextAreaField label="Eric 叙事/描述" value={form.description} onChange={v => updateField('description', v)} rows={4} placeholder="产品的完整叙事文案..." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <TextAreaField label="参考功效 (逗号分隔)" value={form.benefits} onChange={v => updateField('benefits', v)} rows={2} placeholder="舒缓放松, 助眠安神, 修复肌肤" />
          <TextAreaField label="使用说明" value={form.usage} onChange={v => updateField('usage', v)} rows={2} placeholder="使用方法和注意事项..." />
        </div>
        <TextAreaField label="Alice Lab 日记" value={form.alice_lab} onChange={v => updateField('alice_lab', v)} rows={3} placeholder="实验室笔记..." className="mt-4" />
        <TextAreaField label="寻香日志/Eric 日记" value={form.narrative} onChange={v => updateField('narrative', v)} rows={3} placeholder="Eric 的实地探访记录..." className="mt-4" />
      </Section>

      {/* 图片区 */}
      <Section title="图片管理">
        <FormField label="页首大图 URL" value={form.image_url} onChange={v => updateField('image_url', v)} placeholder="https://..." />
        <TextAreaField 
          label="产品图片 URLs (每行一张，1-3张)" 
          value={form.gallery_urls} 
          onChange={v => updateField('gallery_urls', v)} 
          rows={3} 
          placeholder="https://...图片1&#10;https://...图片2&#10;https://...图片3" 
        />
        {form.image_url && (
          <div className="mt-3">
            <span className="text-xs text-white/30 mb-1 block">预览：</span>
            <img src={form.image_url} alt="预览" className="max-h-32 rounded-lg object-contain bg-white/5" />
          </div>
        )}
      </Section>

      {/* 链接与推荐 */}
      <Section title="链接与推荐">
        <FormField label="购买链接（小红书等）" value={form.xiaohongshu_url} onChange={v => updateField('xiaohongshu_url', v)} placeholder="https://xhslink.com/..." />
        <FormField label="相似推荐产品ID（逗号分隔）" value={form.similar_ids} onChange={v => updateField('similar_ids', v)} placeholder="uuid1, uuid2, uuid3" />
      </Section>

      {/* 其他 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="规格说明" value={form.specification} onChange={v => updateField('specification', v)} placeholder="例如: 100%纯精油" />
        <div className="flex items-end gap-3">
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => updateField('is_active', e.target.checked)}
              className="accent-[#D75437]"
            />
            <span className="text-sm text-white/80">立即上架</span>
          </label>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
        <button onClick={onCancel} className="px-5 py-2.5 text-sm text-white/50 hover:text-white rounded-xl hover:bg-white/5 transition-colors">
          取消
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-6 py-2.5 bg-[#D75437] hover:bg-[#D75437]/80 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <RefreshIcon />}
          {isNew ? '创建产品' : '保存修改'}
        </button>
      </div>
    </div>
  );
}

// ============================================
// 表单 UI 子组件
// ============================================

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-sm font-medium text-white/80">{title}</span>
        <ChevronDown size={16} className={`text-white/30 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text', placeholder, required, prefix }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; prefix?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/40 mb-1.5">{label}{required && '*'}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-sm">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${prefix ? 'pl-7 pr-3' : 'px-3'} py-2.5 bg-[#0f0f0f] border border-white/8 rounded-lg text-sm text-white placeholder:text-white/20 focus:border-[#D75437]/50 focus:outline-none transition-colors`}
        />
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, children }: {
  label: string; value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/40 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 bg-[#0f0f0f] border border-white/8 rounded-lg text-sm text-white focus:outline-none"
      >
        {children}
      </select>
    </div>
  );
}

function TextAreaField({ label, value, onChange, rows = 3, placeholder, className = '' }: {
  label: string; value: string; onChange: (v: string) => void;
  rows?: number; placeholder?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-white/40 mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-[#0f0f0f] border border-white/8 rounded-lg text-sm text-white placeholder:text-white/20 focus:border-[#D75437]/50 focus:outline-none resize-y"
      />
    </div>
  );
}

function RefreshIcon() {
  return <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.924 3 8.11l2.111-1.819z"/></svg>;
}
