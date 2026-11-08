import React from "react";
import { NavLink } from "react-router";
import { BarChart3, Users, MessageSquare, Calendar, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/dashboard", label: "Home", icon: BarChart3 },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/messages", label: "Chats", icon: MessageSquare },
  { to: "/calendar", label: "Calendar", icon: Calendar },
];

interface BottomNavProps {
  onMore: () => void;
}

/** Phone navigation: the four daily areas and a More button that opens the full drawer. */
export const BottomNav: React.FC<BottomNavProps> = ({ onMore }) => (
  <nav
    aria-label="Primary"
    data-testid="bottom-nav"
    className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
  >
    {ITEMS.map(({ to, label, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) =>
          cn(
            "relative flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
            isActive ? "text-primary" : "text-muted-foreground",
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && <span aria-hidden="true" className="absolute inset-x-5 top-0 h-0.5 rounded-b bg-primary" />}
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            {label}
          </>
        )}
      </NavLink>
    ))}
    <button
      type="button"
      onClick={onMore}
      className="flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      <Menu className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
      More
    </button>
  </nav>
);
