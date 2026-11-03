import { cn } from "@/lib/utils";

/**
 * The CRM Demo mark: three rising bars on the heat ramp (cold, warm, hot).
 * A lead getting warmer, which is the whole product.
 */
export function BrandMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-6 w-6 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <rect x="3" y="13" width="4.5" height="8" rx="1.25" fill="var(--heat-cold)" />
      <rect x="9.75" y="8" width="4.5" height="13" rx="1.25" fill="var(--heat-warm)" />
      <rect x="16.5" y="3" width="4.5" height="18" rx="1.25" fill="var(--heat-hot)" />
    </svg>
  );
}

/** The mark with the product name, for headers. */
export function BrandLockup({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <BrandMark />
      <span
        className={cn(
          "text-[15px] font-semibold tracking-[-0.01em]",
          inverse ? "text-white" : "text-foreground",
        )}
      >
        CRM Demo
      </span>
    </span>
  );
}

export default BrandMark;
