import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, ArrowLeft, Home } from "lucide-react";
import { Meteors } from "@/components/ui/meteors";

const BadRequestPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(["pages", "common"]);
  const { isRTL } = useLang();

  useEffect(() => {
    console.warn(
      "400 Bad Request: Invalid request made to:",
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

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden",
        isRTL && "rtl",
      )}
      dir={isRTL ? "rtl" : "ltr"}
      data-testid="bad-request-page"
    >
      {/* Meteors Background Effect */}
      <Meteors number={15} className="animate-meteor" />
      
      <div className="max-w-md w-full text-center relative z-10">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="mx-auto h-20 w-20 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-orange-600 dark:text-orange-400" />
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-6xl font-bold mb-4 text-foreground">400</h1>
        
        {/* Error Message */}
        <h2 className="text-2xl font-semibold mb-2 text-foreground">
          {t("pages:errors.badRequest.title", "Bad Request")}
        </h2>
        
        <p className="text-lg text-muted-foreground mb-6">
          {t("pages:errors.badRequest.message", "The request couldn't be processed due to invalid parameters or malformed data.")}
        </p>

        {/* Error Details */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-center mb-2">
            <AlertTriangle className={cn("h-4 w-4 text-muted-foreground", isRTL ? "ml-2" : "mr-2")} />
            <span className="text-sm font-medium text-muted-foreground">
              {t("pages:errors.badRequest.reason", "Invalid Request Format")}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("pages:errors.badRequest.details", "The server couldn't understand the request due to invalid syntax or missing required parameters.")}
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
            {t("common:actions.refresh", "Refresh Page")}
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
          {t("pages:errors.badRequest.help", "If this problem persists, please contact support with the error details.")}
        </p>
      </div>
    </div>
  );
};

export default BadRequestPage; 