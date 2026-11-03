import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export type SupportedLanguage = 'en' | 'he';

export const useLang = () => {
  const { i18n, t } = useTranslation();
  
  const isRTL = useMemo(() => i18n.language === 'he', [i18n.language]);
  const isLTR = useMemo(() => !isRTL, [isRTL]);
  
  // RTL-aware utility functions
  const rtlUtils = useMemo(() => ({
    // Direction utilities
    dir: isRTL ? 'rtl' : 'ltr',
    opposite: isRTL ? 'ltr' : 'rtl',
    
    // Flex direction utilities
    flexRow: isRTL ? 'flex-row-reverse' : 'flex-row',
    flexRowReverse: isRTL ? 'flex-row' : 'flex-row-reverse',
    
    // Text alignment utilities
    textLeft: isRTL ? 'text-right' : 'text-left',
    textRight: isRTL ? 'text-left' : 'text-right',
    textStart: isRTL ? 'text-right' : 'text-left',
    textEnd: isRTL ? 'text-left' : 'text-right',
    
    // Margin utilities (logical)
    marginStart: isRTL ? 'mr' : 'ml',
    marginEnd: isRTL ? 'ml' : 'mr',
    marginInlineStart: isRTL ? 'mr' : 'ml',
    marginInlineEnd: isRTL ? 'ml' : 'mr',
    
    // Padding utilities (logical)
    paddingStart: isRTL ? 'pr' : 'pl',
    paddingEnd: isRTL ? 'pl' : 'pr',
    paddingInlineStart: isRTL ? 'pr' : 'pl',
    paddingInlineEnd: isRTL ? 'pl' : 'pr',
    
    // Border utilities (logical)
    borderStart: isRTL ? 'border-r' : 'border-l',
    borderEnd: isRTL ? 'border-l' : 'border-r',
    borderInlineStart: isRTL ? 'border-r' : 'border-l',
    borderInlineEnd: isRTL ? 'border-l' : 'border-r',
    
    // Position utilities
    left: isRTL ? 'right' : 'left',
    right: isRTL ? 'left' : 'right',
    insetStart: isRTL ? 'right' : 'left',
    insetEnd: isRTL ? 'left' : 'right',
    
    // Transform utilities
    translateX: (value: number) => isRTL ? `translateX(${value}px)` : `translateX(${value}px)`,
    
    // Popover/Dropdown alignment
    popoverAlign: isRTL ? 'start' : 'end',
    popoverAlignReverse: isRTL ? 'end' : 'start',
    
    // Helper for conditional RTL classes
    rtlClass: (rtlClass: string, ltrClass?: string) => isRTL ? rtlClass : (ltrClass || ''),
    
    // Helper for conditional styling
    rtlStyle: (rtlStyles: Record<string, any>, ltrStyles?: Record<string, any>) => 
      isRTL ? rtlStyles : (ltrStyles || {}),
    
    // Progress bar direction fix
    progressTransform: (value: number) => 
      isRTL ? `translateX(${100 - value}%)` : `translateX(-${100 - value}%)`,
      
    // Chart wrapper direction (keep charts LTR)
    chartDirection: 'ltr',
    
    // Notification position offset for topbar
    notificationOffset: (sidebarState: string) => {
      if (isRTL) {
        return sidebarState === "collapsed" ? -200 : -220;
      } else {
        return sidebarState === "collapsed" ? -130 : -150;
      }
    }
  }), [isRTL]);

  const setLang = async (lng: SupportedLanguage) => {
    try {
      console.log(`WEB Changing language from ${i18n.language} to ${lng}`);
      
      // Change language immediately for UI - this triggers re-renders
      await i18n.changeLanguage(lng);
      
      // Force immediate re-render by updating React state
      // The useTranslation hook will automatically trigger re-renders
      
      // Store in localStorage for persistence
      localStorage.setItem('i18nextLng', lng);
      
      // Update document direction
      document.documentElement.dir = lng === 'he' ? 'rtl' : 'ltr';
      document.documentElement.lang = lng;
      
      // Apply Hebrew font class to body
      if (lng === 'he') {
        document.body.classList.add('font-hebrew');
      } else {
        document.body.classList.remove('font-hebrew');
      }
      
      // Force layout recalculation for better RTL transition
      if (lng === 'he') {
        const sidebarElements = document.querySelectorAll('[data-sidebar]');
        sidebarElements.forEach(element => {
          // Trigger a reflow to recalculate positioning
          (element as HTMLElement).style.transform = 'translateZ(0)';
          requestAnimationFrame(() => {
            (element as HTMLElement).style.transform = '';
          });
        });
      }
      
      // Force a global re-render by dispatching a custom event
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lng } }));
      
      
      toast.success(lng === 'he' ? 'שפה שונתה לעברית' : 'Language changed to English');
    } catch (error) {
      console.error('Failed to change language:', error);
      
      // Don't show error for authentication issues during language switch
      // The language change itself succeeded, just the profile save failed
      if (error.message?.includes('authenticated') || error.message?.includes('profile')) {
        console.warn('Language changed successfully, but profile update failed (non-critical):', error);
        toast.success(lng === 'he' ? 'שפה שונתה לעברית' : 'Language changed to English');
      } else {
        toast.error('Failed to change language');
      }
    }
  };

  // Legacy API compatibility - keep old function-based utilities
  const marginStart = (value: string) => isRTL ? `mr-${value}` : `ml-${value}`;
  const marginEnd = (value: string) => isRTL ? `ml-${value}` : `mr-${value}`;
  const paddingStart = (value: string) => isRTL ? `pr-${value}` : `pl-${value}`;
  const paddingEnd = (value: string) => isRTL ? `pl-${value}` : `pr-${value}`;
  
  // Border utilities
  const borderStart = (value: string = '1') => isRTL ? `border-r-${value}` : `border-l-${value}`;
  const borderEnd = (value: string = '1') => isRTL ? `border-l-${value}` : `border-r-${value}`;
  
  // Text alignment utilities
  const textStart = () => isRTL ? 'text-right' : 'text-left';
  const textEnd = () => isRTL ? 'text-left' : 'text-right';
  
  // Flex utilities. Containers carry dir="rtl" in Hebrew, which already mirrors a plain
  // flex row, so the "RTL-aware" row is flex-row in both directions (it used to return
  // flex-row-reverse in English, which mirrored every English layout that called it).
  const flexRowReverse = () => 'flex-row';
  
  // Position utilities
  const left = () => isRTL ? 'right' : 'left';
  const right = () => isRTL ? 'left' : 'right';
  
  // Icon utilities
  const flipIcon = (component: React.ReactNode) => isRTL ? component : component;
  const rotateIcon = (degrees: number) => {
    const rotationValue = isRTL ? -degrees : degrees;
    // Return a style object instead of a class to avoid CSS minifier issues
    return {
      transform: `rotate(${rotationValue}deg)`
    };
  };
  
  // Conditional utilities
  const rtlClass = (rtlClass: string, ltrClass?: string) => isRTL ? rtlClass : (ltrClass || '');
  
  // Conditional value utility
  const rtlValue = <T>(ltrValue: T, rtlValue: T): T => isRTL ? rtlValue : ltrValue;
  
  // Float utilities
  const floatStart = () => isRTL ? 'float-right' : 'float-left';
  const floatEnd = () => isRTL ? 'float-left' : 'float-right';

  return {
    // New enhanced API
    language: i18n.language,
    changeLanguage: i18n.changeLanguage,
    t,
    isRTL,
    isLTR,
    rtl: rtlUtils,
    dir: isRTL ? 'rtl' : 'ltr',
    setLang,
    
    // Legacy API compatibility
    lang: i18n.language as SupportedLanguage,
    marginStart,
    marginEnd,
    paddingStart,
    paddingEnd,
    borderStart,
    borderEnd,
    textStart,
    textEnd,
    flexRowReverse,
    left,
    right,
    floatStart,
    floatEnd,
    flipIcon,
    rotateIcon,
    rtlClass,
    rtlValue
  };
}; 