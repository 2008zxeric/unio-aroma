import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus, Search, Edit2, Trash2, Globe, Eye,
  ToggleLeft, ToggleRight, X, ChevronDown,
} from 'lucide-react';
import { countryService } from '../../lib/dataService';
import type { Country } from '../../lib/database.types';

interface CountryForm {
  name_cn: string;
  name_en: string;
  region: string;
  sub_region: string;
  description: string;        // 国家印象
  eric_diary: string;         // 寻香日志
  technical_info: string;     // Alice实验室
  image_url: string;          // 首页大图
  scenery_url: string;        // 风景图
  gallery_urls: string;       // Eric相册（多张，换行分隔）
  visit_count: string;
  unlock_code: string;        // 0=未解锁
  is_active: boolean;
  sort_order: string;
}

const emptyCountryForm = (): CountryForm => ({
  name_cn: '', name_en: '', region: '', sub_region: '',
  description: '', eric_diary: '', technical_info: '',
  image_url: '', scenery_url: '', gallery_urls: '',
  visit_count: '0', unlock_code: '0', is_active: true, sort_order: '0',
});

const REGIONS = [
  { value: '欧洲', label: '🇪🇺 欧洲' },
  { value: '亚洲', label: '🌏 亚洲' },
  { value: '非洲', label: '🌍 非洲' },
  { value: '美洲', label: '🌎 美洲' },
  { value: '大洋洲', label: '🌏 大洋洲' },
  { value: '神州', label: '🇨🇳 神州（中国省份）' },
];

