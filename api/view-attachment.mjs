// Vercel Serverless Function — 附件预览代理（强制浏览器图片预览而非下载）
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Vercel Node runtime 中 req.query 不可靠，用原生 URL 解析
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const url = parsedUrl.searchParams.get('url');
  if (!url) {
    return res.status(400).send('Missing url parameter');
  }

  // 安全检查：只允许 supabase storage 的 URL
  if (!url.includes('supabase.co/storage/v1/object/public/')) {
    return res.status(403).send('Invalid URL');
  }

  try {
    // 跟随重定向（Supabase 某些附件 URL 会 302 跳转）
    const fileRes = await fetch(url, { redirect: 'follow' });
    if (!fileRes.ok) {
      return res.status(fileRes.status).send('File not found');
    }

    // 从最终 URL 或原始 URL 推断扩展名
    const finalUrl = fileRes.url || url;
    const ext = finalUrl.split('?')[0].split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp',
      svg: 'image/svg+xml', pdf: 'application/pdf',
      heic: 'image/heic', heif: 'image/heif',
    };
    let contentType = mimeTypes[ext] || fileRes.headers.get('content-type') || 'application/octet-stream';
    // 浏览器无法内联展示非图片/PDF → 让前端 onError 处理
    const isViewable = contentType.startsWith('image/') || contentType === 'application/pdf';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    const buffer = Buffer.from(await fileRes.arrayBuffer());
    return res.status(200).send(buffer);
  } catch (err) {
    return res.status(500).send('Proxy error: ' + (err.message || String(err)));
  }
}
