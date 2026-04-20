import { useEffect, useState, useMemo } from 'react';
import { Plus, Trash2, X, BookText, Edit2, Users, Save, ChevronRight, ChevronDown, Layers, Settings2, AlertCircle, Eye, EyeOff, KeyRound } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { dictService, userService, seriesService } from '../../lib/dataService';
import { useAuth, getUserPassword, updateUserPassword } from '../../lib/auth';
import type { DictItem, AdminUser, Series } from '../../lib/database.types';

// ============================================
// 系列配色（和前台保持一致的视觉风格）
// ============================================
const SERIES_COLORS: Record<string, { bg: string; border: string; text: string; light: string }> = {
  yuan: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', light: 'bg-amber-100/60' },
  he:   { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   light: 'bg-blue-100/60' },
  sheng:{ bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  light: 'bg-green-100/60' },
  jing: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', light: 'bg-purple-100/60' },
};
const DEFAULT_COLOR = { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', light: 'bg-gray-100/60' };

// 系列子分类与 dict_items 的默认映射（初始化用）
const SERIES_CATEGORIES: Record<string, { label: string; value: string }[]> = {
  yuan:  [{ label: '金', value: 'jin' }, { label: '木', value: 'mu' }, { label: '水', value: 'shui' }, { label: '火', value: 'huo' }, { label: '土', value: 'tu' }],
  he:    [{ label: '身体', value: 'body' }, { label: '心智', value: 'mind' }, { label: '灵魂', value: 'soul' }],
  sheng: [{ label: '清净', value: 'clear' }, { label: '润养', value: 'nourish' }, { label: '舒缓', value: 'soothe' }],
  jing:  [{ label: '芳香美学', value: 'aesthetic' }, { label: '凝思之物', value: 'meditation' }],
};

// 不属于分类体系的字典类型
const GENERAL_DICT_TYPES = [
  { value: 'supplier', label: '供货商', desc: '供货商等级与信息' },
  { value: 'extraction_method', label: '提炼方式', desc: '蒸馏萃取、压榨法等' },
  { value: 'region', label: '区域分类', desc: '欧洲、亚洲、神州等' },
];

// ============================================
// 字典管理主组件（Tab1: 分类体系 + Tab2: 其他字典）
// ============================================
export function AdminDicts() {
  const [activeTab, setActiveTab] = useState<'taxonomy' | 'general'>('taxonomy');
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1A2E1A]">字典管理</h2>
        <p className="text-sm text-[#6B856B] mt-1">管理产品分类体系、供货商、提炼方式等枚举数据</p>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-1 p-1 bg-[#F0F5F0] rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('taxonomy')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'taxonomy' ? 'bg-white text-[#1A2E1A] shadow-sm' : 'text-[#6B856B] hover:text-[#1A2E1A]'
          }`}
        >
          <Layers size={15} /> 分类体系
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'general' ? 'bg-white text-[#1A2E1A] shadow-sm' : 'text-[#6B856B] hover:text-[#1A2E1A]'
          }`}
        >
          <Settings2 size={15} /> 其他字典
        </button>
      </div>

      {activeTab === 'taxonomy' ? <TaxonomyView /> : <GeneralDictView />}
    </div>
  );
}

