import React, { useRef, useState, useCallback } from 'react';
import { Image as ImageIcon, ExternalLink, X, Trash2, Upload, Loader2, ZoomIn, FileImage } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { supabase } from '../../lib/supabase';

// ============================================
// 统一图片上传组件 — 自动压缩 + 拖拽上传 + 预览
// 
// 特性：
// - 自动压缩大图（默认宽度 1200px，质量 80%，最大 500KB）
// - 拖拽上传 + 点击上传
// - 实时压缩进度
// - 清晰的预览/删除/替换操作
// ============================================

const BUCKET = 'product-images';

// 默认压缩配置
const DEFAULT_COMPRESS_OPTIONS = {
  maxSizeMB: 0.5,           // 最大 500KB
  maxWidthOrHeight: 1200,   // 最大宽高 1200px
  useWebWorker: true,
  initialQuality: 0.8,
};

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
  /** 相册最大张数（默认 4） */
  galleryMax?: number;
  /** 自定义预览尺寸 className，默认 "w-20 h-20" */
  previewSize?: string;
  /** 上传路径前缀，如 "products/YUAN-y1" */
  uploadPrefix?: string;
  /** 压缩选项（可覆盖默认） */
  compressOptions?: Partial<typeof DEFAULT_COMPRESS_OPTIONS>;
  /** 是否禁用压缩（默认 false） */
  disableCompress?: boolean;
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  showGallery = false,
  galleryValue = '',
  onGalleryChange,
  galleryMax = 4,
  previewSize = 'w-20 h-20',
  uploadPrefix = 'uploads',
  compressOptions,
  disableCompress = false,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const galleryUrls = showGallery && galleryValue ? galleryValue.split('\n').filter(Boolean) : [];
  const finalCompressOptions = { ...DEFAULT_COMPRESS_OPTIONS, ...compressOptions };

  // ===== 压缩图片 =====
  const compressImage = async (file: File): Promise<File> => {
    if (disableCompress) return file;
    
    // 如果图片已经很小，不压缩
    if (file.size <= 100 * 1024) return file;
    
    try {
      const compressedFile = await imageCompression(file, finalCompressOptions);
      console.log(`[ImageCompress] ${file.name}: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB`);
      return compressedFile;
    } catch (err) {
      console.warn('[ImageCompress] 压缩失败，使用原图:', err);
      return file;
    }
  };

  // ===== 上传单张图片到 Supabase Storage =====
  const uploadFile = async (file: File, onProgress?: (p: number) => void): Promise<string> => {
    // 1. 压缩图片
    onProgress?.(10);
    const compressedFile = await compressImage(file);
    
    // 2. 生成路径
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const ts = Date.now();
    const safePrefix = uploadPrefix.replace(/[^a-zA-Z0-9_\-\/]/g, '') || 'uploads';
    const path = `${safePrefix}/${ts}.${ext}`;
    
    onProgress?.(50);
    
    // 3. 上传到 Supabase
    const { error } = await supabase.storage.from(BUCKET).upload(path, compressedFile, {
      cacheControl: '3600',
      upsert: true,
    });
    
    if (error) throw new Error(error.message);
    
    onProgress?.(90);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  // ===== 拖拽处理 =====
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // ===== 主图上传 =====
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    await processFile(file);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setUploadError('请上传图片文件（JPG / PNG / WEBP）');
      return;
    }
    
    // 验证文件大小（压缩前最大 10MB）
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('图片不能超过 10MB');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    setUploadError('');
    
    try {
      const url = await uploadFile(file, setUploadProgress);
      onChange(url);
      setUploadProgress(100);
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
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 10 * 1024 * 1024) continue;
        const url = await uploadFile(file);
        urls.push(url);
      }
      const existing = galleryUrls;
      const merged = [...existing, ...urls].slice(0, galleryMax);
      onGalleryChange?.(merged.join('\n'));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setUploadError('相册上传失败：' + msg);
    } finally {
      setGalleryUploading(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    if (confirm('确认删除这张图片？')) {
      onChange('');
    }
  };

  const handleGalleryRemove = (idx: number) => {
    if (!confirm(`确认删除第${idx + 1}张图片？`)) return;
    const urls = galleryUrls.filter((_, j) => j !== idx);
    onGalleryChange?.(urls.join('\n'));
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-[#2D3B2D] flex items-center gap-2">
        <ImageIcon size={14} /> {label}
      </label>

      {/* === 有图片 → 大预览 + 明显操作区 === */}
      {value && (
        <div className="relative rounded-2xl border-2 border-[#4A7C59]/30 bg-gradient-to-br from-[#F8FAF8] to-[#F0F7F0] p-5">
          {/* 大预览图 */}
          <div className="flex gap-5">
            <div className="relative group flex-shrink-0">
              <img
                src={value}
                alt="预览"
                className="w-32 h-32 rounded-xl object-cover border-2 border-white shadow-lg cursor-zoom-in hover:shadow-xl transition-shadow"
                onClick={() => setPreviewOpen(true)}
              />
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
              >
                <ZoomIn size={24} className="text-white" />
              </button>
            </div>
            
            {/* 信息 + 操作 */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <p className="text-xs text-[#5C725C] font-medium break-all line-clamp-2">
                  {value}
                </p>
                <p className="text-[11px] text-[#8AA08A] mt-1 flex items-center gap-1">
                  {value.includes('supabase') ? (
                    <>✅ Supabase Storage</>
                  ) : (
                    <>🔗 外部链接</>
                  )}
                </p>
              </div>
              
              {/* 操作按钮组 */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#4A7C59] hover:bg-[#3D6B4A] text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50 shadow-sm"
                >
                  {uploading ? (
                    <><Loader2 size={14} className="animate-spin" /> 上传中 {uploadProgress}%</>
                  ) : (
                    <><Upload size={14} /> 替换图片</>
                  )}
                </button>
                
                {value.startsWith('http') && (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <ExternalLink size={14} /> 查看原图
                  </a>
                )}
                
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Trash2 size={14} /> 删除
                </button>
              </div>
            </div>
          </div>
          
          {/* URL 手动编辑 */}
          <div className="mt-4 pt-4 border-t border-[#D5E2D5]">
            <input
              type="text"
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="或粘贴图片URL替换"
              className="w-full px-4 py-2.5 bg-white border border-[#D5E2D5] rounded-xl text-xs text-[#1A2E1A] placeholder:text-[#A8BAA8] outline-none focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 transition-all"
            />
          </div>
          
          {/* 上传进度条 */}
          {uploading && uploadProgress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E0ECE0] rounded-b-2xl overflow-hidden">
              <div 
                className="h-full bg-[#4A7C59] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* === 无图片 → 拖拽上传区 === */}
      {!value && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all
            ${isDragging 
              ? 'border-[#4A7C59] bg-[#4A7C59]/10 scale-[1.02]' 
              : 'border-[#D5E2D5] bg-[#FAFCFA] hover:border-[#4A7C59] hover:bg-[#F0F7F0]'
            }
          `}
        >
          <div className="flex flex-col items-center gap-3">
            <div className={`
              w-16 h-16 rounded-2xl flex items-center justify-center transition-colors
              ${isDragging ? 'bg-[#4A7C59] text-white' : 'bg-[#E8F3EC] text-[#4A7C59]'}
            `}>
              {uploading ? (
                <Loader2 size={28} className="animate-spin" />
              ) : (
                <FileImage size={28} />
              )}
            </div>
            
            {uploading ? (
              <div className="w-full max-w-xs">
                <p className="text-sm font-medium text-[#4A7C59]">上传中 {uploadProgress}%</p>
                <div className="mt-2 h-2 bg-[#E0ECE0] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#4A7C59] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-[#3D5C3D]">
                  点击或拖拽上传图片
                </p>
                <p className="text-xs text-[#8AA08A]">
                  支持 JPG / PNG / WEBP · 最大 10MB · 自动压缩至 {Math.round(finalCompressOptions.maxSizeMB * 1000)}KB
                </p>
              </>
            )}
          </div>
          
          {/* URL 输入（阻止点击冒泡） */}
          <div 
            className="mt-5 pt-4 border-t border-[#E0ECE0]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-px bg-[#D5E2D5]" />
              <span className="text-[11px] text-[#9AAA9A]">或粘贴URL</span>
              <div className="flex-1 h-px bg-[#D5E2D5]" />
            </div>
            <input
              type="text"
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2.5 bg-white border border-[#D5E2D5] rounded-xl text-sm text-[#1A2E1A] placeholder:text-[#A8BAA8] outline-none focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 transition-all"
            />
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {uploadError && (
        <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <span className="text-red-500 flex-shrink-0 mt-0.5">⚠️</span>
          <span className="text-xs text-red-600 flex-1">{uploadError}</span>
          <button type="button" onClick={() => setUploadError('')} className="text-red-400 hover:text-red-600">
            <X size={14} />
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
        <div className="space-y-3 pt-3 border-t border-[#E0ECE0]">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-[#2D3B2D] flex items-center gap-2">
              <ImageIcon size={14} /> 图片相册
              <span className="text-[11px] text-[#8AA08A] font-normal">（最多 {galleryMax} 张，已 {galleryUrls.length} 张）</span>
            </label>
            {galleryUrls.length < galleryMax && (
              <button
                type="button"
                onClick={() => galleryFileInputRef.current?.click()}
                disabled={galleryUploading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4A7C59] hover:bg-[#3D6B4A] text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                {galleryUploading ? (
                  <><Loader2 size={12} className="animate-spin" /> 上传中</>
                ) : (
                  <><Upload size={12} /> 添加图片</>
                )}
              </button>
            )}
          </div>

          {/* 已有相册图片 */}
          {galleryUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {galleryUrls.map((url, i) => (
                <div key={i} className="relative group aspect-square">
                  <img 
                    src={url} 
                    alt={`相册${i + 1}`} 
                    className="w-full h-full rounded-xl object-cover border border-[#E0ECE0]" 
                  />
                  <button
                    type="button"
                    onClick={() => handleGalleryRemove(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-md"
                  >
                    <X size={12} />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl py-1.5 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white font-medium">第 {i + 1} 张</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* URL 批量输入 */}
          <details className="group">
            <summary className="text-xs text-[#7BA689] cursor-pointer hover:text-[#4A7C59] transition-colors select-none">
              ▸ 通过URL管理图片（点击展开）
            </summary>
            <div className="mt-2">
              <textarea
                value={galleryValue}
                onChange={e => onGalleryChange?.(e.target.value)}
                placeholder="每行一个图片URL"
                rows={3}
                className="w-full px-3 py-2 bg-[#FAFCFA] border border-[#D5E2D5] rounded-xl text-xs text-[#1A2E1A] placeholder:text-[#A8BAA8] outline-none focus:border-[#4A7C59] resize-none"
              />
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

      {/* === 全屏预览模态框 === */}
      {previewOpen && value && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8"
          onClick={() => setPreviewOpen(false)}
        >
          <button
            className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
            onClick={() => setPreviewOpen(false)}
          >
            <X size={20} />
          </button>
          <img 
            src={value} 
            alt="预览" 
            className="max-w-full max-h-full rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

// 导出压缩配置，方便其他地方使用
export { DEFAULT_COMPRESS_OPTIONS };
