/** Reads BANT and heat from whichever shape a lead arrives in (service rows or sample records). */
type AnyLead = Record<string, any>;

const UNKNOWN = /^(unknown|n\/a|none|-)/i;
const DETAIL_KEYS = ["budget", "authority", "need", "timeline"] as const;

export const BANT_LABELS = ["Budget", "Authority", "Need", "Timeline"] as const;

export function bantFlags(lead: AnyLead): boolean[] {
  const flagged = DETAIL_KEYS.map((k) => lead[`bant_${k}`] === true);
  if (flagged.some(Boolean)) return flagged;
  if (lead.bant_status === "fully_qualified") return [true, true, true, true];
  const detail = DETAIL_KEYS.map((k) => typeof lead[k] === "string" && lead[k].length > 0 && !UNKNOWN.test(lead[k]));
  if (detail.some(Boolean)) return detail;
  return DETAIL_KEYS.map((k) => lead.bant_status === `${k}_qualified`);
}

export function bantDetail(lead: AnyLead): (string | null)[] {
  return DETAIL_KEYS.map((k) => (typeof lead[k] === "string" && lead[k] ? lead[k] : null));
}

export function heatWord(temperature: unknown): string {
  if (typeof temperature === "number") {
    return temperature >= 75 ? "hot" : temperature >= 50 ? "warm" : temperature >= 25 ? "cool" : "cold";
  }
  const s = String(temperature ?? "").toLowerCase();
  if (s.includes("burn")) return "burning";
  if (s.includes("hot")) return "hot";
  if (s.includes("warm")) return "warm";
  if (s.includes("cool")) return "cool";
  return "cold";
}

export function leadFullName(lead: AnyLead): string {
  return (lead.name || `${lead.first_name ?? ""} ${lead.last_name ?? ""}`).trim() || "Unnamed lead";
}

export function relativeDay(iso?: string): string {
  if (!iso) return "";
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days > 1 && days < 14) return `${days} days ago`;
  if (days < 0 && days > -14) return days === -1 ? "Tomorrow" : `In ${-days} days`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
