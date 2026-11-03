import { Link } from 'react-router';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useLang } from '@/hooks/useLang';

interface MainNavProps {
  className?: string;
}

export const MainNav: React.FC<MainNavProps> = ({ className }) => {
  const { t } = useTranslation('common');
  const { isRTL } = useLang();

  return (
    <nav className={cn(
      'flex items-center space-x-4 lg:space-x-6', 
      isRTL && 'space-x-reverse',
      className
    )}>
      <Link
        to="/dashboard"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        {t('navigation.dashboard', 'Dashboard')}
      </Link>
      <Link
        to="/projects"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        {t('navigation.projects', 'Projects')}
      </Link>
      <Link
        to="/clients"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        {t('navigation.clients', 'Clients')}
      </Link>
    </nav>
  );
}; 