
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Hourly data interface for the line chart
 */
interface HourlyData {
  hour: string;
  messages: number;
}

/**
 * Props for the HourLine component
 */
interface HourLineProps {
  data?: HourlyData[];
  title?: string;
  className?: string;
  isLoading?: boolean;
}

/**
 * Generate default hourly data with random message counts
 */
const generateDefaultData = (): HourlyData[] => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    messages: Math.floor(Math.random() * 15),
  }));
};

/**
 * HourLine Component
 * 
 * Displays a line chart showing message activity by hour of day
 * Data comes from AWS CloudWatch metrics via API service
 */
const HourLine = ({ 
  data = generateDefaultData(), 
  title = "Message Hourly Distribution", 
  className,
  isLoading = false 
}: HourLineProps) => {
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
          <div className="w-full h-[250px] flex flex-col justify-end space-y-2">
            <div className="flex items-end justify-between w-full h-[200px]">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton 
                  key={i} 
                  className="w-6" 
                  style={{ 
                    height: `${Math.max(20, Math.random() * 180)}px`
                  }} 
                />
              ))}
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="hour"
                interval={3}
                tickFormatter={(value) => value.split(':')[0]}
              />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} messages`, 'Count']} />
              <Line
                type="monotone"
                dataKey="messages"
                stroke="#C24816"
                strokeWidth={2}
                dot={{ stroke: '#C24816', strokeWidth: 2, r: 2 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default HourLine;
