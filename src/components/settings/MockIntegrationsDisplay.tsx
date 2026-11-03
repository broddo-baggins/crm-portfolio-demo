/**
 * Mock Integrations Display
 * 
 * Shows fake integrations for portfolio demo
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  ExternalLink,
  Info
} from 'lucide-react';
import { mockIntegrations, getIntegrationStats } from '@/data/mockIntegrations';
import { cn } from '@/lib/utils';

export const MockIntegrationsDisplay: React.FC = () => {
  const stats = getIntegrationStats();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Notice */}
      <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/30">
        <Info className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-900 dark:text-orange-200">
          <strong>Portfolio Demo:</strong> These integrations show what would be connected in production. 
          All data is mocked for demonstration purposes.
        </AlertDescription>
      </Alert>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Integrations</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Connected</div>
            <div className="text-2xl font-bold text-green-600">{stats.connected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Disconnected</div>
            <div className="text-2xl font-bold text-gray-600">{stats.disconnected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Connection Rate</div>
            <div className="text-2xl font-bold text-blue-600">{stats.connectionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockIntegrations.map((integration) => (
          <Card key={integration.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{integration.icon}</div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription className="text-xs capitalize">
                      {integration.type}
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn("flex items-center gap-1", getStatusColor(integration.status))}
                >
                  {getStatusIcon(integration.status)}
                  <span className="capitalize">{integration.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{integration.description}</p>

              {/* Metrics */}
              {integration.metrics && integration.metrics.length > 0 && (
                <div className="grid grid-cols-3 gap-2 p-3 bg-muted/50 rounded-lg">
                  {integration.metrics.map((metric, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-xs text-muted-foreground">{metric.label}</div>
                      <div className="text-sm font-semibold">{metric.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Last Sync */}
              {integration.lastSync && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Last synced: {new Date(integration.lastSync).toLocaleString()}
                </div>
              )}

              {/* Features */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">Features:</div>
                <div className="flex flex-wrap gap-1">
                  {integration.features.slice(0, 3).map((feature, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {integration.features.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{integration.features.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={integration.status === 'connected' ? 'outline' : 'default'}
                  className="flex-1"
                  disabled
                >
                  {integration.status === 'connected' ? (
                    <>
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </>
                  ) : (
                    'Connect (Demo)'
                  )}
                </Button>
                {integration.status === 'connected' && (
                  <Button size="sm" variant="ghost" disabled aria-label={`Sync ${integration.name}`}>
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Connected Date */}
              <div className="text-xs text-muted-foreground">
                {integration.status === 'connected' ? 'Connected' : 'Last connected'}: {new Date(integration.connectedDate).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> Supabase and HubSpot are currently disconnected as this is a demo environment. 
          In production, these would be active with full Row Level Security (RLS) and real-time sync.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default MockIntegrationsDisplay;

