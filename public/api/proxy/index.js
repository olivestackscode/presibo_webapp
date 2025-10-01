// /api/proxy.js - Vercel Serverless Function with manual body parsing
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://app.presibo.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action } = req.query;
  if (!action) {
    res.status(400).json({ error: 'Missing action' });
    return;
  }

  // Manually parse body for POST (required for plain Vercel functions)
  let rawBody = '';
  if (req.method === 'POST') {
    rawBody = await new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', () => resolve(body));
      req.on('error', reject);
    });
    console.log('Parsed raw body length:', rawBody.length); // Debug log
  }

  const internalUrl = `https://api.presibo.com/users/index.php?action=${encodeURIComponent(action)}`;

  console.log(`Forwarding ${req.method} to ${internalUrl} (body length: ${rawBody.length})`); // Debug log

  try {
    const response = await fetch(internalUrl, {
      method: req.method,
      headers: { 
        'Content-Type': 'application/json',
        ...(rawBody && { 'Content-Length': Buffer.byteLength(rawBody) })
      },
      body: rawBody || undefined
    });

    const data = await response.text(); // Get as text first for safety
    console.log(`Internal response status: ${response.status}, body preview: ${data.substring(0, 200)}...`); // Debug log

    res.status(response.status);
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (error) {
    console.error('Proxy fetch error:', error); // Logs to Vercel
    res.status(500).json({ error: 'Proxy failed: ' + error.message });
  }
}
