// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Search, Filter, Plus, Edit, Trash2, Users, Building, Settings, Database, Key, RefreshCw, Shield, Eye, EyeOff, Building2, ChevronRight, Copy } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { SystemPromptReader } from '@/components/admin/SystemPromptReader';
import { 
  getAllClientsWithStats,
  getAllUsersWithStats,
  getUserById,
  getSystemPrompts,
  updateSystemPrompt,
  getSystemAnalytics,
  getCurrentAdminLevel,
  isSystemAdmin,
  isAdmin,
  getUserApiKeys,
  createUserApiKey,
  deleteUserApiKey,
  toggleUserApiKey,
  getUserPreferences,
  getUserDashboardSettings,
  resetUserPreferences,
  changeUserClient,
  updateUserRole,
  createClient,
  updateClient,
  deleteClient,
  createUser,
  updateUser,
  deleteUser,
  type ClientWithStats,
  type UserWithStats,
  type SystemPrompt,
  type UserApiKey,
  type AdminLevel
} from '@/services/realAdminConsoleService';

interface AdminConsoleProps {
  adminLevel?: AdminLevel;
}

function RealAdminConsole({ adminLevel }: AdminConsoleProps) {
  const { t } = useTranslation(['common', 'pages']);
  
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentAdminLevel, setCurrentAdminLevel] = useState<AdminLevel>('user');
  
  // Data states
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [systemPrompts, setSystemPrompts] = useState<SystemPrompt[]>([]);
  const [analytics, setAnalytics] = useState({
    totalClients: 0,
    totalUsers: 0,
    totalProjects: 0,
    totalLeads: 0,
    activeLeads: 0,
    totalApiKeys: 0
  });

  // User management states
  const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState<any>(null);

  // Column definitions for data tables
  const clientColumns = [
    { key: 'name', label: 'Name', type: 'text' as const, editable: true },
    { 
      key: 'description', 
      label: 'Description', 
      type: 'textarea' as const, 
      editable: true,
      render: (value: any, row: any) => {
        if (!value || value.trim() === '') {
          return (
            <div className="text-sm text-muted-foreground italic">
              No system prompt set for this page
            </div>
          );
        }
        
        const truncatedValue = value.length > 100 ? value.substring(0, 100) + '...' : value;
        return (
          <div className="max-w-xs">
            <div className="text-sm overflow-hidden" style={{ 
              display: '-webkit-box', 
              WebkitLineClamp: 3, 
              WebkitBoxOrient: 'vertical',
              maxHeight: '4.5em'
            }}>
              {truncatedValue}
            </div>
          </div>
        );
      }
    },
    { key: 'client_status', label: 'Status', type: 'select' as const, editable: true, options: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] },
    { key: 'contact_email', label: 'Contact Email', type: 'email' as const, editable: true },
    { key: 'contact_phone', label: 'Contact Phone', type: 'text' as const, editable: true },
    { key: 'industry', label: 'Industry', type: 'text' as const, editable: true },
    { key: 'size', label: 'Size', type: 'select' as const, editable: true, options: ['Small', 'Medium', 'Large', 'Enterprise'] },
    { key: 'location', label: 'Location', type: 'text' as const, editable: true },
    { key: 'website', label: 'Website', type: 'text' as const, editable: true },
    { key: 'user_count', label: 'Users', type: 'text' as const, editable: false },
    { key: 'project_count', label: 'Projects', type: 'text' as const, editable: false },
    { key: 'lead_count', label: 'Leads', type: 'text' as const, editable: false },
    { key: 'active_leads', label: 'Active Leads', type: 'text' as const, editable: false },
    { key: 'created_at', label: 'Created', type: 'date' as const, editable: false },
    { key: 'id', label: 'ID', type: 'uuid' as const, editable: false }
  ];

  const userColumns = [
    { key: 'full_name', label: 'Name', type: 'text' as const, editable: true },
    { key: 'email', label: 'Email', type: 'email' as const, editable: true },
    { key: 'role', label: 'Role', type: 'select' as const, editable: true, options: ['user', 'admin', 'moderator'] },
    { key: 'admin_level', label: 'Admin Level', type: 'select' as const, editable: true, options: ['user', 'client_admin', 'system_admin'] },
    { key: 'status', label: 'Status', type: 'select' as const, editable: true, options: ['active', 'inactive', 'suspended'] },
    { key: 'phone', label: 'Phone', type: 'text' as const, editable: true },
    { key: 'department', label: 'Department', type: 'text' as const, editable: true },
    { key: 'position', label: 'Position', type: 'text' as const, editable: true },
    { key: 'client_name', label: 'Client', type: 'text' as const, editable: false },
    { key: 'last_login', label: 'Last Login', type: 'date' as const, editable: false },
    { key: 'created_at', label: 'Created', type: 'date' as const, editable: false },
    { key: 'id', label: 'ID', type: 'uuid' as const, editable: false }
  ];

  const { toast } = useToast();

  // Check admin level on mount
  useEffect(() => {
    const checkAdminLevel = async () => {
      try {
        // Always attempt to load data - don't block on admin level
        await loadData();
    } catch (error) {
        console.error('Error in admin console initialization:', error);
        toast({
          title: "Initialization Error", 
          description: "Failed to initialize admin console",
          variant: "destructive"
        });
      }
    };

    checkAdminLevel();
  }, []);

  // Load data based on admin level
  const loadData = async () => {
    
    setLoading(true);
    try {
      // Get admin level with fallback
      const adminLevel = await getCurrentAdminLevel();
      setCurrentAdminLevel(adminLevel || 'user');
      
      
      // Don't block if user level - still load analytics and prompts
      if (adminLevel === 'user') {
        console.log('WARNING  [AdminConsole] User level access - loading limited data');
      }
      
      // Load analytics and prompts regardless of admin level
      
      const [analyticsData, promptsData] = await Promise.all([
        getSystemAnalytics().catch((error) => {
          console.error('ERROR [AdminConsole] Analytics error:', error);
          return {
            totalClients: 0, totalUsers: 0, totalProjects: 0, 
            totalLeads: 0, activeLeads: 0, totalApiKeys: 0 
          };
        }),
        getSystemPrompts().catch((error) => {
          console.error('ERROR [AdminConsole] Prompts error:', error);
          return [];
        })
      ]);

      
      
      setAnalytics(analyticsData);
      setSystemPrompts(promptsData);

      // Load clients and users based on admin level
      if (adminLevel === 'system_admin') {
        
        try {
          const [clientsData, usersData] = await Promise.all([
            getAllClientsWithStats().catch((error) => {
              console.error('ERROR [AdminConsole] Clients error:', error);
              return [];
            }),
            getAllUsersWithStats().catch((error) => {
              console.error('ERROR [AdminConsole] Users error:', error);
              return [];
            })
          ]);
          
          
          
          setClients(clientsData);
          setUsers(usersData);
    } catch (error) {
          console.error('ERROR [AdminConsole] Error loading admin data:', error);
          // Don't fail completely - show what we can
          toast({
            title: "Partial Data Load",
            description: "Some admin data could not be loaded",
            variant: "destructive"
          });
        }
      } else if (adminLevel === 'client_admin') {
        
        try {
          const usersData = await getAllUsersWithStats().catch((error) => {
            console.error('ERROR [AdminConsole] Users error:', error);
            return [];
          });
          
          
          setUsers(usersData);
        } catch (error) {
          console.error('ERROR [AdminConsole] Error loading user data:', error);
          toast({
            title: "User Data Load Error",
            description: "Could not load user data",
            variant: "destructive"
          });
        }
      } else {
        console.log('ℹ️  [AdminConsole] Regular user - no clients/users data loaded');
      }
      
      console.log('COMPLETE [AdminConsole] Data loading complete');
    } catch (error) {
      console.error('ERROR [AdminConsole] Data load error:', error);
      toast({
        title: "Data Load Error",
        description: "Failed to load admin data. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load user API keys when user is selected
  useEffect(() => {
    if (selectedUserId) {
      loadUserApiKeys();
    }
  }, [selectedUserId]);

  const loadUserApiKeys = async () => {
    if (!selectedUserId) return;
    
    try {
      const keys = await getUserApiKeys(selectedUserId);
      setUserApiKeys(keys);
    } catch (error) {
      console.error('Error loading user API keys:', error);
      toast({
        title: "Error loading API keys",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // API Key management
  const handleCreateApiKey = async () => {
    if (!selectedUserId || !newApiKey.service_name || !newApiKey.key_name || !newApiKey.key_value) {
      toast({
        title: "Missing fields",
        description: "Please fill in all API key fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await createUserApiKey(selectedUserId, newApiKey);
      toast({
        title: "API key created",
        description: `${newApiKey.service_name} key added successfully`
      });
      setNewApiKey({ service_name: '', key_name: '', key_value: '' });
      loadUserApiKeys();
    } catch (error) {
      toast({
        title: "Error creating API key",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    try {
      await deleteUserApiKey(keyId);
      toast({
        title: "API key deleted",
        description: "API key removed successfully"
      });
      loadUserApiKeys();
    } catch (error) {
      toast({
        title: "Error deleting API key",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleToggleApiKey = async (keyId: string, isActive: boolean) => {
    try {
      await toggleUserApiKey(keyId, isActive);
      loadUserApiKeys();
    } catch (error) {
      toast({
        title: "Error updating API key",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleResetUserPreferences = async (userId: string) => {
    try {
      await resetUserPreferences(userId);
      toast({
        title: "Preferences reset",
        description: "User preferences have been reset to defaults"
      });
    } catch (error) {
      toast({
        title: "Error resetting preferences",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleChangeUserClient = async (userId: string, newClientId: string) => {
    try {
      await changeUserClient(userId, newClientId);
      toast({
        title: "User client changed",
        description: "User has been moved to the new client"
      });
      loadData(); // Refresh data
    } catch (error) {
      toast({
        title: "Error changing user client",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string, newAdminLevel?: AdminLevel) => {
    try {
      await updateUserRole(userId, newRole, newAdminLevel);
      toast({
        title: "User role updated",
        description: "User role has been successfully updated"
      });
      loadData(); // Refresh data
    } catch (error) {
      toast({
        title: "Error updating user role",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // System prompt management
  const handleUpdateSystemPrompt = async (projectId: string, updates: { name?: string; description?: string }) => {
    try {
      await updateSystemPrompt(projectId, updates);
      toast({
        title: "System prompt updated",
        description: "Project prompt configuration saved"
      });
      loadData(); // Refresh data
    } catch (error) {
      toast({
        title: "Error updating system prompt",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Filter functions
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    (selectedStatus === 'all' || client.client_status === selectedStatus)
  );

  const filteredUsers = users.filter(user => 
    (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedStatus === 'all' || user.status === selectedStatus)
  );

  // Debug filtering (only when data changes)
  useEffect(() => {
    // Load data when component mounts
    loadData();
  }, []);

  const filteredPrompts = systemPrompts.filter(prompt =>
    prompt.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
  return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Loading Admin Console...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
        </CardContent>
      </Card>
    );
  }

  // Don't block regular users completely - show what they can access
  if (currentAdminLevel === 'user') {
    return (
      <div className="space-y-6">
          <Card>
          <CardHeader>
            <CardTitle className="text-center">Limited Admin Access</CardTitle>
            <CardDescription className="text-center">
              You have limited admin privileges. Some features may not be available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Show overview and system prompts to regular users */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="system-prompts">System Prompts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                {/* Show analytics overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.totalClients}</div>
            </CardContent>
          </Card>
          <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.totalProjects}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.totalLeads}</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="system-prompts">
                <div className="space-y-4">
                  {systemPrompts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No system prompts available
                    </div>
                  ) : (
                    systemPrompts.map((prompt) => (
                      <Card key={prompt.id}>
                        <CardHeader>
                          <CardTitle className="text-sm">{prompt.project_name}</CardTitle>
                          <CardDescription>{prompt.client_name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground">
                            {prompt.prompt_content.substring(0, 200)}...
              </div>
            </CardContent>
          </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
                <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('common:admin.title', 'Admin Console')}</h2>
          <p className="text-muted-foreground">
            {currentAdminLevel === 'system_admin' ? t('common:admin.systemAdministratorDashboard') : t('common:admin.companyManagement')}
          </p>
                </div>
        <Badge variant={currentAdminLevel === 'system_admin' ? 'default' : 'secondary'}>
          {currentAdminLevel.replace('_', ' ').toUpperCase()}
        </Badge>
              </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {currentAdminLevel === 'system_admin' && <TabsTrigger value="companies">Companies</TabsTrigger>}
          {currentAdminLevel === 'system_admin' && <TabsTrigger value="clients">Clients</TabsTrigger>}
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="prompts">System Prompts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentAdminLevel === 'system_admin' && (
              <Card>
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clients Total</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalClients}</div>
                <p className="text-xs text-muted-foreground">{t('common:admin.activeCompanies')}</p>
            </CardContent>
          </Card>
            )}
          
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Users Total</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalUsers}</div>
                <p className="text-xs text-muted-foreground">{t('common:admin.registeredUsers')}</p>
            </CardContent>
          </Card>
          
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.activeLeads}</div>
                <p className="text-xs text-muted-foreground">
                  {t('common:admin.totalLeads', { total: analytics.totalLeads })}
                </p>
            </CardContent>
          </Card>
          
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Keys</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalApiKeys}</div>
                <p className="text-xs text-muted-foreground">{t('common:admin.activeIntegrations')}</p>
            </CardContent>
          </Card>
          
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects Total</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalProjects}</div>
                <p className="text-xs text-muted-foreground">{t('common:admin.activeProjects')}</p>
            </CardContent>
          </Card>
        </div>
        </TabsContent>

        {/* Clients Tab (System Admin Only) */}
        {currentAdminLevel === 'system_admin' && (
          <TabsContent value="clients" className="space-y-6">
            {console.log('SEARCH [AdminConsole] Rendering Clients tab')}
            <AdminDataTable
              title="Clients"
              data={clients}
              columns={clientColumns}
              onSave={updateClient}
              onDelete={deleteClient}
              onCreate={createClient}
              loading={loading}
              searchable={true}
              filterable={true}
              exportable={true}
              importable={true}
            />
          </TabsContent>
        )}

        {/* Companies Tab - Full company management */}
        {currentAdminLevel === 'system_admin' && (
        <TabsContent value="companies" className="space-y-6">
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Management
                </CardTitle>
                <CardDescription>
                  Manage all companies and their settings
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                  {clients.map((client) => (
                    <Card key={client.id}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold">{client.name}</h3>
                                <Badge variant={client.client_status === 'active' ? 'default' : 'secondary'}>
                                  {client.client_status}
                                </Badge>
                </div>
                              {/* Description hidden - now only shows in System Prompts tab */}
                            </div>
              </div>

                          <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                        <div>
                              <p className="text-sm font-medium">Users</p>
                              <p className="text-2xl font-bold">{client.user_count}</p>
                        </div>
                            <div>
                              <p className="text-sm font-medium">Projects</p>
                              <p className="text-2xl font-bold">{client.project_count}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Leads</p>
                              <p className="text-2xl font-bold">{client.lead_count}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Active Leads</p>
                              <p className="text-2xl font-bold text-green-600">{client.active_leads}</p>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-4">
                          <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Company
                          </Button>
                          <Button variant="outline" size="sm">
                              <Users className="h-4 w-4 mr-2" />
                              Manage Users
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-2" />
                              Settings
                          </Button>
                        </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
            </CardContent>
          </Card>
        </TabsContent>
        )}

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          {console.log('SEARCH [AdminConsole] Rendering Users tab')}
          <AdminDataTable
            title="Users"
            data={users}
            columns={userColumns}
            onSave={updateUser}
            onDelete={deleteUser}
            onCreate={createUser}
            loading={loading}
            searchable={true}
            filterable={true}
            exportable={true}
            importable={true}
          />

          {/* User Actions */}
          {selectedUserId && (
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  User Actions
                </CardTitle>
            </CardHeader>
              <CardContent className="space-y-4">
                {currentAdminLevel === 'system_admin' && (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleResetUserPreferences(selectedUserId)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset Preferences
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        // Handle change client - would open a dialog
                      }}
                    >
                      <Building className="h-4 w-4 mr-2" />
                      Change Client
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        // Handle change role - would open a dialog
                      }}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Change Role
                    </Button>
                  </>
                )}
            </CardContent>
          </Card>
          )}

          {/* API Keys Management */}
          {selectedUserId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Keys Management
                </CardTitle>
                <CardDescription>Manage user's API credentials and integrations</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Add New API Key */}
                <div className="border rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium mb-4">Add New API Key</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="service_name">Service Name</Label>
                      <Input
                        id="service_name"
                        placeholder="e.g., OpenAI, Calendly"
                        value={newApiKey.service_name}
                        onChange={(e) => setNewApiKey(prev => ({ ...prev, service_name: e.target.value }))}
                      />
                  </div>
                    <div>
                      <Label htmlFor="key_name">Key Name</Label>
                      <Input
                        id="key_name"
                        placeholder="e.g., API Key, Access Token"
                        value={newApiKey.key_name}
                        onChange={(e) => setNewApiKey(prev => ({ ...prev, key_name: e.target.value }))}
                      />
                  </div>
                    <div>
                      <Label htmlFor="key_value">Key Value</Label>
                      <Input
                        id="key_value"
                        type="password"
                        placeholder="Enter API key"
                        value={newApiKey.key_value}
                        onChange={(e) => setNewApiKey(prev => ({ ...prev, key_value: e.target.value }))}
                      />
                  </div>
                </div>
                  <Button className="mt-4" onClick={handleCreateApiKey}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add API Key
                  </Button>
                </div>

                {/* Existing API Keys */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Existing API Keys</h4>
                  {userApiKeys.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No API keys found for this user.</p>
                  ) : (
                    userApiKeys.map((key) => (
                      <Card key={key.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className="font-medium">{key.service_name}</h4>
                                <Badge variant={key.is_active ? 'default' : 'secondary'}>
                                  {key.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                  </div>
                              <p className="text-sm text-muted-foreground">{key.key_name}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {showApiKeys[key.id] ? atob(key.encrypted_key) : '••••••••••••••••'}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowApiKeys(prev => ({ ...prev, [key.id]: !prev[key.id] }))}
                                >
                                  {showApiKeys[key.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </Button>
                  </div>
                            </div>
                            <div className="flex gap-2">
                              <Switch
                                checked={key.is_active}
                                onCheckedChange={(checked) => handleToggleApiKey(key.id, checked)}
                              />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this API key? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteApiKey(key.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* System Prompts Tab */}
        <TabsContent value="prompts" className="space-y-6">
            <Card>
              <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Prompts Management
              </CardTitle>
              <CardDescription>
                Admin Access - System prompts derived from client descriptions
              </CardDescription>
              </CardHeader>
              <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search prompts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

                <div className="space-y-6">
                {/* Show clients as system prompts using the new reader */}
                {clients
                  .filter(client => 
                    client.description && 
                    client.description.trim() !== '' &&
                    (client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     client.description.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((client) => (
                    <div key={client.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-semibold">{client.name}</h3>
                          <Badge variant="default">Client System Prompt</Badge>
                          <Badge variant="outline">{client.client_status}</Badge>
                        </div>
                        
                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Industry: {client.industry || 'N/A'}</span>
                          <span>Size: {client.size || 'N/A'}</span>
                          <span>Users: {client.user_count || 0}</span>
                          <span>Projects: {client.project_count || 0}</span>
                        </div>
                      </div>
                      
                      <SystemPromptReader
                        systemPrompt={client.description}
                        clientName={client.name}
                        onEdit={() => {
                          // Handle edit - could open a dialog or navigate to edit page
                          const newPrompt = prompt('Edit system prompt:', client.description);
                          if (newPrompt !== null) {
                            updateClient(client.id, { description: newPrompt });
                          }
                        }}
                      />
                    </div>
                  ))}
                
                {/* Show message if no system prompts found */}
                {clients.filter(client => 
                  client.description && 
                  client.description.trim() !== '' &&
                  (client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   client.description.toLowerCase().includes(searchTerm.toLowerCase()))
                ).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No system prompts match your search.' : 'No system prompts available. Client descriptions are used as system prompts.'}
                  </div>
                )}
              </div>
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 

// Export both named and default for compatibility
export { RealAdminConsole };
export default RealAdminConsole; 