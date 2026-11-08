/**
 * DEMO MODE: Mock Authentication Context
 * 
 * This is a simplified authentication context for portfolio demonstration.
 * - No real authentication or database connections
 * - Always returns authenticated state
 * - Bypasses login requirements for demo purposes
 */

import React, { createContext, useContext, useState } from 'react';

// Mock user type (compatible with Supabase User interface)
interface MockUser {
  id: string;
  email: string;
  role: string;
  app_metadata: Record<string, any>;
  aud: string;
  created_at: string;
  user_metadata: {
    name?: string;
    full_name?: string;
    avatar_url?: string;
    role?: string;
    is_admin?: boolean;
  };
}

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: MockUser | null;
  session: any | null;
  loading: boolean;
  login: (email: string, password: string, provider?: 'google' | 'facebook' | 'fallback') => Promise<AuthResult>;
  register: (email: string, password: string, name?: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  hasPermission: (requiredRole: string) => boolean;
}

// Create context
const ClientAuthContext = createContext<AuthContextType | null>(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock demo user - Portfolio Demonstration
const DEMO_USER: MockUser = {
  id: 'demo-user-12345',
  email: 'honored.guest@crm.demo',
  role: 'ADMIN',
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
  user_metadata: {
    name: 'Honored Guest',
    full_name: 'Honored Guest',
    avatar_url: undefined,
    role: 'ADMIN',
    is_admin: true
  }
};

// Provider component - DEMO MODE
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // The guest session is synchronous: no loading state, no flash of the login screen
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Mock login - always succeeds
  const login = async (email: string, password: string): Promise<AuthResult> => {
    console.log('DEMO [DEMO MODE] Mock login called');
    setLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsAuthenticated(true);
    setLoading(false);
    
    return { success: true };
  };

  // Mock register - always succeeds
  const register = async (email: string, password: string, name?: string): Promise<AuthResult> => {
    console.log('DEMO [DEMO MODE] Mock register called');
    return login(email, password);
  };

  // Mock logout - Shows demo notice
  const logout = async (): Promise<void> => {
    console.log('DEMO [DEMO MODE] Mock logout called - staying in demo');
    // Don't actually log out in demo mode
    // Show a toast/banner instead
    const event = new CustomEvent('demo-logout-attempt');
    window.dispatchEvent(event);
  };

  // Mock permission check - always true for demo
  const hasPermission = (requiredRole: string): boolean => {
    return true; // All permissions granted in demo mode
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    user: isAuthenticated ? DEMO_USER : null,
    session: isAuthenticated ? { user: DEMO_USER, access_token: 'demo-token' } : null,
    loading,
    login,
    register,
    logout,
    hasPermission,
  };

  return (
    <ClientAuthContext.Provider value={contextValue}>
      {children}
    </ClientAuthContext.Provider>
  );
};
