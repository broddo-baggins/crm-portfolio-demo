import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { WhatsAppTroubleshooter } from '@/components/whatsapp/WhatsAppTroubleshooter';
import { ArrowLeft, MessageSquare, Settings, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function WhatsAppTroubleshoot() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/messages')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Messages
        </Button>
        
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold">WhatsApp Integration Troubleshooter</h1>
        </div>
        
        <p className="text-gray-600">
          Diagnose and fix WhatsApp send message issues with our comprehensive troubleshooter.
        </p>
      </div>

      <div className="space-y-6">
        {/* Current Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Current Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Credentials</span>
                  {/* The access token is server-only, so the browser can't see it */}
                  <Badge variant="secondary">
                    Server-side
                  </Badge>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Phone Number ID</span>
                  <Badge variant={import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID ? "default" : "destructive"}>
                    {import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID ? "Configured" : "Missing"}
                  </Badge>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Integration Status</span>
                  <Badge variant="secondary">
                    Testing Required
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Issues Alert */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Common Issue:</strong> WhatsApp Business API requires approved phone numbers. 
            New numbers can only send to approved contacts initially. 
            <a 
              href="https://developers.facebook.com/docs/whatsapp/cloud-api/phone-numbers" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline ml-1"
            >
              Learn more about phone number approval
            </a>
          </AlertDescription>
        </Alert>

        {/* Main Troubleshooter Component */}
        <WhatsAppTroubleshooter />

        {/* Quick Fix Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Fix Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold">Step 1: Check Environment Variables</h4>
                <p className="text-sm text-gray-600">
                  Ensure your .env.local file contains valid WhatsApp API credentials
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold">Step 2: Verify Phone Number Format</h4>
                <p className="text-sm text-gray-600">
                  Use international format: +1234567890 (no spaces or special characters)
                </p>
              </div>
              
              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-semibold">Step 3: Check Phone Number Approval</h4>
                <p className="text-sm text-gray-600">
                  New WhatsApp Business numbers need approval to send to unverified contacts
                </p>
              </div>
              
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold">Step 4: Test with Approved Number</h4>
                <p className="text-sm text-gray-600">
                  Try sending to a phone number that has opted in to receive messages
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 