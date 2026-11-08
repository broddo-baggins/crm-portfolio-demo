import React, { Suspense, useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Footer from "./Footer";
import { CommandPalette } from "./CommandPalette";
import { BottomNav } from "./BottomNav";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NAV_SHORTCUTS } from "@/utils/navGroups";
import CookieConsent from "../common/CookieConsent";
import StagingBanner from "../common/StagingBanner";
import { useAuth } from "@/context/ClientAuthContext";
import { toast } from "sonner";
import { RTLProvider } from "@/contexts/RTLContext";
import { useLang } from "@/hooks/useLang";
import { PageSkeleton } from "./PageSkeleton";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";

const LayoutContent = () => {
  const { user } = useAuth();
  const { isRTL } = useLang();
  // const location = useLocation(); // TODO: Use for page-specific logic if needed
  const [pendingUsers, setPendingUsers] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("crm-sidebar-collapsed") === "1";
    } catch {
      return false;
    }
  });
  const toggleCollapsed = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem("crm-sidebar-collapsed", c ? "0" : "1");
      } catch {
        /* storage blocked: the choice lasts for this visit */
      }
      return !c;
    });

  // Cmd/Ctrl K and "/" open the palette; "G" then a letter jumps to a page.
  useEffect(() => {
    let armed = 0;
    const byLetter = Object.fromEntries(Object.entries(NAV_SHORTCUTS).map(([path, k]) => [k, path]));
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "/") {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }
      const k = e.key.toLowerCase();
      if (Date.now() < armed && byLetter[k]) {
        armed = 0;
        navigate(byLetter[k]);
      } else if (k === "g") {
        armed = Date.now() + 1200;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  // Close the mobile navigation drawer after navigating
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);
  // Staging environment removed - use regular authentication
  // const { isRTL } = useLang(); // TODO: Use for RTL layout if needed

  // Check for pending users if the current user is an admin
  useEffect(() => {
    const checkPendingUsers = async () => {
      if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") {
        try {
          // Demo: a fixed count in the bell. Visitors of the demo get no admin toast on load.
          setTimeout(() => setPendingUsers(2), 1500);

          // In production this would be:
          // const response = await fetch('/api/auth/pending-users', {
          //   headers: { Authorization: `Bearer ${accessToken}` }
          // });
          // const data = await response.json();
          // setPendingUsers(data.pendingUsers.length);
        } catch (error) {
          console.error("Failed to fetch pending users:", error);
        }
      }
    };

    checkPendingUsers();
  }, [user?.role]);

  return (
    <div className="flex min-h-screen w-full bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-float"
      >
        Skip to content
      </a>
      {/* Desktop: the sidebar stands beside the page. Below 1024 px it is a drawer. */}
      <aside className="sticky top-0 hidden h-screen shrink-0 lg:block">
        <Sidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
      </aside>
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent
          side={isRTL ? "right" : "left"}
          className="w-[280px] max-w-[85vw] p-0 sm:max-w-[280px]"
          data-testid="navigation-drawer"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Main navigation</SheetDescription>
          <Sidebar onNavigate={() => setNavOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar pendingUserCount={pendingUsers} onOpenNav={() => setNavOpen(true)} onOpenSearch={() => setPaletteOpen(true)} />
        <main
          id="main-content"
          className="flex-1 overflow-x-hidden overflow-y-auto bg-background px-4 py-5 sm:px-6 md:py-6 lg:px-8"
        >
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
        <Footer />
      </div>
      <BottomNav onMore={() => setNavOpen(true)} />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <CookieConsent />
    </div>
  );
};

const Layout = () => {
  return (
    <RTLProvider>
      <TooltipProvider delayDuration={200}>
        <LayoutContent />
      </TooltipProvider>
    </RTLProvider>
  );
};

export default Layout;
