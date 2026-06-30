// Vercel Serverless Function — 附件上传（service_role 绕过 RLS）
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const SUPABASE_URL = 'https://xuicjydgtoltdhkbqoju.supabase.co';
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SERVICE_KEY) {
    return res.status(500).json({ error: 'Server config error: missing service key' });
  }

  const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
  };

  // DELETE attachment
  if (req.method === 'DELETE') {
    const { table, id } = req.body || {};
    if (!table || !id) return res.status(400).json({ error: 'table and id required' });

    const patchRes = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ attachment_url: null }),
      }
    );
    if (!patchRes.ok) {
      const err = await patchRes.text().catch(() => 'unknown');
      return res.status(patchRes.status).json({ error: err });
    }
    return res.json({ success: true });
  }

  // POST upload（支持两种模式）
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { table, id, url, fileName, fileData } = req.body || {};

  // 新模式：客户端已上传存储，只需更新数据库（URL 模式）
  if (url && table && id) {
    const patchRes = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ attachment_url: url }),
      }
    );
    if (!patchRes.ok) {
      const err = await patchRes.text().catch(() => 'unknown');
      return res.status(patchRes.status).json({ error: `DB update failed: ${err}` });
    }
    return res.json({ success: true, url });
  }

  // 旧模式兼容：代理中转上传（base64 文件数据）
  if (!table || !id || !fileData) {
    return res.status(400).json({ error: 'table, id required; provide url (new) or fileData (legacy)' });
  }

  try {
    const ext = (fileName || 'file.jpg').split('.').pop()?.toLowerCase() || 'jpg';
    const path = `reimbursements/${table}/${id}_${Date.now()}.${ext}`;

    // Decode base64 file data
    const buf = Buffer.from(fileData, 'base64');

    // Upload to storage
    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/reimbursements/${path}`,
      {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/octet-stream',
          'Cache-Control': '3600',
        },
        body: buf,
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text().catch(() => 'unknown');
      return res.status(uploadRes.status).json({ error: `Storage upload failed: ${errText}` });
    }

    // Get public URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/reimbursements/${path}`;

    // PATCH database
    const patchRes = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ attachment_url: publicUrl }),
      }
    );

    if (!patchRes.ok) {
      const errText = await patchRes.text().catch(() => 'unknown');
      return res.status(patchRes.status).json({ error: `DB update failed: ${errText}` });
    }

    return res.json({ success: true, url: publicUrl });
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}
