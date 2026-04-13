import React, { useEffect, useState } from 'react';
import { ScrollText, Clock, User, Package, Globe, Image, Type, Star, Shield, Settings, RotateCcw } from 'lucide-react';
import { auditLogService } from '../../lib/auth';
import type { AuditLog } from '../../lib/database.types';

// 操作类型图标映射
const ACTION_ICONS: Record<string, React.ReactNode> = {
  login: <User size={16} />,
  logout: <User size={16} />,
  create: <Package size={16} />,
  update: <Type size={16} />,
  delete: <Shield size={16} />,
  toggle_status: <Settings size={16} />,
};

const ACTION_COLORS: Record<string, string> = {
  login: 'bg-green-100 text-green-600',
  logout: 'bg-gray-100 text-gray-500',
  create: 'bg-blue-100 text-blue-600',
  update: 'bg-amber-100 text-amber-600',
  delete: 'bg-red-100 text-red-600',
  toggle_status: 'bg-purple-100 text-purple-600',
};

const ACTION_LABELS: Record<string, string> = {
  login: '登录',
  logout: '退出',
  create: '创建',
  update: '更新',
  delete: '删除',
  toggle_status: '状态变更',
};

const TARGET_LABELS: Record<string, string> = {
  product: '产品',
  country: '国家',
  banner: '海报',
  system: '系统',
  site_text: '文字',
  home_recommend: '推荐',
  dict_item: '字典',
  admin_user: '用户',
  purchase_record: '进货',
  sales_record: '销售',
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await auditLogService.getAll(100);
      setLogs(data);
    } catch (err) {
      console.error('加载操作日志失败:', err);
    }
    setLoading(false);
  };

  useEffect(() => { loadLogs(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A2E1A]">操作日志</h2>
          <p className="text-sm text-[#6B856B] mt-1">记录所有后台操作，包括上下架、内容修改、登录等</p>
        </div>
        <button
          onClick={loadLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#F4F7F4] text-[#5C725C] rounded-xl text-sm font-medium hover:bg-[#E8F3EC] transition-colors disabled:opacity-50"
        >
          <RotateCcw size={14} className={loading ? 'animate-spin' : ''} />
          刷新
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#6B856B]">加载中...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20 text-[#8AA08A]">
          <ScrollText size={48} className="mx-auto mb-4 opacity-30" />
          <p>暂无操作日志</p>
        </div>
      ) : (
        <div className="rounded-xl bg-white border border-[#E0ECE0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E0ECE0] bg-[#F8FAF8]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#7A967A] uppercase tracking-wider">时间</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#7A967A] uppercase tracking-wider">操作人</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#7A967A] uppercase tracking-wider">操作</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#7A967A] uppercase tracking-wider">对象</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#7A967A] uppercase tracking-wider">详情</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => {
                  const userName = (log as any).admin_users?.display_name || (log as any).admin_users?.username || '未知';
                  const actionLabel = ACTION_LABELS[log.action] || log.action;
                  const targetLabel = TARGET_LABELS[log.target_type] || log.target_type;
                  const icon = ACTION_ICONS[log.action] || <Settings size={16} />;
                  const color = ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-500';

                  return (
                    <tr key={log.id} className="border-b border-[#E0ECE0]/30 hover:bg-[#F8FAF8]">
                      <td className="px-4 py-3 text-xs text-[#7A967A] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} />
                          {log.created_at ? new Date(log.created_at).toLocaleString('zh-CN') : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[#1A2E1A] font-medium">{userName}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${color}`}>
                          {icon}
                          {actionLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#5C725C]">{targetLabel}</td>
                      <td className="px-4 py-3 text-xs text-[#8AA08A] max-w-[200px] truncate">
                        {log.detail ? JSON.stringify(log.detail) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
