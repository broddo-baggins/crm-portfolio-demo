import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Construction, RefreshCw, ArrowLeft, Home, Clock } from "lucide-react";
import { Meteors } from "@/components/ui/meteors";

const ServiceUnavailablePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(["pages", "common"]);
  const { isRTL } = useLang();
  const [retryCountdown, setRetryCountdown] = useState(60);

  useEffect(() => {
    console.warn(
      "503 Service Unavailable: Service temporarily unavailable at:",
      location.pathname,
    );
  }, [location.pathname]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRetryCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden",
        isRTL && "rtl",
      )}
      dir={isRTL ? "rtl" : "ltr"}
      data-testid="service-unavailable-page"
    >
      {/* Meteors Background Effect */}
      <Meteors number={25} className="animate-meteor" />
      
      <div className="max-w-md w-full text-center relative z-10">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="mx-auto h-20 w-20 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
            <Construction className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-6xl font-bold mb-4 text-foreground">503</h1>
        
        {/* Error Message */}
        <h2 className="text-2xl font-semibold mb-2 text-foreground">
          {t("pages:errors.serviceUnavailable.title", "Service Unavailable")}
        </h2>
        
        <p className="text-lg text-muted-foreground mb-6">
          {t("pages:errors.serviceUnavailable.message", "The service is temporarily unavailable. We're performing maintenance to improve your experience.")}
        </p>

        {/* Error Details */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-center mb-2">
            <Construction className={cn("h-4 w-4 text-muted-foreground", isRTL ? "ml-2" : "mr-2")} />
            <span className="text-sm font-medium text-muted-foreground">
              {t("pages:errors.serviceUnavailable.reason", "Temporary Maintenance")}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {t("pages:errors.serviceUnavailable.details", "Our system is currently undergoing scheduled maintenance. This should only take a few minutes.")}
          </p>
          
          {/* Countdown Timer */}
          <div className="flex items-center justify-between bg-background rounded-md p-2">
            <div className="flex items-center">
              <Clock className={cn("h-4 w-4 text-muted-foreground", isRTL ? "ml-2" : "mr-2")} />
              <span className="text-sm text-muted-foreground">
                {t("pages:errors.serviceUnavailable.nextRetry", "Next auto-retry in:")}
              </span>
            </div>
            <span className="text-sm font-mono font-semibold text-foreground">
              {formatTime(retryCountdown)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleRefresh}
            className="w-full"
            disabled={retryCountdown > 0}
            data-testid="refresh-button"
          >
            <RefreshCw className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2", retryCountdown > 0 && "animate-spin")} />
            {retryCountdown > 0 
              ? t("common:actions.retryingIn", `Retrying in ${retryCountdown}s`)
              : t("common:actions.refresh", "Try Again")
            }
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
        </div>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground mt-6">
          {t("pages:errors.serviceUnavailable.help", "Thank you for your patience. The service will be restored shortly.")}
        </p>
      </div>
    </div>
  );
};

export default ServiceUnavailablePage; 