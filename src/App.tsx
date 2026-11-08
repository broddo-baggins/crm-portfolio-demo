import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router";
import { Toaster } from "sonner";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/ClientAuthContext";
import { DashboardProvider } from "./context/DashboardContext";
import { ProjectProvider } from "./context/ProjectContext";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "./components/layout/Layout";
import { RequireAuth } from "./components/auth/RequireAuth";
import { useTranslation } from "react-i18next";
import { useEffect, lazy, Suspense, useState } from "react";
import React from "react";
import { RTLProvider } from "@/contexts/RTLContext";
import { LightModeWrapper } from "@/components/ui/light-mode-wrapper";
import { DemoLogoutBanner } from "@/components/demo/DemoLogoutBanner";

// Import analytics utilities
import { initializeAnalytics, trackPageView } from "@/utils/combined-analytics";
import { useLocation } from "react-router";

// Import authSync
import { authSync } from "@/lib/authSync";

// Import production utilities
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { perf } from "@/utils/performance";

// ===== LAZY LOAD HEAVY COMPONENTS =====

// Lazy load heavy pages for better performance with error handling
const Reports = lazy(() =>
  import("./pages/Reports").catch((error) => {
    console.error("Failed to load Reports page:", error);
    return {
      default: () => (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Reports</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p>Unable to load reports page. Please refresh and try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      ),
    };
  }),
);



const Settings = lazy(() =>
  import("./pages/Settings").catch((error) => {
    console.error("Failed to load Settings page:", error);
    return {
      default: () => (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Settings</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p>Unable to load settings page. Please refresh and try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      ),
    };
  }),
);

const Users = lazy(() =>
  import("./pages/Users").catch((error) => {
    console.error("Failed to load Users page:", error);
    return {
      default: () => (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Users</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p>Unable to load users page. Please refresh and try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      ),
    };
  }),
);

// Admin and management components
const AdminUserManagement = lazy(() => import("./pages/AdminUserManagement"));
const AdminConsolePage = lazy(() => import("./pages/AdminConsolePage"));
const CompanyManagement = lazy(() => import("./pages/CompanyManagement"));
const AdminLandingPage = lazy(() => import("./pages/AdminLandingPage"));

// Dashboard and core app pages (lazy loaded for performance)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Messages = lazy(() => import("./pages/Messages"));
const OptimizedMessages = lazy(() => import("./pages/OptimizedMessages"));

// Project and template management
const Projects = lazy(() => import("./pages/Projects"));
const TemplateManagement = lazy(() => import("./pages/LeadPipeline"));

// Demo pages removed - no longer needed

// ===== CRITICAL PAGES - KEEP DIRECT IMPORTS =====

// Authentication pages - keep as direct imports (critical for initial load)
import Login from "@/features/auth/pages/Login";
import AuthCallback from "@/features/auth/pages/AuthCallback";
import ResetPassword from "@/features/auth/pages/ResetPassword";
import PasswordRecovery from "@/features/auth/pages/PasswordRecovery";

// Basic pages - keep as direct imports (lightweight and frequently accessed)
import Leads from "./pages/Leads";
import QueueManagement from "./pages/QueueManagement";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import LandingPage from "@/pages/LandingPage";
import { HebrewLandingPage } from "@/pages/HebrewLandingPage";

// ===== LAZY LOAD LEGAL PAGES (not critical for initial load) =====
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const DataDeletion = lazy(() => import("@/pages/DataDeletion"));
const DataExport = lazy(() => import("@/pages/DataExport"));
const AccessibilityDeclaration = lazy(() => import("@/pages/AccessibilityDeclaration"));
const AdminDataRequests = lazy(() => import("@/pages/AdminDataRequests"));
const CookiePolicy = lazy(() => import('@/pages/CookiePolicy'));

// ===== LAZY LOAD OAUTH CALLBACKS =====
const CalendlyAuthCallback = lazy(() => import("@/pages/CalendlyAuthCallback"));
const GoogleCalendarCallback = lazy(() => import("@/pages/GoogleCalendarCallback"));

// ===== LAZY LOAD ERROR PAGES =====
const UnauthorizedPage = lazy(() => import("@/pages/errors/UnauthorizedPage"));
const BadRequestPage = lazy(() => import("@/pages/errors/BadRequestPage"));
const ForbiddenPage = lazy(() => import("@/pages/errors/ForbiddenPage"));
const InternalServerErrorPage = lazy(() => import("@/pages/errors/InternalServerErrorPage"));
const ServiceUnavailablePage = lazy(() => import("@/pages/errors/ServiceUnavailablePage"));
const NotFoundAlternativePage = lazy(() => import("@/pages/errors/NotFoundAlternativePage"));

// ===== LAZY LOAD ADDITIONAL PAGES =====
const FAQ = lazy(() => import("@/pages/FAQ"));
const CalendlyDemo = lazy(() => import("@/pages/CalendlyDemo"));
const MaintenancePage = lazy(() => import("@/pages/MaintenancePage"));
const ComingSoonPage = lazy(() => import("@/pages/ComingSoonPage"));

