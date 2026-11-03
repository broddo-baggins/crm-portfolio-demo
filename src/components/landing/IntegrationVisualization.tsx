"use client";

import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

// Create the CRM Demo logo (oven/fire themed)
const CRMDemoLogo = () => (
  <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 rounded-full shadow-2xl">
    <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full">
      <svg viewBox="0 0 32 32" className="w-10 h-10">
        {/* Oven body */}
        <rect x="4" y="8" width="24" height="20" rx="2" fill="#ff6b35" stroke="#d63031" strokeWidth="1"/>
        {/* Oven door */}
        <rect x="6" y="12" width="20" height="14" rx="1" fill="#2d3436" stroke="#636e72" strokeWidth="0.5"/>
        {/* Oven window */}
        <rect x="8" y="14" width="16" height="8" rx="1" fill="#74b9ff" fillOpacity="0.3"/>
        {/* Heat lines/flames */}
        <path d="M10 18 L12 16 L14 18 L16 16 L18 18 L20 16 L22 18" 
              stroke="#fdcb6e" strokeWidth="1.5" fill="none"/>
        {/* Control knobs */}
        <circle cx="10" cy="10" r="1.5" fill="#636e72"/>
        <circle cx="22" cy="10" r="1.5" fill="#636e72"/>
        {/* AI spark */}
        <circle cx="24" cy="6" r="2" fill="#00b894" opacity="0.8"/>
        <text x="24" y="7" textAnchor="middle" className="text-[6px] fill-white font-bold">AI</text>
      </svg>
    </div>
  </div>
);

