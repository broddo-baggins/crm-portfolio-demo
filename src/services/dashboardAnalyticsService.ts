// @ts-nocheck
/**
 * Dashboard Analytics Service
 * Calculates real-time metrics for BANT qualification, lead temperature,
 * meeting pipeline, and conversation metrics using existing database structure
 */

import { calcConversionRate, conversionRateForLeads, isMeetingBooked } from "@/utils/conversionRate";
import { supabase } from "@/integrations/supabase/client";
import { ServiceErrorHandler } from "./base/errorHandler";
import { mockApi } from '@/data/mockData';

export interface LeadSummary {
  leads: number;
  contacted: number;
  qualified: number;
  meetings: number;
  /** Hot and burning leads; only the sample project reports it, otherwise the page counts its own rows */
  hot?: number;
  /** Whole percent, defined once in utils/conversionRate.ts */
  conversionRate: number;
}

export interface DashboardMetrics {
  // BANT Metrics
  bant_qualification_rate: {
    percentage: number;
    total_assessed: number;
    qualified_count: number;
    trend_weekly: number;
  };

  // Temperature/Heat Metrics
  lead_temperature_distribution: {
    cold: number;
    warm: number;
    hot: number;
    burning: number;
    total: number;
    trend_weekly: number;
  };

  // First Message Metrics
  first_message_rate: {
    percentage: number;
    total_leads: number;
    contacted_count: number;
    trend_weekly: number;
  };

  // Meeting Pipeline
  meeting_pipeline: {
    total_meetings: number;
    meetings_this_week: number;
    conversion_rate: number;
    trend_weekly: number;
  };

  // Additional Context
  calculation_timestamp: string;
  data_period: string;
}

export class DashboardAnalyticsService {
  /**
   * Conversion rate shown on the dashboard, Reports and sidebar.
   * Demo mode reports the sample analytics figure; otherwise it is computed
   * from the given leads (meetings booked / total leads).
   */
  async getConversionRate(leads: Parameters<typeof conversionRateForLeads>[0]): Promise<number> {
    return (await this.getLeadSummary(leads)).conversionRate;
  }

