import React, { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useMobileInfo } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  ArrowLeft,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Home,
  MessageSquare,
  Calendar,
  BarChart3,
  Users,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Building2,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProject } from "@/context/ProjectContext";
import { useTheme } from "@/components/theme-provider";
import { useAdminAccess } from '@/hooks/useAdminAccess';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  backText?: string;
  rightActions?: React.ReactNode;
  showUserMenu?: boolean;
  showNotifications?: boolean;
  showSearch?: boolean;
  onSearch?: () => void;
  className?: string;
  transparent?: boolean;
  variant?: "default" | "minimal" | "branded";
}

const getNavigationItems = (t: any, adminAccess?: { isSystemAdmin: boolean; isCompanyAdmin: boolean }) => [
  { icon: Home, label: t("common:navigation.dashboard", "Dashboard"), path: "/dashboard" },
  { icon: MessageSquare, label: t("common:navigation.messages", "Messages"), path: "/messages", badge: 3 },
  { icon: Users, label: t("common:navigation.leads", "Leads"), path: "/leads" },
  { icon: Calendar, label: t("common:navigation.calendar", "Calendar"), path: "/calendar" },
  { icon: BarChart3, label: t("common:navigation.reports", "Reports"), path: "/reports" },
  { icon: Settings, label: t("common:navigation.settings", "Settings"), path: "/settings" },
  // Admin center (unified for all admin types)
  ...(adminAccess?.isSystemAdmin || adminAccess?.isCompanyAdmin ? [
    { icon: Shield, label: t("common:navigation.adminCenter", "Admin Center"), path: "/admin" },
  ] : []),
];

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  backText = "Back",
  rightActions,
  showUserMenu = true,
  showNotifications = true,
  showSearch = false,
  onSearch,
  className,
  transparent = false,
  variant = "default",
}) => {
  const { t } = useTranslation(["common", "pages"]);
  const { isMobile, hasNotch, touchSupported } = useMobileInfo();
  const { user, signOut } = useAuth();
  const { currentProject } = useProject();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSystemAdmin, isCompanyAdmin } = useAdminAccess();

  // Don't render if not mobile
  if (!isMobile) return null;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  const handleLogout = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40",
        hasNotch && "pt-safe-area-top",
        transparent
          ? "bg-transparent"
          : "bg-white/95 backdrop-blur-lg border-b border-gray-200 dark:bg-slate-900/95 dark:border-slate-700",
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left Section */}
        <div className="flex items-center gap-3 flex-1">
          {showBack ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className={cn(
                "h-9 w-9",
                touchSupported && "touch-manipulation"
              )}
              aria-label={backText}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9",
                    touchSupported && "touch-manipulation"
                  )}
                  aria-label={t("common:navigation.menu", "Menu")}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <SheetHeader className="p-6 border-b border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                                             <Avatar className="h-12 w-12">
                         <AvatarImage src={user?.user_metadata?.avatar_url} />
                         <AvatarFallback className="bg-primary text-primary-foreground">
                           {user?.user_metadata?.full_name ? getInitials(user.user_metadata.full_name) : "U"}
                         </AvatarFallback>
                       </Avatar>
                       <div className="flex-1 min-w-0">
                         <SheetTitle className="text-base font-semibold truncate">
                           {user?.user_metadata?.full_name || user?.email || "User"}
                         </SheetTitle>
                        {currentProject && (
                          <p className="text-sm text-gray-500 dark:text-slate-400 truncate">
                            {currentProject.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </SheetHeader>

                  {/* Navigation */}
                  <nav className="flex-1 py-4">
                    {getNavigationItems(t, { isSystemAdmin, isCompanyAdmin }).map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center justify-between px-6 py-3 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.badge && item.badge > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Footer Actions */}
                  <div className="border-t border-gray-200 dark:border-slate-700 p-4 space-y-2">
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                        {t("common:settings.theme", "Theme")}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant={theme === "light" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setTheme("light")}
                          className="h-8 w-8 p-0"
                        >
                          <Sun className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={theme === "dark" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setTheme("dark")}
                          className="h-8 w-8 p-0"
                        >
                          <Moon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={theme === "system" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setTheme("system")}
                          className="h-8 w-8 p-0"
                        >
                          <Monitor className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Logout */}
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("common:auth.logout", "Logout")}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}

          {/* Title */}
          {title && (
            <h1 className="font-semibold text-lg text-gray-900 dark:text-slate-100 truncate">
              {title}
            </h1>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Search */}
          {showSearch && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSearch}
              className={cn(
                "h-9 w-9",
                touchSupported && "touch-manipulation"
              )}
              aria-label={t("common:actions.search", "Search")}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          {/* Notifications */}
          {showNotifications && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 relative",
                touchSupported && "touch-manipulation"
              )}
              asChild
            >
              {/* Was a button with no handler; it now opens the notifications page */}
              <Link to="/notifications" aria-label={`${t("common:notifications.title", "Notifications")}, 5 unread`}>
                <Bell className="h-5 w-5" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 text-[10px] p-0 flex items-center justify-center"
                >
                  5
                </Badge>
              </Link>
            </Button>
          )}

          {/* User Menu */}
          {showUserMenu && !showBack && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-9 w-9 rounded-full p-0",
                    touchSupported && "touch-manipulation"
                  )}
                                 >
                   <Avatar className="h-8 w-8">
                     <AvatarImage src={user?.user_metadata?.avatar_url} />
                     <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                       {user?.user_metadata?.full_name ? getInitials(user.user_metadata.full_name) : "U"}
                     </AvatarFallback>
                   </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    {t("common:navigation.profile", "Profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    {t("common:navigation.settings", "Settings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("common:auth.logout", "Logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Custom Right Actions */}
          {rightActions}
        </div>
      </div>
    </header>
  );
};

// Minimal header variant
export const MobileHeaderMinimal: React.FC<
  Omit<MobileHeaderProps, "variant">
> = (props) => {
  return <MobileHeader {...props} variant="minimal" />;
};

// Branded header variant
export const MobileHeaderBranded: React.FC<
  Omit<MobileHeaderProps, "variant">
> = (props) => {
  return <MobileHeader {...props} variant="branded" />;
};

export default MobileHeader; 