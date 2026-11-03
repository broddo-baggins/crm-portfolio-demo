import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'
import { toast } from 'sonner'
import { env } from '@/config/env'

// DEMO MODE: Check if we're in demo mode
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

// Create the supabase client directly here
const supabaseUrl = isDemoMode ? 'https://demo.supabase.co' : import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = isDemoMode ? 'demo-anon-key' : import.meta.env.VITE_SUPABASE_ANON_KEY

if (!isDemoMode && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('Missing Supabase environment variables')
}

// DEMO MODE: the signed-in demo user. Matches DEMO_USER in ClientAuthContext, which
// auto-authenticates every visitor, so services that ask Supabase for the user agree.
const DEMO_AUTH_USER = {
  id: 'demo-user-12345',
  email: 'honored.guest@crm.demo',
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: { name: 'Honored Guest', full_name: 'Honored Guest', role: 'ADMIN', is_admin: true },
  created_at: '2024-01-01T00:00:00Z',
};
const DEMO_SESSION = { user: DEMO_AUTH_USER, access_token: 'demo-token', token_type: 'bearer' };

/**
 * A query builder that accepts any chain (select/eq/order/maybeSingle/upsert/...)
 * and resolves to an empty result, like a table with no rows.
 */
const createMockQuery = (): any => {
  const result = { data: null, error: null, count: 0 };
  const query: any = new Proxy(() => {}, {
    get: (_target, prop) => {
      if (prop === 'then') return (resolve: any, reject: any) => Promise.resolve(result).then(resolve, reject);
      if (prop === 'single' || prop === 'maybeSingle') return () => Promise.resolve(result);
      return () => query;
    },
  });
  return query;
};

// DEMO MODE: Create mock client that doesn't make any real calls
const createMockSupabaseClient = () => {
  const mockAuth = {
    getSession: async () => ({ data: { session: DEMO_SESSION }, error: null }),
    getUser: async () => ({ data: { user: DEMO_AUTH_USER }, error: null }),
    onAuthStateChange: (_callback: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signOut: async () => ({ error: null }),
    signInWithPassword: async (_credentials: any) => ({
      data: null,
      error: { message: 'Demo mode - no real authentication' },
    }),
    resetPasswordForEmail: async () => ({ data: {}, error: null }),
    updateUser: async () => ({ data: { user: DEMO_AUTH_USER }, error: null }),
    exchangeCodeForSession: async () => ({ data: { session: DEMO_SESSION }, error: null }),
    setSession: async () => ({ data: { session: DEMO_SESSION }, error: null }),
  };

  const mockChannel = () => {
    const channel: any = {
      on: () => channel,
      subscribe: () => channel,
      unsubscribe: () => {},
    };
    return channel;
  };

  return {
    auth: mockAuth,
    from: (_table: string) => createMockQuery(),
    channel: (_name: string) => mockChannel(),
    removeChannel: () => {},
    rpc: async (_fn: string, _params: any) => ({ data: null, error: null }),
    functions: { invoke: async () => ({ data: null, error: null }) },
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  };
};

// OPTIMIZATION: Enhanced client configuration to reduce realtime overhead
export const supabase = isDemoMode 
  ? createMockSupabaseClient() as any
  : createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          storage: localStorage, // Explicitly use localStorage
          storageKey: 'crm-demo-auth', // Custom storage key
        },
        global: {
          headers: {
            'x-application-name': 'crm-portfolio-demo'
          }
        },
        db: {
          schema: 'public'
        },
        realtime: {
          // OPTIMIZATION: Dramatically reduce realtime frequency
          params: {
            eventsPerSecond: 1 // Reduced from 2 to 1 (50% reduction)
          },
          // OPTIMIZATION: Add heartbeat configuration for better connection management
          heartbeatIntervalMs: 30000, // 30 seconds instead of default 15
          // OPTIMIZATION: Timeout configuration
          timeout: 20000, // 20 seconds
          // OPTIMIZATION: Enable smart reconnection
          reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 10000), // Exponential backoff
          // OPTIMIZATION: Reduce log verbosity in production
          log_level: import.meta.env.DEV ? 'info' : 'error'
        }
      }
    )

