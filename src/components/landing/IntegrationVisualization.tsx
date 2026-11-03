import { useTranslation } from 'react-i18next';
import { ArrowRight, FileSpreadsheet, Link2, MessageSquare, RefreshCw, Webhook, Zap } from 'lucide-react';
import { BrandMark } from '@/components/brand/BrandMark';

/**
 * How data moves: lead sources in, CRM Demo in the middle, your CRM out.
 * Platform names are set as text: we do not redraw other companies' logos.
 */
export default function IntegrationVisualization() {
  const { t } = useTranslation('common');

  const sources = [
    { name: 'CSV import', icon: FileSpreadsheet },
    { name: 'Lead API', icon: Link2 },
    { name: 'WhatsApp Business', icon: MessageSquare },
  ];

  const platforms = [
    { name: 'Salesforce', note: 'Cloud CRM & Sales' },
    { name: 'HubSpot', note: 'Inbound Marketing' },
    { name: 'Monday.com', note: 'Project Management' },
    { name: 'Jira', note: 'Issue & Project Tracking' },
    { name: 'Meta*', note: 'Social Media Integration' },
  ];

  const webhookNodes = [
    { name: 'API Gateway', icon: Link2 },
    { name: 'Data Sync', icon: RefreshCw },
    { name: 'Real-time Events', icon: Zap },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto_1.1fr_auto_1fr] lg:items-stretch" data-testid="integration-flow">
      {/* Sources */}
      <div className="rounded-lg border border-border bg-surface p-5">
        <p className="text-xs font-medium text-muted-foreground">Leads come in</p>
        <ul className="mt-3 space-y-2">
          {sources.map(({ name, icon: Icon }) => (
            <li key={name} className="flex items-center gap-2.5 text-sm font-medium text-foreground">
              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              {name}
            </li>
          ))}
        </ul>
      </div>

      <Connector />

      {/* Hub */}
      <div className="rounded-lg border border-ink-800 bg-ink-900 p-5 text-ink-100 dark:border-ink-700">
        <div className="flex items-center gap-2.5">
          <BrandMark className="h-7 w-7" />
          <div>
            <h3 className="text-[15px] font-semibold text-white">CRM Demo</h3>
            <p className="text-xs text-ink-300">Central Hub</p>
          </div>
        </div>
        <p className="mt-4 text-sm font-medium text-white">
          {t('integration.webhookLayer.title', 'Custom Webhook Layer')}
        </p>
        <p className="mt-1 text-sm leading-6 text-ink-300">
          {t('integration.webhookLayer.description', 'Secure API gateway with real-time data synchronization between CRM Demo and your CRM platforms')}
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {webhookNodes.map(({ name, icon: Icon }) => (
            <li key={name} className="inline-flex items-center gap-1.5 rounded-full border border-ink-700 px-2.5 py-1 text-xs font-medium text-ink-100">
              <Icon className="h-3.5 w-3.5 text-ember-300" aria-hidden="true" />
              {name}
            </li>
          ))}
        </ul>
      </div>

      <Connector />

      {/* Destinations */}
      <div className="rounded-lg border border-border bg-surface p-5">
        <p className="text-xs font-medium text-muted-foreground">
          {t('integration.subtitle', 'CRM Demo connects to your existing tools through secure webhooks and APIs')}
        </p>
        <ul className="mt-3 divide-y divide-border">
          {platforms.map(({ name, note }) => (
            <li key={name} className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0">
              <span className="text-sm font-semibold text-foreground">{name}</span>
              <span className="text-xs text-muted-foreground">{note}</span>
            </li>
          ))}
          <li className="flex items-center gap-2 pt-2 text-sm font-semibold text-foreground">
            <Webhook className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Custom Webhooks
          </li>
        </ul>
      </div>

      <p className="text-sm text-muted-foreground lg:col-span-5">
        <span className="font-medium text-foreground">Real-time Synchronization.</span>{' '}
        All data flows automatically between CRM Demo and your existing CRM tools with zero manual work required
      </p>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex items-center justify-center text-ink-400 lg:px-1" aria-hidden="true">
      <ArrowRight className="h-5 w-5 rotate-90 lg:rotate-0 rtl:lg:rotate-180" />
    </div>
  );
}
