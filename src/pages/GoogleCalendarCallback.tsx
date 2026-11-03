import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Calendar, ArrowRight } from 'lucide-react';
import { googleCalendarService } from '@/services/googleCalendarService';
import { toast } from 'sonner';

const GoogleCalendarCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          throw new Error(`OAuth error: ${errorParam}`);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        // Exchange code for tokens
        await googleCalendarService.exchangeCodeForToken(code, state);

        // Get user info
        const user = await googleCalendarService.getCurrentUser();
        setUserInfo(user);

        setStatus('success');
        toast.success('Successfully connected to Google Calendar!');

        // Redirect to calendar page after a short delay
        setTimeout(() => {
          navigate('/calendar?connected=google');
        }, 2000);

      } catch (error) {
        console.error('Google Calendar OAuth callback error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(errorMessage);
        setStatus('error');
        toast.error(`Failed to connect Google Calendar: ${errorMessage}`);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  const handleRetry = () => {
    navigate('/settings?tab=integrations');
  };

  const handleContinue = () => {
    navigate('/calendar?connected=google');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="text-center">
              <p className="text-muted-foreground">
                Connecting to Google Calendar...
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please wait while we set up your integration
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Success!</strong> Your Google Calendar has been connected successfully.
                </AlertDescription>
              </Alert>

              {userInfo && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Connected Account:</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {userInfo.name}</p>
                    <p><strong>Email:</strong> {userInfo.email}</p>
                    <p><strong>Timezone:</strong> {userInfo.timeZone}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  You can now view your Google Calendar events alongside your other meetings.
                </p>
                <p className="text-sm text-muted-foreground">
                  Redirecting to calendar page...
                </p>
              </div>

              <Button onClick={handleContinue} className="w-full">
                Continue to Calendar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Connection Failed:</strong> {error}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Don't worry, you can try connecting again from the Settings page.
                </p>
                <p className="text-sm text-muted-foreground">
                  Make sure you have the correct Google OAuth credentials configured.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleRetry}>
                  Try Again
                </Button>
                <Button onClick={() => navigate('/calendar')}>
                  Go to Calendar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleCalendarCallback; 