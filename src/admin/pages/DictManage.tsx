import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X, BookText } from 'lucide-react';
import { dictService } from '../../lib/dataService';
import type { DictItem } from '../../lib/database.types';

export function AdminDicts() {
  const [dictTypes, setDictTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [items, setItems] = useState<DictItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [form, setForm] = useState({
    dict_type: '', label: '', value: '', sort_order: '0', parent_id: '',
  });

  // 加载所有字典类型
  useEffect(() => {
    dictService.getAllTypes().then(types => {
      setDictTypes(types);
      if (types.length > 0 && !selectedType) {
        setSelectedType(types[0]);
      }
    }).catch(() => {});
  }, []);

  // 根据选中类型加载条目
  useEffect(() => {
    if (!selectedType) { setItems([]); setLoading(false); return; }
    setLoading(true);
    dictService.getByType(selectedType).then(data => {
      setItems(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedType]);

  // 预置字典类型
  const PRESET_TYPES = [
    { value: 'element', label: '五行元素', desc: '金/木/水/火/土' },
    { value: 'category', label: '产品子分类', desc: '水/木/金/火/土 等细分类别' },
    { value: 'region', label: '区域分类', desc: '欧洲/亚洲/非洲/美洲/大洋洲/神州' },
    { value: 'supplier', label: '供货商', desc: '供货商代码与名称映射' },
    { value: 'extraction_method', label: '提炼方式', desc: '蒸馏萃取/脂吸法/压榨法等' },
    { value: 'product_group', label: '产品分组', desc: '元的水木/金的火 等' },
  ];

  const handleSave = async () => {
    if (!form.dict_type || !form.label || !form.value) {
      alert('请填写完整信息！'); return;
    }
    try {
      await dictService.create({
        ...form,
        sort_order: parseInt(form.sort_order) || 0,
        is_active: true,
        parent_id: form.parent_id || undefined,
      });
      
      if (form.dict_type === selectedType) await refresh();
      setShowForm(false);
      setForm({ dict_type: selectedType, label: '', value: '', sort_order: '0', parent_id: '' });
    } catch (err: any) { alert('保存失败：' + err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除？')) return;
    await dictService.delete(id);
    await refresh();
  };

  const refresh = () => dictService.getByType(selectedType).then(setItems);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">字典管理</h2>
        <p className="text-sm text-white/40 mt-1">管理系统中的枚举数据：元素、分类、区域、供货商等</p>
      </div>

      {/* 字典类型选择 */}
      <div className="flex flex-wrap gap-2">
        {[...new Set([...PRESET_TYPES.map(p => p.value), ...dictTypes])].map(type => {
          const preset = PRESET_TYPES.find(p => p.value === type);
          return (
            <button
              key={type}
              onClick={() => { setSelectedType(type); setShowForm(false); }}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                selectedType === type
                  ? 'bg-[#D75437] text-white'
                  : 'bg-[#1a1a1a] text-white/50 hover:text-white border border-white/5'
              }`}
            >
              {preset?.label || type}
            </button>
          );
        })}
      </div>

      {/* 当前类型说明 */}
      {(() => {
        const preset = PRESET_TYPES.find(p => p.value === selectedType);
        if (!preset) return null;
        return (
          <div className="p-3 rounded-lg bg-[#D4AF37]/5 border border-[#D4AF37]/10 flex items-center gap-2">
            <BookText size={16} className="text-[#D4AF37]" />
            <span className="text-xs text-white/50">{preset.desc}</span>
          </div>
        );
      })()}

      {/* 操作栏 */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-white/35">{selectedType ? `${items.length} 条记录` : '请选择字典类型'}</span>
        <button
          onClick={() => { setShowForm(true); setForm(f => ({ ...f, dict_type: selectedType })); }}
          disabled={!selectedType}
          className="flex items-center gap-2 px-4 py-2 bg-[#D75437] hover:bg-[#D75437]/80 text-white rounded-xl text-sm disabled:opacity-30"
        >
          <Plus size={14} /> 添加条目
        </button>
      </div>

      {/* 新增表单 */}
      {showForm && (
        <div className="rounded-xl bg-[#161616] border border-white/10 p-5 space-y-4">
          <h4 className="font-semibold text-white flex items-center justify-between">
            添加字典条目
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-white/5 rounded text-white/40"><X size={16} /></button>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><label className="block text-xs text-white/40 mb-1.5">类型</label><input value={form.dict_type} readOnly className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-white/8 rounded-lg text-sm text-white/60" /></div>
            <div><label className="block text-xs text-white/40 mb-1.5">显示名称 *</label><input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="例如: 金" className="w-full px-3 py-2.5 bg-[#0f0f0f] border border-white/8 rounded-lg text-sm text-white" /></div>
            <div><label className="block text-xs text-white/40 mb-1.5">存储值 *</label><input value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder="例如: metal" className="w-full px-3 py-2.5 bg-[#0f0f0f] border border-white/8 rounded-lg text-sm text-white" /></div>
            <div><label className="block text-xs text-white/40 mb-1.5">排序</label><input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} className="w-full px-3 py-2.5 bg-[#0f0f0f] border border-white/8 rounded-lg text-sm text-white" /></div>
          </div>
          <div className="flex justify-end"><button onClick={handleSave} className="px-5 py-2 bg-[#D75437] text-white rounded-lg text-sm">保存</button></div>
        </div>
      )}

      {/* 列表 */}
      {loading ? (
        <div className="text-center py-20 text-white/40">加载中...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <BookText size={48} className="mx-auto mb-4 opacity-30" />
          <p>此类型暂无数据，点击上方按钮添加</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map(item => (
            <div key={item.id} className="group flex items-center gap-4 px-4 py-3 rounded-lg bg-[#1a1a1a] border border-white/5 hover:border-white/10 transition-all">
              <code className="px-2 py-0.5 rounded bg-white/5 text-[11px] text-[#D4AF37]/70 min-w-[80px] text-center">{item.value}</code>
              <span className="text-sm text-white/90 flex-1">{item.label}</span>
              <span className="text-xs text-white/25 w-12 text-right">{item.sort_order}</span>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={13} className="text-red-400/50" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// 权限管理（用户管理）
// ============================================

export function AdminUsers() {
  const [users] = useState([
    { id: '1', username: 'eric', display_name: 'Eric', role: 'super_admin', is_active: true, last_login_at: new Date().toISOString(), created_at: '2026-01-01T00:00:00Z' },
  ]);

  const ROLE_LABELS: Record<string, { label: string; color: string; desc: string }> = {
    super_admin: { label: '超级管理员', color: '#D75437', desc: '全部权限' },
    admin: { label: '管理员', color: '#1C39BB', desc: '除用户管理外全部权限' },
    editor: { label: '编辑者', color: '#7B9EA8', desc: '内容编辑权限' },
    viewer: { label: '查看者', color: '#888', desc: '只读访问' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">权限管理</h2>
        <p className="text-sm text-white/40 mt-1">管理系统用户和角色权限</p>
      </div>

      <div className="rounded-xl bg-[#1a1a1a] border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/5">
            <th className="text-left px-4 py-3 text-xs font-medium text-white/35 uppercase tracking-wider">用户</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-white/35 uppercase">角色</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-white/35 uppercase">状态</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-white/35 uppercase">最后登录</th>
          </tr></thead>
          <tbody>
            {users.map(u => {
              const roleInfo = ROLE_LABELS[u.role];
              return (
                <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D75437]/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-[#D4AF37]">{u.display_name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-white/90 font-medium">{u.display_name}</p>
                        <p className="text-xs text-white/30">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {roleInfo && (
                      <span style={{ color: roleInfo.color }} className="text-xs font-medium">
                        {roleInfo.label}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] ${u.is_active ? 'bg-green-500/15 text-green-400' : 'bg-zinc-700 text-white/30'}`}>
                      {u.is_active ? '激活' : '禁用'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/35 text-xs">
                    {u.last_login_at ? new Date(u.last_login_at).toLocaleString('zh-CN') : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 角色说明卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {Object.entries(ROLE_LABELS).map(([key, info]) => (
          <div key={key} className="p-4 rounded-xl bg-[#1a1a1a] border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: info.color }} />
              <span className="text-sm font-medium" style={{ color: info.color }}>{info.label}</span>
            </div>
            <p className="text-xs text-white/35">{info.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// 系统设置（占位）
// ============================================

export function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">系统设置</h2>
        <p className="text-sm text-white/40 mt-1">全局系统配置</p>
      </div>
      <div className="rounded-xl bg-[#1a1a1a] border border-white/5 p-12 text-center text-white/30">
        <p>系统设置功能开发中...</p>
        <p className="mt-2 text-xs text-white/20">包括：数据库备份、缓存清理、站点配置等</p>
      </div>
    </div>
  );
}
