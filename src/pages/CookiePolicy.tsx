import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Cookie, Shield, Globe, Settings, MessageSquare, BarChart3 } from 'lucide-react';
import { PublicPageShell } from '@/components/marketing/PublicPageShell';
import { useTranslation } from 'react-i18next';
import { useLang } from '@/hooks/useLang';
import { cn } from '@/lib/utils';

const CookiePolicy: React.FC = () => {
  const { t } = useTranslation('pages');
  const { isRTL, textStart } = useLang();
  const lastUpdated = "December 2024";
  
  return (
    <PublicPageShell dir={isRTL ? "rtl" : "ltr"}>
    <div className={cn("mx-auto max-w-4xl px-4 py-10 sm:px-8 md:py-16", isRTL && "font-hebrew")}>
      {/* Header */}
      <div className={cn("mb-10", textStart())}>
        <h1 className={cn("mb-3 text-[32px] font-semibold leading-[38px] tracking-[-0.025em] text-foreground md:text-[40px] md:leading-[46px]", textStart())}>
          {t('cookiePolicy.title', 'Cookie Policy')}
        </h1>
        <p className={cn("mb-3 text-lg text-subtle", textStart())}>
          {t('cookiePolicy.subtitle', 'How we use cookies and similar technologies')}
        </p>
        <Badge variant="secondary" className="mb-4">
          Last updated: {lastUpdated}
        </Badge>

        {/* Demo Notice */}
        <div className="mt-6 border-s-2 border-amber-400 bg-amber-50 p-4 dark:bg-amber-950/40">
          <p className="mb-1 flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Portfolio Demo Application
          </p>
          <p className="text-orange-800 dark:text-orange-300 text-sm">
            This is a demonstration project by Amit Yogev with mock data. No real cookies are set for tracking purposes.
            For questions or takedown requests: <a href="mailto:amit.yogev@gmail.com" className="underline font-semibold">amit.yogev@gmail.com</a>
          </p>
        </div>
      </div>

      {/* Meta Integration Notice */}
      <Card className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-sm font-bold">f</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Meta Integration Cookies</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">WhatsApp® Business API & Meta Services</p>
            </div>
          </div>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            Our WhatsApp® Business API integration may use cookies and similar technologies from Meta 
            to ensure proper functionality and analytics. This policy covers both our cookies and 
            those used by Meta services.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {/* What Are Cookies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-6 w-6 text-orange-600" />
              What Are Cookies?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Cookies are small text files stored on your device when you visit our website. They help us:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Remember your preferences and settings</li>
              <li>Provide a personalized experience</li>
              <li>Analyze website performance and usage</li>
              <li>Ensure security and prevent fraud</li>
              <li>Enable third-party integrations like WhatsApp® Business API</li>
            </ul>
          </CardContent>
        </Card>

        {/* Types of Cookies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-gray-600" />
              Types of Cookies We Use
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Essential Cookies */}
            <div>
              <h4 className="font-semibold text-green-600 mb-2">Essential Cookies (Always Active)</h4>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                These cookies are necessary for the website to function and cannot be disabled:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li><strong>Authentication:</strong> Keep you logged in securely</li>
                <li><strong>Session Management:</strong> Maintain your session across pages</li>
                <li><strong>Security:</strong> Protect against CSRF attacks and security threats</li>
                <li><strong>Load Balancing:</strong> Ensure optimal performance</li>
              </ul>
            </div>

            {/* Functional Cookies */}
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">Functional Cookies</h4>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                These cookies enhance your experience and remember your preferences:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li><strong>Language Preferences:</strong> Remember your language choice (English/Hebrew)</li>
                <li><strong>Theme Settings:</strong> Save your dark/light mode preference</li>
                <li><strong>Dashboard Layout:</strong> Remember your widget arrangements</li>
                <li><strong>Accessibility Settings:</strong> Maintain accessibility preferences</li>
              </ul>
            </div>

            {/* Analytics Cookies */}
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">Analytics Cookies</h4>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                These cookies help us understand how you use our service:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li><strong>Usage Analytics:</strong> Track page views and user interactions</li>
                <li><strong>Performance Monitoring:</strong> Identify and fix technical issues</li>
                <li><strong>Feature Usage:</strong> Understand which features are most valuable</li>
                <li><strong>Error Tracking:</strong> Monitor and resolve application errors</li>
              </ul>
            </div>

            {/* Marketing Cookies */}
            <div>
              <h4 className="font-semibold text-pink-600 mb-2">Marketing Cookies</h4>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                These cookies enable personalized marketing and advertising:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li><strong>Lead Tracking:</strong> Track conversion from marketing campaigns</li>
                <li><strong>Remarketing:</strong> Show relevant ads on other websites</li>
                <li><strong>Social Media Integration:</strong> Enable social sharing and tracking</li>
                <li><strong>A/B Testing:</strong> Test different versions of our service</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Business API Cookies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-green-600" />
              WhatsApp® Business API Cookies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Meta Integration Cookies</h4>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Our WhatsApp® Business API integration may set the following cookies:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Business Verification:</strong> Maintain business account verification status</li>
                <li><strong>Message Templates:</strong> Cache approved message templates</li>
                <li><strong>API Rate Limiting:</strong> Manage API call limits and quotas</li>
                <li><strong>Webhook Verification:</strong> Secure webhook endpoint validation</li>
                <li><strong>Message Analytics:</strong> Track message delivery and engagement metrics</li>
              </ul>
            </div>
            
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2">Data Processing by Meta</h5>
              <p className="text-green-800 dark:text-green-200 text-sm">
                When you interact with WhatsApp® features, Meta may process certain data according to their 
                privacy policy. This includes message metadata, delivery confirmations, and usage statistics 
                necessary for the WhatsApp® Business API to function properly.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Cookies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-indigo-600" />
              Third-Party Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">External Services We Use</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h5 className="font-semibold text-blue-600 mb-2">Meta (WhatsApp® Business API)</h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Essential for messaging functionality, business verification, and message analytics.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h5 className="font-semibold text-green-600 mb-2">Supabase</h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Database and authentication services for secure data storage.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h5 className="font-semibold text-orange-600 mb-2">Calendly</h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Meeting scheduling integration for appointment booking.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h5 className="font-semibold text-red-600 mb-2">Error Tracking</h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Application monitoring and error reporting services.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-600" />
              Managing Your Cookie Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Cookie Consent Tool</h4>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                You can manage your cookie preferences using our consent tool, which appears when you first visit our site.
                You can also update your preferences at any time by:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Using the cookie settings in your user account</li>
                <li>Clicking the cookie preferences link in our footer</li>
                <li>Contacting our support team</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Browser Controls</h4>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                You can also control cookies through your browser settings:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
                <li><strong>Chrome:</strong> Settings &gt; Privacy and Security &gt; Cookies</li>
                <li><strong>Firefox:</strong> Settings &gt; Privacy &amp; Security &gt; Cookies</li>
                <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Cookies</li>
                <li><strong>Edge:</strong> Settings &gt; Cookies and Site Permissions</li>
              </ul>
              
              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg mt-4">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  <strong>Note:</strong> Disabling essential cookies may affect the functionality of our service, 
                  including WhatsApp® messaging features and user authentication.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-teal-600" />
              Cookie Retention Periods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="border border-gray-300 dark:border-gray-700 p-3 text-left">Cookie Type</th>
                    <th className="border border-gray-300 dark:border-gray-700 p-3 text-left">Retention Period</th>
                    <th className="border border-gray-300 dark:border-gray-700 p-3 text-left">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Session Cookies</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Until browser closes</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Authentication and session management</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Preference Cookies</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">1 year</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">User preferences and settings</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Analytics Cookies</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">2 years</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Usage analytics and performance monitoring</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Marketing Cookies</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">30 days</td>
                    <td className="border border-gray-300 dark:border-gray-700 p-3">Campaign tracking and remarketing</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Questions About Cookies?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have questions about this demo or my portfolio:
            </p>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p><strong>Contact:</strong> amit@amityogev.com</p>
              <p><strong>Portfolio:</strong> https://amityogev.com</p>
              <p><strong>Note:</strong> This is a portfolio demo with mock data</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span>was powered by Meta</span>
          <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">f</span>
          </div>
          <span>•</span>
          <span>WhatsApp® Business API</span>
        </div>
        <Separator className="mb-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This is a portfolio demo showcasing cookie policy templates.
          No actual cookies are being used for tracking in this demonstration.
        </p>
      </div>
    </div>
    </PublicPageShell>
  );
};

export default CookiePolicy; 