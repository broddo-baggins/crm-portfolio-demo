import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label'; // Unused import
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Unused imports
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator'; // This will need to be updated after PasswordStrengthIndicator is moved
import PasswordMatchIndicator from '@/components/auth/PasswordMatchIndicator'; // This will need to be updated after PasswordMatchIndicator is moved

interface PasswordResetFormProps {
  recoveryToken: string | null;
  onSuccess: () => void;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ recoveryToken, onSuccess }) => {
  // Form states
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  
  // UI states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Calculate password strength when password changes
  React.useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;
    
    // Contains number
    if (/[0-9]/.test(password)) strength += 1;
    
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    setPasswordStrength(strength);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    
    if (!recoveryToken) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (passwordStrength < 3) {
      setError('Please choose a stronger password with a mix of letters, numbers, and special characters.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Try to update password directly using the recovery token
      const { error: updateError } = await supabase.auth.updateUser({ 
        password
      });
      
      if (updateError) {
        // Fallback: Try setting the session first if we have an access token
        if (recoveryToken) {
          // Try to set the session using the token
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: recoveryToken,
            refresh_token: '', // We don't have a refresh token in recovery flow
          });
          
          if (sessionError) {
            throw new Error(sessionError.message || 'Invalid or expired recovery link');
          }
          
          // Now try updating the password again
          const { error: secondUpdateError } = await supabase.auth.updateUser({ 
            password 
          });
          
          if (secondUpdateError) {
            throw new Error(secondUpdateError.message);
          }
        } else {
          throw new Error(updateError.message);
        }
      }
      
      // Success!
      toast.success('Password has been updated successfully. You can now log in with your new password.');
      onSuccess();
      
      // Sign out to clear any temporary sessions
      await supabase.auth.signOut();
      
      // Navigate to login page after successful password reset (with a delay)
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            New Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your new password"
            autoComplete="new-password"
            disabled={isLoading}
          />
          <PasswordStrengthIndicator 
            password={password} 
            passwordStrength={passwordStrength} 
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm New Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm your new password"
            autoComplete="new-password"
            disabled={isLoading}
          />
          <PasswordMatchIndicator 
            password={password} 
            confirmPassword={confirmPassword} 
          />
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !recoveryToken}
        >
          {isLoading ? 'Updating Password...' : 'Reset Password'}
        </Button>
      </form>
    </>
  );
};

export default PasswordResetForm; 