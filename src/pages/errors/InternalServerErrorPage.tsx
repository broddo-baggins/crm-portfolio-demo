import { useLocation } from "react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Bug, RefreshCw, ServerCrash } from "lucide-react";
import { ErrorPageLayout } from "./ErrorPageLayout";

const InternalServerErrorPage = () => {
  const location = useLocation();
  const { t } = useTranslation(["pages", "common"]);

  useEffect(() => {
    console.warn(
      "500 Internal Server Error: Server error occurred at:",
      location.pathname,
    );
  }, [location.pathname]);

  const handleReportIssue = () => {
    const errorDetails = `Error occurred at: ${location.pathname}\nTimestamp: ${new Date().toISOString()}\nUser Agent: ${navigator.userAgent}`;
    window.location.href = `mailto:amit@amityogev.com?subject=CRM Demo - Error Report&body=${encodeURIComponent(errorDetails)}`;
  };

  return (
    <ErrorPageLayout
      code="500"
      icon={ServerCrash}
      i18nKey="internalServerError"
      testId="internal-server-error-page"
      fallback={{
        title: "Internal Server Error",
        message: "Something went wrong on our servers. We're working to fix this issue.",
        reason: "Server-Side Error",
        details: "An unexpected error occurred while processing your request. Our technical team has been notified.",
        help: "If this problem continues, please contact our support team with the error details.",
      }}
      primary={{
        label: t("common:actions.refresh", "Try Again"),
        icon: RefreshCw,
        onClick: () => window.location.reload(),
        testId: "refresh-button",
      }}
      extra={{
        label: t("common:actions.reportIssue", "Report Issue"),
        icon: Bug,
        onClick: handleReportIssue,
        testId: "report-issue-button",
      }}
    />
  );
};

export default InternalServerErrorPage;
