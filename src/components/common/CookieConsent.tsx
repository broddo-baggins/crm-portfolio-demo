import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Info } from "lucide-react";
import {
  trackEvent,
  trackUserAction,
  enableAnalytics,
} from "@/utils/combined-analytics";
import { useTranslation } from 'react-i18next';
import { useLang } from '@/hooks/useLang';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ConsentOptions = {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
};

const CookieConsent = () => {
  const { t } = useTranslation('common');
  const { isRTL, rtl } = useLang();
  const [showConsent, setShowConsent] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<ConsentOptions>({
    essential: true, // Essential cookies are always required
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already consented
    const storedConsent = localStorage.getItem("cookie-consent");
    if (!storedConsent) {
      // Show the banner if no consent is found
      setShowConsent(true);

      // Track cookie consent banner shown
      trackEvent("cookie_consent_shown", "privacy", "consent_banner");
    } else {
      try {
        // Apply stored consent settings
        const parsedConsent = JSON.parse(storedConsent) as ConsentOptions;
        setConsent(parsedConsent);

        // Enable analytics based on stored consent
        if (parsedConsent.analytics || parsedConsent.marketing) {
          enableAnalytics(parsedConsent.analytics, parsedConsent.analytics);
        }
      } catch (e) {
        console.error("Error parsing stored cookie consent:", e);
        setShowConsent(true);
      }
    }
  }, []);

  const saveConsent = async (options: ConsentOptions) => {
    try {
      // Store consent in local storage first for immediate use
      localStorage.setItem("cookie-consent", JSON.stringify(options));
      setConsent(options);
      setShowConsent(false);

      // Note: Cookie consent is stored in localStorage for now
      // Database storage can be added later when user_app_preferences table is properly configured
      console.log('Cookie consent saved to localStorage:', options);

      // Track consent decision - wrap in try-catch to prevent API errors
      try {
        trackEvent("cookie_consent_saved", "privacy", "consent_decision", 1, {
          analytics_consent: options.analytics,
          marketing_consent: options.marketing,
          essential_consent: options.essential,
        });

        trackUserAction("cookie_preferences_set", {
          consent_options: options,
          analytics_enabled: options.analytics,
          marketing_enabled: options.marketing,
        });
      } catch (trackingError) {
        console.warn('Cookie consent tracking failed:', trackingError);
        // Don't show error to user - consent was saved successfully
      }

      // Show success message
      toast.success('Cookie preferences saved successfully');
      
    } catch (mainError) {
      console.error('Failed to save cookie consent:', mainError);
      toast.error('Failed to save cookie preferences. Please try again.');
      
      // Revert UI state on failure
      setShowConsent(true);
    }
  };

  const handleAcceptAll = () => {
    const allConsent = {
      essential: true,
      analytics: true,
      marketing: true,
    };

    // Track accept all action
    trackEvent("cookie_consent_accept_all", "privacy", "consent_accept_all");

    saveConsent(allConsent);
  };

  const handleDeclineAll = () => {
    const minimalConsent = {
      essential: true,
      analytics: false,
      marketing: false,
    };

    // Track decline all action
    trackEvent("cookie_consent_decline_all", "privacy", "consent_decline_all");

    saveConsent(minimalConsent);
  };

  const handleSavePreferences = () => {
    // Track save preferences action
    trackEvent(
      "cookie_consent_save_preferences",
      "privacy",
      "consent_custom",
      1,
      {
        analytics_selected: consent.analytics,
        marketing_selected: consent.marketing,
      },
    );

    saveConsent({
      ...consent,
      essential: true, // Essential cookies are always required
    });
  };

  const handleShowDetails = () => {
    setShowDetails(!showDetails);

    // Track details toggle
    trackEvent(
      "cookie_consent_details_toggled",
      "privacy",
      showDetails ? "details_hidden" : "details_shown",
    );
  };

  // Don't render if user has already consented
  if (!showConsent) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 z-50 max-w-full ${isRTL 
      ? 'right-4 left-4 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm'
      : 'left-4 right-4 sm:bottom-4 sm:right-4 sm:left-auto sm:max-w-sm'
    }`} data-testid="cookie-consent">
      <Card className="border border-border bg-popover shadow-float" role="region" aria-label={t('cookieConsent.title', 'Cookie Consent')}>
        <CardContent className="p-4 md:p-4">
          <div className="flex items-start gap-3">
            <div className="hidden shrink-0 rounded-md bg-muted p-1.5 sm:block">
              <Shield className="h-4 w-4 text-subtle" aria-hidden="true" />
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="text-sm font-semibold">{t('cookieConsent.title', 'Cookie Consent')}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('cookieConsent.description', 'This site uses cookies to improve your experience. Essential cookies are necessary for the site to function and cannot be disabled.')}
              </p>
              
              {showDetails && (
                <div className="space-y-3 border-t pt-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="essential"
                      checked={consent.essential}
                      disabled
                      className="h-4 w-4"
                    />
                    <label
                      htmlFor="essential"
                      className="text-xs font-medium text-muted-foreground cursor-not-allowed"
                    >
                      {t('cookieConsent.essential', 'Essential (Required)')}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="analytics"
                      checked={consent.analytics}
                      onCheckedChange={(checked) =>
                        setConsent((prev) => ({
                          ...prev,
                          analytics: checked === true,
                        }))
                      }
                      className="h-4 w-4"
                    />
                    <label
                      htmlFor="analytics"
                      className="text-xs font-medium cursor-pointer"
                    >
                      {t('cookieConsent.analytics', 'Analytics')}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="marketing"
                      checked={consent.marketing}
                      onCheckedChange={(checked) =>
                        setConsent((prev) => ({
                          ...prev,
                          marketing: checked === true,
                        }))
                      }
                      className="h-4 w-4"
                    />
                    <label
                      htmlFor="marketing"
                      className="text-xs font-medium cursor-pointer"
                    >
                      {t('cookieConsent.marketing', 'Marketing')}
                    </label>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4 text-xs">
                  <button
                    onClick={handleShowDetails}
                    className="flex min-h-[32px] items-center gap-1 font-medium text-foreground underline decoration-line-strong underline-offset-4 hover:decoration-current touch-manipulation"
                    data-testid="cookie-details"
                  >
                    <Info className="h-3 w-3" aria-hidden="true" />
                    {showDetails ? "Hide" : "Details"}
                  </button>
                  <Link
                    to="/privacy-policy#cookies-and-tracking"
                    className="flex min-h-[32px] items-center font-medium text-foreground underline decoration-line-strong underline-offset-4 hover:decoration-current touch-manipulation"
                    data-testid="cookie-learn-more"
                  >
                    Learn more
                  </Link>
                </div>

                <div className="flex flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={handleDeclineAll}
                    size="sm"
                    className="min-h-[44px] px-4 text-sm flex-1 touch-manipulation"
                    data-testid="cookie-decline"
                  >
                    {t('cookieConsent.decline', 'Decline')}
                  </Button>
                  {showDetails ? (
                    <Button 
                      onClick={handleSavePreferences} 
                      size="sm"
                      className="min-h-[44px] px-4 text-sm flex-1 touch-manipulation"
                      data-testid="cookie-save"
                    >
                      {t('cookieConsent.save', 'Save')}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleAcceptAll}
                      data-testid="cookie-accept" 
                      size="sm"
                      className="min-h-[44px] px-4 text-sm flex-1 touch-manipulation"
                    >
                      {t('cookieConsent.acceptAll', 'Accept All')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieConsent;
