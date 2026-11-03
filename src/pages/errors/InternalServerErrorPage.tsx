import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ServerCrash, RefreshCw, ArrowLeft, Home, Bug } from "lucide-react";
import { Meteors } from "@/components/ui/meteors";

const InternalServerErrorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(["pages", "common"]);
  const { isRTL } = useLang();

  useEffect(() => {
    console.warn(
      "500 Internal Server Error: Server error occurred at:",
      location.pathname,
    );
  }, [location.pathname]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleReportIssue = () => {
    const errorDetails = `Error occurred at: ${location.pathname}\nTimestamp: ${new Date().toISOString()}\nUser Agent: ${navigator.userAgent}`;
    window.location.href = `mailto:amit@amityogev.com?subject=CRM Demo - Error Report&body=${encodeURIComponent(errorDetails)}`;
  };

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden",
        isRTL && "rtl",
      )}
      dir={isRTL ? "rtl" : "ltr"}
      data-testid="internal-server-error-page"
    >
      {/* Meteors Background Effect */}
      <Meteors number={30} className="animate-meteor" />
      
      <div className="max-w-md w-full text-center relative z-10">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="mx-auto h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <ServerCrash className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-6xl font-bold mb-4 text-foreground">500</h1>
        
        {/* Error Message */}
        <h2 className="text-2xl font-semibold mb-2 text-foreground">
          {t("pages:errors.internalServerError.title", "Internal Server Error")}
        </h2>
        
        <p className="text-lg text-muted-foreground mb-6">
          {t("pages:errors.internalServerError.message", "Something went wrong on our servers. We're working to fix this issue.")}
        </p>

        {/* Error Details */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-center mb-2">
            <ServerCrash className={cn("h-4 w-4 text-muted-foreground", isRTL ? "ml-2" : "mr-2")} />
            <span className="text-sm font-medium text-muted-foreground">
              {t("pages:errors.internalServerError.reason", "Server-Side Error")}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("pages:errors.internalServerError.details", "An unexpected error occurred while processing your request. Our technical team has been notified.")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleRefresh}
            className="w-full"
            data-testid="refresh-button"
          >
            <RefreshCw className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            {t("common:actions.refresh", "Try Again")}
          </Button>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleGoBack}
              variant="outline"
              className="flex-1"
              data-testid="go-back-button"
            >
              <ArrowLeft className={cn("h-4 w-4", isRTL ? "ml-2 rotate-180" : "mr-2")} />
              {t("common:navigation.goBack", "Go Back")}
            </Button>
            
            <Button 
              onClick={handleGoHome}
              variant="outline"
              className="flex-1"
              data-testid="go-home-button"
            >
              <Home className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              {t("common:navigation.home", "Home")}
            </Button>
          </div>

          <Button 
            onClick={handleReportIssue}
            variant="ghost"
            className="w-full text-sm"
            data-testid="report-issue-button"
          >
            <Bug className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            {t("common:actions.reportIssue", "Report Issue")}
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground mt-6">
          {t("pages:errors.internalServerError.help", "If this problem continues, please contact our support team with the error details.")}
        </p>
      </div>
    </div>
  );
};

export default InternalServerErrorPage; 