import * as React from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Home } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/system/States";

interface ErrorAction {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  testId: string;
  disabled?: boolean;
}

interface ErrorPageLayoutProps {
  code: string;
  icon: React.ElementType;
  /** The page's key under pages:errors (title, message, reason, details, help). */
  i18nKey: string;
  fallback: { title: string; message: string; reason: string; details: string; help: string };
  primary: ErrorAction;
  extra?: ErrorAction;
  testId: string;
  children?: React.ReactNode;
}

/** The shared 4xx/5xx page: a plain title, one sentence, what happened, and the ways out. */
export function ErrorPageLayout({ code, icon, i18nKey, fallback, primary, extra, testId, children }: ErrorPageLayoutProps) {
  const navigate = useNavigate();
  const { t } = useTranslation(["pages", "common"]);
  const { isRTL } = useLang();
  const k = (field: keyof typeof fallback) => t(`pages:errors.${i18nKey}.${field}`, fallback[field]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  const PrimaryIcon = primary.icon;
  const ExtraIcon = extra?.icon;

  return (
    <StatusScreen
      code={`Error ${code}`}
      icon={icon}
      title={k("title")}
      message={k("message")}
      dir={isRTL ? "rtl" : "ltr"}
      testId={testId}
      detail={
        <div className="border-s-2 border-line-strong ps-4">
          <p className="text-sm font-medium text-foreground">{k("reason")}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{k("details")}</p>
        </div>
      }
      actions={
        <>
          <Button onClick={primary.onClick} disabled={primary.disabled} data-testid={primary.testId}>
            <PrimaryIcon className="h-4 w-4" aria-hidden="true" />
            {primary.label}
          </Button>
          <Button onClick={handleGoBack} variant="outline" data-testid="go-back-button">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            {t("common:navigation.goBack", "Go Back")}
          </Button>
          <Button onClick={() => navigate("/dashboard")} variant="ghost" data-testid="go-home-button">
            <Home className="h-4 w-4" aria-hidden="true" />
            {t("common:navigation.home", "Home")}
          </Button>
          {extra && ExtraIcon && (
            <Button onClick={extra.onClick} variant="link" data-testid={extra.testId}>
              <ExtraIcon className="h-4 w-4" aria-hidden="true" />
              {extra.label}
            </Button>
          )}
        </>
      }
      help={k("help")}
    >
      {children}
    </StatusScreen>
  );
}

export default ErrorPageLayout;
