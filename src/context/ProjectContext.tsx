// @ts-nocheck
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useCallback,
} from "react";

// CRITICAL: React Context Guard
if (typeof createContext === "undefined") {
  throw new Error(
    "[Project Context] React createContext is not available. This indicates a module loading issue.",
  );
}

import { useAuth } from "./ClientAuthContext";
import { simpleProjectService } from "@/services/simpleProjectService";
import { toast } from "sonner";
import { Project } from "@/types/index";

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  setCurrentProject: (project: Project | null) => void;
  addProject: (
    project: Omit<Project, "id" | "created_at" | "updated_at">,
  ) => Promise<Project | null>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  refreshProjects: () => Promise<void>;
}

// CRITICAL: Safe context creation with error handling - SINGLETON
const ProjectContext = (() => {
  try {
    const context = createContext<ProjectContextType | undefined>(undefined);
    // Removed context creation log for cleaner user experience
    // console.log("[Project Context] Context created successfully");
    return context;
  } catch (error) {
    console.error("[Project Context] Failed to create context:", error);
    throw new Error(
      "Project context creation failed - React may not be properly loaded",
      { cause: error },
    );
  }
})();

// Prevent multiple provider instances
const isProviderMounted = false;

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Get user first, before any other hooks
  const { user } = useAuth();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProjectState] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const errorToastShown = useRef(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshPromiseRef = useRef<Promise<void> | null>(null);
  const initialized = useRef(false);

  // Enhanced error handling with debounced toast
  const showErrorToast = useCallback((message: string) => {
    if (!errorToastShown.current) {
      toast.error(message, {
        duration: 5000,
        action: {
          label: "Retry",
          onClick: () => {
            errorToastShown.current = false;
            setError(null);
          },
        },
      });
      errorToastShown.current = true;
    }
  }, []);

  // INIT PERFORMANCE: Request deduplication - prevent multiple simultaneous calls
  const refreshProjectsOptimized = useCallback(async (force = false): Promise<void> => {
    // If already refreshing, return the existing promise
    if (refreshPromiseRef.current && !force) {
      return refreshPromiseRef.current;
    }

    // Check cache validity (30 seconds)
    if (!force && lastRefresh && Date.now() - lastRefresh.getTime() < 30000) {
      console.log('PACKAGE Using cached projects (< 30s old)');
      return;
    }

    // Start new refresh
    refreshPromiseRef.current = (async () => {
      try {
        setIsRefreshing(true);
        
        const fetchedProjects = await simpleProjectService.getAllProjects();
        setProjects(fetchedProjects || []);
        setLastRefresh(new Date());
        setLoading(false); // Set loading to false after successful fetch
        
        // Auto-select first project if none selected and no saved project
        if (!currentProject && fetchedProjects && fetchedProjects.length > 0) {
          const savedProjectId = localStorage.getItem("currentProjectId");
          if (savedProjectId) {
            const savedProject = fetchedProjects.find((p) => p.id === savedProjectId);
            if (savedProject) {
              
              setCurrentProjectState(savedProject);
            } else {
              console.log('WARNING Saved project not found, selecting first project');
              localStorage.removeItem("currentProjectId");
              setCurrentProject(fetchedProjects[0]);
            }
          } else {
            console.log('📍 No saved project, selecting first project');
            setCurrentProject(fetchedProjects[0]);
          }
        }
      } catch (error) {
        console.error('Failed to refresh projects:', error);
        setLoading(false); // Set loading to false even on error
      } finally {
        setIsRefreshing(false);
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, [lastRefresh, currentProject]);

  // Replace the existing refreshProjects function
  const refreshProjects = refreshProjectsOptimized;

  // FIXED: setCurrentProject with event dispatching for component synchronization
  const setCurrentProject = useCallback((project: Project | null) => {
    
    setCurrentProjectState(project);
    setError(null);

    if (project) {
      localStorage.setItem("currentProjectId", project.id);
      console.log('SAVE Saved project to localStorage:', project.id);
      // Dispatch custom event for other components to listen to
      window.dispatchEvent(
        new CustomEvent("project-changed", {
          detail: {
            projectId: project.id,
            project: project,
          },
        })
      );
    } else {
      localStorage.removeItem("currentProjectId");
      console.log('🗑️ Removed project from localStorage');
      // Dispatch event for null project
      window.dispatchEvent(
        new CustomEvent("project-changed", {
          detail: {
            projectId: null,
            project: null,
          },
        })
      );
    }
  }, []);

  // Initialize projects on mount and user change
  useEffect(() => {
    if (user && !initialized.current) {
      console.log('INIT Initializing projects for user');
      initialized.current = true;
      refreshProjects();
    } else if (!user && initialized.current) {
      // Only reset state when user was previously authenticated and is now logged out
      // Not during initial loading or auth checking
      console.log('👤 User logged out, resetting project state');
      initialized.current = false;
      setProjects([]);
      setCurrentProjectState(null);
      setLoading(true);
      localStorage.removeItem("currentProjectId");
    }
    // Don't reset state when user is null during initial auth loading
  }, [user, refreshProjects]);

  const addProject = async (
    projectData: Omit<Project, "id" | "created_at" | "updated_at">,
  ): Promise<Project | null> => {
    if (!user) return null;

    try {
      setError(null);
      const newProject = await simpleProjectService.createProject(projectData);
      if (newProject) {
        setProjects((prev) => [newProject, ...prev]);
        setCurrentProject(newProject);
        toast.success("Project created successfully!");
        return newProject;
      }
      return null;
    } catch (error) {
      console.error("ERROR Error creating project:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const fullError = `Failed to create project: ${errorMessage}`;
      setError(fullError);
      showErrorToast(fullError);
      return null;
    }
  };

  const updateProject = async (
    id: string,
    updates: Partial<Project>,
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);
      const updatedProject = await simpleProjectService.updateProject(id, updates);
      if (updatedProject) {
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? updatedProject : p)),
        );

        // Update current project if it was the one being updated
        if (currentProject?.id === id) {
          setCurrentProjectState(updatedProject);
        }

        toast.success("Project updated successfully!");
        return true;
      }
      return false;
    } catch (error) {
      console.error("ERROR Error updating project:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const fullError = `Failed to update project: ${errorMessage}`;
      setError(fullError);
      showErrorToast(fullError);
      return false;
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setError(null);
      const success = await simpleProjectService.deleteProject(id);
      if (success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));

        // If the deleted project was the current one, switch to another project
        if (currentProject?.id === id) {
          const remainingProjects = projects.filter((p) => p.id !== id);
          if (remainingProjects.length > 0) {
            setCurrentProject(remainingProjects[0]);
          } else {
            setCurrentProject(null);
          }
        }

        toast.success("Project deleted successfully!");
        return true;
      }
      return false;
    } catch (error) {
      console.error("ERROR Error deleting project:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const fullError = `Failed to delete project: ${errorMessage}`;
      setError(fullError);
      showErrorToast(fullError);
      return false;
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        loading,
        error,
        setCurrentProject,
        addProject,
        updateProject,
        deleteProject,
        refreshProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

// Custom hook to use the project context
export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
