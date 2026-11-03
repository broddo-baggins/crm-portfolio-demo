import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MagicCard } from "@/components/ui/magic-card";
import { NumberTicker } from "@/components/ui/number-ticker";

interface ModernStatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    label?: string;
  };
  icon: LucideIcon;
  className?: string;
  isLoading?: boolean;
  color?: "blue" | "green" | "purple" | "orange" | "red";
}

const colorMap = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800/50",
    iconBg: "bg-blue-100 dark:bg-blue-950/50",
    iconColor: "text-blue-600 dark:text-blue-400",
    trend: "text-blue-600 dark:text-blue-400",
    gradientFrom: "#C24816",
    gradientTo: "#EC9772"
  },
  green: {
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-800/50",
    iconBg: "bg-green-100 dark:bg-green-950/50",
    iconColor: "text-green-600 dark:text-green-400",
    trend: "text-green-600 dark:text-green-400",
    gradientFrom: "#367E50",
    gradientTo: "#7FB991"
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-800/50",
    iconBg: "bg-purple-100 dark:bg-purple-950/50",
    iconColor: "text-purple-600 dark:text-purple-400",
    trend: "text-purple-600 dark:text-purple-400",
    gradientFrom: "#3E5F77",
    gradientTo: "#97B2C6"
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800/50",
    iconBg: "bg-orange-100 dark:bg-orange-950/50",
    iconColor: "text-orange-600 dark:text-orange-400",
    trend: "text-orange-600 dark:text-orange-400",
    gradientFrom: "#F97316",
    gradientTo: "#FB923C"
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800/50",
    iconBg: "bg-red-100 dark:bg-red-950/50",
    iconColor: "text-red-600 dark:text-red-400",
    trend: "text-red-600 dark:text-red-400",
    gradientFrom: "#A5332D",
    gradientTo: "#E68D84"
  },
};

const ModernStatsCard = ({
  title,
  value,
  description,
  trend,
  icon: Icon,
  className = "",
  isLoading = false,
  color = "blue"
}: ModernStatsCardProps) => {
  const colors = colorMap[color];

  if (isLoading) {
    return (
      <MagicCard className={cn("rounded-xl p-6 shadow-sm transition-all duration-200", className)}>
        <div className="flex items-center justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-8 w-16 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-3 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="h-12 w-12 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse" />
        </div>
      </MagicCard>
    );
  }

  return (
    <MagicCard 
      className={cn(
        "group rounded-xl p-6 shadow-sm transition-all duration-200",
        className
      )}
      gradientFrom={colors.gradientFrom}
      gradientTo={colors.gradientTo}
      gradientSize={250}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1 flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-slate-400">
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {typeof value === 'number' ? (
              <NumberTicker value={value} className="text-3xl font-bold tracking-tight" />
            ) : (
              value
            )}
          </p>
          <div className="flex items-center space-x-2 text-sm">
            {trend && (
              <div className="flex items-center space-x-1">
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                  trend.value > 0
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : trend.value < 0
                    ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    : "bg-gray-100 text-gray-800 dark:bg-slate-900/20 dark:text-slate-400"
                )}>
                  {trend.value > 0 ? "↗" : trend.value < 0 ? "↘" : "→"} {Math.abs(trend.value)}%
                </span>
                {trend.label && (
                  <span className="text-gray-500 dark:text-slate-400">
                    {trend.label}
                  </span>
                )}
              </div>
            )}
            {description && !trend && (
              <span className="text-gray-500 dark:text-slate-400">
                {description}
              </span>
            )}
          </div>
        </div>
        <div className={cn(
          "rounded-full p-3 transition-colors duration-200 group-hover:scale-105",
          colors.iconBg
        )}>
          <Icon className={cn("h-6 w-6", colors.iconColor)} />
        </div>
      </div>
    </MagicCard>
  );
};

export default ModernStatsCard; 