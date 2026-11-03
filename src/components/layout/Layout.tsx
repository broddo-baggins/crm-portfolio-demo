import React, { useState, useEffect } from "react";
// import { useLocation } from 'react-router'; // TODO: Use for page-specific logic if needed
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Footer from "./Footer";
import CookieConsent from "../common/CookieConsent";
import StagingBanner from "../common/StagingBanner";
import { useAuth } from "@/context/ClientAuthContext";
import { toast } from "sonner";
import { RTLProvider } from "@/contexts/RTLContext";
// import { useLang } from '@/hooks/useLang'; // TODO: Use for RTL layout if needed

const LayoutContent = () => {
  const { user } = useAuth();
  // const location = useLocation(); // TODO: Use for page-specific logic if needed
  const [pendingUsers, setPendingUsers] = useState(0);
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
    <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar pendingUserCount={pendingUsers} />
                        <main className="flex-1 p-3 sm:p-4 md:p-6 bg-background overflow-x-hidden overflow-y-auto">
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
