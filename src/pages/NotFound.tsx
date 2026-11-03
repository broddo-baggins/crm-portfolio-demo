import { useLocation } from "react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Meteors } from "@/components/ui/meteors";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation("pages");
  const { isRTL } = useLang();

  useEffect(() => {
    console.warn(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-background relative overflow-hidden",
        isRTL && "rtl",
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Meteors Background Effect */}
      <Meteors number={12} className="animate-meteor" data-testid="meteor-animation" />
      
      <div className="text-center relative z-10">
        <h1 className="text-4xl font-bold mb-4 text-foreground">404</h1>
        <p className="text-xl text-muted-foreground mb-4">
          {t("notFound.message", "Oops! Page not found")}
        </p>
        <Button
          onClick={() => (window.location.href = "/")}
          variant="link"
          className="text-primary hover:text-primary/80"
        >
          {t("notFound.returnHome", "Return to Home")}
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
