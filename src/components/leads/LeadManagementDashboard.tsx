// @ts-nocheck
// TEMP: TypeScript compatibility issues - systematic fix needed

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useLang } from "@/hooks/useLang";
import { useLeadSummary } from "@/hooks/useLeadSummary";
import { useProject } from "@/context/ProjectContext";
import { useProjectDataRefresh } from "@/hooks/useProjectDataRefresh";
import { simpleProjectService } from "@/services/simpleProjectService";
import { LeadProcessingService } from "@/services/leadProcessingService";
import { LeadMetricsService, HEAT_LEVEL_CONFIG, getHeatLevel } from "@/services/leadMetricsService";
// Use regular import instead of dynamic import to avoid chunk conflicts with App.tsx
// MessagesAnalyticsDashboard will be lazy loaded when needed

import {
  Users,
  TrendingUp,
  Activity,
  Filter,
  Search,
  Plus,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building,
  Calendar,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Database,
  Loader2,
  HelpCircle,
  Play,
  MessageSquare,
  CalendarDays,
  Archive,
  MoreHorizontal,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  getLeadName, 
  getLeadTemperature, 
  getLeadCompany, 
  getDisplayTemperature, 
  getTemperatureVariant,
  getHeatScaleLevel,
} from "@/utils/leadUtils";
import { type Lead } from "@/types";
import { useNavigate } from "react-router";
import { LeadDrawer } from "./LeadDrawer";
import { PersonAvatar } from "@/components/system/PersonAvatar";
import { HeatTag } from "@/components/system/HeatTag";
import { BantChip } from "@/components/system/BantChip";
import { bantFlags, heatWord, leadFullName, relativeDay } from "@/utils/leadInsight";
import { LeadForm } from "./LeadForm";
import { QueuePreviewBar } from "@/components/queue/QueuePreviewBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  hotLeads: number;
  convertedLeads: number;
  conversionRate: number;
  averageResponseTime: number;
  lastUpdated: string;
}

interface LeadFilters {
  search: string;
  state: string;
  heat: string;
  dateRange: string;
}

interface RealTimeUpdate {
  type: "insert" | "update" | "delete";
  lead: Partial<Lead>;
  timestamp: string;
}

// HubSpot-style Bulk Queue Management
interface BulkQueueSelection {
  selectedLeads: Set<string>;
  selectAllMode: 'none' | 'page' | 'filtered' | 'all';
  isSelectAllVisible: boolean;
}

interface QueuePreview {
  selectedCount: number;
  estimatedSendTime: Date;
  messagePreview: string;
  conflicts: Array<{
    leadId: string;
    leadName: string;
    conflict: 'already_queued' | 'invalid_phone' | 'opted_out';
    details: string;
  }>;
  capacityWarning?: {
    dailyLimit: number;
    currentUsage: number;
    willExceed: boolean;
  };
}

// Heat levels will be translated dynamically - Now using confidence scores
const getHeatLevels = (t: any) => [
  {
    value: "all",
    label: t("leads.heatLevels.all", "All Heat Levels"),
    labelHe: "כל רמות החום",
    color: "bg-gray-500",
  },
  {
    value: "FROZEN",
    label: t("leads.heatLevels.frozen", "Frozen (0-10%)"),
    labelHe: "קפוא",
    color: "bg-gray-500",
    emoji: "🧊",
  },
  {
    value: "ICE_COLD",
    label: t("leads.heatLevels.iceCold", "Ice Cold (11-20%)"),
    labelHe: "קר מאוד",
    color: "bg-blue-300",
    emoji: "❄️",
  },
  {
    value: "COLD",
    label: t("leads.heatLevels.cold", "Cold (21-35%)"),
    labelHe: "קר",
    color: "bg-blue-500",
    emoji: "🌨️",
  },
  {
    value: "COOL",
    label: t("leads.heatLevels.cool", "Cool (36-50%)"),
    labelHe: "קריר",
    color: "bg-cyan-500",
    emoji: "🌤️",
  },
  {
    value: "WARM",
    label: t("leads.heatLevels.warm", "Warm (51-65%)"),
    labelHe: "חמים",
    color: "bg-yellow-500",
    emoji: "🌡️",
  },
  {
    value: "HOT",
    label: t("leads.heatLevels.hot", "Hot (66-80%)"),
    labelHe: "חם",
    color: "bg-orange-500",
    emoji: "HOT",
  },
  {
    value: "BURNING",
    label: t("leads.heatLevels.burning", "Burning (81-95%)"),
    labelHe: "בוער",
    color: "bg-red-500",
    emoji: "🌋",
  },
  {
    value: "WHITE_HOT",
    label: t("leads.heatLevels.whiteHot", "White Hot (96-100%)"),
    labelHe: "לוהט",
    color: "bg-purple-500",
    emoji: "FAST",
  },
];

// Lead states will be translated dynamically - Using actual database states
const getLeadStates = (t: any) => [
  {
    value: "all",
    label: t("leads.states.all", "All States"),
    labelHe: "כל המצבים",
  },
  {
    value: "new_lead",
    label: t("leads.states.new", "New"),
    labelHe: "חדש",
  },
  {
    value: "contacted",
    label: t("leads.states.contacted", "Contacted"),
    labelHe: "נוצר קשר",
  },
  {
    value: "information_gathering",
    label: t("leads.states.infoGathering", "Info Gathering"),
    labelHe: "איסוף מידע",
  },
  {
    value: "demo_scheduled",
    label: t("leads.states.demoScheduled", "Demo Scheduled"),
    labelHe: "הדגמה מתוכננת",
  },
  {
    value: "qualified",
    label: t("leads.states.qualified", "Qualified"),
    labelHe: "מוכשר",
  },
];

