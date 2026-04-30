// ============================================
// 🖼 图片库管理 — 上传/浏览/复制URL/删除/排序
// ============================================
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Image as ImageIcon, Search, Copy, Trash2, Check, X,
  Loader2, RefreshCw, ExternalLink, Grid3X3,
  List as ListIcon, Upload, FileImage, AlertTriangle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import imageCompression from 'browser-image-compression';
import { Perm } from '../components/PermissionGuard';

const BUCKET = 'product-images';
const SORT_KEY = 'unio_image_library_sort';
const PAGE_SIZE = 48;

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  metadata?: { size?: number; mimetype?: string };
  publicUrl: string;
}

// 压缩配置
const COMPRESS_OPTS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1200,
  useWebWorker: true,
  initialQuality: 0.8,
};

export default function ImageLibrary() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [allFiles, setAllFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // 上传状态
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // ---- 排序状态 ----
  const [sortMode, setSortMode] = useState<'name' | 'date' | 'manual'>('date');
  // 手动排序顺序（文件名列表）
  const [manualOrder, setManualOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(SORT_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // 加载文件
  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: listErr } = await supabase.storage
        .from(BUCKET)
        .list('img_library', { limit: 1000, offset: 0, sortBy: { column: 'updated_at', order: 'desc' } });

      if (listErr) throw new Error(listErr.message);
      if (!data) { setFiles([]); setAllFiles([]); setTotalCount(0); return; }

      const withUrls = data.map(f => ({
        ...f,
        publicUrl: supabase.storage.from(BUCKET).getPublicUrl('img_library/' + f.name).data.publicUrl + `?t=${Date.now()}`,
      }));

      setAllFiles(withUrls);
      setTotalCount(withUrls.length);

      // 排序
      const sorted = sortFiles(withUrls, sortMode, manualOrder);
      applyPage(sorted);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError('加载图片列表失败：' + msg);
    } finally {
      setLoading(false);
    }
  }, [sortMode, manualOrder]);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  // 排序函数
  const sortFiles = (list: StorageFile[], mode: string, manual: string[]) => {
    const arr = [...list];
    switch (mode) {
      case 'name':
        return arr.sort((a, b) => a.name.localeCompare(b.name));
      case 'date':
        return arr.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      case 'manual': {
        // 在 manualOrder 中的按顺序排，不在的按名字排后面
        const inOrder = arr.filter(f => manual.includes(f.name));
        const notInOrder = arr.filter(f => !manual.includes(f.name)).sort((a, b) => a.name.localeCompare(b.name));
        const ordered = manual.map(n => inOrder.find(f => f.name === n)).filter(Boolean) as StorageFile[];
        return [...ordered, ...notInOrder];
      }
      default:
        return arr;
    }
  };

  const saveManualOrder = (newOrder: string[]) => {
    setManualOrder(newOrder);
    localStorage.setItem(SORT_KEY, JSON.stringify(newOrder));
  };

  const applyPage = (sorted: StorageFile[]) => {
    const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    setFiles(paged);
  };

  // 上传
  const uploadFile = async (file: File) => {
    setUploadProgress(0);
    setUploadError('');

    // 压缩
    let uploadFile_ = file;
    if (file.size > 100 * 1024) {
      try {
        setUploadProgress(10);
        const compressed = await imageCompression(file, COMPRESS_OPTS);
        uploadFile_ = compressed;
      } catch {}
    }

    // 生成路径
    setUploadProgress(30);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const ts = Date.now();
    const path = `img_library/${ts}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    setUploadProgress(50);
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, uploadFile_, {
      cacheControl: '3600',
      upsert: true,
    });

    if (upErr) throw new Error(upErr.message);
    setUploadProgress(90);

    // 获取 URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    setUploadProgress(100);
    return urlData.publicUrl;
  };

  const processFiles = async (files_: FileList | File[]) => {
    const fileArr = Array.from(files_);
    if (fileArr.length === 0) return;

    setUploading(true);
    setUploadError('');
    let successCount = 0;
    let failMsg = '';

    for (let i = 0; i < fileArr.length; i++) {
      const f = fileArr[i];
      try {
        await uploadFile(f);
        successCount++;
      } catch (err: unknown) {
        failMsg = err instanceof Error ? err.message : String(err);
      }
    }

    setUploading(false);
    if (failMsg) setUploadError(failMsg);

    if (successCount > 0) {
      // 刷新列表
      await loadFiles();
      setPage(0);
    }
  };

  // 拖拽
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    // 只有离开整个 drop zone 才取消
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  // 复制 URL
  const copyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // 删除
  const deleteFile = async (fileName: string) => {
    if (!confirm(`确认删除「${fileName.split('/').pop()}」？\\n此操作不可恢复！`)) return;
    setDeleting(fileName);
    try {
      const fullPath = 'img_library/' + fileName;
      const { error: delErr } = await supabase.storage.from(BUCKET).remove([fullPath]);
      if (delErr) throw new Error(delErr.message);
      setAllFiles(prev => prev.filter(f => f.name !== fileName));
      setFiles(prev => prev.filter(f => f.name !== fileName));
      setSelectedFiles(prev => { const n = new Set(prev); n.delete(fileName); return n; });
      setTotalCount(c => c - 1);
    } catch (err: unknown) {
      alert('删除失败：' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setDeleting(null);
    }
  };

  // 批量删除
  const deleteSelected = async () => {
    if (selectedFiles.size === 0) return;
    if (!confirm(`确认删除选中的 ${selectedFiles.size} 张图片？此操作不可恢复！`)) return;
    setDeleting('batch');
    try {
      const arr = Array.from(selectedFiles);
      const { error: delErr } = await supabase.storage.from(BUCKET).remove(arr);
      if (delErr) throw new Error(delErr.message);
      setAllFiles(prev => prev.filter(f => !selectedFiles.has(f.name)));
      setFiles(prev => prev.filter(f => !selectedFiles.has(f.name)));
      setSelectedFiles(new Set());
      setTotalCount(c => c - arr.length);
    } catch (err: unknown) {
      alert('批量删除失败：' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setDeleting(null);
    }
  };

  const toggleSelect = (name: string) => {
    setSelectedFiles(prev => {
      const n = new Set(prev);
      if (n.has(name)) n.delete(name); else n.add(name);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map(f => f.name)));
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // 搜索过滤
  const filteredFiles = search
    ? files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : files;

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
    return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
  };

  return (
    <div className="space-y-6">
      {/* 顶栏 */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F3EC] flex items-center justify-center">
            <ImageIcon size={22} className="text-[#4A7C59]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A2E1A]">图片库</h1>
            <p className="text-xs text-[#9AAA9A]">
              共 {totalCount} 个文件 · {uploading ? `上传中 ${uploadProgress}%` : '拖拽或点击上传'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 批量删除 */}
          {selectedFiles.size > 0 && (
            <button
              onClick={deleteSelected}
              disabled={deleting === 'batch'}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {deleting === 'batch' ? (
                <><Loader2 size={14} className="animate-spin" /> 删除中...</>
              ) : (
                <><Trash2 size={14} /> 删除选中 ({selectedFiles.size})</>
              )}
            </button>
          )}

          <button
            onClick={() => loadFiles()}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E0ECE0] hover:bg-[#F4F7F4] rounded-xl text-xs text-[#5C725C] transition-colors"
          >
            <RefreshCw size={14} /> 刷新
          </button>

          {/* 视图切换 */}
          <div className="flex bg-white border border-[#E0ECE0] rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-[#E8F3EC] text-[#4A7C59]' : 'text-[#9AAA9A] hover:text-[#5C725C]'}`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-[#E8F3EC] text-[#4A7C59]' : 'text-[#9AAA9A] hover:text-[#5C725C]'}`}
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ===== 上传区域 ===== */}
      <Perm action="edit_texts"><div
        ref={dropZoneRef}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 transition-all text-center cursor-pointer
          ${isDragging
            ? 'border-[#4A7C59] bg-[#E8F3EC] scale-[1.01]'
            : 'border-[#D5E2D5] bg-[#FAFCFA] hover:border-[#B0CCB0] hover:bg-[#F4F9F4]'
          }`}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => { if (e.target.files) processFiles(e.target.files); }}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-[#4A7C59]" />
            <div className="w-48 h-2 bg-[#E0ECE0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4A7C59] rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-sm text-[#5C725C]">上传中 {uploadProgress}%</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={28} className={isDragging ? 'text-[#4A7C59]' : 'text-[#9AAA9A]'} />
            <p className="text-sm text-[#5C725C]">
              {isDragging ? '松开以上传' : '拖拽图片到此处，或点击选择'}
            </p>
            <p className="text-xs text-[#A8BAA8]">支持 JPG / PNG / WebP，自动压缩至 500KB 以内</p>
          </div>
        )}

        {/* 上传错误 */}
        {uploadError && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-xs text-red-600">上传失败：{uploadError}</span>
          </div>
        )}
      </div></Perm>

      {/* 搜索 */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AAA9A]" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜索文件名..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E0ECE0] rounded-xl text-sm text-[#1A2E1A] placeholder:text-[#A8BAA8] outline-none focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9AAA9A] hover:text-[#5C725C]"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* 排序工具栏 */}
      {!loading && allFiles.length > 0 && (
        <div className="flex items-center gap-3 text-xs text-[#5C725C]">
          <span>排序：</span>
          {(['date', 'name', 'manual'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => {
                setSortMode(mode);
                setPage(0);
                if (mode === 'manual' && manualOrder.length === 0) {
                  // 首次进入手动模式：用当前顺序初始化
                  saveManualOrder(allFiles.map(f => f.name));
                }
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                sortMode === mode
                  ? 'bg-[#E8F3EC] text-[#4A7C59] font-medium'
                  : 'hover:bg-[#F4F7F4]'
              }`}
            >
              {mode === 'date' ? '按时间' : mode === 'name' ? '按名称' : '手动排序'}
            </button>
          ))}
          {sortMode === 'manual' && (
            <span className="text-[#A8BAA8] ml-2">
              💡 拖拽图片可调整顺序（保存在本地浏览器）
            </span>
          )}
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-red-600 flex-1">{error}</span>
        </div>
      )}

      {/* 全选 */}
      {files.length > 0 && !search && (
        <label className="flex items-center gap-2 text-xs text-[#5C725C] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={selectedFiles.size === files.length}
            onChange={toggleSelectAll}
            className="rounded border-[#D5E2D5] text-[#4A7C59] focus:ring-[#4A7C59]"
          />
          全选本页 ({files.length})
        </label>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-[#4A7C59]" />
            <span className="text-sm text-[#9AAA9A]">加载图片列表...</span>
          </div>
        </div>
      )}

      {/* 空状态 */}
      {!loading && filteredFiles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-[#9AAA9A]">
          <FileImage size={48} className="mb-4 opacity-30" />
          <p className="text-sm">{search ? '未找到匹配的图片' : '暂无图片，拖拽或点击上方区域上传'}</p>
        </div>
      )}

      {/* ===== 网格视图 ===== */}
      {!loading && viewMode === 'grid' && filteredFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredFiles.map(file => (
            <div
              key={file.name}
              draggable={sortMode === 'manual'}
              onDragStart={e => {
                if (sortMode === 'manual') e.dataTransfer.setData('text/plain', file.name);
              }}
              onDragOver={e => {
                if (sortMode === 'manual') { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }
              }}
              onDrop={e => {
                if (sortMode === 'manual') {
                  e.preventDefault();
                  const draggedName = e.dataTransfer.getData('text/plain');
                  if (!draggedName || draggedName === file.name) return;
                  const newOrder = manualOrder.filter(n => n !== draggedName);
                  const idx = newOrder.indexOf(file.name);
                  newOrder.splice(idx, 0, draggedName);
                  saveManualOrder(newOrder);
                  loadFiles();
                }
              }}
              className={`group relative rounded-xl border-2 overflow-hidden bg-white transition-all cursor-${sortMode === 'manual' ? 'grab' : 'default'} ${
                selectedFiles.has(file.name)
                  ? 'border-[#4A7C59] ring-2 ring-[#4A7C59]/20'
                  : 'border-[#E0ECE0] hover:border-[#B0CCB0] hover:shadow-md'
              }`}
            >
              {/* 选择框 */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.name)}
                  onChange={() => toggleSelect(file.name)}
                  className="rounded border-white/80 text-[#4A7C59] focus:ring-[#4A7C59] shadow-sm"
                />
              </div>

              {/* 图片 */}
              <div className="aspect-square bg-[#FAFCFA] relative">
                <img
                  src={file.publicUrl}
                  alt={file.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={e => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23F4F7F4" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%239AAA9A" font-size="10">加载失败</text></svg>';
                  }}
                />

                {/* 悬浮操作 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => copyUrl(file.publicUrl, file.name)}
                    className="w-8 h-8 rounded-lg bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
                    title="复制URL"
                  >
                    {copiedId === file.name ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  </button>
                  <a
                    href={file.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
                    title="打开"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={() => deleteFile(file.name)}
                    disabled={deleting === file.name}
                    className="w-8 h-8 rounded-lg bg-white/90 hover:bg-red-50 flex items-center justify-center transition-colors disabled:opacity-50"
                    title="删除"
                  >
                    {deleting === file.name ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} className="text-red-500" />}
                  </button>
                </div>
              </div>

              {/* 文件信息 */}
              <div className="px-2.5 py-2">
                <p className="text-[11px] text-[#5C725C] truncate" title={file.name}>
                  {file.name.split('/').pop() || file.name}
                </p>
                <p className="text-[10px] text-[#A8BAA8] mt-0.5">
                  {formatSize(file.metadata?.size)}
                  {file.metadata?.size && ' · '}
                  {file.updated_at ? new Date(file.updated_at).toLocaleDateString('zh-CN') : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== 列表视图 ===== */}
      {!loading && viewMode === 'list' && filteredFiles.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E0ECE0] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E0ECE0] bg-[#FAFCFA]">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedFiles.size === filteredFiles.length}
                    onChange={toggleSelectAll}
                    className="rounded border-[#D5E2D5] text-[#4A7C59] focus:ring-[#4A7C59]"
                  />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[#5C725C]">预览</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#5C725C]">文件名</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#5C725C]">大小</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#5C725C]">更新时间</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#5C725C]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0ECE0]">
              {filteredFiles.map(file => (
                <tr key={file.name} className="hover:bg-[#FAFCFA] transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.name)}
                      onChange={() => toggleSelect(file.name)}
                      className="rounded border-[#D5E2D5] text-[#4A7C59] focus:ring-[#4A7C59]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <img
                      src={file.publicUrl}
                      alt={file.name}
                      className="w-10 h-10 rounded-lg object-cover border border-[#E0ECE0]"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-[#1A2E1A] truncate max-w-[300px]" title={file.name}>
                      {file.name}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#9AAA9A]">{formatSize(file.metadata?.size)}</td>
                  <td className="px-4 py-3 text-xs text-[#9AAA9A]">
                    {file.updated_at ? new Date(file.updated_at).toLocaleString('zh-CN') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyUrl(file.publicUrl, file.name)}
                        className="p-1.5 rounded-lg hover:bg-[#E8F3EC] text-[#5C725C] hover:text-[#4A7C59] transition-colors"
                        title="复制URL"
                      >
                        {copiedId === file.name ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      </button>
                      <a
                        href={file.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-[#5C725C] hover:text-blue-600 transition-colors"
                        title="打开"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <button
                        onClick={() => deleteFile(file.name)}
                        disabled={deleting === file.name}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-[#5C725C] hover:text-red-500 transition-colors disabled:opacity-50"
                        title="删除"
                      >
                        {deleting === file.name ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && !search && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-lg border border-[#E0ECE0] bg-white hover:bg-[#F4F7F4] disabled:opacity-40 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-[#5C725C] px-4">
            第 {page + 1} / {totalPages} 页
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-2 rounded-lg border border-[#E0ECE0] bg-white hover:bg-[#F4F7F4] disabled:opacity-40 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* 已复制提示 */}
      {copiedId && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#1A2E1A] text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2 animate-bounce">
          <Check size={16} className="text-green-400" />
          URL 已复制到剪贴板 ✅
        </div>
      )}
    </div>
  );
}

function ChevronLeft({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
