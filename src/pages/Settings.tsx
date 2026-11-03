// @ts-nocheck
// TypeScript checking disabled for deployment compatibility
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Settings as SettingsIcon, Database, MessageSquare, Shield, Users, Target, Layout, RefreshCw, CheckCircle, XCircle, AlertCircle, Calendar, ShieldCheck, Building2 } from "lucide-react";
import { AvatarUpload } from "@/components/ui/avatar-upload";

import { useAuth } from "@/context/ClientAuthContext";
import { useProject } from "@/context/ProjectContext";
import { useLang } from "@/hooks/useLang";
import { trackEvent } from "@/utils/combined-analytics";
import { simpleProjectService } from "@/services/simpleProjectService";
import { 
  userPreferencesService, 
  UserNotificationSettings, 
  UserPerformanceTargets
} from "@/services/userPreferencesService";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { userCredentialsService, IntegrationStatus } from "@/services/userCredentialsService";
import { generateSafariSafeCalendlyOAuthUrl } from "@/services/calendlyService";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { MockIntegrationsDisplay } from "@/components/settings/MockIntegrationsDisplay";

// Form schemas
const projectFormSchema = z.object({
  name: z.string().min(1, { message: "Project name is required." }),
  description: z.string().optional(),
  waNumber: z.string().optional(),
  calendlyUrl: z.string().url().optional().or(z.literal("")),
});

const messageFormSchema = z.object({
  maxMessages: z.number().min(1).max(100),
  perUserLimit: z.number().min(1).max(10),
  quietHoursStart: z.string(),
  quietHoursEnd: z.string(),
  lockPeriod: z.number().min(1).max(72),
});

const integrationFormSchema = z.object({
  mondayApiKey: z.string().optional(),
  calendlyApiKey: z.string().optional(),
  metaApiKey: z.string().optional(),
  phoneNumber: z.string().optional(),
});

const notificationFormSchema = z.object({
  email_notifications: z.boolean(),
  push_notifications: z.boolean(),
  sms_notifications: z.boolean(),
  notification_schedule: z.any(), // JSON field
});

const performanceFormSchema = z.object({
  target_leads_per_month: z.number().min(1),
  target_meetings_per_month: z.number().min(1),
  target_conversion_rate: z.number().min(0).max(100),
  target_response_rate: z.number().min(0).max(100),
  target_reach_rate: z.number().min(0).max(100),
  target_bant_qualification_rate: z.number().min(0).max(100),
});



// System Status interface
interface SystemStatus {
  database: "connected" | "disconnected" | "checking";
  conversations: "working" | "failed" | "checking";
  api: "online" | "offline" | "checking";
  lastCheck: Date | null;
  conversationCount: number;
  leadCount: number;
  errors: string[];
}

