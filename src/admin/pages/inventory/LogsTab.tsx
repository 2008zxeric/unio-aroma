import React from 'react';
import { RotateCcw } from 'lucide-react';
import type { LogsTabProps } from './types';

const LogsTab: React.FC<LogsTabProps> = React.memo(({
  auditLogs,
  onRefresh,
}) => (
  <div className="space-y-4">
    <div className="admin-table-wrap rounded-xl bg-white border border-[#E0ECE0] overflow-x-auto">
      <p className="text-[10px] text-[#A8BAA8] px-4 pt-3">
        显示最近 {auditLogs.length} 条操作记录
        <button onClick={onRefresh} className="ml-3 text-[#4A7C59] hover:underline inline-flex items-center gap-1">
          <RotateCcw size={10} /> 刷新
        </button>
      </p>
      <table className="w-full text-sm min-w-[700px]">
        <thead><tr className="border-b border-[#D5E2D5]">
          <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A] w-40">时间</th>
          <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A] w-28">操作</th>
          <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A] w-24">经手人</th>
          <th className="text-left px-4 py-2.5 text-xs text-[#8AA08A]">详情</th>
        </tr></thead>
        <tbody>
          {auditLogs.map(log => {
            // 从 admin_users 关联信息获取用户名
            const userInfo = (log as any).admin_users as { username: string; display_name?: string } | null;
            const userName = userInfo?.display_name || userInfo?.username || log.user_id?.slice(0, 8) || '系统';
            let detail = '';
            try {
              const d = typeof log.detail === 'string' ? JSON.parse(log.detail) : log.detail;
              if (d) {
                const parts: string[] = [];
                if (d.username) parts.push(`用户名: ${d.username}`);
                if (d.product_id) parts.push(`产品ID: ${d.product_id.slice(0, 8)}...`);
                if (d.volume_ml) parts.push(`容量: ${d.volume_ml}ml`);
                if (d.unit_cost) parts.push(`单价: ¥${d.unit_cost}`);
                if (d.amount) parts.push(`金额: ¥${Number(d.amount).toFixed(2)}`);
                if (d.total_amount) parts.push(`金额: ¥${Number(d.total_amount).toFixed(2)}`);
                if (d.notes) parts.push(`备注: ${d.notes}`);
                detail = parts.join(' · ');
              }
            } catch {}
            return (
              <tr key={log.id} className="border-b border-[#D5E2D5]/[0.03] hover:bg-[#EEF4EF]">
                <td className="px-4 py-2 text-xs text-[#5C725C] whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    log.action.includes('删除') ? 'bg-red-50 text-red-500' :
                    log.action.includes('login') || log.action.includes('logout') ? 'bg-gray-50 text-gray-500' :
                    'bg-blue-50 text-blue-600'
                  }`}>{log.action}</span>
                </td>
                <td className="px-4 py-2 text-xs text-[#2D442D] font-medium">{userName}</td>
                <td className="px-4 py-2 text-xs text-[#6B856B] max-w-[300px] truncate">{detail || '-'}</td>
              </tr>
            );
          })}
          {auditLogs.length === 0 && <tr><td colSpan={4} className="px-4 py-12 text-center text-[#9AAA9A]">暂无操作日志</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
));

LogsTab.displayName = 'LogsTab';

export default LogsTab;
