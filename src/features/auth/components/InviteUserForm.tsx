import React, { useState } from 'react';
import { AuthFrame } from './AuthFrame';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { authService } from '@/lib/auth-service';

export default function InviteUserForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.inviteUser(email);
      
      if (response.success) {
        toast.success('Invitation sent successfully');
        setEmail('');
      } else {
        toast.error(response.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFrame>
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Invite User</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address to invite"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </form>
      </CardContent>
    </Card>
    </AuthFrame>
  );
} 