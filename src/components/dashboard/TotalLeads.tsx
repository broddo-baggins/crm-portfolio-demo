// @ts-nocheck
// TEMP: TypeScript compatibility issues - systematic fix needed

import React, { useState, useEffect, useRef } from "react";
import { Users, FolderOpen, RefreshCw } from "lucide-react";
import { DashboardWidget } from "@/components/shared";
import { simpleProjectService } from "@/services/simpleProjectService";
import { useProject } from "@/context/ProjectContext";
import { useAuth } from "@/context/ClientAuthContext";
import { ProgressWithLoading } from "@/components/ui/progress-with-loading";

const TotalLeads: React.FC = () => {
  const [leadData, setLeadData] = useState({
    totalLeads: 0,
    previousPeriod: 0,
    isLoading: true,
    hasProject: false,
    error: null as string | null,
  });

  const { currentProject } = useProject();
  const { user, isAuthenticated } = useAuth();
  const loadingRef = useRef(false);

  // TOOL DEBUG: Enhanced logging for troubleshooting
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('SECURITY [TotalLeads] Auth state:', {
        isAuthenticated,
        hasUser: !!user,
        currentProject: currentProject?.name,
        projectId: currentProject?.id?.substring(0, 8)
      });
    }
  }, [isAuthenticated, user, currentProject]);

  useEffect(() => {
    const loadLeadData = async () => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      
      try {
        // TOOL CRITICAL: Wait for authentication before loading data
        if (!isAuthenticated || !user) {
          console.log('WAIT [TotalLeads] Waiting for authentication...');
          setLeadData({
            totalLeads: 0,
            previousPeriod: 0,
            isLoading: true,
            hasProject: false,
            error: 'Waiting for authentication...'
          });
          loadingRef.current = false;
          return;
        }

        if (!currentProject?.id) {
          // No project selected - show appropriate message
          setLeadData({
            totalLeads: 0,
            previousPeriod: 0,
            isLoading: false,
            hasProject: false,
            error: null,
          });
          loadingRef.current = false;
          return;
        }

        // TOOL ENHANCED: Use authenticated data access
        
        const fastCheckStart = Date.now();
        
        // Get all leads with authentication context
        const leads = await simpleProjectService.getAllLeads();
        
        // TOOL ENHANCED: Filter with detailed logging for debugging
        const projectLeads = leads?.filter((lead) => {
          const hasProjectMatch = 
            lead.project_id === currentProject.id ||
            lead.current_project_id === currentProject.id;
          
          // Debug logging for first few leads in dev mode
          if (import.meta.env.DEV && leads.length < 5) {
            const leadName = lead.name || 
              `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 
              'Unnamed';
            console.log(`   SEARCH Lead: ${leadName} | Project: ${(lead.current_project_id || lead.project_id || 'None').substring(0, 8)} | Match: ${hasProjectMatch}`);
          }
          
          return hasProjectMatch;
        }) || [];

        const totalLeads = projectLeads.length;
        const fastCheckTime = Date.now() - fastCheckStart;
        
        // Enhanced performance logging
        
        if (totalLeads === 0) {
          console.log(`FAST [TotalLeads] Zero leads confirmed for project: ${currentProject.name}`);
        }

        // For now, set previousPeriod to 0 since we don't have historical data
        const previousPeriod = 0;

        setLeadData({
          totalLeads,
          previousPeriod,
          isLoading: false,
          hasProject: true,
          error: null,
        });
      } catch (error) {
        console.error("ERROR [TotalLeads] Error loading lead data:", error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load leads';
        setLeadData({
          totalLeads: 0,
          previousPeriod: 0,
          isLoading: false,
          hasProject: false,
          error: errorMessage,
        });
      } finally {
        loadingRef.current = false;
      }
    };

    loadLeadData();
  }, [currentProject?.id, isAuthenticated, user]);

  // TOOL ENHANCED: Event handlers with better debugging
  useEffect(() => {
    const handleProjectChange = () => {
      
      setLeadData((prev) => ({ ...prev, isLoading: true, error: null }));
      loadingRef.current = false; // Reset loading ref for new load
    };

    const handleDataInvalidated = () => {
      console.log("🗑️ [TotalLeads] Data invalidated event - clearing cache");
      setLeadData((prev) => ({ ...prev, isLoading: true, error: null }));
      loadingRef.current = false;
    };

    const handleForceRefresh = () => {
      
      setLeadData((prev) => ({ ...prev, isLoading: true, error: null }));
      loadingRef.current = false;
    };

    window.addEventListener("project-changed", handleProjectChange);
    window.addEventListener("project-data-invalidated", handleDataInvalidated);
    window.addEventListener("force-dashboard-refresh", handleForceRefresh);
    
    return () => {
      window.removeEventListener("project-changed", handleProjectChange);
      window.removeEventListener("project-data-invalidated", handleDataInvalidated);
      window.removeEventListener("force-dashboard-refresh", handleForceRefresh);
    };
  }, []);

  const { totalLeads, previousPeriod, isLoading, hasProject, error } = leadData;

  const percentageChange =
    previousPeriod > 0
      ? (((totalLeads - previousPeriod) / previousPeriod) * 100).toFixed(1)
      : "0";
  const isPositive = totalLeads >= previousPeriod;

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <div className="space-y-4">
          <ProgressWithLoading
            value={45}
            label="Loading lead metrics..."
            description="Fetching total leads and calculating trends"
            animated
            showPercentage
            className="mb-4"
          />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardWidget
        title="Total Leads"
        titleKey="totalLeads.title"
        subtitle={error}
        subtitleKey=""
        value="Error"
        icon={<Users />}
        iconColor="text-red-500"
        trend={{
          value: "Error",
          positive: null,
          label: "Data loading failed",
        }}
        stats={[
          {
            label: "Status",
            value: "Error loading data",
          },
          {
            label: "Action",
            value: "Check authentication",
            highlighted: true,
          },
        ]}
      />
    );
  }

  // No authentication state
  if (!isAuthenticated || !user) {
    return (
      <DashboardWidget
        title="Total Leads"
        titleKey="totalLeads.title"
        subtitle="Authentication required"
        subtitleKey=""
        value="n/a"
        icon={<Users />}
        iconColor="text-gray-400"
        trend={{
          value: "n/a",
          positive: null,
          label: "Please log in",
        }}
        stats={[
          {
            label: "Status",
            value: "Not authenticated",
          },
          {
            label: "Action needed",
            value: "Log in",
            highlighted: true,
          },
        ]}
      />
    );
  }

  // No project selected state
  if (!hasProject) {
    return (
      <DashboardWidget
        title="Total Leads"
        titleKey="totalLeads.title"
        subtitle="Select a project to view leads"
        subtitleKey="totalLeads.noProjectSubtitle"
        value="n/a"
        icon={<FolderOpen />}
        iconColor="text-gray-400"
        trend={{
          value: "No project",
          positive: null,
          label: "Select a project first",
        }}
        stats={[
          {
            label: "Status",
            value: "No project selected",
          },
          {
            label: "Action needed",
            value: "Choose project",
            highlighted: true,
          },
        ]}
      />
    );
  }

  // Success state with data
  return (
    <DashboardWidget
      title="Total Leads"
      titleKey="totalLeads.title"
      subtitle={`Leads in ${currentProject?.name || 'current project'}`}
      subtitleKey="totalLeads.subtitle"
      value={totalLeads}
      icon={<Users />}
      iconColor={totalLeads > 0 ? "text-blue-600" : "text-gray-400"}
      trend={{
        value: `${percentageChange}%`,
        positive: isPositive,
        label: isPositive ? "Increase" : "Decrease",
      }}
      stats={[
        {
          label: "Previous period",
          value: previousPeriod,
        },
        {
          label: `In ${currentProject?.name}`,
          value: totalLeads,
          highlighted: true,
        },
      ]}
    />
  );
};

export default TotalLeads;
