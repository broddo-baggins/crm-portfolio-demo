import React from "react";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import { useTranslation } from "react-i18next";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/lib/utils";

const Notifications: React.FC = () => {
  const { t } = useTranslation("pages");
  const { isRTL } = useLang();

  return (
    <div
      className={cn("w-full", isRTL && "rtl")}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {t("notifications.title", "Notifications")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t(
            "notifications.description",
            "View and manage all your notifications",
          )}
        </p>
      </div>

      <NotificationsList />
    </div>
  );
};

export default Notifications;
