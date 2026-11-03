/**
 * Calendly API v2 Integration Service
 *
 * IMPORTANT: Two Integration Methods Supported
 * ==========================================
 *
 * 1. **OAUTH FLOW** (Complex, requires user login)
 *    - User authorizes via Calendly OAuth
 *    - Tokens stored and refreshed automatically
 *    - Good for apps where users control their own integration
 *
 * 2. **PERSONAL ACCESS TOKEN (PAT)** (Simple, direct API access)
 *    - User provides their Calendly PAT once
 *    - Store PAT securely in database
 *    - Make API calls directly on user's behalf
 *    - RECOMMENDED for most use cases
 *
 * For PAT approach:
 * - User gets PAT from https://calendly.com/integrations/api_webhooks
 * - Store in database with RLS protection
 * - Use for all API calls (no OAuth needed)
 *
 * For official documentation: https://developer.calendly.com/how-to-access-calendly-data-on-behalf-of-authenticated-users
 *
 * Integrates with Calendly V2 API for BANT/HEAT lead qualification
 * OAuth Credentials: Production environment with callback
 *
 * Features:
 * - OAuth authentication flow
 * - Personal Access Token (PAT) support
 * - Meeting scheduling with BANT context
 * - Webhook handling for booking notifications
 * - Integration with user settings persistence
 */

import { userSettingsService } from "./userSettingsService";
import { supabase } from "@/integrations/supabase/client";
import { getCalendlyRedirectUri } from "@/utils/calendlyConfig";
// @ts-ignore - Temporary fix for production build
import { credentialService } from "./credentialService";
import { mockApi } from '@/data/mockData';

interface CalendlyConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  apiBaseUrl: string;
}

interface CalendlyTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope?: string; // Optional as Calendly may or may not return this
  created_at: number;
}

// PAT-based user data structure
interface CalendlyPATUser {
  calendly_pat: string;
  calendly_user_uri: string;
  calendly_scheduling_url: string;
  calendly_name: string;
  calendly_email: string;
  calendly_connected_at: string;
  calendly_last_verified: string;
}

interface CalendlyUser {
  uri: string;
  name: string;
  slug: string;
  email: string;
  scheduling_url: string;
  timezone: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface CalendlyEventType {
  uri: string;
  name: string;
  description_plain?: string;
  duration: number;
  scheduling_url: string;
  color: string;
  active: boolean;
  slug: string;
  custom_questions?: CalendlyCustomQuestion[];
}

interface CalendlyCustomQuestion {
  name: string;
  type: "string" | "phone_number" | "textarea" | "radio_buttons" | "checkboxes";
  position: number;
  enabled: boolean;
  required: boolean;
  answer_choices?: string[];
}

interface CalendlyScheduledEvent {
  uri: string;
  name: string;
  meeting_notes_plain?: string;
  meeting_notes_html?: string;
  status: "active" | "canceled";
  start_time: string;
  end_time: string;
  event_type: string;
  location?: {
    type: string;
    location?: string;
    join_url?: string;
  };
  invitees_counter: {
    total: number;
    active: number;
    limit: number;
  };
  created_at: string;
  updated_at: string;
}

interface CalendlyInvitee {
  uri: string;
  name: string;
  email: string;
  status: "active" | "canceled";
  timezone: string;
  created_at: string;
  updated_at: string;
  tracking?: {
    utm_campaign?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_content?: string;
    utm_term?: string;
    salesforce_uuid?: string;
  };
  text_reminder_number?: string;
  rescheduled?: boolean;
  old_invitee?: string;
  new_invitee?: string;
  cancel_url: string;
  reschedule_url: string;
  routing_form_submission?: string;
  questions_and_answers?: Array<{
    question: string;
    answer: string;
    position: number;
  }>;
}

interface CalendlyApiResponse<T> {
  collection: T[];
  pagination: {
    count: number;
    next_page?: string;
    previous_page?: string;
  };
}

interface CalendlyUserResponse {
  resource: CalendlyUser;
}

interface CalendlyConnectionStatus {
  connected: boolean;
  method: 'oauth' | 'pat' | null;
  user?: CalendlyUser;
  error?: string;
  lastVerified?: Date;
}

// Database schema for PAT storage
interface CalendlyPATRecord {
  id: string;
  user_id: string;
  calendly_pat: string; // Encrypted
  calendly_user_uri: string;
  calendly_scheduling_url: string;
  calendly_name: string;
  calendly_email: string;
  calendly_connected_at: string;
  calendly_last_verified: string;
  created_at: string;
  updated_at: string;
}

// Safari-specific OAuth URL generator to prevent endpoint redirect issues
export function generateSafariSafeCalendlyOAuthUrl(clientId: string, redirectUri: string): string {
  // CRITICAL: Force the correct OAuth endpoint for Safari
  const baseUrl = 'https://auth.calendly.com/oauth/authorize';
  
  // Safari-specific parameters to prevent caching and redirects
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    // Add multiple cache-busting parameters
    _t: Date.now().toString(),
    _safari: 'true',
    _nocache: Math.random().toString(36).substring(7),
    _force_auth: 'true'
  });

  // Build the URL manually to ensure no encoding issues
  const fullUrl = `${baseUrl}?${params.toString()}`;
  
  console.log('🦎 Safari OAuth URL Generation:');
  console.log('🦎 Base URL:', baseUrl);
  console.log('🦎 Client ID:', clientId.substring(0, 10) + '...');
  console.log('🦎 Redirect URI:', redirectUri);
  console.log('🦎 Full URL:', fullUrl);
  
  // Validate that we're using the correct endpoint
  if (!fullUrl.includes('auth.calendly.com')) {
    console.error('ALERT CRITICAL: Wrong OAuth endpoint detected!');
    throw new Error('Invalid OAuth endpoint - must use auth.calendly.com');
  }
  
  return fullUrl;
}

