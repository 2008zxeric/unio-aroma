import React, { useState, useRef } from 'react';
import { Image as ImageIcon, ExternalLink, X, Upload, Trash2 } from 'lucide-react';

// ============================================
// 公共图片上传组件 — 拖拽/URL兼容 + 预览
// 支持：单图上传 + URL输入 + 清除 + 替换 + 可选相册
// ============================================

interface ImageUploadFieldProps {
  /** 标签文字，如"产品主图"、"首页大图" */
  label: string;
  /** 当前图片值（URL 或 base64 data URL） */
  value: string;
  /** 值变更回调 */
  onChange: (v: string) => void;
  /** 是否显示相册区域（默认 false） */
  showGallery?: boolean;
  /** 相册 URL 文本（换行分隔），仅 showGallery=true 时生效 */
  galleryValue?: string;
  /** 相册 URL 变更回调，仅 showGallery=true 时生效 */
  onGalleryChange?: (v: string) => void;
  /** 图片最大尺寸（MB），默认 5 */
  maxSizeMB?: number;
  /** 自定义预览尺寸 className，默认 "w-16 h-16" */
  previewSize?: string;
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  showGallery = false,
  galleryValue = '',
  onGalleryChange,
  maxSizeMB = 5,
  previewSize = 'w-16 h-16',
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { alert('请上传图片文件！'); return; }
    if (file.size > maxSizeMB * 1024 * 1024) { alert(`图片不能超过 ${maxSizeMB}MB`); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => { onChange(e.target?.result as string); setUploading(false); };
    reader.onerror = () => { alert('读取图片失败'); setUploading(false); };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    onChange('');
    // 重置 file input，防止重新选择同一文件时不触发 change
    if (fileRef.current) fileRef.current.value = '';
  };

  const galleryUrls = showGallery && galleryValue ? galleryValue.split('\n').filter(Boolean) : [];

  const handleGalleryRemove = (idx: number) => {
    const url = galleryUrls[idx];
    if (url && !confirm(`确认删除第${idx + 1}张图片？`)) return;
    const urls = galleryUrls.filter((_, j) => j !== idx);
    onGalleryChange?.(urls.join('\n'));
  };

  const handleGalleryUpload = (file: File) => {
    if (!file.type.startsWith('image/')) { alert('请上传图片文件！'); return; }
    if (file.size > maxSizeMB * 1024 * 1024) { alert(`图片不能超过 ${maxSizeMB}MB`); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const newUrl = e.target?.result as string;
      const urls = [...galleryUrls, newUrl];
      onGalleryChange?.(urls.join('\n'));
      setUploading(false);
    };
    reader.onerror = () => { alert('读取图片失败'); setUploading(false); };
    reader.readAsDataURL(file);
  };

  const galleryFileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-[#5C725C] flex items-center gap-1">
        <ImageIcon size={11} /> {label}
      </label>

      {/* === 已有图片 → 预览 + 操作区 === */}
      {value && !uploading && (
        <div className="relative group rounded-xl border border-[#D5E2D5] bg-[#F8FAF8] p-4">
          {/* 预览图 */}
          <div className="flex items-center gap-4">
            <img
              src={value}
              alt="预览"
              className={`${previewSize} rounded-lg object-cover border border-[#E0ECE0]`}
            />
            <div className="flex-1 min-w-0">
              {/* 图片信息 */}
              <p className="text-xs text-[#3D5C3D] font-medium truncate">
                {value.startsWith('data:') ? '本地图片（Base64）' : value.length > 60 ? value.slice(0, 60) + '...' : value}
              </p>
              <p className="text-[10px] text-[#9AAA9A] mt-1">
                {value.startsWith('data:')
                  ? `~${(value.length * 0.75 / 1024 / 1024).toFixed(1)}MB（建议替换为 URL 以节省空间）`
                  : '外部链接图片'
                }
              </p>
              {/* 操作按钮 */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#4A7C59]/10 hover:bg-[#4A7C59]/20 text-[#4A7C59] rounded-lg text-[11px] font-medium transition-colors"
                >
                  <Upload size={10} /> 替换图片
                </button>
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

          {/* URL 编辑（折叠式） */}
          <div className="mt-3 pt-3 border-t border-[#E0ECE0]">
            <input
              type="text"
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="粘贴图片URL替换当前图片"
              className="w-full px-3 pr-8 py-2 bg-white border border-[#D5E2D5] rounded-lg text-xs text-[#1A2E1A] placeholder:text-[#A8BAA8] outline-none focus:border-[#4A7C59]"
            />
          </div>

          {/* 隐藏 file input（替换用） */}
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const file = e.target.files?.[0]; if (file) handleFile(file); }} />
        </div>
      )}

      {/* === 无图片 → 拖拽上传区 === */}
      {!value && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault(); setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          onClick={() => fileRef.current?.click()}
          className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            dragOver ? 'border-blue-400 bg-blue-50' : 'border-[#D5E2D5] bg-[#F8FAF8] hover:border-blue-300 hover:bg-blue-50/50'
          }`}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-blue-400 text-sm">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              上传中...
            </div>
          ) : (
            <div>
              <ImageIcon size={28} className="mx-auto mb-2 text-[#9AAA9A]" />
              <p className="text-sm text-[#6B856B]">拖拽图片到这里 · 或点击选择文件</p>
              <p className="text-[10px] text-[#A8BAA8] mt-1">支持 JPG/PNG/WebP · 最大 {maxSizeMB}MB</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const file = e.target.files?.[0]; if (file) handleFile(file); }} />
        </div>
      )}

      {/* URL 备用输入（仅在无图片时显示） */}
      {!value && (
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="或直接粘贴图片URL: https://..."
            className="w-full pl-3 pr-8 py-2 bg-[#F8FAF8] border border-[#D5E2D5] rounded-lg text-xs text-[#1A2E1A] placeholder:text-[#A8BAA8] outline-none focus:border-[#4A7C59]"
          />
        </div>
      )}

      {/* === 相册区域（可选） === */}
      {showGallery && (
        <div className="space-y-3 pt-2">
          <label className="text-xs font-medium text-[#5C725C] flex items-center gap-1">
            <ImageIcon size={11} /> 图片相册
          </label>

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

          {/* 添加相册图片按钮 */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => galleryFileRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4A7C59]/10 hover:bg-[#4A7C59]/20 text-[#4A7C59] rounded-lg text-[11px] font-medium transition-colors"
            >
              <Upload size={11} /> 添加相册图片
            </button>
            <span className="text-[10px] text-[#9AAA9A]">
              {galleryUrls.length > 0 ? `已有 ${galleryUrls.length} 张 · ` : ''}支持 JPG/PNG/WebP
            </span>
            <input ref={galleryFileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const file = e.target.files?.[0]; if (file) handleGalleryUpload(file); }} />
          </div>

          {/* URL 批量输入（折叠） */}
          <details className="group">
            <summary className="text-[11px] text-[#9AAA9A] cursor-pointer hover:text-[#5C725C] transition-colors select-none">
              ▸ 通过URL批量添加（点击展开）
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
    </div>
  );
}
