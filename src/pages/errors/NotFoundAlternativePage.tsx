import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusScreen } from "@/components/system/States";
import { Search, Home, ArrowLeft, Compass, MapPin, Lightbulb } from "lucide-react";

const NotFoundAlternativePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(["pages", "common"]);
  const { isRTL } = useLang();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    console.warn(
      "404 Alternative: Page not found (alternative design):",
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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // There is no /search page; the help center's search covers the site
      navigate(`/faq?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const quickLinks = [
    { label: t("common:navigation.dashboard", "Dashboard"), path: "/dashboard", icon: Home },
    { label: t("common:navigation.leads", "Leads"), path: "/leads", icon: MapPin },
    { label: t("common:navigation.messages", "Messages"), path: "/messages", icon: Search },
    { label: t("common:navigation.reports", "Reports"), path: "/reports", icon: Lightbulb },
  ];

  return (
    <StatusScreen
      code="Error 404"
      icon={Compass}
      title={t("pages:errors.notFound.alternative.title", "Oops! You're off the map")}
      message={t("pages:errors.notFound.alternative.message", "The page you're looking for seems to have wandered off. Don't worry, let's get you back on track!")}
      dir={isRTL ? "rtl" : "ltr"}
      testId="not-found-alternative-page"
      help={
        <>
          {t("pages:errors.notFound.alternative.helpMessage", "The URL you entered might be mistyped, or the page might have been moved or deleted.")}{" "}
          {t("pages:errors.notFound.alternative.urlInfo", "Requested URL:")}{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">{location.pathname}</code>
        </>
      }
      actions={
        <>
          <Button onClick={handleGoHome} data-testid="go-home-button">
            <Home className="h-4 w-4" aria-hidden="true" />
            {t("common:navigation.home", "Go Home")}
          </Button>
          <Button onClick={handleGoBack} variant="outline" data-testid="go-back-button">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            {t("common:navigation.goBack", "Go Back")}
          </Button>
        </>
      }
    >
      {/* Search */}
      <form
        className="mt-8 max-w-[440px]"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
      >
        <label htmlFor="not-found-search" className="text-sm font-medium text-foreground">
          {t("pages:errors.notFound.alternative.searchTitle", "Search for what you need")}
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="not-found-search"
            type="text"
            placeholder={t("pages:errors.notFound.alternative.searchPlaceholder", "What are you looking for?")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 min-w-0 flex-1 rounded-md border border-input bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            data-testid="search-input"
          />
          <Button type="submit" variant="outline" data-testid="search-button" aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("pages:errors.notFound.alternative.searchHint", "Try searching for leads, reports, or specific features")}
        </p>
      </form>

      {/* Quick Navigation */}
      <nav className="mt-8" aria-labelledby="quick-nav-title">
        <h2 id="quick-nav-title" className="text-sm font-medium text-foreground">
          {t("pages:errors.notFound.alternative.quickNavTitle", "Quick Navigation")}
        </h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {quickLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <li key={link.path}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(link.path)}
                  data-testid={`quick-link-${link.path.replace('/', '')}`}
                >
                  <IconComponent className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  {link.label}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
    </StatusScreen>
  );
};

export default NotFoundAlternativePage; 