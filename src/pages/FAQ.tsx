import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  HelpCircle, 
  MessageSquare, 
  Users, 
  Calendar, 
  BarChart3,
  Settings,
  FileText,
  Zap,
  Clock,
  Shield,
  Smartphone,
  Globe,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  Star,
  Database,
  Target,
  TrendingUp,
  Calculator,
  Upload,
  Download,
  Filter,
  RefreshCw,
  Workflow,
  Bell,
  Eye,
  Layout,
  Layers,
  PieChart,
  BarChart,
  LineChart,
  Activity,
  Thermometer,
  UserCheck,
  Building,
  Phone,
  Mail,
  Hash,
  Percent,
  Timer,
  Languages,
  MousePointer,
  Tablet,
  MonitorSpeaker,
  Cog,
  Cloud,
  Link,
  ExternalLink,
  Key,
  Lock,
  Unlock,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Share2,
  Save,
  Import,
  Folder,
  FolderOpen,
  Tag,
  Calendar as CalendarIcon
} from 'lucide-react';
import { PublicPageShell } from '@/components/marketing/PublicPageShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLang } from '@/hooks/useLang';
import { cn } from '@/lib/utils';

const FAQ: React.FC = () => {
  const { t } = useTranslation(['pages', 'common']);
  const { isRTL } = useLang();
  // ?q= pre-fills the search (the 404 page's search box sends visitors here)
  const [searchQuery, setSearchQuery] = useState(() => new URLSearchParams(window.location.search).get('q') ?? '');
  const [activeCategory, setActiveCategory] = useState('all');

  // Enhanced FAQ Categories with more comprehensive coverage
  const categories = [
    { id: 'all', name: t('pages:faq.categories.all', 'All Topics'), icon: BookOpen },
    { id: 'getting-started', name: t('pages:faq.categories.gettingStarted', 'Getting Started'), icon: PlayCircle },
    { id: 'queue', name: t('pages:faq.categories.queue', 'Queue Management'), icon: Workflow },
    { id: 'leads', name: t('pages:faq.categories.leads', 'Lead Management'), icon: Users },
    { id: 'messages', name: t('pages:faq.categories.messages', 'Messages & WhatsApp'), icon: MessageSquare },
    { id: 'calendar', name: t('pages:faq.categories.calendar', 'Calendar & Meetings'), icon: Calendar },
    { id: 'analytics', name: t('pages:faq.categories.analytics', 'Analytics & Reports'), icon: BarChart3 },
    { id: 'widgets', name: t('pages:faq.categories.widgets', 'Dashboard Widgets'), icon: Layout },
    { id: 'projects', name: t('pages:faq.categories.projects', 'Projects'), icon: Folder },
    { id: 'admin', name: t('pages:faq.categories.admin', 'Admin Console'), icon: Shield },
    { id: 'integrations', name: t('pages:faq.categories.integrations', 'Integrations & APIs'), icon: Link },
    { id: 'templates', name: t('pages:faq.categories.templates', 'Templates & Automation'), icon: FileText },
    { id: 'notifications', name: t('pages:faq.categories.notifications', 'Notifications'), icon: Bell },
    { id: 'rtl', name: t('pages:faq.categories.rtl', 'Language & RTL'), icon: Languages },
    { id: 'mobile', name: t('pages:faq.categories.mobile', 'Mobile Experience'), icon: Smartphone },
    { id: 'technical', name: t('pages:faq.categories.technical', 'Technical Support'), icon: Settings },
  ];

  // Comprehensive FAQ Data with all new features
  const faqData = [
    // ===== GETTING STARTED =====
    {
      id: 'first-login',
      category: 'getting-started',
      question: t('pages:faq.gettingStarted.firstLogin.question', 'How do I log in for the first time?'),
      answer: t('pages:faq.gettingStarted.firstLogin.answer', 'Go to the login page, enter your email and password. Use the test credentials from your local test-credentials.local file for testing. You can also use Google or Facebook authentication. If you don\'t have an account, click "Sign Up" to create one.'),
      steps: [
        t('pages:faq.gettingStarted.firstLogin.step1', 'Navigate to the login page at /auth/login'),
        t('pages:faq.gettingStarted.firstLogin.step2', 'Enter your email and password (use test credentials from test-credentials.local file for demo)'),
        t('pages:faq.gettingStarted.firstLogin.step3', 'Click "Sign In" or choose social login'),
        t('pages:faq.gettingStarted.firstLogin.step4', 'Complete email verification if required')
      ],
      tags: ['login', 'authentication', 'first-time', 'demo']
    },
    {
      id: 'dashboard-overview',
      category: 'getting-started',
      question: t('pages:faq.gettingStarted.dashboard.question', 'How do I navigate the dashboard?'),
      answer: t('pages:faq.gettingStarted.dashboard.answer', 'The dashboard is your central hub showing real-time metrics. Use the sidebar to navigate between Leads, Messages, Queue, Calendar, Reports, and Settings. The main area shows customizable widgets with live data including BANT qualification rates, lead temperature distribution, and conversion metrics.'),
      steps: [
        t('pages:faq.gettingStarted.dashboard.step1', 'Familiarize yourself with the sidebar navigation - Leads, Messages, Queue, Calendar, Reports, Settings'),
        t('pages:faq.gettingStarted.dashboard.step2', 'Explore dashboard widgets: Total Leads, BANT Qualification Rate, Hot & Burning Leads, First Message Rate'),
        t('pages:faq.gettingStarted.dashboard.step3', 'Use the global search in the top bar and language toggle (WEB)'),
        t('pages:faq.gettingStarted.dashboard.step4', 'Check notifications and access profile settings in the top-right corner')
      ],
      tags: ['dashboard', 'navigation', 'widgets', 'metrics', 'sidebar']
    },
    {
      id: 'system-overview',
      category: 'getting-started',
      question: 'What are the main features of CRM Demo?',
      answer: 'CRM Demo is a comprehensive WhatsApp Business automation platform with lead management, BANT/HEAT scoring, automated messaging, queue management, Calendly integration, advanced analytics, and full Hebrew/RTL support. It handles everything from lead capture to conversion tracking.',
      steps: [
        'Lead Management: Add, import, and qualify leads with BANT/HEAT scoring',
        'Queue Management: Automate WhatsApp messaging with business hours and daily targets',
        'Messages: Manage WhatsApp conversations with templates and automated responses',
        'Calendar: Schedule meetings with Calendly integration and booking links',
        'Analytics: Track conversion rates, response times, and lead progression',
        'Reports: Generate detailed performance reports and export data'
      ],
      tags: ['overview', 'features', 'platform', 'whatsapp', 'automation']
    },

    // ===== QUEUE MANAGEMENT =====
    {
      id: 'queue-how-it-works',
      category: 'queue',
      question: 'How does the Queue Management system work?',
      answer: 'The Queue Management system automates WhatsApp messaging with business rules. It processes leads during business hours, respects daily targets (default 45 leads/day), handles retries for failed messages, and provides real-time monitoring. Leads progress through stages: Pending → Queued → Processing → Completed/Failed.',
      steps: [
        'Navigate to Queue Management from the sidebar',
        'View queue metrics: depth, processing rate, success rate, daily progress',
        'Use the Lead Queue tab to manage which leads are queued',
        'Configure settings in Queue Management tab: business hours, daily targets, retry attempts',
        'Monitor processing in real-time with status updates'
      ],
      tags: ['queue', 'automation', 'whatsapp', 'business-hours', 'daily-targets']
    },
    {
      id: 'queue-bulk-operations',
      category: 'queue',
      question: 'How do I queue multiple leads at once?',
      answer: 'Use bulk operations in the Queue Management page. Select multiple leads using checkboxes, then use bulk actions to queue, remove, or schedule leads. The system shows conflicts (already queued leads) and allows you to proceed anyway. Bulk operations support up to hundreds of leads at once.',
      steps: [
        'Go to Queue Management → Lead Queue tab',
        'Select leads using individual checkboxes or "Select All"',
        'Click bulk action buttons: "Queue Selected", "Remove from Queue", or "Schedule"',
        'Review any conflicts (leads already queued) in the preview',
        'Confirm the operation - leads will be processed according to business rules'
      ],
      tags: ['queue', 'bulk-operations', 'leads', 'selection', 'conflicts']
    },
    {
      id: 'queue-business-hours',
      category: 'queue',
      question: 'How do I configure business hours and daily targets?',
      answer: 'Configure queue settings in Queue Management → Queue Management tab. Set business hours (default 9 AM - 5 PM), daily targets (default 45 leads), weekend processing, retry attempts (default 3), and processing delays. The system automatically pauses outside business hours and resumes the next business day.',
      steps: [
        'Navigate to Queue Management → Queue Management tab',
        'Set business hours: start time, end time, timezone',
        'Configure daily target (recommended: 45 leads for optimal performance)',
        'Enable/disable weekend processing',
        'Set retry attempts for failed messages (1-10 retries)',
        'Adjust processing delay between messages (default: 30 minutes)'
      ],
      tags: ['queue', 'business-hours', 'daily-targets', 'configuration', 'timezone']
    },
    {
      id: 'queue-monitoring',
      category: 'queue',
      question: 'How do I monitor queue performance and health?',
      answer: 'The Queue Management dashboard shows real-time metrics: queue depth, processing rate, success rate, daily progress, and completion estimates. Use the Audit Trail tab to track all queue actions. Monitor alerts for capacity issues, failed messages, or configuration problems.',
      steps: [
        'Check queue metrics cards: Queue Depth, Processing Rate, Success Rate, Daily Progress',
        'Monitor the "Avg Time" metric for processing speed per lead',
        'Review queue status: Running/Paused with start/pause controls',
        'Use the Audit Trail tab to see detailed action history',
        'Watch for alerts about capacity limits or processing issues'
      ],
      tags: ['queue', 'monitoring', 'metrics', 'performance', 'audit-trail']
    },

    // ===== LEAD MANAGEMENT =====
    {
      id: 'add-leads',
      category: 'leads',
      question: 'How do I add leads to the system?',
      answer: 'Add leads in multiple ways: manual form entry, CSV bulk import, or automatic creation from WhatsApp conversations. Each lead includes contact information, company details, BANT/HEAT scoring, and project assignment. Leads are automatically validated and can be enhanced with additional metadata.',
      steps: [
        'Go to Leads page from the sidebar',
        'Click "Add New Lead" for manual entry',
        'Or click "Import CSV" for bulk upload (supports name, phone, email, company fields)',
        'Fill in required fields: first name, last name, phone number',
        'Set optional fields: company, position, location, notes',
        'Assign BANT status and initial temperature (cold/warm/hot/burning)',
        'Save the lead - it will be available for queue management and conversations'
      ],
      tags: ['leads', 'add', 'import', 'csv', 'manual', 'bant', 'heat']
    },
    {
      id: 'bant-heat-scoring',
      category: 'leads',
      question: 'What is BANT/HEAT lead scoring and how is it calculated?',
      answer: 'BANT (Budget, Authority, Need, Timeline) evaluates lead quality based on decision-making criteria. HEAT (Hot, Warm, Cold, Burning) tracks engagement temperature. BANT uses status progression, HEAT combines interaction count, recent activity, status scores, and human review flags. Burning leads (85+ points) get highest priority.',
      steps: [
        'BANT Qualification: Budget (can afford), Authority (decision maker), Need (has requirement), Timeline (ready to buy)',
        'HEAT Calculation: Status progression (10-90 points) + Interaction count (up to 25 points) + Recent activity bonus (15 points for <3 days) + Human review flag (+20 points)',
        'Temperature Ranges: Cold (0-39), Warm (40-64), Hot (65-84), Burning (85+)',
        'View scores in Leads section, Dashboard widgets, and Reports',
        'Use scoring for lead prioritization and queue management'
      ],
      tags: ['bant', 'heat', 'scoring', 'qualification', 'temperature', 'calculation']
    },
    {
      id: 'lead-filtering-search',
      category: 'leads',
      question: 'How do I filter and search leads effectively?',
      answer: 'Use advanced filtering in the Leads section with multiple criteria: text search, status, temperature, project, BANT qualification, queue status, and date ranges. Combine filters for precise results. Save common filter combinations and use bulk operations on filtered sets.',
      steps: [
        'Use the search bar for quick text search across names, phone, email, company',
        'Apply filters: Status (new, contacted, qualified, converted), Temperature (cold, warm, hot, burning)',
        'Filter by Queue Status: not queued, queued, processing, completed, failed',
        'Use date filters: created date, last contacted, next follow-up',
        'Filter by BANT status: no BANT, partially qualified, fully qualified',
        'Combine multiple filters and sort by various criteria (name, date, score)'
      ],
      tags: ['leads', 'filtering', 'search', 'advanced-filters', 'bulk-operations']
    },
    {
      id: 'lead-lifecycle',
      category: 'leads',
      question: 'What is the complete lead lifecycle in CRM Demo?',
      answer: 'Leads progress through stages: Creation (manual/import/WhatsApp) → BANT Qualification → Queue Management → WhatsApp Outreach → Conversation Management → Meeting Scheduling → Conversion Tracking. Each stage has specific statuses and automated workflows.',
      steps: [
        'Lead Creation: Added manually, imported via CSV, or created from incoming WhatsApp messages',
        'Initial Qualification: Set BANT criteria and initial temperature based on source and context',
        'Queue Processing: Leads enter automation queue based on priority and business rules',
        'WhatsApp Outreach: Automated messages sent during business hours with templates',
        'Conversation Management: Two-way WhatsApp conversations tracked in Messages section',
        'Meeting Scheduling: Calendly integration for booking meetings directly from conversations',
        'Conversion Tracking: Final status tracking (converted, lost) with analytics'
      ],
      tags: ['leads', 'lifecycle', 'workflow', 'automation', 'conversion']
    },

    // ===== MESSAGES & WHATSAPP =====
    {
      id: 'whatsapp-conversations',
      category: 'messages',
      question: 'How do I manage WhatsApp conversations?',
      answer: 'The Messages section shows all WhatsApp conversations with real-time updates. Click any conversation to view full message history, lead context, BANT/HEAT scores, and quick actions. Send replies, schedule meetings, or update lead status directly from the conversation interface.',
      steps: [
        'Navigate to Messages from the sidebar',
        'View conversation list with lead names, last message preview, and timestamps',
        'Click on any conversation to open the detailed chat interface',
        'Review conversation history, lead information panel, and BANT/HEAT scores',
        'Send replies using the message input field',
        'Use quick actions: Schedule Meeting, Update Lead Status, Add Notes',
        'Access Calendly booking links directly from the conversation'
      ],
      tags: ['messages', 'whatsapp', 'conversations', 'real-time', 'lead-context']
    },
    {
      id: 'message-templates',
      category: 'messages',
      question: 'How do I create and use message templates?',
      answer: 'Create reusable message templates with variables for personalization. Templates support dynamic fields like {name}, {company}, and custom variables. Use templates for automated responses, quick manual sending, or as part of queue automation workflows.',
      steps: [
        'Go to Templates section (accessible from Messages or Settings)',
        'Click "Create Template" to start a new template',
        'Write your message content with variables: {name}, {company}, {position}',
        'Set template category: greeting, follow-up, meeting-request, closing',
        'Configure automation rules: when to send automatically',
        'Test template with sample data before saving',
        'Use templates in queue automation or manual message sending'
      ],
      tags: ['templates', 'messages', 'automation', 'personalization', 'variables']
    },
    {
      id: 'whatsapp-integration-setup',
      category: 'messages',
      question: 'How do I set up WhatsApp Business integration?',
      answer: 'WhatsApp integration connects to Meta WhatsApp Business API for automated messaging. Set up requires WhatsApp Business account, Meta Business verification, webhook configuration, and message template approval. The system handles authentication and API management automatically.',
      steps: [
        'Ensure you have a WhatsApp Business account verified with Meta',
        'Go to Settings → Integrations → WhatsApp',
        'Connect your WhatsApp Business account using provided credentials',
        'Configure webhook URLs for message receiving (handled automatically)',
        'Set up message templates in Meta Business Manager for approval',
        'Test integration with sample messages',
        'Configure automation rules and business hours for messaging'
      ],
      tags: ['whatsapp', 'integration', 'meta', 'business-api', 'setup', 'webhook']
    },

    // ===== CALENDAR & MEETINGS =====
    {
      id: 'calendly-integration',
      category: 'calendar',
      question: 'How do I set up Calendly integration?',
      answer: 'CRM Demo supports two Calendly integration methods: OAuth (user authorization) and Personal Access Token (PAT). OAuth requires user login to Calendly, while PAT uses a token from your Calendly account. Both methods allow meeting scheduling directly from conversations and calendar sync.',
      steps: [
        'Go to Settings → Integrations → Calendly',
        'Choose integration method: OAuth (recommended for new users) or PAT (for advanced users)',
        'For OAuth: Click "Connect Calendly" and authorize access in the popup',
        'For PAT: Get your Personal Access Token from calendly.com/integrations/api_webhooks',
        'Enter your PAT in the provided field and click "Connect"',
        'Test connection by viewing your Calendly scheduling URL',
        'Configure default meeting types and duration settings'
      ],
      tags: ['calendly', 'integration', 'oauth', 'pat', 'meetings', 'scheduling']
    },
    {
      id: 'meeting-scheduling',
      category: 'calendar',
      question: 'How do I schedule meetings with leads?',
      answer: 'Schedule meetings directly from WhatsApp conversations, the Calendar page, or lead profiles. Use integrated Calendly booking links or manual calendar entry. Meetings automatically link to lead records and conversation context for seamless follow-up.',
      steps: [
        'From Messages: Open a conversation, click "Schedule Meeting" above the chat',
        'From Calendar: Navigate to Calendar page, click "Schedule Meeting" or use calendar grid',
        'From Leads: Open lead profile, click "Schedule Meeting" in the actions section',
        'Choose meeting type: Calendly booking link or manual scheduling',
        'For Calendly: Share booking link directly in WhatsApp or copy for external use',
        'For manual: Select date, time, duration, and add meeting notes',
        'Meeting context (lead info, conversation history) is automatically attached'
      ],
      tags: ['meetings', 'scheduling', 'calendly', 'conversations', 'lead-context']
    },
    {
      id: 'calendar-management',
      category: 'calendar',
      question: 'How do I manage my calendar and view meetings?',
      answer: 'The Calendar page shows all scheduled meetings with lead context, Calendly bookings, and manual appointments. View by month/week/day, filter by meeting type, and access full conversation history for each meeting. Track meeting outcomes and follow-up actions.',
      steps: [
        'Navigate to Calendar from the sidebar',
        'View meetings in calendar grid (month view) or list format',
        'Click on any meeting to see details: lead info, conversation context, meeting notes',
        'Use filters: meeting type, status (scheduled, completed, cancelled)',
        'Access Calendly booking link management and availability settings',
        'Track meeting outcomes: completed, no-show, rescheduled',
        'Add follow-up actions and notes after meetings'
      ],
      tags: ['calendar', 'meetings', 'management', 'calendly', 'tracking', 'follow-up']
    },

    // ===== ANALYTICS & REPORTS =====
    {
      id: 'dashboard-metrics',
      category: 'analytics',
      question: 'How are dashboard metrics calculated?',
      answer: 'Dashboard metrics use real-time data calculations: BANT Qualification Rate (qualified leads / total assessed), Lead Temperature Distribution (based on engagement scoring), First Message Rate (contacted leads / total leads), and Meeting Pipeline (scheduled meetings / conversations). All metrics include weekly trend comparisons.',
      steps: [
        'Total Leads: Count of all leads in the current project or system-wide',
        'BANT Qualification Rate: (Qualified leads / Total assessed leads) × 100',
        'Hot & Burning Leads: Leads with temperature scores 65+ points',
        'First Message Rate: (Contacted leads / Total leads) × 100',
        'Temperature Distribution: Cold (0-39), Warm (40-64), Hot (65-84), Burning (85+)',
        'Weekly Trends: Comparison with previous 7-day period',
        'All metrics filter by current project selection'
      ],
      tags: ['dashboard', 'metrics', 'calculation', 'bant', 'temperature', 'trends']
    },
    {
      id: 'reports-system',
      category: 'analytics',
      question: 'How do I generate and export reports?',
      answer: 'The Reports system provides 7 comprehensive report types: Lead Funnel Analysis, Temperature Shift Over Time, Agent Performance, Message Cadence, Lead Engagement Timeline, Drop-Off & Churn Analysis, and Time-to-Warm Metrics. Export as CSV, PDF, or JSON with custom date ranges and filters.',
      steps: [
        'Navigate to Reports from the sidebar',
        'Choose report type from the available templates',
        'Set date range: last 7 days, 30 days, 90 days, or custom range',
        'Apply filters: project, lead status, temperature, agent/user',
        'Click "Generate Report" to create the analysis',
        'Review charts, tables, and insights in the report interface',
        'Export using the "Export" button: CSV for data, PDF for presentation'
      ],
      tags: ['reports', 'analytics', 'export', 'csv', 'pdf', 'charts', 'insights']
    },
    {
      id: 'advanced-analytics',
      category: 'analytics',
      question: 'What advanced analytics are available?',
      answer: 'Advanced analytics include: Conversion funnel analysis, hourly activity patterns, agent performance comparisons, lead engagement timelines, temperature progression tracking, message response rates, meeting conversion rates, and predictive scoring. Access through Reports and Messages Analytics pages.',
      steps: [
        'Lead Funnel Analysis: Track conversion through stages (new → contacted → qualified → meeting → closed)',
        'Temperature Shift Analysis: Monitor how leads progress from cold to hot over time',
        'Agent Performance: Compare team members on meetings set, conversion rates, response times',
        'Message Cadence: Analyze optimal timing and frequency for WhatsApp outreach',
        'Lead Engagement Timeline: Track individual lead interactions and progression',
        'Drop-Off Analysis: Identify where leads exit the funnel and why',
        'Time-to-Warm Metrics: Measure how quickly leads engage and progress'
      ],
      tags: ['analytics', 'advanced', 'funnel', 'performance', 'engagement', 'conversion']
    },

    // ===== DASHBOARD WIDGETS =====
    {
      id: 'widget-system',
      category: 'widgets',
      question: 'How do dashboard widgets work and what do they show?',
      answer: 'Dashboard widgets display real-time metrics with customizable layouts. Core widgets include Total Leads, BANT Qualification Rate, Hot & Burning Leads, First Message Rate, and Temperature Distribution. Each widget shows current values, trends, and detailed breakdowns with drill-down capabilities.',
      steps: [
        'View default widgets on the Dashboard: 4 main metric cards + temperature chart',
        'Click on any widget to see detailed breakdown and historical data',
        'Hover over widgets to see tooltips with calculation explanations',
        'Use the Widget Bank (right sidebar) to add/remove widgets',
        'Customize widget arrangement by dragging and dropping',
        'Set widget refresh intervals and data filtering options',
        'Export widget data using the action menu in each widget'
      ],
      tags: ['widgets', 'dashboard', 'customization', 'real-time', 'metrics', 'layout']
    },
    {
      id: 'widget-calculations',
      category: 'widgets',
      question: 'How are widget values calculated and what do they mean?',
      answer: 'Widget calculations use real database data: Total Leads (count of all leads), BANT Qualification Rate (percentage of leads with qualifying BANT status), Hot & Burning Leads (leads with 65+ temperature points), First Message Rate (percentage of leads contacted), Temperature Distribution (lead scoring algorithm results).',
      steps: [
        'Total Leads: Direct count from leads table, filtered by current project',
        'BANT Qualification Rate: Leads with status partially_qualified, fully_qualified, etc. / total leads',
        'Hot & Burning Leads: Leads with calculated temperature score 65+ points',
        'First Message Rate: Leads with interaction_count > 0 / total leads',
        'Temperature Calculation: Status progression (10-90) + interactions (0-25) + recent activity (0-15) + human review (0-20)',
        'Weekly Trends: Current period vs. previous 7-day period comparison',
        'All calculations respect project filtering and real-time data updates'
      ],
      tags: ['calculations', 'widgets', 'bant', 'temperature', 'metrics', 'real-time']
    },
    {
      id: 'widget-customization',
      category: 'widgets',
      question: 'How do I customize and manage dashboard widgets?',
      answer: 'Customize widgets using the Widget Bank sidebar: add new widgets, remove existing ones, adjust sizes, and create custom layouts. Available widgets include core metrics, CRM analytics, performance indicators, and specialized charts. Save multiple dashboard configurations for different use cases.',
      steps: [
        'Click the Widget Bank toggle (if visible) or look for customization options',
        'Browse available widgets by category: Core Metrics, CRM Analytics, Performance',
        'Drag widgets from the bank to the dashboard to add them',
        'Remove widgets by clicking the X or dragging them back to the bank',
        'Resize widgets by dragging corners (if resizable widgets are enabled)',
        'Arrange widgets by dragging to reorder them',
        'Save custom configurations for different dashboard views'
      ],
      tags: ['widgets', 'customization', 'dashboard', 'layout', 'widget-bank', 'configuration']
    },

    // ===== PROJECTS =====
    {
      id: 'project-management',
      category: 'projects',
      question: 'How do projects work and how do I manage them?',
      answer: 'Projects organize leads, conversations, and activities into separate workspaces. Each project has its own analytics, queue settings, and team members. Switch between projects using the project selector in the top bar. Project-based filtering applies to all dashboard metrics and reports.',
      steps: [
        'View current project in the top navigation bar (project selector)',
        'Click the project selector to see all available projects',
        'Switch projects to filter all data (leads, conversations, analytics) by project',
        'Create new projects from Settings → Projects section',
        'Assign leads to projects during creation or by editing existing leads',
        'Configure project-specific settings: team members, targets, automation rules',
        'View project analytics and performance in Dashboard and Reports'
      ],
      tags: ['projects', 'organization', 'filtering', 'teams', 'analytics', 'workspace']
    },
    {
      id: 'project-analytics',
      category: 'projects',
      question: 'How do I view analytics for specific projects?',
      answer: 'Project analytics filter all dashboard metrics, reports, and data views by the selected project. Switch projects using the project selector to see project-specific performance. Each project maintains separate: lead counts, conversion rates, queue metrics, message analytics, and team performance.',
      steps: [
        'Select a specific project from the project selector in the top bar',
        'View project-filtered dashboard showing only leads and activities for that project',
        'Generate reports with project filtering automatically applied',
        'Check Queue Management metrics specific to project leads',
        'Review Messages section filtered to project conversations',
        'Compare project performance using the Reports → Project Comparison view',
        'Export project-specific data for external analysis'
      ],
      tags: ['projects', 'analytics', 'filtering', 'performance', 'reports', 'comparison']
    },

    // ===== RTL & LANGUAGE SUPPORT =====
    {
      id: 'language-switching',
      category: 'rtl',
      question: 'How do I switch between English and Hebrew?',
      answer: 'Use the language toggle (WEB) in the top navigation bar to switch between English and Hebrew. The interface automatically adjusts layout direction (RTL/LTR), fonts, text alignment, and number formatting. Language preference is saved for future sessions.',
      steps: [
        'Look for the language toggle icon (WEB) in the top navigation bar',
        'Click the toggle to switch between English and Hebrew',
        'Interface automatically changes direction: Hebrew (right-to-left), English (left-to-right)',
        'Font changes to Hebrew-optimized fonts for Hebrew language',
        'Number formatting adjusts to local standards (Hebrew/English)',
        'Language preference is saved in localStorage for future sessions',
        'All text content switches to the selected language immediately'
      ],
      tags: ['language', 'hebrew', 'english', 'rtl', 'ltr', 'switching', 'localization']
    },
    {
      id: 'rtl-support',
      category: 'rtl',
      question: 'What RTL (Right-to-Left) features are supported?',
      answer: 'Complete RTL support includes: automatic layout direction switching, Hebrew font optimization, right-aligned text, reversed flex layouts, mirrored icons and navigation, RTL-optimized form inputs, proper number and date formatting, and RTL-aware chart displays.',
      steps: [
        'Layout Direction: All components automatically mirror for RTL languages',
        'Text Alignment: Text aligns right for Hebrew, left for English',
        'Navigation: Sidebar and navigation elements position correctly for RTL',
        'Forms: Input fields, labels, and validation messages align properly',
        'Charts: Data visualization respects RTL layout but keeps charts readable',
        'Icons: Directional icons (arrows, etc.) flip appropriately for RTL',
        'Typography: Hebrew fonts (Segoe UI, Arial, Noto Sans Hebrew) load automatically'
      ],
      tags: ['rtl', 'hebrew', 'layout', 'typography', 'forms', 'charts', 'navigation']
    },
    {
      id: 'hebrew-interface',
      category: 'rtl',
      question: 'How does the Hebrew interface work?',
      answer: 'The Hebrew interface provides complete localization with RTL layout, Hebrew fonts, proper text direction, localized number/date formatting, and Hebrew translations for all interface elements. Charts and data visualizations remain left-to-right for readability while the interface flows right-to-left.',
      steps: [
        'Switch to Hebrew using the language toggle (WEB)',
        'Interface immediately changes to right-to-left layout',
        'All text content displays in Hebrew with proper RTL text flow',
        'Numbers format according to Hebrew locale standards',
        'Forms and inputs align to the right with Hebrew placeholders',
        'Navigation flows from right to left (sidebar on right)',
        'Charts maintain LTR orientation for data readability'
      ],
      tags: ['hebrew', 'interface', 'rtl', 'localization', 'fonts', 'translation']
    },

    // ===== MOBILE EXPERIENCE =====
    {
      id: 'mobile-optimization',
      category: 'mobile',
      question: 'How is CRM Demo optimized for mobile devices?',
      answer: 'CRM Demo is fully responsive with mobile-first design: touch-optimized interface, collapsible sidebar navigation, mobile-friendly forms, swipe gestures, optimized loading times, and adaptive layouts. All features work seamlessly on smartphones and tablets.',
      steps: [
        'Access CRM Demo from any mobile browser (no app installation needed)',
        'Login with the same credentials as desktop',
        'Use the hamburger menu (☰) to access sidebar navigation',
        'Navigate with touch gestures: tap, swipe, pinch-to-zoom on charts',
        'Use mobile-optimized forms with large touch targets',
        'View responsive dashboard with single-column layout on small screens',
        'Access all features: leads, messages, queue, calendar, reports'
      ],
      tags: ['mobile', 'responsive', 'touch', 'gestures', 'optimization', 'tablets']
    },
    {
      id: 'mobile-features',
      category: 'mobile',
      question: 'What features are available on mobile?',
      answer: 'All CRM Demo features are available on mobile: lead management with touch-friendly forms, WhatsApp conversations with mobile chat interface, queue management with touch controls, calendar with mobile-optimized scheduling, analytics with responsive charts, and full Settings access.',
      steps: [
        'Leads: Add, edit, search, and filter leads with mobile-optimized forms',
        'Messages: Full WhatsApp conversation management with mobile chat interface',
        'Queue: Monitor and manage automation queue with touch-friendly controls',
        'Calendar: View and schedule meetings with mobile calendar interface',
        'Dashboard: Responsive widgets that stack vertically on mobile screens',
        'Reports: Generate and view analytics with mobile-optimized charts',
        'Settings: Complete configuration access with mobile-friendly layouts'
      ],
      tags: ['mobile', 'features', 'leads', 'messages', 'queue', 'calendar', 'analytics']
    },

    // ===== TECHNICAL SUPPORT =====
    {
      id: 'data-export-import',
      category: 'technical',
      question: 'How do I export and import data?',
      answer: 'Export data from multiple sections: Leads (CSV with all fields), Reports (CSV/PDF/JSON), Queue audit logs (CSV), Messages analytics (CSV), Calendar events (ICS/CSV). Import leads via CSV upload with validation and duplicate detection.',
      steps: [
        'Leads Export: Go to Leads → Export button → Choose format (CSV with all lead data)',
        'Reports Export: Generate report → Export button → Choose CSV (data) or PDF (formatted)',
        'Queue Export: Queue Management → Audit Trail → Export logs as CSV',
        'Messages Export: Messages Analytics → Export conversation metrics as CSV',
        'Leads Import: Leads → Import CSV → Upload file → Map columns → Review and import',
        'Validate data before import: required fields (name, phone), format checking',
        'Handle duplicates: skip, update, or create new records'
      ],
      tags: ['export', 'import', 'csv', 'pdf', 'data', 'backup', 'migration']
    },
    {
      id: 'browser-support',
      category: 'technical',
      question: 'What browsers and devices are supported?',
      answer: 'CRM Demo supports all modern browsers: Chrome, Firefox, Safari, Edge. Works on desktop computers, laptops, tablets, and smartphones. Minimum requirements: JavaScript enabled, Internet connection, modern browser (last 2 versions). Optimized for Chrome and Safari.',
      steps: [
        'Desktop: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+',
        'Mobile: iOS Safari 14+, Chrome Mobile 90+, Samsung Internet 14+',
        'Tablets: Same browser requirements as mobile with enhanced layouts',
        'Features: JavaScript enabled, Local Storage support, Modern CSS support',
        'Network: Stable internet connection for real-time features',
        'Performance: Best experience on devices with 2GB+ RAM',
        'Accessibility: Screen reader support, keyboard navigation'
      ],
      tags: ['browsers', 'compatibility', 'devices', 'requirements', 'performance']
    },
    {
      id: 'troubleshooting',
      category: 'technical',
      question: 'How do I troubleshoot common issues?',
      answer: 'Common solutions: Clear browser cache and cookies for loading issues, check internet connection for real-time updates, refresh page for data sync issues, verify login credentials for authentication problems, check browser console for JavaScript errors, try incognito mode for extension conflicts.',
      steps: [
        'Loading Issues: Clear browser cache, hard refresh (Ctrl+F5), disable extensions',
        'Login Problems: Verify credentials, reset password, check caps lock, try incognito',
        'Data Not Loading: Check internet, refresh page, try different browser',
        'Real-time Updates: Ensure stable connection, check firewall/proxy settings',
        'Performance Issues: Close other tabs, restart browser, check device memory',
        'Feature Not Working: Check browser console (F12), update browser, contact support',
        'Mobile Issues: Update browser app, clear app cache, check mobile connection'
      ],
      tags: ['troubleshooting', 'issues', 'cache', 'browser', 'performance', 'support']
    },

    // ===== ADDITIONAL COMPREHENSIVE TOPICS =====
    {
      id: 'system-architecture',
      category: 'technical',
      question: 'How is CRM Demo architected and what technologies are used?',
      answer: 'CRM Demo uses modern web technologies: React 18 with TypeScript, Supabase for backend/database, real-time subscriptions, Tailwind CSS for styling, i18next for internationalization, Vite for development, and comprehensive testing with Playwright. Built with scalability and security in mind.',
      steps: [
        'Frontend: React 18 + TypeScript + Vite for fast development and builds',
        'Backend: Supabase with PostgreSQL database, Row Level Security (RLS)',
        'Real-time: WebSocket connections for live updates across all features',
        'Styling: Tailwind CSS with custom design system and RTL support',
        'Internationalization: i18next with English and Hebrew translations',
        'Testing: Playwright E2E tests, Jest unit tests, comprehensive coverage',
        'Security: Authentication, RLS policies, input validation, secure API calls'
      ],
      tags: ['architecture', 'technology', 'react', 'supabase', 'real-time', 'security']
    },
    {
      id: 'performance-optimization',
      category: 'technical',
      question: 'How is CRM Demo optimized for performance?',
      answer: 'Performance optimizations include: lazy loading components, data caching with TTL, optimized database queries, image compression, code splitting, service worker caching, real-time data pagination, debounced search inputs, and efficient re-renders with React optimization techniques.',
      steps: [
        'Page Loading: Lazy-loaded routes, code splitting for faster initial load',
        'Data Loading: Cached queries with 30-second TTL, pagination for large datasets',
        'Real-time Updates: Selective subscriptions, batched updates for efficiency',
        'Search: Debounced inputs (300ms delay) to reduce API calls',
        'Images: Compressed assets, responsive images, lazy loading',
        'Memory: Efficient component lifecycle, cleanup of subscriptions',
        'Network: Service worker caching, optimized API calls, request batching'
      ],
      tags: ['performance', 'optimization', 'caching', 'lazy-loading', 'real-time']
    },
    {
      id: 'security-features',
      category: 'technical',
      question: 'What security features are implemented?',
      answer: 'Security includes: Row Level Security (RLS) for data isolation, secure authentication with session management, input validation and sanitization, HTTPS everywhere, API rate limiting, secure password storage, audit logging for all actions, and GDPR compliance features.',
      steps: [
        'Authentication: Secure login with email/password, social auth (Google, Facebook)',
        'Authorization: Row Level Security policies ensure users see only their data',
        'Data Protection: Encrypted connections (HTTPS), secure password storage',
        'Input Validation: Client and server-side validation, SQL injection prevention',
        'Audit Logging: All user actions logged for compliance and troubleshooting',
        'Rate Limiting: API limits prevent abuse and ensure fair usage',
        'Privacy: GDPR compliance, data deletion, user consent management'
      ],
      tags: ['security', 'authentication', 'rls', 'encryption', 'compliance', 'audit']
    },

    // ===== ADMIN CONSOLE =====
    {
      id: 'admin-console-access',
      category: 'admin',
      question: 'How do I access the Admin Console?',
      answer: 'The Admin Console is a production-ready business management platform with zero mock data. Available only to users with administrator privileges. Navigate to /admin or click "Admin Center" in the sidebar. Provides real company management, user administration, analytics, and database tools.',
      steps: [
        'Check admin access: "Admin Center" appears in sidebar for admin users only',
        'Navigate to Admin Console: Click "Admin Center" or go to /admin URL',
        'Choose admin section: Company Management, User Management, Usage Analytics, System Admin',
        'Access real tools: All features use live database data with comprehensive testing',
        'Monitor business: Real-time analytics and professional reporting',
        'Export data: Professional PDF reports with charts and data visualization'
      ],
      tags: ['admin', 'console', 'access', 'permissions', 'management', 'business-platform']
    },
    {
      id: 'user-management-admin',
      category: 'admin',
      question: 'How do I create and manage users in the Admin Console?',
      answer: 'User Management provides real user administration with Supabase edge functions. Create users with automatic email invitations, manage roles and permissions, assign users to companies, and monitor actual user activity across the platform.',
      steps: [
        'Navigate to Admin Console → User Management tab',
        'Create User: Click "Create User" → Fill user details → Select role and company',
        'Real email invitations: Users receive actual login credentials via email',
        'Edit users: Click user row → Modify role, status, or company assignment',
        'Role management: Assign roles (Staff, Admin, Super Admin) with proper access control',
        'Activity monitoring: View real user login history and system usage statistics',
        'Bulk operations: Import multiple users via CSV with validation'
      ],
      tags: ['admin', 'user-management', 'supabase', 'edge-functions', 'real-data', 'email-invitations']
    },
    {
      id: 'company-management-admin',
      category: 'admin',
      question: 'How do I manage client companies in the Admin Console?',
      answer: 'Company Management provides real multi-tenant administration. Create and configure client companies from the clients database table, manage subscriptions, monitor actual usage statistics, and control company-specific settings with real data isolation.',
      steps: [
        'Navigate to Admin Console → Company Management tab',
        'Create Company: Click "Create Company" → Data saves to clients table',
        'View company list: Real client data with actual user counts and statistics',
        'Edit companies: View/Edit buttons connect to real database operations',
        'Monitor usage: Track actual per-company message counts and lead generation',
        'Data isolation: Row Level Security ensures proper multi-tenant separation',
        'Export data: Generate professional reports with real company metrics'
      ],
      tags: ['admin', 'company-management', 'multi-tenant', 'real-database', 'clients-table', 'isolation']
    },
    {
      id: 'admin-analytics',
      category: 'admin',
      question: 'What analytics are available in the Admin Console?',
      answer: 'Usage Analytics provides real business intelligence from live database queries. Track total companies, users, message volumes, lead generation, revenue calculations, and real-time activity. Zero mock data - all metrics come from actual database tables.',
      steps: [
        'Navigate to Admin Console → Usage Analytics tab',
        'Real metrics: Total companies (clients table), users (profiles table), actual message counts',
        'Live data: Today\'s messages, monthly activity from conversations table',
        'Revenue tracking: Calculated from converted leads with real values',
        'Growth analysis: Real user registration trends and company acquisition data',
        'Active monitoring: Live conversation counts and system usage',
        'Professional exports: Generate PDF reports with charts and real data visualization'
      ],
      tags: ['admin', 'analytics', 'real-data', 'live-database', 'business-intelligence', 'professional-reports']
    },
         {
       id: 'admin-system-tools',
       category: 'admin',
       question: 'What system administration tools are available?',
       answer: 'System Admin tab provides a streamlined, centered interface for database access. Features a single "Access System Console" button for READ-ONLY database operations. Clean design with RTL support and advanced user authentication.',
       steps: [
         'Navigate to Admin Console → System Admin tab',
         'Centered Interface: Single professional system console access card',
         'Database Console: Click red "Access System Console" button',
         'READ-ONLY Access: Execute SELECT queries safely with restrictions', 
         'Advanced Users Only: Requires proper authentication and permissions',
         'RTL Support: Full right-to-left language compatibility',
         'Security: All access logged for audit and compliance'
       ],
       tags: ['admin', 'system-console', 'database-access', 'read-only', 'rtl-support', 'security']
     },
    {
      id: 'admin-export-reports',
      category: 'admin',
      question: 'How do I generate and export professional reports from the Admin Console?',
      answer: 'The Admin Console includes a comprehensive export system with professional report generation. Export data in CSV, PDF, Excel, and JSON formats with charts, branding, and data visualization. All exports use real data from the database.',
      steps: [
        'Access export functions from any admin tab',
        'CSV exports: Simple data exports for spreadsheet analysis',
        'PDF reports: Professional reports with charts, branding, and executive summaries',
        'Excel exports: Complex data sets with multiple sheets and formatting',
        'JSON exports: Raw data for API integration and development',
        'Custom branding: Reports include company logo, colors, and professional styling',
        'Real data visualization: Charts and graphs generated from actual database metrics'
      ],
      tags: ['admin', 'exports', 'professional-reports', 'pdf', 'csv', 'excel', 'charts', 'branding']
    },
    {
      id: 'admin-security',
      category: 'admin',
      question: 'What security features are built into the Admin Console?',
      answer: 'The Admin Console implements enterprise-grade security with role-based access control, Row Level Security (RLS), audit logging, and secure database operations. All data is protected with proper authentication and authorization.',
      steps: [
        'Role-based access: Only users with admin role can access the console',
        'Database security: RLS policies ensure proper data isolation between companies',
        'Audit logging: All admin actions are tracked in user_audit_logs table',
        'Secure queries: Database operations use parameterized queries to prevent injection',
        'Session validation: Supabase authentication required for all admin functions',
        'Permission boundaries: Limited to authorized operations with proper error handling',
        'Activity tracking: Comprehensive audit trail for compliance and security monitoring'
      ],
      tags: ['admin', 'security', 'rls', 'audit-logging', 'authentication', 'authorization', 'compliance']
    },
    {
      id: 'admin-system-prompts',
      category: 'admin',
      question: t('pages:faq.admin.systemPrompts.question', 'How do I view and edit system prompts for clients?'),
      answer: t('pages:faq.admin.systemPrompts.answer', 'System prompts are accessible through the Admin Console System Prompts tab. Each client has a customizable system prompt that defines AI behavior, conversation flow, and business rules. The system prompt reader provides organized sections with search, copy, and editing capabilities.'),
      steps: [
        t('pages:faq.admin.systemPrompts.step1', 'Navigate to Admin Console → System Prompts tab'),
        t('pages:faq.admin.systemPrompts.step2', 'Select a client from the dropdown to view their system prompt'),
        t('pages:faq.admin.systemPrompts.step3', 'Use the collapsible interface: expand/collapse entire prompt or individual sections'),
        t('pages:faq.admin.systemPrompts.step4', 'Search within sections using the search bar at the top'),
        t('pages:faq.admin.systemPrompts.step5', 'Copy specific sections using the copy button next to each section'),
        t('pages:faq.admin.systemPrompts.step6', 'Edit system prompt by clicking "Edit System Prompt" button'),
        t('pages:faq.admin.systemPrompts.step7', 'Changes propagate immediately to the site database for live AI behavior'),
        t('pages:faq.admin.systemPrompts.step8', 'Use "Expand All" / "Collapse All" buttons to manage section visibility')
      ],
      tags: ['admin', 'system-prompts', 'ai-behavior', 'client-configuration', 'editing', 'collapsible', 'search']
    },
    {
      id: 'admin-system-prompt-sections',
      category: 'admin',
      question: t('pages:faq.admin.systemPromptSections.question', 'What sections are available in the system prompt reader?'),
      answer: t('pages:faq.admin.systemPromptSections.answer', 'The system prompt reader organizes content into logical sections with icons and collapsible interface. Each section can be expanded, collapsed, searched, and copied independently. The interface supports both English and Hebrew with proper RTL layout.'),
      steps: [
        t('pages:faq.admin.systemPromptSections.step1', '🤖 Role & Identity: Defines the AI assistant\'s personality and core identity'),
        t('pages:faq.admin.systemPromptSections.step2', 'Primary Goal: Main objectives and success criteria for conversations'),
        t('pages:faq.admin.systemPromptSections.step3', 'Current User State: Context about the current conversation state'),
        t('pages:faq.admin.systemPromptSections.step4', 'State-Aware Communication: Rules for contextual conversation flow'),
        t('pages:faq.admin.systemPromptSections.step5', 'BANT Qualification Process: Lead qualification methodology and criteria'),
        t('pages:faq.admin.systemPromptSections.step6', 'Meeting Scheduling Protocol: Calendly integration and meeting booking rules'),
        t('pages:faq.admin.systemPromptSections.step7', 'ALERT Smart Escalation Triggers: When to escalate to human agents'),
        t('pages:faq.admin.systemPromptSections.step8', '🏢 Project Details: Specific project information and context'),
        t('pages:faq.admin.systemPromptSections.step9', '📋 JSON Output Requirements: Structured data format specifications')
      ],
      tags: ['admin', 'system-prompt-sections', 'ai-configuration', 'bant', 'meeting-scheduling', 'escalation', 'json-output']
    },
    {
      id: 'admin-system-prompt-rtl',
      category: 'admin',
      question: t('pages:faq.admin.systemPromptRTL.question', 'How does RTL (Hebrew) support work in the system prompt reader?'),
      answer: t('pages:faq.admin.systemPromptRTL.answer', 'The system prompt reader provides complete RTL support for Hebrew interface elements while preserving the original system prompt text formatting. UI controls, navigation, and layout adapt to Hebrew direction, but system prompt content remains in its original language for AI consistency.'),
      steps: [
        t('pages:faq.admin.systemPromptRTL.step1', 'Switch to Hebrew using the language toggle (WEB) in the navigation'),
        t('pages:faq.admin.systemPromptRTL.step2', 'Interface elements automatically adjust to right-to-left layout'),
        t('pages:faq.admin.systemPromptRTL.step3', 'Buttons, search bar, and controls move to RTL positions'),
        t('pages:faq.admin.systemPromptRTL.step4', 'Section headers and navigation text appear in Hebrew'),
        t('pages:faq.admin.systemPromptRTL.step5', 'System prompt content remains in original language (usually English)'),
        t('pages:faq.admin.systemPromptRTL.step6', 'Copy and edit functions work seamlessly in both languages'),
        t('pages:faq.admin.systemPromptRTL.step7', 'Collapsible sections maintain proper RTL spacing and alignment'),
        t('pages:faq.admin.systemPromptRTL.step8', 'Toast notifications and confirmations appear in Hebrew')
      ],
      tags: ['admin', 'rtl', 'hebrew', 'system-prompts', 'language-support', 'ui-adaptation', 'original-content']
    },
     {
       id: 'global-search-functionality',
       category: 'admin',
       question: 'How does the global search system work across the platform?',
       answer: 'CRM Demo features a comprehensive global search system with real-time database connectivity. Search across projects, leads, and conversations with 300ms debounced performance, mobile-responsive interface, and full RTL support.',
       steps: [
         'Access search bar in top navigation (placeholder: "Search everything...")',
         'Search Sources: Projects (name, description), Leads (name, email, phone), Conversations (participants)',
         'Real-time results: 300ms debounce with live database connectivity',
         'Result categories: Max 3 projects, 3 leads, 2 conversations shown',
         'Click navigation: Select any result to navigate instantly',
         'Mobile support: Touch-optimized with responsive design',
         'RTL languages: Complete right-to-left layout support',
         'Performance: Parallel database queries with caching'
       ],
       tags: ['search', 'global-search', 'real-time', 'database', 'mobile', 'rtl', 'performance']
     },

    // ===== INTEGRATIONS & APIs =====
    {
      id: 'oauth-setup',
      category: 'integrations',
      question: 'How do I set up OAuth integrations (Calendly, Google, Facebook)?',
      answer: 'OAuth integrations allow secure third-party connections without sharing passwords. Set up Calendly for meeting scheduling, Google/Facebook for social authentication. Each integration has specific setup steps with proper security tokens.',
      steps: [
        'Navigate to Settings → Integrations tab',
        'Calendly OAuth: Click "Connect Calendly" → Authorize in popup → Use booking links in conversations',
        'Google OAuth: Enable in authentication settings → Users can login with Google accounts',
        'Facebook OAuth: Configure in auth provider settings → Social login option available',
        'API Access Tokens: Store securely in user settings, never expose in frontend code',
        'Test connections: Use integration test page to verify functionality',
        'Monitor usage: Check integration status and connection health'
      ],
      tags: ['oauth', 'integrations', 'calendly', 'google', 'facebook', 'authentication', 'api-tokens']
    },
    {
      id: 'webhook-setup',
      category: 'integrations',
      question: 'How do I configure webhooks for real-time updates?',
      answer: 'Webhooks enable real-time data synchronization between CRM Demo and external services. Configure WhatsApp Business API webhooks for message delivery, Meta webhooks for lead updates, and custom webhooks for third-party integrations.',
      steps: [
        'WhatsApp Webhooks: Configure in Meta Business Manager → Point to your CRM Demo webhook URL',
        'Set webhook verification token for security validation',
        'Test webhook delivery: Send test message and verify receipt in Messages section',
        'Custom webhooks: Define endpoints for your specific integration needs',
        'Security: Always validate webhook signatures and use HTTPS endpoints',
        'Monitor webhook health: Check delivery status and error rates',
        'Debug failures: Use webhook logs to troubleshoot delivery issues'
      ],
      tags: ['webhooks', 'real-time', 'whatsapp', 'meta', 'integration', 'security', 'verification']
    },
    {
      id: 'api-key-management',
      category: 'integrations',
      question: 'How do I manage API keys and access tokens?',
      answer: 'API keys provide secure access to external services. Store keys in user settings, use environment variables for security, rotate keys regularly, and monitor usage. Different services require different types of authentication.',
      steps: [
        'Navigate to Settings → Integrations or Admin Console → User Settings',
        'WhatsApp API: Store Business API access token from Meta Business Manager',
        'Calendly API: Use Personal Access Token (PAT) or OAuth tokens',
        'Custom APIs: Add third-party service keys with proper labeling',
        'Security best practices: Never commit keys to code, use environment variables',
        'Key rotation: Regularly update access tokens for security',
        'Monitor usage: Track API call volumes and rate limiting'
      ],
      tags: ['api-keys', 'access-tokens', 'security', 'environment-variables', 'rotation', 'whatsapp', 'calendly']
    },

    // ===== TEMPLATES & AUTOMATION =====
    // NOTE: Templates have their own dedicated page at /templates with full functionality
    // Admin Console should focus on admin-only features, not duplicate existing functionality
    {
      id: 'templates-page-reference',
      category: 'templates',
      question: 'Where do I manage message templates and automation?',
      answer: 'All template management happens on the dedicated Templates page (/templates), not in the Admin Console. This page provides complete template creation, editing, automation workflows, WhatsApp Business integration, and template analytics. Admin Console focuses on user management and system administration.',
      steps: [
        'Access Templates: Navigate to Templates page via main navigation or sidebar',
        'Template Management: Create, edit, and organize message templates with drag-and-drop interface',
        'Automation Setup: Configure automated message workflows with triggers and sequences',
        'WhatsApp Integration: Manage WhatsApp Business API templates for Meta compliance',
        'Template Variables: Use dynamic variables like {firstName}, {projectName}, {temperature}',
        'Analytics: Monitor template performance, response rates, and usage metrics',
        'For detailed template help: Use the Templates section in this FAQ for complete guidance'
      ],
      tags: ['templates', 'navigation', 'automation', 'whatsapp', 'page-reference', 'workflows']
    },

    // ===== NOTIFICATIONS =====
    {
      id: 'notification-system',
      category: 'notifications',
      question: 'How does the notification system work?',
      answer: 'CRM Demo provides real-time notifications for important events: new messages, lead status changes, meeting reminders, system alerts, and queue updates. Configure notification preferences for email, in-app, and push notifications.',
      steps: [
        'Navigate to Settings → Notifications to configure preferences',
        'Message notifications: Real-time alerts for new WhatsApp messages',
        'Lead notifications: Alerts when leads change status or temperature',
        'Meeting reminders: Automatic notifications before scheduled meetings',
        'Queue alerts: Notifications for processing completions or errors',
        'System notifications: Important updates and maintenance alerts',
        'Customize timing: Set quiet hours and notification frequency'
      ],
      tags: ['notifications', 'real-time', 'alerts', 'messages', 'leads', 'meetings', 'system']
    },
    {
      id: 'notification-preferences',
      category: 'notifications',
      question: 'How do I customize notification preferences?',
      answer: 'Customize notifications by type, timing, and delivery method. Set different preferences for urgent vs. routine notifications, configure quiet hours, and choose between email, in-app, or push notifications based on your workflow.',
      steps: [
        'Go to Settings → Notifications tab',
        'Configure by category: Messages, Leads, Calendar, Queue, System',
        'Set delivery methods: Email, in-app notifications, browser push',
        'Timing preferences: Immediate, digest (hourly/daily), or custom schedules',
        'Quiet hours: Set times when notifications are paused',
        'Priority settings: Configure which events trigger urgent notifications',
        'Test settings: Send test notifications to verify configuration'
      ],
      tags: ['notifications', 'preferences', 'customization', 'timing', 'delivery-methods', 'quiet-hours']
    },
    {
      id: 'notification-troubleshooting',
      category: 'notifications',
      question: 'Why am I not receiving notifications?',
      answer: 'Common notification issues include browser permissions, email spam filters, notification settings, and system connectivity. Check each component systematically to restore notification delivery.',
      steps: [
        'Check browser permissions: Allow notifications for the CRM Demo domain',
        'Review notification settings: Ensure desired categories are enabled',
        'Verify email address: Check if your email is correct in profile settings',
        'Check spam folders: Notifications might be filtered as spam',
        'Test connectivity: Ensure stable internet connection for real-time updates',
        'Clear browser cache: Old cached data might interfere with notifications',
        'Contact support: If issues persist, provide specific error details'
      ],
      tags: ['notifications', 'troubleshooting', 'browser-permissions', 'email', 'connectivity', 'support']
    }
  ];

  // Filter FAQ data based on search and category
  const filteredFAQ = useMemo(() => {
    let filtered = faqData;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(item => item.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [searchQuery, activeCategory, faqData]);

  return (
    <PublicPageShell dir={isRTL ? 'rtl' : 'ltr'}>
    <div className={cn("bg-background", isRTL && "rtl")}>
      {/* Header */}
      <div className="border-b border-border bg-sunken">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="max-w-3xl">
            <h1 className="mb-3 text-[32px] font-semibold leading-[38px] tracking-[-0.025em] text-foreground md:text-[40px] md:leading-[46px]">
              {t('pages:faq.title', 'Help & Support Center')}
            </h1>
            <p className="mb-6 text-lg text-subtle">
              {t('pages:faq.subtitle', 'Find answers to common questions and learn how to make the most of CRM Demo')}
            </p>

            {/* Search */}
            <div className="relative max-w-lg">
              <Search className="pointer-events-none absolute start-3 top-[22px] z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder={t('pages:faq.searchPlaceholder', 'Search help articles...')}
                aria-label={t('pages:faq.searchPlaceholder', 'Search help articles...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 ps-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Category Filter Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {t('pages:faq.categories.title', 'Categories')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Tabs value={activeCategory} onValueChange={setActiveCategory} orientation="vertical" className="w-full">
                  <TabsList className="grid w-full grid-cols-1 h-auto bg-transparent">
                    {categories.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <TabsTrigger
                          key={category.id}
                          value={category.id}
                          aria-controls="faq-content"
                          className={cn(
                            "w-full justify-start gap-2 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                            isRTL ? "flex-row-reverse text-right" : "text-left"
                          )}
                        >
                          <IconComponent className="h-4 w-4" />
                          {category.name}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* FAQ Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-3"
            id="faq-content"
            role="tabpanel"
            aria-label={t('pages:faq.categories.title', 'Categories')}
          >
            {filteredFAQ.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="flex items-center justify-center mb-4">
                    <HelpCircle className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t('pages:faq.noResults.title', 'No results found')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('pages:faq.noResults.description', 'Try adjusting your search terms or browse different categories')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {activeCategory === 'all' 
                      ? t('pages:faq.allTopics', 'All Topics') 
                      : categories.find(c => c.id === activeCategory)?.name
                    }
                  </h2>
                  <Badge variant="secondary">
                    {filteredFAQ.length} {t('pages:faq.articles', 'articles')}
                  </Badge>
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFAQ.map((faq, index) => (
                    <motion.div
                      key={faq.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      // Capped stagger: an uncapped index * 0.1 s left the 20th question pale for 2 s.
                      transition={{ duration: 0.3, delay: Math.min(index, 5) * 0.05 }}
                    >
                      <AccordionItem value={faq.id} className="border border-muted rounded-lg">
                        <AccordionTrigger className={cn("px-6 py-4 hover:no-underline", isRTL ? "text-right" : "text-left")}>
                          <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                            <div className="mt-1">
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-medium text-foreground">{faq.question}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                          <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
                            <p className={cn("text-muted-foreground leading-relaxed", isRTL ? "text-right" : "text-left")}>{faq.answer}</p>
                            
                            {faq.steps && faq.steps.length > 0 && (
                              <div>
                                <h4 className={cn("font-semibold mb-3 flex items-center gap-2", isRTL && "flex-row-reverse")}>
                                  <ArrowRight className="h-4 w-4 text-primary" />
                                  {t('pages:faq.stepByStep', 'Step-by-step:')}
                                </h4>
                                <ol className="space-y-2">
                                  {faq.steps.map((step, stepIndex) => (
                                    <li key={stepIndex} className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground text-sm rounded-full flex items-center justify-center">
                                        {stepIndex + 1}
                                      </span>
                                      <span className={cn("text-sm text-muted-foreground", isRTL ? "text-right" : "text-left")}>{step}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}
                            
                            {faq.tags && faq.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {faq.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  ))}
                </Accordion>
              </div>
            )}
          </motion.div>
        </div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16"
        >
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold mb-4">
                {t('pages:faq.stillNeedHelp.title', 'Still need help?')}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t('pages:faq.stillNeedHelp.description', 'This is a portfolio demo showcasing CRM capabilities with mock data')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <a href="mailto:amit@amityogev.com?subject=CRM Demo Inquiry">
                    <MessageSquare className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    {t('pages:faq.contactSupport', 'Contact Developer')}
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://amityogev.com" target="_blank" rel="noopener noreferrer">
                    <Calendar className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    {t('pages:faq.scheduleCall', 'View Portfolio')}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
    </PublicPageShell>
  );
};

export default FAQ; 