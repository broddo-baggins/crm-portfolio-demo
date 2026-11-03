import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Footer from "./Footer";
import CookieConsent from "../common/CookieConsent";
import StagingBanner from "../common/StagingBanner";
import { useAuth } from "@/context/ClientAuthContext";
import { toast } from "sonner";
import { RTLProvider } from "@/contexts/RTLContext";
import { useLang } from "@/hooks/useLang";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";

const LayoutContent = () => {
  const { user } = useAuth();
  const { isRTL } = useLang();
  // const location = useLocation(); // TODO: Use for page-specific logic if needed
  const [pendingUsers, setPendingUsers] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const { pathname } = useLocation();

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
          // In a real implementation, this would make an API call to get pending users
          // For demo, we'll simulate this with a timeout and random number
          setTimeout(() => {
            // Demo: Random number between 0 and 5
            const randomPending = Math.floor(Math.random() * 6);
            setPendingUsers(randomPending);

            if (randomPending > 0) {
              toast.info(
                `You have ${randomPending} pending user registration(s) to review.`,
              );
            }
          }, 3000);

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
        <Sidebar />
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
        <TopBar pendingUserCount={pendingUsers} onOpenNav={() => setNavOpen(true)} />
        <main
          id="main-content"
          className="flex-1 overflow-x-hidden overflow-y-auto bg-background px-4 py-5 sm:px-6 md:py-6 lg:px-8"
        >
          <Outlet />
        </main>
        <Footer />
      </div>
      <CookieConsent />
    </div>
  );
};

const Layout = () => {
  return (
    <RTLProvider>
      <LayoutContent />
    </RTLProvider>
  );
};

export default Layout;
