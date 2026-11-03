import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import LoginForm from '@/features/auth/components/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { toast } from 'sonner';
import { REGISTRATION_ENABLED } from '@/lib/config';
import { AUTH_MESSAGES } from '@/constants/messages';
import { Building2, MessageSquare, FileText, Lock, ArrowLeft } from 'lucide-react';
import { useLang } from '@/hooks/useLang';
import { InteractiveGridPattern } from '@/components/ui/interactive-grid-pattern';
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
      icon: <MessageSquare className="h-8 w-8 text-primary-600" />,
      title: isRTL ? 'חימום לידים קרים בוואטסאפ' : 'Heat Cold Leads via WhatsApp',
      description: isRTL ? 'אוטומציה מתקדמת של פניות בוואטסאפ עם בינה מלאכותית שמחממת לידים קרים' : 'Advanced WhatsApp automation with AI that systematically warms cold leads into hot prospects'
    },
    {
      icon: <FileText className="h-8 w-8 text-primary-600" />,
      title: isRTL ? 'CRM חכם לניהול לידים' : 'Smart CRM for Lead Management',
      description: isRTL ? 'מערכת CRM מתקדמת עם ציון BANT/HEAT ומעקב חימום לידים בזמן אמת' : 'Advanced CRM system with BANT/HEAT scoring and real-time lead warming tracking'
    },
    {
      icon: <Lock className="h-8 w-8 text-primary-600" />,
      title: isRTL ? 'אוטומציה 24/7 מאובטחת' : 'Secure 24/7 Automation',
      description: isRTL ? 'מערכת אוטומציה שפועלת מסביב לשעון עם אבטחה ברמה בנקאית' : 'Round-the-clock automation system with bank-grade security and compliance'
    }
  ];

  return (
    <div 
      className="min-h-screen flex"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Left Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white relative">
        {/* Back to Home Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToHome}
          className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors`}
        >
          <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
          <span className="text-sm font-medium">
            {isRTL ? 'חזרה לבית' : 'Back to Home'}
          </span>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`w-full max-w-md space-y-6 ${isRTL ? 'pr-4' : 'pl-4'}`}
        >
          <div className={`text-center space-y-3 ${isRTL ? 'text-right' : 'text-left'}`}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center shadow-xl border-4 border-white/20"
            >
              <Building2 className="h-12 w-12 text-primary-100 drop-shadow-lg" />
            </motion.div>
            <h1 className="text-3xl font-geist-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent text-center">
              {isRTL ? 'ברוכים הבאים' : 'Welcome Back'}
            </h1>
            <p className="font-geist text-gray-600 text-base leading-relaxed text-center">
              {isRTL 
                ? 'הפלטפורמה החכמה שמחממת לידים קרים ומגדילה המרות עם WhatsApp AI מתקדם' 
                : 'The smart platform that heats cold leads and boosts conversions with advanced WhatsApp AI'
              }
            </p>
          </div>

          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className={`pb-4 ${isRTL ? 'pr-6 pl-6' : 'px-6'}`}>
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
                  <TabsTrigger 
                    value="signin" 
                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 font-medium"
                  >
                    {isRTL ? 'התחברות' : 'Sign In'}
                  </TabsTrigger>
                  {REGISTRATION_ENABLED && (
                    <TabsTrigger 
                      value="signup" 
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 font-medium"
                    >
                      {isRTL ? 'הרשמה' : 'Sign Up'}
                    </TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="signin" className="mt-4 space-y-3">
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <CardTitle className={`text-xl font-geist-semibold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? 'התחבר' : 'Sign In'}
                    </CardTitle>
                    <CardDescription className={`text-gray-600 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL 
                        ? 'הזן את פרטי ההתחברות שלך כדי לגשת למערכת' 
                        : 'Enter your credentials to access your account'
                      }
                    </CardDescription>
                  </div>
                  <LoginForm />
                </TabsContent>
                
                {REGISTRATION_ENABLED && (
                  <TabsContent value="signup" className="mt-4 space-y-3">
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <CardTitle className={`text-xl font-geist-semibold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'צור חשבון חדש' : 'Create your account'}
                      </CardTitle>
                      <CardDescription className={`text-gray-600 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
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
            </CardHeader>
          </Card>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center text-xs text-gray-500"
          >
            <p>
              {isRTL 
                ? '🔒 החשבון שלך מוגן בהצפנה ברמה בנקאית' 
                : '🔒 Your account is protected with bank-level encryption'
              }
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Features Showcase */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 relative overflow-hidden">
        <InteractiveGridPattern 
          width={30}
          height={30}
          numSquares={40}
          maxOpacity={0.3}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-primary-800/20"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-primary-400/20 to-primary-600/20 rounded-full blur-2xl"
          />
          <motion.div
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0]
            }}
            transition={{ 
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-r from-primary-300/20 to-primary-500/20 rounded-full blur-2xl"
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center p-12 space-y-12">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}
          >
            <h2 className="text-4xl font-geist-bold text-gray-900 leading-tight">
              {isRTL 
                ? 'חמם את הלידים הקרים שלך' 
                : 'Heat Your Cold Leads Intelligently'
              }
            </h2>
            <p className="text-xl font-geist text-gray-700 leading-relaxed">
              {isRTL 
                ? 'פלטפורמת CRM מתקדמת עם אוטומציית WhatsApp וציון BANT/HEAT לחימום לידים יעיל' 
                : 'Advanced CRM platform with WhatsApp automation and BANT/HEAT scoring for efficient lead warming'
              }
            </p>
          </motion.div>

          <div className="space-y-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.2, duration: 0.6 }}
                className={`flex gap-4 items-start ${isRTL ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
              >
                <div className={`space-y-2 flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <h3 className="text-lg font-geist-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="font-geist text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center">
                    {feature.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 