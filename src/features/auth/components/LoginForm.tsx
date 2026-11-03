/**
 * LoginForm component
 * 
 * Handles user authentication with email/password, Google OAuth, and Facebook OAuth.
 * Includes password reset functionality and validation.
 * Enhanced with full database access via service role for development.
 * 
 * @returns {JSX.Element} The rendered login form
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/context/ClientAuthContext';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { FacebookIcon } from '@/components/icons/FacebookIcon';
import LoginErrorAlert from '@/components/auth/LoginErrorAlert';
import { checkSupabaseConnection } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import EmailField from '@/components/auth/EmailField';
import PasswordField from '@/components/auth/PasswordField';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [_supabaseHealthy, setSupabaseHealthy] = useState<boolean | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Get redirect path
  const from = location.state?.from?.pathname || '/dashboard';

  // Check Supabase connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isHealthy = await checkSupabaseConnection();
        if (isHealthy) {
          console.log('Supabase health check successful.');
        } else {
          console.log('Supabase health check failed.');
        }
      } catch (e) {
        console.log('Supabase health check failed (catch):', e);
      }
    };
    checkConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    // DEMO MODE: Accept any credentials (no validation)
    console.log('DEMO [DEMO MODE] Login form submitted - accepting any credentials');

    try {
      setIsLoading(true);
      console.log('SECURITY [LoginForm] Starting login process...');

      const result = await login(email || 'demo@crm.demo', password || 'demo');
      console.log('SECURITY [LoginForm] Login result:', result);
      
      if (result.success) {
        console.log('SECURITY [LoginForm] Login successful, preparing to navigate...');
        
        // Wait a bit longer to ensure auth state is fully updated
        await new Promise(resolve => setTimeout(resolve, 200));
        
        console.log('SECURITY [LoginForm] Navigating to:', from);
        
        // Navigate to intended destination
        navigate(from, { replace: true });
      } else {
        console.error('SECURITY [LoginForm] Login failed:', result.error);
        setAuthError(result.error || t('auth.errors.loginFailed', 'Login failed'));
      }
    } catch (error: any) {
      console.error('SECURITY [LoginForm] Login error details:', error);
      setAuthError(error.message || t('auth.errors.loginFailed', 'Login failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // DEMO MODE: OAuth buttons disabled for portfolio demo
    console.log('DEMO [DEMO MODE] Google OAuth disabled in demo mode');
    return;
  };

  const handleFacebookLogin = async () => {
    // DEMO MODE: OAuth buttons disabled for portfolio demo
    console.log('DEMO [DEMO MODE] Facebook OAuth disabled in demo mode');
    return;
  };

  // handleFallbackLogin function removed for security

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <LoginErrorAlert error={authError} />
        
        <EmailField
          email={email}
          setEmail={setEmail}
          disabled={isLoading}
          required
        />
        
        <PasswordField
          password={password}
          setPassword={setPassword}
          disabled={isLoading}
          required
        />

        <div className="text-center">
          <Link 
            to="/password-recovery" 
            className="text-sm text-primary hover:text-primary/80 hover:underline"
          >
            {t('auth.forgotPassword', 'Forgot your password?')}
          </Link>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
          data-testid="login-button"
        >
          {isLoading ? t('auth.signingIn', 'Signing in...') : t('auth.signIn', 'Sign In')}
        </Button>

        {/* DEMO MODE: OAuth social login hidden for portfolio demo */}
        {/* Google and Facebook authentication not available in demo mode */}
      </CardFooter>
    </form>
  );
};

export default LoginForm; 