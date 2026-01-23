/**
 * Centralized Configuration File
 * Fetches configuration from server-side API endpoint
 */

// Global CONFIG object with default values
let CONFIG = {
  API_BASE_URL: 'https://api.presibo.com',
  API_USERS_URL: 'https://api.presibo.com/users/index.php',
  API_DB_URL: 'https://api.presibo.com/db/index.php',
  API_POST_URL: 'https://api.presibo.com/post/index.php',
  API_EMAIL_URL: 'https://api.presibo.com/email/index.php',
  API_RESET_TOKEN_URL: 'https://api.presibo.com/tokens/reset-token.php',
  API_AI_URL: 'https://api.presibo.com/ai/openrouter.php',
  API_DOCTORS_URL: 'https://api.presibo.com/doctors/index.php',
  
  API_WALLET_TOPUP_URL: '/api/wallet/top-up',
  API_AUTH_LOGOUT_URL: '/api/auth/logout',
  API_VERIFY_PASSWORD_URL: '/api?action=verify_password',
  API_LOGOUT_URL: '/api?action=logout',
  
  PAYSTACK_PUBLIC_KEY: 'pk_live_e4512c48de3fef4f92b4b278715d5decfa436d5b',
  
  NODE_ENV: 'production'
};

// Asynchronously load configuration from server
async function loadConfig() {
  try {
    const response = await fetch('/api/config');
    if (!response.ok) {
      throw new Error(`Failed to load configuration: ${response.status}`);
    }
    CONFIG = await response.json();
    
    // Make CONFIG globally available
    window.CONFIG = CONFIG;
    
    console.log('Configuration loaded successfully from server');
  } catch (error) {
    console.error('Failed to load configuration from server:', error);
    
    // Fallback to default values
    CONFIG = {
      API_BASE_URL: 'https://api.presibo.com',
      API_USERS_URL: 'https://api.presibo.com/users/index.php',
      API_DB_URL: 'https://api.presibo.com/db/index.php',
      API_POST_URL: 'https://api.presibo.com/post/index.php',
      API_EMAIL_URL: 'https://api.presibo.com/email/index.php',
      API_RESET_TOKEN_URL: 'https://api.presibo.com/tokens/reset-token.php',
      API_AI_URL: 'https://api.presibo.com/ai/openrouter.php',
      API_DOCTORS_URL: 'https://api.presibo.com/doctors/index.php',
      
      API_WALLET_TOPUP_URL: '/api/wallet/top-up',
      API_AUTH_LOGOUT_URL: '/api/auth/logout',
      API_VERIFY_PASSWORD_URL: '/api?action=verify_password',
      API_LOGOUT_URL: '/api?action=logout',
      
      PAYSTACK_PUBLIC_KEY: 'pk_live_e4512c48de3fef4f92b4b278715d5decfa436d5b',
      
      NODE_ENV: 'production'
    };
    
    // Make fallback CONFIG globally available
    window.CONFIG = CONFIG;
    console.warn('Using fallback configuration');
  }
}

// Utility function to get API URL with parameters
function getApiUrl(endpoint, params = {}) {
  const baseUrl = CONFIG[endpoint];
  if (!baseUrl) {
    console.error(`API endpoint ${endpoint} not found in config`);
    return null;
  }
  
  // Handle query parameters
  if (Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${queryString}`;
  }
  
  return baseUrl;
}

// Make utility function globally available
window.getApiUrl = getApiUrl;

// Load configuration when script loads
loadConfig();