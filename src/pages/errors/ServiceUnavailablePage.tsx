import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock, Construction, RefreshCw } from "lucide-react";
import { ErrorPageLayout } from "./ErrorPageLayout";

const ServiceUnavailablePage = () => {
  const location = useLocation();
  const { t } = useTranslation(["pages", "common"]);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ErrorPageLayout
      code="503"
      icon={Construction}
      i18nKey="serviceUnavailable"
      testId="service-unavailable-page"
      fallback={{
        title: "Service Unavailable",
        message: "The service is temporarily unavailable. We're performing maintenance to improve your experience.",
        reason: "Temporary Maintenance",
        details: "Our system is currently undergoing scheduled maintenance. This should only take a few minutes.",
        help: "Thank you for your patience. The service will be restored shortly.",
      }}
      primary={{
        label:
          retryCountdown > 0
            ? t("common:actions.retryingIn", `Retrying in ${retryCountdown}s`)
            : t("common:actions.refresh", "Try Again"),
        icon: RefreshCw,
        onClick: () => window.location.reload(),
        testId: "refresh-button",
        disabled: retryCountdown > 0,
      }}
    >
      {/* Countdown Timer */}
      <p className="mt-4 inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm text-subtle" aria-live="polite">
        <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        {t("pages:errors.serviceUnavailable.nextRetry", "Next auto-retry in:")}
        <span className="font-semibold tabular-nums text-foreground">{formatTime(retryCountdown)}</span>
      </p>
    </ErrorPageLayout>
  );
};

export default ServiceUnavailablePage;
