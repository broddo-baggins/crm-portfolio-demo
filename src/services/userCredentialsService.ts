/**
 * User API Credentials Service
 * Handles encrypted storage and retrieval of user API credentials
 */

import { supabase } from '@/lib/supabase';

export interface UserCredential {
  id: string;
  user_id: string;
  credential_type: string;
  credential_name: string;
  encrypted_value: string;
  created_at: string;
  updated_at: string;
}

export interface CalendlyCredentials {
  client_id: string;
  client_secret: string;
  access_token?: string;
  refresh_token?: string;
  webhook_secret?: string;
}

export interface IntegrationStatus {
  service: string;
  connected: boolean;
  configured: boolean;
  lastUpdated?: string;
  userInfo?: {
    name?: string;
    email?: string;
    scheduling_url?: string;
  };
}

class UserCredentialsService {
  
  /**
   * Get all user credentials
   */
  async getUserCredentials(): Promise<UserCredential[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await (supabase as any)
        .from('user_api_credentials')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading user credentials:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get user credentials:', error);
      return [];
    }
  }

  /**
   * Get credentials for a specific service
   */
  async getServiceCredentials(service: string): Promise<UserCredential[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }

      const { data, error } = await (supabase as any)
        .from('user_api_credentials')
        .select('*')
        .eq('user_id', user.id)
        .eq('credential_type', service)
        .eq('is_active', true);

      if (error) {
        console.error(`Error loading ${service} credentials:`, error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error(`Failed to get ${service} credentials:`, error);
      return [];
    }
  }

  /**
   * Decrypt credentials (simple base64 decoding)
   */
  decryptCredentials(encryptedCredentials: string): any {
    try {
      // First try to parse as JSON (for plain text values)
      try {
        return JSON.parse(encryptedCredentials);
      } catch {
        // If JSON parsing fails, try base64 decoding
        const decoded = atob(encryptedCredentials);
        return decoded;
      }
    } catch (error) {
      console.error('Failed to decrypt credentials:', error);
      return encryptedCredentials; // Return as-is if decryption fails
    }
  }

  /**
   * Encrypt credentials (simple base64 encoding)
   */
  encryptCredentials(credentials: any): string {
    try {
      const jsonString = JSON.stringify(credentials);
      return btoa(jsonString);
    } catch (error) {
      console.error('Failed to encrypt credentials:', error);
      return '';
    }
  }

  /**
   * Save or update service credentials
   */
  async saveServiceCredentials(service: string, credentials: any): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      const encryptedCredentials = this.encryptCredentials(credentials);
      
      // Check if credentials already exist
      const existing = await this.getServiceCredentials(service);
      
      if (existing.length > 0) {
        // Update existing credentials - update all records
        for (const record of existing) {
          const { error } = await (supabase as any)
            .from('user_api_credentials')
            .update({
              encrypted_value: encryptedCredentials,
              updated_at: new Date().toISOString()
            })
            .eq('id', record.id);
            
          if (error) {
            console.error(`Error updating ${service} credentials:`, error);
            return false;
          }
        }
      } else {
        // Create new credentials
        const { error } = await (supabase as any)
          .from('user_api_credentials')
          .insert({
            user_id: user.id,
            credential_type: service,
            credential_name: 'api_key',
            encrypted_value: encryptedCredentials
          });
          
        if (error) {
          console.error(`Error creating ${service} credentials:`, error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error(`Failed to save ${service} credentials:`, error);
      return false;
    }
  }

  /**
   * Delete service credentials
   */
  async deleteServiceCredentials(service: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      const { error } = await (supabase as any)
        .from('user_api_credentials')
        .delete()
        .eq('user_id', user.id)
        .eq('credential_type', service);

      if (error) {
        console.error(`Error deleting ${service} credentials:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Failed to delete ${service} credentials:`, error);
      return false;
    }
  }

  /**
   * Get integration status for all services
   */
  async getIntegrationStatuses(): Promise<IntegrationStatus[]> {
    try {
      const credentials = await this.getUserCredentials();
      const statuses: IntegrationStatus[] = [];

      // Group credentials by service type
      const serviceGroups = new Map<string, any[]>();
      
      for (const cred of credentials) {
        const service = cred.credential_type;
        if (!serviceGroups.has(service)) {
          serviceGroups.set(service, []);
        }
        serviceGroups.get(service)!.push(cred);
      }

      // Process each service group
      for (const [service, serviceCreds] of serviceGroups) {
        const credMap = new Map(serviceCreds.map(c => [c.credential_name, c.encrypted_value]));
        
        const status: IntegrationStatus = {
          service: service,
          connected: true,
          configured: this.isServiceConfiguredFromMap(service, credMap),
          lastUpdated: serviceCreds[0]?.updated_at,
        };

        // Add service-specific info
        if (service === 'calendly') {
          status.userInfo = {
            name: 'Calendly User',
            email: '',
            scheduling_url: this.decryptCredentials(credMap.get('redirect_uri') || ''),
          };
        }

        statuses.push(status);
      }

      return statuses;
    } catch (error) {
      console.error('Failed to get integration statuses:', error);
      return [];
    }
  }

  /**
   * Check if service is properly configured
   */
  private isServiceConfigured(service: string, credentials: any): boolean {
    switch (service) {
      case 'calendly':
        return !!(credentials.client_id && credentials.client_secret);
      case 'whatsapp':
        return !!(credentials.access_token);
      default:
        return false;
    }
  }

  /**
   * Check if service is properly configured from credential map
   */
  private isServiceConfiguredFromMap(service: string, credMap: Map<string, string>): boolean {
    switch (service) {
      case 'calendly':
        return !!(credMap.get('client_id') && credMap.get('client_secret'));
      case 'whatsapp':
        return !!(credMap.get('access_token') || credMap.get('api_key'));
      default:
        return credMap.size > 0;
    }
  }

  /**
   * Get Calendly connection status
   */
  async getCalendlyStatus(): Promise<{
    connected: boolean;
    configured: boolean;
    userInfo?: {
      name?: string;
      email?: string;
      scheduling_url?: string;
    };
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { connected: false, configured: false };
      }

      // Get all Calendly credentials for this user
      const { data: credentials, error } = await (supabase as any)
        .from('user_api_credentials')
        .select('credential_name, encrypted_value')
        .eq('user_id', user.id)
        .eq('credential_type', 'calendly')
        .eq('is_active', true);

      if (error || !credentials || credentials.length === 0) {
        return { connected: false, configured: false };
      }

      // Create map of credentials
      const credMap = new Map(credentials.map((c: any) => [c.credential_name, c.encrypted_value]));
      
      const clientIdEncrypted = credMap.get('client_id');
      const clientSecretEncrypted = credMap.get('client_secret');
      
      if (!clientIdEncrypted || !clientSecretEncrypted) {
        return { connected: false, configured: false };
      }

      const clientId = this.decryptCredentials(clientIdEncrypted as string);
      const clientSecret = this.decryptCredentials(clientSecretEncrypted as string);
      
      if (!clientId || !clientSecret) {
        return { connected: false, configured: false };
      }

      return {
        connected: true,
        configured: true,
        userInfo: {
          name: 'Calendly User', // We don't store user info in credentials
          email: '',
          scheduling_url: '',
        },
      };
    } catch (error) {
      console.error('Failed to get Calendly status:', error);
      return { connected: false, configured: false };
    }
  }

  /**
   * Get WhatsApp Business connection status
   * Fixed to properly handle RLS policies and debug credentials loading
   */
  async getWhatsappStatus(): Promise<{
    connected: boolean;
    configured: boolean;
    userInfo?: {
      name?: string;
      email?: string;
      phone_number?: string;
    };
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('SEARCH getWhatsappStatus: No authenticated user');
        return { connected: false, configured: false };
      }

      
      // Get all WhatsApp credentials for this user
      const { data: credentials, error } = await (supabase as any)
        .from('user_api_credentials')
        .select('credential_name, encrypted_value')
        .eq('user_id', user.id)
        .eq('credential_type', 'whatsapp')
        .eq('is_active', true);

      if (error) {
        console.error('SEARCH getWhatsappStatus: Database error:', error);
        return { connected: false, configured: false };
      }

      
      if (!credentials || credentials.length === 0) {
        // The demo runs the integration on sample data, so no credentials is the normal case
        if (import.meta.env.VITE_DEMO_MODE !== 'true') {
          console.warn('SEARCH getWhatsappStatus: No WhatsApp credentials found for user');
        }
        return { connected: false, configured: false };
      }

      // Create map of credentials
      const credMap = new Map(credentials.map((c: any) => [c.credential_name, c.encrypted_value]));
      
      
      const accessTokenEncrypted = credMap.get('access_token');
      const phoneNumberIdEncrypted = credMap.get('phone_number_id');
      
      if (!accessTokenEncrypted) {
        console.warn('SEARCH getWhatsappStatus: No access_token found');
        return { connected: false, configured: false };
      }

      const accessToken = this.decryptCredentials(accessTokenEncrypted as string);
      const phoneNumberId = phoneNumberIdEncrypted ? this.decryptCredentials(phoneNumberIdEncrypted as string) : '';
      
      if (!accessToken) {
        console.warn('SEARCH getWhatsappStatus: Failed to decrypt access_token');
        return { connected: false, configured: false };
      }

      
      return {
        connected: true,
        configured: true,
        userInfo: {
          name: 'WhatsApp Business',
          email: '',
          phone_number: phoneNumberId || '',
        },
      };
    } catch (error) {
      console.error('ERROR getWhatsappStatus: Failed to get WhatsApp status:', error);
      return { connected: false, configured: false };
    }
  }

  /**
   * Connect to Calendly (redirect to OAuth)
   */
  async connectToCalendly(): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get all Calendly credentials for this user
      const { data: credentials, error } = await (supabase as any)
        .from('user_api_credentials')
        .select('credential_name, encrypted_value')
        .eq('user_id', user.id)
        .eq('credential_type', 'calendly')
        .eq('is_active', true);

      if (error) {
        console.error('Error loading Calendly credentials:', error);
        throw new Error('Failed to load Calendly credentials');
      }

      if (!credentials || credentials.length === 0) {
        throw new Error('Calendly credentials not configured');
      }

      // Create map of credentials
      const credMap = new Map(credentials.map((c: any) => [c.credential_name, c.encrypted_value]));
      
      const clientIdEncrypted = credMap.get('client_id');
      if (!clientIdEncrypted) {
        throw new Error('Calendly client ID not found');
      }

      const clientId = this.decryptCredentials(clientIdEncrypted as string);
      
      if (!clientId) {
        throw new Error('Failed to decrypt Calendly client ID');
      }

      // Generate OAuth URL with correct redirect URI and Safari-specific fixes
      const redirectUri = `${window.location.origin}/auth/calendly/callback`;
      const state = 'calendly-oauth-' + Date.now();
      
      // Safari-specific fixes
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const safariTimestamp = isSafari ? Date.now() : '';
      
      // AGGRESSIVE SAFARI FIXES for keychain interference
      if (isSafari) {
        console.log('🦎 Safari detected - Applying aggressive OAuth fixes');
        
        // Clear Safari-specific caches that might interfere with OAuth
        try {
          // Clear any cached auth headers that might conflict
          if (window.sessionStorage) {
            window.sessionStorage.removeItem('calendly_auth_cache');
            window.sessionStorage.removeItem('calendly_oauth_state');
          }
          
          // Force clear any cached requests
          if (window.localStorage) {
            window.localStorage.removeItem('calendly_last_auth_url');
            window.localStorage.removeItem('calendly_auth_timestamp');
          }
          
          // Clear history state that might interfere
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', window.location.href);
          }
        } catch (e) {
          console.warn('Safari cache clearing failed:', e);
        }
      }
      
      const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        state: state,
        // Add multiple timestamp parameters for Safari cache busting
        ...(safariTimestamp && { 
          _t: safariTimestamp.toString(),
          _safari: 'true',
          _cache_bust: Math.random().toString(36).substring(7)
        })
      });

      // CRITICAL: Always use the correct OAuth endpoint (not calendly.com)
      const authUrl = `https://auth.calendly.com/oauth/authorize?${params.toString()}`;
      
      // Log for debugging Safari issues
      if (isSafari) {
        console.log('🦎 Safari OAuth URL Generation:');
        console.log('🦎 Generated URL:', authUrl);
        console.log('🦎 Redirect URI:', redirectUri);
        console.log('🦎 Client ID:', clientId.substring(0, 10) + '...');
        console.log('🦎 User Agent:', navigator.userAgent);
        
        // Store the auth URL for Safari verification
        if (window.sessionStorage) {
          window.sessionStorage.setItem('calendly_expected_auth_url', authUrl);
        }
      }
      
      return authUrl;
    } catch (error) {
      console.error('Failed to connect to Calendly:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Calendly
   */
  async disconnectFromCalendly(): Promise<boolean> {
    try {
      return await this.deleteServiceCredentials('calendly');
    } catch (error) {
      console.error('Failed to disconnect from Calendly:', error);
      return false;
    }
  }
}

export const userCredentialsService = new UserCredentialsService(); 