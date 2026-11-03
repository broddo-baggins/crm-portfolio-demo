import React, { useState, useCallback, useMemo } from 'react';
import { Responsive, WidthProvider, type Layout } from 'react-grid-layout/legacy';
import { WidgetConfig } from '@/types/widgets';
import { toast } from "sonner";
import GridWidget from './GridWidget';
import DashboardToolbar from './DashboardToolbar';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface GridDashboardProps {
  widgets: WidgetConfig[];
  onUpdateWidget: (config: WidgetConfig) => void;
  onRemoveWidget: (id: string) => void;
  onOrganizeWidgets?: () => void;
  onAddWidget: () => void;
  hasUnsavedChangesFromContext: boolean;
}

const GridDashboard: React.FC<GridDashboardProps> = ({
  widgets,
  onUpdateWidget,
  onRemoveWidget,
  onOrganizeWidgets,
  onAddWidget,
  hasUnsavedChangesFromContext
}) => {
  const [isGlobalLocked, setIsGlobalLocked] = useState(false);

  // Convert widgets to grid layout format with proper lock handling
  const layouts = useMemo(() => ({
    lg: widgets.map(widget => {
      if (!widget.gridLayout) {
        console.warn('Widget missing gridLayout:', widget);
        return {
          i: widget.id,
          x: 0,
          y: 0,
          w: 3,
          h: 3,
          minW: 2,
          minH: 2,
          maxW: 12,
          maxH: 8,
          static: isGlobalLocked,
          isDraggable: !isGlobalLocked,
          isResizable: !isGlobalLocked
        };
      }

      return {
        i: widget.id,
        x: widget.gridLayout.x,
        y: widget.gridLayout.y,
        w: widget.gridLayout.w,
        h: widget.gridLayout.h,
        minW: widget.gridLayout.minW || 2,
        minH: widget.gridLayout.minH || 2,
        maxW: widget.gridLayout.maxW || 12,
        maxH: widget.gridLayout.maxH || 8,
        static: isGlobalLocked,
        isDraggable: !isGlobalLocked,
        isResizable: !isGlobalLocked
      };
    })
  }), [widgets, isGlobalLocked]);

  // Handle layout changes with proper grid snapping
  const onLayoutChange = useCallback((layout: Layout) => {
    if (isGlobalLocked) {
      console.log('Layout change blocked - dashboard is globally locked');
      return;
    }
    console.log('Layout change triggered in GridDashboard:', layout);
    const layoutMap = new Map(layout.map(item => [item.i, item]));
    const updatedWidgets: WidgetConfig[] = [];

    widgets.forEach(widget => {
      const layoutItem = layoutMap.get(widget.id);
      if (layoutItem && widget.gridLayout) { // Ensure gridLayout exists
        const snappedLayout = {
          x: Math.round(layoutItem.x),
          y: Math.round(layoutItem.y),
          w: Math.max(Math.round(layoutItem.w), widget.gridLayout.minW || 2),
          h: Math.max(Math.round(layoutItem.h), widget.gridLayout.minH || 2)
        };

        if (
          widget.gridLayout.x !== snappedLayout.x ||
          widget.gridLayout.y !== snappedLayout.y ||
          widget.gridLayout.w !== snappedLayout.w ||
          widget.gridLayout.h !== snappedLayout.h
        ) {
          const updatedWidget = {
            ...widget,
            gridLayout: {
              ...widget.gridLayout,
              ...snappedLayout
            }
          };
          updatedWidgets.push(updatedWidget);
        }
      }
    });

    if (updatedWidgets.length > 0) {
      console.log('GridDashboard: Calling onUpdateWidget for batch update:', updatedWidgets.length, 'widgets');
      updatedWidgets.forEach(widget => onUpdateWidget(widget));
    }
  }, [widgets, onUpdateWidget, isGlobalLocked]);

  // Toggle global lock/unlock
  const toggleGlobalLock = useCallback(() => {
    const newLockState = !isGlobalLocked;
    setIsGlobalLocked(newLockState);
    
    if (newLockState) {
      toast.info("🔒 Dashboard locked - all widgets are now fixed in position");
    } else {
      toast.info("🔓 Dashboard unlocked - you can now move and resize widgets");
    }
  }, [isGlobalLocked]);

  // Auto-resize widgets to fit content with minimal whitespace
  const autoResizeWidgets = useCallback(() => {
    let resizedCount = 0;
    const resizeUpdates: WidgetConfig[] = [];
    
    widgets.forEach(widget => {
      // Auto-resize logic based on widget type - optimized for minimal whitespace
      let optimalSize: { w: number; h: number };
      
      switch (widget.type) {
        case 'lead-funnel':
        case 'meetings-set-percentage':
          optimalSize = { w: 3, h: 4 }; // Reduced from 4x6 to 3x4
          break;
        case 'temperature-distribution':
        case 'hourly-activity':
        case 'message-hourly-distribution':
          optimalSize = { w: 4, h: 3 }; // Reduced from 6x4 to 4x3
          break;
        case 'property-stats':
        case 'meetings-vs-messages':
        case 'conversation-abandoned-with-stage':
        case 'most-efficient-response-hours':
          optimalSize = { w: 3, h: 3 }; // Reduced from 4x4 to 3x3
          break;
        case 'lead-temperature':
          optimalSize = { w: 4, h: 4 }; // Compact size for lead temperature
          break;
        default:
          optimalSize = { w: 2, h: 2 }; // Minimal size for basic widgets
      }
      
      if (widget.gridLayout.w !== optimalSize.w || widget.gridLayout.h !== optimalSize.h) {
        resizeUpdates.push({
          ...widget,
          gridLayout: {
            ...widget.gridLayout,
            w: optimalSize.w,
            h: optimalSize.h
          }
        });
        resizedCount++;
      }
    });
    
    resizeUpdates.forEach(widget => onUpdateWidget(widget));
    
    if (resizedCount > 0) {
      // No direct save here, context will handle it.
      toast.success(`📐 Auto-resized ${resizedCount} widgets to minimal size. Changes will be auto-saved.`);
    } else {
      toast.info("All widgets are already optimally sized");
    }
  }, [widgets, onUpdateWidget]);

  const totalWidgetCount = widgets.length;

  return (
    <div className="relative min-h-[600px]">
      {/* New Unified Toolbar */}
      <DashboardToolbar
        isGlobalLocked={isGlobalLocked}
        onToggleGlobalLock={toggleGlobalLock}
        hasUnsavedChanges={hasUnsavedChangesFromContext}
        onOrganizeWidgets={onOrganizeWidgets || (() => {})}
        onAutoResize={autoResizeWidgets}
        onAddWidget={onAddWidget}
        onOpenDashboardSettings={() => {}}
        totalWidgets={totalWidgetCount}
        activeWidgets={widgets.filter(w => w.enabled).length}
        lockedWidgets={0} // No individual widget locks anymore
      />

      {/* Grid Layout */}
      <div className="min-h-[600px]">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 24, md: 20, sm: 12, xs: 8, xxs: 4 }}
          rowHeight={80}
          margin={[6, 6]}
          containerPadding={[12, 12]}
          onLayoutChange={onLayoutChange}
          isDraggable={!isGlobalLocked}
          isResizable={!isGlobalLocked}
          useCSSTransforms={false}
          compactType="vertical"
          preventCollision={false}
          allowOverlap={false}
          autoSize={true}
          key={`grid-${isGlobalLocked}-${widgets.length}`}
          resizeHandles={['se']}
          transformScale={1}
          isBounded={true}
          resizeHandle={<div className="react-resizable-handle react-resizable-handle-se" />}
        >
          {widgets.map(widget => (
            <div key={widget.id} data-grid={widget.gridLayout} className="bg-white rounded-lg shadow-md">
              <GridWidget
                config={widget}
                onUpdate={onUpdateWidget}
                onRemove={onRemoveWidget}
                isGlobalLocked={isGlobalLocked}
              />
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
};

export default GridDashboard;