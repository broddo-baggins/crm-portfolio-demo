/**
 * Environment Configuration
 * Centralized environment variable management with secure fallback values
 */

// Secure fallback configuration (no hardcoded keys for security)
const fallbackConfig = {
  supabase: {
    url: "https://ajszzemkpenbfnghqiyz.supabase.co",
    // Keys loaded from environment variables only - no hardcoded values for security
  },
};

// Environment variable getters with secure configuration
export const env = {
  // Supabase Configuration (client-side only)
  SUPABASE_URL:
    import.meta.env.VITE_SUPABASE_URL || fallbackConfig.supabase.url,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  // Note: Service role key intentionally NOT exposed to client-side for security

  // App Configuration - Dynamic URL based on environment
  get APP_URL() {
    return (
      import.meta.env.VITE_APP_URL ||
      (import.meta.env.PROD ? "https://crm-portfolio-demo.vercel.app" : "http://127.0.0.1:3000")
    );
  },
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || "development",
  ENABLE_FALLBACK_LOGIN: import.meta.env.VITE_ENABLE_FALLBACK_LOGIN || "true",
  ALLOW_REGISTRATION: import.meta.env.VITE_ALLOW_REGISTRATION || "true",

  // WhatsApp Business API Configuration - Production Ready
  // Secrets (access token, app/webhook secrets, OAuth client secrets, AI keys) are
  // deliberately NOT read from VITE_* vars: Vite inlines those into the public bundle.
  // They live server-side only (process.env in /api functions).
  WHATSAPP_ACCESS_TOKEN: "",
  WHATSAPP_PHONE_NUMBER_ID: import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || "",
  WHATSAPP_BUSINESS_ID: import.meta.env.VITE_WHATSAPP_BUSINESS_ID || "",
  WHATSAPP_BUSINESS_ACCOUNT_ID: import.meta.env.VITE_WHATSAPP_BUSINESS_ACCOUNT_ID || "",
  WHATSAPP_APP_ID: import.meta.env.VITE_WHATSAPP_APP_ID || "",
  WHATSAPP_APP_SECRET: "",
  WHATSAPP_WEBHOOK_VERIFY_TOKEN:
    import.meta.env.VITE_WHATSAPP_WEBHOOK_VERIFY_TOKEN ||
    "crm-demo-secure-webhook-2024",
  WHATSAPP_WEBHOOK_SECRET: "",
  WHATSAPP_WEBHOOK_URL: import.meta.env.VITE_WHATSAPP_WEBHOOK_URL || "",
  
  // Meta App Configuration - Required for app review
  META_APP_ID: import.meta.env.VITE_META_APP_ID || import.meta.env.VITE_WHATSAPP_APP_ID || "",
  META_BUSINESS_ID: import.meta.env.VITE_META_BUSINESS_ID || import.meta.env.VITE_WHATSAPP_BUSINESS_ID || "",

  // Calendly OAuth Configuration
  CALENDLY_CLIENT_ID: import.meta.env.VITE_CALENDLY_CLIENT_ID || "",
  CALENDLY_CLIENT_SECRET: "",
  CALENDLY_REDIRECT_URI:
    import.meta.env.VITE_CALENDLY_REDIRECT_URI ||
    (import.meta.env.PROD
      ? "https://crm-portfolio-demo.vercel.app/auth/calendly/callback"
      : "http://localhost:3000/auth/calendly/callback"),

  // Google OAuth Configuration
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: "",
  GOOGLE_REDIRECT_URI:
    import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
    (import.meta.env.PROD
      ? "https://crm-portfolio-demo.vercel.app/auth/google/callback"
      : "http://localhost:3000/auth/google/callback"),

  // AI Configuration: keys live in the /api/ai-assistant function (GOOGLE_GENERATIVE_AI_API_KEY, GROQ_API_KEY)
  GEMINI_API_KEY: "",
  GROQ_API_KEY: "",

  // Development flags
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,

  // Validation
  get isConfigured() {
    return !!(this.SUPABASE_URL && this.SUPABASE_ANON_KEY);
  },

  get isWhatsAppConfigured() {
    return !!(
      this.WHATSAPP_ACCESS_TOKEN &&
      this.WHATSAPP_PHONE_NUMBER_ID &&
      this.WHATSAPP_WEBHOOK_VERIFY_TOKEN
    );
  },

  get isWhatsAppFullyConfigured() {
    return !!(
      this.WHATSAPP_ACCESS_TOKEN &&
      this.WHATSAPP_PHONE_NUMBER_ID &&
      this.WHATSAPP_BUSINESS_ID &&
      this.WHATSAPP_BUSINESS_ACCOUNT_ID &&
      this.WHATSAPP_APP_ID &&
      this.WHATSAPP_APP_SECRET &&
      this.WHATSAPP_WEBHOOK_URL &&
      this.WHATSAPP_WEBHOOK_SECRET
    );
  },

  get isMetaConfigured() {
    return !!(this.META_APP_ID && this.META_BUSINESS_ID);
  },

  get isCalendlyConfigured() {
    return !!(this.CALENDLY_CLIENT_ID && this.CALENDLY_REDIRECT_URI);
  },

  get isGeminiConfigured() {
    return !!this.GEMINI_API_KEY;
  },

  get isGroqConfigured() {
    return !!this.GROQ_API_KEY;
  },

  // Debug info (without service role references)
  get debugInfo() {
    return {
      hasSupabaseUrl: !!this.SUPABASE_URL,
      hasAnonKey: !!this.SUPABASE_ANON_KEY,
      hasServiceRole: false, // Always false for client-side security
      environment: this.ENVIRONMENT,
      isConfigured: this.isConfigured,
      isSecure: true, // Always true now that service role is removed
      source: import.meta.env.VITE_SUPABASE_URL ? "environment" : "config",
      appUrl: this.APP_URL,
      // WhatsApp configuration status
      whatsapp: {
        hasAccessToken: !!this.WHATSAPP_ACCESS_TOKEN,
        hasPhoneNumberId: !!this.WHATSAPP_PHONE_NUMBER_ID,
        hasBusinessId: !!this.WHATSAPP_BUSINESS_ID,
        hasBusinessAccountId: !!this.WHATSAPP_BUSINESS_ACCOUNT_ID,
        hasAppId: !!this.WHATSAPP_APP_ID,
        hasAppSecret: !!this.WHATSAPP_APP_SECRET,
        hasWebhookToken: !!this.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
        hasWebhookSecret: !!this.WHATSAPP_WEBHOOK_SECRET,
        hasWebhookUrl: !!this.WHATSAPP_WEBHOOK_URL,
        isConfigured: this.isWhatsAppConfigured,
        isFullyConfigured: this.isWhatsAppFullyConfigured,
      },
      // Meta configuration status
      meta: {
        hasAppId: !!this.META_APP_ID,
        hasBusinessId: !!this.META_BUSINESS_ID,
        isConfigured: this.isMetaConfigured,
      },
      // Calendly configuration status
      calendly: {
        hasClientId: !!this.CALENDLY_CLIENT_ID,
        hasClientSecret: !!this.CALENDLY_CLIENT_SECRET,
        hasRedirectUri: !!this.CALENDLY_REDIRECT_URI,
        redirectUri: this.CALENDLY_REDIRECT_URI,
        isConfigured: this.isCalendlyConfigured,
      },
      // AI configuration status
      ai: {
        hasGeminiKey: !!this.GEMINI_API_KEY,
        hasGroqKey: !!this.GROQ_API_KEY,
        isGeminiConfigured: this.isGeminiConfigured,
        isGroqConfigured: this.isGroqConfigured,
      },
    };
  },
};

// Enhanced logging and validation - only show critical warnings
if (env.IS_DEV) {
  // Only show critical configuration warnings
  if (!env.isConfigured) {
    console.warn(
      "WARNING Environment not properly configured - please set VITE_SUPABASE_ANON_KEY",
    );
  }
  
  // Remove unnecessary success messages in production/user-facing pages
  // Keep only for actual debugging when needed
}

export default env;
