import { describe, expect, it } from "vitest";
import { getHeatLevelFromTemperature, getHeatScaleLevel, getLeadName } from "@/utils/leadUtils";
import { mockDataService } from "@/services/mockDataService";

describe("getHeatLevelFromTemperature", () => {
  it.each([
    [95, "burning"],
    [60, "hot"],
    [45, "warm"],
    [0, "cold"],
  ] as const)("maps score %d to %s", (score, level) => {
    expect(getHeatLevelFromTemperature(score)).toBe(level);
  });

  it("accepts the labels demo data stores instead of scores", () => {
    expect(getHeatLevelFromTemperature("hot")).toBe("hot");
    expect(getHeatLevelFromTemperature("WARM")).toBe("warm");
    expect(getHeatLevelFromTemperature("75")).toBe("hot");
  });

});

describe("getHeatScaleLevel", () => {
  it.each([
    [5, "FROZEN"],
    [30, "COLD"],
    [70, "HOT"],
    [99, "WHITE_HOT"],
    ["hot", "HOT"],
    ["Burning", "BURNING"],
    ["ice cold", "ICE_COLD"],
    ["72", "HOT"],
    [null, "FROZEN"],
  ] as const)("maps %j to %s", (temperature, level) => {
    expect(getHeatScaleLevel(temperature)).toBe(level);
  });

  it("finds hot demo leads (the /leads 'Hot Leads' card showed 0)", () => {
    const hot = mockDataService
      .getMockLeads()
      .filter((lead) => ["HOT", "BURNING", "WHITE_HOT"].includes(getHeatScaleLevel(lead.temperature)));
    expect(hot.length).toBeGreaterThan(0);
  });
});

describe("getLeadName", () => {
  it("builds the name the /leads table shows from first and last name", () => {
    const [first] = mockDataService.getMockLeads();
    expect(getLeadName(first as never)).toBe("Sarah Johnson");
  });
});
