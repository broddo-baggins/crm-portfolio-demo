/**
 * GridWidget Component
 * 
 * This component renders individual widgets in the dashboard grid layout.
 * 
 * Features:
 * - Delay mechanism for settings menu: Users must hover for 300ms before the settings menu opens
 *   to prevent accidental triggering. Click events bypass the delay for immediate access.
 * - Visual feedback during hover delay with subtle animation and tooltip changes
 * - Dragging, resizing, and removal capabilities
 * - Global lock support to prevent accidental modifications
 */

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, X, Lock, GripVertical, Maximize2, Minimize2 } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { WidgetConfig } from '@/types/widgets';
import WidgetSettingsForm from './WidgetSettingsForm';
import { cn } from '@/lib/utils';
import logger from '@/services/base/logger';

// Import all widget components
import LeadFunnel from './LeadFunnel';
import TotalChats from './TotalChats';
import TotalLeads from './TotalLeads';
import ReachedLeads from './ReachedLeads';
import PropertyStats from './PropertyStats';

import TemperatureDistribution from './TemperatureDistribution';
import LeadTemperature from './LeadTemperature';
import HourlyActivity from './HourlyActivity';
import MessageHourlyDistribution from './MessageHourlyDistribution';
import MessagesSent from './MessagesSent';
import Interactions from './Interactions';
import ConversationsStarted from './ConversationsStarted';
import ConversationsCompleted from './ConversationsCompleted';
import ConversationsAbandoned from './ConversationsAbandoned';
import MeanResponseTime from './MeanResponseTime';
import AvgMessagesPerCustomer from './AvgMessagesPerCustomer';
import MeetingsVsMessages from './MeetingsVsMessages';
import ConversationAbandonedWithStage from './ConversationAbandonedWithStage';
import MeanTimeToFirstReply from './MeanTimeToFirstReply';
import AverageMessagesPerClient from './AverageMessagesPerClient';
import MostEfficientResponseHours from './MostEfficientResponseHours';
import MeetingsSetPercentage from './MeetingsSetPercentage';

interface GridWidgetProps {
  config: WidgetConfig;
  onUpdate: (config: WidgetConfig) => void;
  onRemove: (id: string) => void;
  isGlobalLocked: boolean;
}

