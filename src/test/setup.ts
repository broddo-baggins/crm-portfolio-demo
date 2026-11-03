import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import React from "react";

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock i18next for testing
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
    i18n: {
      changeLanguage: vi.fn(),
      language: "en",
      dir: () => "ltr",
    },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: {
    type: "3rdParty",
    init: vi.fn(),
  },
}));

// Mock useLang hook for RTL testing
vi.mock("@/hooks/useLang", () => ({
  useLang: () => ({
    isRTL: false,
    currentLanguage: "en",
    isHebrew: false,
    dir: "ltr",
    textAlign: () => "text-left",
    textStart: () => "text-left",
    textEnd: () => "text-right",
    flexDirection: () => "flex-row",
    flexRowReverse: () => "",
    marginLeft: () => "ml-2",
    marginRight: () => "mr-2",
    paddingLeft: () => "pl-2",
    paddingRight: () => "pr-2",
    roundedLeft: () => "rounded-l",
    roundedRight: () => "rounded-r",
    borderLeft: () => "border-l",
    borderRight: () => "border-r",
  }),
}));

// Mock Supabase client
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi
        .fn()
        .mockResolvedValue({ 
          data: { 
            session: {
              user: { id: '1', email: 'test@test.com' },
              access_token: 'mock-access-value',
              refresh_token: 'mock-refresh-value'
            } 
          }, 
          error: null 
        }),
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: { id: '1', email: 'test@test.com' } }, error: null }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn().mockImplementation((callback) => {
        // Immediately call the callback with a signed-in user
        callback('SIGNED_IN', {
          user: { id: '1', email: 'test@test.com' },
          access_token: 'mock-test-value',
          refresh_token: 'mock-refresh-value'
        });
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockImplementation((callback) => {
        if (typeof callback === 'function') {
          callback('SUBSCRIBED');
        }
        return {
          unsubscribe: vi.fn(),
        };
      }),
    })),
  },
}));

// CRITICAL: Also mock the direct supabase import path used in components
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi
        .fn()
        .mockResolvedValue({ 
          data: { 
            session: {
              user: { id: '1', email: 'test@test.com' },
              access_token: 'mock-access-value',
              refresh_token: 'mock-refresh-value'
            } 
          }, 
          error: null 
        }),
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: { id: '1', email: 'test@test.com' } }, error: null }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn().mockImplementation((callback) => {
        // Immediately call the callback with a signed-in user
        callback('SIGNED_IN', {
          user: { id: '1', email: 'test@test.com' },
          access_token: 'mock-test-value',
          refresh_token: 'mock-refresh-value'
        });
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockImplementation((callback) => {
        if (typeof callback === 'function') {
          callback('SUBSCRIBED');
        }
        return {
          unsubscribe: vi.fn(),
        };
      }),
    })),
  },
}));

// Mock @supabase/supabase-js
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => {
    // Create a chainable query builder mock
    const createQueryBuilder = () => {
      const queryBuilder: any = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => {
          // Return mock data that matches the input data structure
          return Promise.resolve({ 
            data: { 
              id: '1', 
              first_name: 'John', 
              last_name: 'Doe', 
              email: 'john@example.com',
              status: 'qualified',
              state: 'new',
              heat: 'hot'
            }, 
            error: null 
          });
        }),
      };

      // Make it thenable for await (important for testConnection)
      queryBuilder.then = vi.fn((resolve) => {
        resolve({ data: [{ id: '1' }], error: null });
        return Promise.resolve({ data: [{ id: '1' }], error: null });
      });

      return queryBuilder;
    };

    return {
      auth: {
        getSession: vi
          .fn()
          .mockResolvedValue({ 
            data: { 
              session: {
                user: { id: '1', email: 'test@test.com' },
                access_token: 'mock-test-value',
                refresh_token: 'mock-refresh-value'
              } 
            }, 
            error: null 
          }),
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: '1', email: 'test@test.com' } }, error: null }),
        signInWithPassword: vi.fn(),
        signUp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        signOut: vi.fn(),
        onAuthStateChange: vi.fn().mockImplementation((callback) => {
          // Immediately call the callback with a signed-in user
          callback('SIGNED_IN', {
            user: { id: '1', email: 'test@test.com' },
            access_token: 'mock-test-value',
            refresh_token: 'mock-refresh-value'
          });
          return { data: { subscription: { unsubscribe: vi.fn() } } };
        }),
      },
      from: vi.fn(() => createQueryBuilder()),
      channel: vi.fn(() => ({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockImplementation((callback) => {
          if (typeof callback === 'function') {
            callback('SUBSCRIBED');
          }
          return {
            unsubscribe: vi.fn(),
          };
        }),
      })),
    };
  }),
}));

