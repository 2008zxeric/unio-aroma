import React, { useEffect, useState, useCallback } from 'react';
import { X, Image as ImageIcon, Loader2, Search, Check, RefreshCw, FileImage } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const BUCKET = 'product-images';

interface ImagePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentUrl?: string;
}

export default function ImagePickerModal({ open, onClose, onSelect, currentUrl }: ImagePickerModalProps) {
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('');

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list('img_library', { limit: 500, offset: 0, sortBy: { column: 'updated_at', order: 'desc' } });
      if (error) throw error;
      if (!data) { setFiles([]); return; }
      const withUrls = data.map(f => ({
        name: f.name,
        url: supabase.storage.from(BUCKET).getPublicUrl('img_library/' + f.name).data.publicUrl + `?t=${Date.now()}`,
      }));
      setFiles(withUrls);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) { setSelected(currentUrl || ''); setSearch(''); loadFiles(); }
  }, [open, currentUrl, loadFiles]);

  const filtered = search ? files.filter(f => f.name.toLowerCase().includes(search.toLowerCase())) : files;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-4xl max-h-[85vh] flex flex-col border border-[#E0ECE0]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0ECE0]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#E8F3EC] flex items-center justify-center">
              <ImageIcon size={18} className="text-[#4A7C59]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A2E1A]">从图库选择</h2>
              <p className="text-[11px] text-[#9AAA9A]">{files.length} 个文件</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadFiles} className="p-2 rounded-lg hover:bg-[#F4F7F4] text-[#5C725C]" title="刷新">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-red-50 text-[#9AAA9A] hover:text-red-500">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="px-6 py-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AAA9A]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索文件名..."
              className="w-full pl-9 pr-3 py-2 bg-[#FAFCFA] border border-[#E0ECE0] rounded-lg text-sm text-[#1A2E1A] placeholder:text-[#A8BAA8] outline-none focus:border-[#4A7C59] transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-[#4A7C59]" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#9AAA9A]">
              <FileImage size={36} className="mb-3 opacity-30" />
              <p className="text-sm">{search ? '未找到匹配的图片' : '暂无图片，请先上传'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
              {filtered.map(file => (
                <button
                  key={file.name}
                  onClick={() => setSelected(file.url)}
                  className={`group relative rounded-xl overflow-hidden border-2 transition-all bg-white ${
                    file.url === selected ? 'border-[#4A7C59] ring-2 ring-[#4A7C59]/20' : 'border-[#E0ECE0] hover:border-[#B0CCB0] hover:shadow-sm'
                  }`}
                >
                  <div className="aspect-square bg-[#FAFCFA] relative">
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy"
                      onError={e => {(e.target as HTMLImageElement).src = 'data:image/svg+xml,...'}} />
                    {file.url === selected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#4A7C59] rounded-full flex items-center justify-center shadow-sm">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <p className="px-2 py-1.5 text-[10px] text-[#5C725C] truncate" title={file.name}>
                    {file.name.split('/').pop() || file.name}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-[#E0ECE0] flex items-center justify-between">
          <p className="text-xs text-[#9AAA9A] truncate max-w-[50%]">
            {selected ? `已选：${selected.split('/').pop()}` : '请点击选择一张图片'}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-[#E0ECE0] text-sm text-[#5C725C] hover:bg-[#F4F7F4] transition-colors">取消</button>
            <button onClick={() => { onSelect(selected); onClose(); }} disabled={!selected}
              className="px-5 py-2 rounded-xl bg-[#4A7C59] text-white text-sm font-medium hover:bg-[#3D6B4A] transition-colors disabled:opacity-40">确认选择</button>
          </div>
        </div>
      </div>
    </div>
  );
}