// OPTIMIZATION: Enhanced connection monitoring and optimization
class SupabaseOptimizer {
  private static instance: SupabaseOptimizer;
  private activeChannels: Set<string> = new Set();
  private connectionMetrics: {
    connectTime: number;
    lastActivity: number;
    reconnectCount: number;
    eventsReceived: number;
  } = {
    connectTime: Date.now(),
    lastActivity: Date.now(),
    reconnectCount: 0,
    eventsReceived: 0
  };

  static getInstance(): SupabaseOptimizer {
    if (!SupabaseOptimizer.instance) {
      SupabaseOptimizer.instance = new SupabaseOptimizer();
    }
    return SupabaseOptimizer.instance;
  }

  /**
   * OPTIMIZATION: Smart channel management to prevent duplicate subscriptions
   */
  createOptimizedChannel(channelName: string, config?: any) {
    // Prevent duplicate channels
    if (this.activeChannels.has(channelName)) {
      console.warn(`REFRESH Channel ${channelName} already exists, reusing existing connection`);
      return supabase.channel(channelName);
    }

    console.log('[CHANNEL] Creating optimized channel: ' + channelName);
    this.activeChannels.add(channelName);

    const channel = supabase.channel(channelName, {
      config: {
        // OPTIMIZATION: Reduce broadcast and presence overhead if not needed
        broadcast: { self: false },
        presence: { key: '' },
        // OPTIMIZATION: Only subscribe to postgres_changes
        postgres_changes: true,
        ...config
      }
    });

    // OPTIMIZATION: Add connection monitoring
    channel.on('system', {}, (payload) => {
      const { event, message } = payload;
      this.connectionMetrics.lastActivity = Date.now();
      
      switch (event) {
        case 'phx_reply':
          if (message?.status === 'ok') {
            
          }
          break;
        case 'phx_error':
          console.warn(`ERROR Channel ${channelName} error:`, message);
          this.connectionMetrics.reconnectCount++;
          break;
        case 'phx_close':
          console.log('[CLOSE] Channel ' + channelName + ' closed');
          this.activeChannels.delete(channelName);
          break;
      }
    });

    return channel;
  }

  /**
   * OPTIMIZATION: Batch subscription cleanup
   */
  cleanup(): void {
    console.log('[CLEANUP] Cleaning up ' + this.activeChannels.size + ' active channels');
    
    this.activeChannels.forEach(channelName => {
      const channel = supabase.channel(channelName);
      channel.unsubscribe();
    });
    
    this.activeChannels.clear();
    
  }

  /**
   * OPTIMIZATION: Connection health monitoring
   */
  getConnectionHealth(): {
    isHealthy: boolean;
    metrics: typeof this.connectionMetrics;
    activeChannels: number;
    recommendations: string[];
  } {
    const now = Date.now();
    const timeSinceLastActivity = now - this.connectionMetrics.lastActivity;
    const uptime = now - this.connectionMetrics.connectTime;
    
    const isHealthy = timeSinceLastActivity < 60000; // Healthy if activity within 1 minute
    const recommendations: string[] = [];

    if (this.activeChannels.size > 5) {
      recommendations.push('Consider reducing number of active channels');
    }
    
    if (this.connectionMetrics.reconnectCount > 3) {
      recommendations.push('High reconnection count detected - check network stability');
    }
    
    if (timeSinceLastActivity > 120000) {
      recommendations.push('No recent activity - consider reconnecting');
    }

    return {
      isHealthy,
      metrics: {
        ...this.connectionMetrics,
        uptime,
        timeSinceLastActivity
      },
      activeChannels: this.activeChannels.size,
      recommendations
    };
  }

