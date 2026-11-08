import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  Plus, 
  Settings, 
  Shield, 
  AlertTriangle,
  ArrowLeft,
  UserPlus,
  UserCheck,
  UserX,
  Mail,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/context/ClientAuthContext';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { getMockUsers } from '@/data/mockUsers';
import { supabase } from '@/lib/supabase';

interface CompanyUser {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  status: string;
  created_at: string;
  last_sign_in_at?: string;
}

interface ClientInfo {
  id: string;
  name: string;
  description?: string;
  member_role: string;
}

const CompanyManagement: React.FC = () => {
  const { t } = useTranslation(['pages', 'common']);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isCompanyAdmin, isSystemAdmin, companyAdminClients, isLoading } = useAdminAccess();

  const [activeTab, setActiveTab] = useState('users');
  const [companies, setCompanies] = useState<ClientInfo[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check access permissions
  useEffect(() => {
    if (!isLoading && !isCompanyAdmin && !isSystemAdmin) {
      toast.error('Access denied: Company admin rights required');
      navigate('/dashboard');
    }
  }, [isLoading, isCompanyAdmin, isSystemAdmin, navigate]);

  // Load companies where user has admin access
  useEffect(() => {
    const loadCompanies = async () => {
      if (!user || companyAdminClients.length === 0) return;

      try {
        setLoading(true);
        
        // Get companies where user is admin
        const { data: clientsData, error: clientsError } = await (supabase as any)
          .from('clients')
          .select('id, name, description')
          .in('id', companyAdminClients);

        if (clientsError) throw clientsError;

        // Get user's role in each company
        const { data: membershipsData, error: membershipsError } = await (supabase as any)
          .from('client_members')
          .select('client_id, role')
          .eq('user_id', user.id)
          .in('client_id', companyAdminClients);

        if (membershipsError) throw membershipsError;

        const companiesWithRoles = clientsData?.map((client: any) => {
          const membership = membershipsData?.find((m: any) => m.client_id === client.id);
          return {
            ...client,
            member_role: membership?.role || 'MEMBER'
          };
        }) || [];

        setCompanies(companiesWithRoles);
        
        // Auto-select first company
        if (companiesWithRoles.length > 0) {
          setSelectedCompany(companiesWithRoles[0].id);
        }

      } catch (err) {
        console.error('Error loading companies:', err);
        setError('Failed to load companies');
        toast.error('Failed to load companies');
      } finally {
        setLoading(false);
      }
    };

    if (isLoading) return;
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      // No clients table in the portfolio demo
      setCompanies([{ id: 'client-demo', name: 'CRM Portfolio Demo Company', description: 'Demo company', member_role: 'ADMIN' } as ClientInfo]);
      setSelectedCompany('client-demo');
      setLoading(false);
    } else if (companyAdminClients.length > 0) {
      loadCompanies();
    } else {
      // Nothing to load: show the "No Companies Found" state instead of spinning forever
      setLoading(false);
    }
  }, [user, companyAdminClients, isLoading]);

  // Load users for selected company
  useEffect(() => {
    const loadCompanyUsers = async () => {
      if (!selectedCompany || !user) return;

      if (import.meta.env.VITE_DEMO_MODE === 'true') {
        setCompanyUsers(
          getMockUsers()
            .filter((u) => u.clientId === selectedCompany)
            .map((u) => ({
              id: u.id,
              email: u.email,
              full_name: u.name ?? undefined,
              role: u.role,
              status: u.status.toLowerCase(),
              created_at: '2024-01-01T00:00:00Z',
              last_sign_in_at: undefined,
            })),
        );
        return;
      }

      try {
        // Get all users who are members of the selected company
        const { data: membersData, error: membersError } = await (supabase as any)
          .from('client_members')
          .select(`
            user_id,
            role,
            created_at,
            profiles (
              id,
              email,
              full_name,
              status
            )
          `)
          .eq('client_id', selectedCompany);

        if (membersError) throw membersError;

        // Get additional auth info for users
        const userIds = membersData?.map((m: any) => m.user_id) || [];
        
        let authUsers: any[] = [];
        if (userIds.length > 0) {
          // This would require service role access
          // For now, we'll work with profile data only
          authUsers = [];
        }

        const users: CompanyUser[] = membersData?.map((member: any) => ({
          id: member.user_id,
          email: member.profiles?.email || 'Unknown',
          full_name: member.profiles?.full_name,
          role: member.role,
          status: member.profiles?.status || 'active',
          created_at: member.created_at,
          last_sign_in_at: undefined // Would need auth data
        })) || [];

        setCompanyUsers(users);

      } catch (err) {
        console.error('Error loading company users:', err);
        toast.error('Failed to load company users');
      }
    };

    if (selectedCompany) {
      loadCompanyUsers();
    }
  }, [selectedCompany, user]);

  const handleInviteUser = () => {
    // TODO: Implement user invitation
    toast.info('Demo: invitations are not sent from the sample workspace');
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    if (!selectedCompany) return;

    try {
      const { error } = await (supabase as any)
        .from('client_members')
        .update({ role: newRole })
        .eq('client_id', selectedCompany)
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('User role updated successfully');
      
      // Refresh users list
      const updatedUsers = companyUsers.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      );
      setCompanyUsers(updatedUsers);

    } catch (err) {
      console.error('Error updating user role:', err);
      toast.error('Failed to update user role');
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!selectedCompany) return;
    
    const confirmed = window.confirm('Are you sure you want to remove this user from the company?');
    if (!confirmed) return;

    try {
      const { error } = await (supabase as any)
        .from('client_members')
        .delete()
        .eq('client_id', selectedCompany)
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('User removed from company');
      
      // Refresh users list
      setCompanyUsers(companyUsers.filter(u => u.id !== userId));

    } catch (err) {
      console.error('Error removing user:', err);
      toast.error('Failed to remove user');
    }
  };

  if (isLoading || loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading company management...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isCompanyAdmin && !isSystemAdmin) {
    return (
      <div className="w-full">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Access Denied:</strong> You need company admin rights to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6" data-testid="company-management-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              {t('pages.companyManagement.title', 'Company Management')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('pages.companyManagement.subtitle', 'Manage users and settings for your companies')}
            </p>
          </div>
        </div>
      </div>

      {/* Company Selector */}
      {companies.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('pages.companyManagement.selectCompany', 'Select Company')}</CardTitle>
            <CardDescription>{t('pages.companyManagement.selectCompanyDescription', 'Choose which company to manage')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((company) => (
                <Card 
                  key={company.id}
                  className={`cursor-pointer transition-colors ${
                    selectedCompany === company.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCompany(company.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{company.name}</h3>
                        {company.description && (
                          <p className="text-sm text-muted-foreground">{company.description}</p>
                        )}
                      </div>
                      <Badge variant={company.member_role === 'OWNER' ? 'default' : 'secondary'}>
                        {company.member_role}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Company */}
      {selectedCompany && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {companies.find(c => c.id === selectedCompany)?.name || t('pages.companyManagement.company', 'Company')}
                  </CardTitle>
                  <CardDescription>
                    {t('pages.companyManagement.managingUsers', 'Managing {{count}} users', { count: companyUsers.length })}
                  </CardDescription>
                </div>
                <Button onClick={handleInviteUser} className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  {t('pages.companyManagement.inviteUser', 'Invite User')}
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Management Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('pages.companyManagement.users', 'Users')}
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t('pages.companyManagement.settings', 'Settings')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('pages.companyManagement.companyUsers', 'Company Users')}</CardTitle>
                  <CardDescription>
                    {t('pages.companyManagement.companyUsersDescription', 'Manage users who have access to this company')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {companyUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">{t('pages.companyManagement.noUsersFound', 'No users found')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {companyUsers.map((user) => (
                        <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 p-4 border rounded-lg">
                          {/* Wraps on phones: the long email pushed the role buttons off-screen */}
                          <div className="flex min-w-0 items-center gap-4">
                            <div className="w-10 h-10 shrink-0 bg-gray-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="min-w-0 break-words">
                              <h3 className="font-semibold">{user.full_name || user.email}</h3>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={user.role === 'OWNER' ? 'default' : 'secondary'}>
                                  {user.role}
                                </Badge>
                                <Badge variant={user.status === 'active' ? 'outline' : 'destructive'}>
                                  {user.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {user.role !== 'OWNER' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateUserRole(
                                    user.id, 
                                    user.role === 'ADMIN' ? 'MEMBER' : 'ADMIN'
                                  )}
                                >
                                  {user.role === 'ADMIN' ? 'Make Member' : 'Make Admin'}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveUser(user.id)}
                                  className="text-red-600 hover:text-red-700"
                                  aria-label={`Remove ${user.full_name || user.email}`}
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('pages.companyManagement.companySettings', 'Company Settings')}</CardTitle>
                  <CardDescription>
                    {t('pages.companyManagement.companySettingsDescription', 'Configure company-wide settings and preferences')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Settings className="h-4 w-4" />
                    <AlertDescription>
                      Company profile, billing and integration settings are not part of the sample workspace.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* No Companies */}
      {companies.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('pages.companyManagement.noCompaniesFound', 'No Companies Found')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('pages.companyManagement.noCompaniesDescription', 'You don\'t have admin access to any companies yet.')}
            </p>
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              {t('pages.companyManagement.returnToDashboard', 'Return to Dashboard')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompanyManagement; 