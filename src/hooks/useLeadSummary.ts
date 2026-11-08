import { useEffect, useState } from "react";
import { dashboardAnalyticsService, type LeadSummary } from "@/services/dashboardAnalyticsService";

type SummaryLead = Parameters<typeof dashboardAnalyticsService.getLeadSummary>[0][number];

/** Leads, qualified, meetings and conversion for the selected project, from one source. */
export function useLeadSummary(leads: SummaryLead[]): LeadSummary | null {
  const [summary, setSummary] = useState<LeadSummary | null>(null);
  useEffect(() => {
    let active = true;
    dashboardAnalyticsService.getLeadSummary(leads).then((next) => active && setSummary(next));
    return () => {
      active = false;
    };
  }, [leads]);
  return summary;
}
