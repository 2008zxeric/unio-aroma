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
  if (!url.includes('xuicjydgtoltdhkbqoju.supabase.co/storage/v1/object/public/reimbursements/')) {
    return res.status(403).send('Invalid URL');
  }

  try {
    const fileRes = await fetch(url);
    if (!fileRes.ok) {
      return res.status(fileRes.status).send('File not found');
    }

    const ext = url.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeTypes = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp',
      svg: 'image/svg+xml', pdf: 'application/pdf',
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    const buffer = Buffer.from(await fileRes.arrayBuffer());
    return res.status(200).send(buffer);
  } catch (err) {
    return res.status(500).send('Proxy error: ' + (err.message || String(err)));
  }
}
