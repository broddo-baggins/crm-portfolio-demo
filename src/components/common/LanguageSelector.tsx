import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLang } from '@/hooks/useLang';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { ChevronDown, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type SupportedLanguage = 'en' | 'he';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'button' | 'select';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'dropdown',
  size = 'md',
  showLabel = false
}) => {
  const { lang, setLang, isRTL, textStart, flexRowReverse } = useLang();
  const { t } = useTranslation('common');
  const [isChanging, setIsChanging] = useState(false);

  const languages = [
    { code: 'en' as SupportedLanguage, name: t('language.english', 'English'), nativeName: 'English' },
    { code: 'he' as SupportedLanguage, name: t('language.hebrew', 'Hebrew'), nativeName: 'עברית' }
  ];

  const currentLanguage = languages.find(l => l.code === lang);

  const handleLanguageChange = async (newLang: SupportedLanguage) => {
    if (newLang === lang || isChanging) return;
    
    setIsChanging(true);
    try {
      console.log(`WEB Language selector: Changing from ${lang} to ${newLang}`);
      await setLang(newLang);
      
    } catch (error) {
      console.error('ERROR Language selector: Failed to change language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  if (variant === 'select') {
    return (
      <div className={cn("flex items-center gap-2", flexRowReverse())} dir={isRTL ? "rtl" : "ltr"}>
        {showLabel && (
          <label className={cn("text-sm font-medium text-gray-700 dark:text-gray-300", textStart())}>
            {t('language.selector', 'Language')}
          </label>
        )}
        <select
          value={lang}
          onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
          disabled={isChanging}
          className={cn(
            "border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
            textStart(),
            isRTL && "font-hebrew",
            isChanging && "opacity-50 cursor-not-allowed"
          )}
          dir={isRTL ? "rtl" : "ltr"}
        >
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.nativeName}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")} dir={isRTL ? "rtl" : "ltr"}>
        {showLabel && (
          <label className={cn("text-sm font-medium text-gray-700 dark:text-gray-300 mr-2", textStart())}>
            {t('language.selector', 'Language')}
          </label>
        )}
        {languages.map((language) => (
          <Button
            key={language.code}
            variant={lang === language.code ? 'default' : 'outline'}
            size={size === 'md' ? 'default' : size as 'sm' | 'lg'}
            onClick={() => handleLanguageChange(language.code)}
            disabled={isChanging}
            className={cn(
              "min-w-[60px]",
              language.code === 'he' && "font-hebrew",
              textStart(),
              isChanging && "opacity-50 cursor-not-allowed"
            )}
            dir={language.code === 'he' ? "rtl" : "ltr"}
          >
            {isChanging && lang === language.code ? '...' : language.nativeName}
          </Button>
        ))}
      </div>
    );
  }

  // Default dropdown variant - Enhanced with proper dropdown menu
  return (
    <div className={cn("relative", isRTL && "font-hebrew")} dir={isRTL ? "rtl" : "ltr"}>
      {showLabel && (
        <label className={cn("block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", textStart())}>
          {t('language.selector', 'Language')}
        </label>
      )}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size={size === 'md' ? 'default' : size as 'sm' | 'lg'}
            disabled={isChanging}
            aria-label={t('language.selector', 'Language')}
            className={cn(
              "h-9 min-h-[36px] gap-1.5 px-2.5 text-subtle hover:text-foreground touch-manipulation",
              textStart(),
              isChanging && "opacity-50 cursor-not-allowed",
            )}
          >
            <Globe className="h-4 w-4" aria-hidden="true" />
            <span className={cn(
              currentLanguage?.code === 'he' && "font-hebrew",
              "text-[13px]"
            )}>
              {isChanging ? '...' : currentLanguage?.nativeName}
            </span>
            <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 opacity-70" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align={isRTL ? "end" : "start"} 
          side="bottom"
          sideOffset={4}
          className={cn(
            "min-w-[120px] sm:min-w-[140px] z-[100]",
            isRTL && "font-hebrew"
          )}
          // Prevent dropdown from being cut off on mobile
          alignOffset={-4}
        >
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              disabled={isChanging || lang === language.code}
              className={cn(
                "flex items-center gap-2 cursor-pointer touch-manipulation",
                language.code === 'he' && "font-hebrew",
                lang === language.code && "bg-accent text-accent-foreground",
                textStart(),
                isRTL && "flex-row-reverse",
                // Ensure adequate touch target on mobile
                "min-h-[44px] py-3"
              )}
            >
              <span className="text-sm sm:text-base">{language.nativeName}</span>
              {lang === language.code && (
                <span className={cn("ml-auto text-xs opacity-60", isRTL && "mr-auto ml-0")}>
                  {isRTL ? "נוכחי" : "Current"}
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}; 