// ===== LAZY LOAD ANALYTICS DASHBOARD =====
const MessagesAnalyticsDashboard = lazy(() => import("@/components/dashboard/MessagesAnalyticsDashboard").then(module => ({ default: module.MessagesAnalyticsDashboard })));

// ===== LAZY LOAD AUTH FORMS =====
const MagicLinkForm = lazy(() => import("@/features/auth/components/MagicLinkForm"));
const ChangeEmailForm = lazy(() => import("@/features/auth/components/ChangeEmailForm"));
const ReauthenticateForm = lazy(() => import("@/features/auth/components/ReauthenticateForm"));
const InviteUserForm = lazy(() => import("@/features/auth/components/InviteUserForm"));

// Loading component for lazy-loaded pages
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="ml-2 text-muted-foreground">Loading...</span>
  </div>
);

// Language Direction Handler Component
const LanguageDirectionHandler = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { i18n } = useTranslation();

  // Enhanced direction handler that works with early initialization
  useEffect(() => {
    const setDirection = () => {
      const isHebrew = i18n.language === "he";

      // Set document direction based on language
      document.documentElement.dir = isHebrew ? "rtl" : "ltr";
      document.documentElement.lang = i18n.language;

      // Apply Hebrew font class to body
      if (isHebrew) {
        document.body.classList.add("font-hebrew");
      } else {
        document.body.classList.remove("font-hebrew");
      }

      // Force layout recalculation for sidebar components
      const sidebarElements = document.querySelectorAll("[data-sidebar]");
      sidebarElements.forEach((element) => {
        // Trigger a reflow to recalculate positioning
        (element as HTMLElement).style.transform = "translateZ(0)";
        requestAnimationFrame(() => {
          (element as HTMLElement).style.transform = "";
        });
      });
    };

    setDirection();
    i18n.on("languageChanged", setDirection);

    return () => {
      i18n.off("languageChanged", setDirection);
    };
  }, [i18n]);

  return <>{children}</>;
};

// Handle Language Direction
const handleLanguageChange = () => {
  const currentLang = localStorage.getItem("i18nextLng") || "en";
  const isHebrew = currentLang === "he";
  
  document.documentElement.dir = isHebrew ? "rtl" : "ltr";
  document.documentElement.lang = currentLang;
  
  if (isHebrew) {
    document.body.classList.add("font-hebrew");
  } else {
    document.body.classList.remove("font-hebrew");
  }
};

// Analytics Tracker Component
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // After first paint: analytics and perf tracking never compete with rendering
    const run = () => {
      initializeAnalytics();
      trackPageView(location.pathname);
      perf.trackRouteChange(location.pathname);
    };
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(run, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(run, 1000);
    return () => clearTimeout(id);
  }, [location]);

  return null;
};

