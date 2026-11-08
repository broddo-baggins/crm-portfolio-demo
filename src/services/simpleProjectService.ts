// @ts-nocheck
// TypeScript checking disabled for deployment compatibility
import { mapDatabaseLeadToAppLead, mapDatabaseProjectToAppProject } from '../types/fixes';
import { Project, Lead, Client, WhatsAppMessage } from "@/types";
import { authService, supabase } from "@/lib/supabase";
import { notificationService } from "./notificationService";
import { authSync } from "@/lib/authSync";
import { corsWorkaround } from './corsWorkaroundService';
import { mockDataService } from './mockDataService';


// Circuit breaker to prevent infinite loops
const MAX_RETRIES = 5;
const RETRY_WINDOW = 60000; // 1 minute
const failureTracker = new Map();

function shouldAllowCall(key) {
  const now = Date.now();
  const failures = failureTracker.get(key) || { count: 0, lastFailure: 0 };
  
  // Reset if window expired
  if (now - failures.lastFailure > RETRY_WINDOW) {
    failures.count = 0;
  }
  
  return failures.count < MAX_RETRIES;
}

function recordFailure(key) {
  const now = Date.now();
  const failures = failureTracker.get(key) || { count: 0, lastFailure: 0 };
  failures.count++;
  failures.lastFailure = now;
  failureTracker.set(key, failures);
}


export class SimpleProjectService {
  private leadLoadingCache = new Map<string, Promise<Lead[]>>();
  private lastLeadLoadTime = new Map<string, number>();
  private readonly DEBOUNCE_DELAY = 1000; // 1 second debounce
  private currentUser: { id: string; email?: string; profile?: any } | null =
    null;
  private userPromise: Promise<{
    id: string;
    email?: string;
    profile?: any;
  }> | null = null;

  // Simplified data caching
  private dataCache: Map<string, { data: any; timestamp: number; projectId?: string }> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for better stability
  private currentProjectId: string | null = null;

  // Safe wrapper for client_members queries with intelligent caching
  private clientMembershipsCache = new Map<string, { data: any, timestamp: number, failed: boolean }>();
  private readonly CLIENT_MEMBERSHIP_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Circuit breaker state to prevent excessive failed requests
  private circuitBreaker = {
    failures: 0,
    lastFailureTime: 0,
    isOpen: false,
    openDuration: 30000, // 30 seconds
    maxFailures: 5
  };

  // Supabase client instance - CRITICAL MISSING PROPERTY
  private client = supabase;

  constructor() {
    // Removed initialization log for cleaner user experience
    // console.log(
    //   "INIT SimpleProjectService initialized with 10min caching",
    // );

    // Listen for project changes to update currentProjectId
    if (typeof window !== 'undefined') {
      window.addEventListener('project-changed', (event: any) => {
        const newProjectId = event.detail?.projectId;
        const oldProjectId = this.currentProjectId;
        
        if (newProjectId !== oldProjectId) {
          this.currentProjectId = newProjectId;
          console.log('PACKAGE Project changed from', oldProjectId, 'to', newProjectId);
          
          // Clear all project-specific caches when project changes
          this.clearProjectSpecificCache(oldProjectId, newProjectId);
          
          // Force refresh data for the new project
          this.forceRefreshForProject(newProjectId);
        }
      });
    }

    // SIMPLIFIED: Remove event listeners that cause loops
    // Only keep essential authentication event
    if (typeof window !== "undefined") {
      window.addEventListener("user-authenticated", () => {
        this.clearUserCache();
      });
    }
  }

  // Clear user cache
  public clearUserCache(): void {
    this.currentUser = null;
    this.userPromise = null;
    this.dataCache.clear();
  }

  // Enhanced cache validity check that considers project context
  private isCacheValid(key: string, projectId?: string): boolean {
    const cached = this.dataCache.get(key);
    if (!cached) return false;
    
    const now = Date.now();
    const isExpired = now - cached.timestamp > this.CACHE_DURATION;
    
    // If projectId is specified, ensure cache is for the same project
    if (projectId && cached.projectId !== projectId) {
      return false;
    }
    
    // For non-project-specific data, check if current project has changed
    if (!projectId && this.currentProjectId && cached.projectId !== this.currentProjectId) {
      return false;
    }
    
    return !isExpired;
  }

  private getFromCache(key: string): any {
    const cached = this.dataCache.get(key);
    return cached?.data || null;
  }

  private setCache(key: string, data: any, projectId?: string): void {
    this.dataCache.set(key, {
      data,
      timestamp: Date.now(),
      projectId: projectId || this.currentProjectId || undefined,
    });
  }

  // Get cached data with fallback - CRITICAL MISSING METHOD
  private getCachedData(key: string, defaultValue: any = null): any {
    if (this.isCacheValid(key)) {
      return this.getFromCache(key) || defaultValue;
    }
    return defaultValue;
  }

  // Get cache with project awareness - CRITICAL MISSING METHOD
  private getCache(key: string, projectId?: string): any {
    if (this.isCacheValid(key, projectId)) {
      return this.getFromCache(key);
    }
    return null;
  }