export default function IntegrationVisualization() {
  const { t } = useTranslation('common');
  
  // Real company SVG icons and brand colors
  const integrationPlatforms = [
    { 
      name: 'Salesforce', 
      color: 'bg-blue-600', 
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current text-white">
          <path d="M8.48 3.6c-.32 0-.64.02-.95.06C4.8 4.23 2.4 6.8 2.4 9.95c0 1.92.77 3.67 2.02 4.94.3.31.8.12.8-.3v-1.8c0-.44-.36-.8-.8-.8-.66 0-1.2-.54-1.2-1.2 0-1.43 1.17-2.6 2.6-2.6.44 0 .8-.36.8-.8V5.6c0-.44.36-.8.8-.8h1.46c.44 0 .8.36.8.8v1.8c0 .44.36.8.8.8 2.2 0 4 1.8 4 4s-1.8 4-4 4h-6c-.44 0-.8.36-.8.8v1.6c0 .44.36.8.8.8h6c3.31 0 6-2.69 6-6s-2.69-6-6-6c0-1.1-.9-2-2-2z"/>
        </svg>
      ) 
    },
    { 
      name: 'HubSpot', 
      color: 'bg-orange-500', 
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current text-white">
          <path d="M18.164 7.931l-3.345-1.932c-.37-.213-.84-.087-1.053.283-.213.37-.087.84.283 1.053l3.345 1.932c.37.213.84.087 1.053-.283.213-.37.087-.84-.283-1.053zm-4.511 8.138c-.37-.213-.84-.087-1.053.283l-1.932 3.345c-.213.37-.087.84.283 1.053.37.213.84.087 1.053-.283l1.932-3.345c.213-.37.087-.84-.283-1.053zm-8.138-4.511c-.213-.37-.683-.496-1.053-.283-.37.213-.496.683-.283 1.053l1.932 3.345c.213.37.683.496 1.053.283.37-.213.496-.683.283-1.053l-1.932-3.345zM12 15.5c-1.933 0-3.5-1.567-3.5-3.5s1.567-3.5 3.5-3.5 3.5 1.567 3.5 3.5-1.567 3.5-3.5 3.5zm0-5.5c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2z"/>
        </svg>
      ) 
    },
    { 
      name: 'Monday.com', 
      color: 'bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500', 
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current text-white">
          <path d="M6 3h3v18H6zm4.5 0h3v18h-3zM15 3h3v18h-3z"/>
        </svg>
      ) 
    },
    { 
      name: 'Jira', 
      color: 'bg-blue-500', 
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current text-white">
          <path d="M11.57 0h-.05C9.23 0 7.25 1.58 6.6 3.75c-.57 1.9.28 3.96 2.01 4.88l.95.5v7.37c0 .55.45 1 1 1s1-.45 1-1V8.75l-.95-.5c-1.73-.92-2.58-2.98-2.01-4.88C9.25 1.58 11.23 0 13.52 0h.05c.55 0 1-.45 1-1s-.45-1-1-1z"/>
          <path d="M19.35 5.5c-1.87-1.87-4.9-1.87-6.77 0l-4.95 4.95c-.78.78-.78 2.05 0 2.83.78.78 2.05.78 2.83 0l4.95-4.95c.31-.31.82-.31 1.13 0 .31.31.31.82 0 1.13l-4.95 4.95c-.78.78-.78 2.05 0 2.83.78.78 2.05.78 2.83 0l4.95-4.95c1.87-1.87 1.87-4.9 0-6.77z"/>
        </svg>
      ) 
    },
    { 
      name: 'Meta*', 
      color: 'bg-blue-600', 
      icon: (
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current text-white">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.25 16.5h-2.25l-1.5-3.75L12 16.5H9.75l-1.5-3.75L6.75 16.5H4.5l3-7.5h2.25L12 13.5l2.25-4.5h2.25l3 7.5z"/>
        </svg>
      ) 
    },
  ];

  // Custom Webhook layer
  const webhookNodes = [
    { name: 'API Gateway', icon: 'LINK' },
    { name: 'Data Sync', icon: 'REFRESH' },
    { name: 'Real-time Events', icon: 'FAST' },
  ];


  return (
    <div className="flex flex-col lg:flex-row gap-12 items-center justify-center">
      {/* Central Hub Visualization */}
      <div className="relative flex h-[500px] w-full max-w-[500px] items-center justify-center">
        {/* CRM Demo Central Hub */}
        <div className="relative z-20 flex flex-col items-center">
          <CRMDemoLogo />
          <div className="mt-3 text-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">CRM Demo</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">Central Hub</p>
          </div>
        </div>

        {/* Custom Webhook Layer (Inner Orbit) */}
        <OrbitingCircles
          className="size-[300px] border border-dashed border-gray-300/50"
          duration={15}
          delay={0}
          radius={120}
        >
          {webhookNodes.map((node, index) => (
            <div 
              key={node.name}
              className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full border-2 border-gray-600 shadow-lg transform-gpu"
              style={{ animationDelay: `${index * (15 / webhookNodes.length)}s` }}
            >
              <span className="text-lg">{node.icon}</span>
            </div>
          ))}
        </OrbitingCircles>

        {/* Platform Integrations (Outer Orbit) */}
        <OrbitingCircles
          className="size-[450px] border border-dashed border-blue-200/30"
          duration={25}
          delay={0}
          radius={190}
          reverse
        >
          {integrationPlatforms.map((platform, index) => (
            <div 
              key={platform.name}
              className={`flex items-center justify-center w-16 h-16 ${platform.color} rounded-full shadow-lg border-2 border-white/20 transform-gpu hover:scale-110 transition-transform duration-300`}
              style={{ animationDelay: `${index * (25 / integrationPlatforms.length)}s` }}
            >
              {platform.icon}
            </div>
          ))}
        </OrbitingCircles>

        {/* Data Flow Indicators */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-green-400 rounded-full animate-ping" 
               style={{ transform: 'translate(-50%, -50%)', animationDelay: '0s' }} />
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-ping" 
               style={{ transform: 'translate(-50%, -50%)', animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-purple-400 rounded-full animate-ping" 
               style={{ transform: 'translate(-50%, -50%)', animationDelay: '2s' }} />
        </div>
      </div>

      {/* Integration Details Panel */}
      <div className="flex-1 max-w-md space-y-6">
        <div className="text-center lg:text-left">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('integration.title', 'Seamless CRM Integration')}
          </h2>
          <p className="text-gray-600 dark:text-slate-400">
            {t('integration.subtitle', 'CRM Demo connects to your existing tools through secure webhooks and APIs')}
          </p>
        </div>

        {/* Webhook Layer Info */}
        <motion.div 
          className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border-l-4 border-gray-500"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            {t('integration.webhookLayer.title', 'Custom Webhook Layer')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            {t('integration.webhookLayer.description', 'Secure API gateway with real-time data synchronization between CRM Demo and your CRM platforms')}
          </p>
        </motion.div>

        {/* Platform Details */}
        <div className="space-y-3">
          {integrationPlatforms.map((platform, index) => (
            <motion.div 
              key={platform.name}
              className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className={`flex items-center justify-center w-10 h-10 ${platform.color} rounded-full shadow-sm`}>
                {platform.icon}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{platform.name}</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {platform.name === 'Salesforce' && 'Cloud CRM & Sales'}
                  {platform.name === 'HubSpot' && 'Inbound Marketing'}
                  {platform.name === 'Monday.com' && 'Project Management'}
                  {platform.name === 'Jira' && 'Issue & Project Tracking'}
                  {platform.name === 'Meta' && 'Social Media Integration'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Real-time Synchronization</h3>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            All data flows automatically between CRM Demo and your existing CRM tools with zero manual work required
          </p>
        </motion.div>
      </div>
    </div>
  );
} 