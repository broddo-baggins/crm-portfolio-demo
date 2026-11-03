import React, { Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { Outlet } from 'react-router';
import { cn } from '@/lib/utils';
import { useLang } from '@/hooks/useLang';
import { useMobileInfo, useMobileLoading } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
import ProgressWithLoading from '@/components/ui/progress-with-loading';
import MobileBottomNavigation from '@/components/mobile/MobileBottomNavigation';
import Footer from '@/components/layout/Footer';

interface AppLayoutProps {
  children?: React.ReactNode;
}

// Error boundary class component
class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Mobile-optimized loading component
const MobileLoadingFallback: React.FC = () => {
  const { t } = useTranslation('common');
  const { isMobile } = useMobileInfo();
  
  return (
    <div className={cn(
      "flex items-center justify-center",
      isMobile ? "h-32 px-4" : "h-64"
    )}>
      <div className={cn(
        "w-full space-y-4",
        isMobile ? "max-w-sm p-4" : "max-w-md p-8"
      )}>
        <ProgressWithLoading
          value={75}
          label={t('common.loading', 'Loading...')}
          description={isMobile ? "Preparing content" : "Preparing page content"}
          animated
          indeterminate
        />
        {isMobile && (
          <div className="text-xs text-muted-foreground text-center">
            {t('common.mobileLoading', 'Optimizing for mobile...')}
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced error boundary for mobile
const MobileErrorFallback: React.FC<{ error?: Error }> = ({ error }) => {
  const { t } = useTranslation('common');
  const { isMobile } = useMobileInfo();
  
  return (
    <div className={cn(
      "flex items-center justify-center",
      isMobile ? "h-32 px-4" : "h-64"
    )}>
      <div className={cn(
        "w-full space-y-4 text-center",
        isMobile ? "max-w-sm p-4" : "max-w-md p-8"
      )}>
        <h3 className="text-lg font-semibold text-destructive">
          {t('errors.loading.error', 'Loading Error')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isMobile 
            ? t('errors.mobile.failedToLoad', 'Page failed to load on mobile. Please try refreshing.')
            : t('errors.loading.description', 'The page failed to load. Please try refreshing or check your connection.')
          }
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm touch-manipulation"
        >
          {t('errors.loading.refreshPage', 'Refresh Page')}
        </button>
        {error && process.env.NODE_ENV === 'development' && (
          <details className="text-xs text-left">
            <summary>{t('errors.boundary.errorDetails', 'Error Details')}</summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isRTL } = useLang();
  const { isMobile, hasNotch } = useMobileInfo();
  const { enableFallbacks } = useMobileLoading();

  // Mobile layout - different structure without sidebar
  if (isMobile) {
    return (
      <div className={cn(
        "min-h-screen bg-background flex flex-col",
        isRTL && "rtl",
        // Safe area support for devices with notches
        hasNotch && "pt-safe-area-top pb-safe-area-bottom"
      )}>
        {/* Main Content Area - No sidebar on mobile */}
        <main className={cn(
          "flex-1 overflow-auto",
          // Account for bottom navigation
          "pb-[calc(80px+env(safe-area-inset-bottom))]"
        )}>
          <div className="px-4 py-2">
            <Suspense 
              fallback={<MobileLoadingFallback />}
            >
              <ErrorBoundary
                fallback={<MobileErrorFallback />}
                onError={(error) => {
                  console.error('Mobile layout error:', error);
                }}
              >
                {children || <Outlet />}
              </ErrorBoundary>
            </Suspense>
          </div>
        </main>
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNavigation />
        
        {/* Mobile Footer - Simplified */}
        <Footer />
      </div>
    );
  }

  // Desktop layout (unchanged)
  return (
    <div className={cn(
      "min-h-screen bg-background flex flex-col",
      isRTL && "rtl"
    )}>
                    <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
        <Suspense 
          fallback={
            <div className="flex items-center justify-center h-64">
              <div className="w-full max-w-md space-y-4 p-8">
                <ProgressWithLoading
                  value={75}
                  label="Loading..."
                  description="Preparing page content"
                  animated
                  indeterminate
                />
              </div>
            </div>
          }
        >
          {enableFallbacks ? (
            <ErrorBoundary
              fallback={<MobileErrorFallback />}
              onError={(error) => {
                console.error('Desktop layout error:', error);
              }}
            >
              {children || <Outlet />}
            </ErrorBoundary>
          ) : (
            children || <Outlet />
          )}
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
};

export default AppLayout; 