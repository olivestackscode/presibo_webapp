// /api/proxy.js - Vercel Serverless Function for proxying requests
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
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

    // Handle body parsing if necessary (Vercel usually parses JSON automatically for handler(req, res))
    // But for safety, we can handle it or use req.body directly if it's already an object.
    let body = req.body;
    if (typeof body !== 'string' && body !== undefined) {
        body = JSON.stringify(body);
    }

    const internalUrl = `https://api.presibo.com/users/index.php?action=${encodeURIComponent(action)}`;

    try {
        const response = await fetch(internalUrl, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: req.method === 'POST' ? body : undefined
        });

        const data = await response.text();
        res.status(response.status);
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    } catch (error) {
        console.error('Proxy fetch error:', error);
        res.status(500).json({ error: 'Proxy failed: ' + error.message });
    }
}
