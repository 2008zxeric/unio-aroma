/**
 * UNIO AROMA 图片优化工具
 * 
 * 核心策略：
 * 1. Supabase Storage 图片 → 使用 /storage/v1/render/image/public/ 路径 + width/quality 参数
 * 2. Unsplash 图片 → 降低 w 参数，添加 q=75
 * 3. 本地静态图片 → 不变（已压缩过）
 * 4. 所有图片加 loading="lazy" + decoding="async"
 */

const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';

/**
 * 将 Supabase Storage 直链转为图片转换 API URL
 * /storage/v1/object/public/ → /storage/v1/render/image/public/
 */
export function optimizeSupabaseImage(
  url: string | undefined | null,
  options?: { width?: number; height?: number; quality?: number }
): string | undefined {
  if (!url) return undefined;
  if (!url.includes('supabase.co/storage/v1/object/public/')) return url;

  const params = new URLSearchParams();
  if (options?.width) params.set('width', String(options.width));
  if (options?.height) params.set('height', String(options.height));
  if (options?.quality) params.set('quality', String(options.quality));

  const renderUrl = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  );

  return params.toString() ? `${renderUrl}?${params}` : renderUrl;
}

/**
 * 优化 Unsplash 图片 URL
 * - 降低 w 参数（默认 1200，原来很多 1920/2560）
 * - 添加 q=75 压缩
 */
export function optimizeUnsplashImage(
  url: string | undefined | null,
  maxWidth: number = 1200
): string | undefined {
  if (!url) return undefined;
  if (!url.includes('images.unsplash.com')) return url;

  try {
    const u = new URL(url);
    u.searchParams.set('w', String(maxWidth));
    u.searchParams.set('q', '75');
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * 通用图片优化：自动识别 URL 类型并应用对应优化
 */
export function optimizeImage(
  url: string | undefined | null,
  options?: { width?: number; height?: number; quality?: number }
): string | undefined {
  if (!url) return undefined;

  // Supabase Storage
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    return optimizeSupabaseImage(url, options);
  }

  // Unsplash
  if (url.includes('images.unsplash.com')) {
    return optimizeUnsplashImage(url, options?.width);
  }

  // 其他 URL 不做处理
  return url;
}

/**
 * 为产品列表缩略图优化的快捷方法
 * - width=300（3:4 卡片，手机上约 150px 宽，2x = 300）
 * - quality=75
 */
export function optimizeProductThumb(url: string | undefined | null): string | undefined {
  return optimizeImage(url, { width: 300, quality: 75 });
}

/**
 * 为产品详情页主图优化
 * - width=800
 * - quality=80
 */
export function optimizeProductFull(url: string | undefined | null): string | undefined {
  return optimizeImage(url, { width: 800, quality: 80 });
}

/**
 * 为国家/目的地封面图优化
 * - width=600
 * - quality=75
 */
export function optimizeCountryImage(url: string | undefined | null): string | undefined {
  return optimizeImage(url, { width: 600, quality: 75 });
}

/**
 * 为 Hero/Banner 大图优化
 * - width=1200
 * - quality=80
 */
export function optimizeHeroImage(url: string | undefined | null): string | undefined {
  return optimizeImage(url, { width: 1200, quality: 80 });
}
