
import { cva } from "class-variance-authority";
import { LeadTemperature } from "@/config/leadStates";

/**
 * Badge variants using class-variance-authority
 * Used for consistent styling of badges across the application
 */
export const badgeVariants = cva(
  // Thermal pill: caption type (12/500), tinted 50-100 ground with 700-800 text (6:1 and up).
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium leading-4 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-ink-800 text-ink-50 dark:bg-ink-100 dark:text-ink-900",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-brick-50 text-brick-700 dark:bg-brick-950 dark:text-brick-300",
        outline: "border-input text-foreground",
        
        // Lead status variants
        "status-new": "border-gray-200 bg-gray-100 text-gray-800",
        "status-pre-qualified": "border-gray-200 bg-gray-100 text-gray-800",
        "status-hook": "border-blue-200 bg-blue-100 text-blue-800",
        "status-value-proposition": "border-blue-200 bg-blue-100 text-blue-800",
        "status-questions-asked": "border-blue-200 bg-blue-100 text-blue-800",
        "status-engaged": "border-orange-200 bg-orange-100 text-orange-800",
        "status-qualified": "border-orange-200 bg-orange-100 text-orange-800",
        "status-clarifying": "border-orange-200 bg-orange-100 text-orange-800",
        "status-on-hold": "border-gray-200 bg-gray-100 text-gray-800",
        "status-follow-up": "border-blue-200 bg-blue-100 text-blue-800",
        "status-booked": "border-purple-200 bg-purple-100 text-purple-800",
        "status-dead": "border-red-200 bg-red-100 text-red-800",
        
        // Lead temperature variants
        // The heat ramp (DESIGN.md): cold steel, cool pale steel, warm amber, hot ember
        "temperature-cold": "border-steel-200 bg-steel-50 text-steel-700",
        "temperature-cool": "border-steel-100 bg-steel-50 text-steel-600",
        "temperature-warm": "border-amber-200 bg-amber-50 text-amber-700",
        "temperature-hot": "border-ember-200 bg-ember-50 text-ember-700",
        "temperature-scheduled": "border-moss-200 bg-moss-50 text-moss-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * Status Badge variants
 * Used specifically for lead status badges with consistent colors
 */
export const statusBadgeVariants = cva(
  "inline-flex items-center border px-2 py-0.5 text-xs font-medium leading-4 transition-colors focus:outline-none",
  {
    variants: {
      status: {
        // Map to status values in leadStates.ts
        0: "rounded-full border-gray-200 bg-gray-100 text-gray-800", // New
        1: "rounded-full border-gray-200 bg-gray-100 text-gray-800", // Pre-qualified
        2: "rounded-full border-blue-200 bg-blue-100 text-blue-800", // Hook
        3: "rounded-full border-blue-200 bg-blue-100 text-blue-800", // Value Prop
        4: "rounded-full border-blue-200 bg-blue-100 text-blue-800", // Questions Asked
        5: "rounded-full border-orange-200 bg-orange-100 text-orange-800", // Engaged
        6: "rounded-full border-orange-200 bg-orange-100 text-orange-800", // Qualified
        7: "rounded-full border-orange-200 bg-orange-100 text-orange-800", // Clarifying
        8: "rounded-full border-gray-200 bg-gray-100 text-gray-800", // On Hold
        9: "rounded-full border-blue-200 bg-blue-100 text-blue-800", // Follow Up
        10: "rounded-full border-purple-200 bg-purple-100 text-purple-800", // Booked
        11: "rounded-full border-red-200 bg-red-100 text-red-800", // Dead
      },
    },
    defaultVariants: {
      status: 0,
    },
  }
);

/**
 * Temperature Badge variants
 * Used specifically for lead temperature indicators
 */
export const temperatureBadgeVariants = cva(
  "inline-flex items-center border px-2 py-0.5 text-xs font-medium leading-4 transition-colors focus:outline-none",
  {
    variants: {
      temperature: {
        "Cold": "rounded-full border-steel-200 bg-steel-50 text-steel-700",
        "Cool": "rounded-full border-steel-100 bg-steel-50 text-steel-600",
        "Warm": "rounded-full border-amber-200 bg-amber-50 text-amber-700",
        "Hot": "rounded-full border-ember-200 bg-ember-50 text-ember-700",
        "Scheduled": "rounded-full border-moss-200 bg-moss-50 text-moss-700",
      },
    },
    defaultVariants: {
      temperature: "Cold" as LeadTemperature,
    },
  }
);
