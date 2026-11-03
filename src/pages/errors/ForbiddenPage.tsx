import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShieldX, Lock, ArrowLeft, Home, Mail } from "lucide-react";
import { Meteors } from "@/components/ui/meteors";

const ForbiddenPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(["pages", "common"]);
  const { isRTL } = useLang();

  useEffect(() => {
    console.warn(
      "403 Forbidden: Access denied to:",
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

  const handleContactSupport = () => {
    // Navigate to contact support or open email
    window.location.href = 'mailto:amit@amityogev.com?subject=CRM Demo - Access Issue';
  };

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden",
        isRTL && "rtl",
      )}
      dir={isRTL ? "rtl" : "ltr"}
      data-testid="forbidden-page"
    >
      {/* Meteors Background Effect */}
      <Meteors number={20} className="animate-meteor" />
      
      <div className="max-w-md w-full text-center relative z-10">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="mx-auto h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <ShieldX className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-6xl font-bold mb-4 text-foreground">403</h1>
        
        {/* Error Message */}
        <h2 className="text-2xl font-semibold mb-2 text-foreground">
          {t("pages:errors.forbidden.title", "Access Forbidden")}
        </h2>
        
        <p className="text-lg text-muted-foreground mb-6">
          {t("pages:errors.forbidden.message", "You don't have sufficient permissions to access this resource.")}
        </p>

        {/* Error Details */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-center mb-2">
            <Lock className={cn("h-4 w-4 text-muted-foreground", isRTL ? "ml-2" : "mr-2")} />
            <span className="text-sm font-medium text-muted-foreground">
              {t("pages:errors.forbidden.reason", "Insufficient Permissions")}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("pages:errors.forbidden.details", "Your current role doesn't grant access to this resource. Contact your administrator if you need access.")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleContactSupport}
            className="w-full"
            data-testid="contact-support-button"
          >
            <Mail className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            {t("common:actions.contactSupport", "Contact Support")}
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
          {t("pages:errors.forbidden.help", "If you believe you should have access to this resource, please contact your administrator.")}
        </p>
      </div>
    </div>
  );
};

export default ForbiddenPage; 