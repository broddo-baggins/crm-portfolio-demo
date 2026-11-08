import React from 'react';
import { Navigate } from 'react-router';
import SystemAdminConsole from '@/components/admin/SystemAdminConsole';
import { useAuth } from '@/context/ClientAuthContext';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, RefreshCw, AlertTriangle } from 'lucide-react';
import { ProgressWithLoading } from '@/components/ui/progress-with-loading';

export default function AdminConsolePage() {
  const { user } = useAuth();
  const { isAdmin, isLoading, permissions, error } = useAdminAccess();

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-64">
          <div className="w-full max-w-md space-y-4">
            <ProgressWithLoading
              value={35}
              label="Verifying admin access..."
              description="Checking permissions and system access"
              animated
              showPercentage
            />
          </div>
        </div>
      </div>
    );
  }

  // Show error if there's an access check error
  if (error) {
    return (
      <div className="w-full">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Access Check Failed:</strong> {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show access denied for non-admin users
  if (!isAdmin) {
    return (
      <div className="w-full">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Shield className="w-5 h-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-red-200 bg-red-50">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Administrator privileges required.</strong>
                <div className="mt-4 space-y-2 text-sm">
                  <div>Current user: <code>{user.email}</code></div>
                  <div>Role: <code>{user.user_metadata?.role || 'user'}</code></div>
                  <div>Permissions: <code>{permissions.length} granted</code></div>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Need admin access?</strong> Contact your system administrator to grant admin privileges to your account.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render admin console for admin users
  return (
    <div className="w-full" data-testid="admin-console-page">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-600" />
              Admin Console
            </h1>
            <p className="text-gray-600 mt-1">
              System administration and management tools
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              Logged in as: <span className="font-medium">{user.email}</span>
            </div>
            <div className="text-sm text-gray-500">
              Permissions: <span className="font-medium">{permissions.length} granted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <Alert className="mb-6 border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Administrator Console:</strong> You have elevated privileges. 
          Please use these tools responsibly and ensure you understand the impact of your actions.
        </AlertDescription>
      </Alert>

      {/* System Admin Console Component */}
      <SystemAdminConsole />
    </div>
  );
} 