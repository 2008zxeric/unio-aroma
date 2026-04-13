import React from 'react';
import { Image as ImageIcon, ExternalLink, X, Trash2 } from 'lucide-react';

// ============================================
// 公共图片组件 — URL输入 + 预览 + 可选相册
// 支持：URL输入 + 清除 + 替换 + 可选相册
// ⚠️ 不支持直接文件上传（会导致数据库膨胀）
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
  previewSize = 'w-16 h-16',
}: ImageUploadFieldProps) {
  const handleClear = () => {
    onChange('');
  };

  const galleryUrls = showGallery && galleryValue ? galleryValue.split('\n').filter(Boolean) : [];

  const handleGalleryRemove = (idx: number) => {
    const url = galleryUrls[idx];
    if (url && !confirm(`确认删除第${idx + 1}张图片？`)) return;
    const urls = galleryUrls.filter((_, j) => j !== idx);
    onGalleryChange?.(urls.join('\n'));
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-[#5C725C] flex items-center gap-1">
        <ImageIcon size={11} /> {label}
      </label>

      {/* === 已有图片 → 预览 + 操作区 === */}
      {value && (
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
                {value.startsWith('data:') ? '⚠️ 本地图片（Base64，建议替换）' : value.length > 60 ? value.slice(0, 60) + '...' : value}
              </p>
              <p className="text-[10px] text-[#9AAA9A] mt-1">
                {value.startsWith('data:')
                  ? `~${(value.length * 0.75 / 1024 / 1024).toFixed(1)}MB（建议替换为 URL 以节省空间）`
                  : '外部链接图片'
                }
              </p>
              {/* 操作按钮 */}
              <div className="flex items-center gap-2 mt-2">
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

          {/* URL 编辑 */}
          <div className="mt-3 pt-3 border-t border-[#E0ECE0]">
            <input
              type="text"
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="粘贴图片URL替换当前图片"
              className="w-full px-3 pr-8 py-2 bg-white border border-[#D5E2D5] rounded-lg text-xs text-[#1A2E1A] placeholder:text-[#A8BAA8] outline-none focus:border-[#4A7C59]"
            />
          </div>
        </div>
      )}

      {/* === 无图片 → URL 输入区 === */}
      {!value && (
        <div className="rounded-xl border-2 border-dashed border-[#D5E2D5] bg-[#F8FAF8] p-6 text-center">
          <ImageIcon size={28} className="mx-auto mb-3 text-[#9AAA9A]" />
          <p className="text-sm text-[#6B856B] mb-3">粘贴图片URL</p>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full px-4 py-3 bg-white border border-[#D5E2D5] rounded-lg text-sm text-[#1A2E1A] placeholder:text-[#A8BAA8] outline-none focus:border-[#4A7C59] transition-colors text-center"
            autoFocus
          />
          <p className="text-[10px] text-[#A8BAA8] mt-3">💡 建议使用 Unsplash、imgur、sm.ms 等图床链接</p>
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

          {/* URL 批量输入 */}
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
    </div>
  );
}
