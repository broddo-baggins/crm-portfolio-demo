import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from 'react';

// CRITICAL: React Context Guard
if (typeof createContext === 'undefined') {
  throw new Error('[Dashboard Context] React createContext is not available. This indicates a module loading issue.');
}

import { WidgetType, WidgetConfig, WidgetSettings } from '@/types/widgets';
import { dashboardPersistence, DashboardLayout } from '@/services/dashboardPersistence';
import { toast } from "sonner";
import logger from '@/services/base/logger';

interface DashboardContextType {
  widgets: WidgetConfig[];
  addWidget: (type: WidgetType) => void;
  updateWidget: (widget: WidgetConfig) => void;
  removeWidget: (id: string) => void;
  saveLayout: () => void;
  loadLayout: () => void;
  resetToDefault: () => void;
  organizeWidgets: () => void;
  hasUnsavedChanges: boolean;
  manualSaveLayout: () => void;
}

// CRITICAL: Safe context creation with error handling - SINGLETON
let DashboardContext: React.Context<DashboardContextType | undefined>;

try {
  DashboardContext = createContext<DashboardContextType | undefined>(undefined);
  // Removed context creation log for cleaner user experience
  // console.log('[Dashboard Context] Context created successfully');
} catch (error) {
  console.error('[Dashboard Context] Failed to create context:', error);
  throw new Error('Dashboard context creation failed - React may not be properly loaded', { cause: error });
}

// Prevent multiple provider instances
let isProviderMounted = false;

const defaultSettings: WidgetSettings = {
  refreshInterval: 30,
  showLegend: true,
  showTooltip: true
};

