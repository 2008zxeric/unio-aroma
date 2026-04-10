import React, { useEffect, useState } from 'react';
import { Type, X, Save, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Star } from 'lucide-react';
import { siteTextService, bannerService, recommendService } from '../../lib/dataService';

// 网站文字管理 — 管理各页面上的文字内容
export function AdminTexts() {
  const [texts, setTexts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [activePage, setActivePage] = useState('home');

  const PAGES = [
    { key: 'home', label: '首页' },
    { key: 'story', label: '品牌叙事' },
    { key: 'collections', label: '馆藏' },
    { key: 'atlas', label: '寻香' },
    { key: 'footer', label: '底部/通用' },
    { key: 'global', label: '全局设置' },
  ];

  // 预设文字键（用于初始化）
  const PRESET_KEYS: Record<string, Array<{ key: string; desc: string; defaultValue: string }>> = {
    home: [
      { key: 'hero_title_cn', desc: '首页大标题（中文）', defaultValue: '元于一息' },
      { key: 'hero_title_en', desc: '首页大标题（英文）', defaultValue: 'Original Harmony Sanctuary' },
      { key: 'hero_subtitle', desc: '首页副标题', defaultValue: '从极境撷取芳香，因世界元于一息。' },
      { key: 'brand_intro', desc: '品牌简介段落', defaultValue: '' },
      { key: 'section_products_title', desc: '产品区标题', defaultValue: '极境原力 · 单方精油' },
      { key: 'section_countries_title', desc: '国家区标题', defaultValue: '全球寻香地图' },
    ],
    story: [
      { key: 'story_title_1', desc: '篇章1 标题', defaultValue: '廿载寻香之路' },
      { key: 'story_desc_1', desc: '篇章1 描述', defaultValue: '' },
      { key: 'story_quote', desc: '品牌引用语', defaultValue: '"真正的奢侈并非价格，而是香气背后那份跨越极境、未经干扰的生命原力。"' },
    ],
    collections: [
      { key: 'series_yuan_title', desc: '元·单方 标题', defaultValue: '元 · 单方精油' },
      { key: 'series_yuan_desc', desc: '元·单方 描述', defaultValue: '' },
      { key: 'series_he_title', desc: '和·复方 标题', defaultValue: '和 · 复方油' },
      { key: 'series_sheng_title', desc: '生·纯露 标题', defaultValue: '生 · 纯露' },
      { key: 'series_xiang_title', desc: '香·空间 标题', defaultValue: '香 · 空间香氛' },
    ],
    atlas: [
      { key: 'atlas_title', desc: '寻香页标题', defaultValue: '全球极境寻香地图' },
      { key: 'atlas_subtitle', desc: '寻香页副标题', defaultValue: '' },
    ],
    footer: [
      { key: 'footer_text', desc: '底部文字', defaultValue: '© UNIO AROMA 元香 · 极境芳疗' },
      { key: 'icp', desc: 'ICP备案号', defaultValue: '' },
    ],
    global: [
      { key: 'site_name', desc: '网站名称', defaultValue: 'UNIO AROMA 元香' },
      { key: 'site_description', desc: '网站SEO描述', defaultValue: '' },
      { key: 'contact_wechat', desc: '微信号', defaultValue: '' },
      { key: 'contact_email', desc: '联系邮箱', defaultValue: '' },
    ],
  };

  const loadTexts = async () => {
    try {
      setLoading(true);
      const data = await siteTextService.getByPage(activePage);
      
      // 如果没有数据，用预设值初始化
      if (data.length === 0) {
        const presets = PRESET_KEYS[activePage] || [];
        const initialized = presets.map(p => ({
          id: '', // 新的
          key: p.key,
          value: p.defaultValue,
          description: p.desc,
          page: activePage,
        }));
        setTexts(initialized);
      } else {
        setTexts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTexts(); }, [activePage]);

  const handleSave = async (key: string, value: string) => {
    try {
      setSaving(true);
      await siteTextService.upsert(key, value, activePage);
      await loadTexts();
      setEditingKey(null);
    } catch (err: any) {
      alert('保存失败：' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1A2E1A]">文字管理</h2>
        <p className="text-sm text-[#6B856B] mt-1">编辑网站各页面显示的文字内容</p>
      </div>

      {/* 页面切换 */}
      <div className="flex gap-2 flex-wrap">
        {PAGES.map(p => (
          <button
            key={p.key}
            onClick={() => setActivePage(p.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activePage === p.key
                ? 'bg-[#4A7C59] text-[#1A2E1A]'
                : 'bg-white text-[#5C725C] hover:text-[#1A2E1A] border border-[#E0ECE0]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 文字列表 */}
      {loading ? (
        <div className="text-center py-20 text-[#6B856B]">加载中...</div>
      ) : texts.length === 0 ? (
        <div className="text-center py-16 text-[#8AA08A]">
          <Type size={48} className="mx-auto mb-4 opacity-30" />
          <p>此页面暂无文字配置</p>
        </div>
      ) : (
        <div className="space-y-3">
          {texts.map((item, idx) => (
            <div
              key={`${item.key}-${idx}`}
              className={`rounded-xl bg-white border transition-all ${
                editingKey === item.key ? 'border-[#4A7C59]/40' : 'border-[#E0ECE0] hover:border-[#D5E2D5]'
              } p-4`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#E8F3EC] text-[#7BA689]/70">{item.key}</span>
                    <span className="text-xs text-[#7A967A]">{item.description || ''}</span>
                  </div>
                  
                  {editingKey === item.key ? (
                    <textarea
                      autoFocus
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#4A7C59]/30 rounded-lg text-sm text-[#1A2E1A] focus:border-[#4A7C59]/60 outline-none resize-y"
                    />
                  ) : (
                    <p className="text-sm text-[#2D442D] whitespace-pre-wrap cursor-pointer hover:text-[#1A2E1A]" onClick={() => { setEditingKey(item.key); setEditValue(item.value || ''); }}>
                      {item.value || <span className="italic text-[#9AAA9A]">（空）</span>}
                    </p>
                  )}
                </div>

                {editingKey === item.key && (
                  <div className="flex gap-2 flex-shrink-0 ml-2">
                    <button
                      onClick={() => handleSave(item.key, editValue)}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4A7C59] text-white text-xs rounded-lg disabled:opacity-50"
                    >
                      {saving ? <SpinIcon size={12} /> : <Save size={12} />}
                      保存
                    </button>
                    <button onClick={() => setEditingKey(null)} className="px-3 py-1.5 text-[#6B856B] text-xs hover:text-[#1A2E1A]">取消</button>
                  </div>
                )}

                {editingKey !== item.key && (
                  <button onClick={() => { setEditingKey(item.key); setEditValue(item.value || ''); }} className="p-2 flex-shrink-0 hover:bg-[#EEF4EF] rounded-lg opacity-40 hover:opacity-100 transition-opacity">
                    <Type size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SpinIcon({ size }: { size?: number }) {
  return <svg className="animate-spin" width={size} height={size} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>;
}

// ============================================
// 首页推荐管理
// ============================================

export function AdminRecommends() {
  const [recommends, setRecommends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    type: 'product' as 'product' | 'country' | 'series',
    ref_id: '',
    title: '',
    sort_order: '0',
    is_active: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await recommendService.getAll();
      setRecommends(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ type: 'product', ref_id: '', title: '', sort_order: '0', is_active: true });
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.ref_id.trim()) { alert('请填写关联ID！'); return; }
    try {
      setSaving(true);
      if (editingId) {
        await recommendService.update(editingId, { type: form.type, ref_id: form.ref_id, title: form.title, sort_order: parseInt(form.sort_order) || 0, is_active: form.is_active });
      } else {
        await recommendService.create({ type: form.type, ref_id: form.ref_id, title: form.title, sort_order: parseInt(form.sort_order) || 0, is_active: form.is_active });
      }
      await loadData();
      resetForm();
    } catch (err: any) {
      alert('保存失败：' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除此推荐？')) return;
    try {
      await recommendService.delete(id);
      await loadData();
    } catch (err: any) {
      alert('删除失败：' + err.message);
    }
  };

  const handleToggleActive = async (item: any) => {
    try {
      await recommendService.update(item.id, { is_active: !item.is_active });
      await loadData();
    } catch (err: any) {
      alert('操作失败：' + err.message);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setForm({ type: item.type, ref_id: item.ref_id, title: item.title || '', sort_order: String(item.sort_order || 0), is_active: item.is_active });
    setShowForm(true);
  };

  const TYPE_LABELS: Record<string, { label: string; color: string; desc: string }> = {
    product: { label: '产品', color: '#3B82F6', desc: '推荐精选产品到首页' },
    country: { label: '国家', color: '#22C55E', desc: '推荐国家/产地到首页' },
    series: { label: '系列', color: '#A855F7', desc: '推荐产品系列到首页' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A2E1A]">首页推荐管理</h2>
          <p className="text-sm text-[#6B856B] mt-1">管理首页展示的精选产品、国家推荐</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4A7C59] hover:bg-[#3D6B4A] text-white rounded-xl font-medium text-sm transition-colors"
        >
          <Plus size={16} /> 添加推荐
        </button>
      </div>

      {/* 新增/编辑表单 */}
      {showForm && (
        <div className="rounded-2xl bg-white border border-[#D5E2D5] p-6 space-y-4">
          <h4 className="font-semibold text-[#1A2E1A] flex items-center justify-between">
            {editingId ? '编辑推荐' : '添加新推荐'}
            <button onClick={resetForm} className="p-1.5 hover:bg-[#EEF4EF] rounded-lg text-[#6B856B]"><X size={16} /></button>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6B856B] mb-1.5">推荐类型 *</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
                className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] outline-none">
                {Object.entries(TYPE_LABELS).map(([key, info]) => (
                  <option key={key} value={key}>{info.label} — {info.desc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B856B] mb-1.5">关联ID *</label>
              <input value={form.ref_id} onChange={e => setForm(f => ({ ...f, ref_id: e.target.value }))}
                placeholder="产品/国家/系列的UUID" className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] placeholder:text-[#9AAA9A] focus:border-[#4A7C59]/50 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B856B] mb-1.5">推荐标题</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="如：本月精选" className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] placeholder:text-[#9AAA9A] focus:border-[#4A7C59]/50 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B856B] mb-1.5">排序权重</label>
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl bg-[#EEF4EF] border border-[#E0ECE0]">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-[#4A7C59]" />
              <span className="text-sm text-[#2D442D]">激活显示</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-[#E0ECE0]">
            <button onClick={resetForm} className="px-5 py-2.5 text-sm text-[#5C725C] hover:text-[#1A2E1A] rounded-xl hover:bg-[#EEF4EF]">取消</button>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-[#4A7C59] text-white text-sm font-medium rounded-xl hover:bg-[#3D6B4A] disabled:opacity-50">
              {saving ? '保存中...' : editingId ? '保存' : '创建'}
            </button>
          </div>
        </div>
      )}

      {/* 推荐列表 */}
      {loading ? (
        <div className="text-center py-20 text-[#6B856B]">加载中...</div>
      ) : (
        <div className="rounded-xl bg-white border border-[#E0ECE0] overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#E0ECE0]">
              <th className="text-left px-4 py-3 text-xs font-medium text-[#7A967A] uppercase tracking-wider">类型</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#7A967A]">关联ID</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#7A967A]">标题</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#7A967A]">排序</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#7A967A]">状态</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-[#7A967A]">操作</th>
            </tr></thead>
            <tbody>
              {recommends.map(r => {
                const typeInfo = TYPE_LABELS[r.type] || { label: r.type, color: '#888' };
                return (
                  <tr key={r.id} className="border-b border-[#E0ECE0]/30 hover:bg-[#EEF4EF]">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                        style={{ backgroundColor: typeInfo.color + '15', color: typeInfo.color }}>
                        <Star size={10} /> {typeInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[#6B856B] text-xs">{r.ref_id?.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-[#2D442D]">{r.title || '-'}</td>
                    <td className="px-4 py-3 text-[#8AA08A]">{r.sort_order || 0}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleActive(r)} className="hover:opacity-80 transition-opacity">
                        {r.is_active
                          ? <ToggleRight size={22} className="text-green-400" />
                          : <ToggleLeft size={22} className="text-[#9AAA9A]" />
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => startEdit(r)} className="p-1.5 hover:bg-[#EEF4EF] rounded-lg" title="编辑">
                          <Edit2 size={14} className="text-[#5C725C]" />
                        </button>
                        <button onClick={() => handleDelete(r.id)} className="p-1.5 hover:bg-red-50 rounded-lg" title="删除">
                          <Trash2 size={14} className="text-red-400/50" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {recommends.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-[#8AA08A]">
                  <Star size={36} className="mx-auto mb-3 opacity-20" />
                  <p>暂无推荐数据</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
