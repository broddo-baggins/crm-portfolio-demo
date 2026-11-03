import React, { useState } from 'react';
import { AuthFrame } from './AuthFrame';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { authService } from '@/lib/auth-service';

export default function ChangeEmailForm() {
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.changeEmail(newEmail);
      
      if (response.success) {
        toast.success('Verification email sent to your new email address');
        setNewEmail('');
      } else {
        toast.error(response.error || 'Failed to change email');
      }
    } catch (error) {
      console.error('Error changing email:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFrame>
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Change Email Address</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newEmail">New Email Address</Label>
            <Input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter your new email"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Email'}
          </Button>
        </form>
      </CardContent>
    </Card>
    </AuthFrame>
  );
} 