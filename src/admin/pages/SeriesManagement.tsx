// ============================================
// 📦 系列管理 — 系列CRUD + 排序 + 上下架
// ============================================
import React, { useEffect, useState, useCallback } from 'react';
import {
  Layers, Plus, Save, X, Edit3, Trash2,
  ArrowUp, ArrowDown, ToggleLeft, ToggleRight,
  Loader2, AlertTriangle, Check, RefreshCw,
  Package
} from 'lucide-react';
import { seriesService } from '../../lib/dataService';
import { useAuth, writeAuditLog } from '../../lib/auth';
import { Perm } from '../components/PermissionGuard';
import type { Series, SeriesCode } from '../../lib/database.types';

const EMPTY_FORM = { code: '' as SeriesCode | '', name_cn: '', name_en: '', description: '', color: '#4A7C59', sort_order: 0, is_active: true };

// 系列代码选项
const SERIES_CODE_OPTIONS = [
  { value: 'yuan', label: '元 (Yuan) — 单方精油' },
  { value: 'he', label: '和 (He) — 复方精油' },
  { value: 'sheng', label: '生 (Sheng) — 纯露' },
  { value: 'jing', label: '境 (Jing) — 香道' },
];

export default function SeriesManagement() {
  const { user } = useAuth();
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const loadSeries = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await seriesService.getAllWithInactive();
      setSeries(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSeries(); }, [loadSeries]);

  // 新建
  const openNew = () => {
    setForm({ ...EMPTY_FORM, sort_order: series.length + 1 });
    setEditId(null);
    setShowForm(true);
  };

  // 编辑
  const openEdit = (s: Series) => {
    setForm({
      code: s.code,
      name_cn: s.name_cn,
      name_en: s.name_en,
      description: s.description || '',
      color: s.color || '#4A7C59',
      sort_order: s.sort_order,
      is_active: s.is_active,
    });
    setEditId(s.id);
    setShowForm(true);
  };

  // 保存
  const handleSave = async () => {
    if (!form.code || !form.name_cn) {
      alert('请填写系列代码和中英文名称');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await seriesService.update(editId, form as Partial<Series>);
        await writeAuditLog(user!.id, 'update', 'series', editId, { note: `更新系列：${form.name_cn}` });
      } else {
        await seriesService.create(form as Partial<Series>);
        await writeAuditLog(user!.id, 'create', 'series', '', { note: `创建系列：${form.name_cn}` });
      }
      setShowForm(false);
      await loadSeries();
    } catch (err: unknown) {
      alert('保存失败：' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  // 切换上下架
  const toggleActive = async (s: Series) => {
    try {
      await seriesService.update(s.id, { is_active: !s.is_active });
      await writeAuditLog(user!.id, 'update', 'series', s.id, { note: `${!s.is_active ? '上架' : '下架'}系列：${s.name_cn}` });
      await loadSeries();
    } catch (err: unknown) {
      alert('操作失败：' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // 删除
  const handleDelete = async (s: Series) => {
    if (!confirm(`确认删除系列「${s.name_cn}」？此操作不可恢复！`)) return;
    try {
      await seriesService.delete(s.id);
      await writeAuditLog(user!.id, 'delete', 'series', s.id, { note: `删除系列：${s.name_cn}` });
      await loadSeries();
    } catch (err: unknown) {
      alert('删除失败：' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // 排序调整
  const moveSort = async (s: Series, direction: 'up' | 'down') => {
    const sorted = [...series].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex(x => x.id === s.id);
    if (idx < 0) return;
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= sorted.length) return;
    const swap = sorted[target];
    try {
      await seriesService.update(s.id, { sort_order: swap.sort_order });
      await seriesService.update(swap.id, { sort_order: s.sort_order });
      await loadSeries();
    } catch (err: unknown) {
      alert('排序失败：' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="space-y-6">
      {/* 顶栏 */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D75437]/10 to-[#D4AF37]/10 flex items-center justify-center">
            <Layers size={22} className="text-[#D75437]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A2E1A]">系列管理</h1>
            <p className="text-xs text-[#9AAA9A]">
              {series.filter(s => s.is_active).length} 个激活 · 共 {series.length} 个
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadSeries}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E0ECE0] hover:bg-[#F4F7F4] rounded-xl text-xs text-[#5C725C] transition-colors"
          >
            <RefreshCw size={14} /> 刷新
          </button>
          <Perm action="edit_dicts">
            <button
              onClick={openNew}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#4A7C59] hover:bg-[#3D6B4A] text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
            >
              <Plus size={14} /> 新建系列
            </button>
          </Perm>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-red-600 flex-1">{error}</span>
        </div>
      )}

      {/* 编辑/新建表单 */}
      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-[#4A7C59]/30 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1A2E1A]">
              {editId ? '编辑系列' : '新建系列'}
            </h2>
            <button onClick={() => setShowForm(false)} className="p-1.5 text-[#9AAA9A] hover:text-[#5C725C]">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 系列代码 */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-[#5C725C]">系列代码</label>
              {editId ? (
                <input
                  type="text"
                  value={form.code}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-[#F4F7F4] border border-[#E0ECE0] rounded-xl text-sm text-[#1A2E1A] outline-none"
                />
              ) : (
                <select
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value as SeriesCode })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E0ECE0] rounded-xl text-sm text-[#1A2E1A] outline-none focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 transition-all"
                >
                  <option value="">选择系列代码...</option>
                  {SERIES_CODE_OPTIONS.filter(opt => !series.find(s => s.code === opt.value && s.id !== editId)).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              )}
            </div>

            {/* 中文名称 */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5C725C]">中文名称</label>
              <input
                type="text"
                value={form.name_cn}
                onChange={e => setForm({ ...form, name_cn: e.target.value })}
                placeholder="如：元"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E0ECE0] rounded-xl text-sm text-[#1A2E1A] placeholder:text-[#A8BAA8] outline-none focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 transition-all"
              />
            </div>

            {/* 英文名称 */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5C725C]">英文名称</label>
              <input
                type="text"
                value={form.name_en}
                onChange={e => setForm({ ...form, name_en: e.target.value })}
                placeholder="如：Yuan"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E0ECE0] rounded-xl text-sm text-[#1A2E1A] placeholder:text-[#A8BAA8] outline-none focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 transition-all"
              />
            </div>

            {/* 描述 */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-[#5C725C]">描述</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="系列描述..."
                rows={2}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E0ECE0] rounded-xl text-sm text-[#1A2E1A] placeholder:text-[#A8BAA8] outline-none focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 transition-all resize-none"
              />
            </div>

            {/* 颜色 */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5C725C]">主题色</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.color || '#4A7C59'}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                  className="w-10 h-10 rounded-lg border border-[#E0ECE0] cursor-pointer"
                />
                <input
                  type="text"
                  value={form.color || ''}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                  placeholder="#4A7C59"
                  className="flex-1 px-3.5 py-2.5 bg-white border border-[#E0ECE0] rounded-xl text-sm text-[#1A2E1A] placeholder:text-[#A8BAA8] outline-none focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 transition-all"
                />
              </div>
            </div>

            {/* 排序 */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5C725C]">排序</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                min={0}
                max={99}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E0ECE0] rounded-xl text-sm text-[#1A2E1A] outline-none focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 transition-all"
              />
            </div>

            {/* 上下架 */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className={`w-10 h-6 rounded-full flex items-center transition-colors ${
                    form.is_active ? 'bg-[#4A7C59] justify-end' : 'bg-[#D5E2D5] justify-start'
                  } p-0.5`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </button>
                <span className="text-xs text-[#5C725C]">{form.is_active ? '上架' : '下架'}</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-[#E0ECE0]">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-xl border border-[#E0ECE0] text-sm text-[#5C725C] hover:bg-[#F4F7F4] transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[#4A7C59] hover:bg-[#3D6B4A] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
            >
              {saving ? <><Loader2 size={14} className="animate-spin" /> 保存中</> : <><Save size={14} /> 保存</>}
            </button>
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-[#4A7C59]" />
            <span className="text-sm text-[#9AAA9A]">加载系列数据...</span>
          </div>
        </div>
      )}

      {/* 系列列表 */}
      {!loading && (
        <div className="bg-white rounded-2xl border border-[#E0ECE0] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E0ECE0] bg-[#FAFCFA]">
                <th className="px-4 py-3 text-xs font-semibold text-[#5C725C] w-10">排序</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#5C725C]">标识</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#5C725C]">中文名</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#5C725C]">英文名</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#5C725C]">描述</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#5C725C]">主题色</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#5C725C]">状态</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#5C725C]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0ECE0]">
              {series.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-[#9AAA9A]">
                    <Layers size={32} className="mx-auto mb-3 opacity-30" />
                    暂无系列数据
                  </td>
                </tr>
              ) : (
                [...series]
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((s, i) => {
                    const canMoveUp = i > 0;
                    const canMoveDown = i < series.length - 1;
                    return (
                      <tr key={s.id} className="hover:bg-[#FAFCFA] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex flex-col items-center gap-0.5">
                            <button
                              onClick={() => moveSort(s, 'up')}
                              disabled={!canMoveUp}
                              className="p-0.5 text-[#9AAA9A] hover:text-[#4A7C59] disabled:opacity-20 transition-colors"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <span className="text-xs text-[#5C725C] font-mono">{s.sort_order}</span>
                            <button
                              onClick={() => moveSort(s, 'down')}
                              disabled={!canMoveDown}
                              className="p-0.5 text-[#9AAA9A] hover:text-[#4A7C59] disabled:opacity-20 transition-colors"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: s.color || '#4A7C59' }}
                            >
                              {s.code?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <span className="text-xs font-mono text-[#9AAA9A]">{s.code}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-[#1A2E1A]">{s.name_cn}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-[#5C725C]">{s.name_en}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-[#9AAA9A] line-clamp-1 max-w-[200px]">{s.description || '-'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-lg border border-[#E0ECE0]"
                              style={{ backgroundColor: s.color || '#4A7C59' }}
                            />
                            <span className="text-[10px] font-mono text-[#9AAA9A]">{s.color || '-'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleActive(s)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                              s.is_active
                                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                : 'bg-[#F4F7F4] text-[#9AAA9A] hover:bg-[#E0ECE0]'
                            }`}
                          >
                            {s.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                            {s.is_active ? '上架' : '下架'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Perm action="edit_dicts">
                              <button
                                onClick={() => openEdit(s)}
                                className="p-1.5 rounded-lg hover:bg-[#E8F3EC] text-[#5C725C] hover:text-[#4A7C59] transition-colors"
                                title="编辑"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(s)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-[#5C725C] hover:text-red-500 transition-colors"
                                title="删除"
                              >
                                <Trash2 size={14} />
                              </button>
                            </Perm>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 说明 */}
      <div className="bg-[#FAFCFA] rounded-xl border border-[#E0ECE0] px-5 py-4">
        <p className="text-xs text-[#9AAA9A] leading-relaxed">
          <strong className="text-[#5C725C]">💡 提示：</strong>
          系列是产品的顶级分类，目前固定 4 个（元·精油 / 恒·复方 / 生·纯露 / 境·香道）。
          排序影响前台展示顺序，下架后该系列不会在前台显示。修改系列代码会影响已关联产品的分类。
        </p>
      </div>
    </div>
  );
}
