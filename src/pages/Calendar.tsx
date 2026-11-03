import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Settings,
  ExternalLink,
  CalendarDays,
  RefreshCw,
  Copy,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  User,
  MapPin,
  Phone,
  Video,
  Globe,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  MessageSquare,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLang } from "@/hooks/useLang";
import { calendlyService } from "@/services/calendlyService";
import { googleCalendarService, GoogleCalendarEvent, GoogleCalendarUser } from "@/services/googleCalendarService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendlyConnectionOptions } from "@/components/CalendlyConnectionOptions";

interface CalendlyMeeting {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: "active" | "canceled";
  event_type: string;
  location?: {
    type: string;
    location?: string;
    join_url?: string;
  };
  invitees: Array<{
    name: string;
    email: string;
    status: string;
  }>;
  meeting_notes?: string;
  description?: string;
}

interface UnifiedMeeting {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: "active" | "canceled";
  event_type: string;
  location?: {
    type: string;
    location?: string;
    join_url?: string;
  };
  invitees: Array<{
    name: string;
    email: string;
    status: string;
  }>;
  meeting_notes?: string;
  description?: string;
  source: 'calendly' | 'google';
  htmlLink?: string;
}

interface MeetingContext {
  lead_id: string;
  lead_name: string;
  lead_email?: string;
  lead_phone?: string;
  lead_status?: string;
  source: string;
  project_id?: string;
  project_name?: string;
}

interface CalendlyUser {
  name: string;
  email: string;
  scheduling_url: string;
  slug: string;
  timezone: string;
}


/** Collapsible triggers rendered as <div>s still need Enter/Space like a native button. */
const activateOnEnterOrSpace = (e: React.KeyboardEvent<HTMLElement>) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    e.currentTarget.click();
  }
};