const GridWidget: React.FC<GridWidgetProps> = ({
  config,
  onUpdate,
  onRemove,
  isGlobalLocked
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [originalSize, setOriginalSize] = useState<{w: number, h: number} | null>(null);
  
  // Add state and ref for delayed settings opening
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);
  const settingsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const SETTINGS_DELAY_MS = 300; // 300ms delay to prevent accidental opening

  // All widgets are now removable - removed the base widget restriction

  const handleSettingsSave = (updatedConfig: WidgetConfig) => {
    logger.debug('Saving widget settings', 'GridWidget', { widgetId: updatedConfig.id });
    
    try {
      // Call the update function
      onUpdate(updatedConfig);
      
      // Close settings popup
      setShowSettings(false);
      
      logger.debug('Widget settings saved successfully', 'GridWidget');
    } catch (error) {
      logger.error('Error saving widget settings', 'GridWidget', error);
    }
  };

  // Handle settings button mouse interactions with delay
  const handleSettingsMouseEnter = () => {
    setIsSettingsHovered(true);
    // Clear any existing timeout
    if (settingsTimeoutRef.current) {
      clearTimeout(settingsTimeoutRef.current);
    }
    // Set a delay before opening settings
    settingsTimeoutRef.current = setTimeout(() => {
      if (isSettingsHovered) {
        setShowSettings(true);
      }
    }, SETTINGS_DELAY_MS);
  };

  const handleSettingsMouseLeave = () => {
    setIsSettingsHovered(false);
    // Clear the timeout to prevent opening
    if (settingsTimeoutRef.current) {
      clearTimeout(settingsTimeoutRef.current);
      settingsTimeoutRef.current = null;
    }
  };

  const handleSettingsClick = () => {
    // For click events, open immediately (but still respect the hover delay)
    if (settingsTimeoutRef.current) {
      clearTimeout(settingsTimeoutRef.current);
      settingsTimeoutRef.current = null;
    }
    setShowSettings(true);
  };

  const handleSettingsOpenChange = (open: boolean) => {
    // If closing the settings
    if (!open) {
      setShowSettings(false);
      setIsSettingsHovered(false);
      // Clear any pending timeout when manually closing
      if (settingsTimeoutRef.current) {
        clearTimeout(settingsTimeoutRef.current);
        settingsTimeoutRef.current = null;
      }
    } else {
      // If trying to open, respect our delay mechanism
      // Only allow opening if user has hovered long enough or clicked
      setShowSettings(open);
    }
  };

  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => {
      if (settingsTimeoutRef.current) {
        clearTimeout(settingsTimeoutRef.current);
      }
    };
  }, []);

  const handleRemoveClick = () => {
    if (isGlobalLocked) {
      logger.debug('Cannot remove widget - dashboard is globally locked', 'GridWidget');
      return;
    }
    onRemove(config.id);
  };

  const handleMaximizeToggle = () => {
    if (isGlobalLocked) {
      logger.debug('Cannot resize widget - dashboard is globally locked', 'GridWidget');
      return;
    }
    
    const newMaximized = !isMaximized;
    
    let newWidth, newHeight;
    
    if (newMaximized) {
      // Store original size before maximizing
      setOriginalSize({ w: config.gridLayout.w, h: config.gridLayout.h });
      // Maximize to full size
      newWidth = 12;
      newHeight = 8;
    } else {
      // Restore to original size or default if not stored
      const original = originalSize || { w: 3, h: 3 };
      newWidth = original.w;
      newHeight = original.h;
      setOriginalSize(null);
    }
    
    setIsMaximized(newMaximized);
    
    // Create updated widget config with new size
    const updatedConfig: WidgetConfig = {
      ...config,
      gridLayout: {
        ...config.gridLayout,
        w: newWidth,
        h: newHeight
      }
    };
    
    logger.debug('Toggling maximize for widget', 'GridWidget', { 
      widgetId: config.id, 
      maximized: newMaximized, 
      size: `${newWidth}x${newHeight}` 
    });
    onUpdate(updatedConfig);
  };

  // Render the appropriate widget content based on type
  const renderWidgetContent = () => {
    try {
      switch (config.type) {
        case 'lead-funnel':
          return <LeadFunnel />;
        case 'total-chats':
          return <TotalChats title={config.title} />;
        case 'total-leads':
          return <TotalLeads />;
        case 'reached-leads':
          return <ReachedLeads />;
        case 'property-stats':
          return <PropertyStats title={config.title} />;
        case 'temperature-distribution':
          return <TemperatureDistribution />;
        case 'lead-temperature':
          return <LeadTemperature />;
        case 'hourly-activity':
          return <HourlyActivity />;
        case 'message-hourly-distribution':
          return <MessageHourlyDistribution />;
        case 'messages-sent':
          return <MessagesSent />;
        case 'interactions':
          return <Interactions />;
        case 'conversations-started':
          return <ConversationsStarted />;
        case 'conversations-completed':
          return <ConversationsCompleted />;
        case 'conversations-abandoned':
          return <ConversationsAbandoned />;
        case 'mean-response-time':
          return <MeanResponseTime />;
        case 'avg-messages-per-customer':
          return <AvgMessagesPerCustomer />;
        case 'meetings-vs-messages':
          return <MeetingsVsMessages />;
        case 'conversation-abandoned-with-stage':
          return <ConversationAbandonedWithStage />;
        case 'mean-time-to-first-reply':
          return <MeanTimeToFirstReply />;
        case 'average-messages-per-client':
          return <AverageMessagesPerClient />;
        case 'most-efficient-response-hours':
          return <MostEfficientResponseHours />;
        case 'meetings-set-percentage':
          return <MeetingsSetPercentage />;
        default:
          logger.warn('Unknown widget type', 'GridWidget', { widgetType: config.type });
          return (
            <div className="flex items-center justify-center h-full text-gray-500">
              Unknown widget type: {config.type}
            </div>
          );
      }
    } catch (error) {
      logger.error('Error rendering widget', 'GridWidget', error);
      return (
        <div className="flex items-center justify-center h-full text-red-500">
          Error rendering widget
        </div>
      );
    }
  };

  // Determine if widget controls should be shown
  const showControls = !isGlobalLocked;
  const canInteract = !isGlobalLocked;

  return (
    <div className={cn("h-full w-full", showSettings && "opacity-60 pointer-events-none")}>
      <Card className={`h-full flex flex-col shadow-md hover:shadow-lg transition-all duration-200 ${
        isGlobalLocked ? 'ring-2 ring-orange-400 bg-orange-50/30' : 
        'hover:ring-1 hover:ring-blue-200'
      }`}>
        <CardHeader className="flex flex-row items-center justify-between p-3 pb-2 bg-gray-50 border-b min-h-[60px]">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {canInteract && (
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move drag-handle flex-shrink-0" />
            )}
            <CardTitle className="text-sm font-medium truncate flex-1 min-w-0 text-left" title={config.title}>
              {config.title}
            </CardTitle>
          </div>
          
          <div className="flex items-center space-x-1 flex-shrink-0">
            {showControls && (
              <>
                {/* Settings Popover */}
                <Popover open={showSettings} onOpenChange={handleSettingsOpenChange}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-7 w-7 p-0 text-gray-500 hover:text-gray-700 transition-all duration-200 ${
                        isSettingsHovered ? 'bg-gray-100 scale-105' : ''
                      }`}
                      title={isSettingsHovered ? "Opening settings..." : "Widget settings (hover to open)"}
                      disabled={isGlobalLocked}
                      onMouseEnter={handleSettingsMouseEnter}
                      onMouseLeave={handleSettingsMouseLeave}
                      onClick={handleSettingsClick}
                    >
                      <Settings className={`h-3 w-3 transition-all duration-200 ${
                        isGlobalLocked ? 'text-gray-400' : 
                        isSettingsHovered ? 'animate-pulse' : ''
                      }`} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="bottom"
                    align="end"
                    sideOffset={6}
                    className="w-72 p-0 shadow-xl border-gray-200 rtl:rtl-popover-align-end"
                    style={{ zIndex: 1000 }}
                    avoidCollisions={true}
                    collisionPadding={8}
                    alignOffset={0}
                  >
                    <div className="p-4">
                      <WidgetSettingsForm
                        config={config}
                        onSubmit={handleSettingsSave}
                        onDelete={handleRemoveClick}
                        onClose={() => setShowSettings(false)}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                
                {/* Maximize/Minimize Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMaximizeToggle}
                  className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700"
                  title={isMaximized ? "Minimize widget" : "Maximize widget"}
                  aria-label={isMaximized ? "Minimize widget" : "Maximize widget"}
                  disabled={isGlobalLocked}
                >
                  {isMaximized ? (
                    <Minimize2 className={`h-3 w-3 ${isGlobalLocked ? 'text-gray-400' : ''}`} />
                  ) : (
                    <Maximize2 className={`h-3 w-3 ${isGlobalLocked ? 'text-gray-400' : ''}`} />
                  )}
                </Button>

                {/* Remove Button - Now available for all widgets */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveClick}
                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                  title="Remove widget"
                  disabled={isGlobalLocked}
                >
                  <X className={`h-3 w-3 ${isGlobalLocked ? 'text-gray-400' : ''}`} />
                </Button>
              </>
            )}
            
            {/* Lock Status Indicator */}
            {isGlobalLocked && (
              <div title="Dashboard is globally locked" className="flex items-center">
                <Lock className="h-3 w-3 text-orange-600" />
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 overflow-hidden">
          <div className="h-full widget-content">
            {renderWidgetContent()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GridWidget;