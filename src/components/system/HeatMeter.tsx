import { cn } from "@/lib/utils";

export type Heat = "cold" | "cool" | "warm" | "hot";

const ORDER: Heat[] = ["cold", "cool", "warm", "hot"];
const LABEL: Record<Heat, string> = { cold: "Cold", cool: "Cool", warm: "Warm", hot: "Hot" };

/** Lead temperature: four cells lit up to the lead's heat, always with its word. */
export function HeatMeter({ heat, label, className }: { heat: Heat; label?: string; className?: string }) {
  const level = ORDER.indexOf(heat);
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex items-end gap-[3px]" aria-hidden="true">
        {ORDER.map((h, i) => (
          <span
            key={h}
            className="w-[5px] rounded-[1.5px]"
            style={{
              height: 6 + i * 3,
              background: i <= level ? `var(--heat-${heat})` : "hsl(var(--border))",
            }}
          />
        ))}
      </span>
      <span className="text-xs font-medium text-foreground">{label ?? LABEL[heat]}</span>
    </span>
  );
}

export default HeatMeter;