const Calendar = () => {
  const { t } = useTranslation("pages");
  const { t: tCommon } = useTranslation("common");
  const { isRTL } = useLang();

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMeeting, setSelectedMeeting] =
    useState<UnifiedMeeting | null>(null);

  // Meeting context from message threads
  const [meetingContext, setMeetingContext] = useState<MeetingContext | null>(null);
  const [showLeadContext, setShowLeadContext] = useState(false);
  
  // Post-connection onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [postConnectionData, setPostConnectionData] = useState<any>(null);

  // Calendly state
  const [calendlyStatus, setCalendlyStatus] = useState({
    isConnected: false,
    isLoading: true,
    user: null as CalendlyUser | null,
    error: null as string | null,
  });

  // Google Calendar state
  const [googleCalendarStatus, setGoogleCalendarStatus] = useState({
    isConnected: false,
    isLoading: true,
    user: null as GoogleCalendarUser | null,
    error: null as string | null,
  });

  const [meetings, setMeetings] = useState<CalendlyMeeting[]>([]);
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);

  // Check for meeting context from message threads
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const leadId = urlParams.get('lead_id');
    const source = urlParams.get('source');
    
    // Check session storage for meeting context
    const storedContext = sessionStorage.getItem('meeting_context');
    if (storedContext) {
      try {
        const context: MeetingContext = JSON.parse(storedContext);
        setMeetingContext(context);
        setShowLeadContext(true);
        
        // Clear from session storage after reading
        sessionStorage.removeItem('meeting_context');
        
        toast.success(`Calendar opened for ${context.lead_name}`, {
          description: `Source: ${context.source === 'whatsapp_conversation' ? 'WhatsApp Messages' : context.source}`
        });
      } catch (error) {
        console.error('Error parsing meeting context:', error);
      }
    } else if (leadId && source) {
      // Fallback: create basic context from URL params
      setMeetingContext({
        lead_id: leadId,
        lead_name: `Lead ${leadId}`,
        source: source,
      });
      setShowLeadContext(true);
    }
  }, []);

  // Check for post-connection onboarding
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const onboarding = urlParams.get('onboarding');
    
    if (onboarding === 'true') {
      const storedData = sessionStorage.getItem('calendly_post_connection');
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          setPostConnectionData(data);
          setShowOnboarding(true);
          
          // Clear URL parameter
          window.history.replaceState({}, '', '/calendar');
          
          toast.success("Welcome to your Calendly integration!", {
            description: "Let's set up your calendar workflow",
            duration: 5000
          });
        } catch (error) {
          console.error('Error parsing post-connection data:', error);
        }
      }
    }
  }, []);

  // Check integrations and load data
  useEffect(() => {
    initializeCalendly();
    initializeGoogleCalendar();
  }, []);

  const initializeCalendly = async () => {
    try {
      setCalendlyStatus((prev) => ({ ...prev, isLoading: true, error: null }));

      // Check for PAT connection first
      const patUser = await calendlyService.loadPAT();
      if (patUser) {
        const user = await calendlyService.getUserInfoWithPAT();
        if (user) {
          setCalendlyStatus({
            isConnected: true,
            isLoading: false,
            user: user,
            error: null,
          });
          await loadMeetings();
          return;
        }
      }

      // Fallback to OAuth method
      const connectionStatus = await calendlyService.getConnectionStatus();

      if (connectionStatus.connected && connectionStatus.user) {
        setCalendlyStatus({
          isConnected: true,
          isLoading: false,
          user: connectionStatus.user,
          error: null,
        });

        // Load meetings for current month
        await loadMeetings();
      } else {
        setCalendlyStatus({
          isConnected: false,
          isLoading: false,
          user: null,
          error:
            connectionStatus.error || "Please connect your Calendly account using Personal Access Token",
        });
      }
    } catch (error) {
      console.error("ERROR Error initializing Calendly:", error);
      setCalendlyStatus({
        isConnected: false,
        isLoading: false,
        user: null,
        error: "Please connect your Calendly account using Personal Access Token",
      });
    }
  };

  const initializeGoogleCalendar = async () => {
    try {
      setGoogleCalendarStatus((prev) => ({ ...prev, isLoading: true, error: null }));

      const connectionStatus = await googleCalendarService.getConnectionStatus();

      if (connectionStatus.connected && connectionStatus.user) {
        setGoogleCalendarStatus({
          isConnected: true,
          isLoading: false,
          user: connectionStatus.user,
          error: null,
        });

        // Load Google Calendar events for current month
        await loadGoogleCalendarEvents();
      } else {
        setGoogleCalendarStatus({
          isConnected: false,
          isLoading: false,
          user: null,
          error:
            connectionStatus.error || "Please connect your Google Calendar account",
        });
      }
    } catch (error) {
      console.error("ERROR Error initializing Google Calendar:", error);
      setGoogleCalendarStatus({
        isConnected: false,
        isLoading: false,
        user: null,
        error: "Failed to connect to Google Calendar",
      });
    }
  };

  const loadMeetings = async () => {
    if (!calendlyStatus.isConnected) return;

    try {
      setLoadingMeetings(true);

      // Get meetings for current month
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      );

      // Use PAT method for getting scheduled events
      const events = await calendlyService.getScheduledEventsWithPAT({
        min_start_time: startOfMonth.toISOString(),
        max_start_time: endOfMonth.toISOString(),
        status: "active",
        count: 100,
      });

      // Transform events to our format with invitee details
      const transformedMeetings: CalendlyMeeting[] = [];

      for (const event of events) {
        try {
          // Get invitees for each event
          const invitees = await calendlyService.getEventInvitees(event.uri);

          transformedMeetings.push({
            id: event.uri.split("/").pop() || "",
            title: event.name || "Meeting",
            start_time: event.start_time,
            end_time: event.end_time,
            status: event.status,
            event_type: event.event_type,
            location: event.location,
            invitees: invitees.map((inv) => ({
              name: inv.name,
              email: inv.email,
              status: inv.status,
            })),
            meeting_notes: event.meeting_notes_plain,
            description: event.meeting_notes_html,
          });
        } catch (inviteeError) {
          console.warn(
            "Failed to get invitees for event:",
            event.uri,
            inviteeError,
          );
          // Add event without invitee details
          transformedMeetings.push({
            id: event.uri.split("/").pop() || "",
            title: event.name || "Meeting",
            start_time: event.start_time,
            end_time: event.end_time,
            status: event.status,
            event_type: event.event_type,
            location: event.location,
            invitees: [],
            meeting_notes: event.meeting_notes_plain,
            description: event.meeting_notes_html,
          });
        }
      }

      setMeetings(transformedMeetings);
    } catch (error) {
      console.error("ERROR Error loading meetings:", error);
      toast.error("Failed to load meetings from Calendly");
    } finally {
      setLoadingMeetings(false);
    }
  };

  const loadGoogleCalendarEvents = async () => {
    if (!googleCalendarStatus.isConnected) return;

    try {
      setLoadingMeetings(true);

      // Get events for current month
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      );

      const events = await googleCalendarService.getEvents({
        timeMin: startOfMonth.toISOString(),
        timeMax: endOfMonth.toISOString(),
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime',
      });

      setGoogleEvents(events);
    } catch (error) {
      console.error("ERROR Error loading Google Calendar events:", error);
      toast.error("Failed to load events from Google Calendar");
    } finally {
      setLoadingMeetings(false);
    }
  };

  // Reload meetings when month changes
  useEffect(() => {
    if (calendlyStatus.isConnected) {
      loadMeetings();
    }
    if (googleCalendarStatus.isConnected) {
      loadGoogleCalendarEvents();
    }
  }, [currentDate, calendlyStatus.isConnected, googleCalendarStatus.isConnected]);

  const connectCalendly = async () => {
    // This will be handled by the CalendlyPATSetup component
    console.log("Calendly connection will be handled by PAT setup component");
  };

  const connectGoogleCalendar = async () => {
    try {
      const authUrl = await googleCalendarService.getAuthorizationUrl();
      window.location.href = authUrl;
      toast.info("Redirecting to Google for authorization...");
    } catch (error) {
      console.error("Error connecting to Google Calendar:", error);
      toast.error("Failed to connect to Google Calendar. Please try again.");
    }
  };

  const copyCalendlyLink = async () => {
    if (calendlyStatus.user?.scheduling_url) {
      try {
        await navigator.clipboard.writeText(calendlyStatus.user.scheduling_url);
        toast.success("Calendly link copied to clipboard!");
      } catch (error) {
        toast.error("Failed to copy link");
      }
    }
  };

  // Handle scheduling for the lead from message context
  const handleScheduleForLead = () => {
    if (!calendlyStatus.user?.scheduling_url || !meetingContext) return;

    const schedulingUrl = new URL(calendlyStatus.user.scheduling_url);
    
    // Add lead context as URL parameters for pre-filling
    schedulingUrl.searchParams.set('name', meetingContext.lead_name);
    if (meetingContext.lead_email) {
      schedulingUrl.searchParams.set('email', meetingContext.lead_email);
    }
    if (meetingContext.lead_phone) {
      schedulingUrl.searchParams.set('phone', meetingContext.lead_phone);
    }
    
    // Add custom fields for BANT/HEAT qualification
    schedulingUrl.searchParams.set('a1', `Lead Status: ${meetingContext.lead_status || 'Unknown'}`);
    schedulingUrl.searchParams.set('a2', `Project: ${meetingContext.project_name || 'Unknown'}`);
    schedulingUrl.searchParams.set('a3', `Source: WhatsApp Conversation`);
    
    // Open scheduling page
    window.open(schedulingUrl.toString(), '_blank');
    
    toast.success(`Opening Calendly for ${meetingContext.lead_name}`);
  };

  // Navigate back to messages
  const goBackToMessages = () => {
    window.location.href = '/messages';
  };

  // Calendar utilities
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(isRTL ? "he-IL" : "en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(isRTL ? "he-IL" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMeetingDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? "he-IL" : "en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const getMeetingsForDate = (date: Date) => {
    const allEvents = [];
    
    // Add Calendly meetings
    const calendlyMeetings = meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.start_time);
      return (
        meetingDate.getDate() === date.getDate() &&
        meetingDate.getMonth() === date.getMonth() &&
        meetingDate.getFullYear() === date.getFullYear()
      );
    }).map(meeting => ({
      ...meeting,
      source: 'calendly' as const
    }));
    
    // Add Google Calendar events
    const googleMeetings = googleEvents.filter((event) => {
      const eventDate = new Date(event.start.dateTime || event.start.date || '');
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    }).map(event => ({
      id: event.id,
      title: event.summary || 'Untitled Event',
      start_time: event.start.dateTime || event.start.date || '',
      end_time: event.end.dateTime || event.end.date || '',
      status: (event.status === 'confirmed' ? 'active' : 'canceled') as "active" | "canceled",
      event_type: 'google_calendar',
      location: event.location ? { type: 'physical', location: event.location } : undefined,
      invitees: event.attendees?.map(attendee => ({
        name: attendee.displayName || attendee.email,
        email: attendee.email,
        status: attendee.responseStatus
      })) || [],
      meeting_notes: event.description,
      description: event.description,
      source: 'google' as const,
      htmlLink: event.htmlLink
    }));
    
    return [...calendlyMeetings, ...googleMeetings];
  };

  const getLocationIcon = (location?: CalendlyMeeting["location"]) => {
    if (!location) return <MapPin className="h-4 w-4" />;

    switch (location.type) {
      case "zoom":
      case "google_meet":
      case "microsoft_teams":
        return <Video className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      case "physical":
        return <MapPin className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "canceled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border-r border-b border-border"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayMeetings = getMeetingsForDate(date);
      const isSelected = selectedDate?.getDate() === day;
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          className={cn(
            // min-h, not h: with three meetings a fixed 8rem cell spilled its chips over the next row's date
            "min-h-32 p-3 border-r border-b border-border cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors",
            isSelected && "bg-blue-100 dark:bg-blue-900",
            isToday && "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300"
          )}
          onClick={() => setSelectedDate(date)}
        >
          <div className={cn("text-sm font-medium", isToday && "text-yellow-700 dark:text-yellow-400")}>
            {day}
          </div>
          <div className="space-y-1 mt-2">
            {dayMeetings.slice(0, 3).map((meeting) => (
              <div
                key={meeting.id}
                className={cn(
                  "text-xs text-white px-2 py-1 rounded-sm cursor-pointer hover:opacity-90 transition-opacity",
                  meeting.source === 'calendly' ? "bg-blue-500" : "bg-red-500"
                )}
                title={`${meeting.source === 'calendly' ? 'Calendly' : 'Google Calendar'}: ${meeting.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMeeting(meeting);
                }}
              >
                <div className="font-medium truncate">{meeting.title}</div>
                <div className="text-xs opacity-90">{formatTime(meeting.start_time)}</div>
              </div>
            ))}
            {dayMeetings.length > 3 && (
              <div className="text-xs text-gray-500 px-2">+{dayMeetings.length - 3} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const handleCompleteOnboarding = () => {
    setShowOnboarding(false);
    
    // Store completion in user preferences
    if (postConnectionData) {
      const completedData = {
        ...postConnectionData,
        completedSteps: ['overview', 'scheduling', 'integration', 'testing'],
        completedAt: new Date().toISOString()
      };
      
      // You could save this to user preferences here
      sessionStorage.setItem('calendly_onboarding_completed', JSON.stringify(completedData));
      sessionStorage.removeItem('calendly_post_connection');
    }
    
    toast.success("Calendly setup complete! You're ready to schedule meetings.");
  };

  const onboardingSteps = [
    {
      title: "Calendar Overview",
      description: "Your Calendly account is now connected! Here's what you can do:",
      content: [
        "View all your scheduled meetings in one place",
        "Share your booking link directly from conversations",
        "Schedule meetings for leads from WhatsApp messages",
        "Track meeting analytics and booking rates"
      ]
    },
    {
      title: "Share Your Booking Link", 
      description: "Your personal scheduling link is ready to use:",
      content: [
        `Link: ${postConnectionData?.schedulingUrl || 'Loading...'}`,
        "Share this link in WhatsApp conversations",
        "Leads can book meetings directly with you",
        "All bookings sync automatically to this calendar"
      ]
    },
    {
      title: "WhatsApp Integration",
      description: "Schedule meetings directly from message conversations:",
      content: [
        "Go to Messages page → Select a conversation",
        "Click 'Schedule Meeting' button above the chat",
        "Choose to open calendar or share booking link",
        "Meeting context is automatically captured"
      ]
    },
    {
      title: "Ready to Go!",
      description: "Your Calendly integration is fully set up:",
      content: [
        "Test the workflow by visiting Messages page",
        "Your meetings will appear in this calendar view",
        "Check Settings → Integrations for advanced options",
        "View booking analytics in your dashboard"
      ]
    }
  ];

  if (calendlyStatus.isLoading && googleCalendarStatus.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading calendar...</span>
      </div>
    );
  }

  return (
    <div
      className={cn("space-y-6", isRTL && "rtl")}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Lead Context Alert */}
      {meetingContext && showLeadContext && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex justify-between items-center">
              <div>
                <strong>Meeting context loaded:</strong> {meetingContext.lead_name}
                {meetingContext.lead_email && ` (${meetingContext.lead_email})`}
                {meetingContext.project_name && ` • Project: ${meetingContext.project_name}`}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleScheduleForLead} size="sm">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Schedule Now
                </Button>
                <Button variant="ghost" size="sm" onClick={goBackToMessages}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Messages
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowLeadContext(false)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Header with user info and booking link */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-8 tracking-[-0.02em]">
            {t("calendar.title", "Calendar")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "calendar.subtitle",
              "Manage your calendar events from Calendly and Google Calendar",
            )}
            {meetingContext && ` • Context: ${meetingContext.lead_name}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {meetingContext && (
            <Button onClick={handleScheduleForLead} variant="default">
              <CalendarDays className="h-4 w-4 mr-2" />
              Schedule for {meetingContext.lead_name}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              if (calendlyStatus.isConnected) loadMeetings();
              if (googleCalendarStatus.isConnected) loadGoogleCalendarEvents();
            }}
            disabled={loadingMeetings}
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", loadingMeetings && "animate-spin")}
            />
            {t("calendar.refresh", "Refresh")}
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              (window.location.href = "/settings?tab=integrations")
            }
          >
            <Settings className="h-4 w-4 mr-2" />
            {t("calendar.settings", "Settings")}
          </Button>
        </div>
      </div>



      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex w-auto items-center gap-2">
              <CalendarDays className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                  <span>Calendly</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                  <span>Google Calendar</span>
                </div>
              </div>
              
              {/* Navigation */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => prevMonth()}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => nextMonth()}
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0 border border-border rounded-lg overflow-hidden min-h-[600px]">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-4 bg-muted text-center text-sm font-medium border-b border-border"
              >
                {day}
              </div>
            ))}
            {/* Calendar days */}
            {renderCalendarGrid()}
          </div>
        </CardContent>
      </Card>

      {/* Meeting Details Dialog */}
      <Dialog
        open={!!selectedMeeting}
        onOpenChange={() => setSelectedMeeting(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Meeting Details
            </DialogTitle>
          </DialogHeader>
          {selectedMeeting && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title:</label>
                  <p className="text-sm">{selectedMeeting.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Source:</label>
                  <div className="flex items-center gap-1">
                    <div className={cn(
                      "w-3 h-3 rounded-sm",
                      selectedMeeting.source === 'calendly' ? "bg-blue-500" : "bg-red-500"
                    )}></div>
                    <span className="text-sm capitalize">
                      {selectedMeeting.source === 'calendly' ? 'Calendly' : 'Google Calendar'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status:</label>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(selectedMeeting.status)}
                    <span className="text-sm capitalize">
                      {selectedMeeting.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Type:</label>
                  <p className="text-sm">{selectedMeeting.event_type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Time:</label>
                  <p className="text-sm">
                    {new Date(selectedMeeting.start_time).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">End Time:</label>
                  <p className="text-sm">
                    {new Date(selectedMeeting.end_time).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedMeeting.location && (
                <div>
                  <label className="text-sm font-medium">Location:</label>
                  <div className="flex items-center gap-2">
                    {getLocationIcon(selectedMeeting.location)}
                    <span className="text-sm">
                      {selectedMeeting.location.join_url ? (
                        <a
                          href={selectedMeeting.location.join_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {selectedMeeting.location.type} Meeting
                        </a>
                      ) : (
                        selectedMeeting.location.location ||
                        selectedMeeting.location.type
                      )}
                    </span>
                  </div>
                </div>
              )}

              {selectedMeeting.invitees.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Attendees:</label>
                  <div className="space-y-1">
                    {selectedMeeting.invitees.map((invitee, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm"
                      >
                        <User className="h-3 w-3" />
                        <span>{invitee.name}</span>
                        <span className="text-muted-foreground">
                          ({invitee.email})
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {invitee.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMeeting.meeting_notes && (
                <div>
                  <label className="text-sm font-medium">Notes:</label>
                  <p className="text-sm bg-muted p-3 rounded">
                    {selectedMeeting.meeting_notes}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-4">
                {selectedMeeting.htmlLink && (
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={selectedMeeting.htmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in {selectedMeeting.source === 'calendly' ? 'Calendly' : 'Google Calendar'}
                    </a>
                  </Button>
                )}
                {selectedMeeting.source === 'calendly' && calendlyStatus.user?.scheduling_url && (
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={calendlyStatus.user.scheduling_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View All Calendly Events
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Meeting Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Confirmed Meetings
                </p>
                <p className="text-2xl font-bold">
                  {meetings.filter((m) => m.status === "active").length + googleEvents.filter((e) => e.status === "confirmed").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{meetings.length + googleEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Canceled</p>
                <p className="text-2xl font-bold">
                  {meetings.filter((m) => m.status === "canceled").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Integrations Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calendly Integration */}
        <Card>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                role="button"
                tabIndex={0}
                onKeyDown={activateOnEnterOrSpace}
              >
                <CardTitle className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                    Calendly Integration
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
            {calendlyStatus.user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{calendlyStatus.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {calendlyStatus.user.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Timezone: {calendlyStatus.user.timezone}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={calendlyStatus.user.scheduling_url}
                    readOnly
                    className="flex-1"
                  />
                  <Button onClick={copyCalendlyLink} variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={calendlyStatus.user.scheduling_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <CalendlyConnectionOptions onSuccess={(user) => {
                setCalendlyStatus({
                  isConnected: true,
                  isLoading: false,
                  user: {
                    name: user.name,
                    email: user.email,
                    scheduling_url: user.scheduling_url,
                    slug: user.slug,
                    timezone: user.timezone,
                  },
                  error: null,
                });
                loadMeetings();
              }} />
            )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Google Calendar Integration */}
        <Card>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                role="button"
                tabIndex={0}
                onKeyDown={activateOnEnterOrSpace}
              >
                <CardTitle className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-red-600" />
                    Google Calendar Integration
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
            {googleCalendarStatus.user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{googleCalendarStatus.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {googleCalendarStatus.user.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Timezone: {googleCalendarStatus.user.timeZone}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-sm">
                    Syncing events from your primary Google Calendar
                  </span>
                  <Button asChild variant="outline" size="sm">
                    <a
                      href="https://calendar.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">
                  Connect your Google Calendar to view your existing events
                </p>
                <Button onClick={connectGoogleCalendar}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect Google Calendar
                </Button>
              </div>
            )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>

      {/* Post-Connection Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Calendly Integration Setup</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Step {onboardingStep + 1} of {onboardingSteps.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOnboarding(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((onboardingStep + 1) / onboardingSteps.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Current Step Content */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {onboardingSteps[onboardingStep]?.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {onboardingSteps[onboardingStep]?.description}
                  </p>
                </div>

                <ul className="space-y-2">
                  {onboardingSteps[onboardingStep]?.content.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>

                {onboardingStep === 1 && postConnectionData?.schedulingUrl && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Input
                        value={postConnectionData.schedulingUrl}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        onClick={copyCalendlyLink}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {onboardingStep === 2 && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                         <div className="flex items-center gap-2 mb-2">
                       <MessageSquare className="h-4 w-4 text-blue-600" />
                       <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                         Try it now!
                       </span>
                     </div>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-300 hover:bg-blue-100"
                    >
                      <a href="/messages" target="_blank">
                        Open Messages Page
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setOnboardingStep(Math.max(0, onboardingStep - 1))}
                  disabled={onboardingStep === 0}
                >
                  Previous
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={handleCompleteOnboarding}
                  >
                    Skip Setup
                  </Button>
                  
                  {onboardingStep < onboardingSteps.length - 1 ? (
                    <Button
                      onClick={() => setOnboardingStep(onboardingStep + 1)}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button onClick={handleCompleteOnboarding}>
                      Complete Setup
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
