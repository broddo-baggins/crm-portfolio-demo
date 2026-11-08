import React from "react";
import { cn } from "@/lib/utils";

// Muted, theme-safe pairs (bg, text). Each holds 4.5:1 in light and dark via the token scales.
const TONES = [
  "bg-steel-100 text-steel-800 dark:bg-steel-900 dark:text-steel-100",
  "bg-moss-100 text-moss-800 dark:bg-moss-900 dark:text-moss-100",
  "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  "bg-ember-100 text-ember-800 dark:bg-ember-900 dark:text-ember-100",
  "bg-ink-100 text-ink-800 dark:bg-ink-800 dark:text-ink-100",
];

const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

interface PersonAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** Initials on a stable tint per person. Decorative: the name is always printed beside it. */
export const PersonAvatar: React.FC<PersonAvatarProps> = ({ name, size = "md", className }) => {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-medium",
        size === "sm" && "h-6 w-6 text-[10px]",
        size === "md" && "h-8 w-8 text-xs",
        size === "lg" && "h-11 w-11 text-sm",
        TONES[hash(name) % TONES.length],
        className,
      )}
    >
      {initials || "?"}
    </span>
  );
};