  /**
   * OPTIMIZATION: Smart event throttling
   */
  createThrottledSubscription(
    channel: any,
    event: string,
    filter: any,
    callback: (payload: any) => void,
    throttleMs: number = 1000
  ) {
    let lastEventTime = 0;
    let pendingEvent: any = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const throttledCallback = (payload: any) => {
      const now = Date.now();
      this.connectionMetrics.eventsReceived++;
      
      if (now - lastEventTime >= throttleMs) {
        // Execute immediately
        lastEventTime = now;
        callback(payload);
        
        // Clear any pending event
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
          pendingEvent = null;
        }
      } else {
        // Throttle the event
        pendingEvent = payload;
        
        if (!timeoutId) {
          const remainingTime = throttleMs - (now - lastEventTime);
          timeoutId = setTimeout(() => {
            if (pendingEvent) {
              lastEventTime = Date.now();
              callback(pendingEvent);
              pendingEvent = null;
              timeoutId = null;
            }
          }, remainingTime);
        }
      }
    };

    return channel.on(event, filter, throttledCallback);
  }
}

// Export the optimizer instance
export const supabaseOptimizer = SupabaseOptimizer.getInstance();

// OPTIMIZATION: Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    supabaseOptimizer.cleanup();
  });
  
  // OPTIMIZATION: Periodic health check (every 5 minutes)
  setInterval(() => {
    const health = supabaseOptimizer.getConnectionHealth();
    if (!health.isHealthy) {
      console.warn('TOOL Supabase connection health check failed:', health);
      
      if (health.recommendations.length > 0) {
        console.log('IDEA Recommendations:', health.recommendations);
      }
    }
  }, 5 * 60 * 1000); // 5 minutes
}

// OPTIMIZATION: Export helper functions for optimized usage
export const createOptimizedChannel = (channelName: string, config?: any) => {
  return supabaseOptimizer.createOptimizedChannel(channelName, config);
};

export const createThrottledSubscription = (
  channel: any,
  event: string,
  filter: any,
  callback: (payload: any) => void,
  throttleMs: number = 1000
) => {
  return supabaseOptimizer.createThrottledSubscription(channel, event, filter, callback, throttleMs);
};

// Success message for optimization - removed for cleaner user experience
// console.log('INIT Supabase client optimized for performance:', {
//   eventsPerSecond: 1,
//   heartbeatInterval: '30s',
//   smartReconnection: true,
//   channelManagement: true
// });

// Check if in staging environment
// Staging environment removed - use regular authentication in tests

