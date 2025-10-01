// /api/proxy.js - Vercel Serverless Function
export default async function handler(req, res) {
  // CORS headers (adjust origin if needed)
  res.setHeader('Access-Control-Allow-Origin', 'https://app.presibo.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action } = req.query; // e.g., ?action=verify_password
  if (!action) {
    res.status(400).json({ error: 'Missing action' });
    return;
  }

  const internalUrl = `https://api.presibo.com/users/index.php?action=${encodeURIComponent(action)}`;
  const body = req.method === 'POST' ? JSON.stringify(req.body) : undefined;

  try {
    const response = await fetch(internalUrl, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: body
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy failed: ' + error.message });
  }
}
