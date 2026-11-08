import React, { useMemo } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Calendar,
  Thermometer,
  UserCheck,
  Users,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/system/States";
import { cn } from "@/lib/utils";
import type { DashboardMetrics } from "@/services/dashboardAnalyticsService";

interface OverviewLead {
  id: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  temperature?: string;
  bant_score?: number | null;
  notes?: string;
  state?: string | null;
  next_followup?: string;
  last_contact?: string;
}

interface TrendPoint {
  month: string;
  leads: number;
  conversions: number;
}

interface DashboardOverviewProps {
  metrics: DashboardMetrics | null;
  loading: boolean;
  leads: OverviewLead[];
  trend: TrendPoint[];
  /** Optional card shown beside the hot leads table on wide screens. */
  aside?: React.ReactNode;
}

const chartColor = (n: number) => `hsl(var(--chart-${n}))`;

const formatShort = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "";

const stateLabel = (state?: string | null) =>
  state ? state.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()) : "";

interface KpiProps {
  label: string;
  value: number | string;
  unit?: string;
  caption?: string;
  trend?: number;
  icon: React.ElementType;
  hot?: boolean;
}

const Kpi: React.FC<KpiProps> = ({
  label,
  value,
  unit,
  caption,
  trend,
  icon: Icon,
  hot,
}) => {
  const slug = label.toLowerCase().replace(/\s+/g, "-");
  const up = trend !== undefined && trend >= 0;
  return (
    <Card className="p-4" data-testid={`metric-card-${slug}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-5 text-subtle">{label}</p>
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
            hot
              ? "bg-ember-50 text-ember-600 dark:bg-ember-950 dark:text-ember-300"
              : "bg-steel-50 text-steel-600 dark:bg-steel-950 dark:text-steel-300",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <p
          className="text-[32px] font-semibold leading-9 tracking-[-0.02em] tabular-nums text-foreground"
          data-testid={`metric-value-${slug}`}
        >
          {value}
          {unit && (
            <span className="ms-0.5 text-base font-medium text-muted-foreground">
              {unit}
            </span>
          )}
        </p>
        {trend !== undefined && (
          <span
            className={cn(
              "text-xs font-medium tabular-nums",
              up ? "text-success" : "text-danger",
            )}
            aria-label={`${up ? "Up" : "Down"} ${Math.abs(Math.round(trend * 10) / 10)} percent this week`}
          >
            {up ? "+" : ""}
            {Math.round(trend * 10) / 10}%
          </span>
        )}
      </div>
      {caption && (
        <p className="mt-1 truncate text-xs text-muted-foreground">{caption}</p>
      )}
    </Card>
  );
};

const KpiSkeleton = () => (
  <Card className="p-4" data-testid="metric-card-loading" aria-hidden="true">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="mb-1 mt-3 h-9 w-20" />
    <Skeleton className="h-3 w-28" />
  </Card>
);

const ChartCard: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-lg">{title}</CardTitle>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardHeader>
    <CardContent className="pt-0">{children}</CardContent>
  </Card>
);

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
};

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  metrics,
  loading,
  leads,
  trend,
  aside,
}) => {
  const { t } = useTranslation("pages");

  const funnel = useMemo(() => {
    const total = metrics?.lead_temperature_distribution.total ?? 0;
    return [
      {
        name: t("dashboard.funnel.leads", "Leads"),
        value: total,
        fill: chartColor(5),
      },
      {
        name: t("dashboard.funnel.contacted", "Contacted"),
        value: metrics?.first_message_rate.contacted_count ?? 0,
        fill: chartColor(2),
      },
      {
        name: t("dashboard.funnel.qualified", "Qualified"),
        value: metrics?.bant_qualification_rate.qualified_count ?? 0,
        fill: chartColor(2),
      },
      {
        name: t("dashboard.funnel.meetings", "Meetings"),
        value: metrics?.meeting_pipeline.total_meetings ?? 0,
        fill: chartColor(1),
      },
    ];
  }, [metrics, t]);

  const hotLeads = useMemo(
    () =>
      [...leads]
        .filter((l) => l.temperature === "hot" || (l.bant_score ?? 0) >= 3)
        .sort((a, b) => (b.bant_score ?? 0) - (a.bant_score ?? 0))
        .slice(0, 6),
    [leads],
  );

  const dist = metrics?.lead_temperature_distribution;
  const funnelEmpty = !loading && funnel.every((f) => f.value === 0);

  return (
    <div className="space-y-4" data-testid="dashboard-overview">
      <div
        className="grid grid-cols-2 gap-3 xl:grid-cols-4"
        data-testid="dashboard-metrics-grid"
      >
        {loading || !metrics ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <Kpi
              label={t("dashboard.totalLeads", "Total Leads")}
              value={dist?.total ?? 0}
              trend={8.5}
              caption={t(
                "dashboard.allLeadsInPipeline",
                "All leads in pipeline",
              )}
              icon={Users}
            />
            <Kpi
              label={t("dashboard.bantQualificationRate", "Qualification Rate")}
              value={Number(
                metrics.bant_qualification_rate.percentage.toFixed(1),
              )}
              unit="%"
              trend={metrics.bant_qualification_rate.trend_weekly}
              caption={`${metrics.bant_qualification_rate.qualified_count} ${t("dashboard.of", "of")} ${metrics.bant_qualification_rate.total_assessed} ${t("dashboard.leads", "leads")}`}
              icon={UserCheck}
            />
            <Kpi
              label={t("dashboard.hotBurningLeads", "Hot and Burning")}
              value={(dist?.hot ?? 0) + (dist?.burning ?? 0)}
              trend={dist?.trend_weekly}
              caption={t("dashboard.highPriorityLeads", "High priority leads")}
              icon={Thermometer}
              hot
            />
            <Kpi
              label={t("dashboard.meetingPipeline", "Meetings Booked")}
              value={metrics.meeting_pipeline.total_meetings}
              trend={metrics.meeting_pipeline.trend_weekly}
              caption={`${Number(metrics.meeting_pipeline.conversion_rate.toFixed(1))}% ${t("dashboard.conversionRate", "conversion rate")}`}
              icon={Calendar}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title={t("dashboard.funnel.title", "Pipeline funnel")}
          description={t(
            "dashboard.funnel.description",
            "Leads to contacted, qualified and meetings booked",
          )}
        >
          {loading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : funnelEmpty ? (
            <EmptyState
              title="No pipeline yet"
              description="Leads will appear here as they are contacted and qualified."
            />
          ) : (
            <div
              className="h-[200px]"
              role="img"
              aria-label={funnel.map((f) => `${f.name} ${f.value}`).join(", ")}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={funnel}
                  layout="vertical"
                  margin={{ top: 0, right: 32, bottom: 0, left: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={84}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    contentStyle={tooltipStyle}
                  />
                  <Bar
                    dataKey="value"
                    radius={[0, 6, 6, 0]}
                    barSize={26}
                    label={{
                      position: "right",
                      fontSize: 12,
                      fill: "hsl(var(--foreground))",
                    }}
                  >
                    {funnel.map((f) => (
                      <Cell key={f.name} fill={f.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title={t("dashboard.activity.title", "Leads and conversions")}
          description={t(
            "dashboard.activity.description",
            "Sample data, last 6 months",
          )}
        >
          {loading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <div
              className="h-[200px]"
              role="img"
              aria-label="Leads and conversions by month, sample data"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trend}
                  margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                >
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={40} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    name="Leads"
                    stroke={chartColor(2)}
                    fill={chartColor(2)}
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="conversions"
                    name="Conversions"
                    stroke={chartColor(1)}
                    fill={chartColor(1)}
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      <div className={cn("grid gap-4", aside && "lg:grid-cols-3")}>
        <Card className={cn(aside && "lg:col-span-2")}>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">
              {t("dashboard.hotLeads.title", "Hot leads")}
            </CardTitle>
            <Link
              to="/leads"
              className="inline-flex items-center gap-1 whitespace-nowrap rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t("dashboard.hotLeads.viewAll", "View all leads")}
              <ArrowRight
                className="h-4 w-4 rtl:rotate-180"
                aria-hidden="true"
              />
            </Link>
          </CardHeader>
          <CardContent className="px-0 pb-2 pt-0">
            {loading ? (
              <div className="space-y-3 px-5 py-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : hotLeads.length === 0 ? (
              <EmptyState
                title="No hot leads right now"
                description="Leads that qualify move here so you can call them first."
              />
            ) : (
              <div className="overflow-x-auto">
                <table
                  className="w-full min-w-[560px] text-sm"
                  data-testid="hot-leads-table"
                >
                  <thead className="bg-surface-sunken text-start text-xs text-muted-foreground">
                    <tr>
                      <th
                        scope="col"
                        className="px-5 py-2 text-start font-medium"
                      >
                        Lead
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-start font-medium"
                      >
                        Score
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 text-start font-medium"
                      >
                        Last message
                      </th>
                      <th
                        scope="col"
                        className="px-5 py-2 text-start font-medium"
                      >
                        Next step
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {hotLeads.map((l) => (
                      <tr key={l.id} className="hover:bg-accent/50">
                        <td className="px-5 py-2.5">
                          <p className="font-medium text-foreground">
                            {`${l.first_name ?? ""} ${l.last_name ?? ""}`.trim()}
                          </p>
                          {l.company && (
                            <p className="text-xs text-muted-foreground">
                              {l.company}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge variant="outline" className="tabular-nums">
                            {l.bant_score ?? 0}/4
                          </Badge>
                        </td>
                        <td
                          className="max-w-[280px] truncate px-3 py-2.5 text-secondary-foreground"
                          title={l.notes}
                        >
                          {l.notes || "No messages yet"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-2.5 text-secondary-foreground">
                          {stateLabel(l.state) || "Follow up"}
                          {l.next_followup && (
                            <span className="text-muted-foreground">{` · ${formatShort(l.next_followup)}`}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        {aside}
      </div>
    </div>
  );
};

export default DashboardOverview;
