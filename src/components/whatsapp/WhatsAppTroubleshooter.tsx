import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Phone,
  Settings,
  Key,
  MessageSquare,
  RefreshCw,
  Zap
} from 'lucide-react';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  solution?: string;
}

export function WhatsAppTroubleshooter() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    const diagnosticResults: DiagnosticResult[] = [];

    // Test 1: Environment Variables
    // The access token is server-only (never a VITE_* var, which would ship it to the browser)
    const accessToken = "";
    const phoneNumberId = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID;
    
    if (!accessToken || !phoneNumberId) {
      diagnosticResults.push({
        test: 'Environment Variables',
        status: 'error',
        message: 'Missing WhatsApp API credentials',
        solution: 'Add VITE_WHATSAPP_ACCESS_TOKEN and VITE_WHATSAPP_PHONE_NUMBER_ID to .env.local'
      });
    } else {
      diagnosticResults.push({
        test: 'Environment Variables',
        status: 'success',
        message: 'WhatsApp API credentials found'
      });
    }

    // Test 2: Phone Number Format
    if (testPhoneNumber) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(testPhoneNumber.replace(/\s/g, ''))) {
        diagnosticResults.push({
          test: 'Phone Number Format',
          status: 'error',
          message: 'Invalid phone number format',
          solution: 'Use international format: +1234567890 (no spaces or special characters)'
        });
      } else {
        diagnosticResults.push({
          test: 'Phone Number Format',
          status: 'success',
          message: 'Phone number format is valid'
        });
      }
    }

    // Test 3: WhatsApp Business API Connection
    if (accessToken && phoneNumberId) {
      try {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${phoneNumberId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          diagnosticResults.push({
            test: 'WhatsApp API Connection',
            status: 'success',
            message: `Connected to phone number: ${data.display_phone_number || 'Unknown'}`
          });
        } else {
          const errorData = await response.json();
          diagnosticResults.push({
            test: 'WhatsApp API Connection',
            status: 'error',
            message: `API Error: ${errorData.error?.message || 'Connection failed'}`,
            solution: 'Check your access token and phone number ID in Meta Business Manager'
          });
        }
      } catch (error) {
        diagnosticResults.push({
          test: 'WhatsApp API Connection',
          status: 'error',
          message: 'Network error connecting to WhatsApp API',
          solution: 'Check your internet connection and firewall settings'
        });
      }
    }

    // Test 4: Phone Number Approval Status
    if (accessToken && phoneNumberId && testPhoneNumber) {
      try {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${phoneNumberId}/message_templates`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            diagnosticResults.push({
              test: 'Message Templates',
              status: 'success',
              message: `${data.data.length} approved templates found`
            });
          } else {
            diagnosticResults.push({
              test: 'Message Templates',
              status: 'warning',
              message: 'No approved templates found',
              solution: 'For new phone numbers, you can only send to approved numbers initially'
            });
          }
        }
      } catch (error) {
        diagnosticResults.push({
          test: 'Message Templates',
          status: 'warning',
          message: 'Could not check template status'
        });
      }
    }

    // Test 5: Rate Limiting Check
    diagnosticResults.push({
      test: 'Rate Limiting',
      status: 'warning',
      message: 'WhatsApp has strict rate limits',
      solution: 'Max 1000 messages per day for new numbers, 10,000 for verified numbers'
    });

    // Test 6: Phone Number Verification Status
    if (testPhoneNumber) {
      // Simple check for common test numbers that won't work
      const testNumbers = ['+1234567890', '+0000000000', '+1111111111'];
      if (testNumbers.includes(testPhoneNumber)) {
        diagnosticResults.push({
          test: 'Phone Number Verification',
          status: 'error',
          message: 'Test phone number detected',
          solution: 'Use a real phone number. Test numbers are blocked by WhatsApp'
        });
      } else {
        diagnosticResults.push({
          test: 'Phone Number Verification',
          status: 'success',
          message: 'Phone number appears valid'
        });
      }
    }

    setResults(diagnosticResults);
    setIsRunning(false);
  };

  const sendTestMessage = async () => {
    if (!testPhoneNumber) {
      toast.error('Please enter a phone number to test');
      return;
    }

    try {
      const response = await fetch('/api/whatsapp/send-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: testPhoneNumber,
          message: 'This is a test message from CRM Demo WhatsApp integration. If you receive this, the integration is working! COMPLETE'
        }),
      });

      if (response.ok) {
        toast.success('Test message sent successfully!');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to send test message: ${errorData.error}`);
      }
    } catch (error) {
      toast.error('Network error sending test message');
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            WhatsApp Troubleshooter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-phone">Test Phone Number</Label>
            <Input
              id="test-phone"
              placeholder="+1234567890"
              value={testPhoneNumber}
              onChange={(e) => setTestPhoneNumber(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={runDiagnostics} disabled={isRunning}>
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running Diagnostics...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Run Diagnostics
                </>
              )}
            </Button>
            
            <Button 
              onClick={sendTestMessage} 
              variant="outline"
              disabled={!testPhoneNumber}
            >
              <Zap className="h-4 w-4 mr-2" />
              Send Test Message
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Diagnostic Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(result.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{result.test}</span>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                    {result.solution && (
                      <Alert className="mt-2">
                        <AlertDescription className="text-sm">
                          <strong>Solution:</strong> {result.solution}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Common Issues & Solutions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold flex items-center gap-2">
                <Key className="h-4 w-4" />
                Missing API Credentials
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Add your WhatsApp Business API credentials to .env.local:
              </p>
              <pre className="bg-gray-100 p-2 rounded text-xs mt-2">
{`VITE_WHATSAPP_ACCESS_TOKEN=your_access_token
VITE_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id`}
              </pre>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number Not Approved
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                New WhatsApp Business numbers can only send to approved numbers initially. 
                To send to any number, you need to:
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• Verify your business in Meta Business Manager</li>
                <li>• Submit your app for WhatsApp Business API review</li>
                <li>• Get approved message templates</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold">Phone Number Format</h4>
              <p className="text-sm text-gray-600 mt-1">
                Use international format without spaces: +1234567890
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 