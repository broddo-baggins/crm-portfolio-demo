import {
  Activity,
  Bell,
  CalendarClock,
  FolderOpen,
  Menu,
  MessageSquare,
  Search,
  Sparkles,
  UserPlus,
  UserRound,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/ClientAuthContext";
import { Link } from "react-router";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { BasicProjectSelector } from "@/components/common/BasicProjectSelector";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import { DaisyUIThemeController } from "@/components/ui/daisyui-theme-controller";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { useState, useEffect } from "react";
import { useLang } from "@/hooks/useLang";
import { useTranslation } from 'react-i18next';
import logger from "@/services/base/logger";
import { simpleProjectService } from "@/services/simpleProjectService";
import { searchMockData, SearchResult as MockSearchResult } from "@/services/mockSearchService";
import { GeminiAgent } from "@/components/agent/GeminiAgent";
import { useAgentOnboarding } from "@/hooks/useAgentOnboarding";

interface TopBarProps {
  pendingUserCount?: number;
  /** Opens the navigation drawer (shown below 1024 px). */
  onOpenNav?: () => void;
}

interface SearchResult {
  type: string;
  name: string;
  id: string;
}

// IMPROVED: Dynamic notifications based on real data with i18n support
const generateDynamicNotifications = async (t: any, isRTL: boolean) => {
  const notifications = [];
  
  try {
    // Get recent data for notifications
    const [leads, conversations, messages] = await Promise.all([
      simpleProjectService.getAllLeads(),
      simpleProjectService.getAllConversations(),
      simpleProjectService.getWhatsAppMessages(50)
    ]);

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Recent leads (last 24 hours)
    const recentLeads = leads?.filter(lead => 
      new Date(lead.created_at) > oneDayAgo
    ) || [];

    // Recent messages (last hour)
    const recentMessages = messages?.filter(msg => 
      new Date(msg.wa_timestamp) > oneHourAgo
    ) || [];

    // Active conversations needing attention
    const activeConversations = conversations?.filter(conv => 
      conv.status === 'active' && new Date(conv.updated_at) < oneDayAgo
    ) || [];

    // Helper function to format relative time in Hebrew/English
    const formatRelativeTime = (date: Date) => {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 60) {
        return isRTL 
          ? `לפני ${diffInMinutes} דקות`
          : `${diffInMinutes} minutes ago`;
      } else if (diffInMinutes < 1440) { // Less than 24 hours
        const hours = Math.floor(diffInMinutes / 60);
        return isRTL 
          ? `לפני ${hours} שעות`
          : `${hours} hours ago`;
      } else {
        const days = Math.floor(diffInMinutes / 1440);
        return isRTL 
          ? `לפני ${days} ימים`
          : `${days} days ago`;
      }
    };

    // Generate notifications with proper i18n
    if (recentLeads.length > 0) {
      const leadNames = recentLeads.slice(0, 2).map(l => `${l.first_name || ''} ${l.last_name || ''}`.trim() || 'Unnamed Lead').join(', ');
      notifications.push({
        id: 'new-leads',
        title: isRTL 
          ? `${recentLeads.length} לידים חדשים`
          : `${recentLeads.length} new lead${recentLeads.length > 1 ? 's' : ''}`,
        message: isRTL
          ? `לידים חדשים נוספו: ${leadNames}${recentLeads.length > 2 ? '...' : ''}`
          : `New leads added: ${leadNames}${recentLeads.length > 2 ? '...' : ''}`,
        time: isRTL ? 'לאחרונה' : 'Recent',
        read: false,
        type: 'lead'
      });
    }

    if (recentMessages.length > 0) {
      notifications.push({
        id: 'new-messages',
        title: isRTL
          ? `${recentMessages.length} הודעות חדשות`
          : `${recentMessages.length} new message${recentMessages.length > 1 ? 's' : ''}`,
        message: isRTL
          ? 'הודעות וואטסאפ חדשות התקבלו'
          : 'Recent WhatsApp messages received',
        time: isRTL ? 'בשעה האחרונה' : 'Last hour',
        read: false,
        type: 'message'
      });
    }

    if (activeConversations.length > 0) {
      notifications.push({
        id: 'stale-conversations',
        title: isRTL
          ? `${activeConversations.length} שיחות דורשות תשומת לב`
          : `${activeConversations.length} conversation${activeConversations.length > 1 ? 's' : ''} need attention`,
        message: isRTL
          ? 'שיחות פעילות ללא פעילות אחרונה'
          : 'Active conversations with no recent activity',
        time: isRTL ? 'לפני יום' : '1 day ago',
        read: false,
        type: 'meeting'
      });
    }

    // System notifications
    notifications.push({
      id: 'system-status',
      title: isRTL ? 'סטטוס מערכת' : 'System status',
      message: isRTL
        ? `${leads?.length || 0} לידים בסך הכל, ${conversations?.length || 0} שיחות`
        : `${leads?.length || 0} total leads, ${conversations?.length || 0} conversations`,
      time: isRTL ? 'נוכחי' : 'Current',
      read: true,
      type: 'system'
    });

    return notifications;
  } catch (error) {
    console.error('Error generating notifications:', error);
    return [{
      id: 'error',
      title: isRTL ? 'מערכת התראות' : 'Notification system',
      message: isRTL 
        ? 'לא ניתן לטעון התראות בזמן אמת'
        : 'Unable to load real-time notifications',
      time: isRTL ? 'עכשיו' : 'Now',
      read: false,
      type: 'system'
    }];
  }
};

