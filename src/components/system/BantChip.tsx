import React from "react";
import { cn } from "@/lib/utils";

const LETTERS = ["B", "A", "N", "T"] as const;
const WORDS = ["Budget", "Authority", "Need", "Timeline"] as const;

interface BantChipProps {
  /** Number of the four criteria met, 0 to 4 */
  score: number;
  /** Which of B, A, N, T are met, if known; otherwise the first `score` are filled */
  met?: boolean[];
  className?: string;
}

/** Four small cells, one per BANT letter, plus the score. Announced as text for screen readers. */
export const BantChip: React.FC<BantChipProps> = ({ score, met, className }) => {
  const flags = met ?? LETTERS.map((_, i) => i < score);
  const n = flags.filter(Boolean).length;
  const label = `BANT ${n} of 4: ${WORDS.filter((_, i) => flags[i]).join(", ") || "none met"}`;
  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-1.5 py-0.5",
        className,
      )}
    >
      <span className="flex gap-0.5" aria-hidden="true">
        {LETTERS.map((l, i) => (
          <span
            key={l}
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded-[4px] text-[10px] font-semibold leading-none",
              flags[i]
                ? "bg-ember-500 text-white"
                : "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300",
            )}
          >
            {l}
          </span>
        ))}
      </span>
      <span className="num text-xs font-medium text-secondary-foreground" aria-hidden="true">
        {n}/4
      </span>
    </span>
  );
};
