import React, { useState, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMobileTouch } from '@/hooks/useMobileTouch';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Maximize2,
  Minimize2,
  Filter,
  Download,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useLang } from '@/hooks/useLang';
import { useMobileInfo } from '@/hooks/use-mobile';

interface MobileChartData {
  name: string;
  value: number;
  fill?: string;
  trend?: number;
  category?: string;
}

interface MobileOptimizedChartsProps {
  leadsData: MobileChartData[];
  conversionsData: MobileChartData[];
  temperatureData: MobileChartData[];
  performanceData: MobileChartData[];
  className?: string;
}

// Enhanced mobile-friendly chart component
const MobileChart = memo<{
  title: string;
  data: MobileChartData[];
  type: 'line' | 'bar' | 'pie' | 'area';
  height?: number;
  showLegend?: boolean;
  interactive?: boolean;
  colorScheme?: string[];
}>(({ title, data, type, height = 280, showLegend = true, interactive = true, colorScheme }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation('dashboard');
  const { isRTL } = useLang();
  const { isMobile, touchSupported } = useMobileInfo();

  const colors = colorScheme || [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  // Enhanced mobile tooltip for better touch experience
  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3 min-w-[160px]">
          <p className="font-medium text-sm">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-2 mt-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-muted-foreground">{entry.name}:</span>
              </div>
              <span className="font-semibold text-sm">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  }, []);

  const renderChart = () => {
    const chartHeight = isExpanded ? height + 120 : height;

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              <Line
                type="monotone"
                dataKey="value"
                stroke={colors[0]}
                strokeWidth={3}
                dot={interactive ? { r: 6, fill: colors[0] } : false}
                activeDot={{ r: 8, fill: colors[0] }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              <Bar
                dataKey="value"
                fill={colors[0]}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors[0]} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              <Area
                type="monotone"
                dataKey="value"
                stroke={colors[0]}
                fillOpacity={1}
                fill="url(#colorValue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={isExpanded ? 100 : 80}
                fill="#3E5F77"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={cn(
      "w-full",
      isExpanded && "col-span-full row-span-2 z-10"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            {data.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {data.length} {t('dashboard.items', 'items')}
                </Badge>
                {data.some(d => d.trend !== undefined) && (
                  <div className="flex items-center gap-1 text-xs">
                    {data[0]?.trend && data[0].trend > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={cn(
                      "font-medium",
                      data[0]?.trend && data[0].trend > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {Math.abs(data[0]?.trend || 0)}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {interactive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0"
                aria-label={isExpanded ? "Collapse chart" : "Expand chart"}
                aria-expanded={isExpanded}
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        {renderChart()}
      </CardContent>
    </Card>
  );
});

const MobileOptimizedCharts: React.FC<MobileOptimizedChartsProps> = ({
  leadsData,
  conversionsData, 
  temperatureData,
  performanceData,
  className
}) => {
  const { t } = useTranslation('dashboard');
  const { isRTL } = useLang();
  const [activeTab, setActiveTab] = useState('overview');
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Enhanced touch interactions for mobile
  const touchHandlers = useMobileTouch();
  
  // Tab navigation with swipe support
  const tabs = ['overview', 'leads', 'performance', 'analysis'];
  const currentTabIndex = tabs.indexOf(activeTab);
  
  // Setup touch handlers
  touchHandlers.onSwipe((swipeInfo) => {
    if (swipeInfo.direction === 'left' && currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1]);
    } else if (swipeInfo.direction === 'right' && currentTabIndex > 0) {
      setActiveTab(tabs[currentTabIndex - 1]);
    }
  });

  return (
    <div 
      className={cn("w-full space-y-4", className)}
      onTouchStart={touchHandlers.onTouchStart}
      onTouchMove={touchHandlers.onTouchMove}
      onTouchEnd={touchHandlers.onTouchEnd}
    >
      {/* Mobile-optimized chart tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="text-xs">
            <Activity className="h-4 w-4 mr-1" />
            {t('dashboard.overview', 'Overview')}
          </TabsTrigger>
          <TabsTrigger value="leads" className="text-xs">
            <BarChart3 className="h-4 w-4 mr-1" />
            {t('dashboard.leads', 'Leads')}
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-xs">
            <TrendingUp className="h-4 w-4 mr-1" />
            {t('dashboard.performance', 'Performance')}
          </TabsTrigger>
          <TabsTrigger value="analysis" className="text-xs">
            <PieChartIcon className="h-4 w-4 mr-1" />
            {t('dashboard.analysis', 'Analysis')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 gap-4">
            <MobileChart
              title={t('dashboard.leadsOverTime', 'Leads Over Time')}
              data={leadsData}
              type="line"
              height={250}
              interactive={true}
            />
            <MobileChart
              title={t('dashboard.conversationRate', 'Conversion Rate')}
              data={conversionsData}
              type="area"
              height={220}
              interactive={true}
            />
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 gap-4">
            <MobileChart
              title={t('dashboard.leadGeneration', 'Lead Generation')}
              data={leadsData}
              type="bar"
              height={250}
              interactive={true}
            />
            <MobileChart
              title={t('dashboard.leadTemperature', 'Lead Temperature Distribution')}
              data={temperatureData}
              type="pie"
              height={280}
              interactive={true}
            />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 gap-4">
            <MobileChart
              title={t('dashboard.monthlyPerformance', 'Monthly Performance')}
              data={performanceData}
              type="line"
              height={250}
              interactive={true}
            />
            <MobileChart
              title={t('dashboard.performanceTrends', 'Performance Trends')}
              data={performanceData}
              type="area"
              height={220}
              interactive={true}
            />
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 gap-4">
            <MobileChart
              title={t('dashboard.leadDistribution', 'Lead Distribution')}
              data={temperatureData}
              type="pie"
              height={280}
              interactive={true}
            />
            <MobileChart
              title={t('dashboard.conversionAnalysis', 'Conversion Analysis')}
              data={conversionsData}
              type="bar"
              height={220}
              interactive={true}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions for Mobile */}
      <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg">
        <Button variant="outline" size="sm" className="text-xs">
          <Download className="h-3 w-3 mr-1" />
          {t('dashboard.export', 'Export')}
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          <Share2 className="h-3 w-3 mr-1" />
          {t('dashboard.share', 'Share')}
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          <Filter className="h-3 w-3 mr-1" />
          {t('dashboard.filter', 'Filter')}
        </Button>
      </div>
    </div>
  );
};

export default memo(MobileOptimizedCharts); 