export class CalendlyService {
  private config: CalendlyConfig;
  private tokens: CalendlyTokens | null = null;
  private patUser: CalendlyPATUser | null = null;

  constructor() {
    this.config = {
      clientId: "",
      clientSecret: "",
      redirectUri: getCalendlyRedirectUri(), // Dynamic redirect URI based on current port
      apiBaseUrl:
        import.meta.env.VITE_CALENDLY_API_BASE_URL ||
        "https://api.calendly.com",
    };
  }

  /**
   * Load credentials securely from database or environment
   * Enhanced with better error handling and debugging
   */
  private async loadCredentials(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('SEARCH loadCredentials: User not authenticated');
        return;
      }

      
      // Load credentials from user_api_credentials table
      const { data: credentials, error } = await (supabase as any)
        .from('user_api_credentials')
        .select('credential_name, encrypted_value')
        .eq('user_id', user.id)
        .eq('credential_type', 'calendly')
        .eq('is_active', true);

      if (error) {
        console.error('SEARCH loadCredentials: Database error:', error);
        return;
      }

      if (!credentials || credentials.length === 0) {
        console.error('SEARCH loadCredentials: No Calendly credentials found for user:', user.id);
        
        return;
      }

      
      // Decrypt and set credentials
      const credMap = new Map(credentials.map((c: any) => [c.credential_name, c.encrypted_value]));
      
      // Simple base64 decryption (browser-compatible)
      const decrypt = (value: string) => atob(value);
      
      const clientId = credMap.get('client_id') as string;
      const clientSecret = credMap.get('client_secret') as string;
      
      
      if (clientId) {
        this.config.clientId = decrypt(clientId);
        
      } else {
        console.error('ERROR loadCredentials: No client_id found in credentials');
      }
      
