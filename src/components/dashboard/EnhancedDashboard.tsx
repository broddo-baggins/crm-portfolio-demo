"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLang } from "@/hooks/useLang";
import {
  Calendar,
  BarChart3,
  PieChart,
  Target,
  Users,
  TrendingUp,
  Filter,
  Plus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { simpleProjectService } from "@/services/simpleProjectService";

// Import our new chart components
import LeadsConversionsChart from "./charts/LeadsConversionsChart";
import LeadSourceChart from "./charts/LeadSourceChart";
import ConversionFunnelChart from "./charts/ConversionFunnelChart";
import EnhancedLeadsTable from "./tables/EnhancedLeadsTable";

// Import existing components
import ModernStatsCard from "./ModernStatsCard";

// Real data loading instead of demo data
const useRealData = () => {
  const [data, setData] = useState({
    leadsConversionsData: [],
    leadSourceData: [],
    conversionFunnelData: { leads: 0, qualified: 0, proposals: 0, closed: 0 },
    statsData: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRealData = async () => {
      try {
        // Load real data from services
        const [projects, leads, conversations] = await Promise.all([
          simpleProjectService.getAllProjects(),
          simpleProjectService.getAllLeads(),
          simpleProjectService.getAllConversations(),
        ]);

        // Process real data into chart format
        const processedData = {
          leadsConversionsData: generateMonthlyTrends(leads),
          leadSourceData: generateLeadSources(leads),
          conversionFunnelData: generateConversionFunnel(leads),
          statsData: generateStats(leads, projects, conversations),
        };

        setData(processedData);
      } catch (error) {
        // Use empty data structure on error
        setData({
          leadsConversionsData: [],
          leadSourceData: [],
          conversionFunnelData: {
            leads: 0,
            qualified: 0,
            proposals: 0,
            closed: 0,
          },
          statsData: [
            {
              title: "Total Leads",
              value: "0",
              change: "0%",
              trend: "neutral",
              color: "blue",
              icon: Users,
              description: "No leads data available",
            },
            {
              title: "Conversion Rate",
              value: "0%",
              change: "0%",
              trend: "neutral",
              color: "green",
              icon: Target,
              description: "No conversion data available",
            },
            {
              title: "Pipeline Value",
              value: "$0",
              change: "0%",
              trend: "neutral",
              color: "purple",
              icon: TrendingUp,
              description: "No pipeline data available",
            },
            {
              title: "Active Deals",
              value: "0",
              change: "0%",
              trend: "neutral",
              color: "orange",
              icon: BarChart3,
              description: "No deals data available",
            },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRealData();
  }, []);

  return { ...data, isLoading };
};

// Helper functions to process real data
const generateMonthlyTrends = (leads: any[]) => {
  if (!leads || leads.length === 0) return [];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return months.map((month) => {
    const monthLeads = leads.filter((lead) => {
      const leadMonth = new Date(lead.created_at).toLocaleDateString("en", {
        month: "short",
      });
      return leadMonth === month;
    });

    const conversions = monthLeads.filter(
      (lead) => lead.status === "converted" || lead.status === "won",
    );

    return {
      month,
      leads: monthLeads.length,
      conversions: conversions.length,
      date: `2024-${months.indexOf(month) + 1}`,
    };
  });
};

const generateLeadSources = (leads: any[]) => {
  if (!leads || leads.length === 0) return [];

  const sources = leads.reduce((acc, lead) => {
    const source = lead.source || "unknown";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(sources).map(([source, count]) => ({
    source,
    leads: count,
    fill: `var(--color-${source})`,
  }));
};

const generateConversionFunnel = (leads: any[]) => {
  if (!leads || leads.length === 0) {
    return { leads: 0, qualified: 0, proposals: 0, closed: 0 };
  }

  const qualified = leads.filter((lead) =>
    ["qualified", "contacted", "proposal", "converted", "won"].includes(
      lead.status,
    ),
  ).length;

  const proposals = leads.filter((lead) =>
    ["proposal", "converted", "won"].includes(lead.status),
  ).length;

  const closed = leads.filter((lead) =>
    ["converted", "won"].includes(lead.status),
  ).length;

  return {
    leads: leads.length,
    qualified,
    proposals,
    closed,
  };
};

const generateStats = (leads: any[], projects: any[], conversations: any[]) => {
  const totalLeads = leads?.length || 0;
  const conversions =
    leads?.filter((lead) => ["converted", "won"].includes(lead.status))
      .length || 0;

  const conversionRate =
    totalLeads > 0 ? ((conversions / totalLeads) * 100).toFixed(1) : "0";
  const activeDeals =
    projects?.filter((p) => p.status === "active").length || 0;

  // Calculate pipeline value from projects
  const pipelineValue =
    projects?.reduce((sum, project) => {
      return sum + (project.budget || 0);
    }, 0) || 0;

  return [
    {
      title: "Total Leads",
      value: totalLeads.toString(),
      change: "+0%",
      trend: "neutral",
      color: "blue",
      icon: Users,
      description: "Total tracked leads",
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      change: "+0%",
      trend: "neutral",
      color: "green",
      icon: Target,
      description: "Lead to customer conversion",
    },
    {
      title: "Pipeline Value",
      value: `$${(pipelineValue / 1000).toFixed(0)}K`,
      change: "+0%",
      trend: "neutral",
      color: "purple",
      icon: TrendingUp,
      description: "Total pipeline value",
    },
    {
      title: "Active Deals",
      value: activeDeals.toString(),
      change: "+0%",
      trend: "neutral",
      color: "orange",
      icon: BarChart3,
      description: "Deals in progress",
    },
  ];
};

interface EnhancedDashboardProps {
  className?: string;
}

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  className = "",
}) => {
  const { t } = useTranslation("dashboard");
  const { isRTL } = useLang();

  // Use real data instead of demo data
  const {
    leadsConversionsData,
    leadSourceData,
    conversionFunnelData,
    statsData,
    isLoading,
  } = useRealData();

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <IconComponent className={`h-4 w-4 text-${stat.color}-600`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={`inline-flex items-center ${
                    stat.trend === "up"
                      ? "text-green-600"
                      : stat.trend === "down"
                        ? "text-red-600"
                        : "text-gray-600"
                  }`}
                >
                  {stat.change}
                </span>{" "}
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderLeadsConversionsChart = () => (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Leads & Conversions Trend</CardTitle>
        <CardDescription>Monthly performance overview</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-gray-500">Loading chart data...</div>
          </div>
        ) : leadsConversionsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={leadsConversionsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="#C24816"
                strokeWidth={2}
                name="New Leads"
              />
              <Line
                type="monotone"
                dataKey="conversions"
                stroke="#367E50"
                strokeWidth={2}
                name="Conversions"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-gray-500">No data available</div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderConversionFunnel = () => (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
        <CardDescription>Lead progression through sales stages</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(conversionFunnelData).map(([stage, count]) => {
            const percentage =
              conversionFunnelData.leads > 0
                ? (count / conversionFunnelData.leads) * 100
                : 0;

            return (
              <div key={stage} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium capitalize">{stage}</span>
                  <span className="font-bold">{count}</span>
                </div>
                <Progress value={percentage} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {percentage.toFixed(1)}% of total leads
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const renderLeadSourceChart = () => (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Lead Sources</CardTitle>
        <CardDescription>Distribution of lead sources</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[200px] flex items-center justify-center">
            <div className="text-gray-500">Loading chart data...</div>
          </div>
        ) : leadSourceData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={leadSourceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ source, percent }) =>
                  `${source} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={60}
                fill="#3E5F77"
                dataKey="leads"
              >
                {leadSourceData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`hsl(${index * 45}, 70%, 60%)`}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center">
            <div className="text-gray-500">No lead source data available</div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {renderStatsCards()}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {renderLeadsConversionsChart()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {renderConversionFunnel()}
        {renderLeadSourceChart()}
      </div>
    </div>
  );
};

export default EnhancedDashboard;
