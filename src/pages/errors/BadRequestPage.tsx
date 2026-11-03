import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { ErrorPageLayout } from "./ErrorPageLayout";

const BadRequestPage = () => {
  const location = useLocation();
  const { t } = useTranslation(["pages", "common"]);

  useEffect(() => {
    console.warn(
      "400 Bad Request: Invalid request made to:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <ErrorPageLayout
      code="400"
      icon={AlertTriangle}
      i18nKey="badRequest"
      testId="bad-request-page"
      fallback={{
        title: "Bad Request",
        message: "The request couldn't be processed due to invalid parameters or malformed data.",
        reason: "Invalid Request Format",
        details: "The server couldn't understand the request due to invalid syntax or missing required parameters.",
        help: "If this problem persists, please contact support with the error details.",
      }}
      primary={{
        label: t("common:actions.refresh", "Refresh Page"),
        icon: RefreshCw,
        onClick: () => window.location.reload(),
        testId: "refresh-button",
      }}
    />
  );
};

export default BadRequestPage;