// Mock Supabase client from integrations
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi
        .fn()
        .mockResolvedValue({ 
          data: { 
            session: {
              user: { id: '1', email: 'test@test.com' },
              access_token: 'mock-test-value',
              refresh_token: 'mock-refresh-value'
            } 
          }, 
          error: null 
        }),
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: { id: '1', email: 'test@test.com' } }, error: null }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn().mockImplementation((callback) => {
        // Immediately call the callback with a signed-in user
        callback('SIGNED_IN', {
          user: { id: '1', email: 'test@test.com' },
          access_token: 'mock-test-value',
          refresh_token: 'mock-refresh-value'
        });
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
    },
    from: vi.fn(() => {
      // Create a chainable query builder mock
      const queryBuilder: any = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(() => {
          // Return mock data that matches the input data structure
          return Promise.resolve({ 
            data: { 
              id: '1', 
              first_name: 'John', 
              last_name: 'Doe', 
              email: 'john@example.com',
              status: 'qualified',
              state: 'new',
              heat: 'hot'
            }, 
            error: null 
          });
        }),
      };

      // Make it thenable for await (important for testConnection)
      queryBuilder.then = vi.fn((resolve) => {
        resolve({ data: [{ id: '1' }], error: null });
        return Promise.resolve({ data: [{ id: '1' }], error: null });
      });

      return queryBuilder;
    }),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockImplementation((callback) => {
        // Call the callback with a successful subscription status
        if (typeof callback === 'function') {
          callback('SUBSCRIBED');
        }
        return {
          unsubscribe: vi.fn(),
        };
      }),
    })),
  },
}));

// Mock router
vi.mock("react-router", () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/", search: "", hash: "", state: null }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => {
    return React.createElement("a", { href: to }, children);
  },
  Navigate: ({ to }: { to: string }) => {
    return React.createElement("div", {
      "data-testid": "navigate",
      "data-to": to,
    });
  },
}));

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Setup localStorage mock
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal("localStorage", localStorageMock);

// Setup sessionStorage mock
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal("sessionStorage", sessionStorageMock);

// Mock console methods to reduce noise in tests (but keep error for debugging)
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  // Keep error for debugging test failures
};

// Mock UserSettingsService
vi.mock("@/services/userSettingsService", () => ({
  UserSettingsService: class {
    static async getAppPreferences() {
      return Promise.resolve({
        theme: "light",
        language: "en",
        notifications: true,
      });
    }
    static async saveAppPreferences(preferences: any) {
      return Promise.resolve(preferences);
    }
    static async getDashboardSettings() {
      return Promise.resolve({
        layout: "grid",
        widgets: [],
      });
    }
    static async saveDashboardSettings(settings: any) {
      return Promise.resolve(settings);
    }
  },
}));

