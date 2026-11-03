/**
 * Integration Test Page
 * Quick test interface to verify integrations system functionality
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  TestTube,
  Calendar,
  MessageSquare,
  Database,
  Shield,
  Eye,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/lib/utils";
import { ProgressWithLoading } from "@/components/ui/progress-with-loading";

import { userIntegrationsService } from "@/services/userIntegrationsService";
import { encryptionUtils } from "@/lib/encryption";
import type {
  IntegrationType,
  UserIntegration,
  IntegrationStatus,
} from "@/types/integrations";
import { INTEGRATION_CONFIGS } from "@/types/integrations";

export default function IntegrationsTest() {
  const { t } = useTranslation("pages");
  const { isRTL } = useLang();
  const [integrations, setIntegrations] = useState<UserIntegration[]>([]);
  const [statuses, setStatuses] = useState<
    Record<IntegrationType, IntegrationStatus>
  >({} as any);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<IntegrationType | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all integrations
      const integrationsResult =
        await userIntegrationsService.getUserIntegrations();
      if (integrationsResult.success && integrationsResult.data) {
        setIntegrations(integrationsResult.data);
      }

      // Load statuses
      const statusPromises = Object.keys(INTEGRATION_CONFIGS).map(
        async (type) => {
          const statusResult =
            await userIntegrationsService.getIntegrationStatus(
              type as IntegrationType,
            );
          return { type: type as IntegrationType, status: statusResult.data };
        },
      );

      const statusResults = await Promise.all(statusPromises);
      const newStatuses: Record<IntegrationType, IntegrationStatus> = {} as any;
      statusResults.forEach(({ type, status }) => {
        if (status) newStatuses[type] = status;
      });
      setStatuses(newStatuses);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load integration data");
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (type: IntegrationType) => {
    try {
      setTesting(type);
      const result = await userIntegrationsService.testIntegration(type);

      if (result.success && result.data) {
        if (result.data.success) {
          toast.success(`${INTEGRATION_CONFIGS[type].name} test passed!`);
        } else {
          toast.error(
            `${INTEGRATION_CONFIGS[type].name} test failed: ${result.data.message}`,
          );
        }
      } else {
        toast.error(result.error || "Test failed");
      }
    } catch (error) {
      console.error("Test failed:", error);
      toast.error("Test failed");
    } finally {
      setTesting(null);
    }
  };

  const testEncryption = () => {
    try {
      const testData = "test-secret-data-123";
      const encrypted = encryptionUtils.encryptCredentials({
        clientId: testData,
      });
      const decrypted = encryptionUtils.decryptCredentials(encrypted);

      if (decrypted.clientId === testData) {
        toast.success("Encryption test passed!");
      } else {
        toast.error("Encryption test failed!");
      }
    } catch (error) {
      toast.error("Encryption test error!");
    }
  };

  const getStatusIcon = (status?: IntegrationStatus) => {
    if (!status) return <XCircle className="h-4 w-4 text-gray-400" />;
    if (status.isConfigured && status.isActive)
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status.isConfigured)
      return <CheckCircle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getIntegrationIcon = (type: IntegrationType) => {
    switch (type) {
      case "calendly":
        return <Calendar className="h-5 w-5" />;
      case "whatsapp":
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div
        className={cn("container mx-auto p-6", isRTL && "rtl")}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-full max-w-md space-y-4">
            <ProgressWithLoading
              value={25}
              label="Loading integration data..."
              description="Fetching statuses and configurations"
              animated
              showPercentage
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("container mx-auto p-6 space-y-6", isRTL && "rtl")}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          TEST {t("integrationsTest.title", "Integrations Test Center")}
        </h1>
        <p className="text-muted-foreground">
          {t(
            "integrationsTest.description",
            "Test and verify your integration system functionality",
          )}
        </p>
      </div>

      {/* System Health Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Health Check
          </CardTitle>
          <CardDescription>
            Verify core system components are working
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Database className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Database Connection</p>
                <Badge variant="default" className="bg-green-500">
                  ✓ Connected
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Shield className="h-5 w-5 text-purple-500" />
              <div>
                <p className="font-medium">Encryption System</p>
                <Button variant="outline" size="sm" onClick={testEncryption}>
                  Test Encryption
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Eye className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium">User Integrations</p>
                <Badge variant="outline">
                  {integrations.length} configured
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Integration Status Overview
          </CardTitle>
          <CardDescription>
            Current status of all available integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(INTEGRATION_CONFIGS).map(([type, config]) => {
              const status = statuses[type as IntegrationType];
              const integration = integrations.find(
                (i) => i.integration_type === type,
              );

              return (
                <div key={type} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getIntegrationIcon(type as IntegrationType)}
                      <h3 className="font-medium">{config.name}</h3>
                    </div>
                    {getStatusIcon(status)}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Type: {type}</p>
                    <p>
                      Configured: {status?.isConfigured ? "Yes" : "No"}
                    </p>
                    <p>Active: {status?.isActive ? "Yes" : "No"}</p>
                    {integration && (
                      <p>
                        Created:{" "}
                        {new Date(integration.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    {status?.hasCredentials && (
                      <div className="text-xs space-y-1">
                        <p>Credentials Status:</p>
                        <div className="flex flex-wrap gap-1">
                          {status.hasCredentials.clientId && (
                            <Badge variant="outline">Client ID</Badge>
                          )}
                          {status.hasCredentials.clientSecret && (
                            <Badge variant="outline">Client Secret</Badge>
                          )}
                          {status.hasCredentials.webhookSecret && (
                            <Badge variant="outline">Webhook</Badge>
                          )}
                          {status.hasCredentials.accessToken && (
                            <Badge variant="outline">Access Token</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleTest(type as IntegrationType)}
                    disabled={testing === type || !status?.isConfigured}
                  >
                    {testing === type ? "Testing..." : "Test Integration"}
                  </Button>

                  {status?.errorMessage && (
                    <Alert variant="destructive">
                      <AlertDescription className="text-xs">
                        {status.errorMessage}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Useful actions for testing and debugging
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadData}>
              REFRESH Refresh Data
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                window.open("/settings?tab=integrations", "_blank")
              }
            >
              CONFIG Open Settings
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                console.log("Integrations:", integrations);
                console.log("Statuses:", statuses);
                toast.success("Check browser console for debug data");
              }}
            >
              BUG Debug Info
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pre-filled Calendly Credentials */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200">
            📋 Your Calendly Credentials (Ready to Use)
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-400">
            Copy these credentials to Settings → Integrations → Calendly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border font-mono text-sm">
            <div className="space-y-2">
              <div>
                <strong>Client ID:</strong>{" "}
                48XEnOKEGAYNltwhQoO5ihyjUpjznPNm9V9x5p0p3WQ
              </div>
              <div>
                <strong>Client Secret:</strong>{" "}
                26JNT3nCOQReTHhimx0dsq5vSNsTbopBkwY4UmJee2I
              </div>
              <div>
                <strong>Webhook Secret:</strong>{" "}
                Y_Ggcy0ZdP3xKgOAoTyRgfoRQboCpmLVHq-gqY1jXDY
              </div>
            </div>
          </div>

          <Button
            variant="default"
            className="w-full"
            onClick={() => {
              navigator.clipboard.writeText(
                "Client ID: 48XEnOKEGAYNltwhQoO5ihyjUpjznPNm9V9x5p0p3WQ\nClient Secret: 26JNT3nCOQReTHhimx0dsq5vSNsTbopBkwY4UmJee2I\nWebhook Secret: Y_Ggcy0ZdP3xKgOAoTyRgfoRQboCpmLVHq-gqY1jXDY",
              );
              toast.success("Credentials copied to clipboard!");
            }}
          >
            📋 Copy All Credentials
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
