import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Settings,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Copy,
  Phone,
  Shield,
  Zap,
  ArrowRight,
  Key,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { env } from '@/config/env';
import WhatsAppDiagnosticTool from '@/components/whatsapp/WhatsAppDiagnosticTool';

const WhatsAppSetup: React.FC = () => {
  const { t } = useTranslation();
  const [setupStep, setSetupStep] = useState(0);

  const setupSteps = [
    {
      title: "Meta Business Manager Setup",
      description: "Create and configure your Meta Business Manager account",
      icon: <Globe className="h-5 w-5" />,
      status: env.WHATSAPP_BUSINESS_ID ? 'completed' : 'pending'
    },
    {
      title: "WhatsApp Business API Access",
      description: "Request and configure WhatsApp Business API access",
      icon: <MessageSquare className="h-5 w-5" />,
      status: env.WHATSAPP_ACCESS_TOKEN && !env.WHATSAPP_ACCESS_TOKEN.includes('your_') ? 'completed' : 'pending'
    },
    {
      title: "Phone Number Approval",
      description: "Get your phone number approved for messaging",
      icon: <Phone className="h-5 w-5" />,
      status: env.WHATSAPP_PHONE_NUMBER_ID && !env.WHATSAPP_PHONE_NUMBER_ID.includes('your_') ? 'completed' : 'pending'
    },
    {
      title: "Environment Configuration",
      description: "Configure your .env.local file with credentials",
      icon: <Key className="h-5 w-5" />,
      status: env.isWhatsAppFullyConfigured ? 'completed' : 'pending'
    },
    {
      title: "Testing & Verification",
      description: "Test your WhatsApp integration",
      icon: <CheckCircle className="h-5 w-5" />,
      status: 'pending'
    }
  ];

  const copyEnvTemplate = () => {
    const envTemplate = `# WhatsApp Business API Configuration
# ALERT IMPORTANT: Replace these with your actual WhatsApp Business API credentials
# Get these from Meta Business Manager → WhatsApp → API Setup

# KEY Required for sending messages (GET FROM META BUSINESS MANAGER)
VITE_WHATSAPP_ACCESS_TOKEN=your_actual_whatsapp_access_token_here
VITE_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here

# 🏢 Business Information (GET FROM META BUSINESS MANAGER)
VITE_WHATSAPP_BUSINESS_ID=your_business_id_here
VITE_WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here

# MOBILE App Information (GET FROM META DEVELOPERS)
VITE_WHATSAPP_APP_ID=your_app_id_here
VITE_WHATSAPP_APP_SECRET=your_app_secret_here

# LINK Webhook Configuration
VITE_WHATSAPP_WEBHOOK_VERIFY_TOKEN=crm-demo-webhook-verify-token-2024
VITE_WHATSAPP_WEBHOOK_URL=https://your-domain.com/api/whatsapp/webhook

# TARGET Meta Business Configuration
VITE_META_APP_ID=your_meta_app_id_here
VITE_META_BUSINESS_ID=your_meta_business_id_here`;

    navigator.clipboard.writeText(envTemplate);
    toast.success('Environment template copied to clipboard!');
  };

  const getStepStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">WhatsApp Business API Setup</h1>
        <p className="text-gray-600">
          Configure WhatsApp Business API to enable message sending functionality
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>WhatsApp Send Button Not Working?</AlertTitle>
            <AlertDescription>
              The most common cause is missing or invalid WhatsApp Business API credentials, 
              or attempting to send messages to unapproved phone numbers.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Setup Progress</CardTitle>
              <CardDescription>Track your WhatsApp Business API setup progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {setupSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg border">
                    <div className="flex-shrink-0 mt-1">
                      {getStepStatus(step.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {step.icon}
                        <h3 className="font-medium">{step.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {step.status === 'completed' ? 'Completed' : 'Pending'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Status Check</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="h-4 w-4" />
                    <span className="font-medium">Access Token</span>
                  </div>
                  <div className="text-sm">
                    {env.WHATSAPP_ACCESS_TOKEN && !env.WHATSAPP_ACCESS_TOKEN.includes('your_') ? (
                      <span className="text-green-600">Configured</span>
                    ) : (
                      <span className="text-red-600">Missing</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4" />
                    <span className="font-medium">Phone Number ID</span>
                  </div>
                  <div className="text-sm">
                    {env.WHATSAPP_PHONE_NUMBER_ID && !env.WHATSAPP_PHONE_NUMBER_ID.includes('your_') ? (
                      <span className="text-green-600">Configured</span>
                    ) : (
                      <span className="text-red-600">Missing</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">Business ID</span>
                  </div>
                  <div className="text-sm">
                    {env.WHATSAPP_BUSINESS_ID && !env.WHATSAPP_BUSINESS_ID.includes('your_') ? (
                      <span className="text-green-600">Configured</span>
                    ) : (
                      <span className="text-orange-600">Missing</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4" />
                    <span className="font-medium">Overall Status</span>
                  </div>
                  <div className="text-sm">
                    {env.isWhatsAppFullyConfigured ? (
                      <span className="text-green-600">Ready</span>
                    ) : (
                      <span className="text-red-600">Needs Setup</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step-by-Step Setup Guide</CardTitle>
              <CardDescription>
                Follow these steps to configure WhatsApp Business API properly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <h3 className="font-medium">Meta Business Manager Setup</h3>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-sm ml-8">
                    <li>Go to <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Meta Business Manager</a></li>
                    <li>Create a business account or log in to existing one</li>
                    <li>Add your WhatsApp Business Account</li>
                    <li>Complete business verification (may take 1-3 days)</li>
                  </ol>
                  <Button 
                    variant="outline" 
                    className="mt-3" 
                    onClick={() => window.open('https://business.facebook.com', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Meta Business Manager
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <h3 className="font-medium">WhatsApp Business API Access</h3>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-sm ml-8">
                    <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Meta Developers</a></li>
                    <li>Create a new app or select existing app</li>
                    <li>Add "WhatsApp Business API" to your app</li>
                    <li>Configure app settings and get your App ID & App Secret</li>
                    <li>Generate a permanent access token</li>
                  </ol>
                  <Button 
                    variant="outline" 
                    className="mt-3" 
                    onClick={() => window.open('https://developers.facebook.com/apps/', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Meta Developers
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <h3 className="font-medium">Phone Number Configuration</h3>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-sm ml-8">
                    <li>In Meta Business Manager, go to WhatsApp → Phone Numbers</li>
                    <li>Add your phone number (must be a real business number)</li>
                    <li>Verify ownership of the phone number</li>
                    <li>Get your Phone Number ID from the API setup</li>
                    <li>Add test phone numbers for initial testing</li>
                  </ol>
                  <Button 
                    variant="outline" 
                    className="mt-3" 
                    onClick={() => window.open('https://business.facebook.com/wa/manage/phone-numbers/', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Manage Phone Numbers
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <h3 className="font-medium">Environment Configuration</h3>
                  </div>
                  <div className="space-y-3 ml-8">
                    <p className="text-sm">Copy the environment template and update your .env.local file:</p>
                    <Button onClick={copyEnvTemplate} className="w-full">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Environment Template
                    </Button>
                    <p className="text-xs text-gray-600">
                      After copying, replace all "your_*_here" values with your actual credentials from Meta Business Manager.
                    </p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                    <h3 className="font-medium">Testing & Verification</h3>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-sm ml-8">
                    <li>Restart your development server after updating .env.local</li>
                    <li>Use the Diagnostics tab to check your configuration</li>
                    <li>Send test messages to approved phone numbers</li>
                    <li>Monitor message delivery and troubleshoot issues</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics">
          <WhatsAppDiagnosticTool />
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Common Issues & Solutions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-red-600 mb-2">Send Button Not Working</h4>
                  <p className="text-sm mb-2">The green send button fails when clicked.</p>
                  <div className="text-sm">
                    <strong>Common Causes:</strong>
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>Missing or invalid WhatsApp access token</li>
                      <li>Incorrect phone number ID</li>
                      <li>Attempting to send to unapproved phone numbers</li>
                      <li>Phone number not added to WhatsApp Business account</li>
                    </ul>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-yellow-600 mb-2">WARNING "Unapproved Phone Numbers" Error</h4>
                  <p className="text-sm mb-2">Messages fail because phone numbers are not approved.</p>
                  <div className="text-sm">
                    <strong>Solutions:</strong>
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>Add test phone numbers in Meta Business Manager</li>
                      <li>Only send to numbers added to your WhatsApp Business account</li>
                      <li>Submit your app for review to message any number</li>
                      <li>Use approved message templates for initial messages</li>
                    </ul>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-blue-600 mb-2">ℹ️ Access Token Issues</h4>
                  <p className="text-sm mb-2">Invalid or expired access tokens cause authentication failures.</p>
                  <div className="text-sm">
                    <strong>Solutions:</strong>
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>Generate a new permanent access token</li>
                      <li>Ensure token has whatsapp_business_messaging permissions</li>
                      <li>Check token expiration date</li>
                      <li>Verify app is properly configured</li>
                    </ul>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-green-600 mb-2">Best Practices</h4>
                  <div className="text-sm">
                    <ul className="list-disc list-inside ml-4">
                      <li>Always test with approved phone numbers first</li>
                      <li>Use message templates for initial customer contact</li>
                      <li>Monitor webhook events for delivery status</li>
                      <li>Keep your access tokens secure and rotate regularly</li>
                      <li>Follow WhatsApp Business API rate limits</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhatsAppSetup; 