// Mock simpleProjectService - CRITICAL for project switching tests
vi.mock("@/services/simpleProjectService", () => ({
  simpleProjectService: {
    getAllProjects: vi.fn().mockResolvedValue([
      {
        id: "project-1",
        name: "Test Project 1",
        description: "Test project description",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "project-2", 
        name: "Test Project 2",
        description: "Another test project",
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      },
    ]),
    getProjects: vi.fn().mockResolvedValue([
      {
        id: "project-1",
        name: "Test Project 1",
        description: "Test project description",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ]),
    createProject: vi.fn().mockImplementation((projectData) => Promise.resolve({
      id: "new-project-id",
      name: projectData.name || "New Project",
      description: projectData.description || "New project description",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      ...projectData,
    })),
    updateProject: vi.fn().mockImplementation((id, updates) => Promise.resolve({
      id: id,
      name: updates.name || "Updated Project",
      description: updates.description || "Updated description",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: new Date().toISOString(),
      ...updates,
    })),
    deleteProject: vi.fn().mockResolvedValue(true),
    getAllLeads: vi.fn().mockResolvedValue([
      {
        id: "lead-1",
        project_id: "project-1",
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        phone: "+1234567890",
        status: "qualified",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ]),
    createLead: vi.fn().mockImplementation((leadData) => Promise.resolve({
      id: "new-lead-id",
      project_id: leadData.project_id || "project-1",
      first_name: leadData.first_name || "New",
      last_name: leadData.last_name || "Lead",
      email: leadData.email || "newlead@example.com",
      phone: leadData.phone || "+1234567890",
      status: leadData.status || "unqualified",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      ...leadData,
    })),
    updateLead: vi.fn().mockImplementation((id, updates) => Promise.resolve({
      id: id,
      project_id: updates.project_id || "project-1",
      first_name: updates.first_name || "Updated",
      last_name: updates.last_name || "Lead",
      email: updates.email || "updated@example.com",
      phone: updates.phone || "+1234567890",
      status: updates.status || "qualified",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: new Date().toISOString(),
      ...updates,
    })),
    deleteLead: vi.fn().mockResolvedValue(true),
    getDashboardStats: vi.fn().mockResolvedValue({
      totalProjects: 2,
      totalLeads: 5,
      totalClients: 3,
      totalConversations: 10,
      activeProjects: 1,
      activeLeads: 3,
    }),
    getWhatsAppMessages: vi.fn().mockResolvedValue([
      {
        id: "msg-1",
        lead_id: "lead-1",
        content: "Test message 1",
        sender_number: "+1234567890",
        receiver_number: "+0987654321",
        wa_timestamp: "2024-01-01T10:00:00Z",
        direction: "inbound",
        message_type: "text",
        wamid: "wamid.msg-1",
        created_at: "2024-01-01T10:00:00Z",
        updated_at: "2024-01-01T10:00:00Z",
      },
      {
        id: "msg-2",
        lead_id: "lead-1", 
        content: "Test message 2",
        sender_number: "+0987654321",
        receiver_number: "+1234567890",
        wa_timestamp: "2024-01-01T10:01:00Z",
        direction: "outbound",
        message_type: "text",
        wamid: "wamid.msg-2",
        created_at: "2024-01-01T10:01:00Z",
        updated_at: "2024-01-01T10:01:00Z",
      },
    ]),
    getConversationsWithLeads: vi.fn().mockResolvedValue([
      {
        id: "conv-1",
        lead_id: "lead-1",
        project_id: "project-1",
        last_message: "Hello there",
        last_message_time: "2024-01-01T10:00:00Z",
        message_count: 5,
        status: "active",
      },
    ]),
    getAllConversations: vi.fn().mockResolvedValue([
      {
        id: "conv-1",
        lead_id: "lead-1",
        project_id: "project-1",
        messages: [
          {
            id: "msg-1",
            content: "Hello",
            wa_timestamp: "2024-01-01T10:00:00Z",
            direction: "inbound",
          },
        ],
      },
    ]),
    getCompleteConversation: vi.fn().mockResolvedValue({
      id: "conv-1",
      lead_id: "lead-1",
      whatsappMessages: [
        {
          id: "msg-1",
          content: "Hello from complete conversation",
          wa_timestamp: "2024-01-01T10:00:00Z",
          direction: "inbound",
          message_type: "text",
          wamid: "wamid.complete-1",
          sender_number: "+1234567890",
          receiver_number: "+0987654321",
          created_at: "2024-01-01T10:00:00Z",
          updated_at: "2024-01-01T10:00:00Z",
        },
      ],
    }),
    testConnection: vi.fn().mockResolvedValue(true),
    forceRefresh: vi.fn(),
    clearUserCache: vi.fn(),
  },
  SimpleProjectService: vi.fn().mockImplementation(() => ({
    getAllProjects: vi.fn().mockResolvedValue([]),
    getProjects: vi.fn().mockResolvedValue([]),
    createProject: vi.fn().mockResolvedValue(null),
    updateProject: vi.fn().mockResolvedValue(null),
    deleteProject: vi.fn().mockResolvedValue(false),
    getAllLeads: vi.fn().mockResolvedValue([]),
    createLead: vi.fn().mockResolvedValue(null),
    updateLead: vi.fn().mockResolvedValue(null),
    deleteLead: vi.fn().mockResolvedValue(false),
    getWhatsAppMessages: vi.fn().mockResolvedValue([]),
    getCompleteConversation: vi.fn().mockResolvedValue({ whatsappMessages: [] }),
    testConnection: vi.fn().mockResolvedValue(true),
    forceRefresh: vi.fn(),
    clearUserCache: vi.fn(),
  })),
}));

// Mock CalendlyService
vi.mock("@/services/calendlyService", () => ({
  CalendlyService: class {
    static async loadPAT() {
      return Promise.resolve(null);
    }
    static async loadTokensFromUserSettings() {
      return Promise.resolve({
        access_token: null,
        refresh_token: null,
      });
    }
    static async apiRequest(endpoint: string, options?: any) {
      return Promise.resolve({ data: null });
    }
    static async getCurrentUser() {
      return Promise.resolve(null);
    }
    static async getConnectionStatus() {
      return Promise.resolve({
        connected: false,
        user: null,
        error: null,
      });
    }
  },
}));

// Mock UnifiedApiClient
vi.mock("@/services/unifiedApiClient", () => ({
  unifiedApiClient: {
    testConnection: vi.fn().mockResolvedValue(true),
    getClients: vi.fn().mockResolvedValue({ success: true, data: [] }),
    createClient: vi.fn().mockResolvedValue({ 
      success: true, 
      data: { id: "1", name: "Test Client" } 
    }),
    updateClient: vi.fn().mockResolvedValue({ 
      success: true, 
      data: { id: "1", name: "Updated Client" } 
    }),
    deleteClient: vi.fn().mockResolvedValue({ 
      success: true, 
      data: { id: "1" } 
    }),
    getProjects: vi.fn().mockResolvedValue({ success: true, data: [] }),
    createProject: vi.fn().mockResolvedValue({ 
      success: true, 
      data: { id: "1", name: "Test Project" } 
    }),
    updateProject: vi.fn().mockResolvedValue({ 
      success: true, 
      data: { id: "1", name: "Updated Project" } 
    }),
    deleteProject: vi.fn().mockResolvedValue({ 
      success: true, 
      data: { id: "1" } 
    }),
    getLeads: vi.fn().mockResolvedValue({ 
      success: true, 
      data: [
        { 
          id: "1", 
          first_name: "Test", 
          last_name: "Lead",
          email: "test@example.com",
          phone: "+1234567890",
          status: "unqualified"
        }
      ] 
    }),
    createLead: vi.fn().mockImplementation((leadData) => Promise.resolve({ 
      success: true, 
      data: { 
        id: "1", 
        first_name: leadData?.first_name || "Test", 
        last_name: leadData?.last_name || "Lead",
        email: leadData?.email || "test@example.com",
        phone: leadData?.phone || "+1234567890",
        status: leadData?.status || "unqualified"
      } 
    })),
    updateLead: vi.fn().mockImplementation((id, updates) => Promise.resolve({ 
      success: true, 
      data: { 
        id: id || "1", 
        first_name: updates?.first_name || "Updated", 
        last_name: updates?.last_name || "Lead",
        status: updates?.status || "qualified",
        lead_score: updates?.lead_score || 0,
        notes: updates?.notes || ""
      } 
    })),
    deleteLead: vi.fn().mockResolvedValue({ 
      success: true, 
      data: { id: "1" } 
    }),
    getConversations: vi.fn().mockResolvedValue({ success: true, data: [] }),
    createConversation: vi.fn().mockResolvedValue({ 
      success: true, 
      data: { id: "1", message: "Test message" } 
    }),
    updateConversation: vi.fn().mockResolvedValue({ 
      success: true, 
      data: { id: "1", message: "Updated message" } 
    }),
    deleteConversation: vi.fn().mockResolvedValue({ 
      success: true, 
      data: { id: "1" } 
    }),
  }
}));

// Global test setup for jest-dom matchers
// This file is imported in vitest.config.ts to extend expect with jest-dom matchers
