import React from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLang } from '@/hooks/useLang';
import { siteSettings } from '@/lib/site-settings';
import { cn } from '@/lib/utils';

const linkClass =
  "rounded-sm text-muted-foreground transition-colors duration-[120ms] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const Footer: React.FC = () => {
  const { t } = useTranslation('common');
  const { isRTL } = useLang();
  const currentYear = new Date().getFullYear();
  const version = "1.0.5-EA"; // Security fixes, mock data enhancements, and API improvements

  return (
    <footer
      className={cn("border-t border-border bg-surface px-4 py-4 pb-20 sm:px-6 lg:px-8 lg:pb-4", isRTL && "font-hebrew")}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex flex-col gap-3 text-[13px] leading-5 md:flex-row md:items-center md:justify-between">
        <p className="text-muted-foreground">
          © {currentYear} {siteSettings.company.name}. {t('footer.allRightsReserved', 'All rights reserved')}.
          <span className="ms-2 tabular-nums">v{version}</span>
          {/* Meta attribution, required for WhatsApp® Business API compliance */}
          <span className="ms-2">was powered by Meta · WhatsApp® Business API</span>
        </p>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <li>
            <a href={`mailto:${siteSettings.company.email.contact}`} className={linkClass}>
              {t('footer.contactUs', 'Contact Us')}
            </a>
          </li>
          <li>
            <Link to="/privacy-policy" className={linkClass}>
              {t('footer.privacyPolicy', 'Privacy Policy')}
            </Link>
          </li>
          <li>
            <Link to="/terms" className={linkClass}>
              {t('footer.termsConditions', 'Terms & Conditions')}
            </Link>
          </li>
          <li>
            <Link to="/cookies" className={linkClass}>
              {t('footer.cookiePolicy', 'Cookie Policy')}
            </Link>
          </li>
          <li>
            <Link to="/accessibility-declaration" className={linkClass}>
              {t('footer.accessibility', 'Accessibility')}
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
