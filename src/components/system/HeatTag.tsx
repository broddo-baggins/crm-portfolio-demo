import React from "react";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  hot: "bg-ember-50 text-ember-700 border-ember-200 dark:bg-ember-950 dark:text-ember-200 dark:border-ember-800",
  burning: "bg-ember-50 text-ember-700 border-ember-200 dark:bg-ember-950 dark:text-ember-200 dark:border-ember-800",
  warm: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
  cool: "bg-steel-50 text-steel-700 border-steel-200 dark:bg-steel-950 dark:text-steel-200 dark:border-steel-800",
  cold: "bg-steel-50 text-steel-800 border-steel-200 dark:bg-steel-950 dark:text-steel-200 dark:border-steel-800",
};

/** Lead temperature as a word on the heat ramp. Always the word, never colour alone. */
export const HeatTag: React.FC<{ temperature?: string | null; className?: string }> = ({ temperature, className }) => {
  const key = (temperature || "cold").toLowerCase();
  const label = key.replace(/^\w/, (c) => c.toUpperCase());
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium leading-4",
        STYLES[key] ?? STYLES.cold,
        className,
      )}
    >
      {label}
    </span>
  );
};
