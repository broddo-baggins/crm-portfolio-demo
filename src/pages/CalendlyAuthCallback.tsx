/**
 * Calendly OAuth Callback Handler
 * DEMO MODE: This page handles the redirect from Calendly OAuth flow
 * In demo mode, this is a placeholder as no real OAuth is performed
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';

const CalendlyAuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // DEMO MODE: No real OAuth processing
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      console.log('DEMO [DEMO MODE] Calendly callback skipped (demo mode)');
      // Redirect to calendar page
      setTimeout(() => {
        navigate('/calendar', { replace: true });
      }, 1000);
      return;
    }

    // In production, this would:
    // 1. Extract the authorization code from URL params
    // 2. Exchange it for access tokens
    // 3. Store tokens securely
    // 4. Redirect to calendar page

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      console.warn('Calendly OAuth error:', error);
      navigate('/calendar?auth_error=' + error, { replace: true });
      return;
    }

    if (code) {
      // In production, exchange code for tokens
      console.log('Calendly OAuth code received:', code);
      // Redirect to calendar
      navigate('/calendar?auth_success=true', { replace: true });
    } else {
      // No code, redirect to calendar
      navigate('/calendar', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Connecting to Calendly...
        </h2>
        <p className="text-gray-600">
          Please wait while we complete the authentication.
        </p>
      </div>
    </div>
  );
};

export default CalendlyAuthCallback;
