"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { BarChart3, Globe } from "lucide-react";

interface LeadSourceData {
  source: string;
  leads: number;
  fill?: string;
}

interface LeadSourceChartProps {
  data?: LeadSourceData[];
  className?: string;
}

const LeadSourceChart: React.FC<LeadSourceChartProps> = ({
  data = [],
  className = "",
}) => {
  const chartData = data && data.length > 0 ? data : [];

  // Generate colors for pie chart segments
  const COLORS = [
    "#C24816",
    "#367E50",
    "#3E5F77",
    "#D69A2E",
    "#A5332D",
    "#6E91AA",
  ];

  const chartDataWithColors = chartData.map((item, index) => ({
    ...item,
    fill: item.fill || COLORS[index % COLORS.length],
  }));

  const totalLeads = chartData.reduce((sum, item) => sum + item.leads, 0);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent < 0.05) return null; // Don't show label for slices smaller than 5%

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Lead Sources
        </CardTitle>
        <CardDescription>
          Distribution of leads by acquisition channel
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <>
            {/* Chart */}
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartDataWithColors}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#3E5F77"
                  dataKey="leads"
                >
                  {chartDataWithColors.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} leads (${((value / totalLeads) * 100).toFixed(1)}%)`,
                    "Leads",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend with percentages */}
            <div className="mt-4 space-y-2">
              {chartDataWithColors.map((entry, index) => {
                const percentage = ((entry.leads / totalLeads) * 100).toFixed(
                  1,
                );
                return (
                  <div
                    key={entry.source}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.fill }}
                      />
                      <span className="font-medium capitalize">
                        {entry.source}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{entry.leads}</div>
                      <div className="text-xs text-gray-500">{percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Insights */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-700">
                <strong>Top Channel:</strong>{" "}
                {chartData.length > 0
                  ? `${chartData[0].source} (${chartData[0].leads} leads)`
                  : "No data available"}
              </div>
            </div>
          </>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <div className="font-medium mb-2">
                No lead source data available
              </div>
              <div className="text-sm">
                Track lead sources to optimize your marketing channels
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadSourceChart;