export const LeadManagementDashboard: React.FC = () => {
  const { t, i18n } = useTranslation(["leads", "common", "pages"]);
  const { isRTL, flexRowReverse, textStart, textEnd } = useLang();
  const { currentProject } = useProject();
  const navigate = useNavigate();
  const { user } = useAuth(); // Add this line
  const { refreshLeads, refreshAll, isRefreshing: isAutoRefreshing } = useProjectDataRefresh();
  const isHebrew = i18n.language === "he";

  // Debug: Log RTL state and text alignment values
  console.log('SEARCH [LeadManagementDashboard] Language Debug:', {
    language: i18n.language,
    isRTL,
    isHebrew,
    textStart: textStart(),
    textEnd: textEnd()
  });

  // Get dynamic translated constants
  const HEAT_LEVELS = useMemo(() => getHeatLevels(t), [t]);
  const LEAD_STATES = useMemo(() => getLeadStates(t), [t]);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalLeads: 0,
    newLeads: 0,
    hotLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
    averageResponseTime: 0,
    lastUpdated: new Date().toISOString(),
  });

  const [filters, setFilters] = useState<LeadFilters>({
    search: "",
    state: "all",
    heat: "all",
    dateRange: "all",
  });

  // HubSpot-style Bulk Selection State
  const [bulkSelection, setBulkSelection] = useState<BulkQueueSelection>({
    selectedLeads: new Set(),
    selectAllMode: 'none',
    isSelectAllVisible: false,
  });

  const [queuePreview, setQueuePreview] = useState<QueuePreview | null>(null);
  const [showPreviewBar, setShowPreviewBar] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const loadingRef = useRef(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [realtimeUpdates, setRealtimeUpdates] = useState<RealTimeUpdate[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState("leads");

  // New state for lead properties overlay and form
  const [isLeadPropertiesOpen, setIsLeadPropertiesOpen] = useState(false);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [leadForEdit, setLeadForEdit] = useState<Lead | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // HubSpot-style Bulk Selection Handlers
  const handleLeadSelection = (leadId: string, checked: boolean) => {
    setBulkSelection(prev => {
      const newSelected = new Set(prev.selectedLeads);
      if (checked) {
        newSelected.add(leadId);
      } else {
        newSelected.delete(leadId);
        if (prev.selectAllMode !== 'none') {
          return {
            ...prev,
            selectedLeads: newSelected,
            selectAllMode: 'none',
          };
        }
      }
      
      const allVisible = filteredLeads.every(lead => newSelected.has(lead.id));
      const hasSelection = newSelected.size > 0;
      
      return {
        ...prev,
        selectedLeads: newSelected,
        selectAllMode: allVisible && hasSelection ? 'filtered' : 'none',
        isSelectAllVisible: hasSelection,
      };
    });
  };

  const handleSelectAll = (mode: 'page' | 'filtered' | 'all') => {
    setBulkSelection(prev => {
      if (prev.selectAllMode === mode) {
        // Deselect all
        return {
          selectedLeads: new Set(),
          selectAllMode: 'none',
          isSelectAllVisible: false,
        };
      }
      
      let leadsToSelect: Lead[] = [];
      switch (mode) {
        case 'page':
          leadsToSelect = filteredLeads.slice(0, 20); // Assuming 20 per page
          break;
        case 'filtered':
          leadsToSelect = filteredLeads;
          break;
        case 'all':
          leadsToSelect = leads;
          break;
      }
      
      return {
        selectedLeads: new Set(leadsToSelect.map(lead => lead.id)),
        selectAllMode: mode,
        isSelectAllVisible: true,
      };
    });
  };

  // Generate Queue Preview
  const generateQueuePreview = useCallback(async (selectedLeadIds: string[]) => {
    if (selectedLeadIds.length === 0) {
      setQueuePreview(null);
      setShowPreviewBar(false);
      return;
    }

    const selectedLeadsData = leads.filter(lead => selectedLeadIds.includes(lead.id));
    const conflicts: QueuePreview['conflicts'] = [];
    
    // Detect conflicts
    selectedLeadsData.forEach(lead => {
      if (lead.processing_state === 'queued') {
        conflicts.push({
          leadId: lead.id,
          leadName: getLeadName(lead),
          conflict: 'already_queued',
          details: 'Already in queue for processing'
        });
      }
      
      if (!lead.phone || lead.phone.length < 10) {
        conflicts.push({
          leadId: lead.id,
          leadName: getLeadName(lead),
          conflict: 'invalid_phone',
          details: 'Phone number missing or invalid'
        });
      }
    });

    // Calculate estimated send time (assuming 9 AM start + processing time)
    const now = new Date();
    const startTime = new Date();
    startTime.setHours(9, 0, 0, 0);
    if (now.getHours() >= 9) {
      startTime.setDate(startTime.getDate() + 1); // Next day
    }

    const preview: QueuePreview = {
      selectedCount: selectedLeadIds.length,
      estimatedSendTime: startTime,
      messagePreview: `Hello {{name}}, this is a personalized message for {{company}}...`,
      conflicts,
      capacityWarning: {
        dailyLimit: 200,
        currentUsage: 45,
        willExceed: selectedLeadIds.length + 45 > 200,
      }
    };

    setQueuePreview(preview);
    setShowPreviewBar(true);
  }, [leads]);

  // Update preview when selection changes
  useEffect(() => {
    const selectedArray = Array.from(bulkSelection.selectedLeads);
    generateQueuePreview(selectedArray);
  }, [bulkSelection.selectedLeads, generateQueuePreview]);

  // Bulk Queue Actions
  const handleBulkQueueAction = async (action: 'queue' | 'remove' | 'schedule') => {
    const selectedIds = Array.from(bulkSelection.selectedLeads);
    
    if (selectedIds.length === 0) {
      toast.error("Please select leads to queue");
      return;
    }

    try {
      switch (action) {
        case 'queue':
          // Show conflicts if any
          if (queuePreview?.conflicts.length) {
            const proceed = await new Promise((resolve) => {
              toast.error('BLOCKED ' + queuePreview.conflicts.length + ' conflicts detected', {
                description: "Some leads are already queued or have issues",
                action: {
                  label: "Queue Anyway",
                  onClick: () => resolve(true),
                },
                cancel: {
                  label: "Review",
                  onClick: () => resolve(false),
                }
              });
            });
            
            if (!proceed) return;
          }

          // Queue the leads
          await LeadProcessingService.bulkEnqueueLeads(selectedIds);
          toast.success(`SUCCESS ${selectedIds.length} leads queued successfully`);
          break;
          
        case 'remove':
          await LeadProcessingService.bulkRemoveFromQueue(selectedIds);
          toast.success(`🗑️ ${selectedIds.length} leads removed from queue`);
          break;
          
        case 'schedule':
          // Open schedule dialog
          const scheduleDate = new Date();
          scheduleDate.setDate(scheduleDate.getDate() + 1);
          await LeadProcessingService.bulkScheduleLeads(selectedIds, scheduleDate);
          toast.success(`CALENDAR ${selectedIds.length} leads scheduled for tomorrow`);
          break;
      }

      // Clear selection and refresh
      setBulkSelection({
        selectedLeads: new Set(),
        selectAllMode: 'none',
        isSelectAllVisible: false,
      });
      
      await loadLeadsData();
      
    } catch (error) {
      console.error(`Error ${action}ing leads:`, error);
      toast.error(`Failed to ${action} leads`);
    }
  };

  // Real-time subscription management
  useEffect(() => {
    // DEMO DEMO MODE: Skip real-time subscriptions
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      console.log('DEMO [DEMO MODE] Skipping real-time subscriptions');
      setIsRealTimeConnected(false);
      return;
    }
    
    const subscription = supabase
      .channel("leads-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        (payload) => {
          console.log("Real-time dashboard update:", payload);
          setIsRealTimeConnected(true);

          const update: RealTimeUpdate = {
            type: payload.eventType as "insert" | "update" | "delete",
            lead: payload.new || payload.old,
            timestamp: new Date().toISOString(),
          };

          setRealtimeUpdates((prev) => [update, ...prev.slice(0, 9)]);

          // Update leads array based on event type
          if (payload.eventType === "INSERT" && payload.new) {
            const newLead: Lead = {
              ...payload.new,
              name: `${payload.new.first_name || ""} ${payload.new.last_name || ""}`.trim(),
              // Ensure all required fields exist
              state: payload.new.state || "new",
              company: payload.new.company || null,
              position: payload.new.position || null,
              location: payload.new.location || null,
              temperature: payload.new.temperature || 0,
            } as Lead;

            setLeads((prev) => [newLead, ...prev]);

            // Create notification for new lead
            if (user?.id) {
              notificationService.notifyLeadEvent(
                user.id,
                newLead.id,
                'created',
                {
                  name: newLead.name,
                  source: 'real_time'
                }
              );
            }

            toast.success(
              t("leads.notifications.newLeadAdded", "New lead added"),
              {
                description: isHebrew
                  ? `${newLead.name} נוסף למערכת`
                  : `${newLead.name} has been added to the system`,
                action: {
                  label: t("common.view", "View"),
                  onClick: () => setSelectedLead(newLead),
                },
              },
            );
          } else if (payload.eventType === "UPDATE" && payload.new) {
            const updatedLead: Lead = {
              ...payload.new,
              name: `${payload.new.first_name || ""} ${payload.new.last_name || ""}`.trim(),
              // Ensure all required fields exist
              state: payload.new.state || "new",
              company: payload.new.company || null,
              position: payload.new.position || null,
              location: payload.new.location || null,
              temperature: payload.new.temperature || 0,
            } as Lead;

            setLeads((prev) =>
              prev.map((lead) =>
                lead.id === updatedLead.id ? updatedLead : lead,
              ),
            );

            // Create notification for lead update
            if (user?.id) {
              notificationService.notifyLeadEvent(
                user.id,
                updatedLead.id,
                'updated',
                {
                  name: updatedLead.name,
                  status: updatedLead.state
                }
              );
            }

            toast.info(t("leads.notifications.leadUpdated", "Lead updated"), {
              description: isHebrew
                ? `המידע של ${updatedLead.name} עודכן`
                : `${updatedLead.name} information has been updated`,
            });
          } else if (payload.eventType === "DELETE" && payload.old) {
            setLeads((prev) =>
              prev.filter((lead) => lead.id !== payload.old.id),
            );

            toast.error(t("leads.notifications.leadRemoved", "Lead removed"), {
              description: t(
                "leads.notifications.leadRemovedDescription",
                "A lead has been removed from the system",
              ),
            });
          }

          // Refresh stats after any change
          setTimeout(calculateStats, 500);
        },
      )
      .subscribe((status) => {
        console.log("Dashboard subscription status:", status);
        setIsRealTimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  // Check Supabase connectivity instead of non-existent API server
  useEffect(() => {
    const checkConnectivity = async () => {
      try {
                 // Use Supabase auth status as connectivity indicator
         const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && !error) {
          setIsRealTimeConnected(true);
          setConnectionError(null);
        } else {
          setIsRealTimeConnected(false);
          setConnectionError('Authentication connection lost');
        }
      } catch (error) {
        // On any error, assume connection issues
        setIsRealTimeConnected(false);
        setConnectionError('Connection error');
        console.warn('Connectivity check failed:', error);
      }
    };

    // Check connectivity on mount
    checkConnectivity();
    
    // Check every 60 seconds (less aggressive, auth-based)
    const interval = setInterval(checkConnectivity, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Load initial data with project filtering
  useEffect(() => {
    loadLeadsData();
  }, [currentProject?.id]);

  // CRITICAL: Listen for project changes from any selector component
  useEffect(() => {
    const handleProjectChange = (event: CustomEvent) => {
      console.log(
        "LeadManagementDashboard: Project changed via event",
        event.detail,
      );
      loadingRef.current = false; // Reset loading state
      loadLeadsData(); // Reload data immediately when project changes
    };

    const handleDataInvalidated = () => {
      console.log("🗑️ LeadManagementDashboard: Data invalidated, clearing leads");
      setLeads([]); // Clear existing leads immediately
      loadingRef.current = false;
      loadLeadsData(); // Reload fresh data
    };

    const handleForceRefresh = () => {
      
      loadingRef.current = false;
      loadLeadsData();
    };

    window.addEventListener(
      "project-changed",
      handleProjectChange as EventListener,
    );
    window.addEventListener(
      "project-data-invalidated", 
      handleDataInvalidated as EventListener,
    );
    window.addEventListener(
      "force-dashboard-refresh",
      handleForceRefresh as EventListener,
    );
    
    return () => {
      window.removeEventListener(
        "project-changed",
        handleProjectChange as EventListener,
      );
      window.removeEventListener(
        "project-data-invalidated",
        handleDataInvalidated as EventListener,
      );
      window.removeEventListener(
        "force-dashboard-refresh",
        handleForceRefresh as EventListener,
      );
    };
  }, []);

  // Listen for refresh events from the unified refresh hook
  useEffect(() => {
    const handleLeadsRefresh = (event: CustomEvent) => {
      
      // Clear existing data and reload
      setLeads([]);
      setFilteredLeads([]);
      loadingRef.current = false;
      loadLeadsData();
    };

    const handleDataRefresh = (event: CustomEvent) => {
      
      // Clear existing data and reload
      setLeads([]);
      setFilteredLeads([]);
      loadingRef.current = false;
      loadLeadsData();
    };

    // Add event listeners
    window.addEventListener('leads-data-refresh', handleLeadsRefresh as EventListener);
    window.addEventListener('project-data-refresh', handleDataRefresh as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('leads-data-refresh', handleLeadsRefresh as EventListener);
      window.removeEventListener('project-data-refresh', handleDataRefresh as EventListener);
    };
  }, []);

  // Calculate stats whenever leads change
  useEffect(() => {
    calculateStats();
  }, [leads]);

  // Apply filters whenever leads or filters change
  useEffect(() => {
    applyFilters();
  }, [leads, filters]);

  const loadLeadsData = async () => {
    if (loadingRef.current) {
      
      return;
    }
    loadingRef.current = true;
    setIsLoading(true);
    
    const loadStart = Date.now();
    
    try {
      // FIXED: Pass current project ID to simpleProjectService for better caching
      const projectId = currentProject?.id;
      console.log(`CALL Loading leads for project: ${projectId ? `${currentProject.name} (${projectId})` : 'All projects'}`);
      
      // Use simpleProjectService with project ID for proper caching and filtering
      const allLeads = await simpleProjectService.getAllLeads(projectId);

      // DEMO MODE: Skip filtering to show all mock leads
      const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
      
      // ENHANCED: The service should already filter by project, but add defensive filtering
      const filteredLeads = (isDemoMode || !projectId)
        ? allLeads  // In demo mode or "All projects", show all leads
        : allLeads.filter((lead) => {
            const hasProjectMatch =
              lead.project_id === projectId ||
              lead.current_project_id === projectId;
            return hasProjectMatch;
          });

      // Transform data to include full name and ensure type compatibility
      const transformedLeads = filteredLeads.map((lead) => ({
        ...lead,
        // Demo and database rows carry first/last name only; the table and search read `name`
        name: lead.name || getLeadName(lead),
        // Computed properties using utility functions
        displayName: getLeadName(lead),
        displayTemperature: getLeadTemperature(lead),
        displayCompany: getLeadCompany(lead),
        heat: lead.heat || getHeatLevelFromTemperature(lead.temperature || 0),
      }));

      setLeads(transformedLeads as Lead[]);

      const loadTime = Date.now() - loadStart;
      console.log(
        `Loaded ${transformedLeads.length} leads for project: ${currentProject?.name || "All"} (${loadTime}ms)`,
      );
      
      // Log performance for zero-data scenarios
      if (transformedLeads.length === 0) {
        console.log(`FAST Fast zero-leads response: ${loadTime}ms`);
      }
    } catch (error) {
      console.error("Unexpected error loading leads:", error);
      toast.error(
        t(
          "leads.errors.unexpectedError",
          "An unexpected error occurred while loading leads",
        ),
      );
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  };

  const summary = useLeadSummary(leads);

  const calculateStats = useCallback(() => {
    const now = new Date();
    const stats: DashboardStats = {
      totalLeads: leads.length,
      newLeads: leads.filter((lead) => lead.state === "new_lead" || lead.status === "new").length,
      hotLeads: 0, // Will calculate based on confidence score
      convertedLeads: leads.filter((lead) => 
        lead.state === "qualified" || lead.status === "purchase_ready"
      ).length,
      conversionRate: 0,
      averageResponseTime: 0,
      lastUpdated: now.toISOString(),
    };

    // Calculate hot leads based on confidence score
    stats.hotLeads = leads.filter((lead) => {
      const heatLevel = getHeatLevelFromTemperature(lead.temperature || 0);
      return ["HOT", "BURNING", "WHITE_HOT"].includes(heatLevel);
    }).length;

    // Calculate conversion rate
    if (stats.totalLeads > 0) {
      stats.conversionRate = (stats.convertedLeads / stats.totalLeads) * 100;
    }

    // Calculate real average response time from lead data
    const leadsWithResponseTime = leads.filter(
      (lead) =>
        lead.created_at &&
        lead.updated_at &&
        new Date(lead.updated_at) > new Date(lead.created_at),
    );

    if (leadsWithResponseTime.length > 0) {
      const totalResponseTime = leadsWithResponseTime.reduce((sum, lead) => {
        const created = new Date(lead.created_at || "").getTime();
        const updated = new Date(lead.updated_at || "").getTime();
        const diffHours = (updated - created) / (1000 * 60 * 60);
        return sum + diffHours;
      }, 0);

      stats.averageResponseTime =
        totalResponseTime / leadsWithResponseTime.length;
    } else {
      // If no real data available, use a realistic default
      stats.averageResponseTime = 2.5; // 2.5 hours default
    }

    setDashboardStats(stats);
  }, [leads]);

  const applyFilters = useCallback(() => {
    let filtered = [...leads];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.name?.toLowerCase().includes(searchLower) ||
          lead.company?.toLowerCase().includes(searchLower),
      );
    }

    // State filter
    if (filters.state !== "all") {
      filtered = filtered.filter((lead) => lead.state === filters.state);
    }

    // Heat filter (based on confidence score)
    if (filters.heat !== "all") {
      filtered = filtered.filter((lead) => {
        const heatLevel = getHeatLevelFromTemperature(lead.temperature || 0);
        return heatLevel === filters.heat;
      });
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const cutoffDate = new Date();

      switch (filters.dateRange) {
        case "today":
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(
        (lead) => new Date(lead.created_at || "") >= cutoffDate,
      );
    }

    setFilteredLeads(filtered);
  }, [leads, filters]);

  const handleFilterChange = (key: keyof LeadFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await refreshLeads({ showSuccessToast: true });
    } finally {
      setIsManualRefreshing(false);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      const { error } = await supabase.from("leads").delete().eq("id", leadId);

      if (error) throw error;

      setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
      toast.success(
        t("leads.notifications.leadDeleted", "Lead deleted successfully"),
      );
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error(t("leads.errors.failedToDelete", "Failed to delete lead"));
    }
  };

  const handleLeadUpdate = (updatedLead: Lead) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead)),
    );
    setSelectedLead(updatedLead);
  };

  const handleLeadFormSuccess = () => {
    setIsLeadFormOpen(false);
    setLeadForEdit(null);
    loadLeadsData(); // Refresh the data
  };

  const handleSendMessage = (lead: Lead) => {
    navigate(`/messages?lead=${encodeURIComponent(lead.id)}`);
  };

  // Convert numeric status to string status
  const getStatusFromNumeric = (status: number | string | null): string => {
    if (typeof status === 'string') return status;
    if (status === null || status === undefined) return 'new_lead';
    
    switch (status) {
      case 0:
        return 'new_lead';
      case 1:
        return 'contacted';
      case 2:
        return 'information_gathering';
      case 3:
        return 'qualified';
      case 4:
        return 'proposal';
      case 5:
        return 'negotiation';
      case 6:
        return 'closed_won';
      case 7:
        return 'closed_lost';
      case 8:
        return 'archived';
      default:
        return 'new_lead';
    }
  };

  const getStatusVariant = (status: string | number | null) => {
    const statusStr = getStatusFromNumeric(status);
    
    switch (statusStr) {
      case 'new_lead':
        return 'outline';
      case 'contacted':
        return 'secondary';
      case 'information_gathering':
        return 'outline';
      case 'demo_scheduled':
        return 'outline';
      case 'qualified':
        return 'default';
      case 'proposal':
        return 'outline';
      case 'negotiation':
        return 'outline';
      case 'closed_won':
        return 'secondary'; // Fixed: Using valid Badge variant
      case 'closed_lost':
        return 'destructive';
      case 'archived':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getDisplayStatus = (status: string | number | null) => {
    const statusStr = getStatusFromNumeric(status);
    
    switch (statusStr) {
      case 'new_lead':
        return t("leads.states.new", "New");
      case 'contacted':
        return t("leads.states.contacted", "Contacted");
      case 'information_gathering':
        return t("leads.states.infoGathering", "Info Gathering");
      case 'demo_scheduled':
        return t("leads.states.demoScheduled", "Demo Scheduled");
      case 'qualified':
        return t("leads.states.qualified", "Qualified");
      case 'proposal':
        return t("leads.states.proposal", "Proposal");
      case 'negotiation':
        return t("leads.states.negotiation", "Negotiation");
      case 'closed_won':
        return t("leads.states.closedWon", "Closed Won");
      case 'closed_lost':
        return t("leads.states.closedLost", "Closed Lost");
      case 'archived':
        return t("leads.states.archived", "Archived");
      default:
        return statusStr;
    }
  };

  const getTemperatureVariant = (heat: string | number | null) => {
    // Convert numeric temperature to string heat level if needed
    const heatLevel = typeof heat === 'number' ? getHeatLevelFromTemperature(heat) : heat;
    
    switch (heatLevel) {
      case 'FROZEN':
        return 'outline';
      case 'ICE_COLD':
        return 'secondary';
      case 'COLD':
        return 'outline';
      case 'COOL':
        return 'outline';
      case 'WARM':
        return 'outline';
      case 'HOT':
        return 'default';
      case 'BURNING':
        return 'destructive';
      case 'WHITE_HOT':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Seven-step heat scale (FROZEN..WHITE_HOT) used by this table's filter and stats
  const getHeatLevelFromTemperature = getHeatScaleLevel;

  const getDisplayTemperature = (heat: string | number | null) => {
    // Convert numeric temperature to string heat level if needed
    const heatLevel = typeof heat === 'number' ? getHeatLevelFromTemperature(heat) : heat;
    
    switch (heatLevel) {
      case 'FROZEN':
        return t("leads.heatLevels.frozen", "Frozen (0-10%)");
      case 'ICE_COLD':
        return t("leads.heatLevels.iceCold", "Ice Cold (11-20%)");
      case 'COLD':
        return t("leads.heatLevels.cold", "Cold (21-35%)");
      case 'COOL':
        return t("leads.heatLevels.cool", "Cool (36-50%)");
      case 'WARM':
        return t("leads.heatLevels.warm", "Warm (51-65%)");
      case 'HOT':
        return t("leads.heatLevels.hot", "Hot (66-80%)");
      case 'BURNING':
        return t("leads.heatLevels.burning", "Burning (81-95%)");
      case 'WHITE_HOT':
        return t("leads.heatLevels.whiteHot", "White Hot (96-100%)");
      default:
        return heatLevel || 'Unknown';
    }
  };

  const exportLeads = async () => {
    try {
      const csvContent = [
        "Name,Phone,Company,State,Heat Level,Created",
        ...filteredLeads.map((lead) => {
          const confidenceScore = lead.lead_metadata?.ai_analysis?.lead_qualification?.confidence_score;
          const heatLevel = getHeatLevelFromTemperature(lead.temperature || 0);
          return [
            lead.name || "",
            lead.phone || "",
            lead.company || "",
            lead.state || "",
            heatLevel || "FROZEN",
            new Date(lead.created_at || "").toLocaleDateString(),
          ].join(",");
        }),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success(
        t("leads.notifications.leadsExported", "Leads exported successfully"),
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error(t("leads.errors.failedToExport", "Failed to export leads"));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      isHebrew ? "he-IL" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  };

  const getHeatBadge = (lead: Lead) => {
    const heatLevel = getHeatLevelFromTemperature(lead.temperature || 0);
    const heatConfig = HEAT_LEVEL_CONFIG[heatLevel as keyof typeof HEAT_LEVEL_CONFIG];
    
    return (
      <Badge variant="outline" className="gap-1">
        <span className="text-sm">{heatConfig?.emoji || '❓'}</span>
        <span>{heatConfig?.label || heatLevel}</span>
      </Badge>
    );
  };

  const getStateBadge = (state: string) => {
    const colors = {
      new: "bg-blue-500",
      contacted: "bg-yellow-500",
      qualified: "bg-orange-500",
      proposal: "bg-purple-500",
      negotiation: "bg-indigo-500",
      closed_won: "bg-green-500",
      closed_lost: "bg-red-500",
      archived: "bg-gray-500",
    };

    return (
      <Badge variant="outline" className="gap-1">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            colors[state as keyof typeof colors] || "bg-gray-500",
          )}
        />
        {LEAD_STATES.find((s) => s.value === state)?.label || state}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div
          className={cn("text-center", isHebrew && "font-hebrew")}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {t("leads.loading", "Loading dashboard data...")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("space-y-6", isHebrew && "font-hebrew")}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className={textStart()}>
          <h1 className="text-2xl font-semibold leading-8 tracking-[-0.02em] text-foreground">
            {t("title", "Leads")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "subtitle",
              "Search, filter and open a lead to see its BANT score and conversation",
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Real-time status: one quiet pill, a dot only when live */}
          <span
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs font-medium text-subtle"
            role="status"
          >
            {isRealTimeConnected || import.meta.env.VITE_DEMO_MODE === "true" ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-moss-500" aria-hidden="true" />
                {import.meta.env.VITE_DEMO_MODE === "true" ? t("connection.liveDemo", "Live demo") : t("connection.live", "Live")}
              </>
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                {t("connection.offline", "Offline")}
              </>
            )}
            <span className="text-muted-foreground">·</span>
            <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <span className="tabular-nums">{formatDate(dashboardStats.lastUpdated)}</span>
          </span>

          {/* Actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isManualRefreshing || isAutoRefreshing}
            aria-label={t("common.refresh", "Refresh")}
          >
            <RefreshCw
              className={cn("h-4 w-4", (isManualRefreshing || isAutoRefreshing) && "animate-spin")}
            />
          </Button>

          <Button variant="outline" size="sm" onClick={exportLeads}>
            <Download className="h-4 w-4" />
            {t("pages.leadManagement.export", "Export")}
          </Button>

          <Button size="sm" onClick={() => setIsLeadFormOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("pages.leadManagement.addLead", "Add Lead")}
          </Button>
        </div>
      </div>

      {/* Stats: one strip, hairline dividers, mono figures */}
      <Card className="grid grid-cols-2 lg:grid-cols-4 [&>*]:border-border max-lg:[&>*:nth-child(n+3)]:border-t max-lg:[&>*:nth-child(even)]:border-s lg:[&>*+*]:border-s">
        {[
          { label: t("pages.leads.totalLeads", "Total Leads"), value: summary?.leads ?? dashboardStats.totalLeads, note: t("pages.leadManagement.allLeadsInSystem", "All leads in the system") },
          { label: t("stats.qualified", "Qualified"), value: summary?.qualified ?? dashboardStats.convertedLeads, note: t("stats.qualifiedDesc", "BANT qualified") },
          { label: t("pages.leads.hotLeads", "Hot Leads"), value: summary?.hot ?? dashboardStats.hotLeads, note: t("pages.leadManagement.highPriorityLeads", "High priority leads"), hot: true },
          { label: t("pages.leads.conversionRate", "Conversion Rate"), value: `${summary?.conversionRate ?? 0}%`, note: summary ? t("stats.meetingsBooked", "{{count}} meetings booked", { count: summary.meetings }) : t("widgets.conversionsCompleted.conversionRate", "Conversion rate") },
        ].map(({ label, value, note, hot }) => (
          <div key={label} className="px-4 py-3 md:px-5">
            <p className={cn("text-[13px] font-medium text-subtle", textStart())}>{label}</p>
            <p className={cn("num mt-0.5 text-[26px] font-semibold leading-8", hot ? "text-ember-600 dark:text-ember-300" : "text-foreground")}>
              {value}
            </p>
            <p className="text-xs text-muted-foreground">{note}</p>
          </div>
        ))}
      </Card>

      {/* Real-time Updates Feed */}
      {realtimeUpdates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle
              className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}
            >
              <Database className="h-5 w-5" />
              {t("leads.sections.realTimeUpdates", "Real-time Updates")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {realtimeUpdates.slice(0, 5).map((update, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {update.type === "insert" && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {update.type === "update" && (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  {update.type === "delete" && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="capitalize">{update.type}</span>
                  <span className="font-medium">
                    {update.lead.first_name} {update.lead.last_name}
                  </span>
                  <span className="text-muted-foreground">
                    {formatDate(update.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Removed duplicate filters section - filters are now only in the Leads tab */}

      {/* Enhanced Tabs with Queue Management */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leads">
            {t("pages.leads.leadsCount", "Leads")}
          </TabsTrigger>
          <TabsTrigger value="queue">
            {t("pages.leads.queueManagement", "Queue Management")}
          </TabsTrigger>
        </TabsList>

        {/* Leads Table Tab */}
        <TabsContent value="leads" className="space-y-4">
          {/* Filters */}
          <div role="search" aria-label={t("pages.leads.filters", "Filters")} className="rounded-[10px] border border-border bg-surface p-3">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
                <div className="col-span-2 space-y-1 lg:col-span-1">
                  <label className={cn("text-xs font-medium text-subtle", textStart())}>
                    {t("pages.leads.search", "Search")}
                  </label>
                  <div className="relative">
                    <Search
                      className={cn(
                        "pointer-events-none absolute top-2.5 z-10 h-4 w-4 text-muted-foreground",
                        isRTL ? "right-2" : "left-2",
                      )}
                    />
                    <Input
                      placeholder={t("pages.leads.searchPlaceholder", "Search leads...")}
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      className={isRTL ? "pr-8" : "pl-8"}
                      dir={isRTL ? "rtl" : "ltr"}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={cn("text-xs font-medium text-subtle", textStart())}>
                    {t("pages.leads.status", "Status")}
                  </label>
                  <Select
                    value={filters.state}
                    onValueChange={(value) => handleFilterChange("state", value)}
                  >
                    <SelectTrigger aria-label={t("pages.leads.status", "Status")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATES.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className={cn("text-xs font-medium text-subtle", textStart())}>
                    {t("pages.leads.heatLevel", "Heat Level")}
                  </label>
                  <Select
                    value={filters.heat}
                    onValueChange={(value) => handleFilterChange("heat", value)}
                  >
                    <SelectTrigger aria-label={t("pages.leads.heatLevel", "Heat Level")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HEAT_LEVELS.map((heat) => (
                        <SelectItem key={heat.value} value={heat.value}>
                          <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                            <div className={cn("w-2 h-2 rounded-full", heat.color)} />
                            {heat.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className={cn("text-xs font-medium text-subtle", textStart())}>
                    {t("pages.leads.dateRange", "Date Range")}
                  </label>
                  <Select
                    value={filters.dateRange}
                    onValueChange={(value) => handleFilterChange("dateRange", value)}
                  >
                    <SelectTrigger aria-label={t("pages.leads.dateRange", "Date Range")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("common.all", "All")}</SelectItem>
                      <SelectItem value="today">{t("common.today", "Today")}</SelectItem>
                      <SelectItem value="week">{t("common.thisWeek", "This Week")}</SelectItem>
                      <SelectItem value="month">{t("common.thisMonth", "This Month")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
          </div>

          {/* Enhanced Leads Table with HubSpot-style Bulk Selection */}
          <Card>
            <CardHeader>
              <div className={cn("flex items-center justify-between", isRTL ? "flex-row-reverse" : "flex-row")}>
                <CardTitle className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                  <Users className="h-5 w-5" />
                  {t("pages.leads.leadsTable", "Leads")} ({filteredLeads.length === leads.length && summary ? summary.leads : filteredLeads.length})
                  {filteredLeads.length === leads.length && summary && summary.leads > leads.length && (
                    <span className="text-sm font-normal text-muted-foreground">
                      {t("stats.sampleShown", "Showing {{shown}} sample leads", { shown: leads.length })}
                    </span>
                  )}
                </CardTitle>
                
                {/* HubSpot-style Bulk Action Controls */}
                {bulkSelection.isSelectAllVisible && (
                  <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                    <span className="text-sm text-muted-foreground">
                      {Array.from(bulkSelection.selectedLeads).length} selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectAll('filtered')}
                    >
                      {bulkSelection.selectAllMode === 'filtered' ? 'Deselect All' : 'Select All Filtered'}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            
            {/* HubSpot-style Preview Bar */}
            {showPreviewBar && queuePreview && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b px-6 py-3">
                <div className={cn("flex items-center justify-between", isRTL ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn("flex items-center gap-4", isRTL ? "flex-row-reverse" : "flex-row")}>
                    <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                      <Play className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        {queuePreview.selectedCount} leads selected for queue
                      </span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      Estimated send: {queuePreview.estimatedSendTime.toLocaleTimeString()}
                    </span>
                    {queuePreview.conflicts.length > 0 && (
                      <>
                        <Separator orientation="vertical" className="h-4" />
                        <div className={cn("flex items-center gap-1 text-amber-700 dark:text-amber-300", isRTL ? "flex-row-reverse" : "flex-row")}>
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">{queuePreview.conflicts.length} conflicts</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                    <Button
                      size="sm"
                      onClick={() => handleBulkQueueAction('queue')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Queue Messages
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkQueueAction('schedule')}
                    >
                      <CalendarDays className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-32 p-6" data-testid="leads-loading">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">{t("common.loadingLeads", "Loading leads...")}</span>
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="text-center py-8 p-6" data-testid="leads-empty-state">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {t("pages.leads.noLeads", "No leads found")}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {t("pages.leads.noLeadsDescription", "No leads match the current filters.")}
                  </p>
                  <Button onClick={() => setIsLeadFormOpen(true)}>
                    <Plus className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    {t("common.addLead", "Add Lead")}
                  </Button>
                </div>
              ) : (
                <div className="relative overflow-x-auto">
                  {/* relative: the header's sr-only labels are absolutely positioned and otherwise
                      escape the scroller, widening the phone layout to 481 px */}
                  <table className="w-full text-[13.5px]" data-testid="leads-table">
                    <thead className="bg-surface-sunken text-xs text-muted-foreground">
                      <tr className="border-b border-border">
                        <th className="w-10 p-3">
                          <Checkbox
                            size="table"
                            aria-label="Select all leads"
                            checked={
                              bulkSelection.selectAllMode === 'filtered' ||
                              (filteredLeads.length > 0 && filteredLeads.every(lead => bulkSelection.selectedLeads.has(lead.id)))
                                ? true
                                : bulkSelection.selectedLeads.size > 0 &&
                                  bulkSelection.selectAllMode === 'none' &&
                                  !filteredLeads.every(lead => bulkSelection.selectedLeads.has(lead.id))
                                ? "indeterminate"
                                : false
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleSelectAll('filtered');
                              } else {
                                setBulkSelection({
                                  selectedLeads: new Set(),
                                  selectAllMode: 'none',
                                  isSelectAllVisible: false,
                                });
                              }
                            }}
                          />
                        </th>
                        <th scope="col" className={cn("p-3 font-medium", textStart())}>{t("leads.fields.name", "Name")}</th>
                        <th scope="col" className={cn("hidden p-3 font-medium md:table-cell", textStart())}>{t("leads.fields.contact", "Contact")}</th>
                        <th scope="col" className={cn("p-3 font-medium", textStart())}>{t("leads.fields.temperature", "Temperature")}</th>
                        <th scope="col" className={cn("hidden p-3 font-medium sm:table-cell", textStart())}>{t("leads.fields.bant", "BANT Status")}</th>
                        <th scope="col" className={cn("hidden p-3 font-medium 2xl:table-cell", textStart())}>{t("leads.fields.status", "Status")}</th>
                        <th scope="col" className={cn("hidden p-3 font-medium xl:table-cell", textStart())}>{t("leads.fields.interactions", "Interactions")}</th>
                        <th scope="col" className={cn("hidden p-3 font-medium 2xl:table-cell", textStart())}>{t("leads.fields.created", "Created")}</th>
                        <th scope="col" className="w-12 p-3">
                          <span className="sr-only">{t("common.actions", "Actions")}</span>
                        </th>
                      </tr>
                    </thead>

                    <tbody data-testid="leads-table-body" className="divide-y divide-border">
                      {filteredLeads.map((lead) => {
                        const name = leadFullName(lead);
                        const flags = bantFlags(lead);
                        return (
                        <tr
                          key={lead.id}
                          className={cn(
                            "lead cursor-pointer transition-colors duration-[120ms] hover:bg-accent/50",
                            bulkSelection.selectedLeads.has(lead.id) && "bg-ember-50 dark:bg-ember-950/40",
                          )}
                          data-testid={`lead-row-${lead.id}`}
                          onClick={(e) => {
                            if ((e.target as HTMLElement).closest("button, a, [role=checkbox], [role=menuitem]")) return;
                            setSelectedLead(lead);
                            setIsLeadPropertiesOpen(true);
                          }}
                        >
                          <td className="p-3 align-middle">
                            <Checkbox
                              size="table"
                              aria-label={`Select ${lead.name}`}
                              checked={bulkSelection.selectedLeads.has(lead.id)}
                              onCheckedChange={(checked) => handleLeadSelection(lead.id, !!checked)}
                            />
                          </td>

                          <td className="p-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <PersonAvatar name={name} />
                              <div className="min-w-0">
                                <button
                                  type="button"
                                  className="block max-w-[220px] truncate rounded-sm text-start font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  onClick={() => {
                                    setSelectedLead(lead);
                                    setIsLeadPropertiesOpen(true);
                                  }}
                                  title={t("leads.actions.clickToView", "Click to view lead properties")}
                                  data-testid={`lead-name-${lead.id}`}
                                >
                                  {lead.name}
                                </button>
                                <p className="truncate text-xs text-muted-foreground">
                                  {lead.company || lead.phone}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="hidden p-3 md:table-cell">
                            {lead.phone && <p className="num text-[13px]">{lead.phone}</p>}
                            {lead.email && <p className="max-w-[200px] truncate text-xs text-muted-foreground">{lead.email}</p>}
                          </td>

                          <td className="p-3">
                            <HeatTag temperature={heatWord(lead.temperature)} />
                          </td>

                          <td className="hidden p-3 sm:table-cell">
                            <BantChip score={flags.filter(Boolean).length} met={flags} />
                          </td>

                          <td className="hidden p-3 2xl:table-cell">
                            <Badge variant={getStatusVariant(lead.status)} className="whitespace-nowrap text-xs font-medium">
                              {getDisplayStatus(lead.status)}
                            </Badge>
                            {lead.state && <p className="mt-1 text-xs text-muted-foreground">{String(lead.state).replace(/_/g, " ")}</p>}
                          </td>

                          <td className="hidden p-3 xl:table-cell">
                            <p className="num font-medium">{lead.interaction_count || 0}</p>
                            {lead.last_interaction && (
                              <p className="text-xs text-muted-foreground">{relativeDay(lead.last_interaction)}</p>
                            )}
                          </td>

                          <td className="num hidden p-3 text-muted-foreground 2xl:table-cell">
                            {lead.created_at ? relativeDay(lead.created_at) : "-"}
                          </td>

                          <td className="p-1 sm:p-3">
                            <div className="flex items-center justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    className="h-8 w-8 p-0 touch-manipulation"
                                    data-testid={`lead-actions-${lead.id}`}
                                  >
                                    <span className="sr-only">
                                      {t("common.openMenu", "Open menu")}
                                    </span>
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                  <DropdownMenuLabel>
                                    {t("common.actions", "Actions")}
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedLead(lead);
                                      setIsLeadPropertiesOpen(true);
                                    }}
                                    className="flex items-center"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    {t("leads.actions.view", "View Details")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setLeadForEdit(lead);
                                      setIsLeadFormOpen(true);
                                    }}
                                    className="flex items-center"
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    {t("leads.actions.edit", "Edit Lead")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleSendMessage(lead)}
                                    className="flex items-center"
                                  >
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    {t("leads.actions.message", "Send Message")}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteLead(lead.id)}
                                    className="flex items-center text-red-600 dark:text-red-400"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t("leads.actions.delete", "Delete Lead")}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Queue Management Tab - Task #16 Implementation */}
        <TabsContent value="queue" className="space-y-4">
          <div className="grid gap-6">
            {/* Daily Processing Overview */}
            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                  <Target className="h-5 w-5" />
                  {t("pages.leadManagement.dailyProcessing", "Daily Lead Processing")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {leads.filter(lead => {
                        const today = new Date();
                        const updatedAt = new Date(lead.updated_at);
                        return updatedAt.toDateString() === today.toDateString() && 
                               lead.processing_state === 'completed';
                      }).length}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      {t("pages.leadManagement.processedToday", "Processed Today")}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Target: 100 leads/day
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600">
                      {leads.filter(lead => 
                        ['pending', 'queued'].includes(lead.processing_state || '')
                      ).length}
                    </div>
                    <div className="text-sm text-orange-600 font-medium">
                      {t("pages.leadManagement.queuedForTomorrow", "Queued for Tomorrow")}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Ready for processing
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {Math.round(
                        (leads.filter(lead => {
                          const today = new Date();
                          const updatedAt = new Date(lead.updated_at);
                          return updatedAt.toDateString() === today.toDateString() && 
                                 lead.processing_state === 'completed';
                        }).length / 100) * 100
                      )}%
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      {t("pages.leadManagement.dailyTarget", "Daily Target")}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      100 leads goal
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className={cn("flex justify-between items-center mb-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                    <span className={cn("text-sm font-medium", textStart())}>
                      {t("pages.leadManagement.dailyProgress", "Daily Processing Progress")}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {leads.filter(lead => {
                        const today = new Date();
                        const updatedAt = new Date(lead.updated_at);
                        return updatedAt.toDateString() === today.toDateString() && 
                               lead.processing_state === 'completed';
                      }).length}/100
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(
                      (leads.filter(lead => {
                        const today = new Date();
                        const updatedAt = new Date(lead.updated_at);
                        return updatedAt.toDateString() === today.toDateString() && 
                               lead.processing_state === 'completed';
                      }).length / 100) * 100, 
                      100
                    )} 
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Queue Management Actions */}
            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                  <Activity className="h-5 w-5" />
                  {t("pages.leadManagement.queueActions", "Queue Management Actions")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className={cn("h-auto p-4 justify-start", isRTL ? "flex-row-reverse" : "flex-row")}
                    onClick={async () => {
                      try {
                        // Use LeadProcessingService to prepare tomorrow's queue
                        const result = await LeadProcessingService.prepareTomorrowQueue();
                        
                        if (result.success) {
                          toast.success(
                            t("pages.leadManagement.queuePrepared", "Queue Prepared Successfully"),
                            { description: `${result.message}. Queued ${result.queued} leads for processing.` }
                          );
                          // Refresh the data to show updated queue counts
                          await loadLeadsData();
                        } else {
                          toast.warning(
                            t("pages.leadManagement.queuePreparationFailed", "Queue Preparation Failed"),
                            { description: result.message }
                          );
                        }
                      } catch (error) {
                        console.error('Error preparing queue:', error);
                        toast.error(
                          t("pages.leadManagement.queueError", "Queue Error"),
                          { description: "An error occurred while preparing the queue" }
                        );
                      }
                    }}
                  >
                    <Calendar className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
                    <div className={cn(textStart(), "flex-1")}>
                      <div className={cn("font-medium", textStart())}>
                        {t("pages.leadManagement.prepareTomorrow", "Prepare Tomorrow's Queue")}
                      </div>
                      <div className={cn("text-xs text-muted-foreground", textStart())}>
                        {t("pages.leadManagement.queueDescription", "Queue next 100 leads for automated processing")}
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className={cn("h-auto p-4 justify-start", isRTL ? "flex-row-reverse" : "flex-row")}
                    onClick={async () => {
                      try {
                        // Use LeadProcessingService to start automated processing
                        const result = await LeadProcessingService.startAutomatedProcessing();
                        
                        if (result.success) {
                          toast.success(
                            t("pages.leadManagement.automationStarted", "Automation Started"),
                            { description: `${result.message}. Processing ${result.processing} leads.` }
                          );
                          // Refresh the data to show updated processing states
                          await loadLeadsData();
                          
                          // Auto-refresh in 30 seconds to show completed processing
                          setTimeout(async () => {
                            await loadLeadsData();
                            toast.info(
                              t("pages.leadManagement.processingComplete", "Processing Complete"),
                              { description: "Lead processing has been completed successfully" }
                            );
                          }, 35000);
                        } else {
                          toast.error(
                            t("pages.leadManagement.automationFailed", "Automation Failed"),
                            { description: result.message }
                          );
                        }
                      } catch (error) {
                        console.error('Error starting automation:', error);
                        toast.error(
                          t("pages.leadManagement.automationError", "Automation Error"),
                          { description: "An error occurred while starting automation" }
                        );
                      }
                    }}
                  >
                    <Zap className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
                    <div className={cn(textStart(), "flex-1")}>
                      <div className={cn("font-medium", textStart())}>
                        {t("pages.leadManagement.startAutomation", "Start Automation")}
                      </div>
                      <div className={cn("text-xs text-muted-foreground", textStart())}>
                        {t("pages.leadManagement.automationDescription", "Process queued leads automatically")}
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className={cn("h-auto p-4 justify-start", isRTL ? "flex-row-reverse" : "flex-row")}
                    onClick={async () => {
                      try {
                        // Use LeadProcessingService to export queue data
                        const result = await LeadProcessingService.exportQueueData();
                        
                        if (result.success) {
                          toast.success(
                            t("pages.leadManagement.exportComplete", "Export Complete"),
                            { description: result.message }
                          );
                        } else {
                          toast.error(
                            t("pages.leadManagement.exportFailed", "Export Failed"),
                            { description: result.message }
                          );
                        }
                      } catch (error) {
                        console.error('Error exporting queue data:', error);
                        toast.error(
                          t("pages.leadManagement.exportError", "Export Error"),
                          { description: "An error occurred while exporting queue data" }
                        );
                      }
                    }}
                  >
                    <Download className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
                    <div className={cn(textStart(), "flex-1")}>
                      <div className={cn("font-medium", textStart())}>
                        {t("pages.leadManagement.exportQueue", "Export Queue Data")}
                      </div>
                      <div className={cn("text-xs text-muted-foreground", textStart())}>
                        {t("pages.leadManagement.exportDescription", "Download queue data as CSV file")}
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Queued Leads Table */}
            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                  <Users className="h-5 w-5" />
                  {t("pages.leadManagement.queuedLeads", "Queued Leads")}
                  <Badge variant="secondary">
                    {leads.filter(lead => ['pending', 'queued'].includes(lead.processing_state || '')).length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leads.filter(lead => ['pending', 'queued'].includes(lead.processing_state || '')).length === 0 ? (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {t("pages.leadManagement.noQueuedLeads", "No leads currently queued for processing")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leads
                      .filter(lead => ['pending', 'queued'].includes(lead.processing_state || ''))
                      .slice(0, 10) // Show first 10 queued leads
                      .map((lead) => (
                      <div 
                        key={lead.id} 
                        className={cn(
                          "flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors",
                          isRTL ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        <div className={cn("flex items-center gap-3", isRTL ? "flex-row-reverse" : "flex-row")}>
                          <div className="text-sm font-medium">
                            {getLeadName(lead)}
                          </div>
                          {lead.phone_number && (
                            <div className="text-xs text-muted-foreground">
                              {lead.phone_number}
                            </div>
                          )}
                        </div>
                        <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                          <Badge variant={lead.processing_state === 'queued' ? 'default' : 'outline'}>
                            {lead.processing_state || 'pending'}
                          </Badge>
                          {lead.heat_level && (
                            <Badge variant="secondary" className={getTemperatureVariant(lead.temperature || '')}>
                              {getDisplayTemperature(lead.temperature || '')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {leads.filter(lead => ['pending', 'queued'].includes(lead.processing_state || '')).length > 10 && (
                      <div className="text-center text-sm text-muted-foreground pt-2">
                        +{leads.filter(lead => ['pending', 'queued'].includes(lead.processing_state || '')).length - 10} more leads in queue
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Processing States Overview */}
            <Card>
              <CardHeader>
                <CardTitle className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                  <Database className="h-5 w-5" />
                  {t("pages.leadManagement.processingStates", "Processing States")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['pending', 'queued', 'active', 'completed', 'failed', 'archived'].map((state) => {
                    const count = leads.filter(lead => lead.processing_state === state).length;
                    const percentage = leads.length > 0 ? (count / leads.length) * 100 : 0;
                    
                    return (
                      <div key={state} className={cn("flex items-center justify-between p-3 border rounded-lg", isRTL ? "flex-row-reverse" : "flex-row")}>
                        <div className={cn("flex items-center gap-3", isRTL ? "flex-row-reverse" : "flex-row")}>
                          <Badge variant={
                            state === 'completed' ? 'default' :
                            state === 'active' ? 'secondary' :
                            state === 'failed' ? 'destructive' :
                            'outline'
                          }>
                            {state.charAt(0).toUpperCase() + state.slice(1)}
                          </Badge>
                          <span className={cn("text-sm font-medium", textStart())}>
                            {t(`pages.leadManagement.state.${state}`, state)}
                          </span>
                        </div>
                        <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                          <span className="text-sm font-bold">{count}</span>
                          <span className="text-xs text-muted-foreground">
                            ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


      </Tabs>

      {/* Lead drawer */}
      <LeadDrawer
        lead={selectedLead}
        open={isLeadPropertiesOpen}
        onClose={() => {
          setIsLeadPropertiesOpen(false);
          setSelectedLead(null);
        }}
        onEdit={(lead) => {
          setLeadForEdit(lead);
          setIsLeadFormOpen(true);
          setIsLeadPropertiesOpen(false);
        }}
        onMessage={(lead) => handleSendMessage(lead)}
      />

      {/* Lead Form Modal */}
      <LeadForm
        open={isLeadFormOpen}
        onClose={() => {
          setIsLeadFormOpen(false);
          setLeadForEdit(null);
        }}
        onSuccess={handleLeadFormSuccess}
        lead={leadForEdit}
      />

      {/* Queue Preview Bar - HubSpot Style */}
      {bulkSelection.selectedLeads.size > 0 && queuePreview && (
        <QueuePreviewBar
          preview={queuePreview}
          onQueue={() => handleBulkQueueAction('queue')}
          onSchedule={() => handleBulkQueueAction('schedule')}
          onRemove={() => handleBulkQueueAction('remove')}
          onCancel={() => setBulkSelection({
            selectedLeads: new Set(),
            selectAllMode: 'none',
            isSelectAllVisible: false,
          })}
          loading={isLoading}
          className="fixed bottom-4 left-4 right-4 z-50"
        />
      )}
    </div>
  );
};

export default LeadManagementDashboard;
