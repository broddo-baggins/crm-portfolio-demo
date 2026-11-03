
import { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router';
import { supabase } from '@/integrations/supabase/client';
// import { debug } from '@/utils/debug';

interface UsePasswordResetTokenResult {
  recoveryToken: string | null;
  tokenType: string | null;
  error: string | null;
}

export const usePasswordResetToken = (): UsePasswordResetTokenResult => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);
  const [tokenType, setTokenType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const extractToken = async () => {
      try {
        console.log('Extracting token from URL', { 
          pathname: location.pathname,
          search: location.search, 
          hash: location.hash 
        });
        
        // Method 1: Check direct query parameters (most common format)
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        
        if (token) {
          console.log('Found token in query parameters', { type });
          setRecoveryToken(token);
          setTokenType(type || 'recovery');
          return;
        }
        
        // Method 2: Check hash fragment (Supabase v2 auth callback format)
        if (location.hash) {
          const hashParams = new URLSearchParams(location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          
          if (accessToken) {
            console.log('Found access_token in URL hash');
            setRecoveryToken(accessToken);
            setTokenType('recovery');
            return;
          }
        }
        
        // Method 3: Check if there's already a session from the email link click
        try {
          const { data } = await supabase.auth.getSession();
          
          if (data?.session) {
            console.log('Found active session, using as recovery token');
            setRecoveryToken(data.session.access_token);
            setTokenType('recovery');
            return;
          }
        } catch (sessionError) {
          console.log('Error checking session:', sessionError);
        }
        
        // Method 4: For compatibility with older Supabase versions or custom URLs
        // Check for specific URL patterns that might contain embedded tokens
        const urlPath = location.pathname;
        if (urlPath && urlPath.includes('/reset-password/')) {
          const pathParts = urlPath.split('/');
          const potentialToken = pathParts[pathParts.length - 1];
          
          if (potentialToken && potentialToken.length > 20) {
            console.log('Found token embedded in URL path');
            setRecoveryToken(potentialToken);
            setTokenType('recovery');
            return;
          }
        }
        
        // If we reach here, no token was found
        console.log('No valid token found in URL');
        setError('Invalid or missing password reset link. Please request a new one.');
      } catch (err) {
        console.log('Token extraction error:', err);
        setError('Failed to process the password reset link. Please request a new one.');
      }
    };
    
    extractToken();
  }, [location, searchParams]);

  return { recoveryToken, tokenType, error };
};

export default usePasswordResetToken;
