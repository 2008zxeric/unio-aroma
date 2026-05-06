// Vercel Serverless Function — DeepSeek API proxy via Alibaba
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, products } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages required' });
  }

  try {
    const proxyResp = await fetch('https://oracle.unioaroma.com/api/oracle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, products }),
      signal: AbortSignal.timeout(60000),
    });

    if (!proxyResp.ok) {
      const errText = await proxyResp.text().catch(() => 'unknown');
      return res.status(proxyResp.status).json({ error: errText });
    }

    const data = await proxyResp.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Oracle proxy error:', err);
    return res.status(500).json({ 
      error: err.message || 'Proxy failed',
      reply: '祭司的灵脉暂时中断，请稍后再试。'
    });
  }
}
