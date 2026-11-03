import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { notificationService, type Notification } from '@/services/notificationService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, MessageSquare, User, Calendar, Settings, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useLang } from '@/hooks/useLang';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'lead':
      return <User className="h-4 w-4 text-blue-500" />;
    case 'message':
      return <MessageSquare className="h-4 w-4 text-green-500" />;
    case 'meeting':
      return <Calendar className="h-4 w-4 text-purple-500" />;
    case 'system':
      return <Settings className="h-4 w-4 text-gray-500" />;
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'info':
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
};

export const NotificationsList = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { isRTL } = useLang();

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      
      // Subscribe to real-time notifications
      const unsubscribe = notificationService.subscribeToNotifications(
        user.id,
        (newNotification) => {
          setNotifications(prev => [newNotification, ...prev]);
        }
      );

      return unsubscribe;
    }
  }, [user?.id]);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await notificationService.getUserNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
      
      // Create demo notifications for portfolio showcase
      const sampleNotifications: Notification[] = [
        {
          id: 'demo-1',
          user_id: user.id,
          title: '🎉 Welcome to CRM Demo',
          message: 'This is a portfolio demonstration with mock data. All information is fictional.',
          type: 'success',
          read: false,
          action_url: '/dashboard',
          metadata: { category: 'demo' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'demo-2',
          user_id: user.id,
          title: '📊 BANT Qualification Complete',
          message: 'Sarah Johnson from TechStart Solutions has been fully BANT qualified. Budget approved, decision maker identified.',
          type: 'lead',
          read: false,
          action_url: '/leads',
          metadata: { source: 'whatsapp', lead: 'lead-001' },
          created_at: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
          updated_at: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: 'demo-3',
          user_id: user.id,
          title: '🔥 Hot Lead Alert',
          message: 'David Park temperature increased to HOT! Enterprise Systems Inc is ready for demo presentation.',
          type: 'warning',
          read: false,
          action_url: '/leads',
          metadata: { temperature: 'hot', lead: 'lead-004' },
          created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          updated_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'demo-4',
          user_id: user.id,
          title: '📅 Meeting Scheduled',
          message: 'Michael Chen booked a Calendly meeting for next week. Demo presentation confirmed.',
          type: 'meeting',
          read: false,
          action_url: '/calendar',
          metadata: { type: 'calendly', lead: 'lead-002' },
          created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          updated_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 'demo-5',
          user_id: user.id,
          title: '⚙️ System Information',
          message: 'This CRM demo uses mock data to showcase BANT/HEAT lead management, WhatsApp integration, and automated sales workflows.',
          type: 'system',
          read: false,
          metadata: { category: 'info' },
          created_at: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
          updated_at: new Date(Date.now() - 10800000).toISOString()
        },
        {
          id: 'demo-6',
          user_id: user.id,
          title: '💬 First Contact Established',
          message: 'Emily Rodriguez from Innovate Labs - Initial WhatsApp conversation started. Gathering requirements.',
          type: 'message',
          read: true,
          action_url: '/leads',
          metadata: { source: 'whatsapp', lead: 'lead-003' },
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          updated_at: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: 'demo-7',
          user_id: user.id,
          title: '📈 Performance Update',
          message: 'Monthly metrics updated: 92% lead reach rate, 35% BANT qualification rate, 15 meetings scheduled this month.',
          type: 'system',
          read: true,
          metadata: { category: 'performance' },
          created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          updated_at: new Date(Date.now() - 259200000).toISOString()
        },
        {
          id: 'demo-8',
          user_id: user.id,
          title: 'ℹ️ Portfolio Demo Notice',
          message: 'This is a demonstration project by Amit Yogev. For questions or to request removal: amit.yogev@gmail.com',
          type: 'info',
          read: true,
          metadata: { category: 'demo', website: 'https://amityogev.com' },
          created_at: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
          updated_at: new Date(Date.now() - 432000000).toISOString()
        }
      ];
      setNotifications(sampleNotifications);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    const success = await notificationService.markAsRead(notificationId);
    
    if (success) {
      setNotifications(notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      ));
    } else {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    
    const success = await notificationService.markAllAsRead(user.id);
    
    if (success) {
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
      toast.success('All notifications marked as read');
    } else {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchNotifications} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium mb-2">No notifications yet</p>
        <p className="text-sm text-muted-foreground">
          When you have new leads, messages, or updates, they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with mark all as read */}
      {unreadCount > 0 && (
        <div className={cn(
          "flex items-center justify-between p-4 bg-muted/50 rounded-lg",
          isRTL && "flex-row-reverse"
        )}>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Bell className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </span>
          </div>
          <Button 
            onClick={handleMarkAllAsRead}
            variant="outline" 
            size="sm"
            className="text-xs"
          >
            Mark all as read
          </Button>
        </div>
      )}

      {/* Notifications list */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md border",
              !notification.read 
                ? 'bg-primary/5 border-primary/20 shadow-sm' 
                : 'bg-background border-border hover:bg-muted/50'
            )}
            onClick={() => handleNotificationClick(notification)}
          >
            <CardContent className="p-4">
              <div className={cn(
                "flex items-start gap-3",
                isRTL && "flex-row-reverse"
              )}>
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 space-y-2 min-w-0">
                  <div className={cn(
                    "flex items-start justify-between gap-3",
                    isRTL && "flex-row-reverse"
                  )}>
                    <h4 className={cn(
                      "text-sm font-medium leading-relaxed",
                      !notification.read ? 'text-foreground' : 'text-muted-foreground',
                      isRTL && "text-right"
                    )}>
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <Badge variant="default" className="text-xs px-2 py-1 bg-primary/10 text-ember-700 dark:text-primary border-primary/20 flex-shrink-0">
                        New
                      </Badge>
                    )}
                  </div>
                  
                  <p className={cn(
                    "text-xs text-muted-foreground leading-relaxed",
                    isRTL && "text-right"
                  )}>
                    {notification.message}
                  </p>
                  
                  <div className={cn(
                    "flex items-center gap-2 text-xs text-muted-foreground",
                    isRTL && "flex-row-reverse"
                  )}>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                    <span>
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                    {notification.metadata?.category && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                        <span className="capitalize">{notification.metadata.category}</span>
                      </>
                    )}
                  </div>
                </div>
                
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 