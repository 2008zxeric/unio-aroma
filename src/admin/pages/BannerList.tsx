import { useEffect, useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, X, Video, Upload, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { bannerService } from '../../lib/dataService';
import type { Banner } from '../../lib/database.types';
import ImageUploadField from '../components/ImageUploadField';
import { Perm } from '../components/PermissionGuard';

const POSITIONS = [
  { value: 'home', label: '首页' },
  { value: 'story', label: '品牌叙事页' },
  { value: 'collections', label: '馆藏页' },
  { value: 'atlas', label: '寻香地图页' },
  { value: 'footer', label: '底部/通用' },
];

const BUCKET = 'product-images';
const VIDEO_PREFIX = 'videos/';

interface BannerForm {
  name: string;
  image_url: string;
  video_url: string;
  poster_url: string;
  link_url: string;
  position: string;
  is_active: boolean;
  sort_order: string;
}

const emptyForm = (): BannerForm => ({
  name: '', image_url: '', video_url: '', poster_url: '',
  link_url: '', position: 'home', is_active: true, sort_order: '0',
});

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerForm>(emptyForm());
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bannerService.getAll().then(data => { setBanners(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.name.trim() || !form.image_url.trim()) { alert('请填写名称和图片URL！'); return; }
    try {
      const payload: any = {
        name: form.name,
        image_url: form.image_url,
        link_url: form.link_url || null,
        position: form.position,
        is_active: form.is_active,
        sort_order: parseInt(form.sort_order) || 0,
      };
      if (form.video_url) payload.video_url = form.video_url;
      if (form.poster_url) payload.poster_url = form.poster_url;

      if (editingId) await bannerService.update(editingId, payload);
      else await bannerService.create(payload);
      setBanners(await bannerService.getAll());
      setEditingId(null); setForm(emptyForm());
    } catch (err: any) { alert('保存失败：' + err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除？')) return;
    await bannerService.delete(id);
    setBanners(await bannerService.getAll());
  };

  // 上传视频到 Supabase Storage
  const uploadVideo = async (file: File) => {
    setVideoUploading(true);
    setVideoProgress(0);
    try {
      // 检查文件大小（最大50MB）
      if (file.size > 50 * 1024 * 1024) {
        alert('视频文件太大，请压缩至 50MB 以内（建议 10MB 左右）');
        return;
      }

      setVideoProgress(10);
      const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
      const ts = Date.now();
      const path = `${VIDEO_PREFIX}${ts}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (upErr) throw new Error(upErr.message);
      setVideoProgress(80);

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      setVideoProgress(100);
      setForm(f => ({ ...f, video_url: urlData.publicUrl }));
      alert('✅ 视频上传成功！');
    } catch (err: any) {
      alert('视频上传失败：' + (err.message || err));
    } finally {
      setVideoUploading(false);
      setVideoProgress(0);
    }
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadVideo(file);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const removeVideo = () => {
    setForm(f => ({ ...f, video_url: '', poster_url: '' }));
  };

  return (
    <div className="space-y-6 mobile-bottom-pad">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A2E1A]">海报/Banner 管理</h2>
          <p className="text-sm text-[#6B856B] mt-1">管理网站各页面的海报、广告横幅和首页视频</p>
        </div>
        <Perm action="edit_banners"><button onClick={() => { setEditingId(null); setForm(emptyForm()); }}
          className="touch-btn flex items-center gap-2 px-4 py-2.5 bg-[#4A7C59] hover:bg-[#3D6B4A] text-white rounded-xl font-medium text-sm">
          <Plus size={16} /> 添加海报
        </button></Perm>
      </div>

      {/* 表单 */}
      {(editingId !== null || banners.length === 0) && (
        <div className="rounded-2xl bg-white border border-[#D5E2D5] p-6 space-y-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold text-[#1A2E1A]">{editingId ? '编辑海报' : '添加海报'}</h3>
            {editingId && <button onClick={() => setEditingId(null)} className="touch-btn p-1.5 hover:bg-[#EEF4EF] rounded-lg text-[#6B856B]"><X size={18} /></button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6B856B] mb-1.5">名称 *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="例如: 首页主视觉"
                className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] placeholder:text-[#9AAA9A] focus:border-[#4A7C59]/50 outline-none touch-btn" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B856B] mb-1.5">位置</label>
              <select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] touch-btn">
                {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          {/* 图片上传 */}
          <ImageUploadField
            label="海报图片"
            value={form.image_url}
            onChange={v => setForm(f => ({ ...f, image_url: v }))}
            previewSize="w-full h-auto max-h-48 sm:max-h-36 rounded-xl object-cover"
          />

          {/* 视频上传 — 仅用于首页Banner */}
          <div className="rounded-xl bg-[#F8FAF8] border border-dashed border-[#D5E2D5] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Video size={16} className="text-[#4A7C59]" />
              <span className="text-sm font-medium text-[#3D5C3D]">首页视频（可选，有视频时会自动播放替代图片）</span>
            </div>

            {form.video_url ? (
              <div className="space-y-2">
                <div className="relative rounded-xl overflow-hidden bg-black max-w-md">
                  <video src={form.video_url} controls className="w-full max-h-40" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8AA08A] truncate flex-1">{form.video_url.split('/').pop()}</span>
                  <button onClick={removeVideo} className="touch-btn px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    移除视频
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleVideoChange}
                  className="hidden"
                />
                <button
                  onClick={() => videoInputRef.current?.click()}
                  disabled={videoUploading}
                  className="touch-btn flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D5E2D5] rounded-xl text-sm text-[#5C725C] hover:bg-[#EEF4EF] transition-colors disabled:opacity-50"
                >
                  {videoUploading ? (
                    <><Loader2 size={16} className="animate-spin" /> 上传中 {videoProgress}%</>
                  ) : (
                    <><Upload size={16} /> 选择视频文件</>
                  )}
                </button>
                <span className="text-[10px] text-[#9AAA9A]">推荐 MP4，10秒以内，10MB 以内</span>
              </div>
            )}

            {/* 视频封面图 */}
            {form.video_url && (
              <div>
                <label className="block text-xs font-medium text-[#6B856B] mb-1.5">视频封面图（可选，加载视频前显示）</label>
                <ImageUploadField
                  label=""
                  value={form.poster_url}
                  onChange={v => setForm(f => ({ ...f, poster_url: v }))}
                  previewSize="w-full h-auto max-h-32 rounded-xl object-cover"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6B856B] mb-1.5">点击链接</label>
              <input value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))}
                placeholder="https://..."
                className="w-full px-3 py-2.5 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] placeholder:text-[#9AAA9A] outline-none touch-btn" />
            </div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl bg-[#EEF4EF] border border-[#E0ECE0] touch-btn">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-[#4A7C59]" />
                <span className="text-sm text-[#2D442D]">激活</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-[#E0ECE0]">
            <button onClick={() => setEditingId(null)} className="touch-btn px-5 py-2.5 text-sm text-[#5C725C] hover:text-[#1A2E1A] rounded-xl hover:bg-[#EEF4EF]">取消</button>
            <button onClick={handleSave} className="touch-btn px-6 py-2.5 bg-[#4A7C59] text-white text-sm font-medium rounded-xl">{editingId ? '保存' : '创建'}</button>
          </div>
        </div>
      )}

      {/* 列表 */}
      {loading ? <div className="text-center py-20 text-[#6B856B]">加载中...</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map(b => (
            <div key={b.id} className="group rounded-xl bg-white border border-[#E0ECE0] overflow-hidden hover:border-[#D5E2D5] transition-all shadow-sm sm:shadow-none">
              <div className="aspect-video bg-[#E8F3EC] relative overflow-hidden">
                {b.video_url ? (
                  <video
                    src={b.video_url}
                    poster={b.poster_url || undefined}
                    muted
                    loop
                    className="w-full h-full object-cover"
                  />
                ) : b.image_url ? (
                  <img src={b.image_url} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#9AAA9A]"><ImageIcon size={36} /></div>
                )}
                {b.video_url && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#4A7C59]/80 rounded text-[10px] text-white flex items-center gap-1">
                    <Video size={10} /> 视频
                  </div>
                )}
                {!b.is_active && <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 rounded text-[10px] text-white">未激活</div>}
              </div>
              <div className="p-4 sm:p-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium text-[#1A2E1A] truncate">{b.name}</h4>
                  <span className="text-[11px] text-[#8AA08A]">{POSITIONS.find(p => p.value === b.position)?.label || b.position}</span>
                </div>
                <div className="flex gap-1 flex-shrink-0 ml-2">
                  <Perm action="edit_banners"><button onClick={() => { setEditingId(b.id); setForm({
                    name: b.name, image_url: b.image_url || '', video_url: b.video_url || '',
                    poster_url: b.poster_url || '', link_url: b.link_url || '',
                    position: b.position, is_active: b.is_active, sort_order: String(b.sort_order || 0),
                  }); }} className="touch-btn p-1.5 hover:bg-[#EEF4EF] rounded"><Edit2 size={13} className="text-[#5C725C]" /></button></Perm>
                  <Perm action="edit_banners"><button onClick={() => handleDelete(b.id)} className="touch-btn p-1.5 hover:bg-red-500/10 rounded"><Trash2 size={13} className="text-red-400/50" /></button></Perm>
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
