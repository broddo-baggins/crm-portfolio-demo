import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CountUp } from "@/components/system/CountUp";

interface ModernStatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    label?: string;
  };
  /** Kept for callers; the strip carries no icon chips */
  icon?: LucideIcon;
  className?: string;
  isLoading?: boolean;
  color?: "blue" | "green" | "purple" | "orange" | "red";
}

/** One cell of a stats strip. Wrap several in a bordered grid; hairlines come from the parent. */
const ModernStatsCard = ({ title, value, description, trend, className = "", isLoading = false }: ModernStatsCardProps) => {
  if (isLoading) {
    return (
      <div className={cn("space-y-3 px-4 py-4 md:px-5", className)} aria-hidden="true">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-8 w-16 animate-pulse rounded bg-muted" />
        <div className="h-3 w-32 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  const numeric = typeof value === "number";
  const up = trend && trend.value > 0;
  const down = trend && trend.value < 0;
  return (
    <div className={cn("px-4 py-4 md:px-5", className)}>
      <p className="text-[13px] font-medium text-subtle">{title}</p>
      <p className="num mt-0.5 text-[30px] font-semibold leading-9 text-foreground">
        {numeric ? <CountUp value={value as number} /> : value}
      </p>
      <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-xs text-muted-foreground">
        {trend && (
          <span
            className={cn("num font-medium", up && "text-success", down && "text-danger")}
            aria-label={`${up ? "Up" : down ? "Down" : "Flat"} ${Math.abs(trend.value)} percent ${trend.label ?? ""}`}
          >
            {up ? "+" : down ? "-" : ""}
            {Math.abs(trend.value)}%
          </span>
        )}
        <span>{trend?.label ?? description}</span>
      </p>
    </div>
  );
};

export default ModernStatsCard;
