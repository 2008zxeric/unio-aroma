import React, { useEffect, useState } from 'react';
import { Type, X, Save } from 'lucide-react';
import { siteTextService, bannerService, recommendService } from '../../lib/dataService';

// 网站文字管理 — 管理各页面上的文字内容
export function AdminTexts() {
  const [texts, setTexts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [activePage, setActivePage] = useState('home');

  const PAGES = [
    { key: 'home', label: '首页' },
    { key: 'story', label: '品牌叙事' },
    { key: 'collections', label: '馆藏' },
    { key: 'atlas', label: '寻香' },
    { key: 'footer', label: '底部/通用' },
    { key: 'global', label: '全局设置' },
  ];

  // 预设文字键（用于初始化）
  const PRESET_KEYS: Record<string, Array<{ key: string; desc: string; defaultValue: string }>> = {
    home: [
      { key: 'hero_title_cn', desc: '首页大标题（中文）', defaultValue: '元于一息' },
      { key: 'hero_title_en', desc: '首页大标题（英文）', defaultValue: 'Original Harmony Sanctuary' },
      { key: 'hero_subtitle', desc: '首页副标题', defaultValue: '从极境撷取芳香，因世界元于一息。' },
      { key: 'brand_intro', desc: '品牌简介段落', defaultValue: '' },
      { key: 'section_products_title', desc: '产品区标题', defaultValue: '极境原力 · 单方精油' },
      { key: 'section_countries_title', desc: '国家区标题', defaultValue: '全球寻香地图' },
    ],
    story: [
      { key: 'story_title_1', desc: '篇章1 标题', defaultValue: '廿载寻香之路' },
      { key: 'story_desc_1', desc: '篇章1 描述', defaultValue: '' },
      { key: 'story_quote', desc: '品牌引用语', defaultValue: '"真正的奢侈并非价格，而是香气背后那份跨越极境、未经干扰的生命原力。"' },
    ],
    collections: [
      { key: 'series_yuan_title', desc: '元·单方 标题', defaultValue: '元 · 单方精油' },
      { key: 'series_yuan_desc', desc: '元·单方 描述', defaultValue: '' },
      { key: 'series_he_title', desc: '和·复方 标题', defaultValue: '和 · 复方油' },
      { key: 'series_sheng_title', desc: '生·纯露 标题', defaultValue: '生 · 纯露' },
      { key: 'series_xiang_title', desc: '香·空间 标题', defaultValue: '香 · 空间香氛' },
    ],
    atlas: [
      { key: 'atlas_title', desc: '寻香页标题', defaultValue: '全球极境寻香地图' },
      { key: 'atlas_subtitle', desc: '寻香页副标题', defaultValue: '' },
    ],
    footer: [
      { key: 'footer_text', desc: '底部文字', defaultValue: '© UNIO AROMA 元香 · 极境芳疗' },
      { key: 'icp', desc: 'ICP备案号', defaultValue: '' },
    ],
    global: [
      { key: 'site_name', desc: '网站名称', defaultValue: 'UNIO AROMA 元香' },
      { key: 'site_description', desc: '网站SEO描述', defaultValue: '' },
      { key: 'contact_wechat', desc: '微信号', defaultValue: '' },
      { key: 'contact_email', desc: '联系邮箱', defaultValue: '' },
    ],
  };

  const loadTexts = async () => {
    try {
      setLoading(true);
      const data = await siteTextService.getByPage(activePage);
      
      // 如果没有数据，用预设值初始化
      if (data.length === 0) {
        const presets = PRESET_KEYS[activePage] || [];
        const initialized = presets.map(p => ({
          id: '', // 新的
          key: p.key,
          value: p.defaultValue,
          description: p.desc,
          page: activePage,
        }));
        setTexts(initialized);
      } else {
        setTexts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTexts(); }, [activePage]);

  const handleSave = async (key: string, value: string) => {
    try {
      setSaving(true);
      await siteTextService.upsert(key, value, activePage);
      await loadTexts();
      setEditingKey(null);
    } catch (err: any) {
      alert('保存失败：' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">文字管理</h2>
        <p className="text-sm text-white/40 mt-1">编辑网站各页面显示的文字内容</p>
      </div>

      {/* 页面切换 */}
      <div className="flex gap-2 flex-wrap">
        {PAGES.map(p => (
          <button
            key={p.key}
            onClick={() => setActivePage(p.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activePage === p.key
                ? 'bg-[#D75437] text-white'
                : 'bg-[#1a1a1a] text-white/50 hover:text-white border border-white/5'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 文字列表 */}
      {loading ? (
        <div className="text-center py-20 text-white/40">加载中...</div>
      ) : texts.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <Type size={48} className="mx-auto mb-4 opacity-30" />
          <p>此页面暂无文字配置</p>
        </div>
      ) : (
        <div className="space-y-3">
          {texts.map((item, idx) => (
            <div
              key={`${item.key}-${idx}`}
              className={`rounded-xl bg-[#1a1a1a] border transition-all ${
                editingKey === item.key ? 'border-[#D75437]/40' : 'border-white/5 hover:border-white/10'
              } p-4`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-[#D4AF37]/70">{item.key}</span>
                    <span className="text-xs text-white/35">{item.description || ''}</span>
                  </div>
                  
                  {editingKey === item.key ? (
                    <textarea
                      autoFocus
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 bg-[#0f0f0f] border border-[#D75437]/30 rounded-lg text-sm text-white focus:border-[#D75437]/60 outline-none resize-y"
                    />
                  ) : (
                    <p className="text-sm text-white/70 whitespace-pre-wrap cursor-pointer hover:text-white/90" onClick={() => { setEditingKey(item.key); setEditValue(item.value || ''); }}>
                      {item.value || <span className="italic text-white/20">（空）</span>}
                    </p>
                  )}
                </div>

                {editingKey === item.key && (
                  <div className="flex gap-2 flex-shrink-0 ml-2">
                    <button
                      onClick={() => handleSave(item.key, editValue)}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D75437] text-white text-xs rounded-lg disabled:opacity-50"
                    >
                      {saving ? <SpinIcon size={12} /> : <Save size={12} />}
                      保存
                    </button>
                    <button onClick={() => setEditingKey(null)} className="px-3 py-1.5 text-white/40 text-xs hover:text-white">取消</button>
                  </div>
                )}

                {editingKey !== item.key && (
                  <button onClick={() => { setEditingKey(item.key); setEditValue(item.value || ''); }} className="p-2 flex-shrink-0 hover:bg-white/5 rounded-lg opacity-40 hover:opacity-100 transition-opacity">
                    <Type size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SpinIcon({ size }: { size?: number }) {
  return <svg className="animate-spin" width={size} height={size} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>;
}

// ============================================
// 首页推荐管理
// ============================================

export function AdminRecommends() {
  const [recommends, setRecommends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recommendService.getAll().then(data => { setRecommends(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">首页推荐管理</h2>
        <p className="text-sm text-white/40 mt-1">管理首页展示的精选产品和国家推荐</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-white/40">加载中...</div>
      ) : (
        <div className="rounded-xl bg-[#1a1a1a] border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/5"><th className="text-left px-4 py-3 text-xs font-medium text-white/35 uppercase tracking-wider">类型</th><th className="text-left px-4 py-3 text-xs font-medium text-white/35">关联ID</th><th className="text-left px-4 py-3 text-xs font-medium text-white/35">标题</th><th className="text-left px-4 py-3 text-xs font-medium text-white/35">状态</th></tr></thead>
            <tbody>
              {recommends.map(r => (
                <tr key={r.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[11px] ${r.type === 'product' ? 'bg-blue-500/15 text-blue-400' : r.type === 'country' ? 'bg-green-500/15 text-green-400' : 'bg-purple-500/15 text-purple-400'}`}>{r.type}</span></td>
                  <td className="px-4 py-3 font-mono text-white/40">{r.ref_id}</td>
                  <td className="px-4 py-3 text-white/80">{r.title || '-'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[11px] ${r.is_active ? 'bg-green-500/15 text-green-400' : 'bg-zinc-700 text-white/30'}`}>{r.is_active ? '激活' : '隐藏'}</span></td>
                </tr>
              ))}
              {recommends.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-white/30">暂无推荐数据</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