const TopBar = ({ pendingUserCount = 0, onOpenNav }: TopBarProps) => {
  const { user } = useAuth();
  const { isRTL } = useLang();
  const { t } = useTranslation('common');
  const isAdmin = user?.user_metadata?.role === 'ADMIN' || user?.user_metadata?.role === 'SUPER_ADMIN';
  const [notifications, setNotifications] = useState<Array<{ id: number; type: string; message: string; read: boolean; timestamp: string; title?: string; time?: string }>>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [_notificationsLoading, setNotificationsLoading] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [agentQuestion, setAgentQuestion] = useState<string | undefined>();
  
  // Agent onboarding hook
  const { showPulse, markAsInteracted } = useAgentOnboarding();
  
  // Removed non-functional sidebar toggle function
  
  // IMPROVED: Load real notifications instead of sample data
  const loadNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const dynamicNotifications = await generateDynamicNotifications(t, isRTL);
      setNotifications(dynamicNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Load notifications on mount and set up refresh interval
  useEffect(() => {
    loadNotifications();
    
    // REMOVED: Aggressive 5-minute interval causing infinite loops
    // Only refresh on project changes via events
    const handleProjectChange = () => {
      loadNotifications();
    };
    
    window.addEventListener('project-changed', handleProjectChange);
    window.addEventListener('force-dashboard-refresh', handleProjectChange);
    
    return () => {
      window.removeEventListener('project-changed', handleProjectChange);
      window.removeEventListener('force-dashboard-refresh', handleProjectChange);
    };
  }, []);
  
  // Load notification states from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('topbar-notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        // Only use saved data if we don't have fresh data
        if (notifications.length === 0) {
          setNotifications(parsed);
        }
      } catch (error) {
        console.error('Failed to parse saved notifications:', error);
      }
    }
  }, []);
  
  // Save notification states to localStorage when they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('topbar-notifications', JSON.stringify(notifications));
    }
  }, [notifications.length]);
  
  // Real global search with mock data
  useEffect(() => {
    const performSearch = async () => {
      if (globalSearch.length > 1) {
        setShowResults(true);
        try {
          // Use mock search service
          const mockResults = searchMockData(globalSearch, 10);
          
          // Convert mock results to TopBar SearchResult format
          const results: SearchResult[] = mockResults.map(result => ({
            type: result.type,
            name: result.title,
            id: result.id
          }));

          setSearchResults(results);
        } catch (error) {
          console.error('Search failed:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    };

    // Debounce search
    const timer = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [globalSearch]);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };
  
  const getNotificationIcon = (type: string) => {
    const Icon =
      type === 'lead' ? UserRound
      : type === 'message' ? MessageSquare
      : type === 'meeting' ? CalendarClock
      : type === 'system' ? Activity
      : Bell;
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-subtle">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
    );
  };

  const getResultIcon = (type: string) => {
    const Icon = type === 'project' ? FolderOpen : type === 'conversation' ? MessageSquare : UserRound;
    return <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />;
  };

  const handleSearchResultClick = (result: SearchResult) => {
    logger.info("Search result clicked", "TopBar", { result });
    setGlobalSearch("");
    setSearchResults([]);
    setShowResults(false);
    // TODO: Navigate to the selected item
  };

  const iconButton = "relative h-9 w-9 min-h-[36px] min-w-[36px] text-subtle hover:text-foreground";
  const countBadge =
    "absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground tabular-nums";

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-surface">
      <header className="topbar flex h-[60px] items-center gap-2 px-3 sm:gap-3 sm:px-6 lg:px-8">
        {/* Navigation drawer trigger, below 1024 px */}
        {onOpenNav && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(iconButton, "lg:hidden")}
            onClick={onOpenNav}
            aria-label={isRTL ? "פתח תפריט" : "Open navigation"}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Project Selector */}
        <div className="min-w-0 shrink">
          <BasicProjectSelector />
        </div>

        {/* Search Box */}
        <div className="relative hidden min-w-0 max-w-[420px] flex-1 md:block">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            placeholder="Search everything..."
            aria-label="Search leads, projects and conversations"
            className="h-9 w-full min-w-0 ps-9"
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            onFocus={() => globalSearch.length > 1 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
          />
          {showResults && (
            <div className="absolute start-0 top-11 z-50 max-h-72 w-full min-w-[280px] overflow-auto rounded-lg border border-border bg-popover py-1 shadow-float">
              {searchResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">No results found</div>
              ) : (
                searchResults.map((result, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                    onClick={() => handleSearchResultClick(result)}
                  >
                    {getResultIcon(result.type)}
                    <span className="truncate font-medium text-foreground">{result.name}</span>
                    <span className="ms-auto text-xs capitalize text-muted-foreground">{result.type}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex-1 md:hidden" />

        {/* Controls */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2 md:ms-auto">
          <div className="hidden items-center gap-1 sm:flex">
            <DaisyUIThemeController />
            <LanguageSelector variant="dropdown" size="sm" />
          </div>

          <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={iconButton}
                aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
              >
                <Bell className="h-[18px] w-[18px]" />
                {unreadCount > 0 && <span className={countBadge}>{unreadCount}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end" side="bottom" sideOffset={6}>
              <div className="flex max-h-[400px] flex-col">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button variant="link" size="sm" className="h-auto min-h-0 text-xs" onClick={markAllAsRead}>
                      Mark all as read
                    </Button>
                  )}
                </div>

                <div className="overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-muted-foreground">
                      No notifications yet
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {notifications.map((notification) => (
                        <li key={notification.id}>
                          <button
                            type="button"
                            className={cn(
                              "flex w-full gap-3 px-4 py-3 text-start transition-colors duration-[120ms] hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
                              !notification.read && "bg-action-soft/60",
                            )}
                            onClick={() => markAsRead(notification.id)}
                          >
                            {getNotificationIcon(notification.type)}
                            <span className="min-w-0 flex-1">
                              <span className="flex items-start justify-between gap-2">
                                <span className={cn("text-sm text-foreground", notification.read ? "font-medium" : "font-semibold")}>
                                  {notification.title}
                                </span>
                                <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                                  {notification.time}
                                </span>
                              </span>
                              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                {notification.message}
                              </span>
                            </span>
                            {!notification.read && (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="border-t border-border p-1.5">
                  <Button variant="ghost" size="sm" className="w-full justify-center" asChild>
                    <Link to="/notifications">View all notifications</Link>
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Admin User Plus Icon (if admin) */}
          {isAdmin && (
            <Button variant="ghost" size="icon" className={iconButton} asChild>
              <Link to="/users" aria-label={pendingUserCount > 0 ? `Users, ${pendingUserCount} pending` : "Users"}>
                <UserPlus className="h-[18px] w-[18px]" />
                {pendingUserCount > 0 && <span className={countBadge}>{pendingUserCount}</span>}
              </Link>
            </Button>
          )}

          {/* AI Assistant Button with Onboarding */}
          <Button
            variant="outline"
            size="sm"
            className={cn("relative h-9 gap-1.5 px-2.5 sm:px-3", showPulse && "animate-pulse-glow")}
            onClick={() => {
              markAsInteracted();
              setAgentQuestion(undefined);
              setIsAgentOpen(true);
            }}
            title="AI Assistant - Ask about this CRM"
            // Starts with the visible "Ask AI" so voice-control users can say what they see
            aria-label="Ask AI Assistant"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="hidden xl:inline">Ask AI</span>
          </Button>
        </div>
      </header>

      {/* Gemini AI Agent Dialog */}
      <GeminiAgent
        open={isAgentOpen}
        onOpenChange={setIsAgentOpen}
        initialQuestion={agentQuestion}
      />
    </div>
  );
};

export default TopBar;
