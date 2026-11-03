import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  ArrowLeft,
  Mail,
  Globe,
  Calendar,
  Phone
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLang } from '@/hooks/useLang';
import { cn } from '@/lib/utils';
import { Link } from 'react-router';
import { BrandLockup } from '@/components/brand/BrandMark';

interface MaintenancePageProps {
  maintenanceEnd?: Date;
  progress?: number;
  status?: 'scheduled' | 'ongoing' | 'completed' | 'extended';
  updates?: string[];
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({
  maintenanceEnd,
  progress = 65,
  status = 'ongoing',
  updates = []
}) => {
  const { t } = useTranslation(['pages', 'common']);
  const { isRTL } = useLang();
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });

  // Use a stable default date to prevent infinite re-renders
  const stableMaintenanceEnd = React.useMemo(() => 
    maintenanceEnd || new Date(Date.now() + 2 * 60 * 60 * 1000), 
    [maintenanceEnd]
  );

  // Countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const endTime = stableMaintenanceEnd.getTime();
      const difference = endTime - now;

      if (difference > 0) {
        setTimeRemaining({
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [stableMaintenanceEnd]);

  const getStatusInfo = () => {
    switch (status) {
      case 'scheduled':
        return {
          color: 'bg-blue-500',
          icon: Calendar,
          message: t('pages:maintenance.status.scheduled', 'Scheduled Maintenance'),
          description: t('pages:maintenance.status.scheduledDesc', 'Maintenance is scheduled to begin soon')
        };
      case 'ongoing':
        return {
          color: 'bg-orange-500',
          icon: RefreshCw,
          message: t('pages:maintenance.status.ongoing', 'Maintenance in Progress'),
          description: t('pages:maintenance.status.ongoingDesc', 'We are currently performing system updates')
        };
      case 'extended':
        return {
          color: 'bg-red-500',
          icon: Clock,
          message: t('pages:maintenance.status.extended', 'Extended Maintenance'),
          description: t('pages:maintenance.status.extendedDesc', 'Maintenance is taking longer than expected')
        };
      case 'completed':
        return {
          color: 'bg-green-500',
          icon: CheckCircle,
          message: t('pages:maintenance.status.completed', 'Maintenance Completed'),
          description: t('pages:maintenance.status.completedDesc', 'All systems are back online')
        };
      default:
        return {
          color: 'bg-gray-500',
          icon: Wrench,
          message: t('pages:maintenance.status.unknown', 'System Maintenance'),
          description: t('pages:maintenance.status.unknownDesc', 'Please check back later')
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className={cn("min-h-screen bg-background", isRTL && "rtl")} dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="mx-auto flex h-[60px] max-w-4xl items-center px-4 sm:px-8">
        <Link to="/" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <BrandLockup />
        </Link>
      </header>
      <div className="container mx-auto px-4 py-10 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="mb-10">
            <span className="mb-5 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface">
              <StatusIcon className="h-5 w-5 text-foreground" aria-hidden="true" />
            </span>

            <h1 className="mb-3 text-[32px] font-semibold leading-[38px] tracking-[-0.025em] md:text-[40px] md:leading-[46px]">
              {t('pages:maintenance.title', 'System Maintenance')}
            </h1>

            <p className="mb-5 text-lg text-subtle">
              {t('pages:maintenance.subtitle', 'We are improving our services for you')}
            </p>

            <Badge variant="secondary">
              {statusInfo.message}
            </Badge>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Status Card */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {t('pages:maintenance.estimated.title', 'Estimated Completion')}
                  </CardTitle>
                  <CardDescription>
                    {statusInfo.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Countdown Timer */}
                  <div className="text-center">
                    <div className="flex justify-center gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          {timeRemaining.hours.toString().padStart(2, '0')}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">
                          {t('pages:maintenance.timer.hours', 'Hours')}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          {timeRemaining.minutes.toString().padStart(2, '0')}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">
                          {t('pages:maintenance.timer.minutes', 'Minutes')}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          {timeRemaining.seconds.toString().padStart(2, '0')}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">
                          {t('pages:maintenance.timer.seconds', 'Seconds')}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('pages:maintenance.timer.expected', 'Expected completion: {{time}}', {
                        time: stableMaintenanceEnd.toLocaleString()
                      })}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        {t('pages:maintenance.progress.label', 'Progress')}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {progress}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Information Card */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {t('pages:maintenance.info.title', 'What We\'re Doing')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {t('pages:maintenance.info.description', 'We are performing scheduled maintenance to improve system performance, security, and add new features.')}
                  </p>
                  
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">
                        {t('pages:maintenance.tasks.database', 'Database optimization')}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">
                        {t('pages:maintenance.tasks.security', 'Security updates')}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-orange-500 animate-spin" />
                      <span className="text-sm">
                        {t('pages:maintenance.tasks.features', 'New feature deployment')}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">
                        {t('pages:maintenance.tasks.testing', 'System testing')}
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Updates Section */}
          {updates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t('pages:maintenance.updates.title', 'Live Updates')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {updates.map((update, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{update}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mt-12 text-center"
          >
            <Card className="bg-sunken">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {t('pages:maintenance.contact.title', 'Need Immediate Assistance?')}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t('pages:maintenance.contact.description', 'For urgent matters, please contact our support team')}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline" asChild>
                    <a href="mailto:amit@amityogev.com?subject=CRM Demo Inquiry">
                      <Mail className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {t('pages:maintenance.contact.email', 'Contact Developer')}
                    </a>
                  </Button>
                  
                  <Button variant="outline" asChild>
                    <a href="/">
                      <ArrowLeft className={cn("h-4 w-4", isRTL ? "ml-2 rotate-180" : "mr-2")} />
                      {t('pages:maintenance.contact.home', 'Back to Home')}
                    </a>
                  </Button>
                </div>

                <div className="mt-6 text-sm text-muted-foreground">
                  <p>
                    {t('pages:maintenance.footer.apology', 'We apologize for any inconvenience and appreciate your patience.')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default MaintenancePage; 