const defaultWidgets: WidgetConfig[] = [
  {
    id: 'total-leads-default',
    type: 'total-leads',
    title: 'Total Leads',
    position: { x: 0, y: 0 },
    size: { width: 300, height: 200 },
    enabled: true,
    settings: { ...defaultSettings, timeRange: 'week' },
    gridLayout: { i: 'total-leads-default', x: 0, y: 0, w: 3, h: 3, minW: 2, minH: 2, maxW: 12, maxH: 8 },
    locked: false
  },
  {
    id: 'reached-leads-default',
    type: 'reached-leads',
    title: 'Reached Leads',
    position: { x: 300, y: 0 },
    size: { width: 300, height: 200 },
    enabled: true,
    settings: { ...defaultSettings, timeRange: 'week' },
    gridLayout: { i: 'reached-leads-default', x: 3, y: 0, w: 3, h: 3, minW: 2, minH: 2, maxW: 12, maxH: 8 },
    locked: false
  },
  {
    id: 'conversations-completed-default',
    type: 'conversations-completed',
    title: 'Conversations Completed',
    position: { x: 600, y: 0 },
    size: { width: 300, height: 200 },
    enabled: true,
    settings: { ...defaultSettings, timeRange: 'week' },
    gridLayout: { i: 'conversations-completed-default', x: 6, y: 0, w: 3, h: 3, minW: 2, minH: 2, maxW: 12, maxH: 8 },
    locked: false
  },
  {
    id: 'lead-temperature-default',
    type: 'lead-temperature',
    title: 'Lead Temperature',
    position: { x: 0, y: 300 },
    size: { width: 400, height: 300 },
    enabled: true,
    settings: { ...defaultSettings, timeRange: 'week' },
    gridLayout: { i: 'lead-temperature-default', x: 0, y: 3, w: 4, h: 4, minW: 2, minH: 2, maxW: 12, maxH: 8 },
    locked: false
  }
];

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Prevent multiple provider instances
  useEffect(() => {
    if (isProviderMounted) {
      console.warn('[Dashboard Context] Multiple DashboardProvider instances detected - this may cause issues');
    }
    isProviderMounted = true;
    
    return () => {
      isProviderMounted = false;
    };
  }, []);

  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    // Load initial state from localStorage if available (ONCE)
    const savedLayout = localStorage.getItem('dashboard-layout');
    let loadedWidgets: WidgetConfig[];
    
    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout);
        if (parsedLayout.widgets) {
          loadedWidgets = parsedLayout.widgets;
          
          // Migration/cleanup: ensure all widgets have valid gridLayout
          let cleaned = false;
          loadedWidgets = loadedWidgets.map((widget, idx) => {
            if (!widget.gridLayout || typeof widget.gridLayout.x !== 'number' || typeof widget.gridLayout.y !== 'number') {
              cleaned = true;
              const cols = 24;
              const w = widget.gridLayout?.w || 3;
              const h = widget.gridLayout?.h || 3;
              const x = (idx * w) % cols;
              const y = Math.floor((idx * w) / cols) * h;
              return {
                ...widget,
                gridLayout: {
                  ...widget.gridLayout,
                  x, y, w, h,
                  minW: widget.gridLayout?.minW || 2,
                  minH: widget.gridLayout?.minH || 2,
                  maxW: widget.gridLayout?.maxW || 12,
                  maxH: widget.gridLayout?.maxH || 8,
                  i: widget.id
                }
              };
            }
            return widget;
          });
          
          if (cleaned) {
            const cleanedLayout = {
              widgets: loadedWidgets,
              timestamp: new Date().toISOString(),
              version: '1.0'
            };
            localStorage.setItem('dashboard-layout', JSON.stringify(cleanedLayout));
            console.log('[Dashboard Context] Cleaned and saved fixed widget layout');
          }
          
          // Only log once during initialization - removed for cleaner UX
          // console.log('[Dashboard Context] Loaded widgets from localStorage:', loadedWidgets.length);
          return loadedWidgets;
        }
      } catch (e) {
        console.error('[Dashboard Context] Error parsing saved layout:', e);
      }
    }
    
    // Only log once if using defaults - removed for cleaner UX
    // console.log('[Dashboard Context] Using default widgets:', defaultWidgets.length);
    return defaultWidgets;
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialWidgetsRef = useRef(JSON.stringify(widgets));
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Auto-save logic - optimized to reduce console spam
  useEffect(() => {
    const currentWidgetsString = JSON.stringify(widgets);
    const hasActualChanges = currentWidgetsString !== initialWidgetsRef.current;
    
    if (hasActualChanges) {
      setHasUnsavedChanges(true);
      
      // Clear any existing timeout
      if (saveTimeout.current) clearTimeout(saveTimeout.current);

      // Critical changes: save immediately
      const hasCriticalChanges = widgets.some((widget, index) => {
        try {
          const originalWidgets = JSON.parse(initialWidgetsRef.current);
          const originalWidget = originalWidgets[index];
          return !originalWidget || 
                 JSON.stringify(widget.settings) !== JSON.stringify(originalWidget.settings) ||
                 JSON.stringify(widget.gridLayout) !== JSON.stringify(originalWidget.gridLayout);
        } catch {
          return true;
        }
      });

      if (hasCriticalChanges) {
        // Immediate save for critical changes
        const layoutData: DashboardLayout = {
          widgets,
          timestamp: new Date().toISOString(),
          version: '1.0'
        };
        
        try {
          localStorage.setItem('dashboard-layout', JSON.stringify(layoutData));
          console.log('[Dashboard Context] Critical changes saved immediately');
        } catch (error) {
          console.error('[Dashboard Context] Error saving critical changes:', error);
        }
      }

      // Debounced auto-save
      saveTimeout.current = setTimeout(async () => {
        const layoutData: DashboardLayout = {
          widgets,
          timestamp: new Date().toISOString(),
          version: '1.0'
        };
        
        try {
          const result = await dashboardPersistence.saveDashboardLayout(layoutData);
          
          if (result.success) {
            setHasUnsavedChanges(false);
            initialWidgetsRef.current = currentWidgetsString;
          }
        } catch (error) {
          console.error('[Dashboard Context] Auto-save error:', error);
        }
      }, 2000);
    } else if (hasUnsavedChanges) {
      setHasUnsavedChanges(false);
    }

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [widgets, hasUnsavedChanges]);

  const manualSaveLayout = useCallback(async () => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    const layoutData: DashboardLayout = {
      widgets,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    try {
      toast.loading("Saving dashboard layout...", { id: 'save-toast' });
      
      const result = await dashboardPersistence.forceSaveToServer(layoutData);
      
      if (result.success) {
        setHasUnsavedChanges(false);
        initialWidgetsRef.current = JSON.stringify(widgets);
        
        if (result.savedToServer) {
          toast.success("Dashboard saved to server!", { id: 'save-toast' });
        } else if (result.savedLocally) {
          toast.success("Dashboard saved locally (server unavailable)", { id: 'save-toast' });
        }
      } else {
        toast.error(`Save failed: ${result.error}`, { id: 'save-toast' });
      }
    } catch (error) {
      console.error('[Dashboard Context] Manual save failed:', error);
      toast.error("Failed to save dashboard", { id: 'save-toast' });
    }
  }, [widgets]);

  // Widget management functions
  const updateWidget = useCallback((updatedWidget: WidgetConfig) => {
    setWidgets(prev => {
      const updated = prev.map(widget => {
        if (widget.id === updatedWidget.id) {
          return {
            ...widget,
            ...updatedWidget,
            settings: {
              ...widget.settings,
              ...updatedWidget.settings
            },
            gridLayout: {
              ...widget.gridLayout,
              ...updatedWidget.gridLayout,
              i: widget.id
            },
            position: updatedWidget.position || widget.position,
            title: updatedWidget.settings?.customTitle || updatedWidget.title || widget.title
          };
        }
        return widget;
      });

      // Save to localStorage immediately
      const layoutData = {
        widgets: updated,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      
      try {
        localStorage.setItem('dashboard-layout', JSON.stringify(layoutData));
      } catch (error) {
        console.error('[Dashboard Context] Error saving to localStorage:', error);
      }

      return updated;
    });
  }, []);

  // Helper function to get widget grid configuration
  const getWidgetGridConfig = (type: WidgetType) => {
    const configs = {
      'total-leads': { w: 3, h: 3, minW: 2, minH: 2, maxW: 8, maxH: 6 },
      'reached-leads': { w: 3, h: 3, minW: 2, minH: 2, maxW: 8, maxH: 6 },
      'conversations-completed': { w: 3, h: 3, minW: 2, minH: 2, maxW: 8, maxH: 6 },
      'lead-temperature': { w: 4, h: 4, minW: 2, minH: 2, maxW: 8, maxH: 6 },
      'recent-messages': { w: 6, h: 4, minW: 2, minH: 2, maxW: 12, maxH: 8 },
      'performance-metrics': { w: 4, h: 3, minW: 2, minH: 2, maxW: 8, maxH: 6 }
    };
    return configs[type] || { w: 3, h: 3, minW: 2, minH: 2, maxW: 8, maxH: 6 };
  };

  const addWidget = useCallback((type: WidgetType) => {
    try {
      // Find available position
      const findAvailablePosition = (widgetWidth: number, widgetHeight: number) => {
        const cols = 24;
        const gridMap: boolean[][] = [];
        const maxY = Math.max(...widgets.map(w => w.gridLayout.y + w.gridLayout.h), 0);
        
        // Initialize grid map
        for (let y = 0; y <= maxY + 10; y++) {
          gridMap[y] = new Array(cols).fill(false);
        }
        
        // Mark occupied spaces
        widgets.forEach(widget => {
          const { x, y, w, h } = widget.gridLayout;
          for (let row = y; row < y + h; row++) {
            for (let col = x; col < x + w; col++) {
              if (gridMap[row] && col < cols) {
                gridMap[row][col] = true;
              }
            }
          }
        });
        
        // Find first available position
        for (let y = 0; y < gridMap.length; y++) {
          for (let x = 0; x <= cols - widgetWidth; x++) {
            let canPlace = true;
            
            for (let row = y; row < y + widgetHeight && canPlace; row++) {
              for (let col = x; col < x + widgetWidth && canPlace; col++) {
                if (!gridMap[row] || gridMap[row][col]) {
                  canPlace = false;
                }
              }
            }
            
            if (canPlace) {
              return { x, y };
            }
          }
        }
        
        return { x: 0, y: maxY + 1 };
      };

      const widgetGridConfig = getWidgetGridConfig(type);
      const position = findAvailablePosition(widgetGridConfig.w, widgetGridConfig.h);
      
      const widgetId = `${type}-${Date.now()}`;
      const newWidget: WidgetConfig = {
        id: widgetId,
        type,
        title: type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        position: { x: position.x * 100, y: position.y * 100 },
        size: { width: 400, height: 300 },
        enabled: true,
        settings: defaultSettings,
        gridLayout: { 
          i: widgetId,
          x: position.x, 
          y: position.y, 
          ...widgetGridConfig
        },
        locked: false
      };

      setWidgets(prevWidgets => [...prevWidgets, newWidget]);
      toast.success('Widget added successfully');
      
    } catch (error) {
      console.error('[Dashboard Context] Error adding widget:', error);
      toast.error('Failed to add widget');
    }
  }, [widgets]);

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));
    
    // Force save after removal
    setTimeout(() => {
      const layoutData = {
        widgets: widgets.filter(widget => widget.id !== id),
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      localStorage.setItem('dashboard-layout', JSON.stringify(layoutData));
    }, 100);
  }, [widgets]);

  const saveLayout = useCallback(() => {
    try {
      const layoutData = {
        widgets,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      localStorage.setItem('dashboard-layout', JSON.stringify(layoutData));
      return true;
    } catch (error) {
      console.error('[Dashboard Context] Failed to save layout:', error);
      return false;
    }
  }, [widgets]);

  const loadLayout = useCallback(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    const savedLayout = localStorage.getItem('dashboard-layout');
    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout);
        if (parsedLayout.widgets) {
          setWidgets(parsedLayout.widgets);
          initialWidgetsRef.current = JSON.stringify(parsedLayout.widgets);
          setHasUnsavedChanges(false);
          console.log('[Dashboard Context] Layout loaded from localStorage');
          return;
        }
      } catch (e) {
        console.error('[Dashboard Context] Error loading layout:', e);
        toast.error("Error loading layout.");
      }
    }
    toast.info("No saved layout found.");
  }, []);

  const resetToDefault = useCallback(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    setWidgets(defaultWidgets);
    initialWidgetsRef.current = JSON.stringify(defaultWidgets);
    setHasUnsavedChanges(false);
    toast.info("Dashboard reset to default layout.");
  }, []);

  const organizeWidgets = useCallback(() => {
    const sortedWidgets = [...widgets].sort((a, b) => {
      const aTime = parseInt(a.id.split('-').pop() || '0');
      const bTime = parseInt(b.id.split('-').pop() || '0');
      return aTime - bTime;
    });

    const cols = 24;
    let currentX = 0;
    let currentY = 0;
    let maxHeightInRow = 0;

    const reorganizedWidgets = sortedWidgets.map((widget) => {
      const widgetWidth = widget.gridLayout.w;
      const widgetHeight = widget.gridLayout.h;
      
      if (currentX + widgetWidth > cols) {
        currentX = 0;
        currentY += maxHeightInRow;
        maxHeightInRow = 0;
      }

      const updatedWidget = {
        ...widget,
        gridLayout: {
          ...widget.gridLayout,
          x: currentX,
          y: currentY
        }
      };

      currentX += widgetWidth;
      maxHeightInRow = Math.max(maxHeightInRow, widgetHeight);
      
      return updatedWidget;
    });

    setWidgets(reorganizedWidgets);
  }, [widgets]);

  return (
    <DashboardContext.Provider value={{
      widgets,
      addWidget,
      updateWidget,
      removeWidget,
      saveLayout,
      loadLayout,
      resetToDefault,
      organizeWidgets,
      hasUnsavedChanges,
      manualSaveLayout
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}; 