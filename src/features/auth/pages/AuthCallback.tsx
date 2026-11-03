import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '@/lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback handling started', {
          url: window.location.href,
          hash: window.location.hash,
          search: window.location.search
        });
        
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const code = urlParams.get('code');
        
        if (code) {
          console.log('Found code in query params, exchanging for session');
          
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            throw error;
          }
          
          console.log('Successfully exchanged code for session');
          navigate('/dashboard', { replace: true });
          return;
        }
        
        // Check for access token in hash (older OAuth flow)
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken) {
          console.log('Found access_token in hash, processing...');
          
          if (accessToken && refreshToken) {
            console.log('Setting session manually with tokens from hash');
            
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (error) {
              throw error;
            }
            
            navigate('/dashboard', { replace: true });
            return;
          }
        }
        
        // If no auth parameters found, redirect to login
        navigate('/auth/login', { replace: true });
        
      } catch (err: any) {
        console.error('Auth callback error:', err);
        navigate('/auth/login?error=callback_failed', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback; 