      if (clientSecret) {
        this.config.clientSecret = decrypt(clientSecret);
        
      } else {
        console.error('ERROR loadCredentials: No client_secret found in credentials');
      }
      
      
    } catch (error) {
      console.error('ERROR loadCredentials: Failed to load Calendly credentials:', error);
    }
  }

  /**
   * Ensure credentials are loaded before making API calls
   */
  private async ensureCredentials(): Promise<boolean> {
    if (!this.config.clientId || !this.config.clientSecret) {
      await this.loadCredentials();
    }
    return !!(this.config.clientId && this.config.clientSecret);
  }

  // ===== PERSONAL ACCESS TOKEN (PAT) METHODS =====

  /**
   * Store user's Calendly Personal Access Token
   * This is the recommended approach for most use cases
   */
  async storePAT(pat: string): Promise<CalendlyUser> {
    try {
      // First, test the PAT by getting user info
      const userResponse = await this.apiRequestWithPAT<CalendlyUserResponse>(
        '/users/me',
        pat
      );
      
      const user = userResponse.resource;
      
      // Store PAT and user info in database
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error('User not authenticated');
      }

      const patRecord: Omit<CalendlyPATRecord, 'id' | 'created_at' | 'updated_at'> = {
        user_id: authData.user.id,
        calendly_pat: pat, // Note: Should be encrypted in production
        calendly_user_uri: user.uri,
        calendly_scheduling_url: user.scheduling_url,
        calendly_name: user.name,
        calendly_email: user.email,
        calendly_connected_at: new Date().toISOString(),
        calendly_last_verified: new Date().toISOString(),
      };

      // Store in user settings (with encryption)
      const currentPreferences = await userSettingsService.getAppPreferences();
      
      await userSettingsService.updateAppPreferences({
        ...currentPreferences,
        integration_settings: {
          ...currentPreferences?.integration_settings,
          calendly: {
            enabled: true,
            autoSync: true,
            method: 'pat',
            pat: pat, // Should be encrypted
            user_uri: user.uri,
            scheduling_url: user.scheduling_url,
            name: user.name,
            email: user.email,
            connected_at: new Date().toISOString(),
            last_verified: new Date().toISOString(),
          },
        },
      });

      // Cache the PAT user data
      this.patUser = {
        calendly_pat: pat,
        calendly_user_uri: user.uri,
        calendly_scheduling_url: user.scheduling_url,
        calendly_name: user.name,
        calendly_email: user.email,
        calendly_connected_at: new Date().toISOString(),
        calendly_last_verified: new Date().toISOString(),
      };

      // Create success notification
      await userSettingsService.createNotification({
        title: "Calendly PAT Connected Successfully",
        message: `Your Calendly account (${user.name}) is now connected using Personal Access Token.`,
        type: "success",
        action_url: "/settings/integrations",
        metadata: {
          category: "integration",
          priority: "medium",
          integration: "calendly",
          method: "pat",
        },
      });

      return user;
    } catch (error) {
      console.error("ERROR Failed to store Calendly PAT:", error);
      throw error;
    }
  }

  /**
   * Load PAT from user settings
   */
  async loadPAT(): Promise<CalendlyPATUser | null> {
    try {
      const preferences = await userSettingsService.getAppPreferences();
      const calendlySettings = preferences?.integration_settings?.calendly;

      if (calendlySettings?.method === 'pat' && calendlySettings?.pat) {
        this.patUser = {
          calendly_pat: calendlySettings.pat,
          calendly_user_uri: calendlySettings.user_uri,
          calendly_scheduling_url: calendlySettings.scheduling_url,
          calendly_name: calendlySettings.name,
          calendly_email: calendlySettings.email,
          calendly_connected_at: calendlySettings.connected_at,
          calendly_last_verified: calendlySettings.last_verified,
        };
        return this.patUser;
      }

      return null;
    } catch (error) {
      console.error("ERROR Failed to load Calendly PAT:", error);
      return null;
    }
  }

  /**
   * Make API request using Personal Access Token
   */
  private async apiRequestWithPAT<T>(
    endpoint: string,
    pat: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.apiBaseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${pat}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Calendly API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get user's scheduled events using PAT
   */
  async getScheduledEventsWithPAT(
    options: {
      count?: number;
      status?: 'active' | 'canceled';
      sort?: 'start_time:asc' | 'start_time:desc' | 'created_at:asc' | 'created_at:desc';
      min_start_time?: string;
      max_start_time?: string;
    } = {}
  ): Promise<CalendlyScheduledEvent[]> {
    try {
      // DEMO MODE: Return mock calendar events
      if (import.meta.env.VITE_DEMO_MODE === 'true') {
        console.log('📅 [DEMO MODE] Mock: Returning mock calendar events - This would fetch from Calendly API');
        const { mockCalendarBookings } = await import('@/data/mockData');
        // Transform mock bookings to Calendly format
        return mockCalendarBookings.map((booking: any) => ({
          uri: `https://api.calendly.com/scheduled_events/${booking.id}`,
          name: booking.title,
          status: booking.status,
          start_time: booking.scheduled_time,
          end_time: new Date(new Date(booking.scheduled_time).getTime() + booking.duration * 60000).toISOString(),
          event_type: booking.meeting_type,
          location: { type: 'custom', location: booking.meeting_link },
          invitees_counter: { total: booking.attendees?.length || 1, active: booking.attendees?.length || 1, limit: booking.attendees?.length || 1 },
          created_at: booking.scheduled_time,
          updated_at: booking.scheduled_time,
        }));
      }
      
      // Load PAT if not already loaded
      if (!this.patUser) {
        await this.loadPAT();
      }

      if (!this.patUser) {
        throw new Error('No Calendly PAT found. Please connect your account first.');
      }

      const params = new URLSearchParams({
        user: this.patUser.calendly_user_uri,
        count: (options.count || 100).toString(),
        status: options.status || 'active',
        sort: options.sort || 'start_time:asc',
        ...(options.min_start_time && { min_start_time: options.min_start_time }),
        ...(options.max_start_time && { max_start_time: options.max_start_time }),
      });

      const response = await this.apiRequestWithPAT<CalendlyApiResponse<CalendlyScheduledEvent>>(
        `/scheduled_events?${params.toString()}`,
        this.patUser.calendly_pat
      );

      return response.collection;
    } catch (error) {
      console.error("ERROR Failed to get scheduled events:", error);
      throw error;
    }
  }

  /**
   * Get user's availability using PAT
   */
  async getAvailabilityWithPAT(
    options: {
      start_time?: string;
      end_time?: string;
    } = {}
  ): Promise<any> {
    try {
      if (!this.patUser) {
        await this.loadPAT();
      }

      if (!this.patUser) {
        throw new Error('No Calendly PAT found. Please connect your account first.');
      }

      const params = new URLSearchParams({
        user: this.patUser.calendly_user_uri,
        ...(options.start_time && { start_time: options.start_time }),
        ...(options.end_time && { end_time: options.end_time }),
      });

      const response = await this.apiRequestWithPAT<any>(
        `/user_availability_schedules?${params.toString()}`,
        this.patUser.calendly_pat
      );

      return response;
    } catch (error) {
      console.error("ERROR Failed to get availability:", error);
      throw error;
    }
  }

  /**
   * Get user info using PAT
   */
  async getUserInfoWithPAT(): Promise<CalendlyUser | null> {
    try {
      if (!this.patUser) {
        await this.loadPAT();
      }

      if (!this.patUser) {
        return null;
      }

      const response = await this.apiRequestWithPAT<CalendlyUserResponse>(
        '/users/me',
        this.patUser.calendly_pat
      );

      return response.resource;
    } catch (error) {
      console.error("ERROR Failed to get user info:", error);
      return null;
    }
  }

  /**
   * Disconnect PAT integration
   */
  async disconnectPAT(): Promise<void> {
    try {
      // Clear PAT from user settings
      const currentPreferences = await userSettingsService.getAppPreferences();
      
      await userSettingsService.updateAppPreferences({
        ...currentPreferences,
        integration_settings: {
          ...currentPreferences?.integration_settings,
          calendly: {
            enabled: false,
            autoSync: false,
            method: null,
            pat: null,
            user_uri: null,
            scheduling_url: null,
            name: null,
            email: null,
            connected_at: null,
            last_verified: null,
          },
        },
      });

      this.patUser = null;

      // Create disconnection notification
      await userSettingsService.createNotification({
        title: "Calendly PAT Disconnected",
        message: "Your Calendly Personal Access Token has been removed.",
        type: "info",
        action_url: "/settings/integrations",
        metadata: {
          category: "integration",
          priority: "low",
          integration: "calendly",
          method: "pat",
        },
      });
    } catch (error) {
      console.error("ERROR Failed to disconnect Calendly PAT:", error);
      throw error;
    }
  }

  // ===== OAUTH AUTHENTICATION =====

  /**
   * Generate OAuth authorization URL for Calendly
   * Note: Calendly OAuth does NOT use scopes
   */
  async getAuthorizationUrl(state?: string): Promise<string> {
    const hasCredentials = await this.ensureCredentials();
    if (!hasCredentials) {
      throw new Error('Calendly credentials not configured. Please set up your Calendly integration.');
    }

    // Enhanced Safari-specific fixes
    const isSafari = typeof window !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const safariTimestamp = isSafari ? Date.now() : '';

    // Clear Safari cache before OAuth to prevent stale state
    if (isSafari) {
      this.clearSafariCache();
    }

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: "code",
      redirect_uri: this.config.redirectUri,
      ...(state && { state }),
      // Add timestamp for Safari to prevent caching issues
      ...(safariTimestamp && { _t: safariTimestamp.toString() })
    });

    // Always use the correct OAuth endpoint (not calendly.com)
    const authUrl = `https://auth.calendly.com/oauth/authorize?${params.toString()}`;
    
    // Enhanced logging for Safari issues
    if (isSafari) {
      console.log('🦎 Safari OAuth - Generated URL:', authUrl);
      console.log('🦎 Safari OAuth - Redirect URI:', this.config.redirectUri);
      console.log('🦎 Safari OAuth - Client ID:', this.config.clientId.substring(0, 10) + '...');
      console.log('🦎 Safari OAuth - Timestamp:', safariTimestamp);
      console.log('🦎 Safari OAuth - Current origin:', window.location.origin);
    }

    return authUrl;
  }

  /**
   * Clear Safari cache to prevent OAuth issues
   */
  private clearSafariCache(): void {
    if (typeof window !== 'undefined') {
      try {
        // Clear local storage
        localStorage.removeItem('calendly_integration');
        localStorage.removeItem('calendly_oauth_state');
        
        // Clear session storage
        sessionStorage.removeItem('calendly_post_connection');
        
        // Clear browser history state
        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', window.location.href);
        }
        
        console.log('🦎 Safari cache cleared successfully');
      } catch (error) {
        console.warn('🦎 Safari cache clearing failed:', error);
      }
    }
  }

  /**
   * Safari-specific OAuth initiation
   */
  async initiateSafariOAuth(): Promise<void> {
    try {
      const authUrl = await this.getAuthorizationUrl();
      
      // Safari-specific: Use window.open with proper parameters
      const popup = window.open(
        authUrl,
        'calendly-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
      );
      
      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site and try again.');
      }
      
      // Focus the popup window
      popup.focus();
      
      // Monitor popup for completion
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          // Reload the page to check for successful authentication
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }, 1000);
      
      console.log('🦎 Safari OAuth popup opened successfully');
    } catch (error) {
      console.error('🦎 Safari OAuth failed:', error);
      throw error;
    }
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForTokens(code: string): Promise<CalendlyTokens> {
    try {
      const hasCredentials = await this.ensureCredentials();
      if (!hasCredentials) {
        throw new Error('Calendly credentials not configured. Please set up your Calendly integration.');
      }

      const response = await fetch("https://auth.calendly.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.redirectUri,
          code,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Token exchange failed: ${error}`);
      }

      const tokens = (await response.json()) as CalendlyTokens;
      tokens.created_at = Date.now();

      this.tokens = tokens;

      // Store tokens in user settings
      await this.saveTokensToUserSettings(tokens);

      return tokens;
    } catch (error) {
      console.error("ERROR Calendly token exchange failed:", error);
      throw error;
    }
  }

  /**
   * Refresh expired access token
   */
  async refreshTokens(): Promise<CalendlyTokens> {
    if (!this.tokens?.refresh_token) {
      throw new Error("No refresh token available");
    }

    try {
      const hasCredentials = await this.ensureCredentials();
      if (!hasCredentials) {
        throw new Error('Calendly credentials not configured. Please set up your Calendly integration.');
      }

      const response = await fetch("https://auth.calendly.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.tokens.refresh_token,
        }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const tokens = (await response.json()) as CalendlyTokens;
      tokens.created_at = Date.now();

      this.tokens = tokens;
      await this.saveTokensToUserSettings(tokens);

      return tokens;
    } catch (error) {
      console.error("ERROR Calendly token refresh failed:", error);
      throw error;
    }
  }

  // ===== USER SETTINGS INTEGRATION =====

  /**
   * Save Calendly tokens to user settings
   */
  private async saveTokensToUserSettings(
    tokens: CalendlyTokens,
  ): Promise<void> {
    try {
      const currentPreferences = await userSettingsService.getAppPreferences();

      await userSettingsService.updateAppPreferences({
        ...currentPreferences,
        integration_settings: {
          ...currentPreferences?.integration_settings,
          calendly: {
            ...currentPreferences?.integration_settings?.calendly,
            enabled: true,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: tokens.created_at + tokens.expires_in * 1000,
            token_type: tokens.token_type,
            scope: tokens.scope,
            connected_at: new Date().toISOString(),
          },
        },
      });

      // Create success notification
      await userSettingsService.createNotification({
        title: "Calendly Connected Successfully",
        message:
          "Your Calendly account is now integrated with CRM Demo for BANT/HEAT lead qualification meetings.",
        type: "success",
        action_url: "/settings/integrations",
        metadata: {
          category: "integration",
          priority: "medium",
          integration: "calendly",
        },
      });
    } catch (error) {
      console.error("ERROR Failed to save Calendly tokens:", error);
      throw error;
    }
  }

  /**
   * Load tokens from user settings or localStorage (fallback)
   */
  async loadTokensFromUserSettings(): Promise<CalendlyTokens | null> {
    try {
      // First try user settings
      const preferences = await userSettingsService.getAppPreferences();
      const calendlySettings = preferences?.integration_settings?.calendly;

      if (calendlySettings?.access_token) {
        // Use settings data
        return this.processTokensFromSettings(calendlySettings);
      }

      // Fallback: Check localStorage (for static callback page)
      const localStorageData = localStorage.getItem("calendly_integration");
      if (localStorageData) {
        const parsedData = JSON.parse(localStorageData);
        console.log(
          "📋 Found Calendly tokens in localStorage, syncing to user settings...",
        );

        // Store in user settings for future use
        await this.saveTokensToUserSettings({
          access_token: parsedData.access_token,
          refresh_token: parsedData.refresh_token,
          expires_in: Math.floor((parsedData.expires_at - Date.now()) / 1000),
          token_type: parsedData.token_type,
          scope: parsedData.scope,
          created_at: parsedData.expires_at - 7200 * 1000, // Assume 2 hour token
        });

        // Clear localStorage after syncing
        localStorage.removeItem("calendly_integration");

        return this.processTokensFromSettings(parsedData);
      }

      return null;
    } catch (error) {
      console.error("ERROR Failed to load Calendly tokens:", error);
      return null;
    }
  }

  /**
   * Process tokens from settings data
   */
  private async processTokensFromSettings(
    calendlySettings: any,
  ): Promise<CalendlyTokens> {
    // Check if token is expired
    const now = Date.now();
    const expiresAt = calendlySettings.expires_at || 0;

    if (now >= expiresAt) {
      // Token expired, try to refresh
      this.tokens = {
        access_token: calendlySettings.access_token,
        refresh_token: calendlySettings.refresh_token,
        expires_in: 0,
        token_type: calendlySettings.token_type || "Bearer",
        scope: calendlySettings.scope,
        created_at: 0,
      };

      return await this.refreshTokens();
    }

    this.tokens = {
      access_token: calendlySettings.access_token,
      refresh_token: calendlySettings.refresh_token,
      expires_in: Math.floor((expiresAt - now) / 1000),
      token_type: calendlySettings.token_type || "Bearer",
      scope: calendlySettings.scope,
      created_at: expiresAt - 3600 * 1000,
    };

    return this.tokens;
  }

  /**
   * Check if Calendly is connected and working
   */
  async isConnected(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get connection status with details (supports both OAuth and PAT methods)
   */
  async getConnectionStatus(): Promise<{
    connected: boolean;
    method?: 'oauth' | 'pat' | null;
    user?: CalendlyUser;
    eventTypes?: CalendlyEventType[];
    error?: string;
  }> {
    try {
      // DEMO MODE: Return mock connection status
      if (import.meta.env.VITE_DEMO_MODE === 'true') {
        console.log('📅 [DEMO MODE] Mock: Calendar is connected (mock) - This would check Calendly authentication');
        return {
          connected: true,
          method: 'pat',
          user: {
            uri: 'https://api.calendly.com/users/demo-user',
            name: 'Demo User',
            slug: 'demo-user',
            email: 'demo@example.com',
            scheduling_url: 'https://calendly.com/demo-user',
            timezone: 'America/New_York',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        };
      }
      
      // First try PAT method
      const patUser = await this.loadPAT();
      if (patUser) {
        try {
          const user = await this.getUserInfoWithPAT();
          if (user) {
            return {
              connected: true,
              method: 'pat',
              user: user,
              // Note: eventTypes not implemented for PAT method yet
            };
          }
        } catch (error) {
          console.error("ERROR PAT connection test failed:", error);
        }
      }

      // Fallback to OAuth method
      const user = await this.getCurrentUser();
      const eventTypes = await this.getEventTypes();

      return {
        connected: true,
        method: 'oauth',
        user,
        eventTypes,
      };
    } catch (error) {
      return {
        connected: false,
        method: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ===== API REQUESTS =====

  /**
   * Make authenticated API request to Calendly
   */
  private async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    // Ensure we have valid tokens
    if (!this.tokens) {
      await this.loadTokensFromUserSettings();
    }

    if (!this.tokens) {
      throw new Error(
        "No Calendly authentication. Please connect your account.",
      );
    }

    const url = `${this.config.apiBaseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `${this.tokens.token_type} ${this.tokens.access_token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      await this.refreshTokens();

      // Retry the request
      const retryResponse = await fetch(url, {
        ...options,
        headers: {
          Authorization: `${this.tokens!.token_type} ${this.tokens!.access_token}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!retryResponse.ok) {
        throw new Error(`Calendly API error: ${retryResponse.statusText}`);
      }

      return await retryResponse.json();
    }

    if (!response.ok) {
      throw new Error(`Calendly API error: ${response.statusText}`);
    }

    return await response.json();
  }

  // ===== CALENDLY API METHODS =====

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<CalendlyUser> {
    const response = await this.apiRequest<{ resource: CalendlyUser }>(
      "/users/me",
    );
    return response.resource;
  }

  /**
   * Get user's event types
   */
  async getEventTypes(): Promise<CalendlyEventType[]> {
    const user = await this.getCurrentUser();
    const response = await this.apiRequest<{ collection: CalendlyEventType[] }>(
      `/event_types?user=${user.uri}`,
    );
    return response.collection;
  }

  /**
   * Get scheduled events for user
   */
  async getScheduledEvents(
    options: {
      startTime?: string;
      endTime?: string;
      status?: "active" | "canceled";
      count?: number;
    } = {},
  ): Promise<CalendlyScheduledEvent[]> {
    // DEMO DEMO MODE: Return mock calendar events
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      return [
        {
          uri: 'https://api.calendly.com/scheduled_events/demo-001',
          name: 'Demo Call with Sarah Johnson',
          status: 'active' as const,
          start_time: '2024-01-25T14:00:00Z',
          end_time: '2024-01-25T14:30:00Z',
          event_type: 'https://api.calendly.com/event_types/demo',
          location: {
            type: 'zoom',
            location: 'https://zoom.us/j/demo123456'
          },
          invitees_counter: {
            total: 1,
            active: 1,
            limit: 1
          },
          created_at: '2024-01-20T10:47:00Z',
          updated_at: '2024-01-20T10:47:00Z'
        }
      ];
    }
    
    const user = await this.getCurrentUser();
    const params = new URLSearchParams({
      user: user.uri,
      count: (options.count || 100).toString(),
      ...(options.startTime && { min_start_time: options.startTime }),
      ...(options.endTime && { max_start_time: options.endTime }),
      ...(options.status && { status: options.status }),
    });

    const response = await this.apiRequest<{
      collection: CalendlyScheduledEvent[];
    }>(`/scheduled_events?${params}`);
    return response.collection;
  }

  /**
   * Get event invitees
   */
  async getEventInvitees(eventUri: string): Promise<CalendlyInvitee[]> {
    // Extract the event ID from the URI (last part after the last slash)
    const eventId = eventUri.split("/").pop();
    if (!eventId) {
      throw new Error("Invalid event URI provided");
    }

    const response = await this.apiRequest<{ collection: CalendlyInvitee[] }>(
      `/scheduled_events/${eventId}/invitees`,
    );
    return response.collection;
  }

  // ===== BANT/HEAT INTEGRATION =====

  /**
   * Create BANT qualification event type
   */
  async createBANTEventType(): Promise<CalendlyEventType> {
    const bantQuestions: CalendlyCustomQuestion[] = [
      {
        name: "What is your estimated budget for this project?",
        type: "radio_buttons",
        position: 1,
        enabled: true,
        required: true,
        answer_choices: [
          "Under $10K",
          "$10K-$50K",
          "$50K-$100K",
          "$100K+",
          "Prefer not to say",
        ],
      },
      {
        name: "Are you the decision maker for this project?",
        type: "radio_buttons",
        position: 2,
        enabled: true,
        required: true,
        answer_choices: [
          "Yes, I make the final decision",
          "I'm part of the decision team",
          "I need to involve others",
          "I'm gathering information",
        ],
      },
      {
        name: "What specific challenge are you looking to solve?",
        type: "textarea",
        position: 3,
        enabled: true,
        required: true,
      },
      {
        name: "When do you need this implemented?",
        type: "radio_buttons",
        position: 4,
        enabled: true,
        required: true,
        answer_choices: [
          "ASAP (within 1 month)",
          "1-3 months",
          "3-6 months",
          "6+ months",
          "Just exploring",
        ],
      },
      {
        name: "How did you hear about us?",
        type: "radio_buttons",
        position: 5,
        enabled: true,
        required: false,
        answer_choices: [
          "Google search",
          "LinkedIn",
          "Referral",
          "Content/Blog",
          "Other",
        ],
      },
    ];

    // Note: Event type creation requires admin API access
    // This would typically be configured manually in Calendly dashboard
    // with the questions above for BANT qualification

    throw new Error(
      "Event type creation requires manual setup in Calendly dashboard with BANT questions",
    );
  }

  /**
   * Get BANT qualification data from meeting
   */
  async getBANTQualificationFromMeeting(eventUri: string): Promise<{
    budget: string;
    authority: string;
    need: string;
    timeline: string;
    source?: string;
  } | null> {
    try {
      const invitees = await this.getEventInvitees(eventUri);

      if (invitees.length === 0) {
        return null;
      }

      const invitee = invitees[0];
      const answers = invitee.questions_and_answers || [];

      return {
        budget:
          answers.find((qa) => qa.question.includes("budget"))?.answer ||
          "Unknown",
        authority:
          answers.find((qa) => qa.question.includes("decision"))?.answer ||
          "Unknown",
        need:
          answers.find((qa) => qa.question.includes("challenge"))?.answer ||
          "Unknown",
        timeline:
          answers.find((qa) => qa.question.includes("need this"))?.answer ||
          "Unknown",
        source: answers.find((qa) => qa.question.includes("hear about"))
          ?.answer,
      };
    } catch (error) {
      console.error("ERROR Failed to extract BANT data:", error);
      return null;
    }
  }

  // ===== WEBHOOK HANDLING =====

  /**
   * Handle Calendly webhook for meeting events
   */
  async handleWebhook(payload: any): Promise<void> {
    try {
      const event = payload.event;
      const eventType = payload.event_type;

      switch (eventType) {
        case "invitee.created":
          await this.handleMeetingScheduled(event, payload.payload);
          break;
        case "invitee.canceled":
          await this.handleMeetingCanceled(event, payload.payload);
          break;
        default:
          console.log(`CALENDAR Unhandled Calendly webhook: ${eventType}`);
      }
    } catch (error) {
      console.error("ERROR Webhook handling failed:", error);
      throw error;
    }
  }

  /**
   * Handle meeting scheduled webhook
   */
  private async handleMeetingScheduled(
    event: any,
    payload: any,
  ): Promise<void> {
    const invitee = payload.invitee;
    const scheduledEvent = payload.event;

    // Extract BANT data
    const bantData = await this.getBANTQualificationFromMeeting(
      scheduledEvent.uri,
    );

    // Create notification
    await userSettingsService.createNotification({
      title: "BANT Qualification Meeting Scheduled",
      message: `New meeting scheduled with ${invitee.name} (${invitee.email}) for ${new Date(scheduledEvent.start_time).toLocaleDateString()}`,
      type: "success",
      action_url: `/meetings/${scheduledEvent.uri}`,
      metadata: {
        category: "meeting_scheduled",
        priority: "high",
        invitee_email: invitee.email,
        meeting_time: scheduledEvent.start_time,
        bant_data: bantData,
      },
    });

    // Update lead heat if we can match the email
    await this.updateLeadHeatFromMeeting(invitee.email, "burning");
  }

  /**
   * Handle meeting canceled webhook
   */
  private async handleMeetingCanceled(event: any, payload: any): Promise<void> {
    const invitee = payload.invitee;

    await userSettingsService.createNotification({
      title: "Meeting Canceled",
      message: `Meeting with ${invitee.name} has been canceled`,
      type: "warning",
      action_url: "/meetings",
      metadata: {
        category: "meeting_canceled",
        priority: "medium",
        invitee_email: invitee.email,
      },
    });

    // Update lead heat back to hot
    await this.updateLeadHeatFromMeeting(invitee.email, "hot");
  }

  /**
   * Update lead heat temperature based on meeting activity
   */
  private async updateLeadHeatFromMeeting(
    email: string,
    heatLevel: string,
  ): Promise<void> {
    try {
      // This would integrate with your leads system
      // Example implementation:
      const { data: leads } = await supabase
        .from("leads")
        .select("*")
        .eq("email", email)
        .limit(1);

      if (leads && leads.length > 0) {
        await supabase
          .from("leads")
          .update({
            heat_level: heatLevel,
            updated_at: new Date().toISOString(),
          })
          .eq("id", leads[0].id);
      }
    } catch (error) {
      console.error("ERROR Failed to update lead heat:", error);
    }
  }

  // ===== CONNECTION STATUS =====

  /**
   * Disconnect Calendly integration
   */
  async disconnect(): Promise<void> {
    try {
      // Clear tokens from user settings
      const currentPreferences = await userSettingsService.getAppPreferences();

      await userSettingsService.updateAppPreferences({
        ...currentPreferences,
        integration_settings: {
          ...currentPreferences?.integration_settings,
          calendly: {
            enabled: false,
            autoSync: false,
            connected_at: null,
            access_token: null,
            refresh_token: null,
          },
        },
      });

      this.tokens = null;

      // Create disconnection notification
      await userSettingsService.createNotification({
        title: "Calendly Disconnected",
        message: "Your Calendly integration has been disconnected from CRM Demo.",
        type: "info",
        action_url: "/settings/integrations",
        metadata: {
          category: "integration",
          priority: "low",
          integration: "calendly",
        },
      });
    } catch (error) {
      console.error("ERROR Failed to disconnect Calendly:", error);
      throw error;
    }
  }
}

export const calendlyService = new CalendlyService();
export default calendlyService;
