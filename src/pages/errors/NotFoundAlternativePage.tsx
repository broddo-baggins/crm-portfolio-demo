import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Home, ArrowLeft, Compass, MapPin, Lightbulb } from "lucide-react";
import { Meteors } from "@/components/ui/meteors";

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
      // Navigate to a search results page or perform search
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const quickLinks = [
    { label: t("common:navigation.dashboard", "Dashboard"), path: "/dashboard", icon: Home },
    { label: t("common:navigation.leads", "Leads"), path: "/leads", icon: MapPin },
    { label: t("common:navigation.messages", "Messages"), path: "/messages", icon: Search },
    { label: t("common:navigation.reports", "Reports"), path: "/reports", icon: Lightbulb },
  ];

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-background via-muted/20 to-background px-4 py-8 relative overflow-hidden",
        isRTL && "rtl",
      )}
      dir={isRTL ? "rtl" : "ltr"}
      data-testid="not-found-alternative-page"
    >
      {/* Meteors Background Effect */}
      <Meteors number={22} className="animate-meteor" />
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-12">
          {/* Animated 404 with Creative Design */}
          <div className="relative mb-8">
            <div className="text-[12rem] font-bold text-primary/20 leading-none select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border">
                <Compass className="h-16 w-16 text-primary mx-auto animate-spin slow-spin" />
              </div>
            </div>
          </div>
          
          {/* Error Message */}
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            {t("pages:errors.notFound.alternative.title", "Oops! You're off the map")}
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("pages:errors.notFound.alternative.message", "The page you're looking for seems to have wandered off. Don't worry, let's get you back on track!")}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Search Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Search className={cn("h-5 w-5 text-primary", isRTL ? "ml-3" : "mr-3")} />
                <h2 className="text-lg font-semibold">
                  {t("pages:errors.notFound.alternative.searchTitle", "Search for what you need")}
                </h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t("pages:errors.notFound.alternative.searchPlaceholder", "What are you looking for?")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    data-testid="search-input"
                  />
                  <Button onClick={handleSearch} data-testid="search-button">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {t("pages:errors.notFound.alternative.searchHint", "Try searching for leads, reports, or specific features")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Navigation */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Compass className={cn("h-5 w-5 text-primary", isRTL ? "ml-3" : "mr-3")} />
                <h2 className="text-lg font-semibold">
                  {t("pages:errors.notFound.alternative.quickNavTitle", "Quick Navigation")}
                </h2>
              </div>
              
              <div className="grid gap-2">
                {quickLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <Button
                      key={link.path}
                      variant="ghost"
                      className="justify-start w-full"
                      onClick={() => navigate(link.path)}
                      data-testid={`quick-link-${link.path.replace('/', '')}`}
                    >
                      <IconComponent className={cn("h-4 w-4", isRTL ? "ml-3" : "mr-3")} />
                      {link.label}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fun Error Details */}
        <Card className="mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">
              {t("pages:errors.notFound.alternative.helpTitle", "What happened?")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t("pages:errors.notFound.alternative.helpMessage", "The URL you entered might be mistyped, or the page might have been moved or deleted.")}
            </p>
            
            <div className="flex flex-wrap justify-center gap-3">
              <Button 
                onClick={handleGoBack}
                variant="outline"
                data-testid="go-back-button"
              >
                <ArrowLeft className={cn("h-4 w-4", isRTL ? "ml-2 rotate-180" : "mr-2")} />
                {t("common:navigation.goBack", "Go Back")}
              </Button>
              
              <Button 
                onClick={handleGoHome}
                data-testid="go-home-button"
              >
                <Home className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {t("common:navigation.home", "Go Home")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer with URL Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            {t("pages:errors.notFound.alternative.urlInfo", "Requested URL:")} 
            <code className="bg-muted px-2 py-1 rounded text-xs ml-2">
              {location.pathname}
            </code>
          </p>
        </div>
      </div>

      {/* Custom CSS for slow spin animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .slow-spin {
            animation: spin 8s linear infinite;
          }
          
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `
      }} />
    </div>
  );
};

export default NotFoundAlternativePage; 