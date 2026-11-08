import { describe, it, expect } from "vitest";
import {
  calcConversionRate,
  conversionRateForLeads,
  isMeetingBooked,
} from "../conversionRate";

describe("conversionRate", () => {
  it("is zero for no leads", () => {
    expect(calcConversionRate(0, 0)).toBe(0);
    expect(conversionRateForLeads([])).toBe(0);
  });

  it("matches the dashboard sample data (34 meetings of 247 leads)", () => {
    expect(calcConversionRate(34, 247)).toBe(14);
  });

  it("counts meeting statuses and states, not CLOSED_WON", () => {
    expect(isMeetingBooked({ status: "meeting-scheduled" })).toBe(true);
    expect(isMeetingBooked({ state: "meeting_set" })).toBe(true);
    expect(isMeetingBooked({ status: "CLOSED_WON" })).toBe(false);
    expect(
      conversionRateForLeads([
        { status: "meeting-scheduled" },
        { status: "new" },
        { state: "qualified_for_meeting" },
        { status: "new" },
      ]),
    ).toBe(50);
  });
});
