import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLockup } from "@/components/brand/BrandMark";

/** Header and footer for public content pages (legal, help, data requests). */
export function PublicPageShell({
  children,
  dir,
  className,
}: {
  children: React.ReactNode;
  dir?: "rtl" | "ltr";
  className?: string;
}) {
  const isRTL = dir === "rtl";
  return (
    <div className="flex min-h-screen flex-col bg-background" dir={dir}>
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-4 sm:px-8">
          <Link
            to="/"
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <BrandLockup />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-subtle hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            {isRTL ? "חזרה לבית" : "Back to Home"}
          </Link>
        </div>
      </header>
      <main className={cn("flex-1", className)}>{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-6 text-[13px] text-muted-foreground sm:px-8">
          <span>© {new Date().getFullYear()} CRM Demo · Built by Amit Yogev</span>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {[
              ["/privacy-policy", "Privacy Policy"],
              ["/terms-of-service", "Terms of Service"],
              ["/cookies", "Cookie Policy"],
              ["/accessibility-declaration", "Accessibility"],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </div>
  );
}

interface LegalSection {
  id: string;
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

/** A legal document: sticky contents list on the start side, numbered sections as prose. */
export function LegalDocument({
  title,
  updated,
  sections,
  closing,
  dir,
}: {
  title: string;
  updated?: string;
  sections: LegalSection[];
  closing?: React.ReactNode;
  dir?: "rtl" | "ltr";
}) {
  return (
    <PublicPageShell dir={dir}>
      <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-8 md:py-16">
        <h1 className="text-[32px] font-semibold leading-[38px] tracking-[-0.025em] text-foreground md:text-[40px] md:leading-[46px]">
          {title}
        </h1>
        {updated && <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>}

        <div className="mt-10 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          <nav aria-label="Contents" className="hidden lg:block">
            <ol className="sticky top-8 space-y-1 border-s border-border text-sm">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="-ms-px block border-s border-transparent py-1 ps-4 text-subtle hover:border-ink-400 hover:text-foreground"
                  >
                    <span className="tabular-nums text-muted-foreground">{i + 1}.</span> {s.title.replace(/^\W+/u, "")}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="max-w-[72ch]">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-8 border-t border-border py-8 first:border-t-0 first:pt-0">
                <h2 className="flex items-baseline gap-3 text-lg font-semibold text-foreground">
                  <span className="text-sm font-medium tabular-nums text-muted-foreground">{i + 1}.</span>
                  {s.title.replace(/^\W+/u, "")}
                </h2>
                <div className="legal-prose mt-4">{s.content}</div>
              </section>
            ))}
            {closing && <div className="mt-4 border-t border-border pt-8 text-sm text-muted-foreground">{closing}</div>}
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
