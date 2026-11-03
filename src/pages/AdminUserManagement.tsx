import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  UserPlus, 
  Users, 
  Trash2, 
  Search, 
  Mail,
  Shield,
  Building,
  FolderOpen,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getMockUsers } from '@/data/mockUsers';

// The user-management edge function doesn't exist in the portfolio demo
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  status: string;
  created_at: string;
  last_sign_in_at?: string;
  user_metadata?: any;
}

interface CreateUserData {
  email: string;
  name: string;
  role: 'STAFF' | 'ADMIN' | 'SUPER_ADMIN';
  client_name: string;
  send_invitation: boolean;
  create_demo_project: boolean;
  temporary_password?: string;
}

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null); // Track which user is being deleted
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  
  const [createUserData, setCreateUserData] = useState<CreateUserData>({
    email: '',
    name: '',
    role: 'STAFF',
    client_name: '',
    send_invitation: true,
    create_demo_project: true,
    temporary_password: ''
  });

  // Generate secure password
  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()';
    
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    const allChars = uppercase + lowercase + numbers + symbols;
    for (let i = password.length; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    const shuffled = password.split('').sort(() => Math.random() - 0.5).join('');
    setGeneratedPassword(shuffled);
    setCreateUserData(prev => ({ ...prev, temporary_password: shuffled }));
  };

  // Copy password to clipboard
  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      toast.success('Password copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy password');
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    if (isDemoMode) {
      setUsers(
        getMockUsers().map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name ?? undefined,
          role: u.role,
          status: u.status,
          created_at: '2024-01-01T00:00:00Z',
        })),
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/functions/v1/user-management', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setUsers(result.users || []);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Create user
  const createUser = async () => {
    if (!createUserData.email) {
      toast.error('Email is required');
      return;
    }

    if (isDemoMode) {
      setUsers((prev) => [
        {
          id: `demo-${Date.now()}`,
          email: createUserData.email,
          name: createUserData.name || undefined,
          role: createUserData.role,
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      toast.success(`Demo mode: ${createUserData.email} added locally (no invitation sent)`);
      setIsCreateDialogOpen(false);
      return;
    }

    setCreateLoading(true);
    try {
      const response = await fetch('/functions/v1/user-management', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createUserData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        setIsCreateDialogOpen(false);
        setCreateUserData({
          email: '',
          name: '',
          role: 'STAFF',
          client_name: '',
          send_invitation: true,
          create_demo_project: true,
          temporary_password: ''
        });
        setGeneratedPassword('');
        fetchUsers(); // Refresh the list
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error(`Failed to create user: ${error.message}`);
    } finally {
      setCreateLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user: ${email}?`)) {
      return;
    }

    if (isDemoMode) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success('Demo mode: user removed locally');
      return;
    }

    setDeleteLoading(userId);
    try {
      const response = await fetch(`/functions/v1/user-management?user_id=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      if (result.success) {
        toast.success('User deleted successfully');
        fetchUsers(); // Refresh the list
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error(`Failed to delete user: ${error.message}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!createUserData.temporary_password && !createUserData.send_invitation) {
      generatePassword();
    }
  }, [createUserData.send_invitation]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage user accounts for your organization
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@company.com"
                  value={createUserData.email}
                  onChange={(e) => setCreateUserData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={createUserData.name}
                  onChange={(e) => setCreateUserData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={createUserData.role} 
                  onValueChange={(value) => setCreateUserData(prev => ({ ...prev, role: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_name">Organization Name</Label>
                <Input
                  id="client_name"
                  placeholder="Company Inc. (optional)"
                  value={createUserData.client_name}
                  onChange={(e) => setCreateUserData(prev => ({ ...prev, client_name: e.target.value }))}
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty to use "Self-Serve" organization
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="send_invitation"
                    checked={createUserData.send_invitation}
                    onCheckedChange={(checked) => 
                      setCreateUserData(prev => ({ ...prev, send_invitation: !!checked }))
                    }
                  />
                  <Label htmlFor="send_invitation" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Send invitation email
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create_demo_project"
                    checked={createUserData.create_demo_project}
                    onCheckedChange={(checked) => 
                      setCreateUserData(prev => ({ ...prev, create_demo_project: !!checked }))
                    }
                  />
                  <Label htmlFor="create_demo_project" className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Create demo project
                  </Label>
                </div>
              </div>

              {!createUserData.send_invitation && (
                <div className="space-y-2">
                  <Label htmlFor="password">Temporary Password</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={createUserData.temporary_password}
                        onChange={(e) => setCreateUserData(prev => ({ ...prev, temporary_password: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generatePassword}
                      title="Generate password"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    {generatedPassword && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={copyPassword}
                        title="Copy password"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={createLoading}
                >
                  Cancel
                </Button>
                <Button onClick={createUser} disabled={createLoading}>
                  {createLoading ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by email, name, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Building className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Staff</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'STAFF').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No users found' : 'No users yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Create your first user to get started'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="flex flex-wrap items-center justify-between gap-3 p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="w-10 h-10 shrink-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 break-words">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{user.name || user.email.split('@')[0]}</p>
                        <Badge variant={
                          user.role === 'SUPER_ADMIN' ? 'destructive' : 
                          user.role === 'ADMIN' ? 'default' : 
                          'secondary'
                        }>
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(user.created_at).toLocaleDateString()}
                        {user.last_sign_in_at && (
                          <span className="ml-3">
                            Last login: {new Date(user.last_sign_in_at).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteUser(user.id, user.email)}
                      disabled={deleteLoading === user.id}
                      title="Delete user"
                      aria-label={`Delete ${user.email}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserManagement; 