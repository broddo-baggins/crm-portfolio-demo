import React, { useState } from 'react';
import { AuthFrame } from './AuthFrame';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { authService } from '@/lib/auth-service';

interface ReauthenticateFormProps {
  onSuccess?: () => void;
}

export default function ReauthenticateForm({ onSuccess }: ReauthenticateFormProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.reauthenticate(password);
      
      if (response.success) {
        toast.success('Reauthentication successful');
        onSuccess?.();
      } else {
        toast.error(response.error || 'Failed to reauthenticate');
      }
    } catch (error) {
      console.error('Error reauthenticating:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFrame>
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Reauthentication Required</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Current Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your current password"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
    </AuthFrame>
  );
} 