// Helper to handle auth errors
export const handleAuthError = (error: any) => {
  if (error?.message?.includes('refresh token') || 
      error?.message?.includes('Refresh Token')) {
    console.error('Auth: Refresh token error detected, clearing session...')
    // Clear all auth data
    supabase.auth.signOut()
    // Clear local storage
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('supabase') || key.includes('auth'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
    sessionStorage.clear()
    // Force reload to login page
            window.location.href = '/auth/login'
    return true
  }
  return false
}

// Error handler for Supabase operations
function handleSupabaseError(error: any, defaultMessage: string) {
  console.error('Supabase error:', error);
  
  // Handle specific error types
  let message = defaultMessage;
  
  if (error?.message) {
    if (error.message.includes('Invalid login credentials')) {
      message = 'Invalid email or password';
    } else if (error.message.includes('Email not confirmed')) {
      message = 'Please check your email and click the confirmation link';
    } else if (error.message.includes('User already registered')) {
      message = 'An account with this email already exists';
    } else if (error.message.includes('session') || error.message.includes('Auth')) {
      message = 'Authentication session expired. Please login again.';
    } else {
      message = error.message;
    }
  }
  
  toast.error(message);
}

// Utility function to check Supabase connection
export const checkSupabaseConnection = async () => {
  try {
    if (!supabase) {
      console.warn('Supabase client not available');
      return false;
    }
    
    const { error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
};

// Enhanced authentication and user management functions using the singleton client
export const authService = {
  // Check if auth service is available
  get isAvailable() {
    return !!supabase && env.isConfigured;
  },

  // Get debug info
  get debugInfo() {
    return {
      hasClient: !!supabase,
      isConfigured: env.isConfigured,
      environment: env.debugInfo
    };
  },

  // Sign up with automatic profile creation
  async signUp(email: string, password: string, userData: {
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    try {
      if (!this.isAvailable) {
        console.error('ERROR Auth service not available:', this.debugInfo);
        throw new Error('Authentication service not available. Please check configuration.');
      }

      console.log('SECURITY Starting sign up process for:', email);

      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error('ERROR Auth signup failed:', authError);
        throw authError;
      }

      if (authData.user) {
        
        // Step 2: Create profile using authenticated client
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              first_name: userData.firstName,
              last_name: userData.lastName,
              email: email,
              phone: userData.phone || null,
              role: 'user',
              status: 'active'
            })
            .select()
            .single();

          if (profileError) {
            console.error('WARNING Profile creation failed:', profileError);
            // User was created but profile failed - still return success
            toast.success('Account created! Please check your email to verify your account.');
            return { user: authData.user, profile: null };
          }

          
          toast.success('Account created successfully! Please check your email to verify your account.');
          return { user: authData.user, profile };
        } catch (profileError) {
          console.error('WARNING Profile creation failed:', profileError);
          // User was created but profile failed - still return success
          toast.success('Account created! Please check your email to verify your account.');
          return { user: authData.user, profile: null };
        }
      }

      return { user: null, profile: null };
    } catch (error) {
      console.error('ERROR Sign up failed:', error);
      handleSupabaseError(error, 'Failed to create account');
      throw error;
    }
  },

  // Sign in
  async signIn(email: string, password: string) {
    try {
      if (!this.isAvailable) {
        console.error('ERROR Auth service not available:', this.debugInfo);
        throw new Error('Authentication service not available. Please check configuration.');
      }

      console.log('SECURITY Starting sign in process for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('ERROR Sign in failed:', error);
        throw error;
      }

      if (data.user) {
        
        // Get user profile
        try {
          // Use the authenticated supabase client instead of adminOperations  
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
            // If profile doesn't exist, user signed in but profile fetch failed
            if (profileError.code === 'PGRST116') {
              console.log('WARNING Profile not found for user after sign in');
              toast.success('Signed in successfully!');
              return { user: data.user, profile: null };
            }
            throw profileError;
          }

          
          toast.success('Signed in successfully!');
          return { user: data.user, profile };
        } catch (profileError) {
          console.error('WARNING Profile fetch failed:', profileError);
          // User signed in but profile fetch failed
          toast.success('Signed in successfully!');
          return { user: data.user, profile: null };
        }
      }

      return { user: null, profile: null };
    } catch (error) {
      console.error('ERROR Sign in failed:', error);
      handleSupabaseError(error, 'Failed to sign in');
      throw error;
    }
  },

  // Sign out
  async signOut() {
    try {
      if (!this.isAvailable) {
        console.warn('WARNING Auth service not available for sign out');
        return;
      }

      console.log('SECURITY Starting sign out process');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('ERROR Sign out failed:', error);
        throw error;
      }
      
      
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('ERROR Sign out error:', error);
      handleSupabaseError(error, 'Failed to sign out');
      throw error;
    }
  },

  // Get current user with profile
  async getCurrentUser() {
    try {
      if (!this.isAvailable) {
        console.warn('WARNING Auth service not available for getCurrentUser');
        return { user: null, profile: null };
      }

      // Try to get session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('SECURITY Session error in getCurrentUser:', sessionError);
        return { user: null, profile: null };
      }

      if (!session?.user) {
        console.log('SECURITY No session found in getCurrentUser');
        return { user: null, profile: null };
      }

      const user = session.user;
      console.log('SECURITY Current user found:', user.id);
      
      try {
        // Use the authenticated supabase client instead of adminOperations
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          // If profile doesn't exist, return user without profile
          if (profileError.code === 'PGRST116') {
            console.log('WARNING Profile not found for user, returning user without profile');
            return { user, profile: null };
          }
          throw profileError;
        }

        
        return { user, profile };
      } catch (profileError) {
        console.error('WARNING Profile fetch failed:', profileError);
        return { user, profile: null };
      }
    } catch (error) {
      console.error('SECURITY Auth error in getCurrentUser:', error);
      
      // Don't throw AuthSessionMissingError - just return null
      return { user: null, profile: null };
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
    status?: string;
  }) {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const profileUpdates: any = {};
      if (updates.firstName !== undefined) profileUpdates.first_name = updates.firstName;
      if (updates.lastName !== undefined) profileUpdates.last_name = updates.lastName;
      if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
      if (updates.role !== undefined) profileUpdates.role = updates.role;
      if (updates.status !== undefined) profileUpdates.status = updates.status;

      const { data, error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      toast.success('Profile updated successfully!');
      return data;
    } catch (error) {
      handleSupabaseError(error, 'Failed to update profile');
      throw error;
    }
  },

  // Password reset
  async resetPassword(email: string) {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success('Password reset email sent! Check your inbox.');
      return true;
    } catch (error) {
      handleSupabaseError(error, 'Failed to send password reset email');
      throw error;
    }
  },

  // Update password
  async updatePassword(newPassword: string) {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully!');
      return true;
    } catch (error) {
      handleSupabaseError(error, 'Failed to update password');
      throw error;
    }
  },

  // Sign in with OAuth
  async signInWithOAuth(provider: 'google' | 'facebook') {
    try {
      if (!this.isAvailable) {
        console.error('ERROR Auth service not available for OAuth');
        throw new Error('Authentication service not available. Please check configuration.');
      }

      console.log(`SECURITY Starting ${provider} OAuth sign in`);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${env.APP_URL}/auth/callback`
        }
      });

      if (error) {
        console.error(`ERROR ${provider} OAuth failed:`, error);
        throw error;
      }

      
      return data;
    } catch (error) {
      console.error(`ERROR ${provider} OAuth error:`, error);
      handleSupabaseError(error, `Failed to sign in with ${provider}`);
      throw error;
    }
  }
};

// Session management using the singleton client
export const sessionService = {
  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!supabase) {
      console.warn('WARNING Supabase client not available for auth state changes');
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    
    console.log('SECURITY Setting up auth state change listener');
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('SECURITY Auth state changed:', event, session?.user?.id || 'no user');
      callback(event, session);
    });
  },

  // Get current session
  async getSession() {
    if (!supabase) {
      console.warn('WARNING Supabase client not available for getSession');
      return null;
    }
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('SECURITY Session error:', error);
        return null;
      }
      
      if (session) {
        console.log('SECURITY Session found:', session.user?.id);
      } else {
        console.log('SECURITY No session found');
      }
      
      return session;
    } catch (error) {
      console.error('SECURITY Session fetch error:', error);
      return null;
    }
  },

  // Check if user is authenticated
  async isAuthenticated() {
    const session = await this.getSession();
    const isAuth = !!session?.user;
    console.log('SECURITY Authentication check:', isAuth);
    return isAuth;
  }
};

// Set up auth state listener AFTER all exports to avoid temporal dead zone
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('Auth: User signed in')
  } else if (event === 'SIGNED_OUT') {
    console.log('Auth: User signed out, clearing storage...')
    // Clear any remaining auth data
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('supabase') || key.includes('auth'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
    sessionStorage.clear()
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('Auth: Token auto-refreshed')
  }
}) 