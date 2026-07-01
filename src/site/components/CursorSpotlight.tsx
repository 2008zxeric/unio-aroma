/**
 * CursorSpotlight — 光标跟随探照灯
 *
 * 灵感：xuanxuan-prompts / Interactive Discovery
 * 效果：鼠标移动时，Hero 背景被「挖开」一个柔和光圈，
 * 透出底层的暗绿植物纹理 + 暖金色光影。
 *
 * 技法：CSS mask-image（顶层挖洞）+ opacity 过渡（底层 fade）
 * 性能：CSS 变量直写 DOM，mousemove 不触发 React 重渲染
 */
import { useRef, useEffect, useCallback, useState } from 'react';

interface Props {
  /** Hero 内容（img / div 等任意 React 节点） */
  children: React.ReactNode;
  /** 光圈半径（px），默认 240 */
  spotlightSize?: number;
  /** 底层纹理淡入/淡出过渡时长（ms），默认 800 */
  fadeDuration?: number;
}

export default function CursorSpotlight({
  children,
  spotlightSize = 240,
  fadeDuration = 800,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [textureVisible, setTextureVisible] = useState(false);

  // ===== mousemove：直写 CSS 变量（零 React 渲染）=====
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--cs-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--cs-y', `${e.clientY - rect.top}px`);

    // 显示纹理（防抖：避免频繁 setState）
    if (!textureVisible) {
      clearTimeout(fadeTimerRef.current);
      setTextureVisible(true);
    }
  }, [textureVisible]);

  // ===== mouseleave：延迟淡出（避免快速移出又移入的闪烁）=====
  const handleMouseLeave = useCallback(() => {
    fadeTimerRef.current = setTimeout(() => {
      setTextureVisible(false);
    }, 400);
  }, []);

  // ===== 清理 =====
  useEffect(() => {
    return () => clearTimeout(fadeTimerRef.current);
  }, []);

  return (
    <div
      ref={containerRef}
      className="cs-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── 底层：暗绿植物纹理（CSS 生成，零网络开销）── */}
      <div
        className="cs-texture"
        style={{
          opacity: textureVisible ? 1 : 0,
          transition: `opacity ${fadeDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        <div className="cs-texture__layers" />
      </div>

      {/* ── 顶层：Hero 内容 + mask 挖洞 ── */}
      <div
        className="cs-overlay"
        style={{
          // @ts-expect-error CSS 自定义属性
          '--cs-size': `${spotlightSize}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