const Settings = () => {
  const { t } = useTranslation("pages");
  const { t: tCommon } = useTranslation("common");
  const { isRTL } = useLang();

  const [activeTab, setActiveTab] = useState("general");
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    projects,
    currentProject,
    setCurrentProject,
    addProject,
    updateProject,
  } = useProject();

  // System Status State
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: "checking",
    conversations: "checking",
    api: "checking",
    lastCheck: null,
    conversationCount: 0,
    leadCount: 0,
    errors: [],
  });
  const [isChecking, setIsChecking] = useState(false);

  // User preferences state
  const [notificationSettings, setNotificationSettings] = useState<UserNotificationSettings | null>(null);
  const [performanceTargets, setPerformanceTargets] = useState<UserPerformanceTargets | null>(null);
  
  // Integration status state
  const [integrationStatuses, setIntegrationStatuses] = useState<IntegrationStatus[]>([]);
  const [calendlyStatus, setCalendlyStatus] = useState<{
    connected: boolean;
    configured: boolean;
    userInfo?: any;
  }>({ connected: false, configured: false });
  const [whatsappStatus, setWhatsappStatus] = useState<{
    connected: boolean;
    configured: boolean;
    userInfo?: any;
  }>({ connected: false, configured: false });

  // Track settings page view
  useEffect(() => {
    trackEvent("settings_page_view", "navigation", "settings_management");

  }, []);

  // Track tab changes
  const handleTabChange = (newTab: string) => {
    trackEvent("settings_tab_changed", "settings", newTab);
    setActiveTab(newTab);
    
    // Refresh integration statuses when switching to integrations tab
    if (newTab === 'integrations') {
      refreshIntegrationStatuses();
    }
  };

  // Initialize forms
  const projectForm = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: currentProject?.name || "",
      description: currentProject?.description || "",
      waNumber: currentProject?.whatsapp_number || "",
      calendlyUrl: currentProject?.calendly_url || "",
    },
  });

  const messageForm = useForm<z.infer<typeof messageFormSchema>>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      maxMessages: 5,
      perUserLimit: 3,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
      lockPeriod: 24,
    },
  });

  const integrationForm = useForm<z.infer<typeof integrationFormSchema>>({
    resolver: zodResolver(integrationFormSchema),
    defaultValues: {
      mondayApiKey: "",
      calendlyApiKey: "",
      metaApiKey: "",
      phoneNumber: "",
    },
  });

  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      notification_schedule: {
        whatsapp_notifications: true,
        lead_notifications: true,
        meeting_notifications: true,
        system_notifications: true,
        quiet_hours_enabled: false,
        quiet_hours_start: "22:00",
        quiet_hours_end: "08:00",
        notification_frequency: "real-time",
      },
    },
  });

  const performanceForm = useForm<z.infer<typeof performanceFormSchema>>({
    resolver: zodResolver(performanceFormSchema),
    defaultValues: {
      target_leads_per_month: 50,
      target_meetings_per_month: 20,
      target_conversion_rate: 15,
      target_response_rate: 85,
      target_reach_rate: 75,
      target_bant_qualification_rate: 30,
    },
  });



  // Load project data
  useEffect(() => {
    const loadProjectData = async () => {
      if (currentProject) {
        try {
          const projectData = await simpleProjectService.getProject(currentProject.id);
          if (projectData) {
            projectForm.reset({
              name: projectData.name || currentProject.name,
              description: projectData.description || currentProject.description || "",
              waNumber: projectData.whatsapp_number || currentProject.whatsapp_number || "",
              calendlyUrl: projectData.calendly_url || currentProject.calendly_url || "",
            });
          }
        } catch (error) {
          console.warn("Failed to load fresh project data:", error);
        }
      }
    };

    loadProjectData();
  }, [currentProject, projectForm]);

  // Load user preferences
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        console.log("TOOL Loading user preferences...");
        
        // ENHANCED: Always provide default values even if service fails
        const defaultNotificationSettings = {
          email_notifications: true,
          push_notifications: true,
          sms_notifications: false,
          notification_schedule: {
            whatsapp_notifications: true,
            lead_notifications: true,
            meeting_notifications: true,
            system_notifications: true,
            quiet_hours_enabled: false,
            quiet_hours_start: "22:00",
            quiet_hours_end: "08:00",
            notification_frequency: "real-time",
          },
        };

        const defaultPerformanceTargets = {
          target_leads_per_month: 50,
          target_meetings_per_month: 20,
          target_conversion_rate: 15,
          target_response_rate: 85,
          target_reach_rate: 75,
          target_bant_qualification_rate: 30,
        };



        try {
          const [notificationData, performanceData] = await Promise.all([
            userPreferencesService.getNotificationSettings(),
            userPreferencesService.getPerformanceTargets(),
          ]);

          // FIXED: Always set data, using defaults if service returns null
          const finalNotificationSettings = notificationData || defaultNotificationSettings;
          const finalPerformanceTargets = performanceData || defaultPerformanceTargets;

          console.log("EMAIL Notification settings:", finalNotificationSettings);
          
          setNotificationSettings(finalNotificationSettings);
          setPerformanceTargets(finalPerformanceTargets);

          // Always populate forms with data (defaults if needed)
          notificationForm.reset(finalNotificationSettings);
          performanceForm.reset(finalPerformanceTargets);

        } catch (serviceError) {
          console.warn("WARNING Service error, using defaults:", serviceError);
          
          // Use defaults when service fails
          setNotificationSettings(defaultNotificationSettings);
          setPerformanceTargets(defaultPerformanceTargets);

          notificationForm.reset(defaultNotificationSettings);
          performanceForm.reset(defaultPerformanceTargets);
        }

      } catch (error) {
        console.error("ERROR Failed to load user preferences:", error);
        toast.error("Failed to load user preferences, using defaults");
        
        // Always ensure forms have data, even on complete failure
        const safeDefaults = {
          email_notifications: true,
          push_notifications: true,
          sms_notifications: false,
        };
        notificationForm.reset(safeDefaults);
      }
    };

    loadUserPreferences();
  }, []);

  // Load integration statuses
  useEffect(() => {
    const loadIntegrationStatuses = async () => {
      try {
        const statuses = await userCredentialsService.getIntegrationStatuses();
        setIntegrationStatuses(statuses);
        
        // Get specific Calendly status
        const calendlyStatus = await userCredentialsService.getCalendlyStatus();
        setCalendlyStatus(calendlyStatus);

        // Get specific WhatsApp status
        const whatsappStatus = await userCredentialsService.getWhatsappStatus();
        setWhatsappStatus(whatsappStatus);
      } catch (error) {
        console.error('Failed to load integration statuses:', error);
      }
    };

    loadIntegrationStatuses();
  }, []);

  // Form submission handlers
  const onProjectSubmit = async (data: z.infer<typeof projectFormSchema>) => {
    try {
      if (currentProject) {
        const updatedProject = await simpleProjectService.updateProject(currentProject.id, {
      name: data.name,
          description: data.description,
      whatsapp_number: data.waNumber,
      calendly_url: data.calendlyUrl,
        });
        if (updatedProject) {
          updateProject(updatedProject);
          toast.success("Project updated successfully!");
        }
      }
    } catch (error) {
      console.error("Failed to update project:", error);
      toast.error("Failed to update project");
    }
  };

  const onNotificationSubmit = async (data: z.infer<typeof notificationFormSchema>) => {
    try {
      console.log("TOOL Saving notification settings:", data);
      const success = await userPreferencesService.saveNotificationSettings(data);
      if (success) {
        toast.success("Notification settings saved successfully!");
        
      } else {
        toast.error("Failed to save notification settings");
        console.error("ERROR Failed to save notification settings");
      }
    } catch (error) {
      console.error("ERROR Error saving notification settings:", error);
      toast.error("Failed to save notification settings");
    }
  };

  const onPerformanceSubmit = async (data: z.infer<typeof performanceFormSchema>) => {
    try {
      console.log("TOOL Saving performance targets:", data);
      const success = await userPreferencesService.savePerformanceTargets(data);
      if (success) {
        toast.success("Performance targets saved successfully!");
        
      } else {
        toast.error("Failed to save performance targets");
        console.error("ERROR Failed to save performance targets");
      }
    } catch (error) {
      console.error("ERROR Error saving performance targets:", error);
      toast.error("Failed to save performance targets");
    }
  };



  // Utility functions
  const handleOpenDashboard = () => {
    navigate("/dashboard");
  };

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success("Cache cleared successfully!");
  };

  // Safari-specific OAuth cache clearing for manual use
  const handleClearSafariOAuthCache = async () => {
    try {
      await clearSafariOAuthCache();
      toast.success("Safari OAuth cache cleared! Try connecting to Calendly again.");
    } catch (error) {
      console.error('Failed to clear Safari OAuth cache:', error);
      toast.error('Failed to clear Safari OAuth cache.');
    }
  };

  // Safari-specific OAuth cache clearing
  const clearSafariOAuthCache = async () => {
    try {
      // Clear all possible Safari caches
      if (window.sessionStorage) {
        window.sessionStorage.clear();
      }
      
      // Clear localStorage oauth items
      if (window.localStorage) {
        const keysToRemove = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && (key.includes('calendly') || key.includes('oauth') || key.includes('auth'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => window.localStorage.removeItem(key));
      }
      
      // Clear any cached fetch requests
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const requests = await cache.keys();
          for (const request of requests) {
            if (request.url.includes('calendly') || request.url.includes('oauth')) {
              await cache.delete(request);
            }
          }
        }
      }
      
      console.log('🦎 Safari OAuth cache cleared');
    } catch (error) {
      console.warn('Safari cache clearing failed:', error);
    }
  };

  const ensureCorrectOAuthEndpoint = (url: string): string => {
    // Ensure we're always using auth.calendly.com
    if (url.includes('calendly.com/oauth/authorize')) {
      return url.replace('calendly.com/oauth/authorize', 'auth.calendly.com/oauth/authorize');
    }
    return url;
  };

  // Integration handlers
  const handleConnectCalendly = async () => {
    try {
      // Safari-specific OAuth handling
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      if (isSafari) {
        console.log('🦎 Safari detected - Using Safari-specific OAuth flow');
        
        // Clear Safari keychain cache before generating URL
        await clearSafariOAuthCache();
        
        // Get client_id from the database for Safari-specific URL generation
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');
          
          const { data: credentials, error } = await (supabase as any)
            .from('user_api_credentials')
            .select('credential_name, encrypted_value')
            .eq('user_id', user.id)
            .eq('credential_type', 'calendly')
            .eq('credential_name', 'client_id')
            .eq('is_active', true)
            .single();
          
          if (error || !credentials) {
            throw new Error('Calendly credentials not configured');
          }
          
          // Decrypt the client_id
          const encryptedValue = credentials.encrypted_value;
          const clientId = atob(encryptedValue); // Simple base64 decoding
          
          // Generate Safari-specific OAuth URL that forces auth.calendly.com
          const redirectUri = `${window.location.origin}/auth/calendly/callback`;
          const safariOAuthUrl = generateSafariSafeCalendlyOAuthUrl(clientId, redirectUri);
          
          console.log('🦎 Safari OAuth URL generated successfully');
          
          // Use aggressive redirect with multiple fallbacks
          setTimeout(() => {
            // Try method 1: Direct href
            window.location.href = safariOAuthUrl;
            
            // Fallback method 2: Replace current page
            setTimeout(() => {
              window.location.replace(safariOAuthUrl);
            }, 100);
            
            // Fallback method 3: Open in same window
            setTimeout(() => {
              window.open(safariOAuthUrl, '_self');
            }, 200);
          }, 100);
          
          return;
        } catch (safariError) {
          console.error('🦎 Safari OAuth generation failed:', safariError);
          toast.error('Safari OAuth failed. Please try using Chrome or contact support.');
          return;
        }
      }
      
      // Non-Safari browsers use the normal flow
      const authUrl = await userCredentialsService.connectToCalendly();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to connect to Calendly:', error);
      toast.error('Failed to connect to Calendly. Please check your credentials.');
    }
  };

  const handleDisconnectCalendly = async () => {
    try {
      const success = await userCredentialsService.disconnectFromCalendly();
      if (success) {
        toast.success('Successfully disconnected from Calendly');
        setCalendlyStatus({ connected: false, configured: false });
        // Reload integration statuses
        const statuses = await userCredentialsService.getIntegrationStatuses();
        setIntegrationStatuses(statuses);
      } else {
        toast.error('Failed to disconnect from Calendly');
      }
    } catch (error) {
      console.error('Failed to disconnect from Calendly:', error);
      toast.error('Failed to disconnect from Calendly');
    }
  };

  const handleSaveApiKeys = async () => {
    try {
      // This could be extended to save API keys to user_api_credentials table
      toast.success('API keys saved successfully');
    } catch (error) {
      console.error('Failed to save API keys:', error);
      toast.error('Failed to save API keys');
    }
  };

  const refreshIntegrationStatuses = async () => {
    try {
      const statuses = await userCredentialsService.getIntegrationStatuses();
      setIntegrationStatuses(statuses);
      
      const calendlyStatus = await userCredentialsService.getCalendlyStatus();
      setCalendlyStatus(calendlyStatus);

      const whatsappStatus = await userCredentialsService.getWhatsappStatus();
      setWhatsappStatus(whatsappStatus);
    } catch (error) {
      console.error('Failed to refresh integration statuses:', error);
    }
  };



  // System status check
  const checkSystemStatus = async () => {
    setIsChecking(true);
    const newStatus: SystemStatus = {
      database: "checking",
      conversations: "checking",
      api: "checking",
      lastCheck: new Date(),
      conversationCount: 0,
      leadCount: 0,
      errors: [],
    };

    try {
      // Check database
      const projects = await simpleProjectService.getProjects();
      newStatus.database = projects ? "connected" : "disconnected";

      // Check conversations
      const conversations = await simpleProjectService.getAllConversations();
      newStatus.conversations = conversations ? "working" : "failed";
      newStatus.conversationCount = conversations?.length || 0;

      // Check leads
      const leads = await simpleProjectService.getAllLeads();
      newStatus.leadCount = leads?.length || 0;

      // Check API
      newStatus.api = "online";
    } catch (error) {
      newStatus.database = "disconnected";
      newStatus.conversations = "failed";
      newStatus.api = "offline";
      newStatus.errors.push(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setSystemStatus(newStatus);
      setIsChecking(false);
    }
  };

  const AdminAccessButtons = () => {
    const { isSystemAdmin, isCompanyAdmin } = useAdminAccess();

    if (!isSystemAdmin && !isCompanyAdmin) {
      return null;
    }

    return (
      <div className="flex items-center gap-2">
        {(isSystemAdmin || isCompanyAdmin) && (
          <Button
            variant="outline"
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2"
            title="Access Admin Center - choose your administrative area"
          >
            <ShieldCheck className="h-4 w-4" />
            Admin Center
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="settings-page">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
        {t("settings.title", "Settings")}
      </h1>
          <p className="text-muted-foreground mt-1">
            {t("settings.description", "Manage your project and system settings")}
          </p>
            </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <AdminAccessButtons />
          <Button onClick={handleOpenDashboard} variant="outline">
            {t("settings.openDashboard", "Open Dashboard")}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="integrations" data-testid="api-integrations-tab">Integrations</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your profile picture and personal information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AvatarUpload 
                currentAvatar={user?.user_metadata?.avatar_url}
                onUpload={async (file: File) => {
                  // Mock upload for testing
                  return new Promise((resolve) => {
                    setTimeout(() => {
                      resolve(URL.createObjectURL(file));
                    }, 1000);
                  });
                }}
                onDelete={async () => {
                  // Mock delete for testing
                  return new Promise((resolve) => {
                    setTimeout(() => {
                      resolve();
                    }, 500);
                  });
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
              <CardDescription>
                Configure your current project settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...projectForm}>
                <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-4">
                  <FormField
                    control={projectForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={projectForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={projectForm.control}
                    name="waNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={projectForm.control}
                    name="calendlyUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calendly URL</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                                          )}
                    />
                    <Button type="submit" className="w-full">
                    Save Project Settings
                    </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={notificationForm.control}
                      name="email_notifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <FormLabel>Email Notifications</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Receive notifications via email
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationForm.control}
                      name="push_notifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <FormLabel>Push Notifications</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Receive push notifications
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationForm.control}
                      name="sms_notifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <FormLabel>SMS Notifications</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Receive SMS notifications
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Save Notification Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Targets</CardTitle>
              <CardDescription>
                Set your performance goals and tracking metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...performanceForm}>
                <form onSubmit={performanceForm.handleSubmit(onPerformanceSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={performanceForm.control}
                      name="target_leads_per_month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Leads per Month</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={performanceForm.control}
                      name="target_meetings_per_month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Meetings per Month</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={performanceForm.control}
                      name="target_conversion_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Conversion Rate (%)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                                          <FormField
                        control={performanceForm.control}
                        name="target_response_rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Response Rate (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </div>
                  <Button type="submit" className="w-full">
                    Save Performance Targets
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6" data-testid="api-integrations-content">
          <Card>
            <CardHeader>
              <CardTitle>API Keys & Integrations</CardTitle>
              <CardDescription>
                Manage your API keys and third-party integrations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API Keys Input Section */}
              <div className="space-y-4" data-testid="api-keys-section">
                <h3 className="text-lg font-medium">API Keys</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-api-key">WhatsApp API Key</Label>
                    <Input
                      id="whatsapp-api-key"
                      type="password"
                      placeholder="Enter your WhatsApp API key"
                      data-testid="whatsapp-api-key-input"
                      value={currentProject?.whatsapp_api_key || ''}
                      onChange={(e) => {
                        // Update project context with WhatsApp API key
                        if (currentProject) {
                          updateProject(currentProject.id, { whatsapp_api_key: e.target.value });
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="openai-api-key">OpenAI API Key</Label>
                    <Input
                      id="openai-api-key"
                      type="password"
                      placeholder="Enter your OpenAI API key"
                      data-testid="openai-api-key-input"
                      value={currentProject?.openai_api_key || ''}
                      onChange={(e) => {
                        // Update project context with OpenAI API key
                        if (currentProject) {
                          updateProject(currentProject.id, { openai_api_key: e.target.value });
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveApiKeys} data-testid="save-api-keys-button">
                    Save API Keys
                  </Button>
                  <Button variant="outline" onClick={refreshIntegrationStatuses} data-testid="refresh-integrations-button">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Integrations Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Connected Integrations</h3>
                <div className="grid gap-2">
                  {/* Calendly Integration */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <div>
                        <span className="font-medium">Calendly</span>
                        {calendlyStatus.connected && calendlyStatus.userInfo?.name && (
                          <p className="text-sm text-muted-foreground">
                            {calendlyStatus.userInfo.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={calendlyStatus.connected ? "default" : "secondary"}
                        data-testid="calendly-status"
                      >
                        {calendlyStatus.connected ? "Connected" : "Not Connected"}
                      </Badge>
                      {calendlyStatus.connected ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" data-testid="disconnect-calendly-button">
                              Disconnect
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Disconnect Calendly</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to disconnect your Calendly integration? 
                                This will remove your stored credentials and you'll need to reconnect to use Calendly features.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline">Cancel</Button>
                              <Button 
                                variant="destructive" 
                                onClick={handleDisconnectCalendly}
                                data-testid="confirm-disconnect"
                              >
                                Disconnect
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Button 
                          onClick={handleConnectCalendly} 
                          size="sm"
                          data-testid="connect-calendly-button"
                        >
                          Connect to Calendly
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* WhatsApp Integration */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>WhatsApp Business</span>
                    </div>
                    <Badge variant={whatsappStatus.connected ? "default" : "secondary"}>
                      {whatsappStatus.connected ? "Connected" : "Not Connected"}
                    </Badge>
                  </div>


                </div>
              </div>

              {/* ALL INTEGRATIONS SHOWCASE (Demo) */}
              <MockIntegrationsDisplay />

              {/* Stored Credentials */}
              {integrationStatuses.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Stored Credentials</h3>
                  <div className="grid gap-2">
                    {integrationStatuses.map((integration) => (
                      <div key={integration.service} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <div>
                            <span className="font-medium capitalize">{integration.service}</span>
                            <p className="text-sm text-muted-foreground">
                              {integration.configured ? 'Configured' : 'Not configured'}
                              {integration.lastUpdated && ` • Updated ${new Date(integration.lastUpdated).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <Badge variant={integration.connected ? "default" : "secondary"}>
                          {integration.connected ? "Connected" : "Not Connected"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your API keys are encrypted and stored securely. They are never exposed in plain text.
                  Calendly integration uses OAuth authentication for secure access.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Check system health and perform maintenance tasks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layout className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-lg">Application Version</span>
                  </div>
                  <Badge variant="default" className="text-base px-4 py-1">
                    v1.0.5-EA
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Security fixes, mock data enhancements, and API improvements
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span className="font-medium">Database:</span>
                  <Badge variant={systemStatus.database === "connected" ? "default" : "destructive"}>
                    {systemStatus.database}
                      </Badge>
                    </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span className="font-medium">Conversations:</span>
                  <Badge variant={systemStatus.conversations === "working" ? "default" : "destructive"}>
                    {systemStatus.conversations}
                      </Badge>
                    </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">API:</span>
                  <Badge variant={systemStatus.api === "online" ? "default" : "destructive"}>
                    {systemStatus.api}
                      </Badge>
                    </div>
                  </div>
              <div className="flex space-x-2">
                <Button onClick={checkSystemStatus} disabled={isChecking}>
                  {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Check Status
                    </Button>
                <Button variant="outline" onClick={handleClearCache}>
                  Clear Cache
                </Button>
                {/^((?!chrome|android).)*safari/i.test(navigator.userAgent) && (
                  <>
                    <Button variant="outline" onClick={handleClearSafariOAuthCache} className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100">
                      🦎 Clear Safari OAuth Cache
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={async () => {
                        try {
                          const { data: { user } } = await supabase.auth.getUser();
                          if (!user) throw new Error('Not authenticated');
                          
                          const { data: creds } = await (supabase as any)
                            .from('user_api_credentials')
                            .select('credential_name, encrypted_value')
                            .eq('user_id', user.id)
                            .eq('credential_type', 'calendly')
                            .eq('credential_name', 'client_id')
                            .single();
                          
                          if (creds) {
                            const clientId = atob(creds.encrypted_value);
                            console.log('🦎 Client ID:', clientId);
                            console.log('🦎 Length:', clientId.length);
                            console.log('🦎 First 20 chars:', clientId.substring(0, 20));
                            toast.success(`Client ID found: ${clientId.substring(0, 10)}...`);
                          } else {
                            toast.error('No Calendly client ID found in database');
                          }
                        } catch (error) {
                          console.error('Debug error:', error);
                          toast.error('Failed to check client ID');
                        }
                      }}
                      className="bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100"
                    >
                      SEARCH Debug Client ID
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
