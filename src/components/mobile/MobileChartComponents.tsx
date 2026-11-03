import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMobileInfo } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Expand,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Eye,
  Download,
  Share2,
} from "lucide-react";

interface MobileChartProps {
  title: string;
  data: any[];
  type: "bar" | "line" | "pie" | "area";
  config?: any;
  height?: number;
  description?: string;
  insights?: string[];
  isLoading?: boolean;
  className?: string;
  onExport?: () => void;
  onShare?: () => void;
}

// Mobile-optimized chart wrapper
export const MobileChart: React.FC<MobileChartProps> = ({
  title,
  data,
  type,
  config,
  height = 250,
  description,
  insights = [],
  isLoading = false,
  className,
  onExport,
  onShare,
}) => {
  const { t } = useTranslation("common");
  const { isMobile, touchSupported } = useMobileInfo();
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!isMobile) {
    // Return null or desktop version for non-mobile
    return null;
  }

  const renderChart = (chartHeight: number = height) => {
    const commonProps = {
      width: "100%",
      height: chartHeight,
      data,
    };

    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={config?.xAxis || "name"} 
                fontSize={12}
                tick={{ fill: "#666" }}
              />
              <YAxis fontSize={12} tick={{ fill: "#666" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar 
                dataKey={config?.yAxis || "value"} 
                fill="#C24816"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={config?.xAxis || "name"} 
                fontSize={12}
                tick={{ fill: "#666" }}
              />
              <YAxis fontSize={12} tick={{ fill: "#666" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line 
                type="monotone" 
                dataKey={config?.yAxis || "value"} 
                stroke="#C24816"
                strokeWidth={2}
                dot={{ fill: "#C24816", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#C24816" }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={chartHeight / 3}
                fill="#3E5F77"
                dataKey={config?.valueKey || "value"}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={config?.colors?.[index % config.colors.length] || `hsl(${index * 45}, 70%, 60%)`}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="text-center text-gray-500">Chart type not supported</div>;
    }
  };

  const ChartCard = ({ isExpanded = false }: { isExpanded?: boolean }) => (
    <Card className={cn(
      "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700",
      className
    )}>
      <CardHeader className={cn(
        "pb-2",
        isExpanded ? "p-6" : "p-4"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className={cn(
              "font-semibold text-gray-900 dark:text-slate-100",
              isExpanded ? "text-lg" : "text-base"
            )}>
              {title}
            </CardTitle>
            {description && (
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                {description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            {!isExpanded && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsFullScreen(true)}
                aria-label={t("actions.expand", "Expand chart")}
              >
                <Expand className="h-4 w-4" />
              </Button>
            )}
            
            {onExport && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onExport}
                aria-label={t("actions.export", "Export chart")}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            
            {onShare && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onShare}
                aria-label={t("actions.share", "Share chart")}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={cn(
        isExpanded ? "p-6 pt-0" : "p-4 pt-0"
      )}>
        {isLoading ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-gray-500">Loading chart...</span>
          </div>
        ) : (
          <>
            {renderChart(isExpanded ? 400 : height)}
            
            {/* Key Insights */}
            {insights.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  {t("charts.insights", "Key Insights")}
                </h4>
                <div className="space-y-1">
                  {insights.slice(0, isExpanded ? insights.length : 2).map((insight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-slate-400">{insight}</p>
                    </div>
                  ))}
                  {!isExpanded && insights.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setIsFullScreen(true)}
                    >
                      View {insights.length - 2} more insights
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* Compact Chart Card */}
      <ChartCard />

      {/* Full Screen Modal */}
      <Sheet open={isFullScreen} onOpenChange={setIsFullScreen}>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] p-0 rounded-t-xl"
        >
          <SheetHeader className="p-6 border-b">
            <SheetTitle className="text-left">{title}</SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 overflow-auto p-6">
            <ChartCard isExpanded={true} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

// Mobile Chart Grid - Responsive grid for multiple charts
interface MobileChartGridProps {
  charts: Array<{
    id: string;
    component: React.ReactNode;
  }>;
  className?: string;
}

export const MobileChartGrid: React.FC<MobileChartGridProps> = ({
  charts,
  className,
}) => {
  const { isMobile } = useMobileInfo();

  if (!isMobile) return null;

  return (
    <div className={cn(
      "grid grid-cols-1 gap-4",
      // Single column on mobile for better readability
      className
    )}>
      {charts.map((chart) => (
        <div key={chart.id}>
          {chart.component}
        </div>
      ))}
    </div>
  );
};

// Mobile Chart Tabs - For switching between different chart views
interface MobileChartTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    content: React.ReactNode;
  }>;
  defaultTab?: string;
  className?: string;
}

export const MobileChartTabs: React.FC<MobileChartTabsProps> = ({
  tabs,
  defaultTab,
  className,
}) => {
  const { isMobile } = useMobileInfo();

  if (!isMobile) return null;

  return (
    <Tabs defaultValue={defaultTab || tabs[0]?.id} className={className}>
      <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="flex items-center gap-1 text-xs"
            >
              {Icon && <Icon className="h-3 w-3" />}
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-4">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

// Mobile Summary Cards - Quick stats before charts
interface MobileSummaryCardsProps {
  stats: Array<{
    label: string;
    value: string | number;
    change?: {
      value: number;
      label: string;
      direction: "up" | "down" | "neutral";
    };
    icon?: React.ComponentType<{ className?: string }>;
    color?: "blue" | "green" | "red" | "yellow" | "purple";
  }>;
  className?: string;
}

export const MobileSummaryCards: React.FC<MobileSummaryCardsProps> = ({
  stats,
  className,
}) => {
  const { isMobile } = useMobileInfo();

  if (!isMobile) return null;

  return (
    <div className={cn(
      "grid grid-cols-2 gap-3 mb-6",
      className
    )}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const colorClasses = {
          blue: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
          green: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
          red: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
          yellow: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
          purple: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
        };

        return (
          <Card key={index} className="p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                  {stat.label}
                </p>
                {Icon && (
                  <div className={cn(
                    "p-1 rounded",
                    colorClasses[stat.color || "blue"]
                  )}>
                    <Icon className="h-3 w-3" />
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-lg font-bold text-gray-900 dark:text-slate-100">
                  {stat.value}
                </p>
                
                {stat.change && (
                  <div className="flex items-center gap-1">
                    {stat.change.direction === "up" ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : stat.change.direction === "down" ? (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    ) : (
                      <Activity className="h-3 w-3 text-gray-600" />
                    )}
                    <span className={cn(
                      "text-xs font-medium",
                      stat.change.direction === "up" ? "text-green-600" :
                      stat.change.direction === "down" ? "text-red-600" :
                      "text-gray-600"
                    )}>
                      {stat.change.value > 0 ? "+" : ""}{stat.change.value}%
                    </span>
                    <span className="text-xs text-gray-500">
                      {stat.change.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default {
  MobileChart,
  MobileChartGrid,
  MobileChartTabs,
  MobileSummaryCards,
}; 