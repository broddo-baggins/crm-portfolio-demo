import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { cn } from "@/lib/utils";

interface ChartDataPoint {
  [key: string]: string | number;
}

interface ModernChartProps {
  title: string;
  data: ChartDataPoint[];
  type: "line" | "bar" | "area" | "pie";
  xAxisKey: string;
  dataKeys: string[];
  colors?: string[];
  className?: string;
  height?: number;
  isLoading?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
}

const defaultColors = [
  "#C24816", // blue-500
  "#367E50", // emerald-500
  "#D69A2E", // amber-500
  "#A5332D", // red-500
  "#3E5F77", // violet-500
  "#F97316", // orange-500
  "#6E91AA", // cyan-500
  "#84CC16", // lime-500
];

const ModernChart = ({
  title,
  data,
  type,
  xAxisKey,
  dataKeys,
  colors = defaultColors,
  className = "",
  height = 300,
  isLoading = false,
  showLegend = true,
  showGrid = true,
}: ModernChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>();

  const handleMouseEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(undefined);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 p-4 border border-gray-200 dark:border-slate-800 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white mb-2">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className={cn(
        "rounded-xl border bg-white dark:bg-slate-900 p-6 shadow-sm",
        className
      )}>
        <div className="space-y-4">
          <div className="h-6 w-48 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <LineChart data={data}>
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f0f0f0" 
                className="dark:stroke-gray-600"
              />
            )}
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#888888" 
              fontSize={12}
              className="dark:stroke-gray-400"
            />
            <YAxis 
              stroke="#888888" 
              fontSize={12}
              className="dark:stroke-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: colors[index % colors.length], strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        );

      case "area":
        return (
          <AreaChart data={data}>
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f0f0f0"
                className="dark:stroke-gray-600"
              />
            )}
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#888888" 
              fontSize={12}
              className="dark:stroke-gray-400"
            />
            <YAxis 
              stroke="#888888" 
              fontSize={12}
              className="dark:stroke-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart data={data}>
            {showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#f0f0f0"
                className="dark:stroke-gray-600"
              />
            )}
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#888888" 
              fontSize={12}
              className="dark:stroke-gray-400"
            />
            <YAxis 
              stroke="#888888" 
              fontSize={12}
              className="dark:stroke-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case "pie": {
        const pieData = data.map((item, index) => ({
          name: item[xAxisKey],
          value: item[dataKeys[0]],
          fill: colors[index % colors.length],
        }));

        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill}
                  stroke={activeIndex === index ? "#fff" : "none"}
                  strokeWidth={activeIndex === index ? 2 : 0}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
          </PieChart>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "rounded-xl border bg-white dark:bg-slate-900 p-6 shadow-sm transition-all duration-200 hover:shadow-md",
      className
    )}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default ModernChart; 