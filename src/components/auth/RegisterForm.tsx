import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AUTH_MESSAGES } from '@/constants/messages';

interface RegisterFormProps {
  onCancel?: () => void;
}

export const RegisterForm = ({ onCancel }: RegisterFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Register user with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`.trim(),
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');
        
      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
          role: 'user'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't throw here - user is created, profile can be created later
      }

      toast.success(AUTH_MESSAGES.REGISTER_SUCCESS);
      navigate('/dashboard');
      
    } catch (error: unknown) {
      console.error('Registration error:', error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('duplicate key value')) {
        toast.error('This email is already registered');
      } else if (errorMessage.includes('weak password')) {
        toast.error('Password is too weak');
      } else if (errorMessage.includes('invalid email')) {
        toast.error('Please enter a valid email address');
      } else {
        toast.error(errorMessage || AUTH_MESSAGES.REGISTER_FAILED);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
          disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
          disabled={isLoading}
            />
        </div>
        
        <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
          <Input
          id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
          <Input
          id="password"
          type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
          disabled={isLoading}
              minLength={8}
        />
        </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
