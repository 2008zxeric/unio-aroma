import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { bannerService } from '../../lib/dataService';
import type { Banner } from '../../lib/database.types';
import ImageUploadField from '../components/ImageUploadField';

const POSITIONS = [
  { value: 'home', label: '首页' },
  { value: 'story', label: '品牌叙事页' },
  { value: 'collections', label: '馆藏页' },
  { value: 'atlas', label: '寻香地图页' },
  { value: 'footer', label: '底部/通用' },
];

interface BannerForm {
  name: string;
  image_url: string;
  link_url: string;
  position: string;
  is_active: boolean;
  sort_order: string;
}

const emptyForm = (): BannerForm => ({
  name: '', image_url: '', link_url: '',
  position: 'home', is_active: true, sort_order: '0',
});

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>(emptyForm());

  useEffect(() => {
    bannerService.getAll().then(data => { setBanners(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.name.trim() || !form.image_url.trim()) { alert('请填写名称和图片URL！'); return; }
    try {
      if (editingId) await bannerService.update(editingId, form);
      else await bannerService.create(form);
      setBanners(await bannerService.getAll());
      setEditingId(null); setForm(emptyForm());
    } catch (err: any) { alert('保存失败：' + err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除？')) return;
    await bannerService.delete(id);
    setBanners(await bannerService.getAll());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A2E1A]">海报/Banner 管理</h2>
          <p className="text-sm text-[#6B856B] mt-1">管理网站各页面的海报和广告横幅</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm(emptyForm()); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4A7C59] hover:bg-[#3D6B4A] text-white rounded-xl font-medium text-sm">
          <Plus size={16} /> 添加海报
        </button>
      </div>

      {/* 表单 */}
      {(editingId !== null || banners.length === 0) && (
        <div className="rounded-2xl bg-white border border-[#D5E2D5] p-6 space-y-4">
          <div className="flex justify-between"><h3 className="text-lg font-semibold text-[#1A2E1A]">{editingId ? '编辑海报' : '添加海报'}</h3>{editingId && <button onClick={() => setEditingId(null)} className="p-1.5 hover:bg-[#EEF4EF] rounded-lg text-[#6B856B]"><X size={18} /></button>}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-[#6B856B] mb-1.5">名称 *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="例如: 首页主视觉" className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] placeholder:text-[#9AAA9A] focus:border-[#4A7C59]/50 outline-none" /></div>
            <div><label className="block text-xs font-medium text-[#6B856B] mb-1.5">位置</label><select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A]">{POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}</select></div>
          </div>
          <ImageUploadField
            label="海报图片"
            value={form.image_url}
            onChange={v => setForm(f => ({ ...f, image_url: v }))}
            previewSize="w-full h-auto max-h-48 rounded-xl object-cover"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-[#6B856B] mb-1.5">点击链接</label><input value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] placeholder:text-[#9AAA9A] outline-none" /></div>
            <div className="flex items-end gap-3"><label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl bg-[#EEF4EF] border border-[#E0ECE0]"><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-[#4A7C59]" /><span className="text-sm text-[#2D442D]">激活</span></label></div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-[#E0ECE0]">
            <button onClick={() => setEditingId(null)} className="px-5 py-2.5 text-sm text-[#5C725C] hover:text-[#1A2E1A] rounded-xl hover:bg-[#EEF4EF]">取消</button>
            <button onClick={handleSave} className="px-6 py-2.5 bg-[#4A7C59] text-white text-sm font-medium rounded-xl">{editingId ? '保存' : '创建'}</button>
          </div>
        </div>
      )}

      {/* 列表 - 网格展示 */}
      {loading ? <div className="text-center py-20 text-[#6B856B]">加载中...</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map(b => (
            <div key={b.id} className="group rounded-xl bg-white border border-[#E0ECE0] overflow-hidden hover:border-[#D5E2D5] transition-all">
              <div className="aspect-video bg-[#E8F3EC] relative overflow-hidden">
                {b.image_url ? (
                  <img src={b.image_url} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#9AAA9A]"><ImageIcon size={36} /></div>
                )}
                {!b.is_active && <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 rounded text-[10px] text-[#5C725C]">未激活</div>}
              </div>
              <div className="p-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-[#1A2E1A] truncate">{b.name}</h4>
                  <span className="text-[11px] text-[#8AA08A]">{POSITIONS.find(p => p.value === b.position)?.label || b.position}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingId(b.id); setForm({ name: b.name, image_url: b.image_url || '', link_url: b.link_url || '', position: b.position, is_active: b.is_active, sort_order: String(b.sort_order || 0) }); }} className="p-1.5 hover:bg-[#EEF4EF] rounded"><Edit2 size={13} className="text-[#5C725C]" /></button>
                  <button onClick={() => handleDelete(b.id)} className="p-1.5 hover:bg-red-500/10 rounded"><Trash2 size={13} className="text-red-400/50" /></button>
                </div>
              </div>
            </div>
          ))}
          {banners.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3 text-center py-16 text-[#8AA08A]">
              <ImageIcon size={48} className="mx-auto mb-4 opacity-30" />
              <p>暂无海报，点击上方按钮添加</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
