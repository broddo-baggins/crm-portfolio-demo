import React, { useRef } from 'react';
import { AnimatedBeam } from '@/components/ui/animated-beam';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Database, MessageSquare, BarChart3, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const IntegrationFlow: React.FC = () => {
  const { t } = useTranslation('dashboard');
  const containerRef = useRef<HTMLDivElement>(null);
  const crmRef = useRef<HTMLDivElement>(null);
  const whatsappRef = useRef<HTMLDivElement>(null);
  const analyticsRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-purple-600" />
          {t('integration.title', 'Integration Flow')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={containerRef}
          className="relative h-80 w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden"
        >
          {/* Central CRM Hub */}
          <div
            ref={crmRef}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-800">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <div className="text-center mt-2">
              <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">CRM Demo</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">Core Engine</div>
            </div>
          </div>

          {/* WhatsApp Integration */}
          <div
            ref={whatsappRef}
            className="absolute top-8 left-8"
          >
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-md">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div className="text-center mt-1">
              <div className="text-xs font-medium text-gray-900 dark:text-slate-100">WhatsApp</div>
            </div>
          </div>

          {/* CRM Integration */}
          <div
            ref={crmRef}
            className="absolute top-8 right-8"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div className="text-center mt-1">
              <div className="text-xs font-medium text-gray-900 dark:text-slate-100">CRM</div>
            </div>
          </div>

          {/* Analytics Integration */}
          <div
            ref={analyticsRef}
            className="absolute bottom-8 left-8"
          >
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-md">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="text-center mt-1">
              <div className="text-xs font-medium text-gray-900 dark:text-slate-100">Analytics</div>
            </div>
          </div>

          {/* Calendar Integration */}
          <div
            ref={calendarRef}
            className="absolute bottom-8 right-8"
          >
            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-md">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="text-center mt-1">
              <div className="text-xs font-medium text-gray-900 dark:text-slate-100">Calendar</div>
            </div>
          </div>

          {/* Animated Beams */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={whatsappRef}
            toRef={crmRef}
            gradientStartColor="#367E50"
            gradientStopColor="#059669"
            duration={3}
          />
          
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={crmRef}
            toRef={crmRef}
            gradientStartColor="#C24816"
            gradientStopColor="#A93D10"
            duration={3.5}
            delay={0.5}
          />

          <AnimatedBeam
            containerRef={containerRef}
            fromRef={crmRef}
            toRef={analyticsRef}
            gradientStartColor="#3E5F77"
            gradientStopColor="#344E62"
            duration={4}
            delay={1}
          />

          <AnimatedBeam
            containerRef={containerRef}
            fromRef={crmRef}
            toRef={calendarRef}
            gradientStartColor="#3E5F77"
            gradientStopColor="#4f46e5"
            duration={3.2}
            delay={1.5}
          />

          {/* Reverse Flow Beams */}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={crmRef}
            toRef={crmRef}
            gradientStartColor="#A93D10"
            gradientStopColor="#C24816"
            duration={4.5}
            delay={2}
            reverse
          />
        </div>

        {/* Integration Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <div className="text-sm font-medium text-green-900 dark:text-green-100">
              {t('integration.messagesProcessed', 'Messages Processed')}
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              1,234
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              {t('integration.today', 'Today')}
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {t('integration.syncStatus', 'Sync Status')}
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              100%
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              {t('integration.realtime', 'Real-time')}
            </div>
          </div>
        </div>

        {/* Integration Points */}
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300">
            {t('integration.activeConnections', 'Active Connections')}
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-gray-700 dark:text-slate-300">WhatsApp Business</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-gray-700 dark:text-slate-300">Salesforce CRM</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-gray-700 dark:text-slate-300">Google Analytics</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <span className="text-gray-700 dark:text-slate-300">Google Calendar</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationFlow; 