// ============================================
// Tab1: 分类体系管理（系列 → 子分类 层级）
// ============================================
function TaxonomyView() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<DictItem[]>([]);
  // 默认全部展开：所有系列 ID 都放进去
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showSubForm, setShowSubForm] = useState(false);
  const [editingSub, setEditingSub] = useState<DictItem | null>(null);
  const [subForm, setSubForm] = useState({ label: '', value: '', sort_order: '0' });
  const [currentSeriesId, setCurrentSeriesId] = useState('');
  const [initing, setIniting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sList, { data: subs }] = await Promise.all([
        seriesService.getAll(),
        supabase.from('dict_items').select('*').eq('dict_type', 'subcategory').order('sort_order'),
      ]);
      setSeriesList(sList);
      setAllSubcategories((subs || []) as DictItem[]);
      // 默认全部展开
      setExpandedSeries(new Set(sList.map(s => s.id)));
    } catch (err) {
      console.error('加载分类体系失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const toggleSeries = (id: string) => {
    setExpandedSeries(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSeries(new Set(seriesList.map(s => s.id)));
  };

  const collapseAll = () => {
    setExpandedSeries(new Set());
  };

  // 将子分类按 series code 分组到各系列下
  // ⚠️ 注意：dict_items.parent_id 是自引用(dict_items→dict_items)，
  // 不是关联 series 表！所以用 SERIES_CATEGORIES[value] 来判断归属关系
  const seriesWithSubs = useMemo(() => {
    return seriesList.map(s => {
      const cats = SERIES_CATEGORIES[s.code] || [];
      const catValues = new Set(cats.map(c => c.value));
      return {
        ...s,
        subcategories: allSubcategories
          .filter(sub => catValues.has(sub.value))
          .sort((a, b) => a.sort_order - b.sort_order),
        color: SERIES_COLORS[s.code] || DEFAULT_COLOR,
      };
    });
  }, [seriesList, allSubcategories]);

  // 检查是否有系列缺少子分类（需要初始化）
  // ⚠️ 同样用 value 匹配，不能用 parent_id
  const needsInit = useMemo(() => {
    const subValues = new Set(allSubcategories.map(sub => sub.value));
    return seriesList.some(s => {
      const cats = SERIES_CATEGORIES[s.code];
      if (!cats) return false;
      return !cats.some(cat => subValues.has(cat.value));
    });
  }, [seriesList, allSubcategories]);

  // 初始化分类体系数据：清理旧数据 + 为每个系列创建标准子分类
  // ⚠️ parent_id 是自引用(dict_items→dict_items)，不是 series.id！所以一律设 null
  const handleInit = async () => {
    if (initing) return;
    setIniting(true);
    try {
      // 1. 删除所有旧的 subcategory
      const { error: err1 } = await supabase
        .from('dict_items')
        .delete()
        .eq('dict_type', 'subcategory');
      if (err1) console.warn('清理旧 subcategory:', err1.message);

      // 2. 删除所有旧的 element 冗余数据
      const { error: err2 } = await supabase
        .from('dict_items')
        .delete()
        .eq('dict_type', 'element');
      if (err2) console.warn('清理旧 element:', err2.message);

      // 3. 收集所有要插入的子分类
      const rows: any[] = [];
      let sortIdx = 1;
      for (const s of seriesList) {
        const cats = SERIES_CATEGORIES[s.code];
        if (!cats) continue;
        for (const cat of cats) {
          rows.push({
            dict_type: 'subcategory',
            label: cat.label,
            value: cat.value,
            sort_order: sortIdx++,
            is_active: true,
            parent_id: null,  // ⚠️ 必须是 null！外键自引用 dict_items(id)
          });
        }
      }

      // 4. 一次性批量插入
      if (rows.length > 0) {
        const { error: err3 } = await supabase.from('dict_items').insert(rows);
        if (err3) {
          console.error('批量插入子分类失败:', err3.message);
          alert('初始化失败：' + err3.message);
        }
      }

      await loadData();
    } catch (err: any) {
      alert('初始化失败：' + err.message);
    } finally {
      setIniting(false);
    }
  };

  // 打开新增子分类表单
  const openAddSub = (seriesId: string) => {
    setCurrentSeriesId(seriesId);
    setEditingSub(null);
    setSubForm({ label: '', value: '', sort_order: String(seriesWithSubs.find(s => s.id === seriesId)?.subcategories.length || 0) + 1 });
    setShowSubForm(true);
  };

  // 打开编辑子分类
  const openEditSub = (sub: DictItem, seriesId: string) => {
    setCurrentSeriesId(seriesId);
    setEditingSub(sub);
    setSubForm({ label: sub.label, value: sub.value, sort_order: String(sub.sort_order) });
    setShowSubForm(true);
  };

  // 保存子分类
  const handleSaveSub = async () => {
    if (!subForm.label.trim()) { alert('请填写分类名称！'); return; }
    if (!subForm.value.trim()) { alert('请填写英文标识！'); return; }
    try {
      if (editingSub) {
        await dictService.update(editingSub.id, {
          label: subForm.label.trim(),
          value: subForm.value.trim(),
          sort_order: parseInt(subForm.sort_order) || 0,
        });
      } else {
        await dictService.create({
          dict_type: 'subcategory',
          label: subForm.label.trim(),
          value: subForm.value.trim(),
          sort_order: parseInt(subForm.sort_order) || 0,
          is_active: true,
          parent_id: null,  // ⚠️ 必须是 null！外键自引用
        });
      }
      setShowSubForm(false);
      await loadData();
    } catch (err: any) {
      alert('保存失败：' + err.message);
    }
  };

  // 删除子分类
  const handleDeleteSub = async (id: string) => {
    if (!confirm('确认删除此子分类？')) return;
    try {
      await dictService.delete(id);
      await loadData();
    } catch (err: any) {
      alert('删除失败：' + err.message);
    }
  };

  const currentSeriesName = seriesList.find(s => s.id === currentSeriesId)?.name_cn || '';

  if (loading) return <div className="text-center py-20 text-[#6B856B]">加载中...</div>;

  const hasAnySubcategories = seriesWithSubs.some(s => s.subcategories.length > 0);

  return (
    <div className="space-y-4">
      {/* 初始化提示 */}
      {needsInit && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-amber-800 font-medium">分类体系尚未初始化</p>
            <p className="text-xs text-amber-600 mt-1">检测到部分系列缺少子分类数据。点击下方按钮将自动初始化四大系列及其子分类（旧的冗余数据将被清理）。</p>
            <button
              onClick={handleInit}
              disabled={initing}
              className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm disabled:opacity-50 transition-colors"
            >
              {initing ? '初始化中...' : '一键初始化分类体系'}
            </button>
          </div>
        </div>
      )}

      {/* 操作栏：全部展开/折叠 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8AA08A]">点击系列可折叠/展开</span>
          {seriesWithSubs.length > 0 && (
            <div className="flex gap-1.5 ml-2">
              <button
                onClick={expandAll}
                className="px-2.5 py-1 text-[11px] bg-[#F2F7F3] text-[#5C725C] rounded-md hover:bg-[#E8F3EC] transition-colors"
              >全部展开</button>
              <button
                onClick={collapseAll}
                className="px-2.5 py-1 text-[11px] bg-[#F2F7F3] text-[#5C725C] rounded-md hover:bg-[#E8F3EC] transition-colors"
              >全部折叠</button>
            </div>
          )}
        </div>
        {!hasAnySubcategories && !needsInit && (
          <button
            onClick={handleInit}
            disabled={initing}
            className="px-3 py-1.5 bg-[#4A7C59] text-white rounded-lg text-xs disabled:opacity-50"
          >
            {initing ? '初始化中...' : '初始化子分类'}
          </button>
        )}
      </div>

      {/* 系列列表 */}
      <div className="space-y-3">
        {seriesWithSubs.map(series => {
          const isExpanded = expandedSeries.has(series.id);
          return (
            <div key={series.id} className={`rounded-xl border overflow-hidden ${series.color.border} ${series.color.bg}`}>
              {/* 系列标题行：始终显示子分类概览 tag */}
              <button
                onClick={() => toggleSeries(series.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/50 transition-colors"
              >
                {isExpanded
                  ? <ChevronDown size={16} className={series.color.text} />
                  : <ChevronRight size={16} className={series.color.text} />
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-base font-semibold ${series.color.text}`}>{series.name_cn}</h3>
                    <span className="text-xs text-[#9AAA9A]">{series.name_en}</span>
                  </div>
                  {/* 子分类概览：始终直接展示 */}
                  {series.subcategories.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[11px] text-[#8AA08A]">子分类：</span>
                      {series.subcategories.map(sub => (
                        <span
                          key={sub.id}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${series.color.light} ${series.color.text}`}
                        >
                          {sub.label}
                          <code className="opacity-60 font-mono text-[10px]">{sub.value}</code>
                        </span>
                      ))}
                    </div>
                  )}
                  {series.subcategories.length === 0 && !isExpanded && (
                    <p className="text-xs text-[#B0BFB0] mt-1">暂无子分类</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${series.color.light} ${series.color.text}`}>
                  {series.subcategories.length} 个
                </span>
              </button>

              {/* 展开的子分类详情列表（可编辑/删除） */}
              {isExpanded && (
                <div className="border-t border-[#E0ECE0] bg-white/60">
                  {/* 子分类新增表单 */}
                  {showSubForm && currentSeriesId === series.id && (
                    <div className="p-4 border-b border-[#E0ECE0] bg-[#F8FAF8]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-[#3D5C3D]">
                          {editingSub ? '编辑子分类' : '新增子分类'}
                        </span>
                        <button onClick={() => setShowSubForm(false)} className="p-1 hover:bg-[#E0ECE0] rounded text-[#6B856B]">
                          <X size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-[#6B856B] mb-1">中文名称 *</label>
                          <input
                            value={subForm.label}
                            onChange={e => setSubForm(f => ({ ...f, label: e.target.value }))}
                            placeholder="如：金、身体、清净"
                            className="w-full px-3 py-2 bg-white border border-[#D5E2D5] rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[#6B856B] mb-1">英文标识 *</label>
                          <input
                            value={subForm.value}
                            onChange={e => setSubForm(f => ({ ...f, value: e.target.value }))}
                            placeholder="如：jin、body、clear"
                            className="w-full px-3 py-2 bg-white border border-[#D5E2D5] rounded-lg text-sm font-mono"
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <label className="block text-xs text-[#6B856B] mb-1">排序</label>
                            <input
                              type="number"
                              value={subForm.sort_order}
                              onChange={e => setSubForm(f => ({ ...f, sort_order: e.target.value }))}
                              className="w-full px-3 py-2 bg-white border border-[#D5E2D5] rounded-lg text-sm"
                            />
                          </div>
                          <button
                            onClick={handleSaveSub}
                            className="px-4 py-2 bg-[#4A7C59] text-white rounded-lg text-sm font-medium hover:bg-[#3D6B4A] transition-colors"
                          >
                            保存
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 子分类列表（详情：带编辑/删除按钮） */}
                  {series.subcategories.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-xs text-[#8AA08A]">暂无子分类</p>
                      <button
                        onClick={() => openAddSub(series.id)}
                        className="mt-2 text-xs text-[#7BA689] hover:text-[#4A7C59]"
                      >
                        点击添加
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E0ECE0]/50">
                      {series.subcategories.map(sub => (
                        <div key={sub.id} className="group flex items-center gap-3 px-5 py-3 hover:bg-white transition-colors">
                          <span className="w-2 h-2 rounded-full bg-[#7BA689]/50" />
                          <span className="text-sm text-[#1A2E1A] flex-1 font-medium">{sub.label}</span>
                          <code className="text-xs text-[#7A967A] bg-[#F0F5F0] px-2 py-0.5 rounded font-mono">{sub.value}</code>
                          <span className="text-xs text-[#9AAA9A] w-8 text-right">{sub.sort_order}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditSub(sub, series.id)}
                              className="p-1.5 hover:bg-[#EEF4EF] rounded"
                              title="编辑"
                            >
                              <Edit2 size={13} className="text-[#5C725C]" />
                            </button>
                            <button
                              onClick={() => handleDeleteSub(sub.id)}
                              className="p-1.5 hover:bg-red-50 rounded"
                              title="删除"
                            >
                              <Trash2 size={13} className="text-red-400/50" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 添加子分类按钮 */}
                  {!showSubForm && (
                    <div className="px-5 py-3 border-t border-[#E0ECE0]/50">
                      <button
                        onClick={() => openAddSub(series.id)}
                        className="flex items-center gap-1.5 text-xs text-[#7BA689] hover:text-[#4A7C59] transition-colors"
                      >
                        <Plus size={13} /> 添加子分类
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// Tab2: 其他字典管理（供货商、提炼方式、区域等）
// ============================================
function GeneralDictView() {
  const [selectedType, setSelectedType] = useState<string>(GENERAL_DICT_TYPES[0].value);
  const [items, setItems] = useState<DictItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: '', value: '', sort_order: '0' });

  // 加载当前类型的字典数据
  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await dictService.getByType(selectedType);
      setItems(data);
    } catch (err) {
      console.error('加载字典数据失败:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadItems(); }, [selectedType]);

  const currentMeta = GENERAL_DICT_TYPES.find(t => t.value === selectedType);

  const openAddForm = () => {
    setEditingId(null);
    setForm({ label: '', value: '', sort_order: String(items.length + 1) });
    setShowForm(true);
  };

  const openEditForm = (item: DictItem) => {
    setEditingId(item.id);
    setForm({ label: item.label, value: item.value, sort_order: String(item.sort_order) });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.label.trim() || !form.value.trim()) {
      alert('请填写完整信息！'); return;
    }
    try {
      if (editingId) {
        await dictService.update(editingId, {
          label: form.label.trim(),
          value: form.value.trim(),
          sort_order: parseInt(form.sort_order) || 0,
        });
      } else {
        await dictService.create({
          dict_type: selectedType,
          label: form.label.trim(),
          value: form.value.trim(),
          sort_order: parseInt(form.sort_order) || 0,
          is_active: true,
        });
      }
      cancelForm();
      await loadItems();
    } catch (err: any) {
      alert('保存失败：' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除？')) return;
    try {
      await dictService.delete(id);
      await loadItems();
    } catch (err: any) {
      alert('删除失败：' + err.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* 字典类型选择 */}
      <div className="flex flex-wrap gap-2">
        {GENERAL_DICT_TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => { setSelectedType(t.value); setShowForm(false); }}
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${
              selectedType === t.value
                ? 'bg-[#4A7C59] text-white'
                : 'bg-white text-[#5C725C] hover:text-[#1A2E1A] border border-[#E0ECE0]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 类型说明 */}
      {currentMeta && (
        <div className="p-3 rounded-lg bg-[#7BA689]/5 border border-[#7BA689]/10 flex items-center gap-2">
          <BookText size={16} className="text-[#7BA689]" />
          <span className="text-xs text-[#5C725C]">{currentMeta.desc}</span>
        </div>
      )}

      {/* 操作栏 */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-[#7A967A]">{items.length} 条记录</span>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 px-4 py-2 bg-[#4A7C59] hover:bg-[#3D6B4A] text-white rounded-xl text-sm"
        >
          <Plus size={14} /> 添加条目
        </button>
      </div>

      {/* 新增/编辑表单 */}
      {showForm && (
        <div className="rounded-xl bg-white border border-[#D5E2D5] p-5 space-y-4">
          <h4 className="font-semibold text-[#1A2E1A] flex items-center justify-between">
            {editingId ? '编辑条目' : '添加条目'}
            <button onClick={cancelForm} className="p-1 hover:bg-[#EEF4EF] rounded text-[#6B856B]"><X size={16} /></button>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#6B856B] mb-1.5">中文名称 *</label>
              <input
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="如：蒸馏萃取"
                className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6B856B] mb-1.5">英文标识 *</label>
              <input
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                placeholder="如：distillation"
                className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6B856B] mb-1.5">排序</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={cancelForm} className="px-5 py-2 text-sm text-[#5C725C] hover:text-[#1A2E1A] rounded-xl hover:bg-[#EEF4EF]">取消</button>
            <button onClick={handleSave} className="px-5 py-2 bg-[#4A7C59] text-white rounded-xl text-sm flex items-center gap-2">
              <Save size={14} /> 保存
            </button>
          </div>
        </div>
      )}

      {/* 列表 */}
      {loading ? (
        <div className="text-center py-20 text-[#6B856B]">加载中...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-[#8AA08A]">
          <BookText size={48} className="mx-auto mb-4 opacity-30" />
          <p>暂无数据，点击上方按钮添加</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map(item => (
            <div key={item.id} className="group flex items-center gap-4 px-4 py-3 rounded-lg bg-white border border-[#E0ECE0] hover:border-[#D5E2D5] transition-all">
              <code className="px-2 py-0.5 rounded bg-[#E8F3EC] text-[11px] text-[#7BA689]/70 min-w-[80px] text-center font-mono">{item.value}</code>
              <span className="text-sm text-[#1A2E1A] flex-1 font-medium">{item.label}</span>
              <span className="text-xs text-[#9AAA9A] w-12 text-right">{item.sort_order}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => openEditForm(item)} className="p-1.5 hover:bg-[#EEF4EF] rounded" title="编辑">
                  <Edit2 size={13} className="text-[#5C725C]" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-500/10 rounded" title="删除">
                  <Trash2 size={13} className="text-red-400/50" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// 权限管理（用户管理）
// ============================================

const ROLE_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  super_admin: { label: '超级管理员', color: '#4A7C59', desc: '全部权限' },
  admin: { label: '管理员', color: '#1C39BB', desc: '除用户管理外全部权限' },
  editor: { label: '编辑者', color: '#7B9EA8', desc: '内容编辑权限' },
  viewer: { label: '查看者', color: '#888', desc: '只读访问' },
};

export function AdminUsers() {
  const { user: currentUser, hasPermission } = useAuth();
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pwdVisible, setPwdVisible] = useState<Record<string, boolean>>({});

  // 密码修改弹窗状态
  const [pwdModal, setPwdModal] = useState<{ userId: string; username: string; displayName: string } | null>(null);
  const [newPwd, setNewPwd] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  const [form, setForm] = useState({
    username: '', display_name: '', role: 'viewer' as 'super_admin' | 'admin' | 'editor' | 'viewer',
  });

  // 加载用户列表
  useEffect(() => {
    userService.getAll().then(data => {
      setUsers(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setForm({ username: '', display_name: '', role: 'viewer' });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.username || !form.display_name) {
      alert('用户名和显示名称不能为空！'); return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await userService.update(editingId, {
          display_name: form.display_name,
          role: form.role,
        });
      } else {
        await userService.create({
          username: form.username,
          display_name: form.display_name,
          role: form.role,
          is_active: true,
        });
      }
      const updated = await userService.getAll();
      setUsers(updated);
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      alert('保存失败：' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除此用户？')) return;
    try {
      await userService.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      alert('删除失败：' + err.message);
    }
  };

  const startEdit = (user: AdminUser) => {
    setEditingId(user.id);
    setForm({ username: user.username, display_name: user.display_name, role: user.role });
    setShowForm(true);
  };

  // 修改密码
  const handlePasswordSave = async () => {
    if (!pwdModal || !currentUser) return;
    if (newPwd.length < 4) {
      alert('密码至少4个字符'); return;
    }
    setSavingPwd(true);
    try {
      const result = await updateUserPassword(currentUser.id, pwdModal.username, newPwd);
      if (result.success) {
        alert(`${pwdModal.displayName} 的密码已修改成功`);
        setPwdModal(null);
        setNewPwd('');
      } else {
        alert(result.error || '修改失败');
      }
    } catch (err: any) {
      alert('修改失败：' + err.message);
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A2E1A]">权限管理</h2>
          <p className="text-sm text-[#6B856B] mt-1">管理系统用户和角色权限</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4A7C59] hover:bg-[#3D6B4A] text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={14} /> 添加用户
        </button>
      </div>

      {/* 密码修改弹窗 */}
      {pwdModal && (
        <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center px-4" onClick={() => setPwdModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-[#D5E2D5] p-6 w-full max-w-sm space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[#1A2E1A] flex items-center gap-2">
                <KeyRound size={16} className="text-[#4A7C59]" />
                修改密码
              </h4>
              <button onClick={() => { setPwdModal(null); setNewPwd(''); }} className="p-1 hover:bg-[#EEF4EF] rounded text-[#6B856B]"><X size={16} /></button>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-[#1A2E1A] font-medium">{pwdModal.displayName}</p>
              <p className="text-xs text-[#8AA08A]">@{pwdModal.username}</p>
            </div>
            <div className="space-y-2">
              <label className="block text-xs text-[#6B856B] mb-1.5">新密码（至少4位）</label>
              <input
                type="text"
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                placeholder="输入新密码"
                autoFocus
                className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] focus:outline-none focus:ring-2 focus:ring-[#4A7C59]/30 focus:border-[#4A7C59]"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setPwdModal(null); setNewPwd(''); }} className="px-5 py-2 text-sm text-[#5C725C] hover:text-[#1A2E1A] rounded-xl hover:bg-[#EEF4EF]">取消</button>
              <button onClick={handlePasswordSave} disabled={savingPwd || newPwd.length < 4} className="px-5 py-2 bg-[#4A7C59] text-white rounded-xl text-sm disabled:opacity-50">
                {savingPwd ? '保存中...' : '确认修改'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新增/编辑表单 */}
      {showForm && (
        <div className="rounded-xl bg-white border border-[#D5E2D5] p-5 space-y-4">
          <h4 className="font-semibold text-[#1A2E1A] flex items-center justify-between">
            {editingId ? '编辑用户' : '添加新用户'}
            <button onClick={() => { setShowForm(false); resetForm(); }} className="p-1 hover:bg-[#EEF4EF] rounded text-[#6B856B]"><X size={16} /></button>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#6B856B] mb-1.5">用户名 *</label>
              <input
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="eric"
                disabled={!!editingId}
                className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6B856B] mb-1.5">显示名称 *</label>
              <input
                value={form.display_name}
                onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                placeholder="Eric"
                className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6B856B] mb-1.5">角色权限 *</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value as any }))}
                className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A]"
              >
                {Object.entries(ROLE_LABELS).map(([key, info]) => (
                  <option key={key} value={key}>{info.label} — {info.desc}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setShowForm(false); resetForm(); }} className="px-5 py-2 text-sm text-[#5C725C] hover:text-[#1A2E1A] rounded-xl hover:bg-[#EEF4EF]">取消</button>
            <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-[#4A7C59] text-white rounded-xl text-sm disabled:opacity-50">
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      )}

      {/* 用户列表 */}
      <div className="rounded-xl bg-white border border-[#E0ECE0] overflow-hidden">
        {loading ? (
          <div className="text-center py-20 text-[#6B856B]">加载中...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-[#8AA08A]">
            <Users size={48} className="mx-auto mb-4 opacity-30" />
            <p>暂无用户，点击上方按钮添加</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#E0ECE0]">
              <th className="text-left px-4 py-3 text-xs font-medium text-[#7A967A] uppercase tracking-wider">用户</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#7A967A] uppercase">角色</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#7A967A] uppercase">状态</th>
              {isSuperAdmin && <th className="text-left px-4 py-3 text-xs font-medium text-[#7A967A] uppercase">登录密码</th>}
              <th className="text-left px-4 py-3 text-xs font-medium text-[#7A967A] uppercase">最后登录</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#7A967A] uppercase">操作</th>
            </tr></thead>
            <tbody>
              {users.map(u => {
                const roleInfo = ROLE_LABELS[u.role];
                const currentPwd = isSuperAdmin ? getUserPassword(u.username) : undefined;
                const showPwd = pwdVisible[u.id];
                return (
                  <tr key={u.id} className="border-b border-[#E0ECE0]/30 hover:bg-[#EEF4EF]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7BA689]/20 to-[#4A7C59]/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-[#7BA689]">{u.display_name?.charAt(0) || '?'}</span>
                        </div>
                        <div>
                          <p className="text-[#1A2E1A]/90 font-medium">{u.display_name || u.username}</p>
                          <p className="text-xs text-[#8AA08A]">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {roleInfo && (
                        <span style={{ color: roleInfo.color }} className="text-xs font-medium">
                          {roleInfo.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] ${u.is_active ? 'bg-green-500/15 text-green-600' : 'bg-zinc-100 text-[#8AA08A]'}`}>
                        {u.is_active ? '激活' : '禁用'}
                      </span>
                    </td>
                    {isSuperAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#5C725C] font-mono tracking-wide">
                            {showPwd ? (currentPwd || '未设置') : '••••••••'}
                          </span>
                          <button
                            onClick={() => setPwdVisible(prev => ({ ...prev, [u.id]: !prev[u.id] }))}
                            className="p-1 hover:bg-[#EEF4EF] rounded text-[#8AA08A] hover:text-[#5C725C] transition-colors"
                            title={showPwd ? '隐藏密码' : '显示密码'}
                          >
                            {showPwd ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3 text-[#7A967A] text-xs">
                      {u.last_login_at ? new Date(u.last_login_at).toLocaleString('zh-CN') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(u)}
                          className="p-1.5 hover:bg-[#EEF4EF] rounded-lg text-[#5C725C]"
                          title="编辑"
                        >
                          <Edit2 size={14} />
                        </button>
                        {isSuperAdmin && (
                          <button
                            onClick={() => setPwdModal({ userId: u.id, username: u.username, displayName: u.display_name || u.username })}
                            className="p-1.5 hover:bg-[#EEF4EF] rounded-lg text-[#4A7C59]"
                            title="修改密码"
                          >
                            <KeyRound size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-400/50"
                          title="删除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 角色说明卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {Object.entries(ROLE_LABELS).map(([key, info]) => (
          <div key={key} className="p-4 rounded-xl bg-white border border-[#E0ECE0]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: info.color }} />
              <span className="text-sm font-medium" style={{ color: info.color }}>{info.label}</span>
            </div>
            <p className="text-xs text-[#7A967A]">{info.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// 系统设置（占位）
// ============================================

export function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1A2E1A]">系统设置</h2>
        <p className="text-sm text-[#6B856B] mt-1">全局系统配置</p>
      </div>
      <div className="rounded-xl bg-white border border-[#E0ECE0] p-12 text-center text-[#8AA08A]">
        <p>系统设置功能开发中...</p>
        <p className="mt-2 text-xs text-[#9AAA9A]">包括：数据库备份、缓存清理、站点配置等</p>
      </div>
    </div>
  );
}
