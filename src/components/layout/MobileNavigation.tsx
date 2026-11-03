import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, X, Home, Users, FolderOpen, Calendar, MessageSquare, BarChart3, Settings, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '@/context/ClientAuthContext';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useMobileTouch } from '@/hooks/useMobileTouch';

interface MobileNavigationProps {
  className?: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  
  // Enhanced touch interactions for mobile navigation
  const touchHandlers = useMobileTouch();
  
  // Close menu with swipe left gesture
  touchHandlers.onSwipe((swipeInfo) => {
    if (swipeInfo.direction === 'left' && swipeInfo.distance > 100) {
      setIsOpen(false);
    }
  });

  const navigationItems = [
    {
      icon: Home,
      label: t('navigation.dashboard', 'Dashboard'),
      href: '/dashboard',
      badge: null
    },
    {
      icon: Users,
      label: t('navigation.leads', 'Leads'),
      href: '/leads',
      badge: '3'
    },
    {
      icon: FolderOpen,
      label: t('navigation.projects', 'Projects'),
      href: '/projects',
      badge: '4'
    },
    {
      icon: Calendar,
      label: t('navigation.calendar', 'Calendar'),
      href: '/calendar',
      badge: null
    },
    {
      icon: MessageSquare,
      label: t('navigation.messages', 'Messages'),
      href: '/messages',
      badge: '2'
    },
    {
      icon: BarChart3,
      label: t('navigation.reports', 'Reports'),
      href: '/reports',
      badge: null
    },
    {
      icon: Settings,
      label: t('navigation.settings', 'Settings'),
      href: '/settings',
      badge: null
    }
  ];

  const handleItemClick = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={cn("md:hidden", className)}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 touch-manipulation"
            aria-label={t('navigation.openMenu', 'Open navigation menu')}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className="w-80 p-0 flex flex-col"
          aria-label={t('navigation.mobileMenu', 'Mobile navigation menu')}
          onTouchStart={touchHandlers.onTouchStart}
          onTouchMove={touchHandlers.onTouchMove}
          onTouchEnd={touchHandlers.onTouchEnd}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">O</span>
              </div>
              <h2 className="text-lg font-semibold">CRM Demo</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
              aria-label={t('navigation.closeMenu', 'Close menu')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4" role="navigation">
            <ul className="space-y-2" role="list">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <li key={item.href} role="listitem">
                    <Link
                      to={item.href}
                      onClick={handleItemClick}
                      className={cn(
                        "flex items-center justify-between w-full p-3 rounded-lg text-left transition-colors touch-manipulation",
                        "min-h-[44px]", // Touch-friendly minimum height
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                      role="menuitem"
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.badge && (
                        <Badge 
                          variant={isActive ? "secondary" : "outline"}
                          className="ml-auto text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Section */}
          {user && (
            <div className="border-t p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start touch-manipulation min-h-[44px]"
                aria-label={t('auth.logout', 'Logout')}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('auth.logout', 'Logout')}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNavigation; 