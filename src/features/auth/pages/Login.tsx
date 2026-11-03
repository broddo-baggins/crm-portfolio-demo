import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { BrandLockup } from '@/components/brand/BrandMark';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import LoginForm from '@/features/auth/components/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { toast } from 'sonner';
import { REGISTRATION_ENABLED } from '@/lib/config';
import { AUTH_MESSAGES } from '@/constants/messages';
import { MessageSquare, FileText, Lock, ArrowLeft } from 'lucide-react';
import { useLang } from '@/hooks/useLang';
import { trackEvent, trackUserAction } from '@/utils/combined-analytics';

const Login = () => {
  const [activeTab, setActiveTab] = useState<string>('signin');
  const { isRTL } = useLang();
  const navigate = useNavigate();
  
  const handleRegistrationSuccess = () => {
    toast.success(AUTH_MESSAGES.REGISTER_SUCCESS);
    trackEvent('registration_success', 'auth', 'successful_signup');
    setActiveTab('signin');
  };

  const handleBackToHome = () => {
    trackUserAction('back_to_home_clicked', { location: 'login_page' });
    navigate('/');
  };

  const handleTabChange = (newTab: string) => {
    trackEvent('tab_switch', 'auth', newTab, 1, { 
      from_tab: activeTab, 
      to_tab: newTab 
    });
    setActiveTab(newTab);
  };

  const features = [
    {
      icon: <MessageSquare className="h-4 w-4" aria-hidden="true" />,
      title: isRTL ? 'חימום לידים קרים בוואטסאפ' : 'Heat Cold Leads via WhatsApp',
      description: isRTL ? 'אוטומציה מתקדמת של פניות בוואטסאפ עם בינה מלאכותית שמחממת לידים קרים' : 'Advanced WhatsApp automation with AI that systematically warms cold leads into hot prospects'
    },
    {
      icon: <FileText className="h-4 w-4" aria-hidden="true" />,
      title: isRTL ? 'CRM חכם לניהול לידים' : 'Smart CRM for Lead Management',
      description: isRTL ? 'מערכת CRM מתקדמת עם ציון BANT/HEAT ומעקב חימום לידים בזמן אמת' : 'Advanced CRM system with BANT/HEAT scoring and real-time lead warming tracking'
    },
    {
      icon: <Lock className="h-4 w-4" aria-hidden="true" />,
      title: isRTL ? 'אוטומציה 24/7 מאובטחת' : 'Secure 24/7 Automation',
      description: isRTL ? 'מערכת אוטומציה שפועלת מסביב לשעון עם אבטחה ברמה בנקאית' : 'Round-the-clock automation system with bank-grade security and compliance'
    }
  ];

  return (
    <div
      className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Auth form */}
      <div className="flex flex-col px-4 py-5 sm:px-10">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <BrandLockup />
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToHome}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            <span>{isRTL ? 'חזרה לבית' : 'Back to Home'}</span>
          </Button>
        </div>

        <main className="flex flex-1 items-center py-10">
          <div className="rise mx-auto w-full max-w-[400px]">
            <h1 className="text-[32px] font-semibold leading-[38px] tracking-[-0.025em] text-foreground">
              {isRTL ? 'ברוכים הבאים' : 'Welcome Back'}
            </h1>
            <p className="mt-2 text-[15px] leading-6 text-subtle">
              {isRTL
                ? 'הפלטפורמה החכמה שמחממת לידים קרים ומגדילה המרות עם WhatsApp AI מתקדם'
                : 'The smart platform that heats cold leads and boosts conversions with advanced WhatsApp AI'
              }
            </p>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-8 w-full">
              {REGISTRATION_ENABLED && (
                <TabsList className="mb-6 grid w-full grid-cols-2">
                  <TabsTrigger value="signin">{isRTL ? 'התחברות' : 'Sign In'}</TabsTrigger>
                  <TabsTrigger value="signup">{isRTL ? 'הרשמה' : 'Sign Up'}</TabsTrigger>
                </TabsList>
              )}

              <TabsContent value="signin" className="mt-0 space-y-4">
                <div>
                  <CardTitle className="text-lg">
                    {isRTL ? 'התחבר' : 'Sign In'}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {isRTL
                      ? 'הזן את פרטי ההתחברות שלך כדי לגשת למערכת'
                      : 'Enter your credentials to access your account'
                    }
                  </CardDescription>
                </div>
                <LoginForm />
              </TabsContent>

              {REGISTRATION_ENABLED && (
                <TabsContent value="signup" className="mt-0 space-y-4">
                  <div>
                    <CardTitle className="text-lg">
                      {isRTL ? 'צור חשבון חדש' : 'Create your account'}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {isRTL
                        ? 'הרשם היום והתחל לנהל את הנכסים שלך בצורה חכמה'
                        : 'Sign up today and start managing your properties intelligently'
                      }
                    </CardDescription>
                  </div>
                  <RegisterForm onCancel={() => setActiveTab('signin')} />
                </TabsContent>
              )}
            </Tabs>

            {/* Trust note */}
            <p className="mt-8 flex items-center gap-2 border-t border-border pt-5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {isRTL
                ? 'החשבון שלך מוגן בהצפנה ברמה בנקאית'
                : 'Your account is protected with bank-level encryption'
              }
            </p>
          </div>
        </main>
      </div>

      {/* Product panel */}
      <aside className="relative hidden overflow-hidden bg-ink-900 lg:flex lg:flex-col">
        <div className="px-12 pb-8 pt-16 xl:px-16">
          <h2 className="max-w-[18ch] text-[36px] font-semibold leading-[42px] tracking-[-0.025em] text-white">
            {isRTL
              ? 'חמם את הלידים הקרים שלך'
              : 'Heat Your Cold Leads Intelligently'
            }
          </h2>
          <p className="mt-4 max-w-[48ch] text-[17px] leading-7 text-ink-300">
            {isRTL
              ? 'פלטפורמת CRM מתקדמת עם אוטומציית WhatsApp וציון BANT/HEAT לחימום לידים יעיל'
              : 'Advanced CRM platform with WhatsApp automation and BANT/HEAT scoring for efficient lead warming'
            }
          </p>

          <ul className="mt-10 grid gap-6 xl:grid-cols-3 xl:gap-5">
            {features.map((feature, index) => (
              <li key={index}>
                <span className="flex h-8 w-8 items-center justify-center rounded-md border border-ink-700 text-ember-300">
                  {feature.icon}
                </span>
                <h3 className="mt-3 text-[15px] font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-ink-300">
                  {feature.description}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* The product itself, bleeding off the end edge */}
        <div className="relative mt-auto ps-12 xl:ps-16">
          <img
            src="/screens/leads.png"
            alt={isRTL ? 'טבלת הלידים של CRM Demo' : 'The CRM Demo leads table'}
            width={1440}
            height={900}
            className="block w-[920px] max-w-none rounded-ss-lg border-s border-t border-ink-700 shadow-float"
          />
        </div>
      </aside>
    </div>
  );
};

export default Login;
