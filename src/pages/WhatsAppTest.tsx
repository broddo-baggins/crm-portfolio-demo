import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Send,
} from "lucide-react";
import { env } from "@/config/env";
import { WhatsAppService } from "@/services/whatsapp-api";

interface TestResult {
  timestamp: string;
  test: string;
  status: "success" | "error" | "pending";
  message: string;
  data?: any;
}

const WhatsAppTestPage: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("+1234567890");
  const [message, setMessage] = useState(
    "Hello from Oven AI! 🤖 This is a test message.",
  );

  const whatsappService = new WhatsAppService();

  const addResult = (
    test: string,
    status: "success" | "error" | "pending",
    message: string,
    data?: any,
  ) => {
    const result: TestResult = {
      timestamp: new Date().toISOString(),
      test,
      status,
      message,
      data,
    };
    setResults((prev) => [result, ...prev]);
  };

  const testWhatsAppConfiguration = async () => {
    setIsLoading(true);
    addResult(
      "WhatsApp® Configuration",
      "pending",
      "Checking WhatsApp® configuration...",
    );

    try {
      const config = env.debugInfo.whatsapp;

      if (!config.isFullyConfigured) {
        addResult(
          "WhatsApp® Configuration",
          "error",
          "WhatsApp® not fully configured",
          config,
        );
        return;
      }

      addResult(
        "WhatsApp® Configuration",
        "success",
        "WhatsApp® fully configured SUCCESS",
        {
          phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
          businessId: env.WHATSAPP_BUSINESS_ID,
          appId: env.WHATSAPP_APP_ID,
          hasAccessToken: !!env.WHATSAPP_ACCESS_TOKEN,
          webhookUrl: env.WHATSAPP_WEBHOOK_URL,
        },
      );
    } catch (error) {
      addResult(
        "WhatsApp® Configuration",
        "error",
        error instanceof Error ? error.message : "Configuration check failed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const testWhatsAppMessage = async () => {
    setIsLoading(true);
    addResult(
      "WhatsApp® Message",
      "pending",
      `Sending test message to ${phoneNumber}...`,
    );

    try {
      const messageResult = await whatsappService.sendMessage(
        phoneNumber,
        message,
      );

      if (
        messageResult &&
        messageResult.messages &&
        messageResult.messages.length > 0
      ) {
        const messageStatus = messageResult.messages[0].message_status;
        if (messageStatus === "accepted") {
          addResult(
            "WhatsApp® Message",
            "success",
            "Message sent successfully! COMPLETE",
            {
              messageId: messageResult.messages[0].id,
              waId: messageResult.contacts[0]?.wa_id,
              status: messageStatus,
            },
          );
        } else {
          addResult(
            "WhatsApp® Message",
            "error",
            `Message status: ${messageStatus}`,
            messageResult,
          );
        }
      } else {
        addResult(
          "WhatsApp® Message",
          "error",
          "Message sending failed - no response from WhatsApp® API",
          messageResult,
        );
      }
    } catch (error) {
      addResult(
        "WhatsApp® Message",
        "error",
        error instanceof Error ? error.message : "Message test failed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp® API Test</h1>
          <p className="text-gray-600 mt-2">
            Test your live WhatsApp® Business API integration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {env.IS_PROD ? "Production" : "Development"}
          </Badge>
        </div>
      </div>

      {/* Environment Status */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Configuration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Configuration Checks */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {env.WHATSAPP_ACCESS_TOKEN ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div className="flex-1">
                  <p className="font-medium">Access Token</p>
                  <p className="text-sm text-gray-600">
                    {env.WHATSAPP_ACCESS_TOKEN
                      ? `Configured (${env.WHATSAPP_ACCESS_TOKEN.length} characters)`
                      : "Missing"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {env.WHATSAPP_PHONE_NUMBER_ID ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
                <div className="flex-1">
                  <p className="font-medium">Phone Number ID</p>
                  <p className="text-sm text-gray-600">
                    {env.WHATSAPP_PHONE_NUMBER_ID
                      ? `SUCCESS ${env.WHATSAPP_PHONE_NUMBER_ID}`
                      : "Not configured"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
                <div className="flex-1">
                  <p className="font-medium">Webhook Security</p>
                  <p className="text-sm text-gray-600">
                    {env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
                      ? "Webhook verification configured"
                      : "Webhook security not set"}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Summary */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Badge
                  variant={
                    env.isWhatsAppFullyConfigured ? "default" : "secondary"
                  }
                >
                  {env.isWhatsAppFullyConfigured ? "Ready" : "Partial Setup"}
                </Badge>
              </div>

              <h4 className="font-medium mb-2">Integration Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Business ID:</span>
                  <code className="text-xs">
                    {env.WHATSAPP_BUSINESS_ID || "Not set"}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span>App ID:</span>
                  <code className="text-xs">
                    {env.WHATSAPP_APP_ID || "Not set"}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span>Webhook URL:</span>
                  <span className="text-xs">
                    {env.WHATSAPP_WEBHOOK_URL ? "Set" : "Missing"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Test Message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Phone Number</label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
              />
              <p className="text-xs text-gray-500">
                Include country code (e.g., +1 for US)
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Message</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Test message content..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={testWhatsAppConfiguration}
              disabled={isLoading}
              variant="outline"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Test Configuration
            </Button>

            <Button
              onClick={testWhatsAppMessage}
              disabled={isLoading || !env.isWhatsAppFullyConfigured}
              className="bg-green-600 hover:bg-green-700"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Test Message
            </Button>

            <Button onClick={clearResults} variant="ghost" size="sm">
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No tests run yet</p>
                <p className="text-sm text-gray-400">
                  Click "Test Configuration" or "Send Test Message" to start
                </p>
              </div>
            ) : (
              results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    result.status === "success"
                      ? "border-green-500 bg-green-50"
                      : result.status === "error"
                        ? "border-red-500 bg-red-50"
                        : "border-yellow-500 bg-yellow-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{result.test}</h4>
                    <Badge
                      className={
                        result.status === "success"
                          ? "bg-green-500"
                          : result.status === "error"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                      }
                    >
                      {result.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </p>
                  {result.data && (
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 cursor-pointer">
                        View Details
                      </summary>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Guide */}
      <Card>
        <CardHeader>
          <CardTitle>READ Quick Testing Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>
            • <strong>Test Configuration:</strong> Verifies your WhatsApp API
            credentials are working
          </p>
          <p>
            • <strong>Send Test Message:</strong> Sends a real WhatsApp message
            to the specified number
          </p>
          <p>
            • <strong>Phone Number Format:</strong> Must include country code
            (e.g., +1234567890)
          </p>
          <p>
            • <strong>Message Delivery:</strong> Messages are sent immediately
            to real WhatsApp numbers
          </p>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="font-medium text-blue-800">
              SECURITY Production Integration
            </p>
            <p className="text-blue-700 text-xs mt-1">
              This page uses your live WhatsApp Business API credentials.
              Messages sent here will be delivered to real phone numbers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppTestPage;
