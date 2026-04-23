/**
 * UNIO AROMA 全局设计令牌 (Design Tokens)
 * 统一配色、排版、间距、圆角 — 所有页面必须使用这些常量
 *
 * 品牌基因：极简奢华 · 黑/金/白 · 充足留白
 * 参考：Aesop / Le Labo / Byredo
 */

// ===== 色彩系统 =====
export const colors = {
  // 主色调
  brand: {
    red: '#D75437',       // 朱砂红 — CTA、强调、情感
    gold: '#D4AF37',      // 香槟金 — 装饰、点缀、品质感
    blue: '#1C39BB',      // 深蓝 — Alice/专家线
    green: '#1A2E1A',     // 墨绿 — 自然/原力（替代原来的 #2C3E28）
  },
  
  // 中性色（以黑为基调，统一层次）
  neutral: {
    950: '#0A0A0A',       // 近纯黑
    900: '#1A1A1A',       // 主文字色
    800: '#2D2D2D',       // 次级文字
    600: '#5C5C5C',       // 辅助文字
    400: '#8A8A8A',       // 禁用/占位
    200: '#C4C4C4',       // 分割线
    100: '#E8E6E3',       // 浅边框
    50:  '#F5F3F0',       // 浅背景
    25:  '#FAFAF8',       // 极浅背景（section交替）
    0:   '#FFFFFF',        // 白底
  },
  
  // 语义色
  semantic: {
    success: '#2D7D5A',
    warning: '#C4841A',
    error: '#B33D3D',
    info: '#3D7DC4',
  },

  // 覆盖层
  overlay: {
    dark: 'rgba(26, 26, 26, 0.9)',
    medium: 'rgba(26, 26, 26, 0.6)',
    light: 'rgba(26, 26, 26, 0.3)',
    glass: 'rgba(255, 255, 255, 0.85)',
  },
} as const;

// ===== 排版 Type Scale =====
export const typography = {
  fontFamily: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans SC", sans-serif',
    serif: '"Georgia", "Times New Roman", "Noto Serif SC", serif',
    mono: '"SF Mono", "Fira Code", "Consolas", monospace',
  },
  
  // 字号阶梯（移动端 / 桌面端）
  size: {
    xs: { mobile: '10px', desktop: '11px' },      // 标注、meta
    sm: { mobile: '11px', desktop: '13px' },      // 小字、辅助
    base: { mobile: '14px', desktop: '16px' },    // 正文基准
    lg: { mobile: '16px', desktop: '20px' },      // 强调文字
    xl: { mobile: '20px', desktop: '28px' },      // 小标题
    '2xl': { mobile: '26px', desktop: '36px' },   // 区块标题
    '3xl': { mobile: '32px', desktop: '48px' },   // 页面标题
    '4xl': { mobile: '40px', desktop: '64px' },   // Hero副标
    '5xl': { mobile: '48px', desktop: '80px' },   // Hero主标移动端
    hero: { mobile: '9vw', desktop: '12rem' },    // Hero超大标题
  },
  
  // 字重
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // 字距（统一标准）
  tracking: {
    tight: '0.05em',
    normal: '0.1em',
    wide: '0.15em',
    wider: '0.2em',
    widest: '0.3em',     // 大标题用
    label: '0.4em',       // 按钮/标签
    labelMax: '0.5em',    // 英文大写标语
    display: '0.15em',    // 中文展示标题（微调）
  },

  // 行高
  leading: {
    none: '1',
    tight: '1.2',
    snug: '1.35',
    normal: '1.5',
    relaxed: '1.65',
    loose: '1.8',
    display: '1.1',       // 大标题专用
  },
} as const;

// ===== 间距系统（8pt 基准）=====
export const spacing = {
  0: '0',
  0.5: '2px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  40: '160px',
  48: '192px',
  56: '224px',
  64: '256px',

  // Section 垂直间距（移动端 / 桌面端）
  sectionY: { mobile: 'py-16', desktop: 'py-40' },
  sectionYLg: { mobile: 'py-20', desktop: 'py-56' },
  sectionYXl: { mobile: 'py-24', desktop: 'py-64' },
} as const;

// ===== 圆角系统 =====
export const radius = {
  none: '0',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
  full: '9999px',
  // 奢华级大圆角
  card: '1.5rem',          // 卡片 ~24px
  cardLg: '2.5rem',        // 大卡片 ~40px
  cardXl: '4rem',          // 超大卡片 ~64px
  cardHero: '5rem',        // Hero卡片 ~80px
} as const;

// ===== 阴影系统 =====
export const shadows = {
  sm: '0 1px 3px rgba(0, 0, 0, 0.04)',
  md: '0 4px 16px rgba(0, 0, 0, 0.06)',
  lg: '0 8px 30px rgba(0, 0, 0, 0.08)',
  xl: '0 16px 50px rgba(0, 0, 0, 0.10)',
  '2xl': '0 24px 60px rgba(0, 0, 0, 0.12)',
  glow: '0 0 40px rgba(212, 175, 55, 0.08)',
  glowRed: '0 0 40px rgba(215, 84, 55, 0.06)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.03)',
  // 奢华深阴影
  luxury: '0 40px 80px -20px rgba(0, 0, 0, 0.25)',
  luxuryHover: '0 50px 100px -20px rgba(0, 0, 0, 0.30)',
} as const;

// ===== 动画时长 =====
export const duration = {
  fast: '150ms',
  normal: '300ms',
  mid: '500ms',
  slow: '700ms',
  slower: '1000ms',
  slowest: '2000ms',
  pageTransition: '400ms',
} as const;

// ===== 断点别名（与 Tailwind 对齐）=====
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ===== z-index 层级 =====
export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  nav: 500,
  overlay: 800,
  quickMenu: 998,
  bottomNav: 999,
  splash: 1000,
  modal: 2000,
  tooltip: 3000,
} as const;

// ===== Tailwind 便捷映射 =====
// 用于 className 中需要硬编码颜色值的地方
export const twColors = {
  textPrimary: 'text-[#1A1A1A]',
  textSecondary: 'text-black/60',
  textTertiary: 'text-black/40',
  textMuted: 'text-black/25',
  textInverted: 'text-white',
  textGold: 'text-[#D4AF37]',
  textBrand: 'text-[#D75437]',
  
  bgPrimary: 'bg-white',
  bgSecondary: 'bg-[#FAFAF8]',
  bgTertiary: 'bg-[#F5F3F0]',
  bgDark: 'bg-[#1A1A1A]',
  bgDarkLighter: 'bg-[#2D2D2D]',
  
  borderLight: 'border-black/[0.05]',
  borderMedium: 'border-black/[0.08]',
  borderGold: 'border-[#D4AF37]/20',
  borderBrand: 'border-[#D75437]/20',
  
  selection: 'selection:bg-[#D75437] selection:text-white',
} as const;
