import React, { createContext, useContext, ReactNode } from 'react';

// CRITICAL: React Context Guard
if (typeof createContext === 'undefined') {
  throw new Error('[RTL Provider] React createContext is not available. This indicates a module loading issue.');
}

import { useLang } from '@/hooks/useLang';
import { cn } from '@/lib/utils';

interface RTLContextValue {
  isRTL: boolean;
  dir: 'ltr' | 'rtl';
  textAlign: 'left' | 'right';
  flexDirection: 'row' | 'row-reverse';
  marginStart: (value: string) => string;
  marginEnd: (value: string) => string;
  paddingStart: (value: string) => string;
  paddingEnd: (value: string) => string;
  borderStart: (value?: string) => string;
  borderEnd: (value?: string) => string;
}

const RTLContext = createContext<RTLContextValue | null>(null);

interface RTLProviderProps {
  children: ReactNode;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

export const RTLProvider: React.FC<RTLProviderProps> = ({ 
  children, 
  className,
  as: Component = 'div'
}) => {
  const {
    isRTL,
    marginStart,
    marginEnd,
    paddingStart,
    paddingEnd,
    borderStart,
    borderEnd,
    textStart
  } = useLang();

  const contextValue: RTLContextValue = {
    isRTL,
    dir: isRTL ? 'rtl' : 'ltr',
    textAlign: isRTL ? 'right' : 'left',
    flexDirection: isRTL ? 'row-reverse' : 'row',
    marginStart,
    marginEnd,
    paddingStart,
    paddingEnd,
    borderStart,
    borderEnd,
  };

  return (
    <RTLContext.Provider value={contextValue}>
      <Component
        dir={isRTL ? 'rtl' : 'ltr'}
        className={cn(
          textStart(),
          isRTL && 'font-hebrew',
          className
        )}
      >
        {children}
      </Component>
    </RTLContext.Provider>
  );
};

export const useRTL = () => {
  const context = useContext(RTLContext);
  if (!context) {
    throw new Error('useRTL must be used within an RTLProvider');
  }
  return context;
};

// Utility components for common RTL patterns
export const RTLFlex: React.FC<{
  children: ReactNode;
  className?: string;
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  gap?: string;
}> = ({ children, className, justify = 'start', align = 'center', gap }) => {
  const { flexRowReverse } = useLang();
  
  return (
    <div className={cn(
      'flex',
      flexRowReverse(),
      `justify-${justify}`,
      `items-${align}`,
      gap && `gap-${gap}`,
      className
    )}>
      {children}
    </div>
  );
};

export const RTLText: React.FC<{
  children: ReactNode;
  className?: string;
  align?: 'start' | 'end' | 'center';
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}> = ({ children, className, align = 'start', as: Component = 'p' }) => {
  const { textStart, textEnd } = useLang();
  
  const getAlignment = () => {
    switch (align) {
      case 'start': return textStart();
      case 'end': return textEnd();
      case 'center': return 'text-center';
      default: return textStart();
    }
  };

  return (
    <Component className={cn(getAlignment(), className)}>
      {children}
    </Component>
  );
};

export const RTLIcon: React.FC<{
  children: ReactNode;
  className?: string;
  flip?: boolean;
  rotate?: boolean;
}> = ({ children, className, flip = false, rotate = false }) => {
  const { isRTL } = useLang();
  
  return (
    <span className={cn(
      flip && isRTL && 'rtl-flip',
      rotate && isRTL && 'rtl-rotate-180',
      className
    )}>
      {children}
    </span>
  );
};

// EnglishText component for forcing LTR direction for English text
interface EnglishTextProps {
  children: ReactNode;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  'data-testid'?: string;
}

export const EnglishText: React.FC<EnglishTextProps> = ({ 
  children, 
  className,
  as: Component = 'span',
  'data-testid': testId
}) => {
  return React.createElement(Component, {
    className: cn('ltr text-left', className),
    dir: 'ltr',
    style: { direction: 'ltr' },
    'data-testid': testId
  }, children);
}; 