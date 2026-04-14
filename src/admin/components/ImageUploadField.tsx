import React, { useRef, useState } from 'react';
import { Image as ImageIcon, ExternalLink, X, Trash2, Upload, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ============================================
// 公共图片组件 — URL输入 + 本地上传 + 预览 + 可选相册
// 支持：本地文件上传（Supabase Storage）+ URL粘贴 + 清除 + 相册
// Bucket: product-images（需在 Supabase Dashboard 设为 public）
// ============================================

const BUCKET = 'product-images';

interface ImageUploadFieldProps {
  /** 标签文字，如"产品主图"、"首页大图" */
  label: string;
  /** 当前图片值（URL） */
  value: string;
  /** 值变更回调 */
  onChange: (v: string) => void;
  /** 是否显示相册区域（默认 false） */
  showGallery?: boolean;
  /** 相册 URL 文本（换行分隔），仅 showGallery=true 时生效 */
  galleryValue?: string;
  /** 相册 URL 变更回调，仅 showGallery=true 时生效 */
  onGalleryChange?: (v: string) => void;
  /** 自定义预览尺寸 className，默认 "w-16 h-16" */
  previewSize?: string;
  /** 上传路径前缀，如 "products/YUAN-y1" */
  uploadPrefix?: string;
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  showGallery = false,
  galleryValue = '',
  onGalleryChange,
  previewSize = 'w-16 h-16',
  uploadPrefix = 'uploads',
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [galleryUploading, setGalleryUploading] = useState(false);

  const galleryUrls = showGallery && galleryValue ? galleryValue.split('\n').filter(Boolean) : [];

  // ===== 上传单张图片到 Supabase Storage =====
  const uploadFile = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const ts = Date.now();
    // 强制路径只含安全字符（英文/数字/横线/下划线），防止中文 key 导致 Supabase Storage 报错
    const safePrefix = uploadPrefix.replace(/[^a-zA-Z0-9_\-\/]/g, '') || 'uploads';
    const path = `${safePrefix}/${ts}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  // ===== 主图上传 =====
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('图片不能超过 10MB');
      return;
    }
    setUploading(true);
    setUploadError('');
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Bucket not found') || msg.includes('bucket')) {
        setUploadError('❗ Storage 未配置。请先在 Supabase Dashboard → Storage 创建名为 "product-images" 的 Public Bucket，再重试。');
      } else {
        setUploadError('上传失败：' + msg);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ===== 相册图片上传 =====
  const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setGalleryUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) continue;
        const url = await uploadFile(file);
        urls.push(url);
      }
      const existing = galleryUrls;
      const merged = [...existing, ...urls].slice(0, 6); // 最多6张
      onGalleryChange?.(merged.join('\n'));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setUploadError('相册上传失败：' + msg);
    } finally {
      setGalleryUploading(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
    }
  };

  const handleClear = () => onChange('');

  const handleGalleryRemove = (idx: number) => {
    if (!confirm(`确认删除第${idx + 1}张图片？`)) return;
    const urls = galleryUrls.filter((_, j) => j !== idx);
    onGalleryChange?.(urls.join('\n'));
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-[#5C725C] flex items-center gap-1">
        <ImageIcon size={11} /> {label}
      </label>

      {/* === 有图片 → 预览 + 操作 === */}
      {value && (
        <div className="relative group rounded-xl border border-[#D5E2D5] bg-[#F8FAF8] p-4">
          <div className="flex items-center gap-4">
            <img
              src={value}
              alt="预览"
              className={`${previewSize} rounded-lg object-cover border border-[#E0ECE0] flex-shrink-0`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#3D5C3D] font-medium truncate">
                {value.length > 60 ? value.slice(0, 60) + '...' : value}
              </p>
              <p className="text-[10px] text-[#9AAA9A] mt-1">
                {value.includes('supabase') ? '✅ Supabase Storage' : '🔗 外部链接图片'}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {value.startsWith('http') && (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#4A7C59]/10 hover:bg-[#4A7C59]/20 text-[#4A7C59] rounded-lg text-[11px] font-medium transition-colors"
                  >
                    <ExternalLink size={10} /> 新窗口查看
                  </a>
                )}
                {/* 替换图片按钮 */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[11px] font-medium transition-colors disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={10} className="animate-spin" /> : <Upload size={10} />}
                  替换图片
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-[11px] font-medium transition-colors"
                >
                  <Trash2 size={10} /> 删除图片
                </button>
              </div>
            </div>
          </div>

          {/* URL 手动编辑 */}
          <div className="mt-3 pt-3 border-t border-[#E0ECE0]">
            <input
              type="text"
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="或粘贴图片URL替换"
              className="w-full px-3 py-2 bg-white border border-[#D5E2D5] rounded-lg text-xs text-[#1A2E1A] placeholder:text-[#A8BAA8] outline-none focus:border-[#4A7C59]"
            />
          </div>
        </div>
      )}

      {/* === 无图片 → 上传 + URL 输入 === */}
      {!value && (
        <div className="rounded-xl border-2 border-dashed border-[#D5E2D5] bg-[#F8FAF8] p-5">
          {/* 上传按钮区 */}
          <div className="flex flex-col items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#4A7C59] hover:bg-[#3D6B4A] text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60 shadow-sm"
            >
              {uploading
                ? <><Loader2 size={15} className="animate-spin" /> 上传中…</>
                : <><Upload size={15} /> 从本地上传图片</>
              }
            </button>
            <p className="text-[11px] text-[#9AAA9A]">支持 JPG / PNG / WEBP，最大 10MB</p>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-px bg-[#D5E2D5]" />
            <span className="text-[11px] text-[#9AAA9A]">或粘贴URL</span>
            <div className="flex-1 h-px bg-[#D5E2D5]" />
          </div>

          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full px-4 py-2.5 bg-white border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] placeholder:text-[#A8BAA8] outline-none focus:border-[#4A7C59] transition-colors"
          />
        </div>
      )}

      {/* 错误提示 */}
      {uploadError && (
        <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex items-start gap-2">
          <span className="flex-shrink-0 mt-0.5">⚠️</span>
          <span>{uploadError}</span>
          <button type="button" onClick={() => setUploadError('')} className="ml-auto flex-shrink-0">
            <X size={12} />
          </button>
        </div>
      )}

      {/* 隐藏 file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* === 相册区域（可选） === */}
      {showGallery && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[#5C725C] flex items-center gap-1">
              <ImageIcon size={11} /> 图片相册
              <span className="text-[10px] text-[#9AAA9A] ml-1">（最多 6 张）</span>
            </label>
            {/* 相册上传按钮 */}
            <button
              type="button"
              onClick={() => galleryFileInputRef.current?.click()}
              disabled={galleryUploading || galleryUrls.length >= 6}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#E8F3EC] hover:bg-[#D4EDDA] text-[#4A7C59] rounded-lg text-[11px] font-medium transition-colors disabled:opacity-50"
            >
              {galleryUploading ? <Loader2 size={10} className="animate-spin" /> : <Upload size={10} />}
              添加图片
            </button>
          </div>

          {/* 已有相册图片 */}
          {galleryUrls.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {galleryUrls.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt={`相册第${i + 1}张`} className="w-20 h-20 rounded-lg object-cover border border-[#E0ECE0]" />
                  <button
                    type="button"
                    onClick={() => handleGalleryRemove(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-sm hover:bg-red-600"
                  >
                    <X size={10} />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-black/50 rounded-b-lg text-[9px] text-white text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    第{i + 1}张
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* URL 批量输入（折叠） */}
          <details className="group">
            <summary className="text-[11px] text-[#9AAA9A] cursor-pointer hover:text-[#5C725C] transition-colors select-none">
              ▸ 通过URL添加/管理图片（点击展开）
            </summary>
            <div className="mt-2">
              <textarea
                value={galleryValue}
                onChange={e => onGalleryChange?.(e.target.value)}
                placeholder="每行粘贴一个图片URL"
                rows={3}
                className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-xs text-[#1A2E1A] placeholder:text-[#A8BAA8] outline-none focus:border-[#4A7C59] resize-none"
              />
              <p className="text-[10px] text-[#9AAA9A] mt-1">每行一个URL，保存时自动合并</p>
            </div>
          </details>
        </div>
      )}

      {/* 隐藏相册 file input（支持多选） */}
      <input
        ref={galleryFileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleGalleryFileChange}
      />
    </div>
  );
}
