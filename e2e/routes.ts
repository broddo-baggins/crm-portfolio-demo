/**
 * Every route the router in src/App.tsx declares, with text that proves the right page
 * rendered. Keep this in sync with App.tsx; routes.spec.ts checks every entry.
 */
export interface RouteCase {
  path: string;
  /** Heading (or other text) visible once the page has rendered */
  expect: string | RegExp;
  /** Where a redirect route ends up */
  redirectsTo?: string;
  /** Match `expect` inside <main> (app routes, whose sidebar repeats page names) */
  inMain?: boolean;
}

export const PUBLIC_ROUTES: RouteCase[] = [
  { path: '/', expect: 'Advanced Lead Heating System' },
  { path: '/landingpage', expect: 'Advanced Lead Heating System' },
  { path: '/land', expect: 'Advanced Lead Heating System' },
  { path: '/he', expect: 'מערכת מבוססת בינה מלאכותית' },
  { path: '/auth/login', expect: 'Welcome Back' },
  // Without OAuth/reset parameters these send the visitor to the login page
  { path: '/auth/callback', expect: 'Welcome Back', redirectsTo: '/auth/login' },
  { path: '/auth/reset-password', expect: 'Welcome Back', redirectsTo: '/auth/login' },
  { path: '/auth/password-recovery', expect: 'Reset Your Password' },
  { path: '/auth/magic-link', expect: 'Magic Link Login' },
  { path: '/auth/change-email', expect: 'Change Email Address' },
  { path: '/auth/reauthenticate', expect: 'Reauthentication Required' },
  { path: '/auth/invite-user', expect: 'Invite User' },
  { path: '/auth/calendly/callback', expect: 'Connecting to Calendly' },
  { path: '/auth/google/callback', expect: 'Missing authorization code' },
  { path: '/privacy-policy', expect: 'Privacy Policy' },
  { path: '/terms-of-service', expect: 'Terms & Conditions' },
  { path: '/terms', expect: 'Terms & Conditions', redirectsTo: '/terms-of-service' },
  { path: '/cookies', expect: 'Cookie Policy' },
  { path: '/cookie-policy', expect: 'Cookie Policy', redirectsTo: '/cookies' },
  { path: '/data-deletion', expect: 'Data Deletion Request' },
  { path: '/data-export', expect: 'Export Your Data' },
  { path: '/accessibility-declaration', expect: 'הצהרת נגישות' },
  { path: '/faq', expect: 'Help & Support Center' },
  { path: '/calendly-demo', expect: 'Calendly Integration Demo' },
  { path: '/maintenance', expect: 'System Maintenance' },
  { path: '/coming-soon', expect: 'Advanced AI Analytics' },
  { path: '/unauthorized', expect: 'Unauthorized Access' },
  { path: '/bad-request', expect: 'Bad Request' },
  { path: '/forbidden', expect: 'Access Forbidden' },
  { path: '/internal-server-error', expect: 'Internal Server Error' },
  { path: '/service-unavailable', expect: 'Service Unavailable' },
  { path: '/not-found-alternative', expect: "You're off the map" },
  { path: '/404', expect: 'Page not found' },
];

/** Rendered inside the app layout; `expect` is matched within <main> so the sidebar can't satisfy it. */
export const APP_ROUTES: RouteCase[] = [
  { path: '/dashboard', expect: 'Total Leads' },
  { path: '/leads', expect: 'Lead Management Dashboard' },
  { path: '/queue-management', expect: 'Queue Depth' },
  { path: '/queue', expect: 'Queue Depth', redirectsTo: '/queue-management' },
  { path: '/lead-pipeline', expect: 'Message Template Management' },
  { path: '/projects', expect: 'TechStart Solutions - Enterprise Rollout' },
  { path: '/calendar', expect: 'Calendly Integration' },
  { path: '/messages', expect: 'Messages & Conversations' },
  { path: '/messages/optimized', expect: 'Optimized Messages' },
  { path: '/messages-analytics', expect: 'Messages Analytics Dashboard' },
  { path: '/notifications', expect: 'Meeting Scheduled' },
  { path: '/reports', expect: 'Lead Conversion Funnel' },
  { path: '/settings', expect: 'Profile Settings' },
  { path: '/users', expect: 'User Management' },
  { path: '/dashboard/users', expect: 'User Management', redirectsTo: '/users' },
  { path: '/admin', expect: 'System Admin Console' },
  { path: '/admin/console', expect: 'Admin Console' },
  { path: '/admin/company', expect: 'CRM Portfolio Demo Company' },
  { path: '/admin/data-requests', expect: 'Data Deletion Requests' },
  { path: '/company-management', expect: 'CRM Portfolio Demo Company', redirectsTo: '/admin/company' },
  { path: '/admin/users', expect: 'User Management' },
].map((r) => ({ ...r, inMain: true }));

export const ALL_ROUTES = [...PUBLIC_ROUTES, ...APP_ROUTES];
