import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { useLang } from "@/hooks/useLang";
import { useMobileInfo } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

// Import the FULL enhanced dashboard with all widgets (includes real-time metrics)
import EnhancedDashboardExample from "@/components/dashboard/EnhancedDashboardExample";

// Keep fallback component for additional safety
const FallbackDashboard = () => {
  const { t } = useTranslation("pages");
  const { isRTL } = useLang();
  const { isMobile } = useMobileInfo();

  return (
    <div
      className={cn("space-y-6", isRTL && "rtl")}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {t(
            "dashboard.fallback.loading",
            "Loading dashboard in fallback mode. The enhanced dashboard is temporarily unavailable.",
          )}
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className={cn(
              "ml-2",
              isMobile && "w-full mt-2 touch-manipulation"
            )}
          >
            {t("common.actions.refresh", "Refresh Page")}
          </Button>
        </AlertDescription>
      </Alert>
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-4"
      )}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className={cn(
              "p-6",
              isMobile && "p-4" // Smaller padding on mobile
            )}>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {t("common.loading", "Loading...")}
                </div>
                <div className="text-2xl font-bold">--</div>
                <div className="text-xs text-muted-foreground">
                  {t(
                    "dashboard.fallback.willLoad",
                    "Dashboard will load shortly",
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Error Boundary Component for additional protection
class DashboardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Dashboard Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Fallback mode - basic functionality available
              </p>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              There was an issue loading the enhanced dashboard. The system is
              running in fallback mode.
              <br />
              <Button
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.reload();
                }}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Reload Dashboard
              </Button>
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground">
                  Quick Actions
                </div>
                <div className="mt-2 space-y-2">
                  <Button
                    onClick={() => (window.location.href = "/leads")}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    View Leads
                  </Button>
                  <Button
                    onClick={() => (window.location.href = "/messages")}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    View Messages
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Dashboard Page Component
 * 
 * Features:
 * - Mobile-first responsive design
 * - Real-time analytics and metrics
 * - Interactive charts and widgets
 * - BANT/HEAT lead progression tracking
 * - Performance targets monitoring
 * 
 * Mobile Optimizations:
 * - Proper spacing and padding for mobile screens
 * - Single-column layout on mobile
 * - Touch-friendly interface elements
 * - Optimized chart heights for mobile viewing
 */

interface DashboardPageProps {
  className?: string; // Future props can be added here
}

const DashboardPage: React.FC<DashboardPageProps> = () => {
  const { isRTL } = useLang();
  const { isMobile } = useMobileInfo();

  // The app shell (Layout) owns the header, navigation and page padding at every width.
  return (
    <DashboardErrorBoundary>
      {/* Main Content with mobile-aware spacing and overflow prevention */}
      <div
        className={cn(
          // Base layout
          "w-full",
          // RTL support
          isRTL && "rtl",
          isMobile ? "space-y-3" : "space-y-6",
          // Overflow prevention for mobile
          isMobile && [
            "overflow-x-hidden", // Prevent horizontal scroll
            "max-w-screen", // Ensure content doesn't exceed screen width
          ]
        )}
        dir={isRTL ? "rtl" : "ltr"}
        data-testid="dashboard-page"
      >
        {/* DATA ENHANCED DASHBOARD - Real-Time Analytics + Charts + Widgets */}
        {/* Shows: BANT Qualification Rate, Hot & Burning Leads, First Message Rate, Meeting Pipeline, Temperature Distribution, Charts, Graphs */}
        <div className={cn(
          "w-full",
          // Ensure dashboard content doesn't overflow on mobile
          isMobile && "max-w-full overflow-hidden"
        )}>
          <EnhancedDashboardExample />
        </div>
      </div>
    </DashboardErrorBoundary>
  );
};

export default DashboardPage;

function DashboardSkeleton() {
  const { isMobile } = useMobileInfo();
  
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-4"
      )}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className={cn("p-6", isMobile && "p-4")}>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-[60px]" />
                <Skeleton className="h-3 w-[80px]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-7"
      )}>
        <Card className={cn(!isMobile && "col-span-4")}>
          <CardContent className={cn("p-6", isMobile && "p-4")}>
            <Skeleton className={cn(
              isMobile ? "h-[250px]" : "h-[350px]"
            )} />
          </CardContent>
        </Card>
        <Card className={cn(!isMobile && "col-span-3")}>
          <CardContent className={cn("p-6", isMobile && "p-4")}>
            <Skeleton className={cn(
              isMobile ? "h-[250px]" : "h-[350px]"
            )} />
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance Skeleton */}
      <Card>
        <CardContent className={cn("p-6", isMobile && "p-4")}>
          <Skeleton className={cn(
            isMobile ? "h-[150px]" : "h-[200px]"
          )} />
        </CardContent>
      </Card>
    </div>
  );
}
