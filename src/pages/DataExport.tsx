// @ts-nocheck
// DataExport.tsx - User data export functionality
import React, { useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Download, 
  FileText, 
  Clock, 
  Database, 
  MessageSquare, 
  User,
  CheckCircle2,
  Info,
  Shield
} from 'lucide-react';

const DataExport = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    profile: true,
    leads: true,
    projects: true,
    notifications: true,
    messages: false // WhatsApp messages might be sensitive
  });

  const handleExportData = async () => {
    if (!user) {
      toast.error('You must be logged in to export your data');
      return;
    }

    setLoading(true);
    try {
      const exportData: Record<string, any> = {};
      
      // Export profile data
      if (exportOptions.profile) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        exportData.profile = profile;
      }

      // Export leads
      if (exportOptions.leads) {
        const { data: leads } = await supabase
          .from('leads')
          .select('*')
          .eq('user_id', user.id);
        exportData.leads = leads;
      }

      // Export projects
      if (exportOptions.projects) {
        const { data: projects } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id);
        exportData.projects = projects;
      }

      // Export notifications
      if (exportOptions.notifications) {
        const { data: notifications } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id);
        exportData.notifications = notifications;
      }

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `lead-reviver-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch (error: unknown) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const dataTypes = [
    {
      key: 'profile' as keyof typeof exportOptions,
      icon: <User className="h-5 w-5 text-blue-500" />,
      title: 'Profile Information',
      description: 'Name, email, phone number, role, and account settings',
      recommended: true
    },
    {
      key: 'leads' as keyof typeof exportOptions,
      icon: <Database className="h-5 w-5 text-green-500" />,
      title: 'Lead Data',
      description: 'Contact information, lead status, notes, and interaction history',
      recommended: true
    },
    {
      key: 'projects' as keyof typeof exportOptions,
      icon: <FileText className="h-5 w-5 text-purple-500" />,
      title: 'Projects & Settings',
      description: 'Created projects, customizations, and user preferences',
      recommended: true
    },
    {
      key: 'notifications' as keyof typeof exportOptions,
      icon: <CheckCircle2 className="h-5 w-5 text-orange-500" />,
      title: 'Notifications',
      description: 'In-app notifications and system alerts',
      recommended: false
    },
    {
      key: 'messages' as keyof typeof exportOptions,
      icon: <MessageSquare className="h-5 w-5 text-red-500" />,
      title: 'WhatsApp Messages',
      description: 'Conversation history and message metadata (sensitive data)',
      recommended: false
    }
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <Download className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Export Your Data</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Download a copy of your personal data stored in Lead-Reviver. 
            This includes your profile, leads, projects, and other information you've created.
          </p>
        </div>

        {/* Information Alert */}
        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Data Portability Right:</strong> You have the right to receive your personal data in a structured, commonly used format. This export will be provided in JSON format for easy processing.
          </AlertDescription>
        </Alert>

        {/* Export Options */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Select Data to Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dataTypes.map((type) => (
                <div key={type.key} className="flex items-start gap-3 p-4 border rounded-lg">
                  <Checkbox
                    id={type.key}
                    checked={exportOptions[type.key]}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({ ...prev, [type.key]: !!checked }))
                    }
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {type.icon}
                      <label htmlFor={type.key} className="font-medium text-gray-900 cursor-pointer">
                        {type.title}
                      </label>
                      {type.recommended && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5" />
                Export Format
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Your data will be exported as a JSON file containing all selected information in a structured format.
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Machine-readable JSON format</li>
                <li>• Organized by data category</li>
                <li>• Includes timestamps and metadata</li>
                <li>• Compatible with data analysis tools</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-5 w-5" />
                Processing Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Data export is processed immediately and downloaded to your device.
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Instant processing for most data</li>
                <li>• Download starts automatically</li>
                <li>• No email delivery required</li>
                <li>• Secure local processing</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Export Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleExportData}
                disabled={loading || !Object.values(exportOptions).some(Boolean)}
                size="lg"
                className="flex-1 sm:flex-initial"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Selected Data
                  </>
                )}
              </Button>
              
              <Button variant="outline" size="lg" asChild>
                <Link to="/settings">Cancel</Link>
              </Button>
            </div>
            
            {!Object.values(exportOptions).some(Boolean) && (
              <p className="text-sm text-gray-500 mt-3">
                Please select at least one data type to export.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Legal Information */}
        <div className="mt-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-500 mt-1" />
                <div className="text-sm text-gray-600">
                  <p className="mb-2">
                    This data export complies with GDPR Article 20 (Right to Data Portability) and other applicable privacy regulations. 
                    The exported data contains only information directly associated with your account.
                  </p>
                  <p>
                    For questions about data export or privacy rights, contact us at{' '}
                    <a href="mailto:privacy@crm-demo.com" className="text-primary hover:underline">
                      privacy@crm-demo.com
                    </a>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Related Actions */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Looking for other data management options?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link to="/data-deletion">Request Data Deletion</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/privacy-policy">View Privacy Policy</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExport; 