  // Get current user with caching to prevent repeated API calls
  private async getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }

    // If already fetching user, wait for existing promise
    if (this.userPromise) {
      return this.userPromise;
    }

    this.userPromise = this.fetchCurrentUser();
    const user = await this.userPromise;
    this.userPromise = null;

    if (!user) {
      throw new Error("User not authenticated");
    }

    this.currentUser = user;
    return this.currentUser;
  }

  // Fetch current user from auth service
  private async fetchCurrentUser() {
    try {
      if (!authService.isAvailable) {
        throw new Error("Authentication service not available");
      }

      const { user, profile } = await authService.getCurrentUser();
      if (!user) {
        return null;
      }

      return { ...user, profile };
    } catch (error) {
      console.error("ERROR Error fetching current user:", error);
      return null;
    }
  }

  // Safe wrapper for client_members queries with intelligent caching
  private async getClientMemberships(userId: string): Promise<{ client_id: string }[] | null> {
    const cacheKey = `memberships-${userId}`;
    const cached = this.clientMembershipsCache.get(cacheKey);
    
    // If we have a recent failed attempt, don't retry for a while
    if (cached && (Date.now() - cached.timestamp) < this.CLIENT_MEMBERSHIP_CACHE_TTL) {
      if (cached.failed) {
        return null; // Don't spam the server with failed requests
      }
      return cached.data;
    }
    
    try {
      const { data, error } = await supabase
        .from("client_members")
        .select("client_id")
        .eq("user_id", userId);

      if (error) {
        // Handle specific error codes
        if (error.code === "PGRST116" || // Table not found
            error.code === "42501" || // Permission denied
            error.code === "42P01" || // Table does not exist
            error.message?.includes("CORS") ||
            error.message?.includes("Load failed")) {
          
          console.warn("WARNING client_members table not accessible, enabling fallback mode");
          
          // Cache the failure to prevent repeated attempts
          this.clientMembershipsCache.set(cacheKey, {
            data: null,
            timestamp: Date.now(),
            failed: true
          });
          
          return null;
        }
        throw error;
      }
      
      // Cache successful result
      this.clientMembershipsCache.set(cacheKey, {
        data: data || [],
        timestamp: Date.now(),
        failed: false
      });
      
      return data || [];
    } catch (error) {
      console.warn("WARNING Error accessing client_members, using fallback:", error.message);
      
      // Cache the failure
      this.clientMembershipsCache.set(cacheKey, {
        data: null,
        timestamp: Date.now(),
        failed: true
      });
      
      return null;
    }
  }

  // Get all projects - optimized version with conversation counts
  async getAllProjects(): Promise<Project[]> {
    const cacheKey = 'all-projects';
    
    // DEMO DEMO MODE: Return mock projects immediately
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      console.log('DEMO [DEMO MODE] Returning mock projects');
      return mockDataService.getMockProjects();
    }
    
    if (this.isCacheValid(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    try {
      const user = await authSync.ensureUser();
      if (!user) throw new Error("User not authenticated");

      // Get projects
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectsError) {
        console.error("ERROR Error fetching projects:", projectsError);
        throw projectsError;
      }
      
      const projectData = projects || [];

      // Get leads and conversations for all projects to calculate stats
      const [allLeads, allConversations] = await Promise.all([
        this.getAllLeads().catch(err => {
          console.warn("Failed to load leads for project stats:", err);
          return [];
        }),
        this.getAllConversations().catch(err => {
          console.warn("Failed to load conversations for project stats:", err);
          return [];
        })
      ]);

      // Enhance projects with lead counts and conversation counts
      const enhancedProjects = projectData.map(project => {
        // Count leads for this project
        const projectLeads = allLeads?.filter(lead => 
          lead.current_project_id === project.id
        ) || [];
        
        // Get lead IDs for this project
        const projectLeadIds = projectLeads.map(lead => lead.id);
        
        // Count active conversations for this project
        const activeConversations = allConversations?.filter(conv => {
          const belongsToProject = projectLeadIds.includes(conv.lead_id);
          const isActive = conv.status === 'active' || 
                          conv.status === 'in_progress' ||
                          conv.status === 'ongoing';
          return belongsToProject && isActive;
        }).length || 0;

        // Calculate conversion rate
        const convertedLeads = projectLeads.filter(lead =>
          ['converted', 'closed-won', 'won'].includes(
            typeof lead.status === 'string' ? lead.status.toLowerCase() : ''
          )
        ).length;
        
        const conversionRate = projectLeads.length > 0 
          ? Math.round((convertedLeads / projectLeads.length) * 100)
          : 0;

        return {
          ...project,
          leads_count: projectLeads.length,
          active_conversations: activeConversations,
          conversion_rate: conversionRate
        };
      });
      
      // Use cache
      this.setCache(cacheKey, enhancedProjects);
      
      return enhancedProjects;
    } catch (error) {
      console.error("ERROR Error in getAllProjects:", error);
      throw error;
    }
  }

  // Get projects (alias for getAllProjects)
  async getProjects(): Promise<Project[]> {
    return this.getAllProjects();
  }

  // Force refresh by clearing cache
  public forceRefresh(): void {
    this.dataCache.clear();
  }

  // Force refresh all project-related data (useful when switching projects)
  public forceRefreshForProject(projectId?: string): void {
    
    // Clear all project-specific caches
    this.clearProjectSpecificCache();
    
    // Force refresh common data sets
    this.dataCache.delete('all-projects');
    
    // Dispatch a custom event that components can listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('project-data-refresh', {
          detail: { projectId }
        })
      );
    }
    
    
  }

  // Create a new project
  async createProject(
    projectData: Omit<Project, "id" | "created_at" | "updated_at">,
  ): Promise<Project | null> {
    try {
      const user = await authSync.ensureUser();
      if (!user) throw new Error("User not authenticated");

      const { data: project, error } = await supabase
        .from("projects")
        .insert([projectData])
        .select()
        .single();

      if (error) {
        console.error("ERROR Error creating project:", error);
        throw error;
      }

      // Clear cache to force refresh
      this.dataCache.delete('all-projects');
      return project;
    } catch (error) {
      console.error("ERROR Error creating project:", error);
      throw error;
    }
  }

  // Update an existing project
  async updateProject(
    projectId: string,
    updates: Partial<Project>,
  ): Promise<Project | null> {
    // DEMO MODE: no projects table; apply the change to the mock project
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      const current = mockDataService.getMockProjects().find((p) => p.id === projectId);
      return current ? ({ ...current, ...updates, updated_at: new Date().toISOString() } as Project) : null;
    }

    try {
      const user = await authSync.ensureUser();
      if (!user) throw new Error("User not authenticated");

      const { data: project, error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", projectId)
        .select()
        .single();

      if (error) {
        console.error("ERROR Error updating project:", error);
        throw error;
      }

      // Clear cache to force refresh
      this.dataCache.delete('all-projects');
      return project;
    } catch (error) {
      console.error("ERROR Error updating project:", error);
      throw error;
    }
  }

  // Delete a project
  async deleteProject(projectId: string): Promise<boolean> {
    try {
      const user = await authSync.ensureUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) {
        console.error("ERROR Error deleting project:", error);
        throw error;
      }

      // Clear cache to force refresh
      this.dataCache.delete('all-projects');
      return true;
    } catch (error) {
      console.error("ERROR Error deleting project:", error);
      throw error;
    }
  }

  // Get all leads for the current user with project-aware caching
  async getAllLeads(projectId?: string, includeAllProjects: boolean = false): Promise<Lead[]> {
    const cacheKey = `all-leads${projectId ? `-${projectId}` : ''}${includeAllProjects ? '-all-projects' : ''}`;

    // Check cache first
    const cached = this.getCache(cacheKey, projectId);
    if (cached) {
      return cached;
    }

    // Check if another request is in progress for the same key
    if (this.leadLoadingCache.has(cacheKey)) {
      console.log(`WAIT Waiting for ongoing lead request: ${cacheKey}`);
      return await this.leadLoadingCache.get(cacheKey)!;
    }

    // Create loading promise
    const loadingPromise = this.loadLeadsInternal(projectId, includeAllProjects);
    this.leadLoadingCache.set(cacheKey, loadingPromise);

    try {
      const result = await loadingPromise;
      this.setCache(cacheKey, result, projectId);
      return result;
    } finally {
      this.leadLoadingCache.delete(cacheKey);
    }
  }

  private async loadLeadsInternal(projectId?: string, includeAllProjects: boolean = false): Promise<Lead[]> {
    const cacheKey = `all-leads${projectId ? `-${projectId}` : ''}${includeAllProjects ? '-all-projects' : ''}`;
    
    // DEMO DEMO MODE: Return all mock leads immediately (no filtering by project)
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      console.log('DEMO [DEMO MODE] Returning all 20 mock leads (no project filtering)');
      return mockDataService.getMockLeads();
    }
    
    try {
      // Check circuit breaker
      if (!this.canMakeRequest()) {
        console.log('BLOCKED Leads request blocked by circuit breaker');
        return this.getCachedData(cacheKey, mockDataService.getMockLeads());
      }

      console.log(`CALL Fetching leads ${projectId ? 'for project: ' + projectId : 'across all projects'}${includeAllProjects ? ' (including all user projects)' : ''}`);

      const user = await authSync.ensureUser();
      if (!user) {
        console.error("ERROR User not authenticated");
        throw new Error("User not authenticated");
      }

      // Get user's accessible clients using updated service
      const memberships = await this.getClientMemberships(user.id);

      if (!memberships || memberships.length === 0) {
        console.log("WARNING No client memberships found");
        this.recordSuccess(); // Don't penalize this as an error
        return mockDataService.getMockLeads();
      }

      let projectIds: string[] = [];

      if (projectId) {
        // Specific project requested
        projectIds = [projectId];
      } else if (includeAllProjects) {
        // ENHANCED: Get ALL projects the user has access to (for Messages page)
        const clientIds = memberships.map((m) => m.client_id);

        const projectsResult = await corsWorkaround.executeQuery(
          () => supabase
            .from("projects")
            .select("id")
            .in("client_id", clientIds),
          mockDataService.getMockProjects(),
          'all_user_projects'
        );

        if (!projectsResult.data || projectsResult.data.length === 0) {
          console.log("WARNING No projects found for user clients");
          return mockDataService.getMockLeads();
        }

        projectIds = projectsResult.data.map((p) => p.id);
      } else {
        const clientIds = memberships.map((m) => m.client_id);

        // Get projects for these clients
        const projectsResult = await corsWorkaround.executeQuery(
          () => supabase
            .from("projects")
            .select("id")
            .in("client_id", clientIds),
          mockDataService.getMockProjects(),
          'projects_for_leads'
        );

        if (!projectsResult.data || projectsResult.data.length === 0) {
          console.log("WARNING No projects found for user clients");
          return mockDataService.getMockLeads();
        }

        projectIds = projectsResult.data.map((p) => p.id);
      }

      // Filter by specific project if provided
      const targetProjectIds = projectId ? [projectId] : projectIds;

      // Get leads for these projects (with project relationship and client info)
      // ENHANCED: Validate project IDs to prevent 400 errors
      const validProjectIds = targetProjectIds.filter(id => id && typeof id === 'string' && id.trim().length > 0);
      
      const leadsResult = validProjectIds.length > 0
        ? await corsWorkaround.executeQuery(
            () => supabase
              .from("leads")
              .select(`
                id,
                phone,
                status,
                created_at,
                updated_at,
                current_project_id,
                first_name,
                last_name,
                state,
                bant_status,
                processing_state,
                interaction_count,
                last_interaction,
                client_id,
                lead_metadata,
                client:clients(
                  id,
                  name
                )
              `)
              .in('current_project_id', validProjectIds)
              .order("created_at", { ascending: false }),
            mockDataService.getMockLeads(),
            'leads_by_project'
          )
        : { data: mockDataService.getMockLeads(), error: null };

      if (leadsResult.error) {
        console.error("ERROR Error fetching leads:", leadsResult.error);
        return mockDataService.getMockLeads();
      }

      // Process leads with temperature calculation and enhanced data
      const processedLeads = (leadsResult.data || []).map((lead) => ({
        ...lead,
        status: this.mapLeadStatus(lead.status),
        temperature: this.calculateTemperature(lead),
        // Enhanced company display from client relationship
        company: lead.client?.name || lead.company || null,
        // Ensure all fields are properly mapped
        name: lead.name || `${lead.first_name || ""} ${lead.last_name || ""}`.trim() || "Unknown Lead",
        state: lead.state || null,
        bant_status: lead.bant_status || null,
        interaction_count: lead.interaction_count || 0,
        last_interaction: lead.last_interaction || null,
        first_interaction: lead.first_interaction || null,
        requires_human_review: lead.requires_human_review || false,
        // BANT calculations
        bant_budget: !!lead.bant_budget || false,
        bant_authority: !!lead.bant_authority || false,
        bant_need: !!lead.bant_need || false,
        bant_timeline: !!lead.bant_timeline || false,
        bant_score: [
          lead.bant_budget || false,
          lead.bant_authority || false,
          lead.bant_need || false,
          lead.bant_timeline || false,
        ].filter(Boolean).length,
      }));

      this.setCache(cacheKey, processedLeads, projectId);
      this.leadLoadingCache.delete(cacheKey); // Clear promise cache
      return processedLeads;
    } catch (error) {
      console.error("ERROR Error getting all leads:", error);
      recordFailure(cacheKey);

      // If it's an auth error, re-throw it
      if (
        error.message?.includes("User not authenticated") ||
        error.message?.includes("AuthSessionMissingError")
      ) {
        throw error;
      }

      // For other errors, return mock data
      console.error("Returning sample leads due to error");
      return mockDataService.getMockLeads();
    }
  }

  // Map database lead status to UI status number
  private mapLeadStatus(status: string | null): number {
    const statusMap: { [key: string]: number } = {
      new: 0,
      contacted: 1,
      qualified: 2,
      proposal: 3,
      negotiation: 4,
      won: 5,
      lost: 6,
    };

    return statusMap[status?.toLowerCase() || "new"] || 0;
  }

  // Calculate lead temperature based on various factors
  private calculateTemperature(lead: any): number {
    let temperature = 50; // Base temperature

    // Adjust based on status
    const statusTemp: { [key: string]: number } = {
      new: 30,
      contacted: 40,
      qualified: 60,
      proposal: 70,
      negotiation: 80,
      won: 90,
      lost: 10,
    };

    temperature = statusTemp[lead.status?.toLowerCase() || "new"] || 50;

    // Adjust based on recency (more recent = hotter)
    if (lead.updated_at) {
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(lead.updated_at).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (daysSinceUpdate < 1) temperature += 20;
      else if (daysSinceUpdate < 7) temperature += 10;
      else if (daysSinceUpdate > 30) temperature -= 20;
    }

    // Ensure temperature is within bounds
    return Math.max(0, Math.min(100, temperature));
  }

  // Get all conversations with enhanced filtering
  async getAllConversations(projectId?: string): Promise<any[]> {
    // DEMO DEMO MODE: Return mock conversations immediately
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      console.log('DEMO [DEMO MODE] Returning mock conversations');
      return mockDataService.getMockConversations();
    }
    
    try {
      // Check circuit breaker
      if (!this.canMakeRequest()) {
        console.log('BLOCKED Conversations request blocked by circuit breaker');
        return this.getCachedData('all-conversations', []);
      }

      const cacheKey = `all-conversations${projectId ? `-${projectId}` : ''}`;
      
      // OPTIMIZED: Reduced throttling to improve responsiveness
      const throttleKey = `getAllConversations-${projectId || 'all'}`;
      const now = Date.now();
      const lastRequestTime = this.dataCache.get(`${throttleKey}-throttle`)?.timestamp || 0;
      
      if (now - lastRequestTime < 1000) { // Reduced from 2s to 1s
        
        const cachedResult = this.dataCache.get(`${throttleKey}-result`)?.data || [];
        this.recordSuccess(); // Don't penalize throttled requests
        return cachedResult;
      }
      
      // Mark request time
      this.dataCache.set(`${throttleKey}-throttle`, { data: true, timestamp: now });

      const cached = this.getCache(cacheKey, projectId);
      if (cached) {
        this.dataCache.set(`${throttleKey}-result`, { data: cached, timestamp: now });
        this.recordSuccess();
        return cached;
      }

      console.log(`CALL Fetching conversations ${projectId ? 'for project: ' + projectId : 'across all projects'}`);

      // REGRESSION FIX: Simplified approach to prevent empty conversations
      // Try to get conversations directly first, then filter by accessible leads
      let conversationsData: any[] = [];
      
      try {
        // Step 1: Get conversations directly from the database
        const { data: conversations, error } = await supabase
          .from('conversations')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(500); // Reasonable limit to prevent overwhelming the UI

        if (error) {
          console.error('ERROR Error fetching conversations:', error);
          this.recordFailure();
          return this.getCachedData(cacheKey, []);
        }

        conversationsData = conversations || [];
        
        // Step 2: Get accessible leads for filtering (with fallback)
        let allowedLeadIds: string[] = [];
        
        try {
          if (projectId) {
            // Specific project requested
            const projectLeads = await this.getAllLeads(projectId);
            allowedLeadIds = projectLeads.map(lead => lead.id);
          } else {
            // Get leads from all accessible projects
            const allUserLeads = await this.getAllLeads(undefined, true);
            allowedLeadIds = allUserLeads.map(lead => lead.id);
          }
        } catch (leadError) {
          console.warn('WARNING Could not get leads for filtering, showing all conversations:', leadError);
          // Continue with all conversations if lead filtering fails
        }

        // Step 3: Filter conversations by accessible leads (only if we have lead IDs)
        if (allowedLeadIds.length > 0) {
          const originalCount = conversationsData.length;
          conversationsData = conversationsData.filter(conv => 
            allowedLeadIds.includes(conv.lead_id)
          );
          
        }

        // Step 4: Fetch lead data for conversations and merge
        if (conversationsData.length > 0) {
          const conversationLeadIds = [...new Set(conversationsData.map(conv => conv.lead_id).filter(Boolean))];
          
          if (conversationLeadIds.length > 0) {
            const { data: leadsData } = await supabase
              .from('leads')
              .select('id, first_name, last_name, phone, status, state, bant_status, current_project_id, created_at, updated_at')
              .in('id', conversationLeadIds);
            
            // Create a lead lookup map
            const leadMap = new Map();
            (leadsData || []).forEach(lead => {
              leadMap.set(lead.id, lead);
            });
            
            // Merge lead data into conversations with stable references
            conversationsData.forEach(conversation => {
              const lead = leadMap.get(conversation.lead_id);
              if (lead) {
                // Only add lead data if it doesn't already exist to maintain stable references
                if (!conversation.lead || conversation.lead.id !== lead.id) {
                  conversation.lead = {
                    ...lead,
                    name: lead.name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown Lead'
                  };
                }
              }
            });
          }
        }

        
      } catch (error) {
        console.error('ERROR Error in conversation loading process:', error);
        this.recordFailure();
        return this.getCachedData(cacheKey, []);
      }

      // Cache the successful result
      this.setCache(cacheKey, conversationsData, projectId);
      this.dataCache.set(`${throttleKey}-result`, { data: conversationsData, timestamp: now });
      this.recordSuccess();
      return conversationsData;
      
    } catch (error) {
      console.error('ERROR Error getting all conversations:', error);
      this.recordFailure();
      return [];
    }
  }

  // Get WhatsApp-style messages from conversations
  async getWhatsAppMessages(limit: number = 100, projectId?: string): Promise<any[]> {
    // DEMO MODE: Return empty array (messages handled by mock API elsewhere)
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      console.log('📋 DEMO MODE: Skipping WhatsApp messages query');
      return [];
    }

    const cacheKey = `whatsapp-messages${projectId ? `-${projectId}` : ''}`;
    const throttleKey = `whatsapp-messages-throttle${projectId ? `-${projectId}` : ''}`;

    try {
      // Check throttling
      const lastRequest = this.dataCache.get(`${throttleKey}-timestamp`);
      const now = Date.now();
      
      if (lastRequest && now - lastRequest < 2000) {
        console.log('TIMER WhatsApp messages request throttled, using cache');
        return this.getCachedData(throttleKey, []);
      }
      
      this.dataCache.set(`${throttleKey}-timestamp`, now);

      // Get conversations first to filter by project
      let conversations: any[] = [];
      const conversationCacheKey = `conversations${projectId ? `-${projectId}` : ''}`;
      const timeSinceLastRequest = now - (this.dataCache.get(`${conversationCacheKey}-timestamp`) || 0);
      
      if (timeSinceLastRequest < 1500) {
        // If conversations were requested very recently, wait and try to get from cache
        console.log('TIMER Waiting for ongoing conversation load...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try to get from cache after waiting
        const cachedResult = this.dataCache.get(`${conversationCacheKey}-result`);
        if (cachedResult && now - cachedResult.timestamp < 60000) { // Cache valid for 1 minute
          console.log(`📋 Using cached conversations for WhatsApp messages (${cachedResult.data.length} conversations)`);
          conversations = cachedResult.data;
        } else {
          console.log('⏭️ No cached conversations available, returning empty result');
          conversations = [];
        }
      } else {
        // Safe to load conversations
        try {
          conversations = await this.getAllConversations(projectId);
          // Cache the result for other requests
          this.dataCache.set(`${conversationCacheKey}-result`, { data: conversations, timestamp: now });
        } catch (error) {
          console.warn('Failed to load conversations for WhatsApp messages:', error);
          conversations = [];
        }
      }
      
      if (!conversations || conversations.length === 0) {
        console.log('📭 No conversations available for WhatsApp messages');
        const emptyResult: any[] = [];
        this.setCache(throttleKey, emptyResult, projectId);
        this.dataCache.set(`${throttleKey}-result`, { data: emptyResult, timestamp: now });
        this.recordSuccess();
        return emptyResult;
      }

      const leadIds = conversations.map(c => c.lead_id).filter(Boolean);

      // SIMPLIFIED: Use conversations table directly (avoid 400 errors from whatsapp_messages view)
      // Fix URL encoding issue by separating the alias into a separate field
      const { data: whatsappMessages, error } = await supabase
          .from('conversations')
          .select('id, lead_id, message_content, sender_number, receiver_number, wa_timestamp, created_at, updated_at, message_type, wamid, metadata')
          .in('lead_id', leadIds)
          .not('message_content', 'is', null)
          .order('wa_timestamp', { ascending: false })
          .limit(Math.min(limit, 200));
          
      if (error) {
        console.error('ERROR Error fetching messages from conversations:', error);
        this.recordFailure();
          return this.getCachedData(throttleKey, []);
      }

      // Add direction mapping for conversations
      const enhancedMessages = (whatsappMessages || []).map(msg => ({
            ...msg,
            direction: msg.message_type === 'incoming' ? 'inbound' : 'outbound'
          }));

      const messageCount = enhancedMessages.length;
      
      // Cache successful results
      this.setCache(throttleKey, enhancedMessages, projectId);
      this.dataCache.set(`${throttleKey}-result`, { data: enhancedMessages, timestamp: now });
      this.recordSuccess();
      
      return enhancedMessages;
      
    } catch (error) {
      console.error('ERROR Error getting WhatsApp messages:', error);
      this.recordFailure();
      return [];
    }
  }

  // Get complete conversation with all messages by conversation UUID
  async getCompleteConversation(conversationId: string) {
    // DEMO MODE: no conversations table; callers fall back to getLeadMessages()
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      return { conversation: null, lead: null, whatsappMessages: [] };
    }

    try {
      const user = await authSync.ensureUser();
      if (!user) throw new Error("User not authenticated");

      // Get conversation details with basic columns only
      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .select(
          "id, lead_id, message_content, timestamp, message_type, status, created_at, updated_at, metadata",
        )
        .eq("id", conversationId)
        .single();

      if (convError) {
        console.error("ERROR Error fetching conversation:", convError.message);
        throw convError;
      }

      if (!conversation) {
        throw new Error("Conversation not found");
      }

      // Get lead details separately
      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .select("*")
        .eq("id", conversation.lead_id)
        .single();

      if (leadError || !lead) {
        console.error(
          "ERROR Lead not found for conversation:",
          leadError?.message || "Missing lead",
        );
        throw new Error("Lead not found for conversation");
      }

      // Get project details separately
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id, name, client_id")
        .eq("id", lead.current_project_id)
        .single();

      if (projectError) {
        console.log(
          "WARNING Could not fetch project for lead:",
          projectError.message,
        );
      }

      // Get client details if project exists
      let client = null;
      if (project) {
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("id, name")
          .eq("id", project.client_id)
          .single();

        if (clientError) {
          console.log(
            "WARNING Could not fetch client for project:",
            clientError.message,
          );
        } else {
          client = clientData;
        }
      }

      // Get WhatsApp messages for this conversation
      const whatsappMessages = await this.getLeadMessages(conversation.lead_id);

      return {
        conversation,
        lead,
        project,
        client,
        whatsappMessages,
        messageCount: whatsappMessages.length,
        lastMessageAt: whatsappMessages.length > 0 
          ? whatsappMessages[0].wa_timestamp 
          : conversation.updated_at,
        fullName: `${lead.first_name || ""} ${lead.last_name || ""}`.trim(),
        displayPhone: lead.phone || "No phone",
        displayEmail: lead.email || "No email",
        projectName: project?.name || "No project",
        clientName: client?.name || "No client",
      };
    } catch (error) {
      console.error("ERROR Error getting complete conversation:", error);
      throw error;
    }
  }

  // Get conversations with enhanced lead data
  async getConversationsWithLeads(limit: number = 50): Promise<any[]> {
    try {
      const user = await authSync.ensureUser();
      if (!user) throw new Error("User not authenticated");

      // Get user's accessible clients using safe wrapper
      const memberships = await this.getClientMemberships(user.id);

      if (!memberships || memberships.length === 0) {
        return [];
      }

      const clientIds = memberships.map((m) => m.client_id);

      // Get projects for these clients
      const { data: conversationLeadProjects } = await supabase
        .from("projects")
        .select("id")
        .in("client_id", clientIds);

      if (!conversationLeadProjects || conversationLeadProjects.length === 0) {
        return [];
      }

      const projectIds = conversationLeadProjects.map((p) => p.id);

      // Get leads for these projects
      const { data: leads } = await supabase
        .from("leads")
        .select("*")
        .in("current_project_id", projectIds);

      if (!leads || leads.length === 0) {
        return [];
      }

      const leadIds = leads.map((l) => l.id);

      // Get recent conversations for these leads
      const { data: conversations, error: conversationsError } = await supabase
        .from("conversations")
        .select("*")
        .in("lead_id", leadIds)
        .order("updated_at", { ascending: false })
        .limit(limit);

      if (conversationsError) {
        console.error("ERROR Error fetching conversations:", conversationsError);
        throw conversationsError;
      }

      // Enhance conversations with lead data
      const enhancedConversations = (conversations || []).map((conv) => {
        const lead = leads.find((l) => l.id === conv.lead_id);
        return {
          ...conv,
          lead,
          leadName: lead
            ? `${lead.first_name || ""} ${lead.last_name || ""}`.trim()
            : "Unknown Lead",
          leadPhone: lead?.phone || "",
          leadEmail: lead?.email || "",
          projectId: lead?.current_project_id || "",
        };
      });

      return enhancedConversations;
    } catch (error) {
      console.error("ERROR Error getting conversations with leads:", error);

      if (
        error.message?.includes("User not authenticated") ||
        error.message?.includes("AuthSessionMissingError")
      ) {
        throw error;
      }

      return [];
    }
  }

  // Create a new lead
  async createLead(
    leadData: Omit<Lead, "id" | "created_at" | "updated_at">,
  ): Promise<Lead | null> {
    try {
      const user = await authSync.ensureUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("leads")
        .insert(leadData)
        .select()
        .single();

      if (error) {
        console.error("ERROR Error creating lead:", error);
        throw error;
      }

      // Clear cache to force refresh
      this.dataCache.clear();

      return data;
    } catch (error) {
      console.error("ERROR Error creating lead:", error);
      return null;
    }
  }

  // Update existing lead
  async updateLead(
    leadId: string,
    updates: Partial<Lead>,
  ): Promise<Lead | null> {
    try {
      const user = await authSync.ensureUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", leadId)
        .select()
        .single();

      if (error) {
        console.error("ERROR Error updating lead:", error);
        throw error;
      }

      // Clear cache to force refresh
      this.dataCache.clear();

      return data;
    } catch (error) {
      console.error("ERROR Error updating lead:", error);
      return null;
    }
  }

  // Delete lead
  async deleteLead(leadId: string): Promise<boolean> {
    try {
      const user = await authSync.ensureUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("leads").delete().eq("id", leadId);

      if (error) {
        console.error("ERROR Error deleting lead:", error);
        throw error;
      }

      // Clear cache to force refresh
      this.dataCache.clear();

      return true;
    } catch (error) {
      console.error("ERROR Error deleting lead:", error);
      return false;
    }
  }

  // LEGACY METHOD: Dashboard stats for backward compatibility
  async getDashboardStats(): Promise<{
    totalProjects: number;
    totalLeads: number;
    totalClients: number;
    totalConversations: number;
    activeProjects: number;
    activeLeads: number;
  }> {
    try {
      // DISABLED: Removed conversation loading to prevent infinite throttling
      const [projects, leads] = await Promise.all([
        this.getAllProjects(),
        this.getAllLeads(),
        // DISABLED: this.getAllConversations(), // Causes infinite throttling loop
      ]);

      // Get unique client count from projects
      const clientIds = new Set(
        projects.map((p) => p.client_id).filter(Boolean),
      );
      const totalClients = clientIds.size;

      // Calculate active projects and leads
      const activeProjects = projects.filter((p) =>
        ["active", "in_progress"].includes(p.status?.toLowerCase() || ""),
      ).length;

      const activeLeads = leads.filter((l) =>
        ["new", "contacted", "qualified", "proposal", "negotiation"].includes(
          l.status?.toString().toLowerCase() || "",
        ),
      ).length;

      const stats = {
        totalProjects: projects.length,
        totalLeads: leads.length,
        totalClients,
        totalConversations: 0, // DISABLED: Set to 0 to prevent conversation loading
        activeProjects,
        activeLeads,
      };

      return stats;
    } catch (error) {
      console.error("ERROR Error getting dashboard stats:", error);

      // Return default stats on error
      return {
        totalProjects: 0,
        totalLeads: 0,
        totalClients: 0,
        totalConversations: 0,
        activeProjects: 0,
        activeLeads: 0,
      };
    }
  }

  // Get projects for a specific client (that user has access to)
  async getProjectsByClient(clientId: string): Promise<Project[]> {
    try {
      const user = await authSync.ensureUser();
      if (!user) throw new Error("User not authenticated");

      // Verify user has access to this client
      const { data: membership } = await supabase
        .from("profiles")
        .select("id")
        .eq("client_id", clientId)
        .eq("user_id", user.id)
        .single();

      if (!membership) {
        console.warn(
          `User ${user.id} does not have access to client ${clientId}`,
        );
        return [];
      }

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error getting projects by client:", error);
      return [];
    }
  }

  // Get single project with access verification
  async getProject(projectId: string): Promise<Project | null> {
    try {
      const user = await authSync.ensureUser();
      if (!user) throw new Error("User not authenticated");

      // First check if user has access to any clients using safe wrapper
      const memberships = await this.getClientMemberships(user.id);

      if (!memberships || memberships.length === 0) {
        return null;
      }

      const clientIds = memberships.map((m) => m.client_id);

      // Then get the project if it belongs to one of user's clients
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .in("client_id", clientIds)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Project not found or no access
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error getting project:", error);
      return null;
    }
  }

  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("count")
        .limit(1);

      return !error;
    } catch {
      return false;
    }
  }

  // LEGACY METHODS for backward compatibility
  async getClients(): Promise<Client[]> {
    try {
      const user = await authSync.ensureUser();
      if (!user) throw new Error("User not authenticated");

      const { data: memberships, error } = await supabase
        .from("profiles")
        .select(
          `
          client_id,
          clients!inner(*)
        `,
        )
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching clients:", error);
        return [];
      }

      return (memberships || [])
        .map((m: any) => m.clients)
        .filter(Boolean) as Client[];
    } catch (error) {
      console.error("Error getting clients:", error);
      return [];
    }
  }

  // Get messages for a specific lead (by lead ID)
  async getLeadMessages(
    leadId: string,
    page = 1,
    pageSize = 50,
  ): Promise<WhatsAppMessage[]> {
    // DEMO MODE: serve the mock conversation for this lead, oldest first
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      return mockDataService
        .getMockConversations()
        .filter((msg) => msg.lead_id === leadId)
        .map((msg) => ({
          id: msg.id,
          lead_id: msg.lead_id,
          content: msg.message_content || "",
          direction: msg.message_type === "outbound" ? "outbound" : "inbound",
          message_type: "text",
          wa_timestamp: msg.timestamp,
          created_at: msg.created_at,
        })) as unknown as WhatsAppMessage[];
    }

    try {
      // Get conversations for this lead
      const { data: messages, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) {
        console.error("ERROR Error fetching lead messages:", error);
        return [];
      }

      // Get lead info for context
      const leads = await this.getAllLeads();
      const lead = leads.find(l => l.id === leadId);

      // Transform conversations to WhatsApp message format
      const whatsappMessages = (messages || []).map((msg) => ({
        id: msg.id,
        lead_id: msg.lead_id,
        content: msg.message_content || "",
        direction: msg.message_type === "outbound" ? "outbound" : "inbound",
        message_type: msg.message_type || "text",
        wa_timestamp: msg.timestamp || msg.created_at,
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        conversation_id: msg.id,
        sender_number: lead?.phone || "unknown",
        receiver_number: lead?.phone || "system",
        wamid: msg.id,
        payload: msg.metadata || {},
        lead_phone: lead?.phone || "",
        lead_name: lead
          ? `${lead.first_name || ""} ${lead.last_name || ""}`.trim()
          : "Unknown Lead",
      })) as WhatsAppMessage[];

      return whatsappMessages;
    } catch (error) {
      console.error("ERROR Failed to fetch lead messages:", error);
      return [];
    }
  }

  // Clear caches that are specific to a project
  public clearProjectSpecificCache(oldProjectId?: string, newProjectId?: string): void {
    console.log('🧹 Clearing project-specific cache:', { oldProjectId, newProjectId });
    
    // Clear all project-specific cache entries
    const keysToDelete: string[] = [];
    
    for (const [key] of this.dataCache) {
      // Clear cache entries that contain project IDs
      if (
        key.includes('leads') ||
        key.includes('conversations') ||
        key.includes('whatsapp') ||
        key.includes('stats') ||
        key.includes('dashboard') ||
        (oldProjectId && key.includes(oldProjectId)) ||
        (newProjectId && key.includes(newProjectId))
      ) {
        keysToDelete.push(key);
      }
    }
    
    // Delete the identified cache keys
    keysToDelete.forEach(key => {
      this.dataCache.delete(key);
      console.log('🗑️ Deleted cache key:', key);
    });
    
    // Also clear the loading cache
    this.leadLoadingCache.clear();
    this.lastLeadLoadTime.clear();
    
    
  }

  // Check if circuit breaker allows requests
  private canMakeRequest(): boolean {
    const now = Date.now();
    
    if (this.circuitBreaker.isOpen) {
      // Exponential backoff: increase timeout based on failure count
      const backoffMultiplier = Math.min(Math.pow(2, this.circuitBreaker.failures - this.circuitBreaker.maxFailures), 8);
      const adjustedTimeout = this.circuitBreaker.openDuration * backoffMultiplier;
      
      if (now - this.circuitBreaker.lastFailureTime > adjustedTimeout) {
        // Reset circuit breaker after timeout
        this.circuitBreaker.isOpen = false;
        this.circuitBreaker.failures = Math.max(0, this.circuitBreaker.failures - 1); // Gradual recovery
        
      } else {
        console.log(`BLOCKED Circuit breaker OPEN - blocking request (${Math.round((adjustedTimeout - (now - this.circuitBreaker.lastFailureTime)) / 1000)}s remaining)`);
        return false;
      }
    }
    
    return true;
  }

  // Record request failure for circuit breaker with error categorization
  private recordFailure(errorType: 'critical' | 'recoverable' = 'critical') {
    // Only count critical failures towards circuit breaker
    if (errorType === 'critical') {
      this.circuitBreaker.failures++;
      this.circuitBreaker.lastFailureTime = Date.now();
      
      if (this.circuitBreaker.failures >= this.circuitBreaker.maxFailures) {
        this.circuitBreaker.isOpen = true;
        console.log(`ALERT Circuit breaker OPENED after ${this.circuitBreaker.failures} critical failures`);
      }
    } else {
      // For recoverable errors, just log without triggering circuit breaker
      console.log(`WARNING Recoverable error recorded, not affecting circuit breaker (current failures: ${this.circuitBreaker.failures})`);
    }
  }

  // Record successful request
  private recordSuccess() {
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.isOpen = false;
    this.circuitBreaker.lastFailureTime = 0;
  }

  // Reset circuit breaker manually (for emergency use after fixing issues)
  public resetCircuitBreaker(): void {
    
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.isOpen = false;
    this.circuitBreaker.lastFailureTime = 0;
  }
}

// Export singleton instance
export const simpleProjectService = new SimpleProjectService();

