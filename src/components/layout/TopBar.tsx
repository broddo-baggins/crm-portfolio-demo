import { Bell, Search, UserPlus, FolderOpen, Sparkles, Menu } from "lucide-react";
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
  /** Opens the navigation drawer on screens too narrow for the sidebar */
  onOpenNavigation?: () => void;
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

const TopBar = ({ pendingUserCount = 0, onOpenNavigation }: TopBarProps) => {
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
    switch(type) {
      case 'lead':
        return <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">👤</div>;
      case 'meeting':
        return <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500">CALENDAR</div>;
      case 'system':
        return <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">NOTIFY</div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">📌</div>;
    }
  };
  
  const handleSearchResultClick = (result: SearchResult) => {
    logger.info("Search result clicked", "TopBar", { result });
    setGlobalSearch("");
    setSearchResults([]);
    setShowResults(false);
    // TODO: Navigate to the selected item
  };

  return (
          <div className="sticky top-0 z-50 border-b px-3 sm:px-4 md:px-6 py-3 bg-background safe-area-top">
      {/* Main header container following design specification */}
      {/* Wraps below md: in one row the trailing controls were pushed off-screen on phones */}
      <header className="topbar flex flex-wrap md:flex-nowrap items-center gap-2 sm:gap-4">
        
        {onOpenNavigation && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 md:hidden"
            onClick={onOpenNavigation}
            aria-label="Open navigation"
            data-testid="open-navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Project Selector - hidden on mobile to save space */}
        <div className="shrink-0 hidden lg:block">
          <BasicProjectSelector />
        </div>
        
        {/* Mobile Project Selector - compact version for small screens */}
        <div className="shrink-0 block lg:hidden h-8">
          <BasicProjectSelector />
        </div>

        {/* Search Box - responsive sizing */}
        <div className="flex-1 min-w-0 mx-2 sm:mx-4 relative">
          <Search className={cn(
            "absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10",
            isRTL ? "right-3" : "left-3"
          )} />
          <Input
            placeholder="Search everything..."
            className={cn(
              "w-full min-w-0",
              isRTL ? "pr-10" : "pl-10"
            )}
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            onFocus={() => globalSearch.length > 1 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
          />
          {showResults && (
            <div className={cn(
              "absolute top-12 bg-white border rounded shadow-lg z-50 max-h-72 overflow-auto",
              "w-full min-w-[280px]",
              isRTL ? "right-0" : "left-0"
            )}>
              {searchResults.length === 0 ? (
                <div className="p-4 text-gray-500 text-center">No results found</div>
              ) : (
                searchResults.map((result, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "p-3 hover:bg-blue-50 cursor-pointer flex items-center gap-2",
                      isRTL && "flex-row-reverse"
                    )}
                    onClick={() => handleSearchResultClick(result)}
                  >
                    <span className="inline-block w-5 text-gray-400">
                      {result.type === 'project' && '📁'}
                      {result.type === 'lead' && '👤'}
                      {result.type === 'conversation' && 'CHAT'}
                    </span>
                    <span className="font-medium">{result.name}</span>
                    <span className={cn(
                      "text-xs text-gray-400",
                      isRTL ? "mr-auto" : "ml-auto"
                    )}>{result.type}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Controls - proper flex layout */}
        <div className={cn(
          "flex items-center gap-2 sm:gap-4 shrink-0",
          isRTL && "flex-row-reverse"
        )}>
          {/* In RTL (Hebrew): Language selector first, then bell */}
          {isRTL && (
            <>
              <DaisyUIThemeController />
              <LanguageSelector variant="dropdown" size="sm" />
              <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-8 w-8" aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}>
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-80 p-0" 
                  align="end" 
                  side="bottom" 
                  sideOffset={2}
                >
                  <div className="bg-white rounded-md shadow-lg max-h-[400px] flex flex-col">
                    <div className="flex items-center justify-between p-3 border-b">
                      <h3 className="font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs text-primary hover:text-primary/80"
                          onClick={markAllAsRead}
                        >
                          Mark all as read
                        </Button>
                      )}
                    </div>
                    
                    <div className="overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No notifications yet
                        </div>
                      ) : (
                        <div className="divide-y divide-border">
                          {notifications.map((notification) => (
                            <div 
                              key={notification.id} 
                              className={cn(
                                "p-3 hover:bg-muted/50 cursor-pointer flex gap-3 transition-colors duration-200",
                                !notification.read && "bg-primary/5",
                                isRTL && "flex-row-reverse"
                              )}
                              onClick={() => markAsRead(notification.id)}
                            >
                              {getNotificationIcon(notification.type)}
                              <div className={cn(
                                "flex-1 min-w-0",
                                isRTL && "text-right"
                              )}>
                                <div className={cn(
                                  "flex justify-between items-start gap-2",
                                  isRTL && "flex-row-reverse"
                                )}>
                                  <h4 className={cn(
                                    "text-sm font-medium text-foreground",
                                    !notification.read && "font-semibold"
                                  )}>
                                    {notification.title}
                                  </h4>
                                  <span className={cn(
                                    "text-xs text-muted-foreground whitespace-nowrap flex-shrink-0",
                                    isRTL ? "mr-2" : "ml-2"
                                  )}>
                                    {notification.time}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                  {notification.message}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-primary self-center flex-shrink-0"></div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t p-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-sm justify-center"
                        asChild
                      >
                        <Link to="/notifications">
                          View all notifications
                        </Link>
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* Admin User Plus Icon (if admin) */}
              {isAdmin && (
                <Button variant="ghost" size="icon" className="relative h-8 w-8" asChild>
                  <Link to="/users" aria-label={pendingUserCount > 0 ? `Manage users, ${pendingUserCount} pending` : "Manage users"}>
                    <UserPlus className="h-5 w-5" />
                    {pendingUserCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                        {pendingUserCount}
                      </span>
                    )}
                  </Link>
                </Button>
              )}
            </>
          )}
          
          {/* In LTR (English): Bell first, then language selector */}
          {!isRTL && (
            <>
              <DaisyUIThemeController />
              <LanguageSelector variant="dropdown" size="sm" />
              <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-8 w-8" aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}>
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-80 p-0" 
                  align="end" 
                  side="bottom" 
                  sideOffset={2}
                >
                  <div className="bg-white rounded-md shadow-lg max-h-[400px] flex flex-col">
                    <div className="flex items-center justify-between p-3 border-b">
                      <h3 className="font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs text-primary hover:text-primary/80"
                          onClick={markAllAsRead}
                        >
                          Mark all as read
                        </Button>
                      )}
                    </div>
                    
                    <div className="overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No notifications yet
                        </div>
                      ) : (
                        <div className="divide-y divide-border">
                          {notifications.map((notification) => (
                            <div 
                              key={notification.id} 
                              className={cn(
                                "p-3 hover:bg-muted/50 cursor-pointer flex gap-3 transition-colors duration-200",
                                !notification.read && "bg-primary/5"
                              )}
                              onClick={() => markAsRead(notification.id)}
                            >
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className={cn(
                                    "text-sm font-medium text-foreground",
                                    !notification.read && "font-semibold"
                                  )}>
                                    {notification.title}
                                  </h4>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0 ml-2">
                                    {notification.time}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                  {notification.message}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-primary self-center flex-shrink-0"></div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t p-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-sm justify-center"
                        asChild
                      >
                        <Link to="/notifications">
                          View all notifications
                        </Link>
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* Admin User Plus Icon (if admin) */}
              {isAdmin && (
                <Button variant="ghost" size="icon" className="relative h-8 w-8" asChild>
                  <Link to="/users" aria-label={pendingUserCount > 0 ? `Manage users, ${pendingUserCount} pending` : "Manage users"}>
                    <UserPlus className="h-5 w-5" />
                    {pendingUserCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                        {pendingUserCount}
                      </span>
                    )}
                  </Link>
                </Button>
              )}

              {/* AI Assistant Button with Onboarding */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "relative h-8 w-8",
                    showPulse && "animate-pulse-glow"
                  )}
                  onClick={() => {
                    markAsInteracted();
                    setAgentQuestion(undefined);
                    setIsAgentOpen(true);
                  }}
                  title="AI Assistant - Ask about this CRM"
                  aria-label="AI Assistant"
                >
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  
                  {/* Animated ping ring for pulsing state */}
                  {showPulse && (
                    <span className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping-slow" />
                  )}
                </Button>
              </div>
            </>
          )}
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
