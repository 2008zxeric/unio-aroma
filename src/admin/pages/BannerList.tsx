import { useEffect, useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, X, Loader2, Home, BookOpen, LayoutGrid, Save } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { bannerService } from '../../lib/dataService';
import type { Banner } from '../../lib/database.types';

// 后台用独立的 service_role 客户端来执行写入操作（绕过RLS）
const adminSupabase = createClient(
  'https://xuicjydgtoltdhkbqoju.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1aWNqeWRndG9sdGRoa2Jxb2p1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzMjY2OCwiZXhwIjoyMDkxMTA4NjY4fQ.PrfPpjQH0pWxzUUVqooXui1f3avjexLNsMPlj6CtvUQ'
);
import ImageUploadField from '../components/ImageUploadField';
import { Perm } from '../components/PermissionGuard';

// ===== 网站所有固定图片位定义 =====
interface ImageSlot {
  key: string;
  group: string;
  label: string;
  desc: string;
  fallback: string;
  groupIcon: React.ElementType;
}

const GROUPS = [
  { value: 'home', label: '首页', icon: Home },
  { value: 'story', label: '品牌叙事页', icon: BookOpen },
  { value: 'collections', label: '馆藏页', icon: LayoutGrid },
];

const IMAGE_SLOTS: ImageSlot[] = [
  // ── 首页 ──
  { key: 'home_hero', group: 'home', label: '全屏Hero背景图', desc: '首屏全幅背景，叠加暗色遮罩+标题/Slogan', fallback: '/assets/brand/brand.webp', groupIcon: Home },
  { key: 'home_series_yuan', group: 'home', label: '元系列卡片图', desc: '首页「四大馆藏」区块·元系列展示卡背景', fallback: '/assets/products/water/Patchouli Nocturne.webp', groupIcon: Home },
  { key: 'home_series_he', group: 'home', label: '和系列卡片图', desc: '首页「四大馆藏」区块·和系列展示卡背景', fallback: '/assets/brand/spary.webp', groupIcon: Home },
  { key: 'home_series_sheng', group: 'home', label: '生系列卡片图', desc: '首页「四大馆藏」区块·生系列展示卡背景', fallback: '/assets/brand/see.webp', groupIcon: Home },
  { key: 'home_series_jing', group: 'home', label: '香系列卡片图', desc: '首页「四大馆藏」区块·香系列展示卡背景', fallback: '/assets/brand/brand.webp', groupIcon: Home },

  // ── 品牌叙事页 ──
  { key: 'story_prologue', group: 'story', label: '序幕背景（Eric人物图）', desc: '品牌叙事第一屏全幅大图·行者Eric', fallback: 'Unsplash 旅行家图', groupIcon: BookOpen },
  { key: 'story_map', group: 'story', label: '创始基石·世界地图', desc: '品牌叙事第二屏右侧展示的世界地图', fallback: 'Unsplash 世界地图', groupIcon: BookOpen },
  { key: 'story_expert_alice', group: 'story', label: 'Alice·实验室场景图', desc: '品牌叙事第三屏·专家Alice场景照片', fallback: 'Unsplash 实验室图', groupIcon: BookOpen },
  { key: 'story_store_chengdu', group: 'story', label: '成都门店照片', desc: '品牌叙事「寻香之所」·成都店', fallback: '/storemain.webp', groupIcon: BookOpen },
  { key: 'story_store_ningbo', group: 'story', label: '宁波门店照片', desc: '品牌叙事「寻香之所」·宁波店', fallback: '/storemain1.webp', groupIcon: BookOpen },
  { key: 'story_store_pattaya', group: 'story', label: '芭提雅门店照片', desc: '品牌叙事「寻香之所」·芭提雅店', fallback: '/store1.webp', groupIcon: BookOpen },
  { key: 'story_finale', group: 'story', label: '终章背景大图', desc: '品牌叙事底部CTA深色大底图·渐现+模糊效果', fallback: '/story-finale-banner.webp', groupIcon: BookOpen },

  // ── 馆藏页 ──
  { key: 'collections_ad_yuan', group: 'collections', label: '元系列广告横幅', desc: '馆藏页·元系列切换时的广告横幅大图', fallback: '/assets/banner/banner-ad-1.webp', groupIcon: LayoutGrid },
  { key: 'collections_ad_he', group: 'collections', label: '和系列广告横幅', desc: '馆藏页·和系列切换时的广告横幅大图', fallback: '/assets/banner/banner-ad-2.webp', groupIcon: LayoutGrid },
  { key: 'collections_ad_sheng', group: 'collections', label: '生系列广告横幅', desc: '馆藏页·生系列切换时的广告横幅大图', fallback: '/assets/banner/banner-ad-3.webp', groupIcon: LayoutGrid },
  { key: 'collections_ad_jing', group: 'collections', label: '香系列广告横幅', desc: '馆藏页·香系列切换时的广告横幅大图', fallback: '/assets/banner/banner-ad-4.webp', groupIcon: LayoutGrid },
];

