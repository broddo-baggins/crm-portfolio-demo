import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserX, LogIn, ArrowLeft, Home, Mail } from "lucide-react";
import { Meteors } from "@/components/ui/meteors";

const UnauthorizedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(["pages", "common"]);
  const { isRTL } = useLang();

  useEffect(() => {
    console.warn(
      "401 Unauthorized: User attempted to access protected resource:",
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

  const handleLogin = () => {
    navigate('/auth/login');
  };

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden",
        isRTL && "rtl",
      )}
      dir={isRTL ? "rtl" : "ltr"}
      data-testid="unauthorized-page"
    >
      {/* Meteors Background Effect */}
      <Meteors number={18} className="animate-meteor" />
      
      <div className="max-w-md w-full text-center relative z-10">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="mx-auto h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <UserX className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-6xl font-bold mb-4 text-foreground">401</h1>
        
        {/* Error Message */}
        <h2 className="text-2xl font-semibold mb-2 text-foreground">
          {t("pages:errors.unauthorized.title", "Unauthorized Access")}
        </h2>
        
        <p className="text-lg text-muted-foreground mb-6">
          {t("pages:errors.unauthorized.message", "You don't have permission to access this resource. Please log in or contact your administrator.")}
        </p>

        {/* Error Details */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-center mb-2">
            <LogIn className={cn("h-4 w-4 text-muted-foreground", isRTL ? "ml-2" : "mr-2")} />
            <span className="text-sm font-medium text-muted-foreground">
              {t("pages:errors.unauthorized.reason", "Authentication Required")}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("pages:errors.unauthorized.details", "This page requires valid authentication credentials. Your session may have expired.")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleLogin}
            className="w-full"
            data-testid="login-button"
          >
            <LogIn className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            {t("common:auth.login", "Log In")}
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
          {t("pages:errors.unauthorized.help", "If you believe this is an error, please contact support or try logging in again.")}
        </p>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 