import { Link, useLocation } from "react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Compass } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/system/States";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation("pages");
  const { isRTL } = useLang();

  useEffect(() => {
    console.debug(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <StatusScreen
      code="Error 404"
      icon={Compass}
      title={t("notFound.message", "Oops! Page not found")}
      message={`${location.pathname} isn't a page in CRM Demo. It may have moved, or the link has a typo.`}
      dir={isRTL ? "rtl" : "ltr"}
      testId="not-found-page"
      actions={
        <>
          <Button asChild>
            <Link to="/">{t("notFound.returnHome", "Return to Home")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">Open the dashboard</Link>
          </Button>
        </>
      }
    />
  );
};

export default NotFound;
