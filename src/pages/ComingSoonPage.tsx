import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Star, 
  Bell, 
  CheckCircle, 
  ArrowRight,
  Mail,
  Calendar,
  Zap,
  Sparkles,
  Gauge,
  Brain,
  Shield,
  Globe,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLang } from '@/hooks/useLang';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { BrandLockup } from '@/components/brand/BrandMark';

interface ComingSoonPageProps {
  featureName?: string;
  releaseDate?: Date;
  completionPercentage?: number;
  previewFeatures?: Array<{
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    status: 'planned' | 'in-development' | 'testing' | 'ready';
  }>;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  featureName = 'Advanced AI Analytics',
  releaseDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  completionPercentage = 75,
  previewFeatures = [
    {
      name: 'AI-Powered Lead Scoring',
      description: 'Machine learning algorithms to predict lead conversion probability',
      icon: Brain,
      status: 'testing'
    },
    {
      name: 'Advanced Analytics Dashboard',
      description: 'Deep insights and predictive analytics for business intelligence',
      icon: BarChart3,
      status: 'in-development'
    },
    {
      name: 'Multi-Channel Communication',
      description: 'SMS, Email, and Social Media integration alongside WhatsApp',
      icon: MessageSquare,
      status: 'planned'
    },
    {
      name: 'Enhanced Security Suite',
      description: 'Advanced encryption and compliance features',
      icon: Shield,
      status: 'ready'
    }
  ]
}) => {
  const { t } = useTranslation(['pages', 'common']);
  const { isRTL } = useLang();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Simulate email signup
    setIsSubscribed(true);
    toast({
      title: t('pages:comingSoon.notifications.subscribed', 'Successfully Subscribed!'),
      description: t('pages:comingSoon.notifications.subscribedDesc', 'We\'ll notify you when {{feature}} is available', { feature: featureName }),
    });
    setEmail('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge variant="default" className="bg-green-500">{t('pages:comingSoon.status.ready', 'Ready')}</Badge>;
      case 'testing':
        return <Badge variant="secondary">{t('pages:comingSoon.status.testing', 'Testing')}</Badge>;
      case 'in-development':
        return <Badge variant="outline">{t('pages:comingSoon.status.inDevelopment', 'In Development')}</Badge>;
      case 'planned':
        return <Badge variant="outline" className="border-muted-foreground/40">{t('pages:comingSoon.status.planned', 'Planned')}</Badge>;
      default:
        return null;
    }
  };

  const daysUntilRelease = Math.ceil((releaseDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className={cn("min-h-screen bg-background", isRTL && "rtl")} dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="mx-auto flex h-[60px] max-w-6xl items-center px-4 sm:px-8">
        <Link to="/" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <BrandLockup />
        </Link>
      </header>
      <div className="container mx-auto px-4 py-10 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="mb-12 md:mb-16">
            <div>
              <span className="mb-5 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface">
                <Rocket className="h-5 w-5 text-foreground" aria-hidden="true" />
              </span>
              <Badge variant="secondary" className="mb-4">
                {t('pages:comingSoon.badge', 'Coming Soon')}
              </Badge>

              <h1 className="mb-4 text-[36px] font-semibold leading-[42px] tracking-[-0.03em] text-foreground md:text-5xl md:leading-[56px]">
                {featureName}
              </h1>

              <p className="mb-8 max-w-[60ch] text-lg leading-8 text-subtle">
                {t('pages:comingSoon.subtitle', 'Revolutionary features are on the way to transform your lead management experience')}
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="font-medium tabular-nums">
                    {t('pages:comingSoon.release.in', 'In {{days}} days', { days: daysUntilRelease })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="font-medium tabular-nums">
                    {completionPercentage}% {t('pages:comingSoon.release.complete', 'Complete')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-16"
          >
            <Card>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">
                    {t('pages:comingSoon.progress.title', 'Development Progress')}
                  </h2>
                  <p className="text-muted-foreground">
                    {t('pages:comingSoon.progress.description', 'Track our journey as we build amazing features for you')}
                  </p>
                </div>
                
                <div className="max-w-2xl mx-auto">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium">
                      {t('pages:comingSoon.progress.overall', 'Overall Progress')}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {completionPercentage}%
                    </span>
                  </div>
                  <Progress value={completionPercentage} className="h-3 mb-6" />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-sm font-medium">{t('pages:comingSoon.stages.planning', 'Planning')}</p>
                      <p className="text-xs text-muted-foreground">{t('pages:comingSoon.stages.completed', 'Completed')}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-sm font-medium">{t('pages:comingSoon.stages.design', 'Design')}</p>
                      <p className="text-xs text-muted-foreground">{t('pages:comingSoon.stages.completed', 'Completed')}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Zap className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium">{t('pages:comingSoon.stages.development', 'Development')}</p>
                      <p className="text-xs text-muted-foreground">{t('pages:comingSoon.stages.inProgress', 'In Progress')}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Clock className="h-8 w-8 text-gray-600" />
                      </div>
                      <p className="text-sm font-medium">{t('pages:comingSoon.stages.testing', 'Testing')}</p>
                      <p className="text-xs text-muted-foreground">{t('pages:comingSoon.stages.upcoming', 'Upcoming')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {t('pages:comingSoon.features.title', 'What\'s Coming')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('pages:comingSoon.features.description', 'Get a preview of the exciting features we\'re building to enhance your experience')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
              {previewFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-lg">{feature.name}</CardTitle>
                          </div>
                          {getStatusBadge(feature.status)}
                        </div>
                        <CardDescription className="text-base leading-relaxed">
                          {feature.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Email Signup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mb-12"
          >
            <Card className="bg-sunken">
              <CardContent className="p-8 text-center">
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center justify-center mb-6">
                    <Bell className="h-8 w-8 text-primary" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4">
                    {t('pages:comingSoon.notify.title', 'Be the First to Know')}
                  </h3>
                  <p className="text-muted-foreground mb-8">
                    {t('pages:comingSoon.notify.description', 'Get notified when {{feature}} launches with exclusive early access', { feature: featureName })}
                  </p>

                  {!isSubscribed ? (
                    <form onSubmit={handleEmailSignup} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                      <Input
                        type="email"
                        name="notify-email"
                        placeholder={t('pages:comingSoon.notify.emailPlaceholder', 'Enter your email address')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="flex-1"
                        autoComplete="off"
                      />
                      <Button type="submit" className="whitespace-nowrap">
                        <Bell className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                        {t('pages:comingSoon.notify.subscribe', 'Notify Me')}
                      </Button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">
                        {t('pages:comingSoon.notify.success', 'You\'re subscribed! We\'ll be in touch soon.')}
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mt-4">
                    {t('pages:comingSoon.notify.privacy', 'We respect your privacy. Unsubscribe at any time.')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-center"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <a href="/">
                  <ArrowLeft className={cn("h-4 w-4", isRTL ? "ml-2 rotate-180" : "mr-2")} />
                  {t('pages:comingSoon.navigation.home', 'Back to Home')}
                </a>
              </Button>
              
              <Button variant="outline" asChild>
                <a href="/dashboard">
                  <BarChart3 className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  {t('pages:comingSoon.navigation.dashboard', 'Go to Dashboard')}
                </a>
              </Button>

              <Button variant="outline" asChild>
                <a href="mailto:amit@amityogev.com?subject=CRM Demo Inquiry">
                  <Mail className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  {t('pages:comingSoon.navigation.contact', 'Contact Developer')}
                </a>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoonPage; 