import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield } from "lucide-react";
import {
  trackEvent,
  trackUserAction,
  enableAnalytics,
} from "@/utils/combined-analytics";
import { useTranslation } from 'react-i18next';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ConsentOptions = {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
};

const CookieConsent = () => {
  const { t } = useTranslation('common');
    const [showConsent, setShowConsent] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
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

  // Publish the bar's height so toasts stack above it instead of covering Decline and Accept
  useEffect(() => {
    const root = document.documentElement;
    const bar = barRef.current;
    if (!showConsent || !bar) {
      root.style.removeProperty("--cookie-bar-h");
      return;
    }
    const publish = () => root.style.setProperty("--cookie-bar-h", `${bar.offsetHeight}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(bar);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--cookie-bar-h");
    };
  }, [showConsent, showDetails]);

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
    <div
      ref={barRef}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-popover shadow-float"
      data-testid="cookie-consent"
      role="region"
      aria-label={t('cookieConsent.title', 'Cookie Consent')}
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-3 sm:px-8 md:flex-row md:items-center md:gap-6">
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-sm leading-5 text-secondary-foreground">
            <Shield className="me-2 inline h-4 w-4 align-text-bottom text-subtle" aria-hidden="true" />
            {t('cookieConsent.notice', 'We use essential cookies only unless you accept analytics.')}{' '}
            <button
              onClick={handleShowDetails}
              aria-expanded={showDetails}
              className="inline min-h-0 font-medium text-foreground underline decoration-line-strong underline-offset-4 hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation"
              data-testid="cookie-details"
            >
              {showDetails ? 'Hide details' : 'Details'}
            </button>
            {' · '}
            <Link
              to="/privacy-policy#cookies-and-tracking"
              className="min-h-0 font-medium text-foreground underline decoration-line-strong underline-offset-4 hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation"
              data-testid="cookie-learn-more"
            >
              Learn more
            </Link>
          </p>

          {showDetails && (
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id="essential" checked={consent.essential} disabled className="h-4 w-4" />
                <label htmlFor="essential" className="cursor-not-allowed text-xs font-medium text-muted-foreground">
                  {t('cookieConsent.essential', 'Essential (Required)')}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="analytics"
                  checked={consent.analytics}
                  onCheckedChange={(checked) => setConsent((prev) => ({ ...prev, analytics: checked === true }))}
                  className="h-4 w-4"
                />
                <label htmlFor="analytics" className="cursor-pointer text-xs font-medium">
                  {t('cookieConsent.analytics', 'Analytics')}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="marketing"
                  checked={consent.marketing}
                  onCheckedChange={(checked) => setConsent((prev) => ({ ...prev, marketing: checked === true }))}
                  className="h-4 w-4"
                />
                <label htmlFor="marketing" className="cursor-pointer text-xs font-medium">
                  {t('cookieConsent.marketing', 'Marketing')}
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            onClick={handleDeclineAll}
            size="sm"
            className="min-h-[44px] flex-1 px-4 text-sm touch-manipulation md:flex-none"
            data-testid="cookie-decline"
          >
            {t('cookieConsent.decline', 'Decline')}
          </Button>
          {showDetails ? (
            <Button
              onClick={handleSavePreferences}
              size="sm"
              className="min-h-[44px] flex-1 px-4 text-sm touch-manipulation md:flex-none"
              data-testid="cookie-save"
            >
              {t('cookieConsent.save', 'Save')}
            </Button>
          ) : (
            <Button
              onClick={handleAcceptAll}
              data-testid="cookie-accept"
              size="sm"
              className="min-h-[44px] flex-1 px-4 text-sm touch-manipulation md:flex-none"
            >
              {t('cookieConsent.accept', 'Accept')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
