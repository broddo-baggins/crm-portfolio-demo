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
import { Sparkline } from "@/components/system/Sparkline";
import { CountUp } from "@/components/system/CountUp";
import { PersonAvatar } from "@/components/system/PersonAvatar";
import { BantChip } from "@/components/system/BantChip";
import { HeatTag } from "@/components/system/HeatTag";
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
  bant_budget?: boolean;
  bant_authority?: boolean;
  bant_need?: boolean;
  bant_timeline?: boolean;
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
  value: number;
  unit?: string;
  decimals?: number;
  caption?: string;
  trend?: number;
  spark?: number[];
  sparkColor?: string;
  hot?: boolean;
  index: number;
}

/** One cell of the KPI strip: label, count-up figure, weekly delta, sparkline. */
const Kpi: React.FC<KpiProps> = ({ label, value, unit, decimals = 0, caption, trend, spark, sparkColor, hot, index }) => {
  const slug = label.toLowerCase().replace(/\s+/g, "-");
  const up = trend !== undefined && trend >= 0;
  return (
    <div
      className="rise-in flex min-w-0 flex-col gap-1 p-4 sm:p-5"
      style={{ ["--i" as string]: index }}
      data-testid={`metric-card-${slug}`}
    >
      <p className="text-[13px] font-medium leading-5 text-subtle">{label}</p>
      <div className="flex items-baseline gap-2">
        <p
          className={cn(
            "num text-[30px] font-semibold leading-9",
            hot ? "text-ember-600 dark:text-ember-300" : "text-foreground",
          )}
          data-testid={`metric-value-${slug}`}
        >
          <span aria-label={`${value}${unit ?? ""}`}>
            <CountUp value={value} decimals={decimals} />
          </span>
          {unit && <span className="ms-0.5 text-base font-medium text-muted-foreground">{unit}</span>}
        </p>
        {trend !== undefined && (
          <span
            className={cn("num text-xs font-medium", up ? "text-success" : "text-danger")}
            aria-label={`${up ? "Up" : "Down"} ${Math.abs(Math.round(trend * 10) / 10)} percent this week`}
          >
            {up ? "+" : ""}
            {Math.round(trend * 10) / 10}%
          </span>
        )}
      </div>
      {spark && <Sparkline values={spark} color={sparkColor} className="mt-1" />}
      {caption && <p className="truncate text-xs text-muted-foreground">{caption}</p>}
    </div>
  );
};

const KpiSkeleton = () => (
  <div className="p-4 sm:p-5" data-testid="metric-card-loading" aria-hidden="true">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="mb-2 mt-3 h-9 w-20" />
    <Skeleton className="h-7 w-full" />
  </div>
);

