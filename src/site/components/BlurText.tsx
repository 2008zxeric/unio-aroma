import { useEffect, useRef, useState } from 'react';

/**
 * BlurText — 逐字模糊上升动画
 * 灵感来源：Liquid Glass Agency (xuanxuan-prompts)
 * 每个字符从模糊底部升起，逐个 stagger 延迟触发
 */
interface BlurTextProps {
  text: string;
  className?: string;
  /** 每字延迟（ms），默认 50 */
  staggerMs?: number;
  /** 初始模糊半径，默认 10px */
  blurAmount?: number;
  /** 初始上移距离，默认 40px */
  translateY?: number;
  /** 动画持续时间（ms），默认 700 */
  durationMs?: number;
  /** IntersectionObserver 触发阈值，默认 0.1 */
  threshold?: number;
  /** 是否启用（关掉可用于 A/B 测试），默认 true */
  enabled?: boolean;
}

export default function BlurText({
  text,
  className = '',
  staggerMs = 50,
  blurAmount = 10,
  translateY = 40,
  durationMs = 700,
  threshold = 0.1,
  enabled = true,
}: BlurTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setVisible(true);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered.current) {
          hasTriggered.current = true;
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, threshold]);

  const chars = Array.from(text);

  return (
    <span ref={containerRef} className={className} style={{ display: 'inline' }}>
      {chars.map((char, i) => (
        <span
          key={i}
          className="blur-char"
          style={{
            display: 'inline-block',
            opacity: visible ? 1 : 0,
            filter: visible ? 'blur(0px)' : `blur(${blurAmount}px)`,
            transform: visible ? 'translateY(0)' : `translateY(${translateY}px)`,
            transition: `filter ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1)`,
            transitionDelay: `${i * staggerMs}ms`,
            // 空格保留宽度
            minWidth: char === ' ' ? '0.25em' : undefined,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}