export default function AdminBanners() {
  const [banners, setBanners] = useState<Map<string, Banner>>(new Map());
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState('home');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState('');

  useEffect(() => {
    loadAllBanners();
  }, []);

  const loadAllBanners = async () => {
    setLoading(true);
    try {
      const all = await bannerService.getAll();
      const map = new Map<string, Banner>();
      all.forEach(b => map.set(b.name, b));
      setBanners(map);
    } catch (e: any) {
      console.error('加载海报失败:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (slot: ImageSlot) => {
    if (!editUrl.trim()) return;

    try {
      const existing = banners.get(slot.key);
      const payload: any = {
        name: slot.key,
        image_url: editUrl,
        position: slot.group,
        is_active: true,
        sort_order: 1,
      };

      if (existing) {
        const { error } = await adminSupabase.from('banners').update(payload).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await adminSupabase.from('banners').insert(payload);
        if (error) throw error;
      }

      await loadAllBanners();
      setEditingKey(null);
      setEditUrl('');
    } catch (err: any) {
      alert('保存失败: ' + err.message);
    }
  };

  const handleClear = async (slot: ImageSlot) => {
    if (!confirm(`确认清除「${slot.label}」的图片？前台将恢复默认图片`)) return;
    const existing = banners.get(slot.key);
    if (existing) {
      const { error } = await adminSupabase.from('banners').delete().eq('id', existing.id);
      if (error) throw error;
      await loadAllBanners();
    }
  };

  const slotsInGroup = IMAGE_SLOTS.filter(s => s.group === activeGroup);

  return (
    <div className="space-y-6 mobile-bottom-pad">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A2E1A]">图片位管理</h2>
          <p className="text-sm text-[#6B856B] mt-1">管理网站各页面的所有图片，按需替换，前台自动更新</p>
        </div>
      </div>

      {/* 分组标签 */}
      <div className="flex items-center gap-2">
        {GROUPS.map(g => {
          const Icon = g.icon;
          const count = IMAGE_SLOTS.filter(s => s.group === g.value).length;
          return (
            <button key={g.value} onClick={() => setActiveGroup(g.value)}
              className={`touch-btn flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeGroup === g.value
                  ? 'bg-[#4A7C59] text-white shadow-sm'
                  : 'bg-white border border-[#E0ECE0] text-[#5C725C] hover:bg-[#EEF4EF]'
              }`}>
              <Icon size={16} />
              <span>{g.label}</span>
              <span className={`ml-1 px-1.5 py-0.5 text-[10px] rounded ${
                activeGroup === g.value ? 'bg-white/20' : 'bg-[#EEF4EF] text-[#6B856B]'
              }`}>{count}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#6B856B]"><Loader2 size={24} className="animate-spin mx-auto mb-2" />加载中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slotsInGroup.map(slot => {
            const banner = banners.get(slot.key);
            const isEditing = editingKey === slot.key;
            const imageUrl = banner?.image_url || '';
            const hasImage = !!imageUrl;

            return (
              <div key={slot.key} className="rounded-2xl bg-white border border-[#E0ECE0] overflow-hidden hover:border-[#D5E2D5] transition-all">
                {/* 图片预览区 */}
                <div className="aspect-video bg-[#F2F7F3] relative overflow-hidden">
                  {imageUrl ? (
                    <img src={imageUrl} alt={slot.label} className="w-full h-full object-cover"
                      onError={e => { e.currentTarget.src = ''; e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#9AAA9A] gap-1">
                      <ImageIcon size={32} className="opacity-30" />
                      <span className="text-[10px] opacity-50">未设置·使用默认图</span>
                    </div>
                  )}
                </div>

                {/* 信息区 */}
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-[#1A2E1A]">{slot.label}</h4>
                    <p className="text-[11px] text-[#6B856B] mt-0.5">{slot.desc}</p>
                  </div>

                  {/* 编辑区域 */}
                  {isEditing ? (
                    <div className="space-y-2">
                      <ImageUploadField
                        label="上传新图片"
                        value={editUrl}
                        onChange={v => setEditUrl(v)}
                        previewSize="w-full h-24 rounded-lg object-cover"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleSave(slot)}
                          className="touch-btn flex items-center gap-1.5 px-4 py-2 bg-[#4A7C59] text-white text-xs font-medium rounded-xl hover:bg-[#3D6B4A]">
                          <Save size={13} /> 保存
                        </button>
                        <button onClick={() => { setEditingKey(null); setEditUrl(''); }}
                          className="touch-btn px-3 py-2 text-xs text-[#5C725C] rounded-xl hover:bg-[#EEF4EF]">
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#9AAA9A]">
                        {hasImage ? '✅ 已设置自定义图片' : '⬜ 使用默认图片'}
                      </span>
                      <div className="flex gap-1">
                        <Perm action="edit_banners">
                          <button onClick={() => { setEditingKey(slot.key); setEditUrl(imageUrl); }}
                            className="touch-btn px-3 py-1.5 text-xs font-medium bg-[#EEF4EF] text-[#3D5C3D] rounded-lg hover:bg-[#D5E2D5] transition-colors">
                            替换
                          </button>
                        </Perm>
                        {hasImage && (
                          <Perm action="edit_banners">
                            <button onClick={() => handleClear(slot)}
                              className="touch-btn px-3 py-1.5 text-xs text-red-400 rounded-lg hover:bg-red-50 transition-colors">
                              清除
                            </button>
                          </Perm>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