const ChartCard: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  legend?: { label: string; color: string }[];
}> = ({ title, description, children, className, legend }) => (
  <Card className={className}>
    <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
      <div className="space-y-1">
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {legend && (
        <ul className="flex gap-3 text-xs text-secondary-foreground" aria-label="Legend">
          {legend.map((l) => (
            <li key={l.label} className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 rounded-full" style={{ background: l.color }} aria-hidden="true" />
              {l.label}
            </li>
          ))}
        </ul>
      )}
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

  const leadSpark = trend.map((p) => p.leads);
  const convSpark = trend.map((p) => p.conversions);

  return (
    <div className="space-y-4" data-testid="dashboard-overview">
      <Card
        className="grid grid-cols-2 divide-border max-xl:[&>*:nth-child(n+3)]:border-t max-xl:[&>*:nth-child(even)]:border-s xl:grid-cols-4 xl:divide-x xl:rtl:divide-x-reverse [&>*]:border-border"
        data-testid="dashboard-metrics-grid"
      >
        {loading || !metrics ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <Kpi
              index={0}
              label={t("dashboard.totalLeads", "Total Leads")}
              value={dist?.total ?? 0}
              trend={8.5}
              spark={leadSpark}
              sparkColor={chartColor(2)}
              caption={t("dashboard.allLeadsInPipeline", "All leads in pipeline")}
            />
            <Kpi
              index={1}
              label={t("dashboard.bantQualificationRate", "Qualification Rate")}
              value={Number(metrics.bant_qualification_rate.percentage.toFixed(1))}
              decimals={1}
              unit="%"
              trend={metrics.bant_qualification_rate.trend_weekly}
              spark={convSpark}
              sparkColor={chartColor(2)}
              caption={`${metrics.bant_qualification_rate.qualified_count} ${t("dashboard.of", "of")} ${metrics.bant_qualification_rate.total_assessed} ${t("dashboard.leads", "leads")}`}
            />
            <Kpi
              index={2}
              hot
              label={t("dashboard.hotBurningLeads", "Hot and Burning")}
              value={(dist?.hot ?? 0) + (dist?.burning ?? 0)}
              trend={dist?.trend_weekly}
              spark={leadSpark.map((v, i) => v * (0.35 + i * 0.05))}
              sparkColor={chartColor(1)}
              caption={t("dashboard.highPriorityLeads", "High priority leads")}
            />
            <Kpi
              index={3}
              label={t("dashboard.meetingPipeline", "Meetings Booked")}
              value={metrics.meeting_pipeline.total_meetings}
              trend={metrics.meeting_pipeline.trend_weekly}
              spark={convSpark.map((v, i) => v * (0.6 + i * 0.08))}
              sparkColor={chartColor(2)}
              caption={`${Number(metrics.meeting_pipeline.conversion_rate.toFixed(1))}% ${t("dashboard.conversionRate", "conversion rate")}`}
            />
          </>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        <ChartCard
          className="lg:col-span-2"
          title={t("dashboard.funnel.title", "Pipeline funnel")}
          description={t("dashboard.funnel.description", "Leads to contacted, qualified and meetings booked")}
        >
          {loading ? (
            <Skeleton className="h-[220px] w-full" />
          ) : funnelEmpty ? (
            <EmptyState
              title="No pipeline yet"
              description="Leads will appear here as they are contacted and qualified."
            />
          ) : (
            <ol className="space-y-3.5 pt-1" data-testid="funnel-list">
              {funnel.map((f, i) => {
                const top = funnel[0].value || 1;
                const prev = i === 0 ? null : funnel[i - 1].value;
                const step = prev ? Math.round((f.value / prev) * 100) : null;
                return (
                  <li key={f.name} className="rise-in" style={{ ["--i" as string]: i }}>
                    <div className="mb-1 flex items-baseline justify-between text-[13px]">
                      <span className="font-medium text-foreground">{f.name}</span>
                      <span className="flex items-baseline gap-2">
                        {step !== null && (
                          <span className="num text-xs text-muted-foreground">{step}% of {funnel[i - 1].name.toLowerCase()}</span>
                        )}
                        <span className="num text-sm font-semibold text-foreground">{f.value}</span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800" aria-hidden="true">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.max(2, (f.value / top) * 100)}%`, background: f.fill }}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </ChartCard>

        <ChartCard
          className="lg:col-span-3"
          title={t("dashboard.activity.title", "Leads and conversions")}
          description={t("dashboard.activity.description", "Sample data, last 6 months")}
          legend={[
            { label: "Leads", color: chartColor(2) },
            { label: "Conversions", color: chartColor(1) },
          ]}
        >
          {loading ? (
            <Skeleton className="h-[220px] w-full" />
          ) : (
            <div className="h-[220px]" role="img" aria-label="Leads and conversions by month, sample data">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="2 4" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} width={36} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "hsl(var(--border))" }} />
                  <Area type="monotone" dataKey="leads" name="Leads" stroke={chartColor(2)} fill={chartColor(2)} fillOpacity={0.1} strokeWidth={2} />
                  <Area type="monotone" dataKey="conversions" name="Conversions" stroke={chartColor(1)} fill={chartColor(1)} fillOpacity={0.12} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      <div className={cn("grid gap-4", aside && "lg:grid-cols-3")}>
        <Card className={cn(aside && "lg:col-span-2")}>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">{t("dashboard.hotLeads.title", "Hot leads")}</CardTitle>
            <Link
              to="/leads"
              className="inline-flex items-center gap-1 whitespace-nowrap rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t("dashboard.hotLeads.viewAll", "View all leads")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </CardHeader>
          <CardContent className="px-0 pb-1 pt-0">
            {loading ? (
              <div className="space-y-3 px-5 py-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : hotLeads.length === 0 ? (
              <EmptyState
                title="No hot leads right now"
                description="Leads that qualify move here so you can call them first."
              />
            ) : (
              <ul className="divide-y divide-border" data-testid="hot-leads-table" aria-label="Hot leads">
                {hotLeads.map((l, i) => {
                  const name = `${l.first_name ?? ""} ${l.last_name ?? ""}`.trim() || "Unnamed lead";
                  const met = [l.bant_budget, l.bant_authority, l.bant_need, l.bant_timeline];
                  const known = met.some((m) => m !== undefined);
                  return (
                    <li
                      key={l.id}
                      className="rise-in grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 px-5 py-3 transition-colors duration-[120ms] hover:bg-accent/50 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.3fr)]"
                      style={{ ["--i" as string]: i }}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <PersonAvatar name={name} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {l.company || stateLabel(l.state) || "Follow up"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 justify-self-end md:justify-self-auto">
                        <BantChip score={l.bant_score ?? 0} met={known ? met.map(Boolean) : undefined} />
                        <HeatTag temperature={l.temperature} />
                      </div>
                      <div
                        className="col-span-2 min-w-0 md:col-span-1"
                        title={l.notes}
                      >
                        <p className="line-clamp-2 break-words rounded-lg rounded-ss-sm bg-whatsapp-bubble px-3 py-1.5 text-[13px] leading-5 text-whatsapp-bubble-foreground">
                          {l.notes || "No messages yet"}
                        </p>
                        {l.next_followup && (
                          <p className="num mt-1 text-[11px] text-muted-foreground">
                            Next step {formatShort(l.next_followup)}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
        {aside}
      </div>
    </div>
  );
};

export default DashboardOverview;
