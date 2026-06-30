// Vercel Serverless Function — 附件预览代理（强制浏览器图片预览而非下载）
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Vercel Node runtime 中 req.query 不可靠，用原生 URL 解析
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const rawUrl = parsedUrl.searchParams.get('url');
  if (!rawUrl) {
    return res.status(400).send('Missing url parameter');
  }

  // 递归提取真实 Supabase URL：数据库里可能存了旧版嵌套代理地址
  // 例如 https://unio-api-fix.vercel.app/api/view-attachment.mjs?url=https://supabase.co/...
  let finalUrl = rawUrl;
  let maxDepth = 5;
  while (maxDepth-- > 0) {
    // 检查路径部分（不含查询参数）是否已是 Supabase 直链
    try {
      const parsed = new URL(finalUrl);
      if (parsed.hostname.includes('supabase.co') && parsed.pathname.includes('/storage/v1/object/public/')) break;
    } catch { break; }
    // 尝试提取内层 url 参数
    try {
      const nested = new URL(finalUrl);
      const innerUrl = nested.searchParams.get('url');
      if (innerUrl) {
        finalUrl = innerUrl;
      } else {
        break;
      }
    } catch {
      break;
    }
  }

  // 如果是相对路径（不以 http 开头），自动补全 Supabase URL
  const SUPABASE_PUBLIC = 'https://xuicjydgtoltdhkbqoju.supabase.co/storage/v1/object/public/';
  if (!finalUrl.startsWith('http')) {
    const cleanPath = finalUrl.replace(/^\/+/, '');
    finalUrl = SUPABASE_PUBLIC + cleanPath;
  }

  // 安全检查：只允许 supabase storage 的 URL
  if (!finalUrl.includes('supabase.co/storage/v1/object/public/')) {
    return res.status(403).send('Invalid URL');
  }

  try {
    // 跟随重定向（Supabase 某些附件 URL 会 302 跳转）
    const fileRes = await fetch(finalUrl, { redirect: 'follow' });
    if (!fileRes.ok) {
      return res.status(fileRes.status).send('File not found');
    }

    // 从最终 URL 推断扩展名
    const resolvedUrl = fileRes.url || finalUrl;
    const ext = resolvedUrl.split('?')[0].split('.').pop()?.toLowerCase() || '';
    const mimeTypes = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp',
      svg: 'image/svg+xml', pdf: 'application/pdf',
      heic: 'image/heic', heif: 'image/heif',
    };
    const contentType = mimeTypes[ext] || fileRes.headers.get('content-type') || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    const buffer = Buffer.from(await fileRes.arrayBuffer());
    return res.status(200).send(buffer);
  } catch (err) {
    return res.status(500).send('Proxy error: ' + (err.message || String(err)));
  }
}
