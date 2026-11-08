// One definition of "conversion rate" for the dashboard, Reports and sidebar:
// leads with a booked meeting divided by all leads, as a whole percent.

const MEETING_STATUSES = [
  "demo scheduled",
  "proposal sent",
  "negotiation",
  "meeting-scheduled",
  "meeting_scheduled",
];
const MEETING_STATES = ["qualified_for_meeting", "meeting_set"];

interface MeetingLead {
  status?: string | null;
  state?: string | null;
  requires_human_review?: boolean | null;
}

export function isMeetingBooked(lead: MeetingLead): boolean {
  return (
    Boolean(lead.requires_human_review) ||
    MEETING_STATUSES.includes((lead.status ?? "").toLowerCase()) ||
    MEETING_STATES.includes(lead.state ?? "")
  );
}

export function calcConversionRate(meetings: number, totalLeads: number): number {
  return totalLeads > 0 ? Math.round((meetings / totalLeads) * 100) : 0;
}

export function conversionRateForLeads(leads: MeetingLead[]): number {
  return calcConversionRate(leads.filter(isMeetingBooked).length, leads.length);
}