  /**
   * The one source for leads, qualified, meetings and conversion of the selected
   * project. Dashboard, sidebar Quick Stats, Reports and the Leads page all read it,
   * so the numbers agree everywhere. Demo mode reports the sample project figures
   * (the lead table holds a sample of them); otherwise they come from the given leads.
   */
  async getLeadSummary(leads: Parameters<typeof conversionRateForLeads>[0]): Promise<LeadSummary> {
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      const metrics = await this.getDashboardMetrics();
      const total = metrics.lead_temperature_distribution.total;
      const meetings = metrics.meeting_pipeline.total_meetings;
      return {
        leads: total,
        contacted: metrics.first_message_rate.contacted_count,
        qualified: metrics.bant_qualification_rate.qualified_count,
        meetings,
        hot: metrics.lead_temperature_distribution.hot + metrics.lead_temperature_distribution.burning,
        conversionRate: calcConversionRate(meetings, total),
      };
    }
    const meetings = leads.filter(isMeetingBooked).length;
    return {
      leads: leads.length,
      contacted: leads.filter((l) => l.status?.toLowerCase() !== 'new').length,
      qualified: leads.filter((l) => l.status?.toLowerCase() === 'qualified' || l.state === 'qualified').length,
      meetings,
      conversionRate: conversionRateForLeads(leads),
    };
  }

  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboardMetrics(projectId?: string): Promise<DashboardMetrics> {
    // DEMO DEMO MODE: Use mock analytics data
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      const response = await mockApi.getAnalytics();
      return {
        bant_qualification_rate: {
          percentage: 36,
          total_assessed: 247,
          qualified_count: 89,
          trend_weekly: 8.5
        },
        lead_temperature_distribution: {
          cold: 28,
          warm: 85,
          hot: 89,
          burning: 45,
          total: 247,
          trend_weekly: 12.3
        },
        first_message_rate: {
          percentage: 70,
          total_leads: 247,
          contacted_count: 173,
          trend_weekly: 5.2
        },
        meeting_pipeline: {
          total_meetings: 34,
          meetings_this_week: 8,
          conversion_rate: calcConversionRate(34, 247),
          trend_weekly: 15.5
        },
        calculation_timestamp: new Date().toISOString(),
        data_period: "Last 30 days"
      };
    }
    
    return ServiceErrorHandler.handleAsyncError(
      async () => {
        const [
          bantMetrics,
          temperatureMetrics,
          firstMessageMetrics,
          meetingMetrics,
        ] = await Promise.all([
          this.calculateBANTMetrics(projectId),
          this.calculateTemperatureMetrics(projectId),
          this.calculateFirstMessageMetrics(projectId),
          this.calculateMeetingMetrics(projectId),
        ]);

        return {
          bant_qualification_rate: bantMetrics,
          lead_temperature_distribution: temperatureMetrics,
          first_message_rate: firstMessageMetrics,
          meeting_pipeline: meetingMetrics,
          calculation_timestamp: new Date().toISOString(),
          data_period: "last_30_days",
        };
      },
      "DashboardAnalyticsService",
      "getDashboardMetrics",
    ).then((result) => result.data);
  }

  /**
   * Calculate BANT qualification metrics
   * Uses bant_status and state_status_metadata fields
   */
  private async calculateBANTMetrics(projectId?: string) {
    // Base query for leads
    let query = supabase
      .from("leads")
      .select(
        "id, bant_status, state_status_metadata, created_at, current_project_id",
      );

    // Apply project filter if provided
    if (projectId) {
      query = query.eq("current_project_id", projectId);
    }

    const { data: leads, error } = await query;
    if (error) {
      console.error("ERROR BANT Metrics Error:", error);
      throw error;
    }

    // Return zeros if no leads exist (real data, not mock)
    if (!leads || leads.length === 0) {
      return {
        percentage: 0,
        total_assessed: 0,
        qualified_count: 0,
        trend_weekly: 0,
      };
    }

    // Use ALL leads for the project, not just last 30 days
    const currentLeads = leads || [];

    // Calculate qualification metrics
    const totalAssessed = currentLeads.length;
    const qualifiedStatuses = [
      "partially_qualified",
      "fully_qualified",
      "budget_qualified",
      "authority_qualified",
      "need_qualified",
      "timing_qualified",
    ];

    const qualifiedCount = currentLeads.filter((lead) =>
      qualifiedStatuses.includes(lead.bant_status),
    ).length;

    const qualificationRate =
      totalAssessed > 0
        ? Math.round((qualifiedCount / totalAssessed) * 100)
        : 0;

    // Calculate weekly trend (compare last 7 days vs previous 7 days)
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const previousWeek = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const lastWeekLeads = currentLeads.filter((lead) => {
      const leadDate = new Date(lead.created_at);
      return leadDate >= lastWeek;
    });

    const previousWeekLeads = currentLeads.filter((lead) => {
      const leadDate = new Date(lead.created_at);
      return leadDate >= previousWeek && leadDate < lastWeek;
    });

    const lastWeekRate =
      lastWeekLeads.length > 0
        ? (lastWeekLeads.filter((l) =>
            qualifiedStatuses.includes(l.bant_status),
          ).length /
            lastWeekLeads.length) *
          100
        : 0;

    const previousWeekRate =
      previousWeekLeads.length > 0
        ? (previousWeekLeads.filter((l) =>
            qualifiedStatuses.includes(l.bant_status),
          ).length /
            previousWeekLeads.length) *
          100
        : 0;

    // Use proper percentage change calculation instead of simple subtraction
    const trendWeekly = previousWeekRate > 0 
      ? ((lastWeekRate - previousWeekRate) / previousWeekRate) * 100
      : lastWeekRate > 0 ? Math.min(lastWeekRate * 10, 999) : 0;

    return {
      percentage: qualificationRate,
      total_assessed: totalAssessed,
      qualified_count: qualifiedCount,
      trend_weekly: Math.round(trendWeekly * 10) / 10,
    };
  }

  /**
   * Calculate Lead Temperature Distribution
   * Uses lead_metadata, interaction_count, and status progression
   */
  private async calculateTemperatureMetrics(projectId?: string) {
    let query = supabase
      .from("leads")
      .select(
        "id, status, state, interaction_count, first_interaction, last_interaction, lead_metadata, requires_human_review, created_at, current_project_id",
      );

    // Apply project filter if provided
    if (projectId) {
      query = query.eq("current_project_id", projectId);
    }

    const { data: leads, error } = await query;
    if (error) {
      console.error("ERROR Temperature Metrics Error:", error);
      throw error;
    }

    // Return zeros if no leads exist (real data, not mock)
    if (!leads || leads.length === 0) {
      return {
        cold: 0,
        warm: 0,
        hot: 0,
        burning: 0,
        total: 0,
        trend_weekly: 0,
      };
    }

    // Use ALL leads for the project, not just last 30 days
    const currentLeads = leads || [];

    // Calculate temperature based on progression and engagement
    const temperatureDistribution = currentLeads.reduce(
      (acc, lead) => {
        const temp = this.calculateLeadTemperature(lead);
        acc[temp]++;
        acc.total++;
        return acc;
      },
      { cold: 0, warm: 0, hot: 0, burning: 0, total: 0 },
    );

    // Calculate weekly trend
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekLeads = currentLeads.filter(
      (lead) => new Date(lead.created_at) >= lastWeek,
    );

    const previousWeek = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const previousWeekLeads = currentLeads.filter((lead) => {
      const leadDate = new Date(lead.created_at);
      return leadDate >= previousWeek && leadDate < lastWeek;
    });

    const lastWeekHot = lastWeekLeads.filter((lead) =>
      ["hot", "burning"].includes(this.calculateLeadTemperature(lead)),
    ).length;

    const previousWeekHot = previousWeekLeads.filter((lead) =>
      ["hot", "burning"].includes(this.calculateLeadTemperature(lead)),
    ).length;

    // Calculate proper percentage change for temperature trends
    const lastWeekHotRate = lastWeekLeads.length > 0 ? (lastWeekHot / lastWeekLeads.length) * 100 : 0;
    const previousWeekHotRate = previousWeekLeads.length > 0 ? (previousWeekHot / previousWeekLeads.length) * 100 : 0;
    
    const trendWeekly = previousWeekHotRate > 0 
      ? ((lastWeekHotRate - previousWeekHotRate) / previousWeekHotRate) * 100
      : lastWeekHotRate > 0 ? Math.min(lastWeekHotRate * 10, 999) : 0;

    return {
      ...temperatureDistribution,
      trend_weekly: Math.round(trendWeekly * 10) / 10,
    };
  }

  /**
   * Calculate temperature based on lead progression and engagement
   */
  private calculateLeadTemperature(
    lead: any,
  ): "cold" | "warm" | "hot" | "burning" {
    let score = 0;

    // Base score from status progression
    const statusScores: Record<string, number> = {
      unqualified: 10,
      awareness: 20,
      consideration: 35,
      interest: 50,
      intent: 65,
      evaluation: 75,
      purchase_ready: 90,
      Qualified: 70,
      "Demo Scheduled": 85,
      "Proposal Sent": 90,
      Negotiation: 95,
    };

    score += statusScores[lead.status] || 10;

    // Interaction boost
    const interactionBoost = Math.min(lead.interaction_count * 5, 25);
    score += interactionBoost;

    // Recent activity boost
    if (lead.last_interaction) {
      const daysSinceLastInteraction =
        (Date.now() - new Date(lead.last_interaction).getTime()) /
        (1000 * 60 * 60 * 24);
      if (daysSinceLastInteraction <= 3) score += 15;
      else if (daysSinceLastInteraction <= 7) score += 5;
      else if (daysSinceLastInteraction > 14) score -= 10;
    }

    // Human review flag (likely means high priority)
    if (lead.requires_human_review) score += 20;

    // State progression bonus
    if (
      lead.state === "qualified_for_meeting" ||
      lead.state === "meeting_set"
    ) {
      score += 25;
    }

    // Temperature classification
    if (score >= 85) return "burning";
    if (score >= 65) return "hot";
    if (score >= 40) return "warm";
    return "cold";
  }

  /**
   * Calculate First Message/Interaction Metrics
   * Based on first_interaction and interaction_count
   */
  private async calculateFirstMessageMetrics(projectId?: string) {
    let query = supabase
      .from("leads")
      .select(
        "id, first_interaction, interaction_count, created_at, current_project_id",
      );

    // Apply project filter if provided
    if (projectId) {
      query = query.eq("current_project_id", projectId);
    }

    const { data: leads, error } = await query;
    if (error) {
      console.error("ERROR First Message Metrics Error:", error);
      return {
        percentage: 0,
        total_leads: 0,
        contacted_count: 0,
        trend_weekly: 0,
      };
    }

    // Return zeros if no leads exist (real data, not mock)
    if (!leads || leads.length === 0) {
      return {
        percentage: 0,
        total_leads: 0,
        contacted_count: 0,
        trend_weekly: 0,
      };
    }

    // Use ALL leads for the project, not just last 30 days
    const currentLeads = leads || [];

    const totalLeads = currentLeads.length;
    const contactedLeads = currentLeads.filter(
      (lead) => lead.first_interaction && lead.interaction_count > 0,
    ).length;

    const firstMessageRate =
      totalLeads > 0 ? Math.round((contactedLeads / totalLeads) * 100) : 0;

    // Weekly trend calculation
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekLeads = currentLeads.filter(
      (lead) => new Date(lead.created_at) >= lastWeek,
    );

    const previousWeek = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const previousWeekLeads = currentLeads.filter((lead) => {
      const leadDate = new Date(lead.created_at);
      return leadDate >= previousWeek && leadDate < lastWeek;
    });

    const lastWeekRate =
      lastWeekLeads.length > 0
        ? (lastWeekLeads.filter((l) => l.first_interaction).length /
            lastWeekLeads.length) *
          100
        : 0;

    const previousWeekRate =
      previousWeekLeads.length > 0
        ? (previousWeekLeads.filter((l) => l.first_interaction).length /
            previousWeekLeads.length) *
          100
        : 0;

    // Use proper percentage change calculation instead of simple subtraction
    const trendWeekly = previousWeekRate > 0 
      ? ((lastWeekRate - previousWeekRate) / previousWeekRate) * 100
      : lastWeekRate > 0 ? Math.min(lastWeekRate * 10, 999) : 0;

    return {
      percentage: firstMessageRate,
      total_leads: totalLeads,
      contacted_count: contactedLeads,
      trend_weekly: Math.round(trendWeekly * 10) / 10,
    };
  }

  /**
   * Calculate Meeting Pipeline Metrics
   * Based on requires_human_review flag and high-status leads
   */
  private async calculateMeetingMetrics(projectId?: string) {
    let query = supabase
      .from("leads")
      .select(
        "id, requires_human_review, status, state, created_at, updated_at, current_project_id",
      );

    // Apply project filter if provided
    if (projectId) {
      query = query.eq("current_project_id", projectId);
    }

    const { data: leads, error } = await query;
    if (error) {
      console.error("ERROR Meeting Metrics Error:", error);
      return {
        total_meetings: 0,
        meetings_this_week: 0,
        conversion_rate: 0,
        trend_weekly: 0,
      };
    }

    // Return zeros if no leads exist (real data, not mock)
    if (!leads || leads.length === 0) {
      return {
        total_meetings: 0,
        meetings_this_week: 0,
        conversion_rate: 0,
        trend_weekly: 0,
      };
    }

    // Use ALL leads for the project, not just last 30 days
    const currentLeads = leads || [];

    const totalMeetings = currentLeads.filter(isMeetingBooked).length;

    // This week's meetings
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekMeetings = currentLeads.filter((lead) => {
      const isRecentMeeting = isMeetingBooked(lead);
      const isThisWeek = new Date(lead.updated_at) >= oneWeekAgo;
      return isRecentMeeting && isThisWeek;
    }).length;

    // Conversion rate (meetings / total leads)
    const conversionRate = calcConversionRate(totalMeetings, currentLeads.length);

    // Weekly trend
    const previousWeek = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const previousWeekMeetings = currentLeads.filter((lead) => {
      const isRecentMeeting = isMeetingBooked(lead);
      const isPreviousWeek =
        new Date(lead.updated_at) >= previousWeek &&
        new Date(lead.updated_at) < oneWeekAgo;
      return isRecentMeeting && isPreviousWeek;
    }).length;

    const trendWeekly = thisWeekMeetings - previousWeekMeetings;

    return {
      total_meetings: totalMeetings,
      meetings_this_week: thisWeekMeetings,
      conversion_rate: conversionRate,
      trend_weekly: trendWeekly,
    };
  }

  /**
   * Get historical metrics for trend analysis
   */
  async getHistoricalMetrics(days: number = 30, projectId?: string) {
    return ServiceErrorHandler.handleAsyncError(
      async () => {
        // Get lead status history for trend analysis
        let historyQuery = supabase
          .from("lead_status_history")
          .select("*")
          .gte(
            "changed_at",
            new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
          )
          .order("changed_at", { ascending: false });

        const { data: statusHistory, error } = await historyQuery;
        if (error) throw error;

        // Process historical data for trends
        const dailyMetrics = this.processDailyMetrics(
          statusHistory || [],
          days,
        );

        return {
          daily_metrics: dailyMetrics,
          period_days: days,
          calculated_at: new Date().toISOString(),
        };
      },
      "DashboardAnalyticsService",
      "getHistoricalMetrics",
    ).then((result) => result.data);
  }

  /**
   * Process daily metrics from status history
   */
  private processDailyMetrics(statusHistory: any[], days: number) {
    const dailyData: Record<string, any> = {};

    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateString = date.toISOString().split("T")[0];

      const dayHistory = statusHistory.filter((h) =>
        h.changed_at.startsWith(dateString),
      );

      dailyData[dateString] = {
        bant_changes: dayHistory.filter((h) => h.status_type === "bant_status")
          .length,
        status_progressions: dayHistory.filter(
          (h) => h.status_type === "status",
        ).length,
        total_changes: dayHistory.length,
      };
    }

    return dailyData;
  }
}

export const dashboardAnalyticsService = new DashboardAnalyticsService();
