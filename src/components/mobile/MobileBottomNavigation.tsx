import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { useMobileInfo } from "@/hooks/use-mobile";
import { useMobileTouch } from "@/hooks/useMobileTouch";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  BarChart3,
  MessageSquare,
  Calendar,
  Settings,
  Users,
  TrendingUp,
  Bell,
} from "lucide-react";

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  activeColor?: string;
}

interface MobileBottomNavigationProps {
  className?: string;
  variant?: "default" | "compact";
}

const navigationItems: NavItem[] = [
  {
    path: "/dashboard",
    icon: Home,
    label: "dashboard.title",
    activeColor: "text-blue-600",
  },
  {
    path: "/messages",
    icon: MessageSquare,
    label: "messages.title",
    badge: 3,
    activeColor: "text-green-600",
  },
  {
    path: "/leads",
    icon: TrendingUp,
    label: "leads.title",
    activeColor: "text-purple-600",
  },
  {
    path: "/calendar",
    icon: Calendar,
    label: "calendar.title",
    activeColor: "text-orange-600",
  },
  {
    path: "/reports",
    icon: BarChart3,
    label: "reports.title",
    activeColor: "text-indigo-600",
  },
];

export const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  className,
  variant = "default",
}) => {
  const { t } = useTranslation(["pages", "common"]);
  const location = useLocation();
  const { isMobile, hasNotch, touchSupported } = useMobileInfo();
  const touchHandlers = useMobileTouch();
  const navigationRef = useRef<HTMLElement>(null);

  // Enhanced haptic feedback for navigation
  const triggerHapticFeedback = () => {
    if (navigator.vibrate && touchSupported) {
      navigator.vibrate(50); // Light haptic feedback
    }
  };
  
  // Setup touch handlers for enhanced navigation
  useEffect(() => {
    touchHandlers.onTap(() => {
      triggerHapticFeedback();
    });
  }, [touchHandlers]);

  // Don't render on desktop
  if (!isMobile) return null;

  const isCompact = variant === "compact";

  return (
    <nav
      ref={navigationRef}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-white/95 backdrop-blur-lg border-t border-gray-200",
        "dark:bg-black/95 dark:border-slate-700",
        hasNotch && "pb-safe-area-bottom",
        className
      )}
      role="navigation"
      aria-label={t("common:navigation.mobile", "Mobile navigation")}
      onTouchStart={touchHandlers.onTouchStart}
      onTouchMove={touchHandlers.onTouchMove}
      onTouchEnd={touchHandlers.onTouchEnd}
    >
      <div className={cn(
        "flex items-center justify-around",
        isCompact ? "px-2 py-1" : "px-4 py-2",
        "max-w-screen-sm mx-auto"
      )}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const label = t(`pages:${item.label}`, item.label);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={triggerHapticFeedback}
              className={cn(
                "flex flex-col items-center justify-center gap-1",
                "transition-all duration-200 ease-out",
                "relative group select-none",
                touchSupported && "touch-manipulation",
                isCompact ? "p-2 min-w-[60px]" : "p-3 min-w-[70px]",
                "rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50",
                "active:scale-95 active:bg-gray-200 dark:active:bg-slate-600",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                isActive && "bg-gray-100 dark:bg-slate-700/30"
              )}
              role="menuitem"
              aria-current={isActive ? "page" : undefined}
              aria-label={label}
            >
              {/* Icon Container with enhanced dark mode */}
              <div className="relative flex items-center justify-center">
                <Icon
                  className={cn(
                    "transition-all duration-200",
                    isCompact ? "h-5 w-5" : "h-6 w-6",
                    isActive
                      ? item.activeColor || "text-primary"
                      : "text-gray-500 dark:text-slate-300",
                    "group-hover:scale-110"
                  )}
                />
                
                {/* Badge with dark mode support */}
                {item.badge && item.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className={cn(
                      "absolute -top-1 -right-1",
                      "min-w-[18px] h-[18px] text-[10px] font-semibold",
                      "flex items-center justify-center",
                      "animate-pulse",
                      "bg-red-500 text-white dark:bg-red-500 dark:text-white"
                    )}
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </Badge>
                )}

                {/* Active indicator with dark mode */}
                {isActive && (
                  <div
                    className={cn(
                      "absolute -bottom-1 w-1 h-1 rounded-full",
                      item.activeColor?.replace("text-", "bg-") || "bg-primary",
                      "animate-pulse"
                    )}
                  />
                )}
              </div>

              {/* Label with enhanced dark mode */}
              <span
                className={cn(
                  "text-[10px] font-medium text-center leading-tight",
                  "max-w-[60px] truncate",
                  "transition-colors duration-200",
                  isActive
                    ? item.activeColor || "text-primary"
                    : "text-gray-500 dark:text-slate-300"
                )}
              >
                {label}
              </span>

              {/* Enhanced ripple effect with dark mode */}
              {touchSupported && (
                <div
                  className={cn(
                    "absolute inset-0 rounded-lg",
                    "bg-gradient-to-r from-transparent via-gray-200/20 to-transparent",
                    "dark:via-gray-600/20",
                    "opacity-0 group-active:opacity-100",
                    "transition-opacity duration-150",
                    "pointer-events-none"
                  )}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Safe area with proper dark mode background */}
      {hasNotch && (
        <div className={cn(
          "h-safe-area-bottom",
          "bg-white/95 dark:bg-black/95"
        )} />
      )}
    </nav>
  );
};

// Compact variant for specific use cases
export const MobileBottomNavigationCompact: React.FC<
  Omit<MobileBottomNavigationProps, "variant">
> = (props) => {
  return <MobileBottomNavigation {...props} variant="compact" />;
};

// Enhanced navigation with more features
interface EnhancedMobileBottomNavigationProps extends MobileBottomNavigationProps {
  showLabels?: boolean;
  showBadges?: boolean;
  customItems?: NavItem[];
  onItemPress?: (item: NavItem) => void;
}

export const EnhancedMobileBottomNavigation: React.FC<
  EnhancedMobileBottomNavigationProps
> = ({
  showLabels = true,
  showBadges = true,
  customItems,
  onItemPress,
  ...props
}) => {
  const items = customItems || navigationItems;
  const location = useLocation();

  const handleItemClick = (item: NavItem, event: React.MouseEvent) => {
    if (onItemPress) {
      event.preventDefault();
      onItemPress(item);
    }
  };

  // Custom implementation here for enhanced features
  return <MobileBottomNavigation {...props} />;
};

export default MobileBottomNavigation; 