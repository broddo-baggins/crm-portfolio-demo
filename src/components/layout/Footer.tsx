import React from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLang } from '@/hooks/useLang';
import { siteSettings } from '@/lib/site-settings';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const Footer: React.FC = () => {
  const { t } = useTranslation('common');
  const { isRTL, flexRowReverse, textStart, textEnd } = useLang();
  const currentYear = new Date().getFullYear();
  const version = "1.0.5-EA"; // Security fixes, mock data enhancements, and API improvements

  return (
    <footer className={cn("bg-gray-100 dark:bg-slate-900 py-4 border-t border-gray-200 dark:border-slate-700", isRTL && "font-hebrew")} dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {/* Meta Attribution - Required for WhatsApp® Business API Compliance */}
        <div className={cn("flex items-center justify-center pb-3 mb-3 border-b border-gray-200 dark:border-slate-700")}>
          <div className={cn("flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400", flexRowReverse())}>
            <span>was powered by Meta</span>
            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">f</span>
            </div>
            <span>•</span>
            <span>WhatsApp® Business API</span>
          </div>
        </div>
        
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-2", isRTL && "sm:flex-row-reverse")}>
          <div className={cn("flex items-center gap-2", flexRowReverse())}>
            <p className={cn("text-gray-600 dark:text-slate-300 text-sm", textStart())}>
              © {currentYear} {siteSettings.company.name}. {t('footer.allRightsReserved', 'All rights reserved')}.
            </p>
            <Badge variant="secondary" className="text-xs">
              v{version}
            </Badge>
          </div>
          <div className={cn("flex items-center text-sm text-gray-600 dark:text-slate-300 gap-2", flexRowReverse())}>
            <a href={`mailto:${siteSettings.company.email.contact}`} className="hover:text-primary transition-colors">
              {t('footer.contactUs', 'Contact Us')}
            </a>
            <Separator orientation="vertical" className="h-4 bg-gray-400 dark:bg-slate-600" />
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">
              {t('footer.privacyPolicy', 'Privacy Policy')}
            </Link>
            <Separator orientation="vertical" className="h-4 bg-gray-400 dark:bg-slate-600" />
            <Link to="/terms" className="hover:text-primary transition-colors">
              {t('footer.termsConditions', 'Terms & Conditions')}
            </Link>
            <Separator orientation="vertical" className="h-4 bg-gray-400 dark:bg-slate-600" />
            <Link to="/cookies" className="hover:text-primary transition-colors">
              {t('footer.cookiePolicy', 'Cookie Policy')}
            </Link>
            <Separator orientation="vertical" className="h-4 bg-gray-400 dark:bg-slate-600" />
            <Link to="/accessibility" className="hover:text-primary transition-colors">
              {t('footer.accessibility', 'Accessibility')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
