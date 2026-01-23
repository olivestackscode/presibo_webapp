// /api/config/index.js - Vercel Serverless Function to serve frontend configuration
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Return configuration with environment variables
    const config = {
      // API Base URLs - using environment variables with fallbacks
      API_BASE_URL: process.env.API_BASE_URL || 'https://api.presibo.com',
      API_USERS_URL: process.env.API_USERS_URL || 'https://api.presibo.com/users/index.php',
      API_DB_URL: process.env.API_DB_URL || 'https://api.presibo.com/db/index.php',
      API_POST_URL: process.env.API_POST_URL || 'https://api.presibo.com/post/index.php',
      API_EMAIL_URL: process.env.API_EMAIL_URL || 'https://api.presibo.com/email/index.php',
      API_RESET_TOKEN_URL: process.env.API_RESET_TOKEN_URL || 'https://api.presibo.com/tokens/reset-token.php',
      API_AI_URL: process.env.API_AI_URL || 'https://api.presibo.com/ai/open.php',
      API_DOCTORS_URL: process.env.API_DOCTORS_URL || 'https://api.presibo.com/doctors/index.php',
      
      // Internal API Routes
      API_WALLET_TOPUP_URL: process.env.API_WALLET_TOPUP_URL || '/api/wallet/top-up',
      API_AUTH_LOGOUT_URL: process.env.API_AUTH_LOGOUT_URL || '/api/auth/logout',
      API_VERIFY_PASSWORD_URL: process.env.API_VERIFY_PASSWORD_URL || '/api?action=verify_password',
      API_LOGOUT_URL: process.env.API_LOGOUT_URL || '/api?action=logout',
      
      // Payment Keys - only exposing public keys (safe to expose to frontend)
      PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY || 'pk_live_e4512c48de3fef4f92b4b278715d5decfa436d5b',
      
      // Security Settings
      NODE_ENV: process.env.NODE_ENV || 'production'
    };

    res.status(200).json(config);
  } catch (error) {
    console.error('Config API error:', error);
    res.status(500).json({ error: 'Failed to load configuration' });
  }
}