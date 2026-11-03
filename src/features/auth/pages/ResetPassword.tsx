import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AuthFrame } from '../components/AuthFrame';
import { LoadingState } from '@/components/system/States';

// A missing, expired or invalid link can't be fixed here: send the visitor to
// request a new one rather than to a sign-in they can't complete.
const RECOVERY_PATH = '/auth/password-recovery';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token') ?? searchParams.get('token_hash');
    if (!token) {
      toast.error('That reset link is incomplete. Request a new one below.');
      navigate(RECOVERY_PATH, { replace: true });
      return;
    }

    // Verify the token is valid
    const verifyToken = async () => {
      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'recovery'
        });

        if (error) {
          toast.error('That reset link is invalid or has expired. Request a new one below.');
          navigate(RECOVERY_PATH, { replace: true });
          return;
        }

        setIsValidToken(true);
      } catch (error) {
        console.warn('Error verifying token:', error);
        toast.error('We could not check that reset link. Request a new one below.');
        navigate(RECOVERY_PATH, { replace: true });
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      toast.success('Password has been reset successfully');
      navigate('/auth/login');
    } catch (error) {
      console.warn('Error resetting password:', error);
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFrame>
      {!isValidToken ? (
        <LoadingState rows={2} label="Checking your reset link…" />
      ) : (
        <Card className="w-full" data-testid="reset-password-page">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Choose a new password</CardTitle>
            <CardDescription>Use at least 8 characters.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  minLength={8}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </AuthFrame>
  );
}
