/**
 * Queue Management Page
 * Main page for managing WhatsApp message queue
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import QueueManagementDashboard from '@/components/queue/QueueManagementDashboard';

const Queue: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('queue.page.title')} | CRM Demo</title>
        <meta name="description" content={t('queue.page.description')} />
      </Helmet>
      
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
                {t('common.back')}
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('queue.page.title')}</h1>
              <p className="text-muted-foreground">
                {t('queue.page.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Queue Management Dashboard */}
        <QueueManagementDashboard
          maxHeight="calc(100vh - 200px)"
          onSelectionChange={(selectedIds) => {
            console.log('Selected queue items:', selectedIds);
          }}
        />
      </div>
    </>
  );
};

export default Queue; 