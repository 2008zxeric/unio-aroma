import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Play, Loader2, Upload, X, Check, Eye, Video, Trash2, ExternalLink } from 'lucide-react';
import { Perm } from '../components/PermissionGuard';

const BUCKET = 'product-images';
const VIDEO_PREFIX = 'welcome-videos/';

export default function WelcomeVideo() {
  const [videoUrl, setVideoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [exists, setExists] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 加载已有的视频 URL
  useEffect(() => {
    loadVideo();
  }, []);

  const loadVideo = async () => {
    try {
      const { data, error } = await supabase
        .from('site_texts')
        .select('value')
        .eq('key', 'home_welcome_video')
        .single();
      
      if (data?.value) {
        setVideoUrl(data.value);
        setExists(true);
      }
    } catch {
      // 表里没有记录是正常的
    }
  };

  // 上传视频到 Supabase Storage
  const uploadVideo = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      setError('视频文件太大，请压缩至 50MB 以内（建议 10MB 左右）');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      setUploadProgress(15);
      const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
      const ts = Date.now();
      const path = `${VIDEO_PREFIX}${ts}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (upErr) throw new Error(upErr.message);
      setUploadProgress(80);

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      setUploadProgress(100);
      setVideoUrl(urlData.publicUrl);
      setSaved(false);
    } catch (err: any) {
      if (err.message?.includes('Bucket not found')) {
        setError('Storage 未配置。请先在 Supabase Dashboard → Storage 创建名为 "product-images" 的 Public Bucket。');
      } else {
        setError('上传失败：' + (err.message || err));
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // 保存视频 URL 到 site_texts 表
  const saveVideo = async () => {
    if (!videoUrl.trim()) {
      setError('请先上传视频');
      return;
    }

    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const { error: upsertErr } = await supabase
        .from('site_texts')
        .upsert({ key: 'home_welcome_video', value: videoUrl, page: 'home', description: '首页欢迎视频' }, 
          { onConflict: 'key' });
      
      if (upsertErr) throw upsertErr;
      setSaved(true);
      setExists(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError('保存失败：' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  // 删除视频
  const removeVideo = async () => {
    if (!confirm('确认移除这个欢迎视频？')) return;
    
    try {
      const { error: delErr } = await supabase
        .from('site_texts')
        .delete()
        .eq('key', 'home_welcome_video');
      
      if (delErr) throw delErr;
      setVideoUrl('');
      setExists(false);
      setSaved(false);
    } catch (err: any) {
      setError('删除失败：' + (err.message || err));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadVideo(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 mobile-bottom-pad max-w-2xl">
      {/* 标题 */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800 bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">首页欢迎视频</h2>
        <p className="text-base text-slate-500 mt-1">
          上传一个短片作为首页欢迎视频，首次访问时全屏播放一次
        </p>
      </div>

      {/* 当前状态 */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F8FAF8] border border-[#E0ECE0]">
        <div className={`w-2.5 h-2.5 rounded-full ${exists ? 'bg-green-500' : 'bg-[#C5D6C5]'}`} />
        <span className="text-sm text-[#5C725C]">
          {exists ? '✅ 已有欢迎视频配置' : '当前未设置欢迎视频'}
        </span>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <span className="text-red-500 flex-shrink-0 mt-0.5">⚠️</span>
          <span className="text-xs text-red-600 flex-1">{error}</span>
          <button type="button" onClick={() => setError('')} className="text-red-400 hover:text-red-600 flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 视频上传区 */}
      <div className="rounded-2xl bg-white border border-[#D5E2D5] overflow-hidden">
        {/* 已有视频预览 */}
        {videoUrl ? (
          <div className="p-5 space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-w-lg">
              <video 
                ref={videoRef}
                src={videoUrl} 
                controls
                className="w-full h-full"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8AA08A] truncate">
              <Video size={14} />
              <span className="truncate flex-1">{videoUrl.split('/').pop()}</span>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-3 flex-wrap">
              <Perm action="edit_banners">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#4A7C59] hover:bg-[#3D6B4A] text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                >
                  {uploading ? (
                    <><Loader2 size={16} className="animate-spin" /> 上传中 {uploadProgress}%</>
                  ) : (
                    <><Upload size={16} /> 替换视频</>
                  )}
                </button>
              </Perm>
              <button
                onClick={() => setPreviewOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D5E2D5] rounded-xl text-sm text-[#5C725C] hover:bg-[#EEF4EF] transition-all"
              >
                <Eye size={16} /> 全屏预览
              </button>
              <Perm action="edit_banners">
                <button
                  onClick={removeVideo}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all"
                >
                  <Trash2 size={16} /> 删除
                </button>
              </Perm>
            </div>
          </div>
        ) : (
          /* 无视频 → 拖拽/点击上传 */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-12 text-center cursor-pointer hover:bg-[#F8FAF8] transition-all"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-[#E8F3EC] flex items-center justify-center">
                {uploading ? (
                  <Loader2 size={28} className="animate-spin text-[#4A7C59]" />
                ) : (
                  <Video size={28} className="text-[#4A7C59]" />
                )}
              </div>
              {uploading ? (
                <div className="w-full max-w-xs">
                  <p className="text-sm font-medium text-[#4A7C59]">上传中 {uploadProgress}%</p>
                  <div className="mt-2 h-2 bg-[#E0ECE0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#4A7C59] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold text-[#3D5C3D]">点击选择视频文件</p>
                  <p className="text-xs text-[#8AA08A]">支持 MP4 / WebM · 推荐 10秒以内 · 50MB 以内</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 保存按钮 */}
      {videoUrl && (
        <Perm action="edit_banners">
          <button
            onClick={saveVideo}
            disabled={saving}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-[#4A7C59] hover:bg-[#3D6B4A] text-white disabled:opacity-50'
            }`}
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> 保存中...</>
            ) : saved ? (
              <><Check size={16} /> 已保存 ✓</>
            ) : (
              <><Upload size={16} /> 保存配置</>
            )}
          </button>
        </Perm>
      )}

      {/* 隐藏文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 全屏视频预览 */}
      {previewOpen && videoUrl && (
        <div 
          className="fixed inset-0 z-[300] bg-black flex items-center justify-center"
          onClick={() => setPreviewOpen(false)}
        >
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full object-contain"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setPreviewOpen(false)}
            className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/70 hover:bg-white/20 hover:text-white transition-all z-10"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
