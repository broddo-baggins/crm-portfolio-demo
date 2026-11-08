import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LogIn, UserX } from "lucide-react";
import { ErrorPageLayout } from "./ErrorPageLayout";

const UnauthorizedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(["pages", "common"]);

  useEffect(() => {
    console.debug(
      "401 Unauthorized: User attempted to access protected route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <ErrorPageLayout
      code="401"
      icon={UserX}
      i18nKey="unauthorized"
      testId="unauthorized-page"
      fallback={{
        title: "Unauthorized Access",
        message: "You don't have permission to access this resource. Please log in or contact your administrator.",
        reason: "Authentication Required",
        details: "This page requires valid authentication credentials. Your session may have expired.",
        help: "If you believe this is an error, please contact support or try logging in again.",
      }}
      primary={{
        label: t("common:auth.login", "Log In"),
        icon: LogIn,
        onClick: () => navigate("/auth/login"),
        testId: "login-button",
      }}
    />
  );
};

export default UnauthorizedPage;
