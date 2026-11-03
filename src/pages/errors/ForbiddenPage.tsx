import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Mail, ShieldX } from "lucide-react";
import { ErrorPageLayout } from "./ErrorPageLayout";

const ForbiddenPage = () => {
  const location = useLocation();
  const { t } = useTranslation(["pages", "common"]);

  useEffect(() => {
    console.warn(
      "403 Forbidden: User lacks permission for:",
      location.pathname,
    );
  }, [location.pathname]);

  const handleContactSupport = () => {
    // Navigate to contact support or open email
    window.location.href = 'mailto:amit@amityogev.com?subject=CRM Demo - Access Issue';
  };

  return (
    <ErrorPageLayout
      code="403"
      icon={ShieldX}
      i18nKey="forbidden"
      testId="forbidden-page"
      fallback={{
        title: "Access Forbidden",
        message: "You don't have sufficient permissions to access this resource.",
        reason: "Insufficient Permissions",
        details: "Your current role doesn't grant access to this resource. Contact your administrator if you need access.",
        help: "If you believe you should have access to this resource, please contact your administrator.",
      }}
      primary={{
        label: t("common:actions.contactSupport", "Contact Support"),
        icon: Mail,
        onClick: handleContactSupport,
        testId: "contact-support-button",
      }}
    />
  );
};

export default ForbiddenPage;
