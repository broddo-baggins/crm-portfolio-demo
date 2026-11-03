import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Funnel data interface for the bar chart
 */
interface FunnelData {
  name: string;
  count: number;
  color: string;
}

/**
 * Props for the FunnelBar component
 */
interface FunnelBarProps {
  data?: FunnelData[];
  title?: string;
  className?: string;
  isLoading?: boolean;
}

/**
 * Default funnel data if none is provided
 */
const defaultData: FunnelData[] = [
  { name: "Total", count: 120, color: "#8E9196" },      // Gray
  { name: "Contacted", count: 95, color: "#D3E4FD" },   // Light blue
  { name: "Interested", count: 68, color: "#FEC6A1" },  // Orange
  { name: "Meeting", count: 42, color: "#ea384c" },     // Red
  { name: "Closed", count: 18, color: "#367E50" },      // Green
];

/**
 * FunnelBar Component
 * 
 * Displays a horizontal bar chart showing lead funnel stages
 * Data comes from Supabase via API service
 */
const FunnelBar = ({ 
  data = defaultData, 
  title = "Lead Funnel", 
  className,
  isLoading = false 
}: FunnelBarProps) => {
  const [animate, setAnimate] = useState(false);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    // Skip the animation if user prefers reduced motion
    if (!prefersReducedMotion) {
      const timer = setTimeout(() => {
        setAnimate(true);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setAnimate(true);
    }
  }, [prefersReducedMotion]);

  return (
    <Card className={`${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} 
                    transition-all duration-200 hover:elevation-3 elevation-1 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="w-full h-[250px] flex flex-col justify-center space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-6 w-3/5" />
            <Skeleton className="h-6 w-2/5" />
            <Skeleton className="h-6 w-1/5" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip formatter={(value) => [`${value} leads`, 'Count']} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default FunnelBar;
