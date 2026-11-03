"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Calendar,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useMemo } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface LeadsConversionsData {
  month: string;
  leads: number;
  conversions: number;
  date?: string;
}

interface LeadsConversionsChartProps {
  data?: LeadsConversionsData[];
  isLoading?: boolean;
  className?: string;
}

const LeadsConversionsChart: React.FC<LeadsConversionsChartProps> = ({
  data = [],
  isLoading = false,
  className = "",
}) => {
  const chartData = data && data.length > 0 ? data : [];

  const totalLeads = chartData.reduce((sum, item) => sum + item.leads, 0);
  const totalConversions = chartData.reduce(
    (sum, item) => sum + item.conversions,
    0,
  );
  const conversionRate =
    totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : "0";

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="space-y-2">
            <div className="h-6 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Leads & Conversions Trend
        </CardTitle>
        <CardDescription>
          Track your lead generation and conversion performance over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <>
            {/* Summary Stats with Color Indicators */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-600 font-medium">
                    New Leads
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {totalLeads}
                </div>
                <div className="text-xs text-blue-500">Total generated</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">
                    Conversions
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {totalConversions}
                </div>
                <div className="text-xs text-green-500">
                  Successfully converted
                </div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-purple-600 font-medium">
                    Success Rate
                  </span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {conversionRate}%
                </div>
                <div className="text-xs text-purple-500">
                  Conversion efficiency
                </div>
              </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                  }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                  }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#C24816"
                  strokeWidth={3}
                  name="🔵 New Leads"
                  dot={{ fill: "#C24816", strokeWidth: 2, r: 5 }}
                  activeDot={{
                    r: 7,
                    fill: "#C24816",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="conversions"
                  stroke="#367E50"
                  strokeWidth={3}
                  name="🟢 Conversions"
                  dot={{ fill: "#367E50", strokeWidth: 2, r: 5 }}
                  activeDot={{
                    r: 7,
                    fill: "#367E50",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Trend Analysis */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <strong>Trend Analysis:</strong>{" "}
                {chartData.length >= 2
                  ? chartData[chartData.length - 1].leads >
                    chartData[chartData.length - 2].leads
                    ? "Leads are trending upward STATS"
                    : "Leads need attention 📉"
                  : "Need more data for trend analysis"}
              </div>
            </div>
          </>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <div className="font-medium mb-2">No trend data available</div>
              <div className="text-sm">
                Start tracking leads to see performance trends
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadsConversionsChart;