function App() {
  const { i18n } = useTranslation();
  const [showLogoutBanner, setShowLogoutBanner] = useState(false);

  // Handle language changes
  useEffect(() => {
    handleLanguageChange();
    i18n.on("languageChanged", handleLanguageChange);
    return () => i18n.off("languageChanged", handleLanguageChange);
  }, [i18n]);

  // Listen for demo logout attempts
  useEffect(() => {
    const handleLogoutAttempt = () => {
      setShowLogoutBanner(true);
    };

    window.addEventListener('demo-logout-attempt', handleLogoutAttempt);
    return () => window.removeEventListener('demo-logout-attempt', handleLogoutAttempt);
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <RTLProvider>
            <LanguageDirectionHandler>
              <Router>
                <AuthProvider>
                  <DashboardProvider>
                    <ProjectProvider>
                      <AnalyticsTracker />
                      <div className="min-h-screen bg-background" data-testid="app-container">
                        <Suspense fallback={<PageLoading />}>
                          <Routes>
                            {/* Public Routes - FORCED LIGHT MODE */}
                            <Route 
                              path="/" 
                              element={
                                <LightModeWrapper>
                                  <LandingPage />
                                </LightModeWrapper>
                              } 
                            />
                            <Route 
                              path="/landingpage" 
                              element={
                                <LightModeWrapper>
                                  <LandingPage />
                                </LightModeWrapper>
                              } 
                            />
                            <Route 
                              path="/land" 
                              element={
                                <LightModeWrapper>
                                  <LandingPage />
                                </LightModeWrapper>
                              } 
                            />
                            <Route 
                              path="/he" 
                              element={
                                <LightModeWrapper>
                                  <HebrewLandingPage />
                                </LightModeWrapper>
                              } 
                            />
                            <Route 
                              path="/auth/login" 
                              element={
                                <LightModeWrapper>
                                  <Login />
                                </LightModeWrapper>
                              } 
                            />
                            <Route 
                              path="/auth/callback" 
                              element={
                                <LightModeWrapper>
                                  <AuthCallback />
                                </LightModeWrapper>
                              } 
                            />
                            <Route 
                              path="/auth/reset-password" 
                              element={
                                <LightModeWrapper>
                                  <ResetPassword />
                                </LightModeWrapper>
                              } 
                            />
                            <Route 
                              path="/auth/password-recovery" 
                              element={
                                <LightModeWrapper>
                                  <PasswordRecovery />
                                </LightModeWrapper>
                              } 
                            />
                            <Route path="/auth/magic-link" element={<MagicLinkForm />} />
                            <Route path="/auth/change-email" element={<ChangeEmailForm />} />
                            <Route path="/auth/reauthenticate" element={<ReauthenticateForm />} />
                            <Route path="/auth/invite-user" element={<InviteUserForm />} />

                            {/* OAuth Callbacks */}
                            <Route path="/auth/calendly/callback" element={<CalendlyAuthCallback />} />
                            <Route path="/auth/google/callback" element={<GoogleCalendarCallback />} />

                            {/* Legal Pages - Normal Theme */}
                            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                            <Route path="/terms-of-service" element={<TermsOfService />} />
                            <Route path="/terms" element={<Navigate to="/terms-of-service" replace />} />
                            <Route path="/cookies" element={<CookiePolicy />} />
                            <Route path="/cookie-policy" element={<Navigate to="/cookies" replace />} />
                            <Route path="/data-deletion" element={<DataDeletion />} />
                            <Route path="/data-export" element={<DataExport />} />
                            <Route path="/accessibility-declaration" element={<AccessibilityDeclaration />} />

                            {/* FAQ and Maintenance */}
                                        <Route path="/faq" element={<FAQ />} />
            <Route path="/calendly-demo" element={<CalendlyDemo />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/coming-soon" element={<ComingSoonPage />} />

                            {/* TOOL OPTIMIZED: Single Protected Route Wrapper - RESPECTS DARK MODE */}
                            <Route 
                              path="/*" 
                              element={
                                <RequireAuth>
                                  <Layout />
                                </RequireAuth>
                              } 
                            >
                              {/* All protected routes under single auth wrapper */}
                              <Route path="dashboard" element={<Dashboard />} />
                              <Route path="leads" element={<Leads />} />
                              <Route path="queue-management" element={<QueueManagement />} />
                              <Route path="queue" element={<Navigate to="/queue-management" replace />} />
                              <Route path="lead-pipeline" element={<TemplateManagement />} />
                              <Route path="projects" element={<Projects />} />
                              <Route path="calendar" element={<Calendar />} />
                              <Route path="messages" element={<Messages />} />
                              <Route path="messages/optimized" element={<OptimizedMessages />} />
                              <Route path="messages-analytics" element={<MessagesAnalyticsDashboard />} />
                              <Route path="notifications" element={<Notifications />} />
                              <Route path="reports" element={<Reports />} />
                              <Route path="settings" element={<Settings />} />
                              <Route path="users" element={<Users />} />
                              
                              {/* Redirect old dashboard/users path to new /users path */}
                              <Route path="dashboard/users" element={<Navigate to="/users" replace />} />
                              
                              {/* Admin Routes - Unified under /admin */}
                              <Route path="admin" element={<AdminLandingPage />} />
                              <Route path="admin/console" element={<AdminConsolePage />} />
                              <Route path="admin/console/*" element={<AdminConsolePage />} />
                              <Route path="admin/company" element={<CompanyManagement />} />
                              <Route path="admin/company/*" element={<CompanyManagement />} />
                              <Route path="admin/data-requests" element={<AdminDataRequests />} />
                              
                              {/* Backward compatibility redirects */}
                              <Route path="company-management" element={<Navigate to="/admin/company" replace />} />
                              <Route path="admin/users" element={<AdminUserManagement />} />

                              {/* Unknown paths match the "/*" layout first, so catch them here */}
                              <Route path="*" element={<NotFound />} />
                            </Route>

                            {/* Error Pages */}
                            <Route path="/unauthorized" element={<UnauthorizedPage />} />
                            <Route path="/bad-request" element={<BadRequestPage />} />
                            <Route path="/forbidden" element={<ForbiddenPage />} />
                            <Route path="/internal-server-error" element={<InternalServerErrorPage />} />
                            <Route path="/service-unavailable" element={<ServiceUnavailablePage />} />
                            <Route path="/not-found-alternative" element={<NotFoundAlternativePage />} />

                            {/* Fallback Routes */}
                            <Route path="/404" element={<NotFound />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Suspense>
                      </div>
                      <Toaster offset={{ bottom: "calc(var(--cookie-bar-h, 0px) + 16px)", right: 16 }} mobileOffset={{ bottom: "calc(var(--cookie-bar-h, 0px) + 72px)", left: 16, right: 16 }} />
                      <ShadcnToaster />
                      {showLogoutBanner && (
                        <DemoLogoutBanner onDismiss={() => setShowLogoutBanner(false)} />
                      )}
                      <Analytics />
                      <SpeedInsights />
                    </ProjectProvider>
                  </DashboardProvider>
                </AuthProvider>
              </Router>
            </LanguageDirectionHandler>
          </RTLProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
