/**
 * Calendly Configuration Utilities
 * Handles dynamic redirect URI based on current port
 */

/**
 * Get the current base URL for Calendly redirect
 * Works with any port (3000, 3001, 3002, etc.)
 */
export const getCalendlyRedirectUri = (): string => {
  if (typeof window !== 'undefined') {
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    return `${baseUrl}/auth/calendly/callback`;
  }
  
  // Fallback for server-side rendering
  return import.meta.env.VITE_CALENDLY_REDIRECT_URI || 'http://localhost:3000/auth/calendly/callback';
};

/**
 * Get Calendly configuration with dynamic redirect URI
 */
export const getCalendlyConfig = () => {
  return {
    clientId: import.meta.env.VITE_CALENDLY_CLIENT_ID,
    // Client/webhook secrets are server-only; never read them from VITE_* vars
    clientSecret: undefined as string | undefined,
    redirectUri: getCalendlyRedirectUri(),
    webhookSecret: undefined as string | undefined,
    apiBaseUrl: import.meta.env.VITE_CALENDLY_API_BASE_URL || 'https://api.calendly.com'
  };
};

/**
 * Detect Safari browser
 */
const isSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

/**
 * Generate Calendly OAuth URL with correct redirect URI
 * Includes Safari-specific fixes for caching and cross-origin issues
 */
export const generateCalendlyOAuthUrl = (): string => {
  const config = getCalendlyConfig();
  
  // Safari-specific fixes
  const safariTimestamp = isSafari() ? Date.now() : '';
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    // NOTE: Calendly does NOT use scope parameters - including them causes 400 errors
    // Add timestamp for Safari to prevent caching issues
    ...(safariTimestamp && { _t: safariTimestamp.toString() })
  });
  
  // Always use the correct OAuth endpoint
  const oauthUrl = `https://auth.calendly.com/oauth/authorize?${params.toString()}`;
  
  // Log for debugging Safari issues
  if (isSafari()) {
    console.log('🦎 Safari detected - Generated OAuth URL:', oauthUrl);
    console.log('🦎 Safari - Redirect URI:', config.redirectUri);
    console.log('🦎 Safari - Client ID:', config.clientId.substring(0, 10) + '...');
  }
  
  return oauthUrl;
}; 