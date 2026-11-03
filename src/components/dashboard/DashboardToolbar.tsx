import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Lock, 
  Unlock, 
  Plus, 
  Grid3X3, 
  Maximize2,
  Settings,
  Activity
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardToolbarProps {
  // Lock state
  isGlobalLocked: boolean;
  onToggleGlobalLock: () => void;
  
  // Layout controls - auto-save status only
  hasUnsavedChanges: boolean;
  onOrganizeWidgets: () => void;
  onAutoResize: () => void;
  
  // Widget management
  onAddWidget: () => void;
  
  // Dashboard settings
  onOpenDashboardSettings: () => void;
  
  // Stats
  totalWidgets: number;
  activeWidgets: number;
  lockedWidgets: number;
}

const DashboardToolbar: React.FC<DashboardToolbarProps> = ({
  isGlobalLocked,
  onToggleGlobalLock,
  hasUnsavedChanges,
  onOrganizeWidgets,
  onAutoResize,
  onAddWidget,
  onOpenDashboardSettings,
  totalWidgets,
  activeWidgets,
  lockedWidgets
}) => {
  return (
    <TooltipProvider>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6 p-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Dashboard Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h2>
              <Badge variant="outline" className="text-xs">
                {totalWidgets} widgets
              </Badge>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {activeWidgets} active
              </span>
              {lockedWidgets > 0 && (
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-blue-500" />
                  {lockedWidgets} locked
                </span>
              )}
              
              {/* Auto-save status indicators */}
              {hasUnsavedChanges && (
                <Badge variant="destructive" className="text-xs">
                  <Activity className="w-3 h-3 mr-1" />
                  Auto-saving...
                </Badge>
              )}
              
              {!hasUnsavedChanges && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                  ✓ Auto-saved
                </Badge>
              )}
            </div>
          </div>

          {/* Right Section - Controls */}
          <div className="flex items-center gap-2">
            {/* Widget Management */}
            <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAddWidget}
                    className="h-8 px-3 text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add new widget</TooltipContent>
              </Tooltip>
            </div>

            {/* Layout Controls */}
            {!isGlobalLocked && (
              <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onAutoResize}
                      className="h-8 px-2 text-gray-600 hover:text-gray-800"
                      aria-label="Auto-resize widgets"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Auto-resize widgets</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onOrganizeWidgets}
                      className="h-8 px-2 text-gray-600 hover:text-gray-800"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Organize widgets</TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* Lock Controls */}
            <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleGlobalLock}
                    className={`h-8 w-8 p-0 transition-colors ${
                      isGlobalLocked 
                        ? 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    {isGlobalLocked ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Unlock className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isGlobalLocked ? 'Unlock dashboard' : 'Lock dashboard'}
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Settings */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onOpenDashboardSettings}
                    className="h-8 px-2 text-gray-600 hover:text-gray-800"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Dashboard settings</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default DashboardToolbar; 