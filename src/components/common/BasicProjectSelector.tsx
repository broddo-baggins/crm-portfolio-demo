// @ts-nocheck
// TEMP: TypeScript compatibility issues - systematic fix needed

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Folder, FolderOpen, RefreshCw } from "lucide-react";
import { useProject } from "@/context/ProjectContext";
import { useAuth } from "@/context/ClientAuthContext";
import { simpleProjectService } from "@/services/simpleProjectService";
import { useProjectDataRefresh } from "@/hooks/useProjectDataRefresh";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProjectWithLeadCount {
  id: string;
  name: string;
  lead_count?: number;
}

export const BasicProjectSelector: React.FC = () => {
  const { currentProject, setCurrentProject } = useProject();
  const { user, isAuthenticated } = useAuth();
  const { refreshAll, isRefreshing } = useProjectDataRefresh();
  const [projects, setProjects] = useState<ProjectWithLeadCount[]>([]);
  const [fullProjects, setFullProjects] = useState<any[]>([]); // Store original project objects
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  // TOOL DEBUG: Enhanced logging for troubleshooting
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('SECURITY [ProjectSelector] Auth state:', {
        isAuthenticated,
        hasUser: !!user,
        currentProject: currentProject?.name,
      });
    }
  }, [isAuthenticated, user, currentProject]);

  useEffect(() => {
    const loadProjects = async () => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      try {
        // TOOL CRITICAL: Wait for authentication before loading data
        if (!isAuthenticated || !user) {
          console.log('WAIT [ProjectSelector] Waiting for authentication...');
          setProjects([]);
          setFullProjects([]);
          setIsLoading(true);
          setError('Waiting for authentication...');
          loadingRef.current = false;
          return;
        }

        
        setIsLoading(true);
        setError(null);

        // Load projects and leads in parallel
        const [allProjects, allLeads] = await Promise.all([
          simpleProjectService.getAllProjects(),
          simpleProjectService.getAllLeads(),
        ]);

        // Store the full project objects
        setFullProjects(allProjects);

        // TOOL ENHANCED: Calculate lead counts per project
        const projectsWithLeadCounts: ProjectWithLeadCount[] = allProjects.map((project) => {
          const projectLeads = allLeads.filter(
            (lead) =>
              lead.project_id === project.id ||
              lead.current_project_id === project.id
          );

          const leadCount = projectLeads.length;

          // Debug logging for lead count calculation
          if (import.meta.env.DEV) {
            console.log(`   DATA Project: ${project.name} → ${leadCount} leads`);
          }

          return {
            id: project.id,
            name: project.name,
            lead_count: leadCount,
          };
        });

        setProjects(projectsWithLeadCounts);
        
      } catch (error) {
        console.error('ERROR [ProjectSelector] Error loading projects:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load projects';
        setError(errorMessage);
        setProjects([]);
        setFullProjects([]);
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    };

    loadProjects();
  }, [isAuthenticated, user]);

  // TOOL ENHANCED: Project switching with unified auto-refresh
  const handleProjectChange = async (project: ProjectWithLeadCount) => {
    try {
      
      // Find the full project object from the original projects array
      const fullProject = fullProjects.find(p => p.id === project.id);
      if (!fullProject) {
        console.error('ERROR [ProjectSelector] Could not find full project object');
        return;
      }

      // FIXED: Clear cache and force refresh before switching project
      simpleProjectService.clearProjectSpecificCache(currentProject?.id, fullProject.id);
      
      // Update project context with full project object
      setCurrentProject(fullProject);

      // ENHANCED: Explicitly trigger refresh after project change
      setTimeout(() => {
        refreshAll({
          showLoading: false,
          showSuccessToast: false,
          showErrorToast: true,
          force: true // Force refresh to bypass any caching
        });
      }, 100); // Small delay to ensure context update is processed

      // Show user feedback
      toast.success(`Switched to project: ${project.name}`, {
        description: 'Data is being refreshed automatically',
        duration: 2000
      });
      
      
    } catch (error) {
      console.error('ERROR [ProjectSelector] Error switching project:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Button variant="outline" disabled className="w-full">
        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
        Loading projects...
      </Button>
    );
  }

  // Error state
  if (error) {
    return (
      <Button variant="outline" disabled className="w-full">
        <FolderOpen className="h-4 w-4 mr-2 text-red-500" />
        Error: {error}
      </Button>
    );
  }

  // No authentication state
  if (!isAuthenticated || !user) {
    return (
      <Button variant="outline" disabled className="w-full">
        <FolderOpen className="h-4 w-4 mr-2" />
        Authentication required
      </Button>
    );
  }

  // No projects state
  if (projects.length === 0) {
    return (
      <Button variant="outline" disabled className="w-full">
        <FolderOpen className="h-4 w-4 mr-2" />
        No projects available
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={currentProject ? `Project: ${currentProject.name}` : "Select project"}
          className={cn(
            "inline-flex h-9 w-full max-w-[200px] items-center gap-2 rounded-md border border-input bg-surface px-3 text-sm font-medium transition-colors duration-[120ms] hover:border-ink-400 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-[340px]",
            currentProject ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <Folder className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate text-start">
            {currentProject?.name || "Select Project"}
          </span>
          {currentProject && (
            <Badge variant="secondary" className="hidden shrink-0 tabular-nums sm:inline-flex">
              {projects.find(p => p.id === currentProject.id)?.lead_count || 0} leads
            </Badge>
          )}
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full min-w-[250px]">
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => handleProjectChange(project)}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              currentProject?.id === project.id && "bg-accent"
            )}
          >
            <div className="flex flex-col gap-1">
              <span className="font-medium">{project.name}</span>
            </div>
            <Badge 
              variant={currentProject?.id === project.id ? "default" : "secondary"}
              className="ml-2"
            >
              {project.lead_count || 0} leads
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
