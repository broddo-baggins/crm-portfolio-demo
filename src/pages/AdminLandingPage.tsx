import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Building2, 
  Users, 
  Settings, 
  Database, 
  Activity,
  ArrowLeft,
  Crown,
  UserCog,
  Zap
} from 'lucide-react';

import { useAuth } from '@/context/ClientAuthContext';
import { useAdminAccess } from '@/hooks/useAdminAccess';

const AdminLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isSystemAdmin, isCompanyAdmin, isAdmin, permissions, companyAdminClients } = useAdminAccess();

  if (!isAdmin) {
    return (
      <div className="w-full max-w-4xl">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Access denied. You don't have administrator privileges.
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => navigate('/')} 
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
                      <h1 className="text-3xl font-bold tracking-tight">{t('admin.center.title', 'Admin Center')}</h1>
          <p className="text-muted-foreground mt-2">
            Welcome, {user?.email}. Choose your administrative area.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Admin Type Badge */}
      <div className="mb-8 flex items-center gap-2">
        {isSystemAdmin && (
          <Badge variant="destructive" className="mr-2">
            <Crown className="h-3 w-3 mr-1" />
            System Administrator
          </Badge>
        )}
        {isCompanyAdmin && (
          <Badge variant="secondary">
            <Building2 className="h-3 w-3 mr-1" />
            Company Administrator ({companyAdminClients.length} companies)
          </Badge>
        )}
        <Badge variant="outline" className="ml-auto">
          v1.0.5-EA
        </Badge>
      </div>

      {/* Admin Options - Centered Layout */}
      <div className="flex justify-center">
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
          
          {/* System Admin Console */}
          {isSystemAdmin && (
            <Card className="border-red-200 hover:border-red-300 transition-colors max-w-md mx-auto" data-testid="system-admin-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <Shield className="h-5 w-5" />
                  System Admin Console
                </CardTitle>
                <CardDescription>
                  Full platform administration and system management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    Database management and monitoring
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    User management across all clients
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    System logs and performance metrics
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Global system configuration
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700" 
                  onClick={() => navigate('/admin/console')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Access System Console
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Company Management */}
          {isCompanyAdmin && (
            <Card className="border-blue-200 hover:border-blue-300 transition-colors max-w-md mx-auto" data-testid="company-admin-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Building2 className="h-5 w-5" />
                  Company Management
                </CardTitle>
                <CardDescription>
                  Manage users and settings for your company
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <UserCog className="h-4 w-4 text-muted-foreground" />
                    Add and manage company users
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    Set user roles and permissions
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Company settings and preferences
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    Company activity and reports
                  </div>
                </div>

                {companyAdminClients.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-700 font-medium">
                      Managing {companyAdminClients.length} company{companyAdminClients.length > 1 ? 'ies' : 'y'}
                    </p>
                  </div>
                )}
                
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  onClick={() => navigate('/admin/company')}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Manage Company
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Permissions Overview */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Your Permissions
          </CardTitle>
          <CardDescription>
            What you can do with your current access level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {permissions.map((permission) => (
              <Badge key={permission} variant="outline" className="justify-start">
                {permission.replace(/_/g, ' ').replace(/:/g, ': ')}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLandingPage; 