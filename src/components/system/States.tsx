import * as React from "react";
import { Link } from "react-router";
import { AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BrandLockup } from "@/components/brand/BrandMark";

/* Empty, loading and error states, and the full-page status screen.
   One sentence, one way forward; see DESIGN.md, "Patterns". */

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-lg border border-dashed border-line-strong bg-surface px-6 py-8",
        className,
      )}
      data-testid="empty-state"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-[15px] font-semibold text-foreground">{title}</p>
        {description && <p className="max-w-[52ch] text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = "This didn't load",
  description = "Nothing was lost. Try again, or come back in a minute.",
  onRetry,
  retryLabel = "Try again",
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn("flex items-start gap-3 rounded-lg border border-border bg-surface px-5 py-4", className)}
      data-testid="error-state"
    >
      <AlertCircle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-danger" aria-hidden="true" />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
            <RefreshCw aria-hidden="true" />
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

/** Skeleton rows shaped like a list or table: a lead line and a meta line per row. */
export function LoadingState({ rows = 5, label = "Loading", className }: { rows?: number; label?: string; className?: string }) {
  return (
    <div className={cn("space-y-3", className)} role="status" aria-live="polite" data-testid="loading-state">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
          <div className="skeleton h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 rounded" style={{ width: `${52 - (i % 3) * 9}%` }} />
            <div className="skeleton h-2.5 w-1/4 rounded" />
          </div>
          <div className="skeleton hidden h-6 w-16 rounded-full sm:block" />
        </div>
      ))}
    </div>
  );
}

interface StatusScreenProps {
  code?: string;
  icon?: React.ElementType;
  title: string;
  message: string;
  detail?: React.ReactNode;
  actions?: React.ReactNode;
  help?: React.ReactNode;
  dir?: "rtl" | "ltr";
  testId?: string;
  children?: React.ReactNode;
}

/** The full-page layout for 4xx/5xx, maintenance and coming-soon pages. */
export function StatusScreen({ code, icon: Icon, title, message, detail, actions, help, dir, testId, children }: StatusScreenProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background" dir={dir} data-testid={testId}>
      <header className="flex h-[60px] items-center px-4 sm:px-8">
        <Link to="/" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <BrandLockup />
        </Link>
      </header>
      <main className="flex flex-1 items-center px-4 pb-16 sm:px-8">
        <div className="mx-auto grid w-full max-w-[1100px] gap-12 md:grid-cols-[minmax(0,560px)_1fr] md:items-center">
          <div>
            <div className="mb-6 flex items-center gap-3">
              {Icon && (
                <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-foreground">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              )}
              {code && (
                <span className="text-sm font-medium tabular-nums text-muted-foreground">{code}</span>
              )}
            </div>
            <h1 className="text-[32px] font-semibold leading-[38px] tracking-[-0.025em] text-foreground sm:text-[40px] sm:leading-[46px]">
              {title}
            </h1>
            <p className="mt-4 max-w-[52ch] text-[17px] leading-7 text-subtle">{message}</p>
            {detail && <div className="mt-6 max-w-[52ch]">{detail}</div>}
            {children}
            {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
            {help && <p className="mt-8 max-w-[52ch] text-sm text-muted-foreground">{help}</p>}
          </div>
          <ColdTrace className="hidden md:block" />
        </div>
      </main>
    </div>
  );
}

/** A quiet drawing for status pages: the heat bars, gone cold. */
function ColdTrace({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 240" className={cn("w-full max-w-[360px] justify-self-end", className)} aria-hidden="true">
      <g fill="none" stroke="hsl(var(--border))" strokeWidth="1">
        {[40, 80, 120, 160, 200].map((y) => (
          <line key={y} x1="0" x2="320" y1={y} y2={y} />
        ))}
      </g>
      <rect x="40" y="140" width="56" height="80" rx="8" fill="var(--steel-100)" />
      <rect x="132" y="100" width="56" height="120" rx="8" fill="var(--steel-200)" />
      <rect x="224" y="60" width="56" height="160" rx="8" fill="var(--steel-300)" />
      <path d="M68 132 L160 92 L252 52" fill="none" stroke="var(--steel-500)" strokeWidth="2" strokeDasharray="4 6" strokeLinecap="round" />
      <circle cx="252" cy="52" r="5" fill="var(--surface)" stroke="var(--steel-500)" strokeWidth="2" />
    </svg>
  );
}
