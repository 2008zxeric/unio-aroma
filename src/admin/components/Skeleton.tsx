// 骨架屏组件 — 通用加载占位
import React from 'react';

// 基础骨架块
export const SkBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-[#E8EDE8] rounded ${className}`} />
);

// 表格骨架行
export const SkTable: React.FC<{ cols: number; rows?: number }> = ({ cols, rows = 5 }) => (
  <div className="space-y-2 p-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-3">
        {Array.from({ length: cols }).map((_, j) => (
          <SkBlock
            key={j}
            className={j === 0 ? 'h-4 w-8' : j === cols - 1 ? 'h-4 flex-1' : 'h-4 flex-[2]'}
          />
        ))}
      </div>
    ))}
  </div>
);

// 仪表盘卡片骨架
export const SkCards: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className={`grid gap-4`}
    style={{ gridTemplateColumns: `repeat(${Math.min(count, 4)}, minmax(0, 1fr))` }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl border border-[#E0ECE0] p-5 space-y-3">
        <SkBlock className="h-3 w-20" />
        <SkBlock className="h-8 w-28" />
        <SkBlock className="h-2 w-16" />
      </div>
    ))}
  </div>
);

// 表单骨架
export const SkForm: React.FC<{ fields?: number }> = ({ fields = 4 }) => (
  <div className="space-y-4 p-5 bg-white rounded-xl border border-[#E0ECE0]">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-1.5">
        <SkBlock className="h-3 w-16" />
        <SkBlock className="h-9 w-full" />
      </div>
    ))}
    <div className="flex justify-end gap-3 pt-2">
      <SkBlock className="h-9 w-20" />
      <SkBlock className="h-9 w-24" />
    </div>
  </div>
);

// 页面级加载骨架（带标题）
export const PageSkeleton: React.FC<{ type?: 'cards' | 'table' | 'form' | 'detail' }> = ({ type = 'table' }) => (
  <div className="space-y-6 p-6">
    {/* 标题骨架 */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <SkBlock className="h-6 w-40" />
        <SkBlock className="h-3 w-64" />
      </div>
      <SkBlock className="h-9 w-28" />
    </div>
    {/* 内容骨架 */}
    {type === 'cards' && <SkCards />}
    {type === 'table' && (
      <div className="bg-white rounded-xl border border-[#E0ECE0] overflow-hidden">
        <SkTable cols={6} />
      </div>
    )}
    {type === 'form' && <SkForm />}
    {type === 'detail' && (
      <div className="bg-white rounded-xl border border-[#E0ECE0] p-6 space-y-4">
        <SkBlock className="h-5 w-48" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <SkBlock className="h-3 w-16" />
              <SkBlock className="h-5 w-full" />
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// 列表项骨架
export const SkList: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="space-y-1">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-4 py-3">
        <SkBlock className="h-5 w-5 rounded-full shrink-0" />
        <SkBlock className="h-4 flex-1" />
        <SkBlock className="h-4 w-16" />
      </div>
    ))}
  </div>
);
