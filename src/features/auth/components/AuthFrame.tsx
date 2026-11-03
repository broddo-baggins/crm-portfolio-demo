import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BrandLockup } from "@/components/brand/BrandMark";

/** The page around a stand-alone auth form: brand, a way back, the form in a narrow column. */
export function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center justify-between px-4 sm:px-8">
        <Link to="/" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <BrandLockup />
        </Link>
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-subtle hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          Back to sign in
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16 pt-10 sm:items-center sm:pt-0">
        <div className="rise w-full max-w-[420px] [&_.text-center]:text-start">{children}</div>
      </main>
    </div>
  );
}

export default AuthFrame;