export default function AdminCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CountryForm>(emptyCountryForm());
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await countryService.getAll();
      setCountries(data);
    } catch (err) {
      console.error('加载国家数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = countries.filter(c => {
    const matchSearch = !searchQuery || 
      c.name_cn.includes(searchQuery) || 
      (c.name_en && c.name_en.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchRegion = !filterRegion || c.region === filterRegion;
    return matchSearch && matchRegion;
  });

  const startCreate = () => { setEditingId(null); setForm(emptyCountryForm()); };

  const startEdit = (country: Country) => {
    setEditingId(country.id);
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
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        description: form.description.trim() || null,     // 国家印象
        eric_diary: form.eric_diary.trim() || null,       // 寻香日志
        technical_info: form.technical_info.trim() || null, // Alice实验室
        image_url: form.image_url.trim() || null,          // 首页大图
        scenery_url: form.scenery_url.trim() || null,       // 风景图
        gallery_urls: form.gallery_urls.split('\n').map(s => s.trim()).filter(Boolean), // Eric相册
        visit_count: parseInt(form.visit_count) || 0,
        unlock_code: form.unlock_code || '0',
        is_active: form.is_active,
        sort_order: parseInt(form.sort_order) || 0,
      };
      if (editingId) await countryService.update(editingId, record);
      else await countryService.create(record);
      await loadData();
      setEditingId(null);
      setForm(emptyCountryForm());
    } catch (err: any) {
      alert('保存失败：' + err.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除此国家？')) return;
    try {
      await countryService.delete(id);
      await loadData();
    } catch (err: any) { alert('删除失败：' + err.message); }
  };

  const handleToggleActive = async (country: Country) => {
    try {
      await countryService.update(country.id, { is_active: !country.is_active });
      await loadData();
    } catch (err: any) { alert('操作失败：' + err.message); }
  };

  const isShowingForm = editingId !== null;

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">国家管理</h2>
          <p className="text-sm text-white/40 mt-1">管理全球极境国家/地区信息、到访次数、解锁状态、Eric 相册等</p>
        </div>
        <button onClick={startCreate} className="flex items-center gap-2 px-4 py-2.5 bg-[#D75437] hover:bg-[#D75437]/80 text-white rounded-xl font-medium text-sm transition-colors">
          <Plus size={16} /> 添加国家
        </button>
      </div>

      {/* 编辑表单 */}
      {isShowingForm && (
        <div className="rounded-2xl bg-[#161616] border border-white/10 p-6 space-y-5 relative">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{editingId ? '编辑国家' : '添加国家'}</h3>
            <button onClick={() => { setEditingId(null); setForm(emptyCountryForm()); }} className="p-1.5 hover:bg-white/5 rounded-lg text-white/40"><X size={18} /></button>
          </div>

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

            {/* 到访与解锁 */}
            <Field label="到访次数" value={form.visit_count} onChange={v => setForm(f => ({ ...f, visit_count: v }))} type="number" />
            <Select label="解锁状态" value={form.unlock_code} onChange={v => setForm(f => ({ ...f, unlock_code: v }))}>
              <option value="0">🔒 未解锁</option>
              <option value="1">✅ 已解锁</option>
            </Select>
          </div>

          {/* 日志区 */}
          <TextArea label="寻香日志（Eric Diary）" value={form.eric_diary} onChange={v => setForm(f => ({ ...f, eric_diary: v }))} rows={4} placeholder="Eric 在这个国家的实地探访记录..." />
          <TextArea label="Alice 实验室笔记" value={form.technical_info} onChange={v => setForm(f => ({ ...f, technical_info: v }))} rows={3} placeholder="Alice 的技术分析..." />

          {/* 图片区 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="首页大图 URL" value={form.image_url} onChange={v => setForm(f => ({ ...f, image_url: v }))} placeholder="https://..." />
            <Field label="风景图 URL" value={form.scenery_url} onChange={v => setForm(f => ({ ...f, scenery_url: v }))} placeholder="https://..." />
          </div>
          <TextArea label="Eric 相册 URLs（每行一张）" value={form.gallery_urls} onChange={v => setForm(f => ({ ...f, gallery_urls: v }))} rows={3} placeholder="每行输入一张图片URL&#10;支持多张" />

          {form.image_url && (
            <img src={form.image_url} alt="预览" className="max-h-32 rounded-xl object-cover bg-white/5" />
          )}

          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-[#D75437]" />
              <span className="text-sm text-white/80">激活显示</span>
            </label>
            <Field label="排序" value={form.sort_order} onChange={v => setForm(f => ({ ...f, sort_order: v }))} type="number" />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
            <button onClick={() => { setEditingId(null); setForm(emptyCountryForm()); }} className="px-5 py-2.5 text-sm text-white/50 hover:text-white rounded-xl hover:bg-white/5">取消</button>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-[#D75437] text-white text-sm font-medium rounded-xl disabled:opacity-50 flex items-center gap-2">
              {saving && <SpinIcon />}
              {editingId ? '保存修改' : '创建国家'}
            </button>
          </div>
        </div>
      )}

      {/* 搜索筛选 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input type="text" placeholder="搜索国家名称..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-white/8 rounded-xl text-sm text-white placeholder:text-white/25 focus:border-[#D75437]/50 focus:outline-none" />
        </div>
        <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)}
          className="px-3 py-2.5 bg-[#1a1a1a] border border-white/8 rounded-xl text-sm text-white">
          <option value="">全部区域</option>
          {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="text-center py-20 text-white/40">加载中...</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(country => (
            <div key={country.id} className="group flex items-center gap-4 px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/5 hover:border-white/10 transition-all">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                {country.image_url ? (
                  <img src={country.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/15"><Globe size={18} /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-white">{country.name_cn}</h4>
                  {country.name_en && <span className="text-xs text-white/30">{country.name_en}</span>}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-[11px] text-white/30">
                  <span>{country.region || '-'}</span>
                  <span>到访 {country.visit_count || 0} 次</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${country.unlock_code !== '0' && country.unlock_code !== '' ? 'bg-green-500/15 text-green-400' : 'bg-zinc-700 text-white/30'}`}>
                    {country.unlock_code !== '0' && country.unlock_code !== '' ? '已解锁' : '未解锁'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleToggleActive(country)}>
                  {country.is_active ? <ToggleRight size={22} className="text-green-400" /> : <ToggleLeft size={22} className="text-white/25" />}
                </button>
                <button onClick={() => startEdit(country)} className="p-1.5 hover:bg-white/5 rounded-lg" title="编辑"><Edit2 size={14} className="text-white/50" /></button>
                <button onClick={() => handleDelete(country.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg" title="删除"><Trash2 size={14} className="text-red-400/50" /></button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-20 text-white/30"><Globe size={48} className="mx-auto mb-4 opacity-30" /><p>暂无国家数据</p></div>
          )}
        </div>
      )}
    </div>
  );
}

// ---- 表单子组件 ----

function Field({ label, value, onChange, type='text', placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/40 mb-1.5">{label}{required && '*'}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-[#0f0f0f] border border-white/8 rounded-lg text-sm text-white placeholder:text-white/20 focus:border-[#D75437]/50 outline-none transition-colors" />
    </div>
  );
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/40 mb-1.5">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 bg-[#0f0f0f] border border-white/8 rounded-lg text-sm text-white outline-none">
        {children}
      </select>
    </div>
  );
}

function TextArea({ label, value, onChange, rows=3, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/40 mb-1.5">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-[#0f0f0f] border border-white/8 rounded-lg text-sm text-white placeholder:text-white/20 focus:border-[#D75437]/50 outline-none resize-y" />
    </div>
  );
}

function SpinIcon() {
  